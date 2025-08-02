'use client';

import { Toggle } from "@/components/ui/toggle";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface CategoryToggleProps {
  category: JobCategory;
  isActive: boolean;
  onToggle: (category: JobCategory) => void;
}

const CategoryToggle = ({ category, isActive, onToggle}: CategoryToggleProps) => {
  const getCategoryLabel = (category: JobCategory) => {
    switch (category) {
      case "saved":
        return "Saved";
      case "applied":
        return "Applied";
      case "interviewing":
        return "Interviewing";
      case "rejected":
        return "Rejected";
      case "hidden":
        return "Hidden";
      default:
        return category;
    }
  };

  return (
    <Toggle
      pressed={isActive}
      onPressedChange={() => onToggle(category)}
      variant="category"
      size="md"
    >
      {getCategoryLabel(category)}
    </Toggle>
  );
};

export default CategoryToggle; 