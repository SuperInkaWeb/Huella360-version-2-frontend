import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VerificarCorreoPantalla } from "./VerificarCorreoPantalla";

const renderPantalla = (props: Partial<Parameters<typeof VerificarCorreoPantalla>[0]> = {}) => {
    const defaults = {
        correo: "ana@test.pe",
        onReenviar: vi.fn().mockResolvedValue("Te enviamos un nuevo enlace de verificación. Revisa tu correo."),
        onYaVerifique: vi.fn().mockResolvedValue(true),
        onCerrarSesion: vi.fn(),
    };
    const all = { ...defaults, ...props };
    render(<VerificarCorreoPantalla {...all} />);
    return all;
};

describe("VerificarCorreoPantalla", () => {
    it("muestra el correo al que se envió el enlace", () => {
        renderPantalla();
        expect(screen.getByRole("heading", { name: "Verifica tu correo" })).toBeInTheDocument();
        expect(screen.getByText("ana@test.pe")).toBeInTheDocument();
    });

    it("muestra el mensaje del backend si llega uno", () => {
        renderPantalla({ mensaje: "Verifica tu correo con el enlace que te enviamos al registrarte." });
        expect(screen.getByText(/con el enlace que te enviamos al registrarte/)).toBeInTheDocument();
    });

    it("reenviar el enlace muestra la confirmación", async () => {
        const { onReenviar } = renderPantalla();
        fireEvent.click(screen.getByRole("button", { name: /Reenviar enlace/ }));

        expect(await screen.findByRole("status")).toHaveTextContent("Te enviamos un nuevo enlace");
        expect(onReenviar).toHaveBeenCalledTimes(1);
    });

    it("si el reenvío falla muestra el motivo (p. ej. esperar un minuto)", async () => {
        renderPantalla({ onReenviar: vi.fn().mockRejectedValue(new Error("Espera un minuto antes de pedir otro.")) });
        fireEvent.click(screen.getByRole("button", { name: /Reenviar enlace/ }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Espera un minuto");
    });

    it("si todavía no está verificado lo dice", async () => {
        renderPantalla({ onYaVerifique: vi.fn().mockResolvedValue(false) });
        fireEvent.click(screen.getByRole("button", { name: "Ya verifiqué mi correo" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Todavía no vemos tu correo verificado");
    });

    it("si ya está verificado no muestra error", async () => {
        const { onYaVerifique } = renderPantalla();
        fireEvent.click(screen.getByRole("button", { name: "Ya verifiqué mi correo" }));

        await waitFor(() => expect(onYaVerifique).toHaveBeenCalled());
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("permite cerrar sesión", () => {
        const { onCerrarSesion } = renderPantalla();
        fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/ }));
        expect(onCerrarSesion).toHaveBeenCalled();
    });
});
