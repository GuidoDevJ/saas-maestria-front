"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getDocumentsByUser } from "@/lib/api";
import type { Document } from "@/lib/types";
import { DocumentClient } from "./document-client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, FileX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DocumentClientWrapper() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getDocumentsByUser(user.id);
      setDocuments(response.documents);
    } catch (err: any) {
      console.error("Error loading documents:", err);
      setError(err.message || "Error al cargar los documentos");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar documentos</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={loadDocuments} className="w-fit">
            Intentar nuevamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileX className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
          <p className="text-muted-foreground text-center mb-4">
            Aún no has subido ningún documento. <br />
            Haz clic en "Subir Documentos" para empezar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <DocumentClient initialDocuments={documents} />;
}
