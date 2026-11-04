import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHAT_IDLE_PAUSE_MS, CHAT_POLL_INTERVAL_MS, useChatPolling } from "./useChatPolling";

let hidden = false;

function setHidden(value: boolean) {
  hidden = value;
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useChatPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    hidden = false;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pide los mensajes cada 10 s con la pestaña visible", () => {
    const refresh = vi.fn();
    renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS - 1));
    expect(refresh).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(refresh).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS * 2));
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("no pide nada si la consulta ya terminó", () => {
    const refresh = vi.fn();
    renderHook(() => useChatPolling({ enabled: false, refresh, activityKey: 0 }));

    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS * 10));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("no pide nada con la pestaña oculta y se pone al día al volver", () => {
    const refresh = vi.fn();
    renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => setHidden(true));
    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS * 30));
    expect(refresh).not.toHaveBeenCalled();

    act(() => setHidden(false));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("al volver a la pestaña tras mucho tiempo no se pausa: cuenta como actividad", () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => setHidden(true));
    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS * 2));
    act(() => setHidden(false));
    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS));

    expect(result.current.paused).toBe(false);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("se pausa tras 10 min sin actividad y deja de pedir mensajes", () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS));
    expect(result.current.paused).toBe(true);
    const llamadas = refresh.mock.calls.length;

    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS));
    expect(refresh).toHaveBeenCalledTimes(llamadas);
  });

  it("los mensajes nuevos retrasan la pausa", () => {
    const refresh = vi.fn();
    const { result, rerender } = renderHook(
      ({ key }) => useChatPolling({ enabled: true, refresh, activityKey: key }),
      { initialProps: { key: 0 } },
    );

    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS - CHAT_POLL_INTERVAL_MS));
    rerender({ key: 1 });
    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS * 2));

    expect(result.current.paused).toBe(false);
  });

  it("escribir quita la pausa", () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS));
    expect(result.current.paused).toBe(true);

    act(() => result.current.markActivity());
    expect(result.current.paused).toBe(false);
    const llamadas = refresh.mock.calls.length;

    act(() => vi.advanceTimersByTime(CHAT_POLL_INTERVAL_MS));
    expect(refresh).toHaveBeenCalledTimes(llamadas + 1);
  });

  it("Reanudar quita la pausa y pide los mensajes de inmediato", () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useChatPolling({ enabled: true, refresh, activityKey: 0 }));

    act(() => vi.advanceTimersByTime(CHAT_IDLE_PAUSE_MS));
    const llamadas = refresh.mock.calls.length;

    act(() => result.current.resume());
    expect(result.current.paused).toBe(false);
    expect(refresh).toHaveBeenCalledTimes(llamadas + 1);
  });
});
