import { useState, useEffect } from "react";

interface Coords {
    lat: number;
    lng: number;
}

export const useUserLocation = (enabled: boolean) => {
    const [location, setLocation] = useState<Coords | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        if (!("geolocation" in navigator)) {
            setError("Tu navegador no soporta geolocalización.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setError(null);
                setLoading(false);
            },
            () => {
                setError("No se pudo obtener tu ubicación. Verifica los permisos del navegador.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [enabled]);

    return { location, error, loading };
};
