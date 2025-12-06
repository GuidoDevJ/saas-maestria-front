"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { FileUploadModal } from "./file-upload-modal";

export function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Subir Documento
      </Button>
      <FileUploadModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
