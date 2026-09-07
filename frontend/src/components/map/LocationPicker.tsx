import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    formattedAddress?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    street?: string;
  }) => void;
}

const pinIcon = L.divIcon({
  className: 'picker-pin',
  html: `
    <div style="background: #10b981; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const MapEventsHandler: React.FC<{
  onSelect: (lat: number, lng: number) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = -23.5615,
  initialLng = -46.6558,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressPreview, setAddressPreview] = useState<string>('');

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'pt-BR' } },
      );
      const data = await res.json();
      if (data && data.address) {
        const street = data.address.road || data.address.street || '';
        const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.quarter || '';
        const city = data.address.city || data.address.town || data.address.municipality || 'Nova Esperança';
        const state = data.address.state_code || (data.address.state ? data.address.state.substring(0, 2).toUpperCase() : 'SP');
        const formatted = data.display_name;

        setAddressPreview(formatted);
        onLocationSelect({
          lat,
          lng,
          formattedAddress: formatted,
          street,
          neighborhood,
          city,
          state,
        });
      } else {
        onLocationSelect({ lat, lng });
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode fallback:', err);
      onLocationSelect({ lat, lng });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    fetchAddressFromCoords(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          fetchAddressFromCoords(lat, lng);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err);
        },
        { enableHighAccuracy: true },
      );
    }
  };

  useEffect(() => {
    fetchAddressFromCoords(initialLat, initialLng);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          Clique no mapa para marcar o ponto exato do problema:
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium transition-colors"
        >
          <Navigation className="w-3 h-3" />
          <span>Usar meu GPS</span>
        </button>
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventsHandler onSelect={handleSelect} />
          <Marker position={position} icon={pinIcon} />
        </MapContainer>
      </div>

      {addressLoading ? (
        <p className="text-[11px] text-slate-400 animate-pulse">Obtendo endereço aproximado...</p>
      ) : addressPreview ? (
        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700 truncate">
          📍 <span className="font-semibold text-slate-700 dark:text-slate-300">Local selecionado:</span> {addressPreview}
        </p>
      ) : null}
    </div>
  );
};
