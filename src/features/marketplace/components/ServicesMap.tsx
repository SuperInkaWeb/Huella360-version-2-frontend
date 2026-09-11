import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CompanyResponse } from "../types/marketplace";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: "user-location-marker",
});

interface ServicesMapProps {
    companies: CompanyResponse[];
    userLocation?: { lat: number; lng: number } | null;
}

const FALLBACK_CENTER: [number, number] = [-12.0464, -77.0428];

const FitBounds = ({ companies, userLocation }: { companies: CompanyResponse[]; userLocation?: { lat: number; lng: number } | null }) => {
    const map = useMap();

    useEffect(() => {
        const points: L.LatLngTuple[] = companies
            .filter((c) => c.latitud != null && c.longitud != null)
            .map((c) => [c.latitud as number, c.longitud as number]);

        if (userLocation) points.push([userLocation.lat, userLocation.lng]);

        if (points.length > 0) {
            map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
        }
    }, [companies, userLocation, map]);

    return null;
};

export const ServicesMap = ({ companies, userLocation }: ServicesMapProps) => {
    const navigate = useNavigate();
    const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : FALLBACK_CENTER;

    return (
        <div className="h-[500px] w-full rounded-md overflow-hidden border border-slate-200 relative z-0">
            <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                        <Popup>Tu ubicación</Popup>
                    </Marker>
                )}

                {companies.map((company) =>
                    company.latitud != null && company.longitud != null ? (
                        <Marker
                            key={company.id}
                            position={[company.latitud, company.longitud]}
                            eventHandlers={{
                                mouseover: (e) => e.target.openPopup(),
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-800">{company.nombreComercial}</p>
                                    <p className="text-slate-500">{company.direccion}{company.ciudad ? `, ${company.ciudad}` : ""}</p>
                                    <button
                                        onClick={() => navigate(`/empresa/${company.id}`)}
                                        className="mt-1 text-[#3483fa] hover:underline text-xs font-medium"
                                    >
                                        Ver perfil →
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                )}

                <FitBounds companies={companies} userLocation={userLocation} />
            </MapContainer>
        </div>
    );
};
