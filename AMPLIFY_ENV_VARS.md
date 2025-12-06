# Variables de Entorno para AWS Amplify

## Instrucciones para Configurar Variables de Entorno en Amplify Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona tu aplicación
3. Ve a **App settings** > **Environment variables**
4. Haz clic en **Manage variables**
5. Agrega las siguientes variables:

---

## Variables Requeridas

### 1. Configuración de AWS y Región
```
NEXT_PUBLIC_AWS_REGION = us-east-2
NEXT_PUBLIC_REGION = us-east-2
```

### 2. Cognito User Pool
```
NEXT_PUBLIC_USER_POOL_ID = us-east-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-2_XXXXXXXXX
```
**Nota:** Reemplaza `XXXXXXXXX` con tu User Pool ID real de Cognito

### 3. Cognito App Client
```
NEXT_PUBLIC_USER_POOL_CLIENT_ID = XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = XXXXXXXXXXXXXXXXXXXXXXXXXX
```
**Nota:** Reemplaza con tu App Client ID real de Cognito

### 4. Cognito Domain
```
NEXT_PUBLIC_COGNITO_DOMAIN = your-domain-prefix.auth.us-east-2.amazoncognito.com
```
**Nota:** Reemplaza `your-domain-prefix` con el dominio configurado en Cognito

### 5. API Gateway
```
NEXT_PUBLIC_API_URL = https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev
NEXT_PUBLIC_API_ID = your-api-id-here
```
**Nota:** Reemplaza con tu API Gateway URL y ID reales

### 6. Application URL
```
NEXT_PUBLIC_APP_URL = https://main.xxxxxx.amplifyapp.com
```
**Nota:** Esta será la URL generada por Amplify después del primer deploy. Inicialmente puedes dejarla vacía y actualizarla después del primer deploy.

### 7. Environment
```
NEXT_PUBLIC_ENVIRONMENT = production
NODE_ENV = production
```

### 8. Telemetría de Next.js (Opcional)
```
NEXT_TELEMETRY_DISABLED = 1
```

---

## Pasos Después del Primer Deploy

### 1. Actualizar NEXT_PUBLIC_APP_URL
Después del primer deploy, Amplify generará una URL como:
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

Actualiza la variable `NEXT_PUBLIC_APP_URL` con esta URL y redeploy.

### 2. Actualizar Cognito Callback URLs
Ve a **AWS Cognito Console** > **User Pools** > Tu User Pool > **App integration** > **App client settings**

Agrega las siguientes URLs:

**Allowed callback URLs:**
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com/auth/callback
http://localhost:9002/auth/callback
```

**Allowed sign-out URLs:**
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com/login
http://localhost:9002/login
```

**Nota:** Reemplaza `d1a2b3c4d5e6f7` con tu ID real de Amplify

### 3. Redeploy
Después de actualizar las variables y Cognito, haz un redeploy en Amplify Console.

---

## Verificación de Variables

Puedes verificar que las variables están configuradas correctamente ejecutando:

```bash
cd saas-aws-front
bash scripts/validate-deployment.sh
```

---

## Troubleshooting

### Error: "Cannot read NEXT_PUBLIC_X variable"
- Verifica que las variables estén configuradas en Amplify Console
- Asegúrate de que el nombre de la variable sea exacto (case-sensitive)
- Redeploy después de cambiar variables

### Error: "Cognito redirect mismatch"
- Verifica que las Callback URLs en Cognito coincidan exactamente con la URL de Amplify
- No olvides incluir `/auth/callback` al final

### Error: "API Gateway 403 Forbidden"
- Verifica que `NEXT_PUBLIC_API_URL` sea correcta
- Asegúrate de que el Cognito token esté siendo enviado correctamente
- Verifica los CORS en API Gateway

---

## Ejemplo Completo

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-2
NEXT_PUBLIC_REGION=us-east-2

# Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=us-east-2_abc123XYZ
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-2_abc123XYZ
NEXT_PUBLIC_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
NEXT_PUBLIC_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
NEXT_PUBLIC_COGNITO_DOMAIN=my-saas-app.auth.us-east-2.amazoncognito.com

# API Gateway
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.us-east-2.amazonaws.com/dev
NEXT_PUBLIC_API_ID=abc123xyz

# Application
NEXT_PUBLIC_APP_URL=https://main.d1a2b3c4d5e6f7.amplifyapp.com
NEXT_PUBLIC_ENVIRONMENT=production

# Build Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## Seguridad

⚠️ **IMPORTANTE:**
- NUNCA commits archivos `.env.local` a Git
- Las variables en Amplify Console son privadas y seguras
- Solo las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente
- Variables sin `NEXT_PUBLIC_` solo están disponibles en el servidor durante el build
