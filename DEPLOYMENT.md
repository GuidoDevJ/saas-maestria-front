# Guía de Deployment a AWS S3

Esta aplicación Next.js se despliega automáticamente a AWS S3 usando GitHub Actions.

## 🚀 Quick Start

### 1. Configuración Inicial (Una sola vez)

#### Opción A: Usar el script automatizado (Recomendado)
```bash
# Dale permisos de ejecución
chmod +x scripts/setup-s3-deployment.sh

# Ejecuta el script
./scripts/setup-s3-deployment.sh
```

El script te pedirá:
- Nombre del bucket S3
- Región de AWS
- Nombre del usuario IAM

Y automáticamente:
- ✅ Crea el bucket
- ✅ Configura website hosting
- ✅ Aplica políticas de seguridad
- ✅ Crea usuario IAM con permisos
- ✅ Genera access keys
- ✅ Te da los valores para GitHub Secrets

#### Opción B: Configuración manual
Sigue las instrucciones detalladas en [`.github/workflows/README.md`](.github/workflows/README.md)

### 2. Configurar GitHub Secrets

Ve a tu repositorio en GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

Agrega los siguientes secrets (obtenidos del script o configuración manual):

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=tu-app-frontend

NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_USER_POOL_ID=us-east-2_...
NEXT_PUBLIC_USER_POOL_CLIENT_ID=...
NEXT_PUBLIC_COGNITO_DOMAIN=...
NEXT_PUBLIC_API_URL=https://...execute-api.us-east-2.amazonaws.com/dev
```

Opcional (para CloudFront):
```
CLOUDFRONT_DISTRIBUTION_ID=E...
```

### 3. Deploy

#### Deploy Automático
Simplemente haz push a `main` o `master`:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

El workflow se ejecutará automáticamente y en ~5 minutos tu app estará en S3.

#### Deploy Manual
1. Ve a GitHub → Actions
2. Selecciona "Deploy to S3"
3. Click en "Run workflow"
4. Selecciona la branch
5. Click en "Run workflow"

## 🔍 URLs de Acceso

### S3 Website URL
```
http://TU-BUCKET.s3-website.us-east-2.amazonaws.com
```

### CloudFront URL (si lo configuraste)
```
https://TU-DISTRIBUTION-ID.cloudfront.net
```

### Dominio Personalizado (opcional)
Puedes configurar Route53 para usar tu propio dominio:
```
https://tuapp.com
```

## 📁 Estructura del Proyecto

```
.
├── .github/
│   └── workflows/
│       ├── deploy-to-s3.yml         # Workflow de deployment
│       ├── README.md                 # Documentación detallada
│       └── aws-policies/             # Políticas de ejemplo
│           ├── bucket-policy.json
│           └── iam-deploy-policy.json
├── scripts/
│   └── setup-s3-deployment.sh       # Script de configuración
├── .env.example                      # Variables de entorno de ejemplo
├── next.config.ts                    # Configuración Next.js (output: 'export')
└── DEPLOYMENT.md                     # Este archivo
```

## 🔧 Configuración de Next.js

La aplicación está configurada para exportación estática:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',        // Exporta como sitio estático
  images: {
    unoptimized: true,     // Requerido para S3
  },
};
```

Esto genera una carpeta `out/` con todos los archivos estáticos listos para S3.

## 📦 Proceso de Build

El workflow ejecuta:

```bash
# 1. Instalar dependencias
npm ci

# 2. Type check (no bloquea)
npm run typecheck

# 3. Build
npm run build  # Genera carpeta 'out/'

# 4. Deploy a S3
aws s3 sync out/ s3://bucket/ --delete

# 5. Invalidar CloudFront (opcional)
aws cloudfront create-invalidation ...
```

## 🎯 Cache Strategy

El workflow aplica diferentes políticas de cache:

### Assets estáticos (JS, CSS, imágenes)
```
Cache-Control: public,max-age=31536000,immutable
```
- Se cachean por 1 año
- Inmutables (no cambian)
- Usa hash en filename para busting

### HTML y JSON
```
Cache-Control: public,max-age=0,must-revalidate
```
- Sin cache
- Siempre obtiene la versión más reciente
- Importante para SPAs

## 🚨 Troubleshooting

