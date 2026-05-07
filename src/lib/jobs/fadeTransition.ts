import { cn } from "@/lib/utils";

export const JOB_FADE_DURATION_MS = 150;
export const JOB_FADE_BASE_CLASS = "transition-opacity duration-150 ease-in-out";

export const jobFadeClass = (isTransitioning: boolean) =>
  cn(JOB_FADE_BASE_CLASS, isTransitioning ? "opacity-0" : "opacity-100");
