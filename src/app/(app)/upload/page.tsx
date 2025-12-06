import { PageHeader } from "../components/page-header";
import { UploadZone } from "./components/upload-zone";

export default function UploadPage() {
  return (
    <>
      <PageHeader
        title="Subir Documentos"
        subtitle="Arrastra y suelta tus archivos aquí o haz clic para seleccionarlos"
      />
      <div className="flex-1 p-6 overflow-auto">
        <UploadZone />
      </div>
    </>
  );
}
