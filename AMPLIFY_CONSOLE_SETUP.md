# Configuración de AWS Amplify Console - Paso a Paso

## 🎯 Problema: Error 404 en Amplify

**URL afectada:** `https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com/`

## ✅ Solución: Configurar Correctamente en Amplify Console

### PASO 1: Verificar y Cambiar Platform

#### 1.1 Acceder a la Configuración
1. Ve a: https://console.aws.amazon.com/amplify
2. Click en tu aplicación
3. En el menú izquierdo, ve a **App settings** → **General**

#### 1.2 Verificar Platform
Busca la sección **Platform**

**Si dice:**
```
Platform: WEB
```

**❌ ESTO ESTÁ MAL** - Necesitas cambiarlo a `WEB_COMPUTE`

**Cómo cambiar:**
1. En la misma página, busca el botón **Edit** (arriba a la derecha)
2. En el dropdown de **Platform**, selecciona **WEB_COMPUTE**
3. Click en **Save changes**

**Si dice:**
```
Platform: WEB_COMPUTE
```

**✅ ESTO ESTÁ BIEN** - Continúa al PASO 2

---

### PASO 2: Verificar Build Settings

#### 2.1 Acceder a Build Settings
1. En el menú izquierdo, ve a **App settings** → **Build settings**

#### 2.2 Verificar Configuración

Debes ver algo como esto:

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
```

**Puntos críticos a verificar:**

- ✅ `appRoot: saas-aws-front` (porque tu app está en esa carpeta)
- ✅ `platform: WEB_COMPUTE`
- ✅ `baseDirectory: .next` (donde Next.js genera el build)

#### 2.3 Si la Configuración es Diferente

**Opción A: Editar manualmente**
1. Click en **Edit**
2. Pega el contenido del archivo `amplify.yml` del repositorio
3. Click en **Save**

**Opción B: Usar archivo del repositorio**
1. Click en **Edit**
2. Selecciona la opción **"Use amplify.yml from repository"**
3. Click en **Save**

⚠️ **IMPORTANTE:** Después de cambiar, debes hacer un **redeploy manual**.

---

### PASO 3: Verificar Variables de Entorno

#### 3.1 Acceder a Variables
1. Ve a **App settings** → **Environment variables**

#### 3.2 Variables MÍNIMAS Necesarias

**Para que funcione el build:**

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | `https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com` |

**Para que funcione la aplicación completa:**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_AWS_REGION` | `us-east-2` | Región de AWS |
| `NEXT_PUBLIC_USER_POOL_ID` | `us-east-2_XXXXXXX` | ID del User Pool de Cognito |
| `NEXT_PUBLIC_USER_POOL_CLIENT_ID` | `xxxxxxxxxxxxx` | Client ID de Cognito |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | `your-domain.auth.us-east-2.amazoncognito.com` | Dominio de Cognito |
| `NEXT_PUBLIC_API_URL` | `https://xxxxx.execute-api.us-east-2.amazonaws.com/dev` | URL de API Gateway |

#### 3.3 Agregar Variables

1. Click en **Manage variables**
2. Para cada variable:
   - Click en **Add variable**
   - **Variable name:** (nombre de la variable)
   - **Value:** (valor de la variable)
3. Click en **Save**

⚠️ **IMPORTANTE:** Después de agregar/cambiar variables, debes hacer un **redeploy manual**.

---

### PASO 4: Redeploy Manual

#### 4.1 Ir a la Rama
1. En el menú izquierdo, click en **Hosting environments**
2. Busca la rama `feat/amplify` o `feat-amplify`

#### 4.2 Verificar Último Build

Mira el estado del último build:

- **✅ Verde con check:** Build exitoso
- **❌ Rojo con X:** Build falló
- **🔄 Naranja girando:** Build en progreso
- **⏸️ Gris:** Sin builds recientes

#### 4.3 Hacer Redeploy

**Si el último build falló (❌ rojo):**
1. Click en el build fallido
2. Revisa los logs para ver el error
3. Arregla el error (vuelve a PASO 1-3 según necesario)
4. Click en **Redeploy this version**

**Si el último build fue exitoso (✅ verde):**
1. Click en el build exitoso
2. Click en **Redeploy this version**

**Si cambiaste Platform o Build Settings:**
1. Debes hacer un **nuevo push al repositorio**, O
2. Click en **Redeploy this version** en el último build

#### 4.4 Monitorear el Build

1. Espera a que inicie (puede tardar 1-2 minutos)
2. Verás 4 fases:
   - **Provision:** Preparando entorno (1-2 min)
   - **Build:** Ejecutando `npm ci` y `npm run build` (3-5 min)
   - **Deploy:** Desplegando archivos (1-2 min)
   - **Verify:** Verificación final (30 seg)

