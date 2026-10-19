// H360-SEC-002: el backend responde 403 con error=EMAIL_NOT_VERIFIED cuando la cuenta
// tiene el correo sin verificar. En vez de un "Acceso denegado", la app muestra la
// pantalla de verificación (AuthContext escucha este evento).
export const EVENTO_CORREO_NO_VERIFICADO = "huella360:correo-no-verificado";

export const esCorreoNoVerificado = (data?: { error?: string }) =>
    data?.error === "EMAIL_NOT_VERIFIED";

export const avisarCorreoNoVerificado = (mensaje?: string) => {
    window.dispatchEvent(new CustomEvent(EVENTO_CORREO_NO_VERIFICADO, { detail: { mensaje } }));
};
