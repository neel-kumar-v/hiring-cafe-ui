export interface LabelRadioProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  name?: string;
  hint?: string;
}

export default function LabelRadio({ label, checked, onChange, className, name, hint }: LabelRadioProps) {
  return (
    <label className={`group flex items-center gap-2 ${className ?? ""}`}>
      <input
        type="radio"
        name={name}
        className="size-4 appearance-none rounded-full border-2 border-border/70 transition-all duration-300 ease-out checked:border-primary checked:bg-primary group-hover:scale-125 dark:border-border dark:checked:border-primary dark:checked:bg-primary [&:not(:checked)]:dark:bg-muted"
        checked={checked}
        onChange={() => onChange(true)}
        onClick={(event) => {
          if (!checked) return;
          event.preventDefault();
          onChange(false);
        }}
      />
      <span className="cursor-default select-none text-base">
        {label}
        {hint ? (
          <>
            {" "}
            <span className="text-xs text-muted-foreground">{hint}</span>
          </>
        ) : null}
      </span>
    </label>
  );
}
