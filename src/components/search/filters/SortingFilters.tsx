interface SortingFiltersProps {
  isDarkMode?: boolean;
}

export default function SortingFilters({}: SortingFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Sorting Options</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Choose how to sort the job results.
      </p>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-medium text-sm">Sort by</label>
          <select className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
            <option value="relevance">Relevance</option>
            <option value="recent">Recent</option>
            <option value="salary">Salary</option>
            <option value="experience">Experience</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block font-medium text-sm">Order</label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center space-x-2">
              <input defaultChecked name="order" type="radio" value="asc" />
              <span>Ascending</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <input name="order" type="radio" value="desc" />
              <span>Descending</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
