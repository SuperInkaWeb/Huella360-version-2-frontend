import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./useGeolocation";

vi.mock("../services/repartidorService", () => ({
  repartidorService: { actualizarUbicacion: vi.fn(() => Promise.resolve()) },
}));

type Exito = (p: GeolocationPosition) => void;
let emitir: Exito | null = null;
const clearWatch = vi.fn();

const lectura = (lat: number, lng = -77.04) =>
  ({ coords: { latitude: lat, longitude: lng } }) as unknown as GeolocationPosition;

// 0,001 grados de latitud son unos 111 m.
const LAT = -12.05;
const mover = (metros: number) => lectura(LAT + metros / 111_000);

describe("useGeolocation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    emitir = null;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        watchPosition: vi.fn((ok: Exito) => {
          emitir = ok;
          return 1;
        }),
        clearWatch,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra cada lectura pero envía como máximo una cada 15 s en reparto", () => {
    const enviar = vi.fn();
    const { result } = renderHook(() => useGeolocation(true, enviar, true));

    act(() => emitir!(mover(0)));
    for (let i = 1; i <= 5; i++) {
      act(() => {
        vi.advanceTimersByTime(2_000);
        emitir!(mover(i * 30));
      });
    }

    expect(result.current.location?.lat).toBeCloseTo(LAT + 150 / 111_000, 6);
    expect(enviar).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(15_000);
      emitir!(mover(300));
    });
    expect(enviar).toHaveBeenCalledTimes(2);
  });

  it("usa la última versión del callback, no la del primer render", () => {
    const primero = vi.fn();
    const segundo = vi.fn();
    const { rerender } = renderHook(({ cb }) => useGeolocation(true, cb, true), {
      initialProps: { cb: primero },
    });

    act(() => emitir!(mover(0)));
    rerender({ cb: segundo });
    act(() => {
      vi.advanceTimersByTime(15_000);
      emitir!(mover(100));
    });

    expect(primero).toHaveBeenCalledTimes(1);
    expect(segundo).toHaveBeenCalledTimes(1);
  });

  it("solo disponible: espera 60 s entre envíos", () => {
    const enviar = vi.fn();
    renderHook(() => useGeolocation(true, enviar, false));

    act(() => emitir!(mover(0)));
    act(() => {
      vi.advanceTimersByTime(30_000);
      emitir!(mover(200));
    });
    expect(enviar).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(30_000);
      emitir!(mover(400));
    });
    expect(enviar).toHaveBeenCalledTimes(2);
  });

  it("no sigue el GPS si el seguimiento está apagado", () => {
    renderHook(() => useGeolocation(false, vi.fn()));
    expect(navigator.geolocation.watchPosition).not.toHaveBeenCalled();
  });
});
