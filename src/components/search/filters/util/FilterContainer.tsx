import UniversalTooltip from "@/components/util/UniversalTooltip";
import { CircleHelp } from "lucide-react";


export default function FilterContainer({ children, title, help }: { children: React.ReactNode, title: string, help?: string }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold flex items-center gap-2">
        {title} {help && (
          <UniversalTooltip content={help}>
            <CircleHelp className="size-4" />
          </UniversalTooltip>
        )}
      </p>
      {children}
    </div>
  );
}