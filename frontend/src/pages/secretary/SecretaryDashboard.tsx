import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const SecretaryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSecretaryData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getSecretaryDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load secretary dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSecretaryData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            🏛️ Painel Executivo da Secretaria
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Gestão Estratégica & SLAs — {user?.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Acompanhe indicadores de desempenho da equipe, distribuição das demandas por categoria e taxa de resolução de serviços públicos.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.total || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Total de Demandas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.resolutionRate || 0}%
            </span>
            <p className="text-xs text-slate-500 font-medium">Taxa de Resolução</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.operatorsCount || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Atuantes na Equipe</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.resolved || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Casos Concluídos</p>
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Category Stats + Team Operators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Demandas por Categoria */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Distribuição por Categoria</h2>
          
          <div className="space-y-3">
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              stats.byCategory.map((cat: any, idx: number) => {
                const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{cat.name || 'Geral'}</span>
                      <span className="text-slate-500">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color || '#10b981',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Nenhum dado categorizado ainda.</p>
            )}
          </div>
        </div>

        {/* Equipe de Atuantes / Operadores */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Equipe de Atuantes da Pasta</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
              {stats?.operators?.length || 0} ativos
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.operators && stats.operators.length > 0 ? (
              stats.operators.map((op: any) => (
                <div key={op._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={op.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${op.name}`}
                      alt={op.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{op.name}</p>
                      <p className="text-[11px] text-slate-400">{op.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Disponível
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">Nenhum operador vinculado à sua secretaria.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white">Últimas Atualizações na Secretaria</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats?.recentActivity?.map((req: any) => (
            <div key={req._id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">{req.protocol}</span>
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <Link to={`/requests/${req.protocol || req._id}`} className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-600 mt-0.5 block">
                  {req.title}
                </Link>
              </div>
              <Link to={`/requests/${req.protocol || req._id}`} className="text-xs font-semibold text-emerald-600 hover:underline shrink-0">
                Ver Detalhes →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
