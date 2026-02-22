interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-[10px]"
      role="alert"
    >
      <div className="flex-shrink-0">
        <span className="material-symbols-outlined text-[20px] text-destructive leading-none">
          warning
        </span>
      </div>
      <p className="text-[14px] font-medium text-destructive">{message}</p>
    </div>
  );
}
