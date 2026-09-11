import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { marketplaceService } from "../services/marketplaceService";
import { CompanyCard } from "../components/CompanyCard";
import type { CompanyResponse } from "../types/marketplace";
import { Building2, Search, Loader2 } from "lucide-react";

export const CompaniesPage = () => {
    const [companies, setCompanies] = useState<CompanyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const data = await marketplaceService.getAllCompanies(page, 12);
                setCompanies(data.content);
                setTotalPages(data.totalPages);
            } catch (error) {
                console.error("Error fetching companies:", error);
                toast.error("No se pudieron cargar las empresas.");
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, [page]);

    const filteredCompanies = companies.filter(company =>
        company.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.tipoServicio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-6">
                    <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Nuestras Empresas
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Descubre las mejores clínicas veterinarias, petshops y especialistas comprometidos con el bienestar de tu mascota.
                </p>
            </div>

            <div className="max-w-7xl mx-auto mb-12">
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o servicio..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-slate-500 animate-pulse">Cargando empresas asociadas...</p>
                    </div>
                ) : filteredCompanies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCompanies.map((company) => (
                            <CompanyCard key={company.id} company={company} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No se encontraron empresas que coincidan con tu búsqueda.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-10 h-10 rounded-full font-bold transition-all ${page === i
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                        : "bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
