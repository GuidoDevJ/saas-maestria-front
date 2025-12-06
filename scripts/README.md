# Scripts de Utilidad

## update-user-role.js

Script para actualizar el rol de un usuario en AWS Cognito.

### Requisitos Previos

1. **Instalar dependencias de AWS SDK**:
   ```bash
   npm install @aws-sdk/client-cognito-identity-provider
   ```

2. **Configurar credenciales de AWS**:
   Tienes varias opciones:

   **Opción A: Variables de entorno**
   ```bash
   set AWS_ACCESS_KEY_ID=tu_access_key
   set AWS_SECRET_ACCESS_KEY=tu_secret_key
   set AWS_REGION=us-east-1
   ```

   **Opción B: AWS CLI configurado**
   ```bash
   aws configure
   ```

   **Opción C: Perfil de AWS**
   ```bash
   set AWS_PROFILE=tu_perfil
   ```

3. **Configurar el atributo personalizado en Cognito**:
   - Ve a AWS Cognito Console
   - Selecciona tu User Pool
   - Ve a "Sign-up experience" > "Attribute verification and user account confirmation"
   - En "Custom attributes", asegúrate de tener un atributo `custom:role` de tipo String

### Uso

```bash
node scripts/update-user-role.js <username> <role>
```

**Parámetros:**
- `username`: El username o email del usuario en Cognito
- `role`: Uno de los siguientes valores: `Admin`, `Editor`, `Reader`

### Ejemplos

```bash
# Hacer que user@example.com sea Admin
node scripts/update-user-role.js user@example.com Admin

# Hacer que otro usuario sea Editor
node scripts/update-user-role.js otro@example.com Editor

# Hacer que un usuario sea Reader (solo lectura)
node scripts/update-user-role.js viewer@example.com Reader
```

### Roles Disponibles

- **Admin**: Acceso completo - puede ver, editar y eliminar documentos
- **Editor**: Puede ver y editar documentos, pero no eliminar
- **Reader**: Solo puede ver documentos (lectura)

### Notas Importantes

⚠️ **El usuario debe cerrar sesión e iniciar sesión nuevamente** para que los cambios en el rol surtan efecto.

⚠️ Si obtienes un error `InvalidParameterException`, asegúrate de que el atributo `custom:role` esté creado en tu User Pool.

### Solución de Problemas

**Error: "UserNotFoundException"**
- Verifica que el username/email sea correcto
- Comprueba que el usuario exista en el User Pool

**Error: "NotAuthorizedException"**
- Verifica que tus credenciales de AWS estén configuradas correctamente
- Asegúrate de tener permisos para modificar usuarios en Cognito

**Error: "InvalidParameterException"**
- El atributo `custom:role` no existe en el User Pool
- Crea el atributo personalizado en la consola de Cognito

## Crear el Atributo Personalizado en Cognito

Si el atributo `custom:role` no existe:

1. Ve a AWS Cognito Console
2. Selecciona tu User Pool
3. Ve a "Sign-up experience"
4. En la sección "Custom attributes", click en "Add custom attribute"
5. Nombre: `role`
6. Tipo: String
7. Min length: 1, Max length: 20
8. Mutable: Yes
9. Click "Save"

**IMPORTANTE**: No puedes agregar atributos personalizados a un User Pool existente si ya tiene usuarios. En ese caso, necesitarás:
- Usar un User Pool nuevo, o
- Actualizar los atributos usando grupos de Cognito en lugar de atributos personalizados
