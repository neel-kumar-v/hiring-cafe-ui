interface SavedSearchesFiltersProps {
  isDarkMode?: boolean;
}

export default function SavedSearchesFilters({}: SavedSearchesFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Saved Searches</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Manage your saved job searches and filters.
      </p>
      <div className="rounded-lg border-2 border-neutral-300 border-dashed p-8 text-center dark:border-neutral-600">
        <p className="text-neutral-500 dark:text-neutral-400">
          No saved searches yet. Create your first search to get started.
        </p>
      </div>
    </div>
  );
}
