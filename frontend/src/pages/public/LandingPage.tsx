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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

        {/* Como Funciona Section */}
        <section className="bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-800 p-6 sm:p-8 rounded-3xl border border-emerald-200/60 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Simples, Rápido e Transparente
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Como funciona o APPonte?
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Veja como é fácil transformar a sua rua e ajudar a administração pública da sua cidade:
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('apponte_open_onboarding'))}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>💡 Ver Guia Interativo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-base shadow-sm">
                1
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📸 Fotografe o Problema</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Viu um buraco, lâmpada queimada ou lixo? Abra o app, tire uma foto e o <strong>GPS localiza o endereço</strong> automaticamente.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black text-base shadow-sm">
                2
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🏛️ A Prefeitura é Acionada</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sua solicitação é protocolada e vai direto para a Secretaria responsável (Obras, Iluminação, Limpeza), que envia a equipe de campo.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-base shadow-sm">
                3
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>✅ Acompanhe a Solução</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acompanhe o status em tempo real (Em Análise, Em Obras, Resolvido) e veja a <strong>foto comprobatória do reparo concluído</strong>.
              </p>
            </div>

          </div>
        </section>

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

        {/* SaaS Pricing Plans Section - Desenvolvido por PixelLab */}
        <section id="planos" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modelos Free & Pagos • SaaS PixelLab</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Planos sob medida para a sua cidade
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Desenvolvido pela <strong>PixelLab</strong> para atender desde pequenos municípios em fase de testes até grandes capitais e consórcios regionais.
            </p>

            {/* Billing Cycle Switch */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-2">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Anual</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                  2 Meses Grátis
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* 1. Free Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  Gratuito / Cidadão Livre
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">R$ 0</span>
                    <span className="text-xs text-slate-400 font-medium">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Para cidades de até 20k hab ou validação comunitária inicial.
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Feed Social & Mapa Interativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Até 50 solicitações por mês</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 Operador / Atuante de campo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Exibição de anúncios locais</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center font-bold">✕</span>
                    <span>Sem Dashboard Analítico</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center font-bold">✕</span>
                    <span>Sem API Governamental</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-colors block"
              >
                Começar Grátis
              </Link>
            </div>

            {/* 2. Pro Plan (Featured) */}
            <div className="bg-gradient-to-b from-emerald-50 via-white to-teal-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                Mais Escolhido por Prefeituras
              </div>

              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                  Prefeitura Pro / Conectada
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {billingCycle === 'monthly' ? 'R$ 990' : 'R$ 825'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'yearly'
                      ? 'Faturado anualmente em R$ 9.900/ano (Economia de R$ 1.980)'
                      : 'Ideal para cidades de médio porte (até 150 mil hab, como Guaratinguetá).'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-emerald-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>Solicitações Ilimitadas</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>100% Sem anúncios externos</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Até 15 Atuantes e Secretarias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Painel Analítico com Gestão de SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Exportação de Relatórios PDF/Excel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Suporte Técnico PixelLab (SLA 12h)</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black text-center shadow-lg shadow-emerald-600/30 transition-all block active:scale-98"
              >
                Contratar Plano Pro
              </Link>
            </div>

            {/* 3. Enterprise Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-[11px] font-extrabold uppercase text-blue-700 dark:text-blue-300">
                  Gestão Inteligente / Enterprise
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {billingCycle === 'monthly' ? 'R$ 2.490' : 'R$ 2.075'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ mês</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'yearly'
                      ? 'Faturado anualmente em R$ 24.900/ano (Economia de R$ 4.980)'
                      : 'Para grandes cidades, consórcios intermunicipais e capitais.'}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong>Tudo do Plano Pro incluído</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong>Atuantes e Secretarias Ilimitados</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>API REST de Integração Governamental</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Domínio Customizado da Prefeitura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Roteirização Inteligente com IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Suporte VIP 24/7 & Consultoria PixelLab</span>
                  </div>
                </div>
              </div>

              <a
                href="mailto:contato@pixellab.com.br?subject=Interesse%20no%20Plano%20Enterprise%20APPonte"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black text-center transition-colors block"
              >
                Falar com a PixelLab
              </a>
            </div>

          </div>
        </section>

        {/* PixelLab GovTech Authority Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PixelLab GovTech Solutions
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-400 font-bold">Tecnologia Pública de Ponta</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Transforme a zeladoria urbana da sua prefeitura com a PixelLab.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O <strong>APPonte</strong> é desenvolvido pela <strong>PixelLab</strong> com arquitetura moderna, escalabilidade em nuvem, conformidade com a LGPD e foco em resultados reais para a população.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-colors"
              >
                Cadastrar Nova Cidade
              </Link>
              <a
                href="mailto:contato@pixellab.com.br"
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
              >
                Agendar Demonstração com a PixelLab ✉️
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
