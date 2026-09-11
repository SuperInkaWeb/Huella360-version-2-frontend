import { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../../auth/context/AuthContext";
import { PostularAdopcionModal } from "../../dashboard/shared/adopciones/components/PostularAdopcionModal";
import { AgendarCitaModal } from "../../dashboard/shared/appointments/AgendarCitaModal";
import { useProductDetails } from "../hooks/useProductDetails";
import { ArrowLeft, ShoppingCart, Calendar, PawPrint, Store, ChevronRight, Package, Truck } from "lucide-react";
import type { Product } from "../types/marketplace";

export const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { product, rawAdoption, loading } = useProductDetails(id);
    const [quantity, setQuantity] = useState(1);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isCitaModalOpen, setIsCitaModalOpen] = useState(false);

    if (loading) return <LoadingSpinner />;
    if (!product) return <ProductNotFound />;

    const isAdoption = product.categoriaId === -1;
    const isService = product.categoriaId === -2;

    const servicioId = isService && typeof product.id === 'string'
        ? Number(product.id.replace('service_', ''))
        : undefined;

    return (
        <main className="container mx-auto px-4 py-8 lg:py-12 bg-slate-50 min-h-screen">
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium text-sm">
                <ArrowLeft size={16} />
                Volver al Marketplace
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                <ProductGallery imagenes={product.imagenes} nombre={product.nombre} />

                <section className="lg:w-1/2 flex flex-col">
                    <ProductHeader product={product} />
                    {!isAdoption && <ProductPrice product={product} />}
                    <ProductStock stock={product.stock} isAdoption={isAdoption} isService={isService} />
                    <ProductDescription descripcion={product.descripcion} />
                    <SellerCard
                        empresaNombre={product.empresaNombre}
                        empresaTipoServicio={product.empresaTipoServicio}
                        empresaId={product.empresaId}
                        isAdoption={isAdoption}
                    />

                    <div className="mt-auto space-y-4">
                        {!isAdoption && !isService && (
                            <ProductQuantitySelector quantity={quantity} setQuantity={setQuantity} stock={product.stock} />
                        )}

                        <div className="pt-2">
                            <ActionButtons
                                product={product}
                                quantity={quantity}
                                onOpenAdoptionModal={() => setIsApplyModalOpen(true)}
                                onOpenCitaModal={() => setIsCitaModalOpen(true)}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Resumen de compra */}
            {!isAdoption && !isService && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard icon={<Package size={20} />} title="Producto" text={`Stock disponible: ${product.stock} unidades`} />
                    <InfoCard icon={<Truck size={20} />} title="Envío" text="Consultar con el vendedor" />
                    <InfoCard icon={<Store size={20} />} title="Garantía" text="Con el vendedor" />
                </div>
            )}

            <PostularAdopcionModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                adopcion={rawAdoption}
            />

            {isService && servicioId && product.empresaId && (
                <AgendarCitaModal
                    isOpen={isCitaModalOpen}
                    onClose={() => setIsCitaModalOpen(false)}
                    servicioId={servicioId}
                    empresaId={product.empresaId}
                    servicioNombre={product.nombre}
                />
            )}
        </main>
    );
};

