"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { useAuth } from "@/hooks/use-auth";
import { formatFileSize } from "@/lib/api";
import { getFileSizeErrorMessage } from "@/lib/utils/api-errors";
import { UploadCloud, X, File as FileIcon, AlertCircle, CheckCircle2 } from "lucide-react";

type FileUploadModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  documentId?: string; // For uploading a new version
  onUploadComplete?: () => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const BASE64_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

export function FileUploadModal({ isOpen, onOpenChange, documentId, onUploadComplete }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadDocument, uploadProgress, status, error, reset } = useDocumentUpload();

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'Archivo demasiado grande',
          description: getFileSizeErrorMessage(selectedFile.size, MAX_FILE_SIZE)
        });
        return;
      }

      setFile(selectedFile);
      reset(); // Reset upload state
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo obtener el usuario actual.'
      });
      return;
    }

    const document = await uploadDocument(file, user.id);

    if (document) {
      toast({
        title: "Subida Exitosa",
        description: `${file.name} ha sido subido correctamente.`
      });

      // Wait a moment to show success state
      setTimeout(() => {
        setFile(null);
        reset();
        onOpenChange(false);

        // Call callback or refresh
        if (onUploadComplete) {
          onUploadComplete();
        } else {
          window.location.reload();
        }
      }, 1500);
    }
  };

  const handleCancel = () => {
    setFile(null);
    reset();
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      reset();
    }
  }, [isOpen, reset]);

  const isUploading = status === 'uploading' || status === 'processing';
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  const getUploadMethodLabel = () => {
    if (!file) return '';
    return file.size < BASE64_SIZE_LIMIT
      ? '(Subida directa)'
      : '(Subida mediante URL prefirmada)';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{documentId ? "Subir Nueva Versión" : "Subir Nuevo Documento"}</DialogTitle>
          <DialogDescription>
            Arrastra y suelta un archivo o haz clic para seleccionarlo. Tamaño máximo: 5GB
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {!file && (
             <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Arrastra y suelta, o haz clic aquí</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Archivos hasta 5GB
              </p>
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
            </div>
          )}

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} {getUploadMethodLabel()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-center text-muted-foreground">
                    {status === 'uploading' ? `Subiendo... ${uploadProgress}%` : 'Procesando...'}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {isCompleted && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Archivo subido exitosamente
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {hasError && error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUpload}
                disabled={isUploading || isCompleted || !file || !user}
                className="w-full"
              >
                {isUploading ? (
                  status === 'uploading' ? 'Subiendo...' : 'Procesando...'
                ) : isCompleted ? (
                  'Completado'
                ) : (
                  'Subir y Guardar'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
