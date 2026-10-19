import { describe, it, expect, vi } from "vitest";
import { EVENTO_CORREO_NO_VERIFICADO, avisarCorreoNoVerificado, esCorreoNoVerificado } from "./correoNoVerificado";

describe("correoNoVerificado", () => {
    it("reconoce el código del backend", () => {
        expect(esCorreoNoVerificado({ error: "EMAIL_NOT_VERIFIED" })).toBe(true);
        expect(esCorreoNoVerificado({ error: "Forbidden" })).toBe(false);
        expect(esCorreoNoVerificado(undefined)).toBe(false);
    });

    it("avisa a la app con el mensaje del backend", () => {
        const listener = vi.fn();
        window.addEventListener(EVENTO_CORREO_NO_VERIFICADO, listener);

        avisarCorreoNoVerificado("Verifica tu correo");

        expect(listener).toHaveBeenCalledTimes(1);
        expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ mensaje: "Verifica tu correo" });
        window.removeEventListener(EVENTO_CORREO_NO_VERIFICADO, listener);
    });
});
