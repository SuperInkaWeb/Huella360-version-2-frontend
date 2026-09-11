import { useState } from "react";
import { Plus, Search, Filter, Package, AlertTriangle, Eye, Edit2, Trash2, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../../components/ui/Button";
import { productService } from "../services/productService";
import { subscriptionService } from "../../shared/subscriptions/services/subscriptionService";
import type { Product } from "../../../catalog/types/product";
import Swal from "sweetalert2";
import { ProductFormModal } from "../components/ProductFormModal";

export const ProductosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["empresa-productos", page],
    queryFn: async () => {
      const data = await productService.getMyProducts(page, 10);
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const products = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa-productos"] });
    },
  });

  const handleOpenCreate = async () => {
    try {
      const freshUsage = await subscriptionService.getUsageMetrics();
      if (freshUsage.maxProducts > 0 && freshUsage.currentProducts >= freshUsage.maxProducts) {
        Swal.fire({
          title: "Límite de productos alcanzado",
          html: `
            <div class="text-left space-y-3">
              <p class="text-slate-600">Tu plan actual permite <strong>${freshUsage.maxProducts} producto${freshUsage.maxProducts !== 1 ? 's' : ''}</strong> y ya tienes <strong>${freshUsage.currentProducts}</strong> creados.</p>
              <p class="text-slate-500 text-sm">Actualiza tu plan para agregar más productos a tu catálogo.</p>
            </div>
          `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Ver planes",
          cancelButtonText: "Cerrar",
          confirmButtonColor: "#fe5c3c",
          iconColor: "#3b82f6",
        }).then((result) => {
          if (result.isConfirmed) window.location.href = "/empresa/suscripcion";
        });
        return;
      }
    } catch (e) {
      console.error("Error checking subscription limits:", e);
    }
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El producto se marcará como inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    /* Contenedor principal: Ocupa el 100% del alto del Outlet, con padding para ese "pequeño espacio visible" */
    <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
      
      {/* Header: Se encoge lo necesario (shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Inventario de Productos
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Gestiona el stock, precios y detalles de tu catálogo.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="group relative px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-white font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} className="transition-transform group-hover:rotate-90 duration-300" />
          <span>Nuevo Producto</span>
        </Button>
      </div>

      {/* Filters & Search: Se encoge lo necesario (shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="px-6 py-3 rounded-xl flex items-center justify-center gap-2 bg-white border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
          <Filter size={18} className="text-slate-500" />
          <span className="font-medium">Filtros</span>
        </Button>
      </div>

      {/* Contenedor de Tabla/Cards: Ocupa el espacio restante (flex-1), permite scroll interno (min-h-0) */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Área scrolleable de contenido */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          
          {/* Desktop Table View */}
          <div className="hidden md:block min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Producto</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">SKU</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Precio</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Stock</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500">Estado</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-20 bg-slate-50/30"></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">!</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-700 mb-1">Error al cargar</h3>
                        <p className="text-sm text-red-500 text-center mb-4">{error?.message || "Error desconocido"}</p>
                        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["empresa-productos"] })} variant="outline" className="gap-2 rounded-lg">
                          Reintentar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Package size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No hay productos</h3>
                        <p className="text-sm text-slate-500 text-center mb-4">
                          {searchTerm ? "No encontramos coincidencias para tu búsqueda." : "Comienza agregando tu primer producto al inventario."}
                        </p>
                        {!searchTerm && (
                          <Button onClick={handleOpenCreate} variant="outline" className="gap-2 rounded-lg">
                            Crear producto <ArrowRight size={16}/>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/60 shrink-0">
                            {product.imagenes?.[0] ? (
                              <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500" loading="lazy" />
                            ) : (
                              <Package size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{product.nombre}</p>
                            <p className="text-xs text-slate-500 truncate">{product.categoriaNombre}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm ${product.precioOferta ? "text-xs line-through text-slate-400" : "font-medium text-slate-900"}`}>
                            S/ {product.precio.toFixed(2)}
                          </span>
                          {product.precioOferta && (
                            <span className="text-sm text-emerald-600 font-bold">
                              S/ {product.precioOferta.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {product.stock <= 5 && <AlertTriangle size={16} className="text-amber-500 animate-pulse" />}
                          <span className={`text-sm font-medium ${product.stock <= 5 ? "text-amber-600" : "text-slate-700"}`}>
                            {product.stock} und.
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                          product.estado === 'ACTIVO' 
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : product.estado === 'AGOTADO'
                            ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                            : 'bg-slate-50 text-slate-700 ring-slate-600/20'
                        }`}>
                          {product.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="Ver detalles" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                          <button title="Editar" onClick={() => handleOpenEdit(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button title="Eliminar" onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Solo visible en móviles) */}
          <div className="md:hidden flex flex-col p-4 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl animate-pulse space-y-4 border border-slate-100">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
               <div className="py-12 px-6 rounded-2xl text-center bg-white border border-red-200">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">!</span>
                </div>
                <p className="text-red-700 font-semibold mb-2">Error al cargar</p>
                <p className="text-sm text-red-500 mb-4">{error?.message || "Error desconocido"}</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["empresa-productos"] })} variant="outline" className="gap-2 rounded-lg">
                  Reintentar
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
               <div className="py-12 px-6 rounded-2xl text-center">
                <Package size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">No se encontraron productos.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 shrink-0 rounded-xl bg-white overflow-hidden border border-slate-200/60">
                      {product.imagenes?.[0] ? (
                        <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package size={24} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{product.nombre}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{product.categoriaNombre}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-base font-bold text-primary">
                          S/ {(product.precioOferta || product.precio).toFixed(2)}
                        </span>
                        {product.precioOferta && (
                          <span className="text-xs text-slate-400 line-through">
                            S/ {product.precio.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        product.estado === 'ACTIVO' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.estado}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <span>•</span>
                        <span>{product.stock} unds</span>
                        {product.stock <= 5 && <AlertTriangle size={12} className="text-amber-500 ml-1" />}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenEdit(product)} className="p-2 bg-white text-slate-500 rounded-lg active:scale-95 shadow-sm border border-slate-200 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-white text-red-600 rounded-lg active:scale-95 shadow-sm border border-slate-200 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination: Se queda fija al fondo de este contenedor */}
        <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <span className="text-sm font-medium text-slate-500">
            Mostrando <span className="text-slate-900">{products.length}</span> productos | Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none text-sm px-4 py-2 h-auto" disabled={page === 0 || isLoading} onClick={() => setPage(p => Math.max(0, p - 1))}>Anterior</Button>
            <Button variant="outline" className="flex-1 sm:flex-none text-sm px-4 py-2 h-auto" disabled={page >= totalPages - 1 || isLoading} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Siguiente</Button>
          </div>
        </div>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["empresa-productos"] })}
        product={editingProduct}
      />
    </div>
  );
};