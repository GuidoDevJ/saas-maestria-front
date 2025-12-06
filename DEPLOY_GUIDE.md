# Guía Completa de Despliegue en AWS Amplify

## 📋 Checklist Pre-Deploy

Antes de comenzar, asegúrate de tener:

- [x] ✅ Build local exitoso (`npm run build`)
- [x] ✅ Configuración de amplify.yml optimizada
- [x] ✅ Rutas dinámicas configuradas con SSR
- [x] ✅ Variables de entorno documentadas
- [ ] 🔄 Credenciales de AWS configuradas
- [ ] 🔄 Repositorio en GitHub/GitLab/Bitbucket
- [ ] 🔄 Cognito User Pool creado
- [ ] 🔄 API Gateway desplegado

---

## 🚀 Paso 1: Preparar el Código

### 1.1 Verificar cambios realizados

Los siguientes archivos han sido modificados/creados:

```
✓ amplify.yml - Configuración optimizada para Next.js 15
✓ saas-aws-front/src/app/(app)/documents/[id]/edit/page.tsx - Añadido dynamic = "force-dynamic"
✓ saas-aws-front/src/app/(app)/documents/[id]/versions/[versionId]/page.tsx - Añadido dynamic = "force-dynamic"
✓ saas-aws-front/src/lib/config/api.config.ts - Región dinámica basada en variable de entorno
✓ saas-aws-front/scripts/validate-deployment.sh - Script de validación
✓ AMPLIFY_ENV_VARS.md - Documentación de variables de entorno
✓ DEPLOY_GUIDE.md - Esta guía
```

### 1.2 Hacer commit de los cambios

```bash
cd /c/Users/guido/Desktop/Personal/saas

git add amplify.yml
git add saas-aws-front/src/app/(app)/documents/[id]/edit/page.tsx
git add saas-aws-front/src/app/(app)/documents/[id]/versions/[versionId]/page.tsx
git add saas-aws-front/src/lib/config/api.config.ts
git add saas-aws-front/scripts/validate-deployment.sh
git add AMPLIFY_ENV_VARS.md
git add DEPLOY_GUIDE.md

git commit -m "feat: Configure for AWS Amplify deployment

- Update amplify.yml with Next.js 15 optimizations
- Add force-dynamic to dynamic routes
- Make API region configurable via env vars
- Add deployment validation script
- Document environment variables"

git push origin develop
```

---

## 🌐 Paso 2: Crear Aplicación en AWS Amplify

### 2.1 Acceder a Amplify Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona la región correcta (us-east-2)
3. Haz clic en **New app** > **Host web app**

### 2.2 Conectar Repositorio

1. Selecciona tu proveedor Git:
   - GitHub
   - GitLab
   - Bitbucket
   - AWS CodeCommit

2. **Autorizar acceso** a tu repositorio

3. Seleccionar repositorio:
   - Repository: `saas-maestria` (o el nombre de tu repo)
   - Branch: `develop`

4. Hacer clic en **Next**

### 2.3 Configurar Build Settings

Amplify detectará automáticamente el `amplify.yml`. Verifica que muestre:

```yaml
version: 1
applications:
  - appRoot: saas-aws-front
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
```

**IMPORTANTE:** Si Amplify no detecta el `amplify.yml`, asegúrate de que esté en la raíz del repositorio.

### 2.4 Configurar Nombre de Aplicación

- App name: `saas-aws-front` (o el nombre que prefieras)
- Environment: `production`

Haz clic en **Next**

---

## 🔐 Paso 3: Configurar Variables de Entorno

**Antes del primer deploy**, configura las variables de entorno:

1. En la página de review, haz clic en **Advanced settings**
2. Scroll hasta **Environment variables**
3. Agrega las siguientes variables (ver [AMPLIFY_ENV_VARS.md](AMPLIFY_ENV_VARS.md) para detalles):

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION = us-east-2
NEXT_PUBLIC_REGION = us-east-2

# Cognito
NEXT_PUBLIC_USER_POOL_ID = us-east-2_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-2_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID = XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = XXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_COGNITO_DOMAIN = your-domain.auth.us-east-2.amazoncognito.com

