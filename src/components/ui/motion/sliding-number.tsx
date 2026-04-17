'use client';

import { cn } from '@/lib/utils';

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  className?: string;
};

/** Plain numeric display (no motion) for countdown / clocks. */
export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  className,
}: SlidingNumberProps) {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split('.');
  const integerValue = Number.parseInt(integerPart, 10);
  const paddedInteger =
    padStart && integerValue < 10 ? `0${integerPart}` : integerPart;

  return (
    <div className={cn('flex items-center tabular-nums leading-none', className)}>
      {value < 0 && '-'}
      <span>{paddedInteger}</span>
      {decimalPart ? (
        <>
          <span>{decimalSeparator}</span>
          <span>{decimalPart}</span>
        </>
      ) : null}
    </div>
  );
}
