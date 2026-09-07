import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { dashboardService } from '../../services/dashboard.service';
import { requestService } from '../../services/request.service';
import { RequestItem } from '../../types';
import { RequestCard } from '../../components/feed/RequestCard';
import { AdBanner } from '../../components/ads/AdBanner';
import {
  MapPin,
  CheckCircle2,
  Users,
  Building,
  ArrowRight,
  Zap,
  Sparkles,
  Search,
  Wrench,
  Trees,
  TrafficCone,
  Lightbulb,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { activeTenant } = useTenant();
  const [stats, setStats] = useState({
    totalRequests: 148,
    totalResolved: 139,
    totalCities: 12,
    totalCitizens: 1250,
    resolutionRate: 94,
  });
  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await dashboardService.getPublicStats();
        if (statsData) setStats(statsData);

        const feedData = await requestService.getFeed({
          tenantId: activeTenant?._id,
          limit: 3,
        });
        if (feedData && feedData.items) {
          setRecentRequests(feedData.items);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };

    loadData();
  }, [activeTenant]);

  const categories = [
    { name: 'Pavimentação e Vias', icon: <Wrench className="w-5 h-5 text-red-500" />, color: 'bg-red-50/80 dark:bg-red-950/40 border-red-200/60' },
    { name: 'Iluminação Pública', icon: <Lightbulb className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/60' },
    { name: 'Limpeza e Parques', icon: <Trees className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60' },
    { name: 'Trânsito e Sinalização', icon: <TrafficCone className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/60' },
  ];

  return (
    <div className="space-y-10 sm:space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Participação Cidadã & Gestão Municipal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Sua voz transforma a{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                sua cidade.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
              Aponte problemas nas ruas, acompanhe a execução dos reparos em tempo real e colabore diretamente com sua comunidade.
            </p>

            {/* Clean Search Bar */}
            <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-2.5">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquisar por rua, bairro, protocolo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 py-1.5"
                />
              </div>

              <Link
                to={`/feed?search=${encodeURIComponent(searchQuery)}`}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Buscar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Fast Action Buttons */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <Link
                to="/new-request"
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                + Abrir Solicitação
              </Link>
              <Link
                to="/map"
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition-all"
              >
                Ver no Mapa 🗺️
              </Link>
            </div>
          </div>

          {/* Real-time Stats Grid (2x2 on Mobile, 4 columns on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 max-w-5xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stats.resolutionRate}%</span>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Resolvidas</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stats.totalRequests}</span>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Registros</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stats.totalCities}</span>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Cidades</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stats.totalCitizens}+</span>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Cidadãos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Ad Hero Placement */}
        <AdBanner placement="HOME_HERO" tenantId={activeTenant?._id} />

        {/* Categories Section (2 Columns on Mobile, 4 Columns on Desktop) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Categorias Principais</h2>
              <p className="text-xs text-slate-500">Selecione o tipo de serviço que deseja relatar:</p>
            </div>
            <Link to="/feed" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/feed?category=${encodeURIComponent(cat.name)}`}
                className={`p-3.5 sm:p-4 rounded-2xl border ${cat.color} hover:shadow-md transition-all group flex flex-col justify-between`}
              >
                <div className="p-2 w-fit rounded-xl bg-white dark:bg-slate-900 shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-emerald-600 transition-colors leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Requests Feed Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Demandas Recentes em {activeTenant?.city || 'sua Cidade'}
              </h2>
              <p className="text-xs text-slate-500">Ocorrências abertas pela comunidade:</p>
            </div>
            <Link to="/feed" className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">
              Feed Completo →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {recentRequests.map((req) => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        </section>

        {/* Prefeitura Callout Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Para Prefeituras & Secretarias
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Modernize a gestão de serviços públicos da sua cidade.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Painéis completos para secretarias, controle de SLA, roteirização de equipes em campo e transparência com a população.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-colors"
              >
                Cadastrar Cidade
              </Link>
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                Acesso do Gestor
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
