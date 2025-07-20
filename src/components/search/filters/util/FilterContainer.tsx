
export default function FilterContainer({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </div>
  );
}