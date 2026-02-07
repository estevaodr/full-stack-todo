import { ProtectedLayoutClient } from './protected-layout-client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ProtectedLayoutClient />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
