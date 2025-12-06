"use client";

import { useEffect, useState } from "react";
import type { Document, DocumentVersion } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Calendar,
  FileText,
  HardDrive,
  User,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatFileSize } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { listDocumentVersions, downloadVersion } from "@/lib/services/version.service";
import { VersionUploadDialog } from "./version-upload-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  document: Document;
  downloadUrl?: string;
};

export function VersionHistory({ document, downloadUrl }: Props) {
  const { toast } = useToast();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  const loadVersions = async () => {
    try {
      setIsLoadingVersions(true);
      setVersionsError(null);
      const response = await listDocumentVersions(document.documentId);
      setVersions(response.versions);
    } catch (error: any) {
      console.error("Error loading versions:", error);
      setVersionsError(error.message || "Error al cargar el historial de versiones");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [document.documentId]);

  const handleDownloadVersion = async (version: DocumentVersion) => {
    try {
      toast({
        title: "Descargando versi�n",
        description: `Preparando descarga de ${version.fileName}...`,
      });

      await downloadVersion(document.documentId, version.versionId);

      toast({
        title: "Descarga iniciada",
        description: `La versi�n ${version.versionNumber} se est� descargando.`,
      });
    } catch (error: any) {
      console.error("Error downloading version:", error);
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: error.message || "No se pudo descargar la versi�n.",
      });
    }
  };

  const handleVersionUploaded = () => {
    // Reload versions after a new version is uploaded
    loadVersions();
  };

  return (
    <div className="space-y-6">
      {/* Document Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informaci�n del Documento</CardTitle>
          <CardDescription>Detalles y metadatos del documento</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Nombre
                </dt>
                <dd className="text-sm mt-1">{document.fileName}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Tama�o
                </dt>
                <dd className="text-sm mt-1">{formatFileSize(document.fileSize)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Subido
                </dt>
                <dd className="text-sm mt-1">
                  {format(new Date(document.uploadedAt), "PPP", { locale: es })}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Usuario
                </dt>
                <dd className="text-sm mt-1">{document.userId}</dd>
              </div>
            </div>
          </dl>

          {downloadUrl && (
            <div className="mt-4 pt-4 border-t">
              <Button asChild className="w-full">
                <a href={downloadUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Versi�n Actual
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Versiones</CardTitle>
              <CardDescription>
                Todas las versiones de este documento (m�ximo 10)
              </CardDescription>
            </div>
            <VersionUploadDialog
              documentId={document.documentId}
              onVersionUploaded={handleVersionUploaded}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingVersions ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Cargando historial de versiones...
              </p>
            </div>
          ) : versionsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al cargar versiones</AlertTitle>
              <AlertDescription className="mt-2">
                {versionsError}
              </AlertDescription>
            </Alert>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No hay versiones adicionales para este documento.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Sube una nueva versi�n usando el bot�n de arriba.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.versionId}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={version.isActive ? "default" : "secondary"}>
                          Versi�n {version.versionNumber}
                        </Badge>
                        {version.isActive && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Activa
                          </Badge>
                        )}
                      </div>

                      <p className="font-medium text-sm mb-1 truncate">
                        {version.fileName}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(version.uploadedAt), "PPP p", {
                            locale: es,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatFileSize(version.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.uploadedBy}
                        </span>
                      </div>

                      {version.comment && (
                        <p className="text-sm text-muted-foreground italic mt-2">
                          "{version.comment}"
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadVersion(version)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles T�cnicos</CardTitle>
          <CardDescription>Informaci�n t�cnica del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Document ID
              </dt>
              <dd className="text-sm mt-1 font-mono">{document.documentId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                S3 Key
              </dt>
              <dd className="text-sm mt-1 font-mono break-all">
                {document.s3Key}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Estado
              </dt>
              <dd className="text-sm mt-1">
                <Badge variant={document.status === "completed" ? "default" : "secondary"}>
                  {document.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                MIME Type
              </dt>
              <dd className="text-sm mt-1 font-mono">{document.mimeType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Total de Versiones
              </dt>
              <dd className="text-sm mt-1">{versions.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                �ltima Actualizaci�n
              </dt>
              <dd className="text-sm mt-1">
                {format(new Date(document.updatedAt), "PPP p", { locale: es })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
