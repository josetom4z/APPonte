import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RequestItem, RequestStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';

interface LeafletMapProps {
  requests: RequestItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedRequestId?: string;
  onMarkerClick?: (request: RequestItem) => void;
}

// Helper component to smoothly center map when coordinates change
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  requests,
  center = [-23.5615, -46.6558],
  zoom = 13,
  height = '500px',
  onMarkerClick,
}) => {
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
        <div class="custom-map-pin ${isUrgent}" style="background: ${color}; width: 32px; height: 32px; border: 2.5px solid #ffffff;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-inner relative border border-slate-200 dark:border-slate-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
