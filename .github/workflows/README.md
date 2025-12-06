# GitHub Actions - Deployment to S3

Este workflow automatiza el deployment de la aplicación Next.js a AWS S3.

## 📋 Prerequisitos

1. **Bucket de S3 configurado** para hosting de sitio web estático
2. **Usuario IAM** con permisos para S3 (y opcionalmente CloudFront)
3. **GitHub Secrets** configurados en el repositorio

## 🔐 Secrets Requeridos

Configura los siguientes secrets en tu repositorio de GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

### AWS Credentials (Obligatorios)
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
```

### Environment Variables (Obligatorios)
```
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_USER_POOL_ID=tu-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=tu-client-id
NEXT_PUBLIC_COGNITO_DOMAIN=tu-cognito-domain
NEXT_PUBLIC_API_URL=https://tu-api-gateway.execute-api.us-east-2.amazonaws.com/dev
```

### CloudFront (Opcional)
```
CLOUDFRONT_DISTRIBUTION_ID=tu-distribution-id
```

## 🪣 Configuración del Bucket S3

### 1. Crear Bucket
```bash
aws s3 mb s3://tu-app-frontend --region us-east-2
```

### 2. Configurar como Website Estático
```bash
aws s3 website s3://tu-app-frontend \
  --index-document index.html \
  --error-document 404.html
```

### 3. Configurar Política del Bucket
Crea un archivo `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::tu-app-frontend/*"
    }
  ]
}
```

Aplica la política:
```bash
aws s3api put-bucket-policy \
  --bucket tu-app-frontend \
  --policy file://bucket-policy.json
```

### 4. Habilitar Website Hosting
Ve a la consola de S3:
- Selecciona tu bucket
- Properties → Static website hosting → Enable
- Index document: `index.html`
- Error document: `404.html`

## 👤 Configuración del Usuario IAM

### 1. Crear Usuario IAM
```bash
aws iam create-user --user-name github-actions-deployer
```

### 2. Crear Política de Permisos
Crea `deploy-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::tu-app-frontend",
        "arn:aws:s3:::tu-app-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

Aplica la política:
```bash
aws iam put-user-policy \
  --user-name github-actions-deployer \
  --policy-name S3DeploymentPolicy \
  --policy-document file://deploy-policy.json
```

### 3. Crear Access Keys
```bash
aws iam create-access-key --user-name github-actions-deployer
```

Guarda el `AccessKeyId` y `SecretAccessKey` en GitHub Secrets.

## ☁️ Configuración de CloudFront (Opcional pero Recomendado)

### 1. Crear Distribución CloudFront
```bash
aws cloudfront create-distribution \
  --origin-domain-name tu-app-frontend.s3-website.us-east-2.amazonaws.com \
  --default-root-object index.html
```

### 2. Configurar Error Pages para SPA
En la consola de CloudFront:
- Error Pages → Create Custom Error Response
- HTTP Error Code: 403
- Customize Error Response: Yes
- Response Page Path: `/index.html`
- HTTP Response Code: 200

Repite para error 404.

### 3. Configurar invalidación automática
Agrega el Distribution ID a GitHub Secrets como `CLOUDFRONT_DISTRIBUTION_ID`.

## 🚀 Deployment

El workflow se ejecuta automáticamente cuando:
- Haces push a `main` o `master`
- Lo ejecutas manualmente desde la pestaña "Actions" en GitHub

### Ejecución Manual
1. Ve a la pestaña "Actions" en tu repositorio
2. Selecciona "Deploy to S3"
3. Click en "Run workflow"

## 📦 Lo que hace el Workflow

1. ✅ Checkout del código
2. ✅ Instala Node.js 20
3. ✅ Instala dependencias
4. ✅ Ejecuta type check (no bloquea)
5. ✅ Buildea la aplicación Next.js
6. ✅ Configura credenciales AWS
7. ✅ Sube archivos a S3 con cache optimizado:
   - Assets estáticos (JS, CSS, imágenes): cache de 1 año
   - HTML y JSON: sin cache
8. ✅ Invalida cache de CloudFront (si está configurado)

## 🔍 Verificación

Después del deployment, verifica:

1. **S3 Bucket**: Los archivos deben estar en el bucket
```bash
aws s3 ls s3://tu-app-frontend/ --recursive
```

2. **Website URL**: Prueba el sitio
```
http://tu-app-frontend.s3-website.us-east-2.amazonaws.com
```

3. **CloudFront**: Si lo configuraste
```
https://tu-distribution-id.cloudfront.net
```

## ⚠️ Troubleshooting

### Error: "Access Denied"
- Verifica que las credenciales AWS sean correctas
- Verifica que el usuario IAM tenga permisos suficientes

### Error: "Bucket not found"
- Verifica que `S3_BUCKET_NAME` sea correcto
- Verifica que el bucket exista en la región correcta

### Páginas en blanco o 404
- Verifica que Next.js esté configurado con `output: 'export'`
- Verifica que CloudFront redirija 404 a `/index.html`
- Verifica que las variables de entorno estén correctas

### Build falla
- Revisa los logs en GitHub Actions
- Verifica que todas las variables `NEXT_PUBLIC_*` estén en Secrets
- Prueba el build localmente: `npm run build`

## 🎯 Mejoras Futuras

- [ ] Agregar tests antes del deployment
- [ ] Deployment a múltiples entornos (staging, production)
- [ ] Rollback automático en caso de error
- [ ] Notificaciones a Slack/Discord
- [ ] Lighthouse CI para performance checks
