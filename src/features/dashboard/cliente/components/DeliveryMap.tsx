import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Iconos custom
const storeIcon = L.divIcon({
 html: '<div style="background:#4F46E5;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏪</div>',
 iconSize: [32, 32], iconAnchor: [16, 16], className: "",
});

const homeIcon = L.divIcon({
 html: '<div style="background:#16A34A;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">🏠</div>',
 iconSize: [32, 32], iconAnchor: [16, 16], className: "",
});

const riderIcon = L.divIcon({
 html: '<div style="background:#EF4444;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:bold;box-shadow:0 2px 12px rgba(239,68,68,0.5);border:2px solid white;animation:pulse 2s infinite;">🏍️</div>',
 iconSize: [36, 36], iconAnchor: [18, 18], className: "",
});

interface DeliveryMapProps {
 origenLat: number;
 origenLng: number;
 origenDireccion: string;
 destinoLat: number;
 destinoLng: number;
 destinoDireccion: string;
 repartidorLat?: number | null;
 repartidorLng?: number | null;
 repartidorNombre?: string | null;
}

const FitBounds = ({ points }: { points: [number, number][] }) => {
 const map = useMap();
 useEffect(() => {
 if (points.length >= 2) {
 const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
 map.fitBounds(bounds, { padding: [40, 40] });
 } else if (points.length === 1) {
 map.setView(points[0], 15);
 }
 }, [points, map]);
 return null;
};

export const DeliveryMap = ({
 origenLat, origenLng, origenDireccion,
 destinoLat, destinoLng, destinoDireccion,
 repartidorLat, repartidorLng, repartidorNombre
}: DeliveryMapProps) => {
 const center: [number, number] = [
 (origenLat + destinoLat) / 2,
 (origenLng + destinoLng) / 2,
 ];

 const allPoints: [number, number][] = [
 [origenLat, origenLng],
 [destinoLat, destinoLng],
 ];
 if (repartidorLat && repartidorLng) {
 allPoints.push([repartidorLat, repartidorLng]);
 }

 return (
 <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
 <style>{`
 @keyframes pulse {
 0%, 100% { transform: scale(1); }
 50% { transform: scale(1.1); }
 }
 `}</style>
 <MapContainer
 center={center}
 zoom={14}
 scrollWheelZoom={true}
 style={{ height: "100%", width: "100%" }}
 >
 <TileLayer
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 />
 <FitBounds points={allPoints} />

 {/* Origen: Tienda */}
 <Marker position={[origenLat, origenLng]} icon={storeIcon}>
 <Popup>
 <strong>📦 Recogida</strong><br />{origenDireccion}
 </Popup>
 </Marker>

 {/* Destino: Casa del cliente */}
 <Marker position={[destinoLat, destinoLng]} icon={homeIcon}>
 <Popup>
 <strong>🏠 Tu dirección</strong><br />{destinoDireccion}
 </Popup>
 </Marker>

 {/* Repartidor */}
 {repartidorLat && repartidorLng && (
 <Marker position={[repartidorLat, repartidorLng]} icon={riderIcon}>
 <Popup>
 <strong>🏍️ {repartidorNombre || "Repartidor"}</strong><br />En movimiento
 </Popup>
 </Marker>
 )}
 </MapContainer>
 </div>
 );
};
