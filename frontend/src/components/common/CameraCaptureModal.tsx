import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  onCaptureFile?: (file: File) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onCaptureFile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Parar stream de vídeo
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Iniciar stream de vídeo
  const startCamera = async () => {
    stopStream();
    setCameraError(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegadores exigem conexão segura (HTTPS) para câmera ao vivo na rede local.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Falha ao abrir câmera:', err);
      let msg = 'Navegadores exigem HTTPS para câmera direta na rede local.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permissão de acesso à câmera foi negada no navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Nenhuma câmera encontrada no seu aparelho.';
      }
      setCameraError(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedBlob(null);
      setCapturedPreview(null);
      startCamera();
    } else {
      stopStream();
      if (capturedPreview) {
        URL.revokeObjectURL(capturedPreview);
      }
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Alternar entre câmera traseira e frontal
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Disparar captura da foto
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Se for câmera frontal, espelhar para parecer um espelho natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const preview = URL.createObjectURL(blob);
          setCapturedPreview(preview);
          stopStream();
        }
      },
      'image/jpeg',
      0.9,
    );
  };

  // Descartar e tirar outra
  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    startCamera();
  };

  // Confirmar foto tirada
  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="w-full max-w-lg flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">Câmera APPonte</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white transition-all"
          aria-label="Fechar Câmera"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-lg flex-1 my-3 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-2xl">
        {cameraError ? (
          <div className="p-6 text-center max-w-sm space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Usar Câmera do Celular</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {cameraError} Toque no botão abaixo para abrir a câmera nativa do seu aparelho com segurança:
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <label className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/40 transition-all">
                <Camera className="w-4 h-4" />
                <span>Abrir Câmera do Aparelho</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && onCaptureFile) {
                      onCaptureFile(e.target.files[0]);
                      onClose();
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-all"
              >
                Tentar novamente no navegador
              </button>
            </div>
          </div>
        ) : capturedPreview ? (
          <img
            src={capturedPreview}
            alt="Foto capturada"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />
            {/* Viewfinder Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-4/5 h-4/5 border-2 border-dashed border-white/40 rounded-2xl" />
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-lg flex items-center justify-around py-2 z-10">
        {capturedPreview ? (
          // Review mode buttons
          <div className="flex items-center justify-center gap-6 w-full">
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tirar Outra</span>
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-emerald-600/50 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Usar Esta Foto</span>
            </button>
          </div>
        ) : (
          // Live capture mode buttons
          <div className="flex items-center justify-between w-full px-6">
            <div className="w-12" /> {/* Spacer */}

            {/* Shutter Button */}
            <button
              type="button"
              onClick={handleSnap}
              disabled={isInitializing || !!cameraError}
              aria-label="Capturar Foto"
              className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-40"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600" />
            </button>

            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={handleToggleFacingMode}
              disabled={isInitializing || !!cameraError}
              aria-label="Alternar Câmera"
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all disabled:opacity-40"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
