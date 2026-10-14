import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// H360-GEO-005: "Cerca de ti" ordena negocios y veterinarios por distancia desde la ubicación guardada
// del cliente, el GPS o un distrito escrito a mano.

const { getCercanos, getMyProfile, geocodeAddress, auth } = vi.hoisted(() => ({
  getCercanos: vi.fn(),
  getMyProfile: vi.fn(),
  geocodeAddress: vi.fn(),
  auth: { isAuthenticated: false, role: null as string | null },
}));

vi.mock("../services/marketplaceService", () => ({ marketplaceService: { getCercanos } }));
vi.mock("../../dashboard/cliente/services/clienteService", () => ({ clienteService: { getMyProfile } }));
vi.mock("../../../shared/utils/geocoding", () => ({ geocodeAddress }));
vi.mock("../../auth/context/useAuth", () => ({ useAuth: () => auth }));

import { CercaDeTi } from "./CercaDeTi";
import { useOrigenBusqueda } from "../hooks/useOrigenBusqueda";

const Pantalla = () => <CercaDeTi origen={useOrigenBusqueda()} />;
const renderSeccion = () => render(<MemoryRouter><Pantalla /></MemoryRouter>);

const LUGARES = [
  { tipo: "EMPRESA", id: 2, nombre: "Veterinaria Grau", categoria: "VETERINARIA", direccion: "Av. Grau 100", ciudad: "Piura", imagenUrl: null, latitud: -5.19, longitud: -80.63, distanciaKm: 0.45 },
  { tipo: "VETERINARIO", id: 7, nombre: "Ana Ruiz", categoria: "Felinos", direccion: "Calle Lima 5", ciudad: "Piura", imagenUrl: null, latitud: -5.18, longitud: -80.63, distanciaKm: 1.26 },
];

