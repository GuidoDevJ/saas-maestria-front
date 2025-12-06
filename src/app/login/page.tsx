"use client";

import { useState } from "react";
import { BookLock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithHostedUI } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirige a Cognito Hosted UI
      await loginWithHostedUI();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4">
            <BookLock className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Versioned Tech Docs</CardTitle>
          <CardDescription>Inicia sesión para acceder a tus documentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Serás redirigido a una página segura de autenticación AWS Cognito
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-100 dark:bg-gray-900 px-2 text-muted-foreground">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          <p className="text-center text-sm">
            Haz clic en <strong>Iniciar Sesión</strong> y luego selecciona <strong>Sign up</strong> en la página de Cognito
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
