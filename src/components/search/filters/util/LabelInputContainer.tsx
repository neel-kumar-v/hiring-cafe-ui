import { cn } from "@/lib/utils";

export interface LabelInputContainerProps {
  children: React.ReactNode;
  midColCount?: number;
  lgColCount?: number;
  title?: string;
}

export default function LabelInputContainer({ children, midColCount = 2, lgColCount = 4, title }: LabelInputContainerProps) {
  const midCols = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[midColCount] ?? "md:grid-cols-2";

  const lgCols = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  }[lgColCount] ?? "lg:grid-cols-4";

  return (
    <>
      {title && <p className="text-base font-semibold">{title}</p>}
      <div className={cn("grid grid-cols-1 gap-4", midCols, lgCols)}>
        {children}
      </div>
    </>
  );
}
