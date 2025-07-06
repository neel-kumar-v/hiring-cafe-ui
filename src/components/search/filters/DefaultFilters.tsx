interface DefaultFiltersProps {
  categoryName: string;
  isDarkMode?: boolean;
}

export default function DefaultFilters({
  categoryName,
  isDarkMode,
}: DefaultFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{categoryName}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Settings for {categoryName.toLowerCase()} will be implemented here.
      </p>
      <div className="rounded-lg border-2 border-neutral-300 border-dashed p-8 text-center dark:border-neutral-600">
        <p className="text-neutral-500 dark:text-neutral-400">
          Content for {categoryName} will be added later
        </p>
      </div>
    </div>
  );
}