describe("CercaDeTi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    auth.isAuthenticated = false;
    auth.role = null;
    getCercanos.mockReset().mockResolvedValue(LUGARES);
    getMyProfile.mockReset();
    geocodeAddress.mockReset();
  });

  it("cliente con ubicación guardada: busca desde ahí y muestra la distancia en cada tarjeta", async () => {
    auth.isAuthenticated = true;
    auth.role = "CLIENTE";
    getMyProfile.mockResolvedValue({ direccion: "Av. Grau 500", ciudad: "Piura", ubicacionLat: -5.2063, ubicacionLng: -80.6219 });

    renderSeccion();

    expect(await screen.findByText("Av. Grau 500, Piura")).toBeInTheDocument();
    await waitFor(() =>
      expect(getCercanos).toHaveBeenCalledWith({ lat: -5.2063, lng: -80.6219, radioKm: 5, limite: 24 })
    );
    const tarjetas = await screen.findAllByRole("listitem");
    expect(within(tarjetas[0]).getByText("Veterinaria Grau")).toBeInTheDocument();
    expect(within(tarjetas[0]).getByText("a 450 m")).toBeInTheDocument();
    expect(within(tarjetas[0]).getByRole("link")).toHaveAttribute("href", "/empresa/2");
    expect(within(tarjetas[1]).getByText("a 1,3 km")).toBeInTheDocument();
    expect(within(tarjetas[1]).getByText("Veterinario · Felinos")).toBeInTheDocument();
  });

  it("sin ubicación: no busca hasta que se escribe un distrito", async () => {
    geocodeAddress.mockResolvedValue({ lat: -12.1211, lng: -77.0297, displayName: "Miraflores" });

    renderSeccion();

    expect(screen.getByText(/Elige desde dónde buscar/)).toBeInTheDocument();
    expect(getCercanos).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Distrito"), "Miraflores, Lima");
    await userEvent.click(screen.getByRole("button", { name: "Buscar distrito" }));

    expect(geocodeAddress).toHaveBeenCalledWith("Miraflores, Lima");
    await waitFor(() =>
      expect(getCercanos).toHaveBeenCalledWith({ lat: -12.1211, lng: -77.0297, radioKm: 5, limite: 24 })
    );
    expect(screen.getByText("Miraflores, Lima")).toBeInTheDocument();
  });

  it("distrito no encontrado: avisa y no busca", async () => {
    geocodeAddress.mockResolvedValue(null);

    renderSeccion();
    await userEvent.type(screen.getByLabelText("Distrito"), "Zzzz");
    await userEvent.click(screen.getByRole("button", { name: "Buscar distrito" }));

    expect(await screen.findByText(/No encontramos "Zzzz"/)).toBeInTheDocument();
    expect(getCercanos).not.toHaveBeenCalled();
  });

  it("el radio y el tipo cambian la búsqueda", async () => {
    sessionStorage.setItem("huella360.origenBusqueda", JSON.stringify({ lat: -5.19, lng: -80.63, etiqueta: "Castilla", fuente: "distrito" }));

    renderSeccion();
    await waitFor(() => expect(getCercanos).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole("button", { name: "10 km" }));
    await waitFor(() => expect(getCercanos).toHaveBeenLastCalledWith({ lat: -5.19, lng: -80.63, radioKm: 10, limite: 24 }));

    await userEvent.click(screen.getByRole("button", { name: "Clínicas" }));
    await waitFor(() =>
      expect(getCercanos).toHaveBeenLastCalledWith({ lat: -5.19, lng: -80.63, radioKm: 10, limite: 24, tipoServicio: "VETERINARIA" })
    );

    await userEvent.click(screen.getByRole("button", { name: "Veterinarios" }));
    await waitFor(() =>
      expect(getCercanos).toHaveBeenLastCalledWith({ lat: -5.19, lng: -80.63, radioKm: 10, limite: 24, tipo: "VETERINARIO" })
    );
  });

  it("sin resultados: sugiere un radio mayor", async () => {
    sessionStorage.setItem("huella360.origenBusqueda", JSON.stringify({ lat: -5.19, lng: -80.63, etiqueta: "Castilla", fuente: "distrito" }));
    getCercanos.mockResolvedValue([]);

    renderSeccion();

    expect(await screen.findByText(/No encontramos resultados a menos de 5 km. Prueba con un radio mayor./)).toBeInTheDocument();
  });

  it("el punto elegido en la sesión tiene prioridad sobre la ubicación guardada, que queda como opción", async () => {
    auth.isAuthenticated = true;
    auth.role = "CLIENTE";
    getMyProfile.mockResolvedValue({ direccion: "Av. Grau 500", ciudad: "Piura", ubicacionLat: -5.2063, ubicacionLng: -80.6219 });
    sessionStorage.setItem("huella360.origenBusqueda", JSON.stringify({ lat: -12.12, lng: -77.03, etiqueta: "Miraflores", fuente: "distrito" }));

    renderSeccion();

    const volver = await screen.findByRole("button", { name: "Mi ubicación guardada" });
    expect(screen.getByText("Miraflores")).toBeInTheDocument();

    await userEvent.click(volver);
    expect(await screen.findByText("Av. Grau 500, Piura")).toBeInTheDocument();
    await waitFor(() => expect(getCercanos).toHaveBeenLastCalledWith({ lat: -5.2063, lng: -80.6219, radioKm: 5, limite: 24 }));
    expect(sessionStorage.getItem("huella360.origenBusqueda")).toBeNull();
  });

  it("cliente sin ubicación guardada: le sugiere guardarla en Configuración", async () => {
    auth.isAuthenticated = true;
    auth.role = "CLIENTE";
    getMyProfile.mockResolvedValue({ direccion: "", ubicacionLat: null, ubicacionLng: null });

    renderSeccion();

    await waitFor(() => expect(getMyProfile).toHaveBeenCalled());
    expect(screen.getByRole("link", { name: "Guarda tu ubicación en Configuración" })).toHaveAttribute(
      "href",
      "/portal/cliente/configuracion"
    );
  });
});
