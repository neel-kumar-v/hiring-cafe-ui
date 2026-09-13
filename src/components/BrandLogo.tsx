import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  wordmark?: string;
}

export function BrandLogo({
  className,
  iconClassName,
  showWordmark = false,
  wordmarkClassName,
  wordmark = "CloneCafe",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span className="w-fit rounded-full bg-primary p-2 text-primary-foreground">
        <svg
          aria-hidden="true"
          className={cn("h-5 w-5 flex-none", iconClassName)}
          data-slot="icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark ? <span className={cn("min-w-0 truncate font-bold text-primary", wordmarkClassName)}>{wordmark}</span> : null}
    </span>
  );
}
