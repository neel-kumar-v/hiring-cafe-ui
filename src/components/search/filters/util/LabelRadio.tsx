export interface LabelRadioProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function LabelRadio({ label, checked, onChange, className }: LabelRadioProps) {
  return (
    <label className={`flex items-center gap-2 group ${className}`}>
      <input 
        type="radio" 
        className="size-4 group-hover:scale-125 transition-all duration-300 ease-out appearance-none border-2 border-border/70 rounded-full checked:bg-primary checked:border-primary dark:border-border dark:checked:bg-primary dark:checked:border-primary [&:not(:checked)]:dark:bg-muted" 
        checked={checked} 
        onChange={() => onChange(!checked)} 
      />
      <span className="text-base select-none cursor-default">{label}</span>
    </label>
  );
}

