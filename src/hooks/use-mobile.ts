import { useMediaQuery } from "@/hooks/useMediaQuery";

export function useIsMobile(mobileBreakpoint = 768) {
  return useMediaQuery(`(max-width: ${mobileBreakpoint - 1}px)`);
}
