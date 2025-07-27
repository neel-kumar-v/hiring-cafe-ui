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
        className="size-4 group-hover:scale-125 transition-all duration-300 ease-out appearance-none border-2 border-gray-300 rounded-full checked:bg-pink-600 checked:border-pink-600 dark:border-gray-600 dark:checked:bg-pink-600 dark:checked:border-pink-600 [&:not(:checked)]:dark:bg-gray-700" 
        checked={checked} 
        onChange={() => onChange(!checked)} 
      />
      <span className="text-base select-none cursor-default">{label}</span>
    </label>
  );
}

