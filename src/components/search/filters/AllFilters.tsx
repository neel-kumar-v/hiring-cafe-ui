interface AllFiltersProps {
  isDarkMode?: boolean;
}

export default function AllFilters({}: AllFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">All Filters</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Configure all your job search filters in one place.
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h4 className="font-medium mb-2">Job Filters</h4>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div>• Departments</div>
              <div>• Salary Range</div>
              <div>• Experience Level</div>
              <div>• Job Type</div>
              <div>• Location</div>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h4 className="font-medium mb-2">Company Filters</h4>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div>• Company Size</div>
              <div>• Industry</div>
              <div>• Funding Stage</div>
              <div>• Founding Year</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
