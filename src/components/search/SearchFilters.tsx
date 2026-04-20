import { Badge } from "@/components/ui/badge";
import { companyTags, legacyFilterTags } from "@/data/search-filters";

interface SearchFiltersProps {
  onIconClick?: (category: string) => void;
}

export default function SearchFilters({ onIconClick }: SearchFiltersProps) {
  const handleFilterClick = (filterName: string) => {
    onIconClick?.(filterName);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {legacyFilterTags.map((tag, index) => (
        <Badge
          className="cursor-pointer rounded-sm border-border/70 bg-background text-foreground/80 transition-all duration-300 hover:bg-secondary lg:text-md dark:border-border dark:bg-secondary dark:text-foreground/80 dark:hover:bg-accent"
          key={index}
          onClick={() => handleFilterClick(tag)}
          variant="outline"
        >
          {tag}
        </Badge>
      ))}
      {/* <span className="text-muted-foreground/25 dark:text-muted-foreground/25 text-2xl h-min leading-none">
        •
      </span> */}
      {companyTags.map((tag, index) => (
        <Badge
          className="cursor-pointer rounded-sm border-warning/30 bg-warning-soft text-warning-soft-foreground transition-all duration-300 hover:bg-warning-soft/80 lg:text-md"
          key={index}
          onClick={() => handleFilterClick(tag)}
          variant="outline"
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
