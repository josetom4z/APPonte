import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RequestItem } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  Clock,
  CheckCircle,
  Tag,
  Check,
} from 'lucide-react';

interface RequestCardProps {
  request: RequestItem;
  isInitiallySupported?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isInitiallySupported = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [supported, setSupported] = useState(isInitiallySupported);
  const [supportsCount, setSupportsCount] = useState(request.supportsCount || 0);
  const [isSupporting, setIsSupporting] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleToggleSupport = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (isSupporting) return;

    setIsSupporting(true);
    // Optimistic UI update
    const nextSupported = !supported;
    setSupported(nextSupported);
    setSupportsCount((prev) => (nextSupported ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const result = await requestService.toggleSupport(request._id);
      setSupported(result.supported);
      setSupportsCount(result.supportsCount);
    } catch (err) {
      // Rollback on error
      setSupported(!nextSupported);
      setSupportsCount((prev) => (!nextSupported ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsSupporting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/requests/${request.protocol || request._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `APPonte — Solicitação ${request.protocol}`,
          text: request.title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    return `${diffDays}d`;
  };

  const authorName = typeof request.authorId === 'object' ? request.authorId?.name : 'Cidadão';
  const authorAvatar =
    typeof request.authorId === 'object'
      ? request.authorId?.avatarUrl
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

  const categoryName = typeof request.categoryId === 'object' ? request.categoryId?.name : 'Geral';
  const categoryColor = typeof request.categoryId === 'object' ? request.categoryId?.color : '#10b981';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      
      {/* Header: Author & Status */}
      <div className="p-3.5 sm:p-4 pb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`}
            alt={authorName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {authorName}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                #{request.protocol}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-0.5 shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                {timeAgo(request.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{request.address?.neighborhood || request.address?.city}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          <StatusBadge status={request.status} size="sm" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3.5 sm:px-4 flex-1">
        <Link to={`/requests/${request.protocol || request._id}`} className="group block">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2 mb-1.5">
            {request.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 sm:line-clamp-3 mb-2.5 leading-relaxed font-normal">
            {request.description}
          </p>
        </Link>

        {/* Category Tag */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
          >
            <Tag className="w-2.5 h-2.5" />
            {categoryName}
          </span>
          <PriorityBadge priority={request.priority} />
        </div>

        {/* Media Gallery Preview */}
        {request.media && request.media.length > 0 && (
          <Link to={`/requests/${request.protocol || request._id}`} className="block mb-2.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video sm:aspect-[16/9]">
            <img
              src={request.media[0].url}
              alt={request.title}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        )}

        {/* Resolution Badge if Resolved */}
        {request.status === 'RESOLVED' && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <p className="font-bold text-emerald-900 dark:text-emerald-300">Solucionado pela Prefeitura</p>
              {request.resolutionNotes && (
                <p className="text-emerald-700 dark:text-emerald-400/90 line-clamp-1">
                  {request.resolutionNotes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Social Actions */}
      <div className="mt-auto px-3.5 sm:px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Support / Upvote Button */}
          <button
            onClick={handleToggleSupport}
            aria-label="Apoiar solicitação"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              supported
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${supported ? 'fill-white' : ''}`} />
            <span>{supported ? 'Apoiado' : 'Apoiar'}</span>
            <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
              supported ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {supportsCount}
            </span>
          </button>

          {/* Comments Link */}
          <Link
            to={`/requests/${request.protocol || request._id}#comments`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{request.commentsCount || 0}</span>
            <span className="hidden sm:inline">Comentários</span>
          </Link>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          aria-label="Compartilhar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1.5 rounded-lg transition-colors"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 text-[10px] font-bold">Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
