"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Document, DocumentStatus } from "@/lib/types";
import { updateDocumentStatus } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { formatFileSize } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type EditDocumentFormProps = {
  document: Document;
};

export function EditDocumentForm({ document }: EditDocumentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<DocumentStatus>(document.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateDocumentStatus(document.documentId, status);

      toast({
        title: "Documento actualizado",
        description: "El estado del documento se ha actualizado correctamente.",
      });

      router.push(`/documents/${document.documentId}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Información del Documento</CardTitle>
        <CardDescription>
          Actualiza el estado del documento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fileName">Nombre del Archivo</Label>
            <Input
              id="fileName"
              value={document.fileName}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileSize">Tamaño</Label>
            <Input
              id="fileSize"
              value={formatFileSize(document.fileSize)}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mimeType">Tipo de Archivo</Label>
            <Input
              id="mimeType"
              value={document.mimeType}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uploadedAt">Fecha de Subida</Label>
            <Input
              id="uploadedAt"
              value={format(new Date(document.uploadedAt), "PPP 'a las' p", { locale: es })}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DocumentStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
