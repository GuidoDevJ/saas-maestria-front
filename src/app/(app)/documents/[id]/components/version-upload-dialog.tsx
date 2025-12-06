"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, FileUp } from "lucide-react";
import { uploadNewVersion } from "@/lib/services/version.service";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/api";

type Props = {
  documentId: string;
  onVersionUploaded: () => void;
};

export function VersionUploadDialog({ documentId, onVersionUploaded }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      await uploadNewVersion(
        documentId,
        file,
        comment || undefined,
        setProgress
      );

      toast({
        title: "Nueva versión subida",
        description: `La versión ${file.name} se ha subido correctamente.`,
      });

      // Reset and close
      setFile(null);
      setComment("");
      setProgress(0);
      setOpen(false);

      // Refresh versions list
      onVersionUploaded();
    } catch (error: any) {
      console.error("Error uploading version:", error);
      toast({
        variant: "destructive",
        title: "Error al subir versión",
        description: error.message || "No se pudo subir la nueva versión.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (!isUploading) {
      setFile(null);
      setComment("");
      setProgress(0);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Subir Nueva Versión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Nueva Versión</DialogTitle>
          <DialogDescription>
            Sube una nueva versión de este documento. Máximo 10 versiones por documento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="version-file">Archivo</Label>
            {!file ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById("version-file")?.click()}
              >
                <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click para seleccionar un archivo
                </p>
                <Input
                  id="version-file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Cambiar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="space-y-2">
            <Label htmlFor="version-comment">
              Comentario <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="version-comment"
              placeholder="Describe los cambios en esta versión..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Subiendo... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir Versión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
