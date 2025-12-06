#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🔍 Validación Pre-Deploy para Amplify"
echo "========================================="
echo ""

# Contador de errores
ERRORS=0
WARNINGS=0

# 1. Verificar Node.js version
echo "📦 Verificando Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js version debe ser >= 18. Actual: $(node -v)"
    ((ERRORS++))
fi
echo ""

# 2. Verificar variables de entorno requeridas
echo "🔐 Verificando variables de entorno..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_AWS_REGION"
    "NEXT_PUBLIC_USER_POOL_ID"
    "NEXT_PUBLIC_COGNITO_CLIENT_ID"
    "NEXT_PUBLIC_COGNITO_DOMAIN"
    "NEXT_PUBLIC_APP_URL"
    "NEXT_PUBLIC_API_URL"
)

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo -e "${YELLOW}⚠${NC} $VAR no está definida (debe configurarse en Amplify Console)"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓${NC} $VAR está definida"
    fi
done
echo ""

# 3. Verificar que no hay output: 'export' en next.config.ts
echo "⚙️  Verificando next.config.ts..."
if grep -q "output.*:.*['\"]export['\"]" next.config.ts 2>/dev/null; then
    echo -e "${RED}✗${NC} next.config.ts tiene 'output: export' - incompatible con SSR"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} next.config.ts no tiene 'output: export'"
fi
echo ""

# 4. Verificar dependencias instaladas
echo "📚 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} node_modules no encontrado. Ejecutando npm install..."
    npm install
fi
echo -e "${GREEN}✓${NC} Dependencias instaladas"
echo ""

# 5. Verificar TypeScript
echo "🔧 Ejecutando TypeScript check..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript check pasó"
else
    echo -e "${YELLOW}⚠${NC} TypeScript tiene errores (configurado para ignorar en build)"
    ((WARNINGS++))
fi
echo ""

# 6. Verificar ESLint
echo "📝 Ejecutando ESLint check..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} ESLint check pasó"
else
    echo -e "${YELLOW}⚠${NC} ESLint tiene warnings (configurado para ignorar en build)"
    ((WARNINGS++))
fi
echo ""

# 7. Verificar build
echo "🏗️  Ejecutando build de Next.js..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Build completado exitosamente"
else
    echo -e "${RED}✗${NC} Build falló"
    ((ERRORS++))
fi
echo ""

# 8. Verificar que amplify.yml existe
echo "📋 Verificando amplify.yml..."
if [ -f "../amplify.yml" ]; then
    echo -e "${GREEN}✓${NC} amplify.yml encontrado"
else
    echo -e "${RED}✗${NC} amplify.yml no encontrado en la raíz del proyecto"
    ((ERRORS++))
fi
echo ""

# Resumen final
echo "========================================="
echo "📊 Resumen de Validación"
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los checks críticos pasaron${NC}"
else
    echo -e "${RED}✗ $ERRORS error(es) crítico(s) encontrado(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s) encontrada(s)${NC}"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Proyecto listo para desplegar en Amplify!${NC}"
    exit 0
else
    echo -e "${RED}❌ Por favor corrige los errores antes de desplegar${NC}"
    exit 1
fi
