"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger/client';

type LogContextType = {
  sessionId: string;
  traceId: string;
};

const LogContext = createContext<LogContextType | null>(null);

export function useLogContext() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogContext must be used within a LogProvider');
  }
  return context;
}

export function LogProvider({
  children,
  initialSessionId,
  initialTraceId,
}: {
  children: React.ReactNode;
  initialSessionId?: string;
  initialTraceId?: string;
}) {
  const [sessionId] = useState<string>(
    () => initialSessionId || crypto.randomUUID()
  );
  const [traceId] = useState<string>(
    () => initialTraceId || crypto.randomUUID()
  );

  useEffect(() => {
    // Inject context into the client logger
    logger.setBindings({
      sessionId,
      traceId,
    });
  }, [sessionId, traceId]);

  return (
    <LogContext.Provider value={{ sessionId, traceId }}>
      {children}
    </LogContext.Provider>
  );
}
