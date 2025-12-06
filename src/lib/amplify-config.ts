import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [process.env.NEXT_PUBLIC_APP_URL + '/auth/callback'],
          redirectSignOut: [process.env.NEXT_PUBLIC_APP_URL + '/login'],
          responseType: 'code',
        },
      },
    },
  },
};

Amplify.configure(amplifyConfig, { ssr: true });

export default amplifyConfig;
