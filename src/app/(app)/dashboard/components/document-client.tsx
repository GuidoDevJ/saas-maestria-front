"use client";

import { useState, useMemo } from 'react';
import type { Document } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileIcon } from '@/components/icons/file-icons';
import { DocumentActions } from './document-actions';
import { DocumentStatusBadge } from '@/components/documents/document-status-badge';
import { formatFileSize } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';

type DocumentClientProps = {
  initialDocuments: Document[];
};

export function DocumentClient({ initialDocuments }: DocumentClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.userId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(doc => filterStatus === 'All' || doc.status === filterStatus)
      .filter(doc => {
        if (filterType === 'All') return true;
        const ext = doc.fileName.split('.').pop()?.toLowerCase();
        return ext === filterType.toLowerCase();
      });
  }, [documents, searchTerm, filterStatus, filterType]);

  const statusOptions = ['All', 'pending', 'processing', 'completed', 'failed'];

  const fileTypes = useMemo(() => {
    const types = new Set(initialDocuments.map(d => d.fileName.split('.').pop()?.toLowerCase()).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [initialDocuments]);

  const handleDocumentDeleted = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.documentId !== docId));
  };

  const handleDocumentUpdated = () => {
    // In a real app, you would refetch the documents
    // For now, we'll just trigger a reload
    window.location.reload();
  };

  // Get mime type category for icon
  const getMimeTypeCategory = (mimeType: string): 'PDF' | 'Image' | 'TXT' | 'MD' | 'DOCX' | 'Other' => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.includes('text/plain')) return 'TXT';
    if (mimeType.includes('markdown')) return 'MD';
    if (mimeType.includes('wordprocessing')) return 'DOCX';
    return 'Other';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por nombre o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'All' ? 'Todos los estados' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type === 'All' ? 'Todos los tipos' : `.${type}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Subido</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <motion.tr
                    key={doc.documentId}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-accent/50"
                  >
                    <TableCell>
                      <FileIcon type={getMimeTypeCategory(doc.mimeType)} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{doc.mimeType}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      {format(new Date(doc.uploadedAt), "d MMM, yyyy 'a las' HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <DocumentStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DocumentActions
                        document={doc}
                        onDocumentDeleted={handleDocumentDeleted}
                        onDocumentUpdated={handleDocumentUpdated}
                      />
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No se encontraron documentos.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      {filteredDocuments.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Mostrando {filteredDocuments.length} de {documents.length} documento(s)
        </p>
      )}
    </div>
  );
}
