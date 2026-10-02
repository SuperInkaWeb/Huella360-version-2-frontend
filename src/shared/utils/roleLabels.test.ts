import { describe, it, expect } from "vitest";
import { getPortalName, getRoleLabel } from "./roleLabels";

describe("roleLabels", () => {
  it("traduce los roles de dueño y veterinario a nombres legibles", () => {
    expect(getRoleLabel("CLIENTE")).toBe("Dueño de mascota");
    expect(getRoleLabel("VETERINARIO")).toBe("Veterinario");
    expect(getPortalName("CLIENTE")).toBe("Portal del dueño de mascota");
    expect(getPortalName("VETERINARIO")).toBe("Portal profesional veterinario");
  });

  it("distingue el panel del negocio y el de administración (H360-UX-002)", () => {
    expect(getRoleLabel("EMPRESA")).toBe("Empresa");
    expect(getPortalName("EMPRESA")).toBe("Panel del negocio");
    expect(getRoleLabel("ADMIN")).toBe("Administrador");
  });

  it("usa un texto genérico si el rol no existe o no llegó", () => {
    expect(getRoleLabel(null)).toBe("Usuario");
    expect(getRoleLabel("OTRO")).toBe("Usuario");
    expect(getPortalName(undefined)).toBe("Mi portal");
  });
});
