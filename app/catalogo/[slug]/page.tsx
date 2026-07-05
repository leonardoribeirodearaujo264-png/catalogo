"use client";

import { useMemo, useState } from "react";
import { useCatalogView } from "@/lib/catalog-view-context";
import { useInterestList } from "@/lib/interest-context";
import { HeroBanner } from "@/components/hero-banner";
import { CategoryTabs } from "@/components/category-tabs";
import { ViewToggle, type ViewMode } from "@/components/view-toggle";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import { ProductRail } from "@/components/product-rail";
import { ProductModal } from "@/components/product-modal";
import type { CatalogItem } from "@/types/catalog";

export default function CatalogHomePage() {
  const { catalog, categories, items, getCategory } = useCatalogView();
  const { addEntry } = useInterestList();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(catalog.layout === "lista" ? "list" : "grid");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [quickViewItem, setQuickViewItem] = useState<CatalogItem | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const watermark = catalog.businessName.slice(0, 10);
  const activeItems = useMemo(() => items.filter((i) => i.active), [items]);

  const isSearching = searchOpen && query.trim() !== "";
  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = query.trim().toLowerCase();
    return activeItems.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(q));
  }, [isSearching, query, activeItems]);

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.order - b.order), [categories]);

  const sections = useMemo(
    () =>
      sortedCategories
        .map((cat) => ({ category: cat, items: activeItems.filter((i) => i.categoryId === cat.id) }))
        .filter((s) => s.items.length > 0),
    [sortedCategories, activeItems],
  );

  const uncategorized = useMemo(() => activeItems.filter((i) => !getCategory(i.categoryId)), [activeItems, getCategory]);

  const activeCategory = activeCategoryId ? getCategory(activeCategoryId) : undefined;
  const filteredByCategory = activeCategoryId ? activeItems.filter((i) => i.categoryId === activeCategoryId) : [];

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAddToCart(item: CatalogItem, quantity: number) {
    addEntry({ catalogId: catalog.id, itemId: item.id, name: item.name, price: item.price }, quantity);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1000);
  }

  return (
    <div className="pb-8">
      <HeroBanner />

      <div className="py-3">
        <CategoryTabs
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
          searchActive={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
        />
      </div>

      {searchOpen && (
        <div className="px-4 pb-3">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar produtos e serviços..." />
        </div>
      )}

      <div className="flex justify-end px-4 pb-4">
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {isSearching ? (
        <div>
          <p className="mb-3 px-4 text-xs font-semibold text-gray-400">
            {searchResults.length} {searchResults.length === 1 ? "resultado" : "resultados"}
          </p>
          <ProductRail
            items={searchResults}
            getCategory={getCategory}
            watermark={watermark}
            mode={viewMode}
            expanded
            addedId={addedId}
            onOpen={setQuickViewItem}
            onAddToCart={handleAddToCart}
          />
        </div>
      ) : activeCategory ? (
        <div>
          <div className="mb-3 flex items-center gap-2 px-4">
            <span className="text-xl">{activeCategory.icon}</span>
            <h2 className="text-lg font-bold text-black">{activeCategory.name}</h2>
            <span className="text-sm text-gray-400">({filteredByCategory.length})</span>
          </div>
          <ProductRail
            items={filteredByCategory}
            getCategory={getCategory}
            watermark={watermark}
            mode={viewMode}
            expanded
            addedId={addedId}
            onOpen={setQuickViewItem}
            onAddToCart={handleAddToCart}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map(({ category, items: catItems }) => (
            <section key={category.id}>
              <SectionHeader
                title={category.name}
                count={catItems.length}
                expanded={!!expandedSections[category.id]}
                onToggle={() => toggleSection(category.id)}
              />
              <div className="mt-3">
                <ProductRail
                  items={catItems}
                  getCategory={getCategory}
                  watermark={watermark}
                  mode={viewMode}
                  expanded={!!expandedSections[category.id]}
                  addedId={addedId}
                  onOpen={setQuickViewItem}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              <SectionHeader
                title="Outros"
                count={uncategorized.length}
                expanded={!!expandedSections.outros}
                onToggle={() => toggleSection("outros")}
              />
              <div className="mt-3">
                <ProductRail
                  items={uncategorized}
                  getCategory={getCategory}
                  watermark={watermark}
                  mode={viewMode}
                  expanded={!!expandedSections.outros}
                  addedId={addedId}
                  onOpen={setQuickViewItem}
                  onAddToCart={handleAddToCart}
                />
              </div>
            </section>
          )}

          {sections.length === 0 && uncategorized.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
              <span className="text-4xl">🔎</span>
              <h3 className="text-lg font-bold text-gray-900">Nada por aqui ainda</h3>
              <p className="text-sm text-gray-500">Volte em breve para conferir novidades.</p>
            </div>
          )}
        </div>
      )}

      {quickViewItem && <ProductModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />}
    </div>
  );
}
