import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { requestService } from '../../services/request.service';
import { RequestItem, RequestCategory } from '../../types';
import { LeafletMap } from '../../components/map/LeafletMap';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ExternalLink,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  X,
  Clock,
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const { activeTenant } = useTenant();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [status, setStatus] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default Center (São Paulo coordinates or selected tenant center)
  const defaultCenter: [number, number] = [-23.5615, -46.6558];

  useEffect(() => {
    if (activeTenant?._id) {
      requestService.getCategories(activeTenant._id).then(setCategories).catch(console.error);
    }
  }, [activeTenant]);

  useEffect(() => {
    const loadMapRequests = async () => {
      setIsLoading(true);
      try {
        const data = await requestService.getForMap({
          tenantId: activeTenant?._id,
          status: status || undefined,
          categoryId: categoryId || undefined,
        });
        setRequests(data || []);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapRequests();
  }, [activeTenant, status, categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6 space-y-3 relative">
      
      {/* Top Filter Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setStatus('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              status === ''
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todos ({requests.length})
          </button>
          <button
            onClick={() => setStatus('PENDING')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              status === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatus('IN_PROGRESS')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              status === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Em Obras
          </button>
          <button
            onClick={() => setStatus('RESOLVED')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              status === 'RESOLVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Resolvidas
          </button>
        </div>

        {/* Categories Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 font-bold focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Categorias</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <Link
            to="/new-request"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Abrir Demanda</span>
          </Link>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm h-[calc(100vh-180px)] sm:h-[620px]">
        <LeafletMap
          requests={requests}
          center={defaultCenter}
          zoom={14}
          height="100%"
          onMarkerClick={(req) => setSelectedRequest(req)}
        />

        {/* Mobile & Desktop Floating Selected Request Card */}
        {selectedRequest && (
          <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xl animate-in slide-in-from-bottom-3 fade-in">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    #{selectedRequest.protocol}
                  </span>
                  <StatusBadge status={selectedRequest.status} size="sm" />
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3">
                {selectedRequest.media && selectedRequest.media.length > 0 && (
                  <img
                    src={selectedRequest.media[0].url}
                    alt={selectedRequest.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {selectedRequest.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedRequest.address?.neighborhood || selectedRequest.address?.city}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                    {selectedRequest.supportsCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    {selectedRequest.commentsCount || 0}
                  </span>
                </div>

                <Link
                  to={`/requests/${selectedRequest.protocol || selectedRequest._id}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span>Ver Detalhes</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
