"use client";

import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/lib/types';

interface CanProps {
  children: React.ReactNode;
  perform: Role[];
}

export function Can({ children, perform }: CanProps) {
  const { hasRole } = useAuth();

  if (!hasRole(perform)) {
    return null;
  }

  return <>{children}</>;
}
