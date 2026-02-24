import { ThemeSelector } from '@/components/theme-selector';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 relative">
      {/* Theme selector — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSelector />
      </div>


      {children}

      {/* Background decorative blurs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
