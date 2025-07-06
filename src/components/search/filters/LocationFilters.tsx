interface LocationFiltersProps {
  isDarkMode?: boolean;
}

export default function LocationFilters({}: LocationFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Location</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Filter jobs by location or work arrangement.
      </p>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-medium text-sm">
            Work Arrangement
          </label>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center space-x-2">
              <input
                defaultChecked
                name="work-arrangement"
                type="radio"
                value="all"
              />
              <span>All work arrangements</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <input name="work-arrangement" type="radio" value="remote" />
              <span>Remote</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <input name="work-arrangement" type="radio" value="on-site" />
              <span>On-site</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2">
              <input name="work-arrangement" type="radio" value="hybrid" />
              <span>Hybrid</span>
            </label>
          </div>
        </div>
        <div>
          <label className="mb-2 block font-medium text-sm">Location</label>
          <input
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            placeholder="Enter city, state, or country"
            type="text"
          />
        </div>
      </div>
    </div>
  );
}
