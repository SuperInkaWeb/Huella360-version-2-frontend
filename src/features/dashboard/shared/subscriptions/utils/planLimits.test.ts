import { describe, it, expect } from "vitest";
import { limiteAlcanzado, textoLimitePlan, textoUsoPlan } from "./planLimits";

describe("planLimits", () => {
  it("un límite 0 significa 'no incluido', no ilimitado", () => {
    expect(textoLimitePlan(0, "mascotas", "Mascotas ilimitadas")).toBeNull();
    expect(textoUsoPlan(0, 0)).toBe("No incluido");
  });

  it("-1 o null es ilimitado", () => {
    expect(textoLimitePlan(-1, "productos", "Productos ilimitados")).toBe("Productos ilimitados");
    expect(textoLimitePlan(null, "productos", "Productos ilimitados")).toBe("Productos ilimitados");
    expect(textoUsoPlan(12, -1)).toBe("12/∞");
  });

  it("un límite positivo se muestra como 'Hasta N' y el uso como actual/máximo", () => {
    expect(textoLimitePlan(4, "servicios", "Servicios ilimitados")).toBe("Hasta 4 servicios");
    expect(textoUsoPlan(3, 4)).toBe("3/4");
  });

  it("marca el límite alcanzado solo con límites finitos", () => {
    expect(limiteAlcanzado(4, 4)).toBe(true);
    expect(limiteAlcanzado(3, 4)).toBe(false);
    expect(limiteAlcanzado(50, -1)).toBe(false);
    expect(limiteAlcanzado(0, 0)).toBe(false);
  });
});
