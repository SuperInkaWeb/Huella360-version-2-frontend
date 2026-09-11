import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { Category } from "../../features/catalog/types/category";

interface CategoryComboboxProps {
  categories: Category[];
  value: number | null;
  onChange: (id: number) => void;
  error?: string;
}

export const CategoryCombobox = ({ categories, value, onChange, error }: CategoryComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find(c => c.id === value);

  const grouped = useMemo(() => {
    let filtered = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = categories.filter(c => c.nombre.toLowerCase().includes(q));
    }

    const parentsToShow = filtered.filter(c => !c.padreId);
    const childrenToShow = filtered.filter(c => c.padreId);

    const groups: { parent: Category; children: Category[] }[] = [];

    for (const parent of parentsToShow) {
      const kids = childrenToShow.filter(c => c.padreId === parent.id);
      groups.push({ parent, children: kids });
    }

    const orphans = childrenToShow.filter(c => !parentsToShow.some(p => p.id === c.padreId));
    if (orphans.length > 0) {
      groups.push({ parent: { id: 0, nombre: "Otros", slug: "", activo: true, orden: 0 } as Category, children: orphans });
    }

    if (parentsToShow.length === 0 && childrenToShow.length > 0) {
      groups.push({ parent: { id: 0, nombre: "Resultados", slug: "", activo: true, orden: 0 } as Category, children: childrenToShow });
    }

    return groups;
  }, [categories, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0 as any);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all outline-none
          ${error ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/40'}
          ${!selected ? 'text-slate-400' : 'text-slate-900'}
        `}
      >
        <span className="truncate">{selected ? selected.nombre : "Seleccionar categoría..."}</span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selected && (
            <span onClick={handleClear} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar categoría..."
                className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {grouped.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">No se encontraron categorías</p>
            )}
            {grouped.map(({ parent, children }) => (
              <div key={parent.id}>
                {children.length > 0 ? (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 sticky top-0">
                      {parent.nombre}
                    </div>
                    {children.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelect(child.id)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2
                          ${child.id === value ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        {child.nombre}
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(parent.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors
                      ${parent.id === value ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    {parent.nombre}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
