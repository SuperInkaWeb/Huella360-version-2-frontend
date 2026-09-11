export interface GeocodeResult {
    lat: number;
    lng: number;
    displayName: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
    const params = new URLSearchParams({
        q: `${address}, Perú`,
        format: "json",
        limit: "1",
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
            "Accept-Language": "es",
        },
    });

    if (!response.ok) {
        throw new Error("No se pudo consultar el servicio de geocodificación.");
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }

    const first = results[0];
    return {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.display_name,
    };
};
