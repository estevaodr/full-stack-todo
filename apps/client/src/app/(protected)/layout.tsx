import { ProtectedLayoutClient } from './protected-layout-client';
import { ProtectedShell } from './protected-shell';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedShell>
      <div className="flex min-h-screen flex-col">
        <ProtectedLayoutClient />
        <main className="flex-1 px-4 pb-32 pt-[calc(4rem+env(safe-area-inset-top,0px))] md:px-8">
          <div className="max-w-[960px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </ProtectedShell>
  );
}
