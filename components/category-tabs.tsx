"use client";

import { SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  searchActive,
  onToggleSearch,
}: {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  searchActive: boolean;
  onToggleSearch: () => void;
}) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
      <button
        type="button"
        onClick={onToggleSearch}
        aria-label="Buscar"
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
          searchActive ? "border-black bg-black text-white" : "border-[#E4E4E4] bg-white text-black",
        )}
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
          activeId === null ? "border-black bg-black text-white" : "border-[#E4E4E4] bg-white text-black",
        )}
      >
        Início
      </button>

      {sorted.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors",
            activeId === cat.id ? "border-black bg-black text-white" : "border-[#E4E4E4] bg-white text-black",
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
