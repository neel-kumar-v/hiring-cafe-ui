import { Checkbox } from "@/components/ui/checkbox";

export interface LabelCheckboxProps {
  label: string;
  checked: boolean | "indeterminate";
  onChange: (checked: boolean | "indeterminate") => void;
  restrictLabelClick?: boolean;
  className?: string;
}

export default function LabelCheckbox({ label, checked, onChange, restrictLabelClick, className }: LabelCheckboxProps) {
  if (restrictLabelClick) {
    return (
      <span className="flex items-center gap-2 group">
        <Checkbox className="accent-pink-600 size-4 group-hover:scale-125 transition-all duration-300 ease-out" checked={checked} onCheckedChange={onChange} onClick={e => e.stopPropagation()} />
        <span className="text-base select-none cursor-default">{label}</span>
      </span>
    );
  }
  return (
    <label className={`flex items-center gap-2 group ${className}`}>
      <Checkbox className="accent-pink-600 size-4 group-hover:scale-125 transition-all duration-300 ease-out" checked={checked} onCheckedChange={onChange} />
      <span className="text-base select-none cursor-default">{label}</span>
    </label>
  );
}

