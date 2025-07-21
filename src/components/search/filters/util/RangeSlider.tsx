'use client';
import { SlidingNumber } from '@/components/ui/sliding-number';
import { Edit3 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  initialMin?: number;
  initialMax?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
}

export function RangeSlider({
  min = 0,
  max = 250000,
  step = 500,
  minDistance = 1000,
  initialMin = 60000,
  initialMax = 75000,
  label = 'Salary Range',
  prefix = '$',
  suffix = '',
}: RangeSliderProps) {
  const [sliderMin] = useState(min);
  const [sliderMax, setSliderMax] = useState(max);
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);
  const [editingRangeMax, setEditingRangeMax] = useState(false);
  const [tempRangeMaxValue, setTempRangeMaxValue] = useState(max.toString());
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlider, setActiveSlider] = useState<'min' | 'max' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartMin, setDragStartMin] = useState(0);
  const [dragStartMax, setDragStartMax] = useState(0);

  const handleMinChange = useCallback((value: number) => {
    const newMinValue = Math.min(value, maxValue - minDistance);
    setMinValue(newMinValue);
  }, [maxValue, minDistance]);

  const handleMaxChange = useCallback((value: number) => {
    const newMaxValue = Math.max(value, minValue + minDistance);
    setMaxValue(newMaxValue);
  }, [minValue, minDistance]);

  const handleRangeMaxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempRangeMaxValue(value);
  }, []);

  const handleRangeMaxInputBlur = useCallback(() => {
    const numValue = parseInt(tempRangeMaxValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numValue) && numValue > sliderMin) {
      setSliderMax(numValue);
      // Adjust current values if they're outside the new range
      if (maxValue > numValue) {
        setMaxValue(numValue);
      }
      if (minValue > numValue - minDistance) {
        setMinValue(numValue - minDistance);
      }
    }
    setEditingRangeMax(false);
    setTempRangeMaxValue(sliderMax.toString());
  }, [tempRangeMaxValue, sliderMin, minValue, maxValue, minDistance, sliderMax]);

  const handleRangeMaxInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRangeMaxInputBlur();
    } else if (e.key === 'Escape') {
      setEditingRangeMax(false);
      setTempRangeMaxValue(sliderMax.toString());
    }
  }, [handleRangeMaxInputBlur, sliderMax]);

  const getSliderFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return null;

    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const sliderWidth = rect.width;
    const clickPercentage = (clickX / sliderWidth) * 100;

    const minPercentage = ((minValue - sliderMin) / (sliderMax - sliderMin)) * 100;
    const maxPercentage = ((maxValue - sliderMin) / (sliderMax - sliderMin)) * 100;

    const distanceToMin = Math.abs(clickPercentage - minPercentage);
    const distanceToMax = Math.abs(clickPercentage - maxPercentage);

    return distanceToMin <= distanceToMax ? 'min' : 'max';
  }, [minValue, maxValue, sliderMin, sliderMax]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const targetSlider = getSliderFromPosition(e.clientX);
    if (!targetSlider) return;

    setActiveSlider(targetSlider);
    setDragStartX(e.clientX);
    setDragStartMin(minValue);
    setDragStartMax(maxValue);
  }, [getSliderFromPosition, minValue, maxValue]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!activeSlider || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const sliderWidth = rect.width;
    const deltaPercentage = (deltaX / sliderWidth) * 100;
    const deltaValue = (deltaPercentage / 100) * (sliderMax - sliderMin);
    const roundedDeltaValue = Math.round(deltaValue / step) * step;

    if (activeSlider === 'min') {
      const newMinValue = Math.max(sliderMin, Math.min(maxValue - minDistance, dragStartMin + roundedDeltaValue));
      setMinValue(newMinValue);
    } else {
      const newMaxValue = Math.min(sliderMax, Math.max(minValue + minDistance, dragStartMax + roundedDeltaValue));
      setMaxValue(newMaxValue);
    }
  }, [activeSlider, dragStartX, dragStartMin, dragStartMax, sliderMin, sliderMax, step, minValue, maxValue, minDistance]);

  const handleMouseUp = useCallback(() => {
    setActiveSlider(null);
  }, []);

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeSlider) return;

    const targetSlider = getSliderFromPosition(e.clientX);
    if (!targetSlider) return;

    const rect = sliderRef.current!.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const sliderWidth = rect.width;
    const clickPercentage = (clickX / sliderWidth) * 100;
    const targetValue = sliderMin + (clickPercentage / 100) * (sliderMax - sliderMin);
    const roundedValue = Math.round(targetValue / step) * step;

    if (targetSlider === 'min') {
      handleMinChange(roundedValue);
    } else {
      handleMaxChange(roundedValue);
    }
  }, [activeSlider, getSliderFromPosition, sliderMin, sliderMax, step, handleMinChange, handleMaxChange]);

  const minPercentage = ((minValue - sliderMin) / (sliderMax - sliderMin)) * 100;
  const maxPercentage = ((maxValue - sliderMin) / (sliderMax - sliderMin)) * 100;

  return (
    <div className='flex flex-col items-start gap-4 group'>
      <div className='flex items-center gap-2'>
        {label}:
      </div>
      
      <div className='flex items-center leading-none'>
        {prefix}
        <SlidingNumber value={minValue} className="mr-2" />
        {' - '}
        {prefix} 
        <SlidingNumber value={maxValue} className="ml-2" />
        {suffix}
      </div>

      <div className='relative w-full'>
        <div 
          ref={sliderRef}
          className='relative h-2 w-full rounded-full bg-gray-200 cursor-pointer'
          onClick={handleSliderClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className='absolute h-2 rounded-full bg-indigo-600'
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />
          
          <input
            type='range'
            value={minValue}
            min={sliderMin}
            max={sliderMax}
            step={(sliderMax - sliderMin) / step}
            onChange={(e) => handleMinChange(+e.target.value)}
            className='absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent pointer-events-none'
            style={{
              background: 'transparent',
            }}
          />
          
          <input
            type='range'
            value={maxValue}
            min={sliderMin}
            max={sliderMax}
            step={step}
            onChange={(e) => handleMaxChange(+e.target.value)}
            className='absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent pointer-events-none'
            style={{
              background: 'transparent',
            }}
          />
        </div>
        
        <div className='mt-2 flex justify-between text-xs text-gray-500'>
          <span>{prefix}{sliderMin.toLocaleString()}</span>
          <div className='relative group'>
            {editingRangeMax ? (
              <input
                type="text"
                value={tempRangeMaxValue}
                onChange={handleRangeMaxInputChange}
                onBlur={handleRangeMaxInputBlur}
                onKeyDown={handleRangeMaxInputKeyDown}
                className="w-16 bg-transparent border-none outline-none text-xs"
                autoFocus
              />
            ) : (
              <span 
                className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                onClick={() => {
                  setEditingRangeMax(true);
                  setTempRangeMaxValue(sliderMax.toString());
                }}
              >
                {prefix}{sliderMax.toLocaleString()}
              </span>
            )}
            <Edit3 className="absolute -top-1 -right-1 w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-75 transition-opacity duration-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SlidingNumberWithSlider() {
  return (
    <RangeSlider
      label="Current ARR"
      prefix="$"
      min={500}
      max={100000}
      step={50}
      minDistance={1000}
      initialMin={50000}
      initialMax={75000}
    />
  );
}
