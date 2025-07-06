interface DateRangeFiltersProps {
  isDarkMode?: boolean;
}

export default function DateRangeFilters({
  isDarkMode,
}: DateRangeFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Date Range</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Filter jobs by posting date.
      </p>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            className="w-16 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            placeholder="3"
            type="number"
          />
          <select className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>
    </div>
  );
}
