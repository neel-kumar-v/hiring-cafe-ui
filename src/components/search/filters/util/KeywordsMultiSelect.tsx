import { MultiSelect } from "@/components/ui/multi-select";
import { Keywords } from "@/types/search";

interface KeywordsMultiSelectProps {
  value: Keywords;
  onChange: (value: Keywords) => void;
  includeOptions: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  excludeOptions: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  includePlaceholder?: string;
  excludePlaceholder?: string;
  className?: string;
}

export function KeywordsMultiSelect({
  value,
  onChange,
  includeOptions,
  excludeOptions,
  includePlaceholder = "Include keywords",
  excludePlaceholder = "Exclude keywords",
  className,
}: KeywordsMultiSelectProps) {
  const handleIncludeChange = (includeValues: string[]) => {
    onChange({
      ...value,
      include: includeValues,
    });
  };

  const handleExcludeChange = (excludeValues: string[]) => {
    onChange({
      ...value,
      exclude: excludeValues,
    });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className || ""}`}>
      <div className="space-y-2">
        {/* <label className="text-sm font-medium text-foreground">Include</label> */}
        <MultiSelect
          options={includeOptions}
          value={Array.isArray(value.include) ? value.include : []}
          onValueChange={handleIncludeChange}
          placeholder={includePlaceholder}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        {/* <label className="text-sm font-medium text-foreground">Exclude</label> */}
        <MultiSelect
          options={excludeOptions}
          value={Array.isArray(value.exclude) ? value.exclude : []}
          onValueChange={handleExcludeChange}
          placeholder={excludePlaceholder}
          className="w-full"
        />
      </div>
    </div>
  );
} 