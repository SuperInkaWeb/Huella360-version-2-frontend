import { describe, it, expect } from 'vitest';
import { hoyLocal, aLocalDateTime, parseFecha } from './fechas';

// H360: en QA (25-09-2026) un recordatorio de las 10:30 se guardaba y mostraba a las 15:30, una cita del
// 29-09 aparecia como "28 set." y despues de las 19:00 "hoy" pasaba a ser manana (se calculaba en UTC).

describe('fechas', () => {
  it('hoyLocal usa el dia local aunque en UTC ya sea el dia siguiente', () => {
    // 25-09 a las 21:30 hora local (en Lima ya es 26-09 en UTC)
    expect(hoyLocal(new Date(2026, 8, 25, 21, 30))).toBe('2026-09-25');
  });

  it('aLocalDateTime conserva la hora elegida en el formulario', () => {
    expect(aLocalDateTime('2026-10-10T10:30')).toBe('2026-10-10T10:30:00');
  });

  it('aLocalDateTime no toca valores que ya traen segundos', () => {
    expect(aLocalDateTime('2026-10-10T10:30:15')).toBe('2026-10-10T10:30:15');
  });

  it('parseFecha toma un LocalDate como medianoche local (no corre al dia anterior)', () => {
    const d = parseFecha('2026-09-29');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 29, 0]);
  });

  it('parseFecha interpreta un LocalDateTime como hora local', () => {
    const d = parseFecha('2026-10-10T10:30:00');
    expect([d.getDate(), d.getHours(), d.getMinutes()]).toEqual([10, 10, 30]);
  });
});
