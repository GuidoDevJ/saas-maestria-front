"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Download, Trash2, Loader2, RefreshCw } from "lucide-react";
import type { Document, DocumentStatus } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Can } from "@/components/auth/can";
import { useToast } from "@/hooks/use-toast";
import { deleteDocument, getDocument, updateDocumentStatus } from "@/lib/services/document.service";
import { getErrorMessage } from "@/lib/utils/api-errors";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DocumentActionsProps = {
  document: Document;
  onDocumentDeleted: (docId: string) => void;
  onDocumentUpdated?: () => void;
};

export function DocumentActions({ document, onDocumentDeleted, onDocumentUpdated }: DocumentActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewDetails = () => {
    router.push(`/documents/${document.documentId}`);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch document with download URL
      const response = await getDocument(document.documentId, true);

      if (response.downloadUrl) {
        // Open download URL in new tab
        window.open(response.downloadUrl, '_blank');
        toast({
          title: 'Descarga iniciada',
          description: `Descargando "${document.fileName}"`
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo obtener la URL de descarga.'
        });
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Error al descargar',
        description: errorMsg
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleChangeStatus = async (newStatus: DocumentStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateDocumentStatus(document.documentId, newStatus);
      toast({
        title: 'Estado actualizado',
        description: `El estado del documento ha sido actualizado a "${newStatus}".`
      });

      if (onDocumentUpdated) {
        onDocumentUpdated();
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(document.documentId);
      toast({
        title: 'Documento eliminado',
        description: `"${document.fileName}" ha sido eliminado.`
      });
      onDocumentDeleted(document.documentId);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      toast({
        variant: 'destructive',
        title: 'Error al eliminar',
        description: errorMsg
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const statusOptions: DocumentStatus[] = ['pending', 'processing', 'completed', 'failed'];
  const statusLabels: Record<DocumentStatus, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownload} disabled={isDownloading || document.status !== 'completed'}>
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar
          </DropdownMenuItem>

          <Can perform={['Admin']}>
            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger disabled={isUpdatingStatus}>
                {isUpdatingStatus ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Cambiar Estado
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel className="text-xs">Estado actual: {statusLabels[document.status]}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleChangeStatus(status)}
                    disabled={status === document.status || isUpdatingStatus}
                  >
                    {statusLabels[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el documento "{document.fileName}" de S3 y DynamoDB.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
