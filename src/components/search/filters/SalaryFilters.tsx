interface SalaryFiltersProps {
  isDarkMode?: boolean;
}

export default function SalaryFilters({ isDarkMode }: SalaryFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Salary Range</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Set your desired salary range.
      </p>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            className="w-24 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            placeholder="Min"
            type="number"
          />
          <span className="text-neutral-500">to</span>
          <input
            className="w-24 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            placeholder="Max"
            type="number"
          />
        </div>
      </div>
    </div>
  );
} 