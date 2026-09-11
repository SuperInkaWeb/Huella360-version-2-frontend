import { useState, useEffect } from "react";
import { Users, Search, Filter, Mail, Award, Clock, Star, ExternalLink } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { api } from "../../../../shared/http/api";
import type { ApiResponse } from "../../../../shared/types/api";
import Swal from "sweetalert2";

interface Veterinarian {
    id: number;
    nombres: string;
    apellidos: string;
    especialidad: string;
    aniosExperiencia: number;
    numeroColegiatura: string;
    biografia: string;
    fotoPerfilUrl: string;
    correo: string;
    estadoValidacion: string;
}

export const TalentoPage = () => {
    const [vets, setVets] = useState<Veterinarian[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchVets = async () => {
            try {
                const { data } = await api.get<ApiResponse<Veterinarian[]>>("/veterinarians");
                setVets(data.data);
            } catch (error) {
                console.error("Error fetching talent:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVets();
    }, []);

    const filteredVets = vets.filter(v =>
        `${v.nombres} ${v.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvite = (vet: Veterinarian) => {
        Swal.fire({
            title: `Invitar a Dr. ${vet.nombres}`,
            text: `¿Deseas enviar una invitación formal a ${vet.correo} para que se una a tu equipo?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, enviar invitación",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#0d9488"
        }).then((result) => {
            if (result.isConfirmed) {
                // Here we would call the staff invitation endpoint
                Swal.fire("Enviado", "La invitación ha sido enviada correctamente.", "success");
            }
        });
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar text-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="text-teal-500" /> Descubrir Talento
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Encuentra facultativos verificados para tu clínica.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o especialidad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-72"
                        />
                    </div>
                    <Button variant="outline" className="h-10 px-3">
                        <Filter size={18} />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredVets.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
                    <Users size={48} className="mx-auto mb-4 text-slate-200" />
                    <h3 className="text-xl font-bold">No hay talentos disponibles</h3>
                    <p className="text-slate-500 mt-2">No se encontraron veterinarios que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVets.map((vet) => (
                        <div
                            key={vet.id}
                            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-teal-500/5 hover:border-teal-500/30 transition-all group flex flex-col"
                        >
                            <div className="flex gap-4 items-start mb-4">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0 overflow-hidden">
                                    {vet.fotoPerfilUrl ? (
                                        <img src={vet.fotoPerfilUrl} alt={vet.nombres} className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                        <span>{vet.nombres[0]}{vet.apellidos[0]}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold truncate group-hover:text-teal-600 transition-colors">
                                        Dr. {vet.nombres} {vet.apellidos}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
                                        <Star size={12} fill="currentColor" /> {vet.especialidad || "General"}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 italic">
                                "{vet.biografia || "Sin biografía disponible."}"
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                                        <Clock size={12} /> Experiencia
                                    </div>
                                    <div className="text-sm font-bold mt-0.5">{vet.aniosExperiencia || 0} años</div>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                                        <Award size={12} /> Colegiatura
                                    </div>
                                    <div className="text-sm font-bold mt-0.5 truncate">{vet.numeroColegiatura}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleInvite(vet)}
                                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-xs font-bold h-10 gap-2"
                                >
                                    <Mail size={14} /> Invitar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-10 px-3 hover:text-teal-500 hover:border-teal-500/50"
                                >
                                    <ExternalLink size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
