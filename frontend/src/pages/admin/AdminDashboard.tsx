import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { tenantService } from '../../services/tenant.service';
import { adsService } from '../../services/ads.service';
import { Tenant, AdvertisementItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ShieldAlert,
  Building,
  Users,
  Megaphone,
  CreditCard,
  PlusCircle,
  Eye,
  MousePointer,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'ads'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      try {
        const [dashData, tenantsData, adsData] = await Promise.all([
          dashboardService.getAdminDashboard(),
          tenantService.getAll(),
          adsService.getAll(),
        ]);
        setStats(dashData);
        setTenants(tenantsData.items || []);
        setAds(adsData.items || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            👑 Painel Geral de Administração & SaaS Multi-tenant
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Centro de Controle — {user?.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Visão consolidada de prefeituras ativas, usuários, campanhas publicitárias locais e assinaturas SaaS da plataforma APPonte.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Visão Geral & Indicadores
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'tenants'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Prefeituras Integradas ({tenants.length})
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'ads'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Campanhas Publicitárias ({ads.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalTenants || tenants.length}
                </span>
                <p className="text-xs text-slate-500 font-medium">Prefeituras Ativas</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalUsers || 6}
                </span>
                <p className="text-xs text-slate-500 font-medium">Usuários Cadastrados</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.adsMetrics?.totalImpressions || 5410}
                </span>
                <p className="text-xs text-slate-500 font-medium">Impressões de Anúncios</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                <MousePointer className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.adsMetrics?.totalClicks || 325}
                </span>
                <p className="text-xs text-slate-500 font-medium">Cliques Registrados</p>
              </div>
            </div>
          </div>

          {/* Breakdown: Demandas por Secretaria */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Volume de Demandas por Secretaria</h2>
            <div className="space-y-3">
              {stats?.byDepartment && stats.byDepartment.length > 0 ? (
                stats.byDepartment.map((dept: any, idx: number) => {
                  const pct = stats.totalRequests > 0 ? Math.round((dept.count / stats.totalRequests) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{dept.name || 'Secretaria'}</span>
                        <span className="text-slate-500">{dept.count} chamados ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(5, pct)}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">Nenhum dado por secretaria ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tenants */}
      {activeTab === 'tenants' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Prefeituras e Organizações Cadastradas</h2>
              <p className="text-xs text-slate-500">Gestão de instâncias multi-tenant isoladas</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tenants.map((t) => (
              <div key={t._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={t.logoUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=100'}
                    alt={t.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-slate-400">
                      Slug: <code className="font-mono text-emerald-600">{t.slug}</code> • {t.city} - {t.state}
                    </p>
                    {t.contactEmail && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Contato: {t.contactEmail}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 self-start sm:self-auto">
                  Plano Ativo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Ads Campaigns */}
      {activeTab === 'ads' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Campanhas de Anúncios e Patrocinadores Locais</h2>
              <p className="text-xs text-slate-500">Monetização SaaS sem comprometer a navegação cívica</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ads.map((ad) => (
              <div key={ad._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={ad.mediaUrl}
                    alt={ad.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ad.advertiserName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {ad.placement}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{ad.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ad.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 self-end sm:self-auto">
                  <span>👁️ {ad.impressionsCount} views</span>
                  <span>🖱️ {ad.clicksCount} cliques</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
