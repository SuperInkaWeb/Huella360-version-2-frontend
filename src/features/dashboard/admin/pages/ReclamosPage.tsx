import { useState, useEffect } from "react";
import { BookOpen, Eye, FileText, X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import Swal from "sweetalert2";
import {
  reclamosAdminService,
  numeroReclamo,
  fechaLimiteRespuesta,
  type EstadoReclamo,
  type Reclamo,
} from "../services/reclamosAdminService";

const ESTADOS: { value: EstadoReclamo; label: string; clase: string }[] = [
  { value: "RECIBIDO", label: "Recibido", clase: "bg-amber-100 text-amber-700" },
  { value: "EN_PROCESO", label: "En proceso", clase: "bg-blue-100 text-blue-700" },
  { value: "RESUELTO", label: "Resuelto", clase: "bg-emerald-100 text-emerald-700" },
  { value: "RECHAZADO", label: "Rechazado", clase: "bg-rose-100 text-rose-700" },
];
const estadoInfo = (e: EstadoReclamo) => ESTADOS.find((x) => x.value === e) ?? ESTADOS[0];
const fmt = (d: Date | string) => new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Libro de Reclamaciones (admin): antes no existia forma de ver los reclamos registrados;
 * solo llegaba una copia por correo a ADMIN_EMAIL (y si el correo fallaba, nadie se enteraba).
 */
export const ReclamosPage = () => {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [filtro, setFiltro] = useState<EstadoReclamo | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<Reclamo | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoReclamo>("RECIBIDO");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [recarga, setRecarga] = useState(0);

  // La consulta vive dentro del efecto y el estado se actualiza en los callbacks de la promesa;
  // `activo` descarta respuestas viejas si el filtro cambia antes de que termine la anterior.
  // El indicador de carga se activa en el evento que dispara la recarga (filtro o guardar).
  useEffect(() => {
    let activo = true;
    reclamosAdminService
      .listar(filtro, 0, 50)
      .then((page) => {
        if (activo) setReclamos(page.content);
      })
      .catch((error) => {
        console.error("Error cargando reclamos:", error);
        if (activo) Swal.fire("Error", "No se pudieron cargar los reclamos.", "error");
      })
      .finally(() => {
        if (activo) setIsLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [filtro, recarga]);

  const abrir = (r: Reclamo) => {
    setSeleccionado(r);
    setNuevoEstado(r.estado);
    setNotas(r.notasInternas ?? "");
  };

  const guardar = async () => {
    if (!seleccionado) return;
    setGuardando(true);
    try {
      await reclamosAdminService.actualizarEstado(seleccionado.id, nuevoEstado, notas.trim() || undefined);
      setSeleccionado(null);
      Swal.fire({ icon: "success", title: "Reclamo actualizado", timer: 1800, showConfirmButton: false });
      setIsLoading(true);
      setRecarga((n) => n + 1);
    } catch (error) {
      console.error("Error actualizando reclamo:", error);
      Swal.fire("Error", "No se pudo actualizar el reclamo.", "error");
    } finally {
      setGuardando(false);
    }
  };

  const hoy = new Date();

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#2D3E82] tracking-tight flex items-center gap-3">
            <BookOpen className="text-[#1ea59c]" size={36} />
            Libro de Reclamaciones
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Reclamos y quejas registrados por los consumidores. Plazo legal de respuesta: 15 días hábiles.
          </p>
        </div>
        <select
          aria-label="Filtrar por estado"
          value={filtro}
          onChange={(e) => {
            setIsLoading(true);
            setFiltro(e.target.value as EstadoReclamo | "");
          }}
          className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 outline-none focus:ring-4 focus:ring-[#1ea59c]/10 focus:border-[#1ea59c]"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-soft overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando reclamos...</div>
        ) : reclamos.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay reclamos {filtro ? "con este estado" : "registrados"}.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white/60 backdrop-blur-2xl border-b border-gray-100">
                {["N°", "Fecha", "Tipo", "Consumidor", "Contacto", "Vence", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="px-6 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reclamos.map((r) => {
                const limite = fechaLimiteRespuesta(r.fechaRegistro);
                const abierto = r.estado === "RECIBIDO" || r.estado === "EN_PROCESO";
                const vencido = abierto && limite < hoy;
                const info = estadoInfo(r.estado);
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">{numeroReclamo(r.id)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{fmt(r.fechaRegistro)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{r.tipoReclamo}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{r.primerNombre} {r.primerApellido}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{r.correo}<br />{r.telefono}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${vencido ? "text-rose-600" : "text-slate-600"}`}>
                      {abierto ? fmt(limite) : "-"}{vencido ? " (vencido)" : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${info.clase}`}>{info.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button title="Ver y gestionar" onClick={() => abrir(r)} className="p-2 text-slate-400 hover:text-[#1ea59c] hover:bg-[#1ea59c]/10 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                        {r.pdfReclamoUrl && (
                          <a title="Hoja de reclamación (PDF)" href={r.pdfReclamoUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#2D3E82] hover:bg-slate-100 rounded-lg transition-colors">
                            <FileText size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {seleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSeleccionado(null)} />
          <div role="dialog" aria-label={`Reclamo ${numeroReclamo(seleccionado.id)}`} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-8 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#2D3E82]">{seleccionado.tipoReclamo} N° {numeroReclamo(seleccionado.id)}</h2>
                <p className="text-sm text-slate-500">
                  Registrado el {fmt(seleccionado.fechaRegistro)} · responder antes del {fmt(fechaLimiteRespuesta(seleccionado.fechaRegistro))}
                </p>
              </div>
              <button onClick={() => setSeleccionado(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl" aria-label="Cerrar"><X size={20} /></button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Consumidor", [seleccionado.primerNombre, seleccionado.segundoNombre, seleccionado.primerApellido, seleccionado.segundoApellido].filter(Boolean).join(" ")],
                ["Documento", `${seleccionado.tipoDocumento} ${seleccionado.numeroDocumento}`],
                ["Correo", seleccionado.correo],
                ["Teléfono", seleccionado.telefono],
                ["Dirección", `${seleccionado.direccion}, ${seleccionado.distrito}, ${seleccionado.provincia}, ${seleccionado.departamento}`],
                ["Menor de edad", seleccionado.esMenor ? "Sí" : "No"],
                ["N° de orden", seleccionado.numeroOrden || "-"],
                ["Producto / servicio", seleccionado.nombreProducto || "-"],
                ["Monto reclamado", seleccionado.montoReclamado != null ? `S/ ${seleccionado.montoReclamado}` : "-"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">{k}</dt>
                  <dd className="text-slate-700">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Resumen</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{seleccionado.resumen || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Detalle / pedido del consumidor</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{seleccionado.detallePedido || "-"}</p>
            </div>
            {seleccionado.archivoAdjuntoUrl && (
              <a href={seleccionado.archivoAdjuntoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#1ea59c] hover:underline">Ver archivo adjunto del consumidor</a>
            )}

            <div className="border-t border-slate-100 pt-5 space-y-3">
              <label className="block text-sm font-bold text-slate-700" htmlFor="estado-reclamo">Estado</label>
              <select id="estado-reclamo" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as EstadoReclamo)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1ea59c]">
                {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              <label className="block text-sm font-bold text-slate-700" htmlFor="notas-reclamo">Notas internas</label>
              <textarea id="notas-reclamo" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} placeholder="Acciones tomadas, respuesta enviada al consumidor..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1ea59c]" />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSeleccionado(null)}>Cancelar</Button>
                <Button variant="primary" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamosPage;
