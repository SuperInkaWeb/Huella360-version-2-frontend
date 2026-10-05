import { DIAS_SEMANA } from "../../empresa/types/horario.types";
import type { HorarioAtencion, DiaSemana } from "../../empresa/types/horario.types";
import { rangoInvalido } from "./horarioAtencion";

interface HorarioSemanalEditorProps {
    horarios: HorarioAtencion[];
    onChange: (dia: DiaSemana, campo: keyof HorarioAtencion, valor: string | number | boolean) => void;
    /** Cupo simultaneo: solo aplica a empresas (un veterinario atiende una cita a la vez). */
    mostrarCapacidad?: boolean;
}

export const HorarioSemanalEditor = ({ horarios, onChange, mostrarCapacidad = true }: HorarioSemanalEditorProps) => (
    <div className="space-y-3">
        {horarios.map((h) => {
            const label = DIAS_SEMANA.find((d) => d.value === h.diaSemana)?.label || h.diaSemana;
            const invalido = rangoInvalido(h);
            const inputClass = `w-full px-3 py-2 rounded-xl border bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 disabled:bg-slate-100 ${invalido ? "border-red-300" : "border-slate-200"}`;
            return (
                <div
                    key={h.diaSemana}
                    className={`p-4 rounded-2xl border transition-all ${h.activo ? "border-primary/20 bg-primary/5" : "border-slate-100 bg-slate-50"}`}
                >
                    <div className={`grid grid-cols-1 items-center gap-3 ${mostrarCapacidad ? "sm:grid-cols-[auto_1fr_1fr_auto]" : "sm:grid-cols-[auto_1fr]"}`}>
                        <label className="flex items-center gap-2 min-w-[120px]">
                            <input
                                type="checkbox"
                                checked={h.activo}
                                onChange={(e) => onChange(h.diaSemana, "activo", e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm font-semibold text-slate-700">{label}</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                aria-label={`${label}: hora de inicio`}
                                value={h.horaInicio}
                                disabled={!h.activo}
                                onChange={(e) => onChange(h.diaSemana, "horaInicio", e.target.value)}
                                className={inputClass}
                            />
                            <span className="text-slate-400 text-sm">a</span>
                            <input
                                type="time"
                                aria-label={`${label}: hora de fin`}
                                value={h.horaFin}
                                disabled={!h.activo}
                                onChange={(e) => onChange(h.diaSemana, "horaFin", e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {mostrarCapacidad && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 whitespace-nowrap">Cupo simultáneo</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={h.capacidad}
                                    disabled={!h.activo}
                                    onChange={(e) => onChange(h.diaSemana, "capacidad", Math.max(1, Number(e.target.value)))}
                                    className="w-20 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 disabled:bg-slate-100"
                                />
                            </div>
                        )}
                    </div>
                    {invalido && (
                        <p className="text-xs text-red-500 mt-2">La hora de fin debe ser posterior a la hora de inicio.</p>
                    )}
                </div>
            );
        })}
    </div>
);