# API Gateway
NEXT_PUBLIC_API_URL = https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev
NEXT_PUBLIC_API_ID = your-api-id

# App URL (dejar vacío por ahora, se actualizará después del primer deploy)
NEXT_PUBLIC_APP_URL =

# Environment
NEXT_PUBLIC_ENVIRONMENT = production
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
```

**⚠️ IMPORTANTE:** Reemplaza los valores de ejemplo con tus valores reales de AWS.

---

## 🏗️ Paso 4: Primer Deploy

1. Haz clic en **Save and deploy**
2. Amplify comenzará el proceso de build y deploy
3. Espera aproximadamente 5-10 minutos

### Monitorear el Deploy

En la consola de Amplify verás:

```
Provision ✓ (1-2 min)
Build ✓ (3-5 min)
Deploy ✓ (1-2 min)
Verify (opcional)
```

Si hay errores:
- Revisa los logs en la sección **Build**
- Verifica que las variables de entorno estén correctas
- Consulta la sección de Troubleshooting más abajo

### Obtener URL de Amplify

Una vez completado el deploy, verás una URL como:
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

**Copia esta URL** - la necesitarás para el siguiente paso.

---

## 🔄 Paso 5: Actualizar Variables y Cognito

### 5.1 Actualizar NEXT_PUBLIC_APP_URL

1. Ve a **App settings** > **Environment variables**
2. Edita `NEXT_PUBLIC_APP_URL` con la URL de Amplify:
   ```
   NEXT_PUBLIC_APP_URL = https://main.d1a2b3c4d5e6f7.amplifyapp.com
   ```
3. Guarda los cambios

### 5.2 Actualizar Cognito Callback URLs

1. Ve a [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Selecciona tu User Pool
3. Ve a **App integration** > **App client list** > Selecciona tu App client
4. Scroll hasta **Hosted UI settings**
5. Edita **Allowed callback URLs** y agrega:
   ```
   https://main.d1a2b3c4d5e6f7.amplifyapp.com/auth/callback
   http://localhost:9002/auth/callback
   ```

6. Edita **Allowed sign-out URLs** y agrega:
   ```
   https://main.d1a2b3c4d5e6f7.amplifyapp.com/login
   http://localhost:9002/login
   ```

7. Guarda los cambios

### 5.3 Redeploy

1. Vuelve a Amplify Console
2. Haz clic en **Redeploy this version** o espera a que se detecte un nuevo commit
3. Alternativamente, puedes hacer un push vacío:
   ```bash
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin develop
   ```

---

## ⚙️ Paso 6: Configurar Rewrites y Headers

### 6.1 Configurar Rewrites

1. Ve a **App settings** > **Rewrites and redirects**
2. Haz clic en **Add rule**
3. Agrega la siguiente regla:

```
Source address: /<*>
Target address: /index.html
Type: 200 (Rewrite)
```

Esto asegura que las rutas dinámicas de Next.js funcionen correctamente.

### 6.2 Headers de Seguridad (Opcional)

Los headers ya están configurados en `amplify.yml`, pero puedes verificar:

- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

---

## ✅ Paso 7: Verificación Final

### 7.1 Probar la Aplicación

Visita tu URL de Amplify y verifica:

- [ ] La página principal carga correctamente
- [ ] Login/Register funcionan
- [ ] Cognito redirect funciona
- [ ] Dashboard carga después de login
- [ ] Rutas dinámicas `/documents/[id]` funcionan
- [ ] API calls al backend funcionan
- [ ] Imágenes se cargan correctamente

### 7.2 Verificar Logs

Si algo no funciona:

1. Ve a **Monitoring** en Amplify Console
2. Revisa **Logs** para errores de servidor
3. Abre DevTools en el navegador (F12) para errores de cliente

---

## 🔧 Paso 8: Configuración Adicional (Opcional)

### 8.1 Dominio Personalizado

1. Ve a **App settings** > **Domain management**
2. Haz clic en **Add domain**
3. Selecciona o ingresa tu dominio
4. Sigue los pasos para configurar DNS
5. Amplify creará automáticamente el certificado SSL

### 8.2 Notificaciones

1. Ve a **App settings** > **Notifications**
2. Configura notificaciones para:
   - Build successful
   - Build failed
   - Deploy successful

### 8.3 Branch Deployments

Para crear deployments automáticos para otras ramas:

1. Ve a **App settings** > **Branch management**
2. Haz clic en **Connect branch**
3. Selecciona la rama (ej: `staging`, `develop`)
4. Cada branch tendrá su propia URL

### 8.4 Performance Monitoring

1. Ve a **Monitoring**
2. Habilita **CloudWatch RUM** (Real User Monitoring)
3. Configura alertas para:
   - Errores de JavaScript
   - Tiempo de carga lento
   - Errores de API

---

## 🐛 Troubleshooting

### Error: "Build failed - Cannot find module"

**Solución:**
1. Verifica que `package.json` tenga todas las dependencias
2. Revisa los logs de build en Amplify
3. Asegúrate de que `npm ci` se ejecute correctamente

### Error: "Environment variable not defined"

**Solución:**
1. Verifica que las variables estén en **App settings** > **Environment variables**
2. Asegúrate de que los nombres sean exactos (case-sensitive)
3. Redeploy después de agregar variables

### Error: "Cognito redirect mismatch"

**Solución:**
1. Verifica que las Callback URLs en Cognito coincidan EXACTAMENTE con la URL de Amplify
2. No olvides `/auth/callback` al final
3. Verifica que `NEXT_PUBLIC_APP_URL` sea correcta

### Error: "API Gateway 403 Forbidden"

**Solución:**
1. Verifica que `NEXT_PUBLIC_API_URL` sea correcta
2. Asegúrate de que el token de Cognito se envíe en los headers
3. Revisa los CORS en API Gateway
4. Verifica que el User Pool tenga permisos en API Gateway

### Error: "Page not found" en rutas dinámicas

**Solución:**
1. Verifica que la regla de rewrite esté configurada: `/<*>` → `/index.html`
2. Asegúrate de que las páginas tengan `export const dynamic = "force-dynamic"`
3. Revisa que no haya `output: 'export'` en `next.config.ts`

### Build lento

**Solución:**
1. Verifica que el caché esté habilitado en `amplify.yml`:
   ```yaml
   cache:
     paths:
       - node_modules/**/*
       - .next/cache/**/*
   ```
2. Usa `npm ci` en lugar de `npm install`

---

## 📊 Monitoreo Post-Deploy

### CloudWatch Logs

Accede a logs detallados:
1. Ve a **Monitoring** > **Logs**
2. Selecciona el tipo de log:
   - Build logs
   - Server logs (SSR)
   - Access logs

### Métricas

Monitorea:
- Requests per minute
- Error rate
- Average response time
- Cache hit rate

---

## 🔄 CI/CD Automático

Una vez configurado, cada push a la rama configurada:

1. ✅ Detecta cambios automáticamente
2. ✅ Ejecuta build
3. ✅ Ejecuta tests (si están configurados)
4. ✅ Despliega automáticamente
5. ✅ Envía notificaciones

Para deshabilitar deploy automático:
1. Ve a **App settings** > **General**
2. Desmarca **Automatically build on code commit**

---

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada en AWS Amplify con:

- ✅ Next.js 15 con SSR
- ✅ Autenticación con Cognito
- ✅ API Gateway integration
- ✅ CI/CD automático
- ✅ HTTPS automático
- ✅ CloudFront CDN global
- ✅ Monitoreo y logs

---

## 📚 Recursos Adicionales

- [Documentación de AWS Amplify](https://docs.amplify.aws/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [AWS Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [Troubleshooting Guide](https://docs.amplify.aws/guides/troubleshooting/)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en Amplify Console
2. Consulta la documentación de AWS
3. Abre un issue en el repositorio
4. Contacta al equipo de soporte de AWS

---

**¡Felicidades por desplegar tu SaaS en AWS Amplify! 🚀**
