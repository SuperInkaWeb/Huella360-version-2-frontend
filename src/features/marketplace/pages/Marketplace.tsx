import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Search, SlidersHorizontal, ChevronRight, MapPin, LayoutGrid } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ServicesMap } from "../components/ServicesMap";
import { marketplaceService } from "../services/marketplaceService";
import { mapAdoptionToProduct, mapServiceToProduct } from "../utils/productAdapter";
import { useUserLocation } from "../hooks/useUserLocation";
import { Seo } from "../../../components/Seo";
import type { Product, AdoptionResponse, ServiceResponse, MarketplaceFilters, Category, CompanyResponse } from "../types/marketplace";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Más recientes",
  "price-asc": "Menor precio",
  "price-desc": "Mayor precio",
  name: "A - Z",
};

export const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    page: 0,
    size: 12,
    sort: "desc",
  });
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Map<number, Category[]>>(new Map());
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [loadingSubs, setLoadingSubs] = useState<Set<number>>(new Set());

  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [mapCompanies, setMapCompanies] = useState<CompanyResponse[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);

  const { location: userLocation, error: locationError } = useUserLocation(viewMode === "map");

  useEffect(() => {
    marketplaceService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const sortParam = useMemo(() => {
    switch (sortBy) {
      case "price-asc":
        return "precio,asc";
      case "price-desc":
        return "precio,desc";
      case "name":
        return "nombre,asc";
      case "newest":
      default:
        return "desc";
    }
  }, [sortBy]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (filters.category === -1) {
        const data = await marketplaceService.searchAdoptions(filters.page, filters.size);
        const mappedAdoptions: Product[] = data.content.map((a: AdoptionResponse) => mapAdoptionToProduct(a));
        setProducts(mappedAdoptions);
        setTotalElements(data.totalElements || mappedAdoptions.length);
      } else if (filters.category === -2) {
        const data = await marketplaceService.searchServices(filters.page, filters.size, filters.q);
        const mappedServices: Product[] = data.content.map((s: ServiceResponse) => mapServiceToProduct(s));
        setProducts(mappedServices);
        setTotalElements(data.totalElements || mappedServices.length);
      } else {
        const productData = await marketplaceService.searchProducts({ ...filters, sort: sortParam });
        const mappedProducts: Product[] = productData.content.map((p: Product) => ({
          ...p,
          itemType: "product" as const,
        }));

        if (!filters.category) {
          try {
            const serviceData = await marketplaceService.searchServices(0, 6, filters.q);
            const mappedServices: Product[] = serviceData.content.map((s: ServiceResponse) => mapServiceToProduct(s));
            setProducts([...mappedProducts, ...mappedServices]);
          } catch {
            setProducts(mappedProducts);
          }
        } else {
          setProducts(mappedProducts);
        }
        setTotalElements(productData.totalElements || mappedProducts.length);
      }
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      toast.error("No se pudieron cargar los productos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [filters, sortParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("search") as string;
    setFilters((prev) => ({ ...prev, q, page: 0 }));
  };

  const handleCategorySelect = (categoryId?: number) => {
    setFilters((prev) => ({ ...prev, category: categoryId, page: 0 }));
    if (categoryId === -1) {
      setViewMode("grid");
    }
  };

  useEffect(() => {
    if (viewMode !== "map") return;

    const empresaIds = Array.from(
      new Set(
        products
          .filter((p) => p.itemType !== "adoption" && p.empresaId > 0)
          .map((p) => p.empresaId)
      )
    );

    if (empresaIds.length === 0) {
      setMapCompanies([]);
      return;
    }

    setLoadingMap(true);
    Promise.all(
      empresaIds.map((id) => marketplaceService.getCompanyById(id).catch(() => null))
    )
      .then((results) => {
        const valid = results.filter(
          (c): c is CompanyResponse => !!c && c.latitud != null && c.longitud != null
        );
        setMapCompanies(valid);
      })
      .finally(() => setLoadingMap(false));
  }, [viewMode, products]);

  const toggleExpandCategory = useCallback(
    async (catId: number) => {
      setExpandedCats((prev) => {
        const next = new Set(prev);
        if (next.has(catId)) {
          next.delete(catId);
        } else {
          next.add(catId);
          if (!subcategories.has(catId)) {
            setLoadingSubs((prevLoading) => new Set(prevLoading).add(catId));
            marketplaceService
              .getSubcategories(catId)
              .then((subs) => {
                setSubcategories((prevMap) => new Map(prevMap).set(catId, subs));
              })
              .catch(() => {})
              .finally(() => {
                setLoadingSubs((prevLoading) => {
                  const nextLoading = new Set(prevLoading);
                  nextLoading.delete(catId);
                  return nextLoading;
                });
              });
          }
        }
        return next;
      });
    },
    [subcategories]
  );

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setShowSortDropdown(false);
    setFilters((prev) => ({ ...prev, page: 0 }));
  };

  const totalPages = Math.ceil(totalElements / (filters.size || 12));

  const categoryTitle =
    filters.category === -1 ? "Adopciones" : filters.category === -2 ? "Servicios Médicos" : "Marketplace";

  const getActiveCategoryLabel = () => {
    if (!filters.category || filters.category < 0) return null;
    for (const cat of categories) {
      if (cat.id === filters.category) return cat.nombre;
      const subs = subcategories.get(cat.id);
      if (subs) {
        const sub = subs.find((s) => s.id === filters.category);
        if (sub) return sub.nombre;
      }
    }
    return null;
  };

  const activeLabel = getActiveCategoryLabel();

  return (
    <div className="w-full bg-[#eeeeee] min-h-screen">
      <Seo title="Marketplace" description="Explora productos, servicios veterinarios y opciones de adopción para tu mascota en Huella360." />

      {/* Breadcrumb */}
      <div className="bg-[#eeeeee] pt-20">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <a href="/" className="hover:text-[#3483fa] transition-colors">Inicio</a>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">{categoryTitle}</span>
            {activeLabel && (
              <>
                <ChevronRight size={12} />
                <span className="text-[#3483fa]">{activeLabel}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1200px] mx-auto px-4 pb-10">
        <div className="flex gap-5">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="sticky top-24">
              {/* Search in sidebar */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={filters.q || ""}
                    placeholder="Buscar en Marketplace"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 bg-white text-sm focus:border-[#3483fa] outline-none"
                  />
                </div>
              </form>

              {/* Categories */}
              <div className="bg-white rounded-md border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Categorías</h3>
                <nav className="space-y-0.5">
                  <button
                    onClick={() => handleCategorySelect(undefined)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                      filters.category === undefined ? "text-[#3483fa] font-medium" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Todos
                  </button>

                  {categories.map((cat) => {
                    const isSelected = filters.category === cat.id;
                    const isExpanded = expandedCats.has(cat.id);
                    const catSubs = subcategories.get(cat.id);
                    const isLoading = loadingSubs.has(cat.id);

                    return (
                      <div key={cat.id}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors ${
                              isSelected ? "text-[#3483fa] font-medium" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {cat.nombre}
                          </button>
                          <button
                            onClick={() => toggleExpandCategory(cat.id)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="ml-3 mb-1">
                            {isLoading ? (
                              <div className="px-2 py-1 text-xs text-slate-400">Cargando...</div>
                            ) : catSubs && catSubs.length > 0 ? (
                              catSubs.map((sub) => (
                                <button
                                  key={sub.id}
                                  onClick={() => handleCategorySelect(sub.id)}
                                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                                    filters.category === sub.id
                                      ? "text-[#3483fa] font-medium"
                                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  {sub.nombre}
                                </button>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-xs text-slate-400">Sin subcategorías</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="border-t border-slate-100 my-2" />

                  <button
                    onClick={() => handleCategorySelect(-1)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                      filters.category === -1 ? "text-orange-500 font-medium" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Adopciones
                  </button>
                  <button
                    onClick={() => handleCategorySelect(-2)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                      filters.category === -2 ? "text-teal-500 font-medium" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Servicios Médicos
                  </button>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Title Bar */}
            <div className="bg-white rounded-md border border-slate-200 p-4 mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-normal text-slate-800">{categoryTitle}</h1>
                  {activeLabel && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      <button onClick={() => handleCategorySelect(undefined)} className="text-[#3483fa] hover:underline">
                        {categoryTitle}
                      </button>
                      {" > "}
                      {activeLabel}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {!loading && `${totalElements} resultados`}
                  </span>

                  {filters.category !== -1 && (
                  <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <LayoutGrid size={14} />
                      Lista
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        viewMode === "map" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <MapPin size={14} />
                      Mapa
                    </button>
                  </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:border-slate-300 transition-colors"
                    >
                      <SlidersHorizontal size={14} />
                      {SORT_LABELS[sortBy]}
                      <ChevronDown size={14} />
                    </button>

                    {showSortDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-20 py-1">
                          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => handleSortChange(key)}
                              className={`w-full px-4 py-2 text-left text-xs transition-colors ${
                                sortBy === key ? "text-[#3483fa] font-medium bg-blue-50" : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Services Map */}
            {viewMode === "map" ? (
              <div>
                {locationError && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
                    {locationError} Mostrando clínicas sin centrar en tu ubicación.
                  </p>
                )}
                {loadingMap ? (
                  <div className="h-[500px] w-full rounded-md border border-slate-200 bg-white flex items-center justify-center">
                    <p className="text-slate-400 text-sm animate-pulse">Cargando ubicaciones...</p>
                  </div>
                ) : mapCompanies.length > 0 ? (
                  <ServicesMap companies={mapCompanies} userLocation={userLocation} />
                ) : (
                  <div className="py-16 text-center bg-white rounded-md border border-slate-200">
                    <p className="text-slate-500 text-base">No hay ubicaciones disponibles para estos servicios.</p>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white rounded-md animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 0}
                      className="px-3 py-2 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i;
                      else if (filters.page! < 3) pageNum = i;
                      else if (filters.page! > totalPages - 4) pageNum = totalPages - 5 + i;
                      else pageNum = filters.page! - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded text-xs font-medium transition-colors ${
                            filters.page === pageNum
                              ? "bg-[#3483fa] text-white"
                              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page! >= totalPages - 1}
                      className="px-3 py-2 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center bg-white rounded-md border border-slate-200">
                <p className="text-slate-500 text-base mb-1">No se encontraron productos</p>
                <p className="text-slate-400 text-sm mb-4">Intenta con otros filtros o términos de búsqueda</p>
                <button
                  onClick={() => {
                    setFilters({ page: 0, size: 12, sort: "desc" });
                    setSortBy("newest");
                  }}
                  className="text-[#3483fa] font-medium text-sm hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
