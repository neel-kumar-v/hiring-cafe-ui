'use client';

import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { Edit3 } from 'lucide-react';
import { useState } from 'react';

type RangeSliderProps = {
  min?: number
  max?: number
  step?: number
  currency?: string
  value?: [number, number]
  onValueChange?: (values: [number, number]) => void
}

const RangeSlider = ({
  min = 0,
  max = 250000,
  step = 1000,
  currency = '$',
  value,
  onValueChange,
}: RangeSliderProps) => {
  const [internalValues, setInternalValues] = useState<[number, number]>([min, max]);
  const [editingMax, setEditingMax] = useState(false);
  const [tempMax, setTempMax] = useState(max.toString());
  const [maxValue, setMaxValue] = useState(max);

  const values = value ?? internalValues;

  const formatCurrency = (value: number) => {
    if (currency === 'None') return value.toString();

    const rounded = Math.round(value / 1000) * 1000;
    if (rounded >= 1_000_000) {
      const millions = rounded / 1_000_000;
      const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2).replace(/\.?0+$/, '');
      if (currency.length === 1) {
        return `${currency}${formatted}M`;
      } else {
        try {
          const parts = (0).toLocaleString('en-US', { style: 'currency', currency });
          const symbol = parts.replace(/\d|[.,\s]/g, '');
          return `${symbol}${formatted}M`;
        } catch {
          return `${currency}${formatted}M`;
        }
      }
    } else {
      if (currency.length === 1) {
        return `${currency}${rounded / 1000}K`;
      } else {
        try {
          const parts = (0).toLocaleString('en-US', { style: 'currency', currency });
          const symbol = parts.replace(/\d|[.,\s]/g, '');
          return `${symbol}${rounded / 1000}K`;
        } catch {
          return `${currency}${rounded / 1000}K`;
        }
      }
    }
  };

  // Helper to update values safely
  const updateValues = (newValues: [number, number]) => {
    if (onValueChange) {
      onValueChange(newValues);
    } else {
      setInternalValues(newValues);
    }
  };

  return (
    <>
      <DualRangeSlider
        className="w-full mt-10"
        label={value => (
          <span className="inline-flex items-center justify-center text-center text-foreground backdrop-blur-xl">
            {formatCurrency(value ?? 0)}
          </span>
        )}
        value={values}
        onValueChange={updateValues}
        min={min}
        max={maxValue}
        step={step}
      />
      <div className="flex w-full justify-between mt-2 text-xs text-muted-foreground select-none">
        <span>{formatCurrency(min)}</span>
        <span className="flex items-center gap-1 group">
          <span className="flex items-center">
            <Edit3 className="size-3 text-gray-400 opacity-0 group-hover:opacity-75 transition-opacity duration-200 mr-1" />
            {editingMax ? (
              <input
                type="text"
                value={tempMax}
                autoFocus
                onChange={e => setTempMax(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={() => {
                  const num = parseInt(tempMax, 10);
                  if (!isNaN(num) && num > min) {
                    setEditingMax(false);
                    setTempMax(num.toString());
                    setMaxValue(num);
                    updateValues([values[0], Math.min(values[1], num)]);
                  } else {
                    setTempMax(maxValue.toString());
                    setEditingMax(false);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const num = parseInt(tempMax, 10);
                    if (!isNaN(num) && num > min) {
                      setEditingMax(false);
                      setTempMax(num.toString());
                      setMaxValue(num);
                      updateValues([values[0], Math.min(values[1], num)]);
                    }
                  } else if (e.key === 'Escape') {
                    setTempMax(maxValue.toString());
                    setEditingMax(false);
                  }
                }}
                className="w-16 bg-transparent border-b border-muted-foreground outline-none text-xs text-right px-1"
              />
            ) : (
              <span
                className="cursor-pointer select-none border border-transparent hover:border-foreground/50 px-1.5 py-0.5 rounded transition-all duration-200 ease-in-out flex items-center"
                onClick={() => {
                  setEditingMax(true);
                  setTempMax(maxValue.toString());
                }}
              >
                {formatCurrency(maxValue)}
              </span>
            )}
          </span>
        </span>
      </div>
    </>
  );
};
export default RangeSlider;
