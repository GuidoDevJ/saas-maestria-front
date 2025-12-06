/**
 * Document Status Badge Component
 * Displays visual indicator for document processing status
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import type { DocumentStatus } from '@/lib/types';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const statusConfig: Record<
    DocumentStatus,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon: React.ReactNode;
    }
  > = {
    pending: {
      label: 'Pendiente',
      variant: 'secondary',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    processing: {
      label: 'Procesando',
      variant: 'default',
      icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
    },
    completed: {
      label: 'Completado',
      variant: 'outline',
      icon: <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />,
    },
    failed: {
      label: 'Fallido',
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      <span className="flex items-center">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}