**Tiempo total estimado:** 5-10 minutos

---

### PASO 5: Verificar el Deploy

#### 5.1 Obtener la URL

Después de que el build complete:

1. En la página del build, busca la sección **Frontend**
2. Copia la URL (ejemplo: `https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com`)

#### 5.2 Probar la URL

**Opción 1: Navegador**
1. Abre una ventana de incógnito
2. Pega la URL
3. Deberías ver tu aplicación

**Opción 2: Curl (Terminal)**
```bash
curl -I https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com/
```

**Resultado esperado:**
```
HTTP/2 200
```

**Si ves:**
```
HTTP/2 404
```
Continúa al PASO 6 (Troubleshooting)

---

### PASO 6: Troubleshooting si Aún da 404

#### 6.1 Revisar Logs del Build

1. En Amplify Console, click en el último build
2. Expand **Build** logs
3. Busca errores:

**Errores comunes:**

```bash
# Error 1: npm install falló
npm ERR! code ERESOLVE
→ Solución: Verifica package-lock.json en el repo

# Error 2: npm run build falló
Error: Build failed
→ Solución: Revisa el error específico en los logs

# Error 3: Artifacts no generados
No files found in .next
→ Solución: Verifica que baseDirectory sea correcto
```

#### 6.2 Verificar Artifacts

En los logs del build, busca:

```
Deploying artifacts...
✔ Artifact deployed successfully
```

Si dice:
```
✘ No artifacts found
```

**Problema:** La configuración de `artifacts` en build settings está mal.

**Solución:**
```yaml
artifacts:
  baseDirectory: .next  # ← Debe ser .next para Next.js
  files:
    - '**/*'  # ← Incluye todos los archivos
```

#### 6.3 Verificar Platform (de nuevo)

Si todo lo demás funciona pero aún da 404:

1. Ve a **App settings** → **General**
2. Confirma que diga **Platform: WEB_COMPUTE**
3. Si dice `WEB`, cámbialo a `WEB_COMPUTE`
4. **IMPORTANTE:** Después de cambiar, debes:
   - Hacer un nuevo push al repo, O
   - Hacer redeploy manual

---

### PASO 7: Configuración Avanzada (Opcional)

#### 7.1 Custom Headers

Si necesitas headers de seguridad:

1. Ve a **App settings** → **Custom headers**
2. Click en **Add custom headers**
3. Agrega:

```
Pattern: **/*
Headers:
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
```

#### 7.2 Rewrites and Redirects

Para rutas dinámicas de Next.js (ya debería funcionar con WEB_COMPUTE):

1. Ve a **App settings** → **Rewrites and redirects**
2. Verifica que exista:

```
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
```

Si no existe, Next.js lo maneja automáticamente con WEB_COMPUTE.

---

## 📋 Checklist Final

Antes de reportar que no funciona, verifica:

- [ ] Platform = `WEB_COMPUTE` (NO solo `WEB`)
- [ ] Build settings tiene `appRoot: saas-aws-front`
- [ ] Variables de entorno configuradas (mínimo `NODE_ENV`)
- [ ] Último build fue exitoso (✅ verde)
- [ ] Redeploy manual realizado después de cambios
- [ ] Esperado al menos 10 minutos después del deploy
- [ ] Probado en modo incógnito
- [ ] Probado la URL exacta de Amplify (no una custom)

---

## 🆘 Si Nada de Esto Funciona

**Última opción: Recrear la aplicación**

1. **Borra la aplicación actual:**
   - Amplify Console → Tu app → App settings → General
   - Scroll down → **Delete app**

2. **Crea una nueva aplicación:**
   - Amplify Console → **New app** → **Host web app**
   - Conecta tu repositorio (GitHub/GitLab/etc)
   - Selecciona el repositorio
   - Selecciona la rama `feat/amplify`
   - **BUILD SETTINGS:**
     - Select **"I want to deploy a monorepo"**
     - App root directory: `saas-aws-front`
     - Build command: `npm run build`
     - Output directory: `.next`
   - **IMPORTANT:** En "Service role", selecciona una con permisos
   - Deploy

3. **Después del primer deploy:**
   - Ve a App settings → General
   - Cambia Platform a `WEB_COMPUTE`
   - Agrega variables de entorno
   - Redeploy

---

## 📞 Información para Soporte

Si necesitas pedir ayuda, proporciona:

```
1. Screenshot de:
   - App settings → General (Platform)
   - App settings → Build settings (completo)
   - Último build (estado: success/failed)

2. Logs del último build (completos)

3. Resultado de:
   curl -I https://feat-amplify.ds4d4dyzpxe96.amplifyapp.com/

4. Variables de entorno configuradas (sin valores sensibles)
```

---

**Siguiente paso:** Ve al PASO 1 y sigue la guía meticulosamente.
