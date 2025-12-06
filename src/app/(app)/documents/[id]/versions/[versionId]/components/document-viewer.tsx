"use client";

import type { Document, DocumentVersion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type DocumentViewerProps = {
  document: Document;
  version: DocumentVersion;
};

const mockTextContent = `# Esto es Markdown

## Características Clave

- **Listado de Documentos**: Visualiza todos los documentos con filtros.
- **Versionamiento**: Sube nuevas versiones y visualiza el historial.
- **Previsualización**: Vea PDFs, imágenes y texto directamente.

\`\`\`javascript
function helloWorld() {
  console.log("¡Hola, mundo desde el visualizador!");
}
\`\`\`
`;

export function DocumentViewer({ document, version }: DocumentViewerProps) {
  const renderContent = () => {
    switch (document.type) {
      case "PDF":
        return (
          <iframe
            src={version.url}
            className="w-full h-full border-0"
            title={document.name}
          />
        );
      case "Image":
        return (
          <div className="flex justify-center items-center h-full">
            <img src={version.url} alt={document.name} className="max-w-full max-h-full object-contain rounded-md shadow-lg" data-ai-hint="system architecture diagram" />
          </div>
        );
      case "MD":
      case "TXT":
        // For a real app, you'd use a Markdown renderer like 'react-markdown' for MD
        return (
          <Card>
            <CardHeader>
                <CardTitle>Contenido del Archivo</CardTitle>
            </CardHeader>
            <CardContent>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-background p-4 rounded-md">{mockTextContent}</pre>
            </CardContent>
          </Card>
        );
      case "DOCX":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center bg-background rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-2">Previsualización no disponible</h3>
            <p className="text-muted-foreground mb-4">
              El formato de archivo '{document.type}' no se puede previsualizar directamente en el navegador.
            </p>
            <Button asChild>
                <a href={version.url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar para ver
                </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto">
        {renderContent()}
    </div>
    );
}
