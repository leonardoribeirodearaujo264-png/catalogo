export function SectionHeader({
  title,
  count,
  expanded,
  onToggle,
}: {
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-baseline gap-3 px-4">
      <h2 className="text-lg font-bold text-black">{title}</h2>
      <button type="button" onClick={onToggle} className="text-sm font-medium text-black underline underline-offset-2">
        {expanded ? "Ver menos" : `Ver tudo (${count})`}
      </button>
    </div>
  );
}
