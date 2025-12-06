# AWS Amplify Setup Guide para Next.js

## Requisitos

- Cuenta AWS con acceso a Amplify Hosting
- Git (repositorio GitHub, GitLab, Bitbucket o CodeCommit)
- AWS CLI configurado (opcional pero recomendado)
- Node.js 18+ instalado

## Pasos de Configuración

### 1. Preparar el Repositorio

```bash
# Asegúrate de que estés en la rama que deseas desplegar
git checkout main  # o develop

# Realiza un commit con los cambios de Next.js
git add .
git commit -m "Configure Amplify hosting for Next.js"
git push origin main
```

### 2. Conectar AWS Amplify Hosting

#### Opción A: Consola AWS (Recomendado)

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Haz clic en **New app** > **Host web app**
3. Selecciona tu proveedor Git (GitHub, GitLab, etc.)
4. Autoriza acceso y selecciona el repositorio `saas-maestria`
5. Selecciona la rama a desplegar (ej: `main` o `develop`)
6. En **Build settings**, Amplify detectará automáticamente Next.js
   - Deja los valores predeterminados (Amplify reconoce `next build`)
7. Haz clic en **Deploy**

#### Opción B: Línea de Comandos (AWS CLI)

```bash
# Instala Amplify CLI
npm install -g @aws-amplify/cli

# Configura Amplify en tu proyecto
amplify init

# Configura hosting
amplify add hosting

# Desplega
amplify publish
```

### 3. Configurar Variables de Entorno en Amplify

En la **Consola AWS Amplify**:

1. Selecciona tu aplicación
2. Ve a **App settings** > **Environment variables**
3. Añade las siguientes variables:

```
NEXT_PUBLIC_APP_URL = https://your-domain.com (o URL de Amplify)
NEXT_PUBLIC_COGNITO_DOMAIN = your-cognito-domain
NEXT_PUBLIC_COGNITO_USER_POOL_ID = us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID = your-client-id
NODE_ENV = production
```

4. Guarda y redeploy la aplicación

### 4. Configurar Cognito

En **AWS Cognito Console**:

1. Ve a tu User Pool
2. Selecciona **App integration** > **App client settings**
3. Configura los **Allowed callback URLs**:
   - `https://youramplify-domain.amplifyapp.com/auth/callback`
   - `http://localhost:3000/auth/callback` (para desarrollo local)
4. Configura los **Allowed sign-out URLs**:
   - `https://youramplify-domain.amplifyapp.com/login`
   - `http://localhost:3000/login`

### 5. Configurar Política de Redirecciones (Rewrite Rules)

En **Amplify Console** > **App settings** > **Rewrites and redirects**:

Añade esta regla para que Next.js maneje todas las rutas:

```
Source address: /<.*>
Target address: /index.html
Type: 200 (Rewrite)
```

Esto es importante para que las rutas dinámicas funcionen correctamente.

## Estructura de archivos

```
saas/
├── amplify.yml              # Configuración de build para Amplify
├── AMPLIFY_SETUP.md         # Esta guía
├── back/                    # Backend (CDK)
└── saas-aws-front/          # Frontend Next.js
    ├── .env.local           # Variables locales (NO en Git)
    ├── .env.example         # Template de variables (en Git)
    ├── next.config.ts       # Configuración Next.js (SSR habilitado)
    ├── package.json
    └── src/
        └── app/
            └── (app)/
                └── documents/
                    └── [id]/
                        └── page.tsx  # Ruta dinámica con SSR
```

## Configuración de Next.js

Se han realizado los siguientes cambios:

1. **Removido `output: 'export'`**: Ahora usa SSR dinámico (más compatible con Amplify)
2. **Actualizado `images.unoptimized: false`**: Permite optimización de imágenes
3. **Añadido `export const dynamic = "force-dynamic"`** en `/documents/[id]/page.tsx`

Esto permite que las rutas dinámicas funcionen correctamente en Amplify.

## Desarrollo Local

```bash
# Instalar dependencias
cd saas-aws-front
npm install

# Crear archivo .env.local
cp .env.example .env.local
# Edita .env.local con tus valores de desarrollo

# Ejecutar en modo desarrollo
npm run dev

# Acceso a http://localhost:3000
```

## Build y Testing

```bash
# Build de producción
npm run build

# Verificar que compila sin errores
npm run typecheck
npm run lint
```

## Monitoreo

En **Amplify Console**:
- **Deployments**: Historial de despliegues y logs
- **Monitoring**: Análisis de rendimiento
- **Logs**: Acceso a CloudWatch logs

## Troubleshooting

### Error: "Page is missing generateStaticParams()"
✅ **Resuelto**: Se actualizó `next.config.ts` para usar SSR dinámico.

### Error: "Variables de entorno no definidas en build"
1. Verifica que las variables estén en Amplify Console
2. Asegúrate de que el prefijo es `NEXT_PUBLIC_` (cliente) o sin prefijo (servidor)
3. Redeploy después de cambiar variables

### El sitio funciona pero no carga estilos
1. Verifica que `tailwindcss` está instalado
2. Asegúrate de que Amplify está sirviendo archivos `.css` correctamente
3. Limpia caché del navegador (Ctrl+Shift+Delete)

## Escalabilidad

Para optimizar en producción:
- AWS CloudFront + S3: Distribución global de contenido
- AWS Lambda@Edge: Redirecciones y transformaciones edge
- AWS WAF: Protección contra ataques

Consulta [Amplify Docs](https://docs.amplify.aws/) para más detalles.
