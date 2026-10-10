import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Lock, Unlock, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const STREET_ZOOM = 16;

interface MapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
    /** Con false el mapa queda siempre editable y sin la barra de bloqueo (registro de la empresa). */
    lockable?: boolean;
}

interface LocationMarkerProps extends MapPickerProps {
    isLocked: boolean;
}

const LocationMarker = ({ lat, lng, onChange, isLocked }: LocationMarkerProps) => {
    const map = useMap();
    // Si el punto lo movió el usuario sobre el mapa no hace falta recentrar; si llegó de fuera
    // (dirección buscada, GPS, datos guardados), el mapa se mueve hasta él.
    const movedOnMap = useRef(false);

    useMapEvents({
        click(e) {
            if (!isLocked) {
                movedOnMap.current = true;
                onChange(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    useEffect(() => {
        if (movedOnMap.current) {
            movedOnMap.current = false;
            return;
        }
        if (lat && lng) {
            map.flyTo([lat, lng], Math.max(map.getZoom(), STREET_ZOOM));
        }
    }, [lat, lng, map]);

    return lat && lng ? (
        <Marker
            position={[lat, lng]}
            draggable={!isLocked}
            eventHandlers={{
                dragend: (e) => {
                    if (!isLocked) {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        movedOnMap.current = true;
                        onChange(position.lat, position.lng);
                    }
                }
            }}
        />
    ) : null;
};

export const MapPicker = ({ lat, lng, onChange, lockable = true }: MapPickerProps) => {
    const [isLocked, setIsLocked] = useState(lockable);
    const defaultCenter: [number, number] = [-12.046374, -77.042793]; // Lima, Perú
    const initialPos: [number, number] = lat && lng ? [lat, lng] : defaultCenter;

    return (
        <div className="space-y-3">
            {lockable && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isLocked ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">
                            {isLocked ? 'Ubicación Bloqueada' : 'Modo Edición Activo'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            {isLocked ? 'Haz clic en "Editar" para cambiar la posición' : 'Haz clic en el mapa o arrastra el marcador'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isLocked
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                >
                    {isLocked ? 'Editar Ubicación' : 'Fijar Ubicación'}
                </button>
            </div>
            )}

            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                <MapContainer
                    center={initialPos}
                    zoom={lat && lng ? STREET_ZOOM : 13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker lat={lat} lng={lng} onChange={onChange} isLocked={isLocked} />
                </MapContainer>

                {!isLocked && (lockable || !(lat && lng)) && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce flex items-center gap-2">
                        <MapPin size={14} />
                        Haz clic en el mapa para mover el punto
                    </div>
                )}
            </div>
        </div>
    );
};
