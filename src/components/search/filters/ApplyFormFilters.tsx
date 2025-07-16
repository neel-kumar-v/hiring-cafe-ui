import { useState } from "react";

interface ApplyFormFiltersProps {
  isDarkMode?: boolean;
}

export default function ApplyFormFilters({}: ApplyFormFiltersProps) {
  const [selectedValue, setSelectedValue] = useState("all");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };

  const getLabelClasses = (value: string) => {
    const isSelected = selectedValue === value;
    const baseClasses =
      "flex cursor-pointer items-center space-x-2 border-2 rounded-md p-3 transition-all duration-300 ease-in-out";

    if (isSelected) {
      return `${baseClasses} bg-neutral-100 dark:bg-neutral-700 border-pink-400 dark:border-pink-400`;
    }

    return `${baseClasses} border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 dark:hover:border-pink-400/75 hover:border-pink-400`;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Apply Form Type</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Choose your preferred application form type.
      </p>
      <div className="space-y-2">
        <label className={getLabelClasses("all")}>
          <input
            checked={selectedValue === "all"}
            onChange={() => handleRadioChange("all")}
            name="apply-form"
            type="radio"
            value="all"
            className="hidden"
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
              All apply forms
            </span>
            <span className="text-neutral-700/50 dark:text-neutral-300/50 text-sm">
              All application forms - simple or time-consuming.
            </span>
          </div>
        </label>
        <label className={getLabelClasses("simple")}>
          <input
            checked={selectedValue === "simple"}
            onChange={() => handleRadioChange("simple")}
            name="apply-form"
            type="radio"
            value="simple"
            className="hidden"
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
              Simple apply forms
            </span>
            <span className="text-neutral-700/50 dark:text-neutral-300/50 text-sm">
              Application forms that don't require account creation.
            </span>
          </div>
        </label>
        <label className={getLabelClasses("time-consuming")}>
          <input
            checked={selectedValue === "time-consuming"}
            onChange={() => handleRadioChange("time-consuming")}
            name="apply-form"
            type="radio"
            value="time-consuming"
            className="hidden"
          />
          <div className="flex flex-col gap-y-2">
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
              Time consuming apply forms
            </span>
            <span className="text-neutral-700/50 dark:text-neutral-300/50 text-sm">
              Application forms that require account creation and/or resume
              formatting.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
