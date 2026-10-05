import { DIAS_SEMANA } from "../../empresa/types/horario.types";
import type { HorarioAtencion } from "../../empresa/types/horario.types";

/** Los 7 dias de la semana: los que ya existen en el backend y, para el resto, uno inactivo por defecto. */
export const buildDefaultHorarios = (existentes: HorarioAtencion[]): HorarioAtencion[] =>
    DIAS_SEMANA.map(({ value }) => {
        const existente = existentes.find((h) => h.diaSemana === value);
        return (
            existente || {
                diaSemana: value,
                horaInicio: "09:00",
                horaFin: "18:00",
                capacidad: 1,
                activo: false,
            }
        );
    });

/** Un dia activo con rango invertido o vacio (p. ej. 18:00 a 09:00) no genera ningun bloque reservable. */
export const rangoInvalido = (h: HorarioAtencion): boolean =>
    h.activo && h.horaFin.slice(0, 5) <= h.horaInicio.slice(0, 5);

/** Mensaje del primer dia con rango invalido, o null si todos son validos. */
export const validarHorarios = (horarios: HorarioAtencion[]): string | null => {
    const invalido = horarios.find(rangoInvalido);
    if (!invalido) return null;
    const label = DIAS_SEMANA.find((d) => d.value === invalido.diaSemana)?.label || invalido.diaSemana;
    return `${label}: la hora de fin debe ser posterior a la hora de inicio.`;
};
