"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocumentById } from "@/lib/api";
import type { Document } from "@/lib/types";
import { PageHeader } from "../../../../components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { EditDocumentForm } from "./edit-document-form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function EditDocumentWrapper() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDocumentById(documentId);

        if (!response.document) {
          router.push("/404");
          return;
        }

        setDocument(response.document);
      } catch (err: any) {
        console.error("Error loading document:", err);
        setError(err.message || "Error al cargar el documento");
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId, router]);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Cargando..." subtitle="Obteniendo detalles del documento">
          <Button variant="outline" asChild>
            <Link href={`/documents/${documentId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Documento
            </Link>
          </Button>
        </PageHeader>
        <div className="flex-1 p-6 overflow-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando documento...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error || !document) {
    return (
      <>
        <PageHeader title="Error" subtitle="No se pudo cargar el documento">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </PageHeader>
        <div className="flex-1 p-6 overflow-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al cargar documento</AlertTitle>
            <AlertDescription className="mt-2">
              {error || "El documento no existe o no tienes permisos para editarlo."}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Editar: ${document.fileName}`}
        subtitle="Actualiza la información del documento"
      >
        <Button variant="outline" asChild>
          <Link href={`/documents/${documentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Documento
          </Link>
        </Button>
      </PageHeader>
      <div className="flex-1 p-6 overflow-auto">
        <EditDocumentForm document={document} />
      </div>
    </>
  );
}
