import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Search, Layers, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
    <div style="background: #10b981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.35);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// Map Controller for smooth flyTo animation when coordinates change
const MapFlyTo: React.FC<{ position: [number, number]; zoom?: number }> = ({ position, zoom = 16 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, zoom, { duration: 1.0 });
  }, [position, zoom, map]);
  return null;
};

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

// Preset Municipalities for instant 1-tap jump
const CITY_SHORTCUTS = [
  { name: 'Guaratinguetá - SP', lat: -22.8163, lng: -45.1925 },
  { name: 'Nova Esperança - SP', lat: -23.5615, lng: -46.6558 },
  { name: 'São Bento - MG', lat: -21.5000, lng: -44.5000 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = -22.8163,
  initialLng = -45.1925,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [mapLayer, setMapLayer] = useState<'google' | 'google-sat'>('google');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressPreview, setAddressPreview] = useState<string>('');
  
  // GPS State & Feedback
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Address Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Google Maps Tile Configuration
  const getTileConfig = () => {
    switch (mapLayer) {
      case 'google-sat':
        return {
          url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps Satélite',
          maxZoom: 20,
        };
      case 'google':
      default:
        return {
          url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps',
          maxZoom: 20,
        };
    }
  };

  const tile = getTileConfig();

  // Reverse Geocoding to get Street, Neighborhood, City, State
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'pt-BR' } },
      );
      const data = await res.json();
      if (data && data.address) {
        const street = data.address.road || data.address.street || data.address.pedestrian || '';
        const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.quarter || '';
        const city = data.address.city || data.address.town || data.address.municipality || 'Guaratinguetá';
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
      console.warn('Reverse geocode fallback:', err);
      onLocationSelect({ lat, lng });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    fetchAddressFromCoords(lat, lng);
  };

  // Robust GPS detection with multi-tier fallback for Mobile Browsers
  const handleGetCurrentLocation = () => {
    setGpsLoading(true);
    setGpsStatus({ type: null, message: '' });

    // Fallback function using IP Geolocation
    const fallbackToIpGeolocation = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          setPosition([lat, lng]);
          fetchAddressFromCoords(lat, lng);
          setGpsStatus({
            type: 'warning',
            message: `📍 Localização aproximada detectada via rede (${data.city || 'Sua Região'}). Toque no mapa para o ponto exato.`,
          });
          return;
        }
      } catch (e) {
        console.warn('IP Geolocation fallback failed:', e);
      }

      setGpsStatus({
        type: 'error',
        message: 'Não foi possível obter o GPS. Selecione um município abaixo ou toque no mapa.',
      });
    };

    // Check if Geolocation API is available
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      // Try high-accuracy first
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          fetchAddressFromCoords(lat, lng);
          setGpsLoading(false);
          setGpsStatus({
            type: 'success',
            message: '🎯 GPS detectado com sucesso!',
          });
        },
        (err) => {
          console.warn('High-accuracy GPS failed, retrying with standard accuracy...', err);
          // Retry with low accuracy
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setPosition([lat, lng]);
              fetchAddressFromCoords(lat, lng);
              setGpsLoading(false);
              setGpsStatus({
                type: 'success',
                message: '🎯 Localização obtida via GPS padrão!',
              });
            },
            () => {
              // Mobile HTTP context or permission denied -> Trigger IP fallback
              setGpsLoading(false);
              fallbackToIpGeolocation();
            },
            { enableHighAccuracy: false, timeout: 6000 },
          );
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 },
      );
    } else {
      setGpsLoading(false);
      fallbackToIpGeolocation();
    }
  };

  // Search Address by Name
  const handleSearchAddress = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&countrycodes=br&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR' } },
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        fetchAddressFromCoords(lat, lng);
      } else {
        setGpsStatus({
          type: 'error',
          message: 'Endereço não encontrado. Tente digitar o nome da rua e a cidade.',
        });
      }
    } catch (err) {
      console.error('Search address error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchAddressFromCoords(initialLat, initialLng);
  }, []);

  return (
    <div className="space-y-2.5">
      
      {/* Header with Title and GPS Action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Marque o local no Google Maps:
        </span>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          {gpsLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Buscando GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Usar meu GPS</span>
            </>
          )}
        </button>
      </div>

      {/* GPS Status Message Toast */}
      {gpsStatus.message && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border animate-in fade-in slide-in-from-top-1 ${
            gpsStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : gpsStatus.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {gpsStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {gpsStatus.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {gpsStatus.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{gpsStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsStatus({ type: null, message: '' })}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Search & City Shortcuts */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar rua, praça ou bairro (ex: Rua Domingos Rodrigues, Guaratinguetá)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchAddress();
                }
              }}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchAddress}
            disabled={isSearching || !searchQuery.trim()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Quick City Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Pular para:</span>
          {CITY_SHORTCUTS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleSelect(city.lat, city.lng)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 shrink-0 transition-colors"
            >
              📍 {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
        
        {/* Layer Switcher */}
        <div className="absolute top-2.5 right-2.5 z-[1000] flex gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMapLayer('google')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              mapLayer === 'google'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🗺️ Google Ruas
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('google-sat')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              mapLayer === 'google-sat'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🛰️ Satélite
          </button>
        </div>

        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            key={mapLayer}
            attribution={tile.attribution}
            url={tile.url}
            subdomains={tile.subdomains}
            maxZoom={tile.maxZoom}
          />
          <MapFlyTo position={position} zoom={17} />
          <MapEventsHandler onSelect={handleSelect} />
          <Marker position={position} icon={pinIcon} />
        </MapContainer>
      </div>

      {/* Address Feedback Display */}
      {addressLoading ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Identificando endereço do ponto marcado no Google Maps...</span>
        </p>
      ) : addressPreview ? (
        <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2">
          <span className="text-base leading-none">📍</span>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 dark:text-white block">Endereço Selecionado:</span>
            <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{addressPreview}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
