"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalJobs === 1) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || totalJobs === 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only show indicator for horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      const direction = deltaX > 0 ? "right" : "left";
      setSwipeDirection(direction);
      // Calculate progress as percentage of 50px threshold
      setSwipeProgress(Math.min(Math.abs(deltaX) / 50, 1));
    } else {
      setSwipeDirection(null);
      setSwipeProgress(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || totalJobs === 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only trigger if horizontal swipe is more significant than vertical
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
  };

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Indicator Overlay */}
      {swipeDirection && (
        <div
          className={`absolute inset-0 flex items-center pointer-events-none z-10 transition-opacity duration-200 ${
            swipeProgress > 0.3 ? "opacity-100" : "opacity-0"
          } ${swipeDirection === "left" ? "justify-start" : "justify-end"}`}
        >
          <div
            className="flex items-center justify-center size-10 rounded-full bg-pink-400/10 backdrop-blur-sm border border-pink-400/20 transition-all duration-200"
            style={{
              transform: `scale(${0.8 + swipeProgress * 0.2})`,
            }}
          >
            {swipeDirection === "left" ? (
              <ChevronLeft className="size-6 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-6 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default CardSwipeIndicator;
