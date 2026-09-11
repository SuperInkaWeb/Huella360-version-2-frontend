import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Eye, Calendar, Tag } from "lucide-react";
import type { Product } from "../types/marketplace";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const imageUrl = product.imagenes && product.imagenes.length > 0
    ? product.imagenes[0]
    : null;

  const isService = product.categoriaId === -2;
  const isAdoption = product.categoriaId === -1;
  const hasDiscount = !isAdoption && !isService && product.precio > product.precioActual;
  const discountPercent = hasDiscount
    ? Math.round(((product.precio - product.precioActual) / product.precio) * 100)
    : 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      {/* Image */}
      <Link to={`/marketplace/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-slate-50 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <Tag size={40} strokeWidth={1.5} />
              <span className="text-[10px] font-medium uppercase tracking-wider mt-2">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[11px] font-bold rounded-lg shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Adoption badge */}
        {isAdoption && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-[11px] font-bold rounded-lg shadow-sm">
            Adopcion
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Company name */}
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
          {product.empresaNombre}
        </p>

        {/* Product name */}
        <Link to={`/marketplace/product/${product.id}`}>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.nombre}
          </h3>
        </Link>

        {/* Category */}
        {product.categoriaNombre && (
          <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">
            {product.categoriaNombre}
          </p>
        )}

        {/* Price + Action */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2 border-t border-slate-50">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through leading-none">
                S/{product.precio.toFixed(2)}
              </span>
            )}
            {isAdoption ? (
              <span className="text-base font-bold text-orange-600 leading-tight">¡Adoptame!</span>
            ) : (
              <span className="text-base font-bold text-slate-900 leading-tight">
                S/{product.precioActual.toFixed(2)}
              </span>
            )}
          </div>

          {isAdoption ? (
            <Link
              to={`/marketplace/product/${product.id}`}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
              title="Ver detalles"
            >
              <Eye size={18} />
            </Link>
          ) : isService ? (
            <Link
              to={`/marketplace/product/${product.id}`}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all"
              title="Reservar cita"
            >
              <Calendar size={18} />
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
              title="Agregar al carrito"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
