export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
      -{percent}%
    </span>
  );
}
