'use client';

import { Toggle } from "@/components/ui/toggle";
import { KanbanIcon, LayoutListIcon } from "lucide-react";

type ViewMode = "board" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Toggle
        pressed={viewMode === "board"}
        onPressedChange={() => onViewChange("board")}
        variant="category"
        size="md"
      >
        <KanbanIcon className="size-4"/>
        Board
      </Toggle>
      <Toggle
        pressed={viewMode === "list"}
        onPressedChange={() => onViewChange("list")}
        variant="category"
        size="md"
      >
        <LayoutListIcon />
        List
      </Toggle>
    </div>
  );
};

export default ViewToggle; 