import { useState, useEffect, useRef } from "react";
import { repartidorService } from "../services/repartidorService";
import { debeEnviarUbicacion, type UbicacionEnviada } from "./limiteUbicacion";

interface LocationData {
    lat: number;
    lng: number;
}

/**
 * Sigue el GPS del repartidor y envia su ubicacion al backend con un limite de frecuencia
 * (ver limiteUbicacion.ts). La ubicacion en pantalla se actualiza siempre.
 *
 * @param enReparto true si tiene un pedido en curso: envia con mas frecuencia.
 */
export const useGeolocation = (
    isTrackingActive: boolean,
    onLocationUpdate?: (lat: number, lng: number) => void,
    enReparto = false,
) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Siempre la ultima version del callback y del modo: el watch del GPS se crea una sola vez.
    const onLocationUpdateRef = useRef(onLocationUpdate);
    const enRepartoRef = useRef(enReparto);
    const ultimaEnviadaRef = useRef<UbicacionEnviada | null>(null);

    useEffect(() => {
        onLocationUpdateRef.current = onLocationUpdate;
        enRepartoRef.current = enReparto;
    }, [onLocationUpdate, enReparto]);

    useEffect(() => {
        if (!isTrackingActive || !("geolocation" in navigator)) {
            setError(!("geolocation" in navigator) ? "Geolocalización no soportada" : null);
            return;
        }

        // Al (re)activar el seguimiento, la primera lectura se envia de inmediato.
        ultimaEnviadaRef.current = null;

        const handleSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };

            setLocation(newLocation);
            setError(null);

            const ahora = Date.now();
            if (!debeEnviarUbicacion(ultimaEnviadaRef.current, newLocation, ahora, enRepartoRef.current)) {
                return;
            }
            ultimaEnviadaRef.current = { ...newLocation, enviadaEn: ahora };

            const callback = onLocationUpdateRef.current;
            if (callback) {
                callback(latitude, longitude);
            } else {
                repartidorService.actualizarUbicacion(latitude, longitude)
                    .catch(err => console.error("Error enviando ubicación al backend:", err));
            }
        };

        const handleError = (error: GeolocationPositionError) => {
            console.error("Error de GPS:", error.message);
            setError("No se pudo obtener la ubicación. Verifica los permisos de tu dispositivo.");
        };

        const watchId = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isTrackingActive]);

    return { location, error };
};
