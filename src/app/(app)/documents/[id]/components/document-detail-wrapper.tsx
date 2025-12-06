"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocumentById } from "@/lib/api";
import type { Document } from "@/lib/types";
import { PageHeader } from "../../../components/page-header";
import { VersionHistory } from "./version-history";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Loader2, AlertCircle } from "lucide-react";
import { UploadButton } from "../../../dashboard/components/upload-button";
import { Can } from "@/components/auth/can";
import { DeleteDocumentDialog } from "./delete-document-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DocumentDetailWrapper() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDocumentById(documentId, true);

        if (!response.document) {
          router.push("/404");
          return;
        }

        setDocument(response.document);
        setDownloadUrl(response.downloadUrl);
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
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
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
              {error || "El documento no existe o no tienes permisos para verlo."}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={document.fileName}
        subtitle="Gestiona el historial de versiones de este documento."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
          <Can perform={["Admin", "Editor"]}>
            <Button variant="outline" asChild>
              <Link href={`/documents/${documentId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </Can>
          <Can perform={["Admin"]}>
            <DeleteDocumentDialog
              documentId={document.documentId}
              documentName={document.fileName}
            />
          </Can>
          <Can perform={["Admin", "Editor"]}>
            <UploadButton />
          </Can>
        </div>
      </PageHeader>
      <div className="flex-1 p-6 overflow-auto">
        <VersionHistory document={document} downloadUrl={downloadUrl} />
      </div>
    </>
  );
}