const ProductGallery = ({ imagenes, nombre }: { imagenes?: string[], nombre: string }) => {
    const [mainImage, setMainImage] = useState(imagenes?.[0] || "");

    return (
        <section className="lg:w-1/2 space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 aspect-square flex items-center justify-center relative group">
                {mainImage ? (
                    <img
                        alt={nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={mainImage}
                    />
                ) : (
                    <div className="flex flex-col items-center text-slate-300">
                        <Package size={48} strokeWidth={1.5} />
                        <span className="text-xs font-medium mt-2">Sin imagen</span>
                    </div>
                )}
            </div>

            {imagenes && imagenes.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {imagenes.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img)}
                            className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                                mainImage === img
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <img alt={`${nombre} ${idx + 1}`} className="w-full h-full object-cover" src={img} />
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

const ProductHeader = ({ product }: { product: Product }) => (
    <>
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.categoriaNombre}
            </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
            {product.nombre}
        </h1>
    </>
);

const ProductPrice = ({ product }: { product: Product }) => {
    const hasDiscount = product.precio > product.precioActual;
    const discountPercent = hasDiscount ? Math.round(((product.precio - product.precioActual) / product.precio) * 100) : 0;

    return (
        <div className="flex items-end gap-3 mb-5">
            <span className="text-3xl font-bold text-slate-900">
                S/ {product.precioActual.toFixed(2)}
            </span>
            {hasDiscount && (
                <>
                    <span className="text-base text-slate-400 line-through mb-1">
                        S/ {product.precio.toFixed(2)}
                    </span>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                        -{discountPercent}%
                    </span>
                </>
            )}
        </div>
    );
};

const ProductStock = ({ stock, isAdoption, isService }: { stock: number, isAdoption: boolean, isService: boolean }) => {
    if (isAdoption || isService) return null;

    const isLowStock = stock > 0 && stock <= 5;
    const isOutOfStock = stock === 0;

    return (
        <div className="flex items-center gap-2 mb-5">
            <div className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-600'}`}>
                {isOutOfStock
                    ? 'Agotado'
                    : isLowStock
                        ? `Solo quedan ${stock} unidades`
                        : `En stock (${stock} disponibles)`
                }
            </span>
        </div>
    );
};

const ProductDescription = ({ descripcion }: { descripcion?: string }) => (
    <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Descripcion</h3>
        <p className="text-slate-500 leading-relaxed text-sm">
            {descripcion || "Sin descripcion disponible."}
        </p>
    </div>
);

const SellerCard = ({ empresaNombre, empresaTipoServicio, empresaId, isAdoption }: {
    empresaNombre: string, empresaTipoServicio?: string, empresaId: number, isAdoption: boolean
}) => {
    const initials = empresaNombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <Link
            to={`/marketplace/company/${empresaId}`}
            className="block bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {isAdoption ? "Publicado por" : "Vendido por"}
                    </p>
                    <p className="text-sm font-bold text-slate-700 truncate">{empresaNombre}</p>
                    {empresaTipoServicio && (
                        <p className="text-[10px] text-slate-400 uppercase">{empresaTipoServicio}</p>
                    )}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
            </div>
        </Link>
    );
};

const ProductQuantitySelector = ({ quantity, setQuantity, stock }: {
    quantity: number, setQuantity: (q: number | ((prev: number) => number)) => void, stock: number
}) => (
    <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700" htmlFor="quantity">Cantidad</label>
        <div className="flex items-center border border-slate-200 rounded-xl bg-white">
            <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded-l-xl transition-colors font-bold"
            >
                -
            </button>
            <input
                id="quantity"
                type="number"
                value={quantity}
                readOnly
                className="w-12 border-none text-center text-sm bg-transparent text-slate-900 font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
                onClick={() => setQuantity(prev => Math.min(stock, prev + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 rounded-r-xl transition-colors font-bold"
            >
                +
            </button>
        </div>
    </div>
);

const ActionButtons = ({ product, quantity, onOpenAdoptionModal, onOpenCitaModal }: {
    product: Product, quantity: number, onOpenAdoptionModal: () => void, onOpenCitaModal: () => void
}) => {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdoption = product.categoriaId === -1;
    const isService = product.categoriaId === -2;

    if (isAdoption) {
        return (
            <button
                onClick={onOpenAdoptionModal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <PawPrint size={20} />
                Solicitar Adopcion
            </button>
        );
    }

    if (isService) {
        const handleReservar = () => {
            if (!isAuthenticated) return navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
            onOpenCitaModal();
        };
        return (
            <button
                onClick={handleReservar}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl transition-all shadow-md shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <Calendar size={20} />
                Reservar Cita
            </button>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
                onClick={() => addToCart(product, quantity)}
                className="bg-white border-2 border-slate-200 hover:border-primary hover:text-primary text-slate-700 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <ShoppingCart size={20} />
                Agregar al carrito
            </button>
            <button
                onClick={() => { addToCart(product, quantity); navigate('/marketplace/checkout'); }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-[0.98]"
            >
                Comprar ahora
            </button>
        </div>
    );
};

const InfoCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{text}</p>
        </div>
    </div>
);

const ProductNotFound = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Producto no encontrado</h2>
        <Link to="/marketplace" className="text-primary font-medium hover:underline">Volver al Marketplace</Link>
    </div>
);

const LoadingSpinner = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
            <p className="text-slate-500">Cargando detalles...</p>
        </div>
    </div>
);
