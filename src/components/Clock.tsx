'use client';
import { SlidingNumber } from '@/components/ui/motion/sliding-number';
import { useEffect, useState } from 'react';

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export function Clock() {
  const [time, setTime] = useState<Time>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextEighthHour = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const nextEighth = Math.ceil((currentHour + 1) / 8) * 8 % 24;
      const target = new Date(now);
      target.setMinutes(0, 0, 0);
      target.setHours(nextEighth);
      if (nextEighth <= currentHour) {
        target.setDate(target.getDate() + 1);
      }
      return target;
    };

    const updateCountdown = () => {
      const now = new Date();
      const target = getNextEighthHour();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTime({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const remainingHours = Math.floor(diff / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ hours: remainingHours, minutes: remainingMinutes, seconds: remainingSeconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex-col items-center hidden sm:flex'>
      <div className='flex items-center gap-0.5 px-2 text-sm'>
        <SlidingNumber value={time.hours} padStart={true} />
        <span className='text-zinc-500'>:</span>
        <SlidingNumber value={time.minutes} padStart={true} />
        <span className='text-zinc-500'>:</span>
        <SlidingNumber value={time.seconds} padStart={true} />
      </div>
      <div className='text-[8px] text-zinc-500'>refreshing in</div>
    </div>
  );
}
