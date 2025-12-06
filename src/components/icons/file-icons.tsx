import { File, FileText, FileImage, FileCode, FileQuestion } from 'lucide-react';
import type { Document } from '@/lib/types';

type FileIconProps = {
  type: Document['type'];
  className?: string;
};

export function FileIcon({ type, className }: FileIconProps) {
  const commonClass = "h-6 w-6 text-secondary-foreground";
  const finalClassName = `${commonClass} ${className || ''}`;

  switch (type) {
    case 'PDF':
      return <FileText className={finalClassName} color="#E53E3E" />;
    case 'Image':
      return <FileImage className={finalClassName} color="#48BB78" />;
    case 'DOCX':
      return <File className={finalClassName} color="#4299E1" />;
    case 'MD':
      return <FileCode className={finalClassName} color="#4A5568" />;
    case 'TXT':
      return <FileText className={finalClassName} color="#A0AEC0" />;
    default:
      return <FileQuestion className={finalClassName} />;
  }
}
