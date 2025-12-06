# Troubleshooting Amplify 404 - Diagnóstico Completo

## ⚠️ Problema Actual

URL: `https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com/` retorna **HTTP 404**

## 🔍 Diagnóstico Paso a Paso

### PASO 1: Verificar Estado del Deployment

#### A. Verificar en AWS Amplify Console

1. Abre: https://console.aws.amazon.com/amplify
2. Busca tu aplicación
3. Ve a la rama `feat/amplify` o `feat-amplify`
4. Revisa el **último build**:
   - ✅ Verde = Build exitoso
   - ❌ Rojo = Build falló
   - 🟡 Naranja = Build en progreso

#### B. Revisar Logs del Build

En Amplify Console:
1. Click en el build más reciente
2. Revisa cada fase:
   - **Provision**: ¿Se provisionó correctamente?
   - **Build**: ¿`npm run build` completó sin errores?
   - **Deploy**: ¿Los archivos se desplegaron?

**Busca estos errores comunes:**

```bash
# Error de dependencias
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree

# Error de TypeScript
Type error: ...
Build failed because of TypeScript errors.

# Error de memoria
JavaScript heap out of memory

# Error de Next.js
Error: Cannot find module 'next'
```

### PASO 2: Verificar Configuración de Amplify

#### A. Verificar Platform Setting

En Amplify Console → App settings → General:

**DEBE decir:**
```
Platform: WEB_COMPUTE
```

**Si dice `WEB` (sin COMPUTE):**
1. Ve a App settings → General
2. Click "Edit"
3. Cambia a "WEB_COMPUTE"
4. Save
5. Redeploy

#### B. Verificar Build Settings

En Amplify Console → App settings → Build settings:

**Debe contener:**
```yaml
version: 1
applications:
  - appRoot: saas-aws-front
    platform: WEB_COMPUTE
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
```

Si no coincide, actualiza desde la consola o usa el archivo `amplify.yml`

#### C. Verificar Variables de Entorno

En Amplify Console → App settings → Environment variables:

**Variables MÍNIMAS necesarias:**
```
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com
```

**⚠️ IMPORTANTE:** Si cambiaste variables, DEBES hacer redeploy manualmente.

### PASO 3: Verificar la Aplicación Next.js

#### A. Build Local

Verifica que la app compile localmente:

```bash
cd c:\Users\guido\Desktop\Personal\saas\saas-aws-front
npm ci
npm run build
```

**Si falla localmente, también fallará en Amplify.**

#### B. Verificar archivos generados

Después del build, verifica:

```bash
ls -la .next/
```

**Debe existir:**
- `.next/server/` - Server components
- `.next/static/` - Assets estáticos
- `.next/standalone/` - (Opcional) Server standalone

### PASO 4: Problemas Específicos de Next.js 15

Next.js 15 tiene cambios importantes. Verifica:

#### A. Runtime en package.json

```json
{
  "engines": {
    "node": ">=18.17.0"
  }
}
```

#### B. next.config.ts

Tu configuración actual:
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // ⚠️ Puede ocultar errores
  },
  eslint: {
    ignoreDuringBuilds: true,  // ⚠️ Puede ocultar errores
  },
  // ...
};
```

**PROBLEMA POTENCIAL:** Estás ignorando errores que pueden causar builds rotos.

### PASO 5: Soluciones Según el Problema

#### 🔴 Si el Build Falló

1. Lee los logs completos
2. Copia el error exacto
3. Busca soluciones específicas:

**Error de TypeScript:**
```bash
# Opción 1: Arreglar los errores
npm run typecheck

# Opción 2: Temporalmente deshabilitar (NO recomendado)
# Ya está en next.config.ts
```

**Error de memoria:**
```yaml
# En amplify.yml, agrega:
build:
  phases:
    build:
      commands:
        - export NODE_OPTIONS="--max-old-space-size=4096"
        - npm run build
```

**Error de dependencias:**
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
```

#### 🟡 Si el Build Fue Exitoso pero da 404

**Posibles causas:**

1. **Amplify está usando WEB en vez de WEB_COMPUTE**
   - Solución: Cambia a WEB_COMPUTE en la consola

2. **Los archivos no se desplegaron correctamente**
   - Verifica en logs: "Deploy" phase
   - Busca: "Deploying artifacts..."

3. **La URL es incorrecta**
   - Verifica la URL exacta en Amplify Console
   - Puede ser diferente a `feat-amplify.ds4d4dyzpxe96.amplifyapp.com`

4. **El dominio aún está propagando**
   - Espera 5-10 minutos después del deploy
   - Prueba en modo incógnito

#### 🟢 Si Todo Parece Correcto

**Verifica DNS y Caché:**

```bash
# Limpia caché DNS (Windows)
ipconfig /flushdns

# Prueba con curl
curl -I https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com/

# Debe retornar:
# HTTP/2 200 (si funciona)
# HTTP/2 404 (si aún falla)
```

### PASO 6: Redeploy Manual

Si todo lo anterior está correcto:

1. En Amplify Console
2. Click en la rama `feat/amplify`
3. Click en "Redeploy this version"
4. Espera 5-10 minutos
5. Prueba la URL

## 🛠️ Solución Recomendada

### Opción 1: Usar Standalone Output (RECOMENDADO para Amplify)

Modifica `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ← Agrega esto
  typescript: {
    ignoreBuildErrors: false,  // ← Cambia a false
  },
  eslint: {
    ignoreDuringBuilds: false,  // ← Cambia a false
  },
  // ... resto de la configuración
};
```

Actualiza `amplify.yml`:

```yaml
version: 1
applications:
  - appRoot: saas-aws-front
    platform: WEB_COMPUTE
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

### Opción 2: Verificar Configuración Actual en Amplify Console

**IMPORTANTE:** El archivo `amplify.yml` en el repo puede estar siendo **ignorado** si configuraste build settings manualmente en Amplify Console.

**Para verificar:**
1. Amplify Console → App settings → Build settings
2. Ve si hay un "Build specification"
3. Si existe, cópialo y compáralo con `amplify.yml`

**Si están diferentes, ELIGE UNO:**
- Opción A: Usar `amplify.yml` del repo (click "Download amplify.yml")
- Opción B: Borrar build settings de la consola (usará `amplify.yml`)

## 📋 Checklist de Verificación

Marca cada item:

- [ ] Git push realizado a la rama correcta
- [ ] Build completado sin errores en Amplify Console
- [ ] Platform = WEB_COMPUTE en Amplify Console
- [ ] Variables de entorno configuradas
- [ ] La URL es exactamente la que Amplify generó
- [ ] Build local funciona (`npm run build`)
- [ ] No hay errores de TypeScript/ESLint ocultos
- [ ] DNS/caché limpiado
- [ ] Esperado al menos 10 minutos después del deploy

## 🆘 Si Nada Funciona

**Último recurso:**

1. **Borra la aplicación en Amplify**
2. **Crea una nueva aplicación**
3. **Configura desde cero con estos settings:**

```
Branch: feat/amplify
Build settings: Use amplify.yml from repository
Platform: WEB_COMPUTE
Environment variables: (agregar manualmente)
```

4. **Deploy desde cero**

## 📞 Información de Debugging

Cuando pidas ayuda, proporciona:

```bash
# Información del build
- ✅/❌ Build status en Amplify
- Logs completos de la última fase que falló
- URL exacta que da 404
- Screenshot de la consola de Amplify

# Información local
npm run build  # output completo
node --version
npm --version
```

---

**Siguiente paso:** Ve al PASO 1 y verifica cada punto sistemáticamente.
