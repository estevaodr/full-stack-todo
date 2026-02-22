import { ProtectedLayoutClient } from './protected-layout-client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ProtectedLayoutClient />
      <main className="flex-1 pt-24 pb-32 px-4 md:px-8">
        <div className="max-w-[960px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
