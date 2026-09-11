import { useEffect, useState, useCallback } from "react";
import { marketplaceService } from "../services/marketplaceService";
import type { Category } from "../types/marketplace";

interface MarketplaceSidebarProps {
  selectedCategory?: number;
  onSelectCategory: (categoryId?: number) => void;
}

export const MarketplaceSidebar = ({ selectedCategory, onSelectCategory }: MarketplaceSidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [subcategories, setSubcategories] = useState<Map<number, Category[]>>(new Map());
  const [loadingSubs, setLoadingSubs] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await marketplaceService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const toggleExpand = useCallback(async (catId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
        if (!subcategories.has(catId)) {
          setLoadingSubs(prev => new Set(prev).add(catId));
          marketplaceService.getSubcategories(catId)
            .then(subs => {
              setSubcategories(prev => new Map(prev).set(catId, subs));
            })
            .catch(() => {})
            .finally(() => {
              setLoadingSubs(prev => {
                const next = new Set(prev);
                next.delete(catId);
                return next;
              });
            });
        }
      }
      return next;
    });
  }, [subcategories]);

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div>
          <h3 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3 px-3">Categorías</h3>
          <nav className="flex flex-col gap-0.5">
            <button
              onClick={() => onSelectCategory(undefined)}
              className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all font-medium ${selectedCategory === undefined
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              Todos los productos
            </button>

            {categories.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const isSelected = selectedCategory === cat.id;
              const catSubs = subcategories.get(cat.id);
              const isLoading = loadingSubs.has(cat.id);

              return (
                <div key={cat.id}>
                  <div className={`flex items-center rounded-lg transition-all ${isSelected ? "bg-blue-50" : "hover:bg-slate-100"}`}>
                    <button
                      onClick={() => onSelectCategory(cat.id)}
                      className={`flex-1 px-3 py-2.5 text-sm text-left font-medium ${isSelected ? "text-blue-600" : "text-slate-600"}`}
                    >
                      {cat.nombre}
                    </button>
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="px-2 py-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                        expand_more
                      </span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-3 pl-3 border-l-2 border-slate-100 mt-0.5 mb-1">
                      {isLoading ? (
                        <div className="py-2 px-3 text-xs text-slate-400">Cargando...</div>
                      ) : catSubs && catSubs.length > 0 ? (
                        catSubs.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => onSelectCategory(sub.id)}
                            className={`w-full px-3 py-2 rounded-lg text-xs text-left transition-all ${selectedCategory === sub.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                              }`}
                          >
                            {sub.nombre}
                          </button>
                        ))
                      ) : (
                        <div className="py-2 px-3 text-xs text-slate-400">Sin subcategorías</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="h-px bg-slate-200 my-2" />

            <button
              onClick={() => onSelectCategory(-1)}
              className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all flex items-center gap-2 font-medium ${selectedCategory === -1
                ? "bg-orange-50 text-orange-600"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">pets</span>
              Adopciones
            </button>

            <button
              onClick={() => onSelectCategory(-2)}
              className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all flex items-center gap-2 font-medium ${selectedCategory === -2
                ? "bg-teal-50 text-teal-600"
                : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
              Servicios Médicos
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};
