import { useState, useEffect } from "react";
import { repartidorService } from "../services/repartidorService";

interface LocationData {
    lat: number;
    lng: number;
}

export const useGeolocation = (isTrackingActive: boolean, onLocationUpdate?: (lat: number, lng: number) => void) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isTrackingActive || !("geolocation" in navigator)) {
            setError(!("geolocation" in navigator) ? "Geolocalización no soportada" : null);
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            
            setLocation(newLocation);
            setError(null);

            if (onLocationUpdate) {
                onLocationUpdate(latitude, longitude);
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