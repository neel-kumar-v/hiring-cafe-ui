"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";

export function cleanDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

const inputBaseClass = "w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden";

/** Extra props forwarded to the rendered number input. */
export type MinMaxInputProps = Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type" | "placeholder" | "className" | "ref">;

type MinMaxCommon = {
  title?: string;
  variant: "number" | "money";
  /** Required when variant is "money" */
  currencySymbol?: string;
  minLabel?: string;
  minPlaceholder: string;
  minValue: string;
  onChangeMinValue: (next: string) => void;
  /** Called on blur when per-field handlers are omitted */
  onBlurCommit?: () => void;
  onBlurMin?: () => void;
  onBlurMax?: () => void;
  /** Ref forwarded to the rendered input (used to focus/select the field). */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Extra props spread onto the rendered input. */
  inputProps?: MinMaxInputProps;
};

export type MinMaxPairProps = MinMaxCommon & {
  mode?: "pair";
  maxLabel?: string;
  maxPlaceholder: string;
  maxValue: string;
  onChangeMaxValue: (next: string) => void;
};

export type MinMaxSingleProps = MinMaxCommon & {
  mode: "single";
};

export type MinMaxProps = MinMaxPairProps | MinMaxSingleProps;

function Field({
  variant,
  currencySymbol,
  label,
  placeholder,
  value,
  onChangeValue,
  onBlur,
  inputRef,
  inputProps,
}: {
  variant: "number" | "money";
  currencySymbol?: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeValue: (next: string) => void;
  onBlur: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
  inputProps?: MinMaxInputProps;
}) {
  const handleChange = (raw: string) => {
    onChangeValue(cleanDigits(raw));
  };

  if (variant === "money") {
    const symbol = currencySymbol ?? "$";
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{symbol}</span>
          <Input
            ref={inputRef}
            className={`${inputBaseClass} pl-8`}
            inputMode="numeric"
            placeholder={placeholder}
            type="number"
            min={0}
            step={1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            {...inputProps}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <Input
        ref={inputRef}
        className={inputBaseClass}
        inputMode="numeric"
        placeholder={placeholder}
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={onBlur}
        {...inputProps}
      />
    </div>
  );
}

export default function MinMax(props: MinMaxProps) {
  const { title, variant, currencySymbol, minLabel = "Min", minPlaceholder, minValue, onChangeMinValue, onBlurCommit, onBlurMin, onBlurMax, inputRef, inputProps } = props;

  const blurMin = () => {
    (onBlurMin ?? onBlurCommit)?.();
  };
  const blurMax = () => {
    (onBlurMax ?? onBlurCommit)?.();
  };

  if (props.mode === "single") {
    return (
      <div>
        {title ? <div className="mb-1 text-base font-semibold">{title}</div> : null}
        <div className="grid grid-cols-1 gap-3">
          <Field
            variant={variant}
            currencySymbol={currencySymbol}
            label={minLabel}
            placeholder={minPlaceholder}
            value={minValue}
            onChangeValue={onChangeMinValue}
            onBlur={blurMin}
            inputRef={inputRef}
            inputProps={inputProps}
          />
        </div>
      </div>
    );
  }

  const { maxLabel = "Max", maxPlaceholder, maxValue, onChangeMaxValue } = props;

  return (
    <div>
      {title ? <div className="mb-1 text-base font-semibold">{title}</div> : null}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          variant={variant}
          currencySymbol={currencySymbol}
          label={minLabel}
          placeholder={minPlaceholder}
          value={minValue}
          onChangeValue={onChangeMinValue}
          onBlur={blurMin}
          inputRef={inputRef}
          inputProps={inputProps}
        />
        <Field
          variant={variant}
          currencySymbol={currencySymbol}
          label={maxLabel}
          placeholder={maxPlaceholder}
          value={maxValue}
          onChangeValue={onChangeMaxValue}
          onBlur={blurMax}
          inputRef={inputRef}
          inputProps={inputProps}
        />
      </div>
    </div>
  );
}
