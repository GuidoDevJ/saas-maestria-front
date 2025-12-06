import { DocumentDetailWrapper } from "./components/document-detail-wrapper";

// Marcar página como dinámicamente renderizada (necesario para rutas [id])
export const dynamic = "force-dynamic";

export default function DocumentDetailPage() {
  return <DocumentDetailWrapper />;
}
