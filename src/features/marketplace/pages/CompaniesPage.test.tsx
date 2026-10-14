import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// H360-GEO-005: el directorio de empresas muestra la distancia en cada tarjeta cuando hay un punto de búsqueda.

const { getAllCompanies, getCercanos } = vi.hoisted(() => ({
  getAllCompanies: vi.fn(),
  getCercanos: vi.fn(),
}));

vi.mock("../services/marketplaceService", () => ({ marketplaceService: { getAllCompanies, getCercanos } }));
vi.mock("../../auth/context/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, role: null }) }));

import { CompaniesPage } from "./CompaniesPage";

const empresa = (id: number, nombre: string, lat?: number, lng?: number) => ({
  id, nombreComercial: nombre, tipoServicio: "VETERINARIA", descripcion: "", direccion: "Av. Prueba", ciudad: "Lima",
  latitud: lat, longitud: lng, logoUrl: "",
});

describe("CompaniesPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    getCercanos.mockReset().mockResolvedValue([]);
    getAllCompanies.mockReset().mockResolvedValue({
      content: [empresa(1, "Con ubicación", -12.1121, -77.0297), empresa(2, "Sin ubicación")],
      totalPages: 1,
    });
  });

  it("con punto de búsqueda: distancia en las empresas que tienen ubicación", async () => {
    sessionStorage.setItem("huella360.origenBusqueda", JSON.stringify({ lat: -12.1211, lng: -77.0297, etiqueta: "Miraflores", fuente: "distrito" }));

    render(<MemoryRouter><CompaniesPage /></MemoryRouter>);

    expect(await screen.findByText("Con ubicación")).toBeInTheDocument();
    expect(screen.getByText("a 1,0 km")).toBeInTheDocument();
    expect(screen.getAllByText(/^a \d/)).toHaveLength(1);
  });

  it("sin punto de búsqueda: las tarjetas no muestran distancia", async () => {
    render(<MemoryRouter><CompaniesPage /></MemoryRouter>);

    expect(await screen.findByText("Con ubicación")).toBeInTheDocument();
    expect(screen.queryByText(/^a \d/)).not.toBeInTheDocument();
    expect(getCercanos).not.toHaveBeenCalled();
  });
});
