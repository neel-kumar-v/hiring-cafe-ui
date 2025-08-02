"use client";

import { CircleHelp } from "lucide-react";
import { useState } from "react";


export default function FilterContainer({ children, title, help }: { children: React.ReactNode, title: string, help?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold flex items-center gap-2">
        {title} {help && (
            <CircleHelp className="size-4" onClick={() => setIsOpen(!isOpen)} />
        )}
      </p>
      <p
        className={`text-sm text-muted-foreground transition-all duration-300 overflow-hidden ${
          isOpen ? "opacity-100 max-h-12" : "opacity-0 max-h-0 my-0"
        }`}
      >
        {help}
      </p>
      {children}
    </div>
  );
}