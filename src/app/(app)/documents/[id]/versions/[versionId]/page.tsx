import { getDocumentById } from "@/lib/api";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/(app)/components/page-header";
import { DocumentViewer } from "./components/document-viewer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

// Marcar página como dinámicamente renderizada (necesario para rutas dinámicas)
export const dynamic = "force-dynamic";

type DocumentVersionPageProps = {
  params: { id: string; versionId: string };
};

export default async function DocumentVersionPage({ params }: DocumentVersionPageProps) {
  const document = await getDocumentById(params.id);
  const versionIdNum = parseInt(params.versionId, 10);

  if (!document || isNaN(versionIdNum)) {
    notFound();
  }

  const version = document.versions.find(v => v.version === versionIdNum);
  if (!version) {
    notFound();
  }
  
  return (
    <>
      <PageHeader
        title={document.name}
        subtitle={`Previsualizando versión ${version.version}`}
      >
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/documents/${document.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Detalles
                </Link>
            </Button>
            <Button asChild>
                <a href={version.url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                </a>
            </Button>
        </div>
      </PageHeader>
      <div className="flex-1 p-6 overflow-auto bg-muted/30">
        <DocumentViewer document={document} version={version} />
      </div>
    </>
  );
}
