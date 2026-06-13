'use client';

import { MutationFeedbackProvider } from '@/components/mutation-feedback';

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return <MutationFeedbackProvider>{children}</MutationFeedbackProvider>;
}