### ❌ Build falla con error de tipos
El workflow está configurado con `continue-on-error: true` en el typecheck, por lo que no debería bloquear. Si necesitas que bloquee, edita [`.github/workflows/deploy-to-s3.yml`](.github/workflows/deploy-to-s3.yml):

```yaml
- name: Run type check
  run: npm run typecheck
  # continue-on-error: true  # Comenta esta línea
```

### ❌ 403 Forbidden al acceder al sitio
1. Verifica que el bucket tenga la política pública correcta
2. Verifica que "Block all public access" esté deshabilitado
3. Revisa la política del bucket en S3 console

### ❌ Páginas en blanco
1. Verifica que `output: 'export'` esté en `next.config.ts`
2. Verifica que las variables de entorno estén en GitHub Secrets
3. Si usas CloudFront, configura error pages para redirigir a `/index.html`

### ❌ API calls fallan
1. Verifica que `NEXT_PUBLIC_API_URL` sea correcto
2. Verifica que el API Gateway tenga CORS habilitado
3. Verifica que el API acepte requests del dominio de S3/CloudFront

### ❌ Authentication no funciona
1. Verifica todas las variables `NEXT_PUBLIC_COGNITO_*`
2. En Cognito, agrega el dominio S3/CloudFront a "Allowed callback URLs" y "Allowed sign-out URLs"
3. Verifica que `NEXT_PUBLIC_APP_URL` coincida con el dominio real

## 🔐 Seguridad

### Secrets Management
- ✅ Nunca commites secrets al repositorio
- ✅ Usa GitHub Secrets para credenciales
- ✅ Las variables `NEXT_PUBLIC_*` son públicas (se incluyen en el bundle)
- ✅ No pongas API keys sensibles en variables `NEXT_PUBLIC_*`

### IAM Best Practices
- ✅ Usuario IAM específico para deployment
- ✅ Permisos mínimos necesarios
- ✅ Rota access keys periódicamente
- ✅ Habilita MFA en cuenta root

### S3 Bucket Security
- ✅ Solo permite `GetObject` público (no `PutObject`)
- ✅ Habilita versionado del bucket (opcional)
- ✅ Habilita logs de acceso (opcional)
- ✅ Usa CloudFront con WAF para protección DDoS (recomendado)

## 🌐 CloudFront (Recomendado)

### Beneficios
- 🚀 CDN global - menor latencia
- 🔒 HTTPS gratis con certificado ACM
- 🛡️ Protección DDoS con AWS Shield
- 💰 Reduce costos de transferencia S3
- 🎯 Soporte completo para SPAs

### Setup Rápido

1. **Crear certificado SSL (si usas dominio custom)**
```bash
# En us-east-1 (requerido para CloudFront)
aws acm request-certificate \
  --domain-name tuapp.com \
  --subject-alternative-names www.tuapp.com \
  --validation-method DNS \
  --region us-east-1
```

2. **Crear distribución CloudFront**
```bash
aws cloudfront create-distribution \
  --origin-domain-name tu-bucket.s3-website.us-east-2.amazonaws.com \
  --default-root-object index.html
```

3. **Configurar error pages** (consola web)
- Error 403 → `/index.html` (200)
- Error 404 → `/index.html` (200)

4. **Agregar Distribution ID a GitHub Secrets**
```
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

## 📊 Monitoreo

### Ver logs de deployment
GitHub → Actions → Selecciona el workflow → Ver logs

### Ver archivos en S3
```bash
aws s3 ls s3://tu-bucket/ --recursive
```

### Verificar distribución CloudFront
```bash
aws cloudfront get-distribution --id E1234567890ABC
```

### Métricas CloudWatch (S3)
- Requests
- Bytes downloaded
- 4xx/5xx errors

## 🔄 Rollback

Si necesitas hacer rollback a una versión anterior:

### Opción 1: Revert Git y Redeploy
```bash
git revert HEAD
git push origin main
```

### Opción 2: S3 Versioning
Si habilitaste versionado en S3:
```bash
aws s3api list-object-versions --bucket tu-bucket
# Restaura versión específica
```

### Opción 3: Deploy branch anterior
GitHub Actions → Run workflow → Selecciona branch/commit anterior

## 📚 Referencias

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS S3 Static Website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront + S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en GitHub Actions
2. Consulta el [README detallado](.github/workflows/README.md)
3. Revisa la sección de Troubleshooting arriba
4. Verifica que todos los secrets estén configurados correctamente
