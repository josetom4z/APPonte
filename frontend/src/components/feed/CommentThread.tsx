import React, { useState } from 'react';
import { RequestCommentItem } from '../../types';
import { requestService } from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { Send, Lock, Shield, User as UserIcon } from 'lucide-react';

interface CommentThreadProps {
  requestId: string;
  comments: RequestCommentItem[];
  onCommentAdded: (newComment: RequestCommentItem) => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  requestId,
  comments,
  onCommentAdded,
}) => {
  const { user, isAuthenticated, isStaff } = useAuth();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await requestService.addComment({
        requestId,
        content: content.trim(),
        isInternal: isStaff ? isInternal : false,
      });
      onCommentAdded(created);
      setContent('');
      setIsInternal(false);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'OPERATOR') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          Atuante Municipal
        </span>
      );
    }
    if (role === 'SECRETARY' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          Gestão Municipal
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
        Cidadão
      </span>
    );
  };

  return (
    <div className="space-y-6" id="comments">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Comentários e Participação ({comments.length})
        </h3>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
            />
            <div className="flex-1 space-y-2">
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva uma mensagem construtiva ou relate mais detalhes..."
                className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
              />

              <div className="flex items-center justify-between">
                {isStaff ? (
                  <label className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="w-3.5 h-3.5" />
                    <span>Nota interna (visível apenas para a prefeitura)</span>
                  </label>
                ) : <div />}

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center text-xs text-slate-500">
          <p>
            Você precisa estar{' '}
            <a href="/login" className="font-bold text-emerald-600 underline">
              conectado
            </a>{' '}
            para comentar ou apoiar esta solicitação.
          </p>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            Nenhum comentário publicado ainda. Seja o primeiro a participar!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`p-4 rounded-2xl border transition-all ${
                comment.isInternal
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={comment.authorId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId?.name}`}
                    alt={comment.authorId?.name || 'Autor'}
                    className="w-8 h-8 rounded-full object-cover bg-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {comment.authorId?.name || 'Cidadão'}
                      </span>
                      {getRoleBadge(comment.authorId?.role || 'CITIZEN')}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {comment.isInternal && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
                    <Lock className="w-3 h-3" />
                    Interno
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 pl-10 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
