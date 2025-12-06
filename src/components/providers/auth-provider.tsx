"use client";

import React, { createContext, useState, useEffect } from 'react';
import type { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser, signOut as amplifySignOut, signInWithRedirect } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithHostedUI: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const router = useRouter();

  // Configurar Amplify en el cliente
  useEffect(() => {
    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!userPoolId || !clientId || !domain || !appUrl) {
      console.error('Missing Cognito configuration environment variables');
      setIsLoading(false);
      return;
    }

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: userPoolId,
          userPoolClientId: clientId,
          loginWith: {
            oauth: {
              domain: domain,
              scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
              redirectSignIn: [`${appUrl}/auth/callback`],
              redirectSignOut: [`${appUrl}/login`],
              responseType: 'code',
            },
          },
        },
      },
    }, { ssr: true });

    setIsConfigured(true);
  }, []);

  // Cargar usuario actual al montar
  useEffect(() => {
    if (!isConfigured) return;
    checkUser();

    // Escuchar eventos de autenticación de Amplify
    const hubListenerCancelToken = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in');
          checkUser();
          break;
        case 'signedOut':
          console.log('User signed out');
          setUser(null);
          localStorage.removeItem('user');
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          checkUser();
          break;
        case 'signInWithRedirect':
          console.log('Sign in with redirect');
          checkUser();
          break;
      }
    });

    return () => hubListenerCancelToken();
  }, [isConfigured]);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const idToken = session.tokens?.idToken;
      const payload = idToken?.payload;

      if (currentUser && payload) {
        const userData: User = {
          id: payload.sub as string,
          username: currentUser.username,
          email: payload.email as string,
          role: (payload['custom:role'] as Role) || 'Reader',
          token: idToken.toString(),
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithHostedUI = async () => {
    try {
      // Redirige a Cognito Hosted UI
      await signInWithRedirect();
    } catch (error) {
      console.error('Error signing in with Hosted UI:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    loginWithHostedUI,
    logout,
    hasRole,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
