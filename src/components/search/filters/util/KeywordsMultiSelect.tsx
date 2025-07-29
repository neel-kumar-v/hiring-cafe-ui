import { MultiSelect } from "@/components/ui/multi-select";
import { Keywords } from "@/types/search";
import { useEffect, useState } from "react";

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

  const [showIncludeOptions, setShowIncludeOptions] = useState(includeOptions);
  const [showExcludeOptions, setShowExcludeOptions] = useState(excludeOptions);

  useEffect(() => {
    // Filter include options: remove any that are already in exclude list
    const filteredIncludeOptions = includeOptions.filter(
      option => !value.exclude.includes(option.value)
    );
    setShowIncludeOptions(filteredIncludeOptions);

    // Filter exclude options: remove any that are already in include list
    const filteredExcludeOptions = excludeOptions.filter(
      option => !value.include.includes(option.value)
    );
    setShowExcludeOptions(filteredExcludeOptions);
  }, [includeOptions, excludeOptions, value.include, value.exclude]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className || ""}`}>
      <div className="space-y-2">
        <MultiSelect
          options={showIncludeOptions}
          value={Array.isArray(value.include) ? value.include : []}
          onValueChange={handleIncludeChange}
          placeholder={includePlaceholder}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <MultiSelect
          options={showExcludeOptions}
          value={Array.isArray(value.exclude) ? value.exclude : []}
          onValueChange={handleExcludeChange}
          placeholder={excludePlaceholder}
          className="w-full"
        />
      </div>
    </div>
  );
} 