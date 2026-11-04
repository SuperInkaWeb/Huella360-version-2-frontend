import { describe, expect, it } from "vitest";
import { debeEnviarUbicacion, LIMITES_UBICACION } from "./limiteUbicacion";

// En Lima, 0,001 grados de latitud son unos 111 m.
const BASE = { lat: -12.05, lng: -77.04 };
const aMetrosAlNorte = (m: number) => ({ lat: BASE.lat + m / 111_000, lng: BASE.lng });

describe("debeEnviarUbicacion", () => {
  const ultima = { ...BASE, enviadaEn: 0 };

  it("envía siempre la primera lectura", () => {
    expect(debeEnviarUbicacion(null, BASE, 0, false)).toBe(true);
  });

  it("en reparto: no envía antes de 15 s aunque se haya movido", () => {
    const t = LIMITES_UBICACION.enReparto.intervaloMs - 1;
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(500), t, true)).toBe(false);
  });

  it("en reparto: envía a los 15 s si se movió 20 m o más", () => {
    const t = LIMITES_UBICACION.enReparto.intervaloMs;
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(25), t, true)).toBe(true);
  });

  it("no envía si el repartidor está detenido, pase el tiempo que pase", () => {
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(5), 3_600_000, true)).toBe(false);
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(5), 3_600_000, false)).toBe(false);
  });

  it("solo disponible: espera 60 s y 50 m", () => {
    const t = LIMITES_UBICACION.disponible.intervaloMs;
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(500), t - 1, false)).toBe(false);
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(30), t, false)).toBe(false);
    expect(debeEnviarUbicacion(ultima, aMetrosAlNorte(60), t, false)).toBe(true);
  });
});
