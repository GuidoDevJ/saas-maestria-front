#!/bin/bash

# Setup S3 Deployment Script
# Este script configura automáticamente el bucket S3 y las políticas necesarias

set -e

echo "🚀 Setup S3 Deployment"
echo "======================"
echo ""

# Variables
read -p "Nombre del bucket S3 (ej: mi-app-frontend): " BUCKET_NAME
read -p "Región AWS (default: us-east-2): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-2}
read -p "Nombre del usuario IAM para deployment (default: github-actions-deployer): " IAM_USER
IAM_USER=${IAM_USER:-github-actions-deployer}

echo ""
echo "📝 Configuración:"
echo "  Bucket: $BUCKET_NAME"
echo "  Región: $AWS_REGION"
echo "  Usuario IAM: $IAM_USER"
echo ""

read -p "¿Continuar? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "❌ Cancelado"
  exit 0
fi

echo ""
echo "1️⃣ Creando bucket S3..."
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION || echo "⚠️  Bucket ya existe"

echo ""
echo "2️⃣ Configurando bucket como website estático..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html

echo ""
echo "3️⃣ Deshabilitando bloqueo de acceso público..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo ""
echo "4️⃣ Aplicando política del bucket..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file:///tmp/bucket-policy.json

echo ""
echo "5️⃣ Creando usuario IAM..."
aws iam create-user --user-name $IAM_USER 2>/dev/null || echo "⚠️  Usuario ya existe"

echo ""
echo "6️⃣ Aplicando política de deployment al usuario..."
cat > /tmp/iam-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$BUCKET_NAME",
        "arn:aws:s3:::$BUCKET_NAME/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-user-policy \
  --user-name $IAM_USER \
  --policy-name S3DeploymentPolicy \
  --policy-document file:///tmp/iam-policy.json

echo ""
echo "7️⃣ Creando access keys..."
KEYS=$(aws iam create-access-key --user-name $IAM_USER 2>/dev/null || echo "ERROR")

if [ "$KEYS" != "ERROR" ]; then
  ACCESS_KEY_ID=$(echo $KEYS | grep -o '"AccessKeyId": "[^"]*' | grep -o '[^"]*$')
  SECRET_ACCESS_KEY=$(echo $KEYS | grep -o '"SecretAccessKey": "[^"]*' | grep -o '[^"]*$')

  echo ""
  echo "✅ Setup completado!"
  echo ""
  echo "📋 Configuración para GitHub Secrets:"
  echo "======================================"
  echo ""
  echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
  echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
  echo "S3_BUCKET_NAME=$BUCKET_NAME"
  echo ""
  echo "⚠️  IMPORTANTE: Guarda estas credenciales de forma segura."
  echo "⚠️  No las compartas ni las subas a git."
  echo ""
else
  echo "⚠️  Las access keys ya existen. Usa las existentes o elimina las antiguas primero."
fi

echo ""
echo "🌐 URL del sitio web:"
echo "http://$BUCKET_NAME.s3-website.$AWS_REGION.amazonaws.com"
echo ""
echo "📚 Próximos pasos:"
echo "1. Agrega los secrets a GitHub: Settings → Secrets and variables → Actions"
echo "2. Configura las variables de entorno (NEXT_PUBLIC_*)"
echo "3. Haz push a main/master para deployar automáticamente"
echo ""
echo "💡 Para CloudFront (opcional pero recomendado):"
echo "   - Crea una distribución apuntando al bucket"
echo "   - Agrega el Distribution ID como secret: CLOUDFRONT_DISTRIBUTION_ID"
echo ""
