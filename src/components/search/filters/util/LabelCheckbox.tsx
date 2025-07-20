import { Checkbox } from "@/components/ui/checkbox";

export default function LabelCheckbox({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean | "indeterminate") => void }) {
  return (
    <label className="flex items-center gap-2">
      <Checkbox className="accent-pink-600 size-4" checked={checked} onCheckedChange={onChange} />
      <span className="text-base">{label}</span>
    </label>
  );
}