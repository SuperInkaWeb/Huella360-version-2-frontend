import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Store,
    Stethoscope,
    Heart,
    MapPin,
    Mail,
    Info,
    Navigation,
    Gift,
    ArrowLeft,
    MessageCircle
} from "lucide-react";
import { marketplaceService } from "../services/marketplaceService";
import { mapAdoptionToProduct, mapServiceToProduct } from "../utils/productAdapter";
import { ProductCard } from "../components/ProductCard";
import { MapView } from "../components/MapView";
import { Seo } from "../../../components/Seo";
import type { Product } from "../types/marketplace";
import { RewardsStore } from "../../dashboard/gamification/components/client/RewardsStore";
import { useAuth } from "../../auth/context/useAuth";
import { chatService } from "../../dashboard/shared/chat/chatService";
import { ChatModal } from "../../dashboard/shared/chat/ChatModal";

interface Company {
    id: number;
    nombreComercial: string;
    descripcion: string;
    tipoServicio: string;
    logoUrl: string;
    bannerUrl: string;
    telefonoContacto: string;
    emailContacto: string;
    direccion: string;
    ciudad: string;
    latitud?: number;
    longitud?: number;
}

type TabType = 'products' | 'services' | 'adoptions' | 'rewards';

export const CompanyProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, role } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Product[]>([]);
    const [adoptions, setAdoptions] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [chatRoomId, setChatRoomId] = useState<number | null>(null);
    const [isOpeningChat, setIsOpeningChat] = useState(false);

    const handleOpenChat = async () => {
        if (!isAuthenticated) {
            navigate(`/login?next=${encodeURIComponent(`/empresa/${id}`)}`);
            return;
        }
        if (!company) return;
        setIsOpeningChat(true);
        try {
            const room = await chatService.abrirChatConEmpresa(company.id);
            setChatRoomId(room.id);
        } catch (error) {
            console.error("Error opening chat:", error);
            toast.error("No se pudo abrir el chat. Intenta de nuevo.");
        } finally {
            setIsOpeningChat(false);
        }
    };

    const fetchCompanyData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const companyId = parseInt(id);
            const [companyData, productsData, adoptionsData, servicesData] = await Promise.all([
                marketplaceService.getCompanyById(companyId),
                marketplaceService.getProductsByCompany(companyId),
                marketplaceService.getAdoptionsByCompany(companyId),
                marketplaceService.searchServices(0, 10, undefined, companyId)
            ]);

            setCompany(companyData);

            setProducts(productsData.content.map((p: Product) => ({ ...p, itemType: 'product' as const })));

            setAdoptions(adoptionsData.content.map((a) => {
                const mapped = mapAdoptionToProduct(a);
                mapped.empresaNombre = companyData.nombreComercial;
                return mapped;
            }));

            setServices(servicesData.content.map((s) => mapServiceToProduct(s)));

            // Smart tab selection based on content availability
            if (productsData.content.length > 0) setActiveTab('products');
            else if (servicesData.content.length > 0) setActiveTab('services');
            else if (adoptionsData.content.length > 0) setActiveTab('adoptions');

        } catch (error) {
            console.error("Error fetching company profile data:", error);
            toast.error("No se pudo cargar el perfil de la empresa.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCompanyData();
    }, [fetchCompanyData]);

    if (loading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
                <div className="h-[300px] bg-slate-200 rounded-3xl mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-4 -mt-24 relative z-10">
                        <div className="w-32 h-32 bg-slate-300 rounded-2xl border-4 border-white" />
                        <div className="h-6 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-full" />
                        <div className="h-4 bg-slate-200 rounded w-5/6" />
                    </div>
                    <div className="lg:col-span-3 mt-8 lg:mt-0 space-y-6">
                        <div className="h-10 bg-slate-200 rounded-lg w-1/2" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <Store className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-semibold text-slate-900">Empresa no encontrada</h2>
                <p className="text-slate-500 mt-2 mb-6">La empresa que buscas no existe o ha sido eliminada.</p>
                <Link 
                    to="/marketplace" 
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    Volver al Marketplace
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: 'products', label: 'Productos', icon: Store, count: products.length },
        { id: 'services', label: 'Servicios', icon: Stethoscope, count: services.length },
        { id: 'adoptions', label: 'En Adopción', icon: Heart, count: adoptions.length },
        { id: 'rewards', label: 'Recompensas', icon: Gift, count: null }
    ] as const;

    const renderContent = () => {
        const items = activeTab === 'products' ? products : activeTab === 'services' ? services : adoptions;
        const emptyMessage = activeTab === 'products' ? "No hay productos disponibles en este momento." :
                             activeTab === 'services' ? "No hay servicios disponibles en este momento." : 
                             "No hay mascotas en adopción en este momento.";

        if (activeTab === 'rewards') {
            return <RewardsStore empresaId={company.id} />;
        }

        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Info className="w-10 h-10 text-slate-400 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900 mb-1">Nada por aquí</h3>
                    <p className="text-sm text-slate-500">{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {items.map(item => (
                    <ProductCard key={item.id} product={item} />
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-white pb-20">
            <Seo
                title={company.nombreComercial}
                description={company.descripcion || `Perfil de ${company.nombreComercial} en Huella360`}
                image={company.logoUrl}
            />
            {/* Banner Section */}
            <div className="relative w-full h-[280px] md:h-[320px] bg-slate-100">
                {company.bannerUrl ? (
                    <img
                        src={company.bannerUrl}
                        alt={`Banner de ${company.nombreComercial}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-400" />
                )}
                {/* Subtle gradient overlay to ensure header legibility if moved up */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-24 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 text-sm font-medium rounded-full shadow-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar / Company Info */}
                    <div className="lg:col-span-4 xl:col-span-3 -mt-20 relative z-10">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            {/* Logo */}
                            <div className="w-28 h-28 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 mb-6">
                                {company.logoUrl ? (
                                    <img
                                        src={company.logoUrl}
                                        alt={company.nombreComercial}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-xl">
                                        <Store className="w-10 h-10 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mb-6">
                                <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md mb-3">
                                    {company.tipoServicio}
                                </span>
                                <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                                    {company.nombreComercial}
                                </h1>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {company.descripcion || "Este negocio aún no ha añadido una descripción a su perfil."}
                                </p>
                            </div>

                            {(!isAuthenticated || role === 'CLIENTE') && (
                                <button
                                    onClick={handleOpenChat}
                                    disabled={isOpeningChat}
                                    className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-md shadow-primary/20 disabled:opacity-60"
                                >
                                    <MessageCircle size={18} />
                                    {isOpeningChat ? "Abriendo chat..." : "Chatear"}
                                </button>
                            )}

                            {/* Contact Details */}
                            <div className="space-y-3 pt-6 border-t border-slate-100 text-sm">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <span className="leading-snug">{company.direccion}, {company.ciudad}</span>
                                </div>
                                {company.emailContacto && (
                                    <span className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors group">
                                        <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                                        <span className="truncate">{company.emailContacto}</span>
                                    </span>
                                )}
                            </div>

                            {/* Map */}
                            {company.latitud && company.longitud && (
                                <div className="mt-8 pt-6 border-t border-slate-100">
                                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                        Ubicación
                                    </h3>
                                    <div className="rounded-xl overflow-hidden border border-slate-100 mb-3 h-32">
                                        <MapView lat={company.latitud} lng={company.longitud} />
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${company.latitud},${company.longitud}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Cómo llegar
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 xl:col-span-9 pt-8 lg:pt-12">
                        
                        {/* Minimalist Tabs */}
                        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 mb-8">
                            <div className="flex gap-6 px-1">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as TabType)}
                                            className={`
                                                relative flex items-center gap-2 pb-4 text-sm font-medium transition-colors whitespace-nowrap
                                                ${isActive
                                                    ? 'text-blue-600'
                                                    : 'text-slate-500 hover:text-slate-800'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                            {tab.label}
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-xs
                                                ${isActive
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }
                                            `}>
                                                {tab.count}
                                            </span>
                                            
                                            {/* Active Indicator */}
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="min-h-[400px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {chatRoomId && (
                <ChatModal
                    roomId={chatRoomId}
                    title={company.nombreComercial}
                    logoUrl={company.logoUrl}
                    onClose={() => setChatRoomId(null)}
                />
            )}
        </div>
    );
};