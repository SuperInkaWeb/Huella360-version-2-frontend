import { useCallback, useEffect, useRef, useState } from "react";

/** Cada cuanto se piden los mensajes mientras el chat esta visible. */
export const CHAT_POLL_INTERVAL_MS = 10_000;
/** Sin mensajes nuevos ni actividad del usuario durante este tiempo, el chat se pausa. */
export const CHAT_IDLE_PAUSE_MS = 10 * 60_000;

interface UseChatPollingOptions {
  /** false cuando la consulta ya termino (FINALIZADA o CANCELADA). */
  enabled: boolean;
  /** Pide los mensajes al backend. */
  refresh: () => void;
  /** Valor que cambia cuando llegan mensajes nuevos (por ejemplo, la cantidad de mensajes). */
  activityKey: unknown;
}

/**
 * Pide los mensajes del chat cada cierto tiempo, pero solo cuando hace falta: cada pedido
 * consulta la base y, si nunca para, Neon no puede apagarse.
 * - No pide nada mientras la pestana esta oculta y se pone al dia al volver a ella.
 * - Tras CHAT_IDLE_PAUSE_MS sin mensajes nuevos ni actividad, se pausa hasta que el usuario
 *   lo reanude, escriba o vuelva a la pestana.
 */
export function useChatPolling({ enabled, refresh, activityKey }: UseChatPollingOptions) {
  const [paused, setPaused] = useState(false);
  const lastActivityRef = useRef(0);
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Llegaron mensajes nuevos (o se monto el chat): cuenta como actividad.
  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, [activityKey]);

  /** El usuario hizo algo en el chat (escribir, enviar): reinicia el tiempo y quita la pausa. */
  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setPaused(false);
  }, []);

  /** Boton "Reanudar": quita la pausa y se pone al dia de inmediato. */
  const resume = useCallback(() => {
    markActivity();
    refreshRef.current();
  }, [markActivity]);

  useEffect(() => {
    if (!enabled || paused) return;

    const tick = () => {
      if (document.hidden) return;
      if (Date.now() - lastActivityRef.current >= CHAT_IDLE_PAUSE_MS) {
        setPaused(true);
        return;
      }
      refreshRef.current();
    };

    const onVisibilityChange = () => {
      if (document.hidden) return;
      // Volver a la pestana es actividad: ponerse al dia sin esperar al siguiente intervalo.
      lastActivityRef.current = Date.now();
      refreshRef.current();
    };

    const intervalId = setInterval(tick, CHAT_POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, paused]);

  return { paused: enabled && paused, resume, markActivity };
}
