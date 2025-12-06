# Sistema de Gestión de Documentos - SaaS

Sistema completo de gestión de documentos con versionado, control de acceso basado en roles y almacenamiento en S3, construido con Next.js 15, AWS (S3, DynamoDB, API Gateway), y TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20DynamoDB-orange)

## Características Principales

- **Gestión de Documentos**: Subida, descarga, eliminación y versionado de documentos
- **Almacenamiento Dual**:
  - Base64 para archivos pequeños (<10MB)
  - Presigned URLs de S3 para archivos grandes (hasta 5GB)
- **Control de Acceso**: Sistema basado en roles (Admin, Editor, Reader)
- **Estados de Documentos**: Tracking de procesamiento (pending, processing, completed, failed)
- **UI Moderna**: Interfaz con Radix UI, Tailwind CSS y animaciones Framer Motion
- **Type-Safe**: TypeScript end-to-end con validación completa
- **Responsive**: Diseño adaptable a todos los dispositivos

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Despliegue](#despliegue)

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 15.3.3 (App Router)
- **UI**: React 18.3.1 + TypeScript 5
- **Estilos**: Tailwind CSS 3.4 + shadcn/ui
- **Componentes**: Radix UI
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Manejo de Estado**: React Hooks + Context API

### Backend (AWS)
- **Storage**: Amazon S3
- **Database**: Amazon DynamoDB
- **API**: AWS API Gateway + Lambda
- **Auth**: AWS Cognito (preparado, no implementado aún)
- **IaC**: AWS CDK

### Herramientas
- **Linting**: ESLint + Prettier
- **Package Manager**: npm
- **Local Testing**: LocalStack

---

## Requisitos Previos

- Node.js 18.0 o superior
- npm 9.0 o superior
- Docker Desktop (para LocalStack)
- AWS CLI configurado
- Cuenta de AWS (para despliegue en la nube)

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd saas-aws-front
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4566/restapis/{api-id}/local/_user_request_
NEXT_PUBLIC_API_ID=your-api-id
NEXT_PUBLIC_ENVIRONMENT=local

# AWS Cognito (opcional por ahora)
NEXT_PUBLIC_REGION=us-west-2
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
```

---

## Configuración

### Entorno Local con LocalStack

LocalStack simula servicios de AWS localmente.

#### 1. Iniciar LocalStack

```bash
npm run localstack:up
```

#### 2. Desplegar Backend

```bash
npm run cdk:deploy:local
```

El comando mostrará el API ID. Cópialo y actualiza tu `.env.local`:

```
Outputs:
DocumentStack.ApiId = abc123def456
```

#### 3. Actualizar .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:4566/restapis/abc123def456/local/_user_request_
NEXT_PUBLIC_API_ID=abc123def456
```

---

## Desarrollo

### Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en [http://localhost:9002](http://localhost:9002)

### Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta ESLint
npm run typecheck    # Verifica tipos TypeScript
```

### Usuario Mock por Defecto

Para testing local, usa estas credenciales:

- **Admin**: `admin` / cualquier contraseña
- **Editor**: `editor` / cualquier contraseña
- **Reader**: `reader` / cualquier contraseña

---

## Arquitectura

### Estructura del Proyecto

```
saas-aws-front/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (app)/               # Rutas autenticadas
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   └── documents/       # Detalle de documentos
│   │   ├── login/               # Autenticación
│   │   └── layout.tsx
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── auth/                # Auth guards y permisos
│   │   └── documents/           # Componentes de documentos
│   ├── lib/                     # Lógica de negocio
│   │   ├── config/              # Configuración
│   │   ├── services/            # Servicios de API
│   │   ├── utils/               # Utilidades
│   │   ├── api.ts               # Cliente HTTP
│   │   ├── types.ts             # Tipos TypeScript
│   │   └── cognito.ts           # Auth (mock)
│   └── hooks/                   # Custom React Hooks
├── .env.example                 # Template de variables de entorno
├── .env.local                   # Variables de entorno locales (git-ignored)
├── api-endpoints.json           # Documentación de API
├── TESTING.md                   # Guía de testing
└── README.md                    # Este archivo
```

### Flujo de Subida de Documentos

#### Archivos Pequeños (<10MB) - Base64

```
1. Usuario selecciona archivo
2. Frontend convierte a base64
3. POST /documents con fileContent
4. Backend guarda en S3 y DynamoDB
5. Responde con documento creado
```

#### Archivos Grandes (>=10MB) - Presigned URL

```
1. Usuario selecciona archivo
2. POST /documents/upload-url
3. Backend genera presigned URL de S3
4. Frontend sube directamente a S3 usando PUT
5. POST /documents/confirm
6. Backend registra en DynamoDB
```

### Diagrama de Estados de Documento

```
pending → processing → completed
                    → failed
```

- **pending**: Documento creado, esperando subida
- **processing**: Archivo siendo procesado/validado
- **completed**: Documento listo para usar
- **failed**: Error en procesamiento

---

## API Endpoints

El sistema expone los siguientes endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/documents` | Subir documento base64 (<10MB) |
| POST | `/documents/upload-url` | Generar presigned URL (>10MB) |
| POST | `/documents/confirm` | Confirmar subida directa a S3 |
| GET | `/documents/{id}` | Obtener documento por ID |
| GET | `/documents/user/{userId}` | Listar documentos de usuario |
| DELETE | `/documents/{id}` | Eliminar documento |
| PATCH | `/documents/{id}/status` | Actualizar estado |

Para detalles completos, consulta [api-endpoints.json](./api-endpoints.json)

---

## Testing

### Testing Local

Consulta la guía completa en [TESTING.md](./TESTING.md)

#### Quick Start

```bash
# 1. Iniciar LocalStack
npm run localstack:up

# 2. Desplegar backend
npm run cdk:deploy:local

# 3. Actualizar .env.local con API ID

# 4. Iniciar frontend
npm run dev

# 5. Probar en el navegador
open http://localhost:9002
```

#### Testing de Endpoints con curl

```bash
# Subir documento
curl -X POST 'http://localhost:4566/restapis/{api-id}/local/_user_request_/documents' \
  -H 'Content-Type: application/json' \
  -d '{
    "fileName":"test.txt",
    "mimeType":"text/plain",
    "fileContent":"SGVsbG8gV29ybGQK",
    "userId":"user-123"
  }'
```

---

## Despliegue

### Despliegue en AWS

#### 1. Configurar AWS Credentials

```bash
aws configure
```

#### 2. Desplegar Backend con CDK

```bash
npm run cdk:deploy:dev    # Para desarrollo
npm run cdk:deploy:staging # Para staging
npm run cdk:deploy:prod    # Para producción
```

#### 3. Actualizar Variables de Entorno

Copia el API ID del output de CDK y actualiza:

```env
NEXT_PUBLIC_ENVIRONMENT=prod
NEXT_PUBLIC_API_ID={api-id-de-produccion}
```

#### 4. Desplegar Frontend

##### Opción A: Vercel (Recomendado)

```bash
vercel --prod
```

##### Opción B: AWS Amplify

```bash
amplify publish
```

---

## Seguridad

### Consideraciones Actuales

- ⚠️ **Autenticación NO implementada en backend** - Solo preparado para JWT/Cognito
- ⚠️ **CORS configurado para desarrollo** - Ajustar para producción
- ✅ **HTTPS obligatorio en producción**
- ✅ **Presigned URLs con expiración**
- ✅ **Control de acceso basado en roles (frontend)**

### Para Producción

1. Implementar autenticación con AWS Cognito
2. Configurar CORS solo para dominios permitidos
3. Habilitar WAF en API Gateway
4. Implementar rate limiting
5. Agregar logging y monitoring con CloudWatch

---

## Roadmap

### v1.1 (Próximas funciones)
- [ ] Autenticación real con AWS Cognito
- [ ] Versionado de documentos
- [ ] Vista previa de documentos (PDF, imágenes)
- [ ] Compartir documentos con otros usuarios
- [ ] Notificaciones en tiempo real

---

## Tecnologías y Dependencias Principales

```json
{
  "next": "15.3.3",
  "react": "18.3.1",
  "typescript": "5.0",
  "tailwindcss": "3.4.1",
  "axios": "1.7.2",
  "framer-motion": "11.3.8",
  "react-hook-form": "7.54.2",
  "zod": "3.24.2"
}
```

---

## Troubleshooting

### El frontend no se conecta al backend

**Solución**: Verifica que:
1. LocalStack esté corriendo: `docker ps | grep localstack`
2. El API ID en `.env.local` sea correcto
3. El backend esté desplegado: `npm run cdk:deploy:local`

### Error "File too large"

**Solución**: Archivos >10MB deben usar presigned URL. El hook `useDocumentUpload` lo maneja automáticamente.

Para más troubleshooting, consulta [TESTING.md](./TESTING.md#troubleshooting)

---

## Changelog

### v1.0.0 (2025-11-24)
- Implementación inicial
- Sistema de subida de documentos (base64 y presigned URL)
- Dashboard con filtros y búsqueda
- Control de acceso basado en roles
- Estados de documentos (pending, processing, completed, failed)
- Integración con S3 y DynamoDB
- Documentación completa

---

**Happy Coding!** 🚀
