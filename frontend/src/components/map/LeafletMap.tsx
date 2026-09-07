import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RequestItem, RequestStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, Layers } from 'lucide-react';

interface LeafletMapProps {
  requests: RequestItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedRequestId?: string;
  onMarkerClick?: (request: RequestItem) => void;
}

export type MapLayerType = 'google-roadmap' | 'google-hybrid' | 'google-terrain';

// Helper component to smoothly center and animate map when city/coordinates change
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  requests,
  center = [-22.8163, -45.1925],
  zoom = 14,
  height = '500px',
  onMarkerClick,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google-roadmap');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // 100% Authentic Google Maps Tile Layers
  const getTileConfig = () => {
    switch (activeLayer) {
      case 'google-hybrid':
        return {
          url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps Satélite',
          maxZoom: 20,
        };
      case 'google-terrain':
        return {
          url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps Relevo',
          maxZoom: 20,
        };
      case 'google-roadmap':
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

  // Create custom marker icons based on status
  const getMarkerIcon = (status: RequestStatus, priority: string) => {
    const colors: Record<RequestStatus, string> = {
      PENDING: '#f59e0b',
      IN_REVIEW: '#6366f1',
      IN_PROGRESS: '#3b82f6',
      RESOLVED: '#10b981',
      REJECTED: '#ef4444',
      CANCELLED: '#6b7280',
    };

    const color = colors[status] || '#f59e0b';
    const isUrgent = priority === 'URGENT' ? 'pulse-urgent' : '';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="custom-map-pin ${isUrgent}" style="background: ${color}; width: 34px; height: 34px; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-inner relative border border-slate-200 dark:border-slate-800">
      
      {/* Top Google Layer Switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end">
        <button
          type="button"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs font-bold shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          title="Alternar camada do Google Maps"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            {activeLayer === 'google-roadmap' && 'Google Ruas'}
            {activeLayer === 'google-hybrid' && 'Google Satélite'}
            {activeLayer === 'google-terrain' && 'Google Relevo'}
          </span>
        </button>

        {showLayerMenu && (
          <div className="mt-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1 min-w-[150px] animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => {
                setActiveLayer('google-roadmap');
                setShowLayerMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors ${
                activeLayer === 'google-roadmap'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🗺️ Google Ruas
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveLayer('google-hybrid');
                setShowLayerMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors ${
                activeLayer === 'google-hybrid'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🛰️ Google Satélite
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveLayer('google-terrain');
                setShowLayerMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors ${
                activeLayer === 'google-terrain'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🏔️ Google Relevo
            </button>
          </div>
        )}
      </div>

      {/* Google Maps Brand Badge */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Google Maps</span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          key={activeLayer}
          attribution={tile.attribution}
          url={tile.url}
          subdomains={tile.subdomains}
          maxZoom={tile.maxZoom}
        />

        <MapController center={center} zoom={zoom} />

        {requests.map((req) => {
          if (!req.location?.coordinates || req.location.coordinates.length < 2) return null;
          const [lng, lat] = req.location.coordinates;

          return (
            <Marker
              key={req._id}
              position={[lat, lng]}
              icon={getMarkerIcon(req.status, req.priority)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(req),
              }}
            >
              <Popup>
                <div className="w-64 p-3 space-y-2">
                  {req.media && req.media.length > 0 && (
                    <img
                      src={req.media[0].url}
                      alt={req.title}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {req.protocol}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {req.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{req.address?.neighborhood || req.address?.city}</span>
                  </p>
                  <Link
                    to={`/requests/${req.protocol || req._id}`}
                    className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Ver Detalhes</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
