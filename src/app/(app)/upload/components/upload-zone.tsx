"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { useAuth } from "@/hooks/use-auth";
import { formatFileSize } from "@/lib/api";
import { getFileSizeErrorMessage } from "@/lib/utils/api-errors";
import {
  UploadCloud,
  X,
  File as FileIcon,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const BASE64_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

type FileWithStatus = {
  file: File;
  id: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
};

export function UploadZone() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const { uploadDocument, reset } = useDocumentUpload();

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: FileWithStatus[] = [];

    Array.from(newFiles).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: `${file.name}: ${getFileSizeErrorMessage(file.size, MAX_FILE_SIZE)}`,
        });
        return;
      }

      validFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: "pending",
        progress: 0,
      });
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "completed"));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo obtener el usuario actual.",
      });
      return;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileWithStatus.id ? { ...f, status: "uploading" as const } : f
      )
    );

    try {
      const document = await uploadDocument(fileWithStatus.file, user.id, (progress) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithStatus.id ? { ...f, progress } : f
          )
        );
      });

      if (document) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileWithStatus.id
              ? { ...f, status: "completed" as const, progress: 100 }
              : f
          )
        );

        toast({
          title: "Subida Exitosa",
          description: `${fileWithStatus.file.name} ha sido subido correctamente.`,
        });
      } else {
        throw new Error("No se pudo subir el archivo");
      }
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileWithStatus.id
            ? {
                ...f,
                status: "error" as const,
                error: error.message || "Error al subir el archivo",
              }
            : f
        )
      );

      toast({
        variant: "destructive",
        title: "Error al subir",
        description: `${fileWithStatus.file.name}: ${error.message || "Error desconocido"}`,
      });
    } finally {
      reset();
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
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

  const getUploadMethodLabel = (size: number) => {
    return size < BASE64_SIZE_LIMIT
      ? "Subida directa"
      : "Subida mediante URL prefirmada";
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-0">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDragOver
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
            onClick={() => document.getElementById("file-input-zone")?.click()}
          >
            <UploadCloud
              className={`h-20 w-20 transition-colors ${
                isDragOver ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <h3 className="mt-4 text-lg font-semibold">
              {isDragOver ? "Suelta los archivos aquí" : "Arrastra y suelta tus archivos"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              o haz clic para seleccionarlos desde tu computadora
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tamaño máximo por archivo: 5GB
            </p>
            <input
              type="file"
              id="file-input-zone"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
              multiple
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{uploadingCount}</div>
              <div className="text-xs text-muted-foreground">Subiendo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Completados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-muted-foreground">Errores</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Limpiar Completados
          </Button>
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={uploadingCount > 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar Todo
          </Button>
          <Button
            onClick={uploadAll}
            disabled={pendingCount === 0 || uploadingCount > 0}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Subir Todos ({pendingCount})
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {files.map((fileWithStatus) => (
                <div
                  key={fileWithStatus.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-card"
                >
                  <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {fileWithStatus.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileWithStatus.file.size)} •{" "}
                          {getUploadMethodLabel(fileWithStatus.file.size)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {fileWithStatus.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => uploadFile(fileWithStatus)}
                          >
                            Subir
                          </Button>
                        )}

                        {fileWithStatus.status === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}

                        {fileWithStatus.status === "error" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => uploadFile(fileWithStatus)}
                          >
                            Reintentar
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(fileWithStatus.id)}
                          disabled={fileWithStatus.status === "uploading"}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {fileWithStatus.status === "uploading" && (
                      <div className="space-y-1">
                        <Progress value={fileWithStatus.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Subiendo... {fileWithStatus.progress}%
                        </p>
                      </div>
                    )}

                    {fileWithStatus.status === "error" && fileWithStatus.error && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {fileWithStatus.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {files.length > 0 && completedCount === files.length && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            ¡Todos los archivos se han subido exitosamente!{" "}
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => router.push("/dashboard")}
            >
              Ver en Dashboard
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
