import { Badge } from "@/components/ui/badge";

interface DepartmentsFiltersProps {
  isDarkMode?: boolean;
}

export default function DepartmentsFilters({
  isDarkMode,
}: DepartmentsFiltersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Departments</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        Filter jobs by department or team.
      </p>
      <div className="space-y-2">
        <Badge
          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
          variant="outline"
        >
          Engineering
        </Badge>
        <Badge
          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
          variant="outline"
        >
          Product
        </Badge>
        <Badge
          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
          variant="outline"
        >
          Design
        </Badge>
        <Badge
          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
          variant="outline"
        >
          Marketing
        </Badge>
        <Badge
          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
          variant="outline"
        >
          Sales
        </Badge>
      </div>
    </div>
  );
}
