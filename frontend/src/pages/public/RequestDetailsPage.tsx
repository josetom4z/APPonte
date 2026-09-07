import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestService } from '../../services/request.service';
import { RequestItem, RequestCommentItem } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { CommentThread } from '../../components/feed/CommentThread';
import { LeafletMap } from '../../components/map/LeafletMap';
import { useAuth } from '../../context/AuthContext';
import { shareContent } from '../../utils/shareUtils';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Building2,
  ThumbsUp,
  Share2,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [comments, setComments] = useState<RequestCommentItem[]>([]);
  const [supported, setSupported] = useState(false);
  const [supportsCount, setSupportsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const data = await requestService.getById(id);
        setRequest(data);
        setSupportsCount(data.supportsCount || 0);

        // Load comments
        const commentsData = await requestService.getComments(data._id);
        setComments(commentsData || []);

        // Check if supported by current user
        if (isAuthenticated) {
          const supportStatus = await requestService.checkSupport(data._id);
          setSupported(supportStatus.supported);
        }
      } catch (err) {
        console.error('Failed to load request details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id, isAuthenticated]);

  const handleToggleSupport = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!request) return;

    const nextSupported = !supported;
    setSupported(nextSupported);
    setSupportsCount((p) => (nextSupported ? p + 1 : Math.max(0, p - 1)));

    try {
      const res = await requestService.toggleSupport(request._id);
      setSupported(res.supported);
      setSupportsCount(res.supportsCount);
    } catch (e) {
      setSupported(!nextSupported);
      setSupportsCount((p) => (!nextSupported ? p + 1 : Math.max(0, p - 1)));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const result = await shareContent({
      title: `APPonte — Solicitação ${request?.protocol || ''}`,
      text: `${request?.title || 'Demanda Cidadã'} - Acompanhe no APPonte:`,
      url,
    });

    if (result === 'copied' || result === 'shared') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Solicitação não encontrada</h2>
        <p className="text-xs text-slate-500">O protocolo informado não existe ou foi removido.</p>
        <Link to="/feed" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          Voltar ao Feed
        </Link>
      </div>
    );
  }

  const authorName = typeof request.authorId === 'object' ? request.authorId?.name : 'Cidadão';
  const authorAvatar =
    typeof request.authorId === 'object'
      ? request.authorId?.avatarUrl
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;
  const categoryName = typeof request.categoryId === 'object' ? request.categoryId?.name : 'Geral';
  const deptName = typeof request.departmentId === 'object' ? request.departmentId?.name : 'Prefeitura';
  const assignedName = typeof request.assignedToUserId === 'object' ? request.assignedToUserId?.name : null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 pb-24 md:pb-8">
      
      {/* Top Back Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Feed</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Support CTA */}
          <button
            onClick={handleToggleSupport}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              supported
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${supported ? 'fill-white' : ''}`} />
            <span>{supported ? 'Apoiado' : 'Apoiar'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100">
              {supportsCount}
            </span>
          </button>

          {/* Share CTA */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
            title="Compartilhar"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  #{request.protocol}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(request.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={request.status} size="sm" />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {request.title}
            </h1>

            {/* Author bar */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{authorName}</p>
                <p className="text-[10px] text-slate-400">Autor do chamado</p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-normal">
              {request.description}
            </div>

            {/* Media Gallery */}
            {request.media && request.media.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {request.media.map((m, idx) => (
                    <img
                      key={idx}
                      src={m.url}
                      alt={`Evidência ${idx + 1}`}
                      className="w-full h-52 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Card if RESOLVED */}
          {request.status === 'RESOLVED' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-200">
                    Demanda Atendida e Solucionada
                  </h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Concluído pela prefeitura
                  </p>
                </div>
              </div>

              {request.resolutionNotes && (
                <p className="text-xs text-emerald-900 dark:text-emerald-100 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-200/50 leading-relaxed">
                  {request.resolutionNotes}
                </p>
              )}

              {request.resolutionMedia && request.resolutionMedia.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    Foto Comprobatória:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {request.resolutionMedia.map((m, idx) => (
                      <img
                        key={idx}
                        src={m.url}
                        alt="Comprovação de Solução"
                        className="w-full h-44 object-cover rounded-xl border border-emerald-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Timeline Stepper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Histórico de Atendimento</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {request.statusHistory && request.statusHistory.length > 0 ? (
                request.statusHistory.map((h, idx) => (
                  <div key={h._id || idx} className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 ring-4 ring-white dark:ring-slate-900 z-10">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <StatusBadge status={h.status} size="sm" />
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200">
                        {h.comment || `Status alterado para ${h.status}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 pl-8">Histórico inicial gerado.</p>
              )}
            </div>
          </div>

          {/* Comments Thread Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <CommentThread
              requestId={request._id}
              comments={comments}
              onCommentAdded={(newComment) => setComments((prev) => [...prev, newComment])}
            />
          </div>
        </div>

        {/* Right Column: Location Map & Metadata Widget */}
        <div className="space-y-4">
          
          {/* Location Card with Map */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Localização</span>
            </h3>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">{request.address?.formattedAddress || request.address?.street}</p>
              {request.address?.neighborhood && <p>Bairro: {request.address.neighborhood}</p>}
              <p>{request.address?.city} - {request.address?.state}</p>
              {request.address?.reference && (
                <p className="text-[11px] text-slate-400 italic">Ref: {request.address.reference}</p>
              )}
            </div>

            {request.location?.coordinates && request.location.coordinates.length >= 2 && (
              <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <LeafletMap
                  requests={[request]}
                  center={[request.location.coordinates[1], request.location.coordinates[0]]}
                  zoom={16}
                  height="100%"
                />
              </div>
            )}
          </div>

          {/* Department & Public Service Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Órgão Responsável
            </h3>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {deptName}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {categoryName}
                </p>
              </div>
            </div>

            {assignedName && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Atuante Encarregado:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{assignedName}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
