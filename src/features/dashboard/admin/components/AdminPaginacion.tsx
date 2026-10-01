import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  enPagina: number;
  etiqueta: string;
  onPage: (page: number) => void;
}

export const AdminPaginacion = ({ page, totalPages, total, enPagina, etiqueta, onPage }: Props) => (
  <div className="shrink-0 px-8 py-5 bg-white/60 backdrop-blur-2xl border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
    <span className="text-xs font-bold text-slate-500">
      Mostrando <strong className="text-[#2D3E82] mx-1">{enPagina}</strong> de{" "}
      <strong className="text-[#2D3E82] mx-1">{total}</strong> {etiqueta}
    </span>
    {totalPages > 1 && (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:border-[#1ea59c] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <span className="text-xs font-bold text-slate-500 px-2">
          Página {page + 1} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page + 1 >= totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:border-[#1ea59c] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    )}
  </div>
);

interface FiltroProps {
  valor: string;
  onChange: (valor: "PENDIENTE" | "VERIFICADO" | "RECHAZADO" | undefined) => void;
}

// Filtro por estado de validación (empresas y veterinarios): permite ver primero los PENDIENTES.
export const AdminFiltroEstado = ({ valor, onChange }: FiltroProps) => (
  <select
    aria-label="Filtrar por estado"
    value={valor}
    onChange={(e) => onChange((e.target.value || undefined) as "PENDIENTE" | "VERIFICADO" | "RECHAZADO" | undefined)}
    className="w-full sm:w-44 px-4 py-3.5 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl text-sm font-medium text-slate-600 outline-none focus:ring-4 focus:ring-[#1ea59c]/10 focus:border-[#1ea59c] shadow-soft"
  >
    <option value="">Todos los estados</option>
    <option value="PENDIENTE">Pendientes</option>
    <option value="VERIFICADO">Verificados</option>
    <option value="RECHAZADO">Rechazados</option>
  </select>
);
