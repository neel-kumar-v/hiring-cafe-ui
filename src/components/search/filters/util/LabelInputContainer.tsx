export interface LabelInputContainerProps {
  children: React.ReactNode;
  midColCount?: number;
  lgColCount?: number;
}

export default function LabelInputContainer({ children, midColCount = 2, lgColCount = 4 }: LabelInputContainerProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${midColCount} lg:grid-cols-${lgColCount} gap-4`}>
      {children}
    </div>
  );
}
