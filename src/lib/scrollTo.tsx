import { RefObject, useEffect, useRef } from "react";

interface ScrollRefs {
  [key: string]: RefObject<HTMLDivElement | null>;
}

export function useScrollToSection(
  scrollToSection?: string,
  refs?: ScrollRefs,
  onComplete?: () => void
) {
  useEffect(() => {
    if (scrollToSection && refs) {
      const targetRef = refs[scrollToSection];
      if (targetRef?.current) {
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // targetRef.current.classList.add(
        //   "ring-2",
        //   "ring-pink-500",
        //   "ring-opacity-50"
        // );
        // setTimeout(() => {
        //   targetRef.current?.classList.remove(
        //     "ring-2",
        //     "ring-pink-500",
        //     "ring-opacity-50"
        //   );
        // }, 2000);
        onComplete?.();
      }
    }
  }, [onComplete, refs, scrollToSection]);
}

export function createRefs<T extends string>(keys: T[]): Record<T, RefObject<HTMLDivElement | null>> {
  const refs: Partial<Record<T, RefObject<HTMLDivElement | null>>> = {};
  keys.forEach(key => {
    refs[key] = useRef<HTMLDivElement>(null);
  });
  return refs as Record<T, RefObject<HTMLDivElement | null>>;
} 
