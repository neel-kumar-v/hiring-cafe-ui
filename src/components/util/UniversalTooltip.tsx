"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ReactElement } from "react";

interface UniversalTooltipProps {
  content: string;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  arrow?: boolean;
  blur?: boolean;
  removeOnMobile?: boolean;
}

export default function UniversalTooltip({
  content,
  children,
  side = "top",
  sideOffset = 14,
  align = "center",
  alignOffset = 0,
  arrow = false,
  blur = false,
  removeOnMobile = true
}: UniversalTooltipProps) {
  const isPointerCoarse = useMediaQuery("(pointer: coarse)");
  const isPointerNone = useMediaQuery("(pointer: none)");
  if (removeOnMobile && (isPointerCoarse || isPointerNone)) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={sideOffset} alignOffset={alignOffset} side={side} align={align} arrow={arrow} blur={blur}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
