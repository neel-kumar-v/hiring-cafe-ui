import { Checkbox } from "@/components/ui/checkbox";
export interface LabelCheckboxProps {
  label: string;
  checked: boolean | "indeterminate";
  onChange: (checked: boolean | "indeterminate") => void;
  restrictLabelClick?: boolean;
}

export default function LabelCheckbox({ label, checked, onChange, restrictLabelClick }: LabelCheckboxProps) {
  if (restrictLabelClick) {
    return (
      <span className="flex items-center gap-2 group">
        <Checkbox className="accent-pink-600 size-4 group-hover:scale-125 transition-all duration-300 ease-out" checked={checked} onCheckedChange={onChange} onClick={e => e.stopPropagation()} />
        <span className="text-base select-none cursor-default">{label}</span>
      </span>
    );
  }
  return (
    <label className="flex items-center gap-2 group">
      <Checkbox className="accent-pink-600 size-4 group-hover:scale-125 transition-all duration-300 ease-out" checked={checked} onCheckedChange={onChange} />
      <span className="text-base ">{label}</span>
    </label>
  );
}