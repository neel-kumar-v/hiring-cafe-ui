"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface CardSwipeIndicatorProps {
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  totalJobs: number;
  className?: string;
}

const CardSwipeIndicator = ({
  children,
  onNext,
  onPrevious,
  totalJobs,
  className = "",
}: CardSwipeIndicatorProps) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);

    return () => {
      window.removeEventListener("resize", checkTouchDevice);
    };
  }, []);

  if (!isTouchDevice || totalJobs === 1) {
    return <>{children}</>;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
    setSwipeProgress(0);
    setHasSwiped(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      const direction = deltaX > 0 ? "right" : "left";
      setSwipeDirection(direction);
      setSwipeProgress(Math.min(Math.abs(deltaX) / 50, 1));
      setHasSwiped(true);
    } else {
      setSwipeDirection(null);
      setSwipeProgress(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        onNext();
      } else {
        onPrevious();
      }
    }

    setTouchStart(null);
    setSwipeDirection(null);
    setSwipeProgress(0);

    if (hasSwiped) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className={`relative h-full ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {swipeDirection && (
        <div
          className={`absolute inset-0 flex items-center pointer-events-none z-10 transition-opacity duration-200 ${
            swipeProgress > 0.3 ? "opacity-100" : "opacity-0"
          } ${swipeDirection === "left" ? "justify-start" : "justify-end"}`}
        >
          <div
            className="flex items-center justify-center size-10 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/40/20 transition-all duration-200"
            style={{
              transform: `scale(${0.8 + swipeProgress * 0.2})`,
            }}
          >
            {swipeDirection === "left" ? (
              <ChevronLeft className="size-6 text-primary transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-6 text-primary transition-transform duration-200" />
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default CardSwipeIndicator;
