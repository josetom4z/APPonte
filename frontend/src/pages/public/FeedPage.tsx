import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { requestService } from '../../services/request.service';
import { RequestItem, RequestCategory } from '../../types';
import { RequestCard } from '../../components/feed/RequestCard';
import { AdBanner } from '../../components/ads/AdBanner';
import {
  Search,
  MapPin,
  AlertCircle,
  SlidersHorizontal,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeedPage: React.FC = () => {
  const { activeTenant } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  useEffect(() => {
    if (activeTenant?._id) {
      requestService.getCategories(activeTenant._id).then(setCategories).catch(console.error);
    }
  }, [activeTenant]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const response = await requestService.getFeed({
        tenantId: activeTenant?._id,
        search: search || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
        sortBy,
        sortOrder: 'desc',
        page,
        limit: 10,
      });

      setRequests(response.items || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [activeTenant, status, categoryId, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadFeed();
  };

  const statusTabs = [
    { label: 'Todas', value: '' },
    { label: 'Pendentes', value: 'PENDING' },
    { label: 'Em Atendimento', value: 'IN_PROGRESS' },
    { label: 'Resolvidas', value: 'RESOLVED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Feed Cívico
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {activeTenant ? activeTenant.city : 'Geral'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {total} ocorrências da comunidade registradas
          </p>
        </div>

        <Link
          to="/new-request"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Abrir Solicitação</span>
        </Link>
      </div>

      {/* Main Grid: Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Feed) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Clean Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar por rua, problema ou protocolo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
              >
                Buscar
              </button>
            </form>

            {/* Horizontal Scrollable Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    status === tab.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Filter Chips & Sort Selector */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none flex-1">
                <button
                  onClick={() => {
                    setCategoryId('');
                    setPage(1);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                    categoryId === ''
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todas Categorias
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      setCategoryId(c._id);
                      setPage(1);
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                      categoryId === c._id
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-300 font-bold focus:ring-1 focus:ring-emerald-500 shrink-0"
              >
                <option value="createdAt">Recentes</option>
                <option value="supportsCount">Apoiadas</option>
              </select>
            </div>
          </div>

          {/* Requests Stream */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Nenhuma solicitação encontrada</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tente ajustar os filtros ou registre a primeira ocorrência na região.
              </p>
              <Link
                to="/new-request"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                + Nova Solicitação
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req, idx) => (
                <React.Fragment key={req._id}>
                  <RequestCard request={req} />
                  {/* Contextual Sponsor Ad */}
                  {idx === 1 && (
                    <AdBanner placement="FEED" tenantId={activeTenant?._id} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-bold text-slate-500 px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar - Desktop Only) */}
        <div className="hidden lg:block space-y-6">
          
          {/* Quick Stats Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{activeTenant?.name || 'Prefeitura'}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Visualizando ocorrências públicas de{' '}
              <strong className="text-slate-700 dark:text-slate-300">{activeTenant?.city} - {activeTenant?.state}</strong>.
            </p>

            <Link
              to="/map"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors border border-slate-200/60 dark:border-slate-700"
            >
              <span>Ver no Mapa Interativo</span>
              <span>🗺️</span>
            </Link>
          </div>

          {/* Sidebar Advertisement */}
          <AdBanner placement="SIDEBAR" tenantId={activeTenant?._id} />

          {/* Civic Guidelines Info */}
          <div className="bg-emerald-50/60 dark:bg-slate-800/60 rounded-2xl border border-emerald-100 dark:border-slate-700 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <span className="font-bold text-emerald-800 dark:text-emerald-400 block text-xs">
              💡 Dica de Cidadania
            </span>
            <p className="leading-relaxed text-[11px]">
              Ao abrir solicitações, inclua fotos claras e referências precisas para agilizar o atendimento da equipe da prefeitura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
