'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

export type MutationFeedbackVariant = 'success' | 'error';

interface MutationFeedbackMessage {
  id: number;
  text: string;
  variant: MutationFeedbackVariant;
}

interface MutationFeedbackContextValue {
  showFeedback: (text: string, variant?: MutationFeedbackVariant) => void;
}

const MutationFeedbackContext = createContext<MutationFeedbackContextValue | null>(
  null
);

const AUTO_DISMISS_MS = 4000;

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 16.17L5.33 12l-1.42 1.41L9.5 19 21 7.41 19.59 6 9.5 16.17z"
        fill="currentColor"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        fill="currentColor"
      />
    </svg>
  );
}

function MutationFeedbackToast({
  message,
  onDismiss,
}: {
  message: MutationFeedbackMessage | null;
  onDismiss: () => void;
}) {
  const labelId = useId();

  if (!message) {
    return null;
  }

  const isSuccess = message.variant === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby={labelId}
      className={cn(
        'fixed top-20 right-4 md:right-8 z-[60] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200',
        isSuccess
          ? 'bg-success/10 border-success/30 text-foreground'
          : 'bg-destructive/10 border-destructive text-destructive'
      )}
    >
      <span
        className={cn(
          'mt-0.5 shrink-0',
          isSuccess ? 'text-success' : 'text-destructive'
        )}
      >
        {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
      </span>
      <p id={labelId} className="text-sm font-medium leading-snug">
        {message.text}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          'ml-auto shrink-0 rounded-sm text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isSuccess ? 'text-foreground' : 'text-destructive'
        )}
        aria-label="Dismiss notification"
      >
        Close
      </button>
    </div>
  );
}

export function MutationFeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<MutationFeedbackMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage(null);
  }, []);

  const showFeedback = useCallback(
    (text: string, variant: MutationFeedbackVariant = 'success') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setMessage({ id: Date.now(), text, variant });
      timeoutRef.current = setTimeout(() => {
        setMessage(null);
        timeoutRef.current = null;
      }, AUTO_DISMISS_MS);
    },
    []
  );

  useEffect(() => dismiss, [dismiss]);

  return (
    <MutationFeedbackContext.Provider value={{ showFeedback }}>
      {children}
      <MutationFeedbackToast message={message} onDismiss={dismiss} />
    </MutationFeedbackContext.Provider>
  );
}

export function useMutationFeedback() {
  const context = useContext(MutationFeedbackContext);
  if (!context) {
    throw new Error('useMutationFeedback must be used within MutationFeedbackProvider');
  }
  return context;
}

export function mutationErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}
