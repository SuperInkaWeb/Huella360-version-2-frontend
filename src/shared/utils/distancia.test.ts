import { describe, it, expect } from "vitest";
import { distanciaKm, formatearDistancia } from "./distancia";

describe("distanciaKm", () => {
  it("es 0 para el mismo punto", () => {
    expect(distanciaKm({ lat: -5.19, lng: -80.63 }, { lat: -5.19, lng: -80.63 })).toBe(0);
  });

  it("mide ~1 km por cada 0,009 grados de latitud", () => {
    expect(distanciaKm({ lat: -12.1211, lng: -77.0297 }, { lat: -12.1121, lng: -77.0297 })).toBeCloseTo(1.0, 1);
  });

  it("Piura a Lima en línea recta: ~860 km", () => {
    const km = distanciaKm({ lat: -5.1945, lng: -80.6328 }, { lat: -12.0464, lng: -77.03 });
    expect(km).toBeGreaterThan(845);
    expect(km).toBeLessThan(875);
  });
});

describe("formatearDistancia", () => {
  it("menos de 1 km en metros, redondeado a decenas", () => {
    expect(formatearDistancia(0.853)).toBe("a 850 m");
    expect(formatearDistancia(0.001)).toBe("a 10 m");
  });

  it("hasta 10 km con un decimal y coma", () => {
    expect(formatearDistancia(1.24)).toBe("a 1,2 km");
    expect(formatearDistancia(9.94)).toBe("a 9,9 km");
  });

  it("desde 10 km sin decimales", () => {
    expect(formatearDistancia(15.4)).toBe("a 15 km");
  });
});
