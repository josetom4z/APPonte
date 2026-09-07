import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboard.service';
import { requestService } from '../../services/request.service';
import { RequestItem } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolution Modal State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [comment, setComment] = useState('');
  const [evidenceMedia, setEvidenceMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashData, reqsData] = await Promise.all([
        dashboardService.getOperatorDashboard(),
        requestService.getFeed({
          assignedToUserId: user?._id,
          limit: 20,
        }),
      ]);
      setStats(dashData);
      setRequests(reqsData.items || []);
    } catch (err) {
      console.error('Failed to load operator data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = await requestService.uploadFile(e.target.files[0]);
      setEvidenceMedia((p) => [...p, file]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      await requestService.updateStatus(selectedRequest._id, {
        status: newStatus,
        comment,
        evidenceMedia,
      });
      setSelectedRequest(null);
      setComment('');
      setEvidenceMedia([]);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            👷 Painel de Atendimento em Campo (Atuante)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Fila de Execução — {user?.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Gerencie as ocorrências atribuídas a você, atualize o status de progresso das obras e envie fotos de comprovação de serviço concluído.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.assignedTotal || requests.length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Chamados Atribuídos</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.pendingInDepartment || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Na Fila da Secretaria</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats?.assignedInProgress || 0}
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
              {stats?.assignedResolved || 0}
            </span>
            <p className="text-xs text-slate-500 font-medium">Resolvidos no Mês</p>
          </div>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Fila de Demandas para Execução</h2>

        {requests.length === 0 ? (
          <p className="text-center py-12 text-xs text-slate-400">
            Nenhuma solicitação pendente no momento. Você está com tudo em dia!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map((req) => (
              <div
                key={req._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  {req.media && req.media.length > 0 ? (
                    <img
                      src={req.media[0].url}
                      alt={req.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{req.protocol}</span>
                      <StatusBadge status={req.status} size="sm" />
                      <PriorityBadge priority={req.priority} />
                    </div>
                    <Link
                      to={`/requests/${req.protocol || req._id}`}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 line-clamp-1"
                    >
                      {req.title}
                    </Link>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{req.address?.formattedAddress || req.address?.city}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setNewStatus(req.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Atualizar Status / Concluir
                  </button>
                  <Link
                    to={`/requests/${req.protocol || req._id}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                    title="Ver Detalhes"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedRequest.protocol}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Atualizar Atendimento
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Novo Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="IN_PROGRESS">Em Atendimento (Equipe em Campo)</option>
                  <option value="RESOLVED">Resolvida (Serviço Concluído)</option>
                  <option value="REJECTED">Recusada (Fora de Jurisdição / Inválido)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Justificativa / Parecer Técnico
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Equipe realizou a troca da lâmpada por modelo LED 150W com sucesso..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Upload Photo Evidence for RESOLVED */}
              {newStatus === 'RESOLVED' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    Foto Comprobatória da Solução (Obrigatório)
                  </label>
                  <label className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {uploading ? 'Enviando...' : 'Anexar foto da obra/reparo concluído'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {evidenceMedia.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {evidenceMedia.map((m, idx) => (
                        <img key={idx} src={m.url} alt="Evidência" className="w-16 h-16 object-cover rounded-lg border" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || (newStatus === 'RESOLVED' && evidenceMedia.length === 0)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md"
                >
                  {isUpdating ? 'Salvando...' : 'Salvar e Concluir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
