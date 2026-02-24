interface ErrorBannerProps {
  message: string;
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor" />
    </svg>
  );
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive rounded-[10px]"
      role="alert"
    >
      <div className="flex-shrink-0 text-destructive">
        <WarningIcon />
      </div>
      <p className="text-[14px] font-medium text-destructive">{message}</p>
    </div>
  );
}
