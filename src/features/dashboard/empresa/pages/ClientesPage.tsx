import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Users,
    DollarSign,
    Calendar,
    Trophy,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { crmService } from "../services/crmService";
import type { ClienteCrm } from "../types/crm.types";

type RankingTab = "todos" | "valor" | "citas";

const TABS: { id: RankingTab; label: string }[] = [
    { id: "todos", label: "Todos los Clientes" },
    { id: "valor", label: "Mayor Valor Generado" },
    { id: "citas", label: "Más Citas Reservadas" },
];

export const ClientesPage = () => {
    const [clientes, setClientes] = useState<ClienteCrm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState<RankingTab>("todos");

    const fetchClientes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await crmService.getClientes(page, 20, debouncedSearch || undefined);
            setClientes(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error: any) {
            console.error("Error fetching clientes CRM:", error);
            setError(error.response?.data?.message || "Error al cargar los clientes. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchClientes();
    }, [page, debouncedSearch]);

    const sortedClientes = useMemo(() => {
        const list = [...clientes];
        if (activeTab === "valor") return list.sort((a, b) => b.totalGastado - a.totalGastado);
        if (activeTab === "citas") return list.sort((a, b) => b.totalCitas - a.totalCitas);
        return list;
    }, [clientes, activeTab]);

    const gastoTotal = clientes.reduce((sum, c) => sum + c.totalGastado, 0);
    const clienteTop = clientes.length > 0
        ? clientes.reduce((top, c) => (c.totalGastado > top.totalGastado ? c : top), clientes[0])
        : null;

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Clientes</p>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">{totalElements}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users size={24} className="text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Gasto Total (página actual)</p>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">S/ {gastoTotal.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={24} className="text-emerald-500" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500">Cliente Top</p>
                        <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                            {clienteTop ? `${clienteTop.nombres} ${clienteTop.apellidos}` : "—"}
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Trophy size={24} className="text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="shrink-0 p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Clientes (CRM)
                    </h2>
                    <div className="relative group sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-400 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Ranking Tabs */}
                <div className="shrink-0 px-5 pt-4 flex items-center gap-6 border-b border-slate-200">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? "text-primary" : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm shadow-sm z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Gastado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Pedidos</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Citas</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Visita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/50" />
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Users size={32} className="mx-auto text-red-300 mb-3" />
                                        <p className="text-red-500 font-medium">{error}</p>
                                        <button onClick={fetchClientes} className="mt-3 text-sm text-primary hover:underline">Reintentar</button>
                                    </td>
                                </tr>
                            ) : sortedClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Users size={32} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">No se encontraron clientes.</p>
                                    </td>
                                </tr>
                            ) : (
                                sortedClientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {cliente.fotoPerfilUrl ? (
                                                        <img src={cliente.fotoPerfilUrl} alt={cliente.nombres} className="w-full h-full object-cover" loading="lazy" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-500">
                                                            {cliente.nombres?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {cliente.nombres} {cliente.apellidos}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex flex-col">
                                                <span>{cliente.correo}</span>
                                                {cliente.telefono && <span className="text-xs text-slate-400">{cliente.telefono}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-900">
                                                S/ {cliente.totalGastado.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                                            {cliente.totalPedidos}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                                            {cliente.totalCitas}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {cliente.ultimaCompra ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {new Date(cliente.ultimaCompra).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
                    <span className="text-sm font-medium text-slate-500">
                        Mostrando {sortedClientes.length} de {totalElements} clientes
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0 || isLoading}
                            className="h-9 px-3 gap-1.5"
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </Button>
                        <div className="flex items-center px-4 h-9 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                            Página {page + 1} de {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || isLoading}
                            className="h-9 px-3 gap-1.5"
                        >
                            Siguiente
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
