"use client";

import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { KanbanIcon, LayoutListIcon } from "lucide-react";

type ViewMode = "board" | "list";

const VIEW_OPTIONS: readonly SlidingTabOption<ViewMode>[] = [
  {
    id: "board",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <KanbanIcon className="size-4" />
        Board
      </span>
    ),
  },
  {
    id: "list",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <LayoutListIcon className="size-4" />
        List
      </span>
    ),
  },
];

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return <SlidingTabs options={VIEW_OPTIONS} value={viewMode} onChange={onViewChange} size="md" ariaLabel="View mode" />;
};

export default ViewToggle;
