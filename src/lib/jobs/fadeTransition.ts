import { cn } from "@/lib/utils";

export const JOB_FADE_DURATION_MS = 150;
export const JOB_FADE_BASE_CLASS = "transition-opacity duration-150 ease-in-out";

export const jobFadeClass = (isTransitioning: boolean) => cn(JOB_FADE_BASE_CLASS, isTransitioning ? "opacity-0" : "opacity-100");

/**
 * Variant of `jobFadeClass` for blocks that must stay visible during a transition.
 * Used for the card's company info, which does not change when navigating between
 * the jobs of the same company, so fading it out only causes a flicker.
 */
export const jobKeepVisibleClass = () => cn(JOB_FADE_BASE_CLASS, "opacity-100");
