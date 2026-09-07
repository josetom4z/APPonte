import { notifyToast } from '../context/ToastContext';

/**
 * Utilitário universal de compartilhamento e cópia para área de transferência.
 * Funciona perfeitamente em HTTPS, HTTP (rede local), Mobile (Android/iOS) e Desktop.
 */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Tentar navigator.clipboard moderno (apenas funciona em HTTPS ou localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard falhou, utilizando fallback...', err);
    }
  }

  // 2. Fallback universal usando textarea temporário (funciona em HTTP e qualquer navegador)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // Suporte iOS

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Falha ao copiar para clipboard:', err);
    return false;
  }
}

export async function shareContent(data: {
  title: string;
  text: string;
  url: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  // 1. Se navigator.share estiver disponível (ex: HTTPS móvel)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return 'shared';
    } catch (err: any) {
      // Se o usuário simplesmente cancelou o diálogo de compartilhamento
      if (err.name === 'AbortError') {
        return 'shared';
      }
      console.warn('navigator.share falhou, caindo para cópia de link...', err);
    }
  }

  // 2. Se navigator.share não estiver disponível (ex: HTTP na rede local ou desktop)
  const copied = await copyTextToClipboard(data.url);
  if (copied) {
    notifyToast('Link copiado para a área de transferência!', 'success');
    return 'copied';
  }

  notifyToast('Não foi possível copiar o link automaticamente.', 'error');
  return 'failed';
}

export function openWhatsAppShare(text: string, url: string) {
  const message = `${text} Acesse: ${url}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
