import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { requestService } from '../../services/request.service';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  FileText,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [dashData, reqsData] = await Promise.all([
          dashboardService.getCitizenDashboard(),
          requestService.getFeed({ authorId: user?._id, limit: 20 }),
        ]);

        setStats(dashData);
        setMyRequests(reqsData.items || []);
      } catch (err) {
        console.error('Failed to load citizen dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      loadDashboard();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold">
            <span>Painel do Cidadão</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Olá, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Aqui você acompanha todas as demandas que registrou para a sua cidade, o status dos atendimentos e os apoios recebidos.
          </p>
        </div>

        <Link
          to="/new-request"
          className="px-6 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-slate-50 font-black text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Nova Solicitação</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.totalRequests || myRequests.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Minhas Demandas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.pendingCount || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Pendentes / Em Análise</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.inProgressCount || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Em Atendimento</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.resolvedCount || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Resolvidas com Sucesso</p>
          </div>
        </div>
      </div>

      {/* My Requests Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Minhas Solicitações Registradas</h2>
            <p className="text-xs text-slate-500">Histórico de chamados abertos por você</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myRequests.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-xs text-slate-400">Você ainda não registrou nenhuma solicitação.</p>
            <Link
              to="/new-request"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              + Abrir Primeira Solicitação
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myRequests.map((req) => (
              <div
                key={req._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-2xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  {req.media && req.media.length > 0 ? (
                    <img
                      src={req.media[0].url}
                      alt={req.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{req.protocol}</span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <Link
                      to={`/requests/${req.protocol || req._id}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 line-clamp-1 mt-0.5"
                    >
                      {req.title}
                    </Link>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{req.address?.neighborhood || req.address?.city}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        {req.supportsCount || 0} apoios
                      </span>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/requests/${req.protocol || req._id}`}
                  className="self-end sm:self-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <span>Acompanhar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
