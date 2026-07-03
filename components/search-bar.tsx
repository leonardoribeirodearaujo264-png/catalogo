"use client";

import { SearchIcon } from "@/components/icons";

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por nome, categoria ou descrição...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900"
      />
    </div>
  );
}
