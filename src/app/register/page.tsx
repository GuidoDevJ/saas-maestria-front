"use client";

import { useState } from "react";
import Link from "next/link";
import { BookLock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithHostedUI } = useAuth();
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Redirige a Cognito Hosted UI (el usuario seleccionará "Sign up" ahí)
      await loginWithHostedUI();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al redirigir",
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
          <CardTitle className="text-3xl font-bold">Crear una Cuenta</CardTitle>
          <CardDescription>Únete a Versioned Tech Docs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRegister}
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
              "Crear Cuenta"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Serás redirigido a la página de registro segura de AWS Cognito
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> En la página de Cognito, haz clic en <strong>&quot;Sign up&quot;</strong> para crear tu cuenta.
            </p>
          </div>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
