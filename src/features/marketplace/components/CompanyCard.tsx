import { MapPin, Phone, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CompanyResponse } from "../types/marketplace";

interface CompanyCardProps {
    company: CompanyResponse;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
    return (
        <div className="group bg-white backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Banner / Header Background */}
            <div className="h-24 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 relative">
                <div className="absolute -bottom-10 left-6 p-1 bg-white rounded-xl shadow-md">
                    <img
                        src={company.logoUrl || "/placeholder-company.png"}
                        alt={company.nombreComercial}
                        className="w-20 h-20 object-contain rounded-lg"
                    />
                </div>
            </div>

            <div className="pt-12 px-6 pb-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {company.nombreComercial}
                    </h3>
                    <span className="inline-block px-2 py-0.5 mt-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                        {company.tipoServicio}
                    </span>
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
                    {company.descripcion || "Sin descripción disponible."}
                </p>

                <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{company.direccion}, {company.ciudad}</span>
                    </div>
                    {company.telefonoContacto && (
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{company.telefonoContacto}</span>
                        </div>
                    )}
                </div>

                <Link
                    to={`/empresa/${company.id}`}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors group/btn"
                >
                    Ver Perfil
                    <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
            </div>
        </div>
    );
};
