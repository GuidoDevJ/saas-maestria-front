/**
 * Script para actualizar el rol de un usuario en AWS Cognito
 *
 * Uso:
 * node scripts/update-user-role.js <username> <role>
 *
 * Ejemplo:
 * node scripts/update-user-role.js user@example.com Admin
 */

const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

if (!userPoolId) {
  console.error('❌ Error: NEXT_PUBLIC_COGNITO_USER_POOL_ID no está configurado');
  process.exit(1);
}

const username = process.argv[2];
const role = process.argv[3];

const validRoles = ['Admin', 'Editor', 'Reader'];

if (!username || !role) {
  console.log('❌ Error: Debes proporcionar username y role');
  console.log('\nUso:');
  console.log('  node scripts/update-user-role.js <username> <role>');
  console.log('\nEjemplo:');
  console.log('  node scripts/update-user-role.js user@example.com Admin');
  console.log('\nRoles válidos:', validRoles.join(', '));
  process.exit(1);
}

if (!validRoles.includes(role)) {
  console.log(`❌ Error: Role inválido "${role}"`);
  console.log('Roles válidos:', validRoles.join(', '));
  process.exit(1);
}

async function updateUserRole() {
  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      {
        Name: 'custom:role',
        Value: role,
      },
    ],
  });

  try {
    console.log(`\n🔄 Actualizando rol de usuario "${username}" a "${role}"...`);
    await client.send(command);
    console.log(`✅ Rol actualizado exitosamente!`);
    console.log(`\nEl usuario "${username}" ahora tiene el rol "${role}"`);
    console.log('\n⚠️  Nota: El usuario debe cerrar sesión e iniciar sesión nuevamente para que los cambios surtan efecto.');
  } catch (error) {
    console.error('❌ Error al actualizar el rol:', error.message);

    if (error.name === 'UserNotFoundException') {
      console.log('\n💡 Sugerencia: Verifica que el username/email sea correcto');
    } else if (error.name === 'InvalidParameterException') {
      console.log('\n💡 Sugerencia: Asegúrate de que el atributo custom:role esté configurado en tu User Pool');
    } else if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Sugerencia: Verifica tus credenciales de AWS');
    }

    process.exit(1);
  }
}

updateUserRole();
