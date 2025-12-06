import { PageHeader } from "../components/page-header";
import { DocumentClientWrapper } from "./components/document-client-wrapper";
import { UploadButton } from "./components/upload-button";
import { Can } from "@/components/auth/can";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard de Documentos"
        subtitle="Gestiona, visualiza y versiona tus documentos."
      >
        <Can perform={['Admin', 'Editor']}>
          <UploadButton />
        </Can>
      </PageHeader>
      <div className="flex-1 p-6 overflow-auto">
        <DocumentClientWrapper />
      </div>
    </>
  );
}
