import { EditDocumentWrapper } from "./components/edit-document-wrapper";

// Marcar página como dinámicamente renderizada (necesario para rutas [id])
export const dynamic = "force-dynamic";

export default function EditDocumentPage() {
  return <EditDocumentWrapper />;
}
