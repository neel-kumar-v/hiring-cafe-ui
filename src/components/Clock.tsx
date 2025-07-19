'use client';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { useEffect, useState } from 'react';

interface ClockProps {
  targetDate?: Date;
}

export function Clock({ targetDate = new Date(new Date().setHours(23, 59, 59, 999)) }: ClockProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const target = targetDate || endOfDay;
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const remainingHours = Math.floor(diff / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

      setHours(remainingHours);
      setMinutes(remainingMinutes);
      setSeconds(remainingSeconds);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className='flex-col items-center hidden sm:flex'>
      <div className='flex items-center gap-0.5 px-2 text-sm'>
        <SlidingNumber value={hours} padStart={true} />
        <span className='text-zinc-500'>:</span>
        <SlidingNumber value={minutes} padStart={true} />
        <span className='text-zinc-500'>:</span>
        <SlidingNumber value={seconds} padStart={true} />
      </div>
      <div className='text-[8px] text-zinc-500'>refreshing in</div>
    </div>
  );
}
