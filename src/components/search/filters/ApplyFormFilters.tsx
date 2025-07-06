interface ApplyFormFiltersProps {
  isDarkMode?: boolean;
}

export default function ApplyFormFilters({
  isDarkMode,
}: ApplyFormFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Apply Form Type</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Choose your preferred application form type.
      </p>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center space-x-2">
          <input defaultChecked name="apply-form" type="radio" value="all" />
          <span>All apply forms</span>
        </label>
        <label className="flex cursor-pointer items-center space-x-2">
          <input name="apply-form" type="radio" value="simple" />
          <span>Simple apply forms</span>
        </label>
        <label className="flex cursor-pointer items-center space-x-2">
          <input name="apply-form" type="radio" value="time-consuming" />
          <span>Time consuming apply forms</span>
        </label>
      </div>
    </div>
  );
}
