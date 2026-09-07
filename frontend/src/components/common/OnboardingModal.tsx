import React, { useState, useEffect } from 'react';
import {
  Compass,
  Camera,
  CheckCircle2,
  Users,
  MapPin,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Building2,
  ShieldCheck,
  ThumbsUp,
  Clock,
  Check,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  forceShow?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  forceShow = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (forceShow) {
      setInternalIsOpen(true);
      return;
    }

    // Auto open on first visit
    const hasSeen = localStorage.getItem('apponte_onboarding_seen_v1');
    if (!hasSeen && controlledIsOpen === undefined) {
      // Small delay for smooth entry after page loads
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [forceShow, controlledIsOpen]);

  // Listen for custom global event to open onboarding from any button
  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setInternalIsOpen(true);
    };

    window.addEventListener('apponte_open_onboarding', handleOpen);
    return () => window.removeEventListener('apponte_open_onboarding', handleOpen);
  }, []);

  const handleClose = () => {
    localStorage.setItem('apponte_onboarding_seen_v1', 'true');
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const steps = [
    {
      badge: 'Bem-vindo ao APPonte',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      icon: <Compass className="w-8 h-8 text-white" />,
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-emerald-500/30',
      title: 'A ponte direta entre você e a sua prefeitura',
      subtitle: 'Uma plataforma cívica e colaborativa para transformar a sua cidade com transparência e agilidade.',
      content: (
        <div className="space-y-3 mt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Esqueça filas ou processos burocráticos. O <strong>APPonte</strong> permite que qualquer cidadão registre ocorrências nas ruas (buracos, luz apagada, lixo, semáforos) e acompanhe a resolução em tempo real.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm">100%</div>
              <div className="text-[10px] text-slate-500 font-medium">Digital & Grátis</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-teal-600 dark:text-teal-400 font-black text-sm">Tempo Real</div>
              <div className="text-[10px] text-slate-500 font-medium">Status & Fotos</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-blue-600 dark:text-blue-400 font-black text-sm">Direto</div>
              <div className="text-[10px] text-slate-500 font-medium">À Secretaria</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Passo 1 de 3',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      icon: <Camera className="w-8 h-8 text-white" />,
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-400 shadow-amber-500/30',
      title: '1. Fotografe e Aponte o Problema',
      subtitle: 'Viu algo precisando de conserto? Leva menos de 30 segundos.',
      content: (
        <div className="space-y-3 mt-2">
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                📸
              </div>
              <div>
                <strong>Tire uma foto do local:</strong> O aplicativo envia a imagem para a equipe técnica avaliar a gravidade.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                📍
              </div>
              <div>
                <strong>Localização automática por GPS:</strong> O endereço exato é detectado sem você precisar digitar tudo.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                🏷️
              </div>
              <div>
                <strong>Escolha a categoria:</strong> Asfalto, Iluminação, Limpeza, Trânsito ou Meio Ambiente.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Passo 2 de 3',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      icon: <Building2 className="w-8 h-8 text-white" />,
      iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/30',
      title: '2. A Prefeitura Entra em Ação',
      subtitle: 'Transparência total até a conclusão do serviço.',
      content: (
        <div className="space-y-3 mt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Seu chamado é encaminhado diretamente para o painel da Secretaria competente, que envia a equipe de campo.
          </p>
          
          {/* Status Timeline Preview */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ciclo de Vida do Chamado:
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                1. Pendente
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                2. Em Análise
              </div>
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                3. Em Obras
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                4. Resolvido ✅
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Ao resolver, a prefeitura anexa uma <strong>foto do serviço concluído</strong>!</span>
          </div>
        </div>
      ),
    },
    {
      badge: 'Passo 3 de 3',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      icon: <Users className="w-8 h-8 text-white" />,
      iconBg: 'bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-500/30',
      title: '3. Apoie o seu Bairro & Comunidade',
      subtitle: 'Quanto mais apoios uma demanda recebe, maior a sua prioridade.',
      content: (
        <div className="space-y-3 mt-2">
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                👍
              </div>
              <div>
                <strong>Apoio Cívico (Upvotes):</strong> Apoie ocorrências de vizinhos para alertar a prefeitura sobre áreas críticas.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                🗺️
              </div>
              <div>
                <strong>Mapa Interativo da Cidade:</strong> Explore todas as demandas abertas ou resolvidas perto da sua casa.
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
              <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                💬
              </div>
              <div>
                <strong>Comente & Compartilhe:</strong> Converse com a comunidade e acompanhe melhorias do seu bairro.
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${currentStepData.badgeColor}`}>
              {currentStepData.badge}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar Guia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
          
          {/* Big Center Icon */}
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${currentStepData.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {currentStepData.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>

          {/* Step Dynamic Content */}
          <div className="pt-2">
            {currentStepData.content}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === idx
                    ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label={`Ir para passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <span>Próximo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Entendi, Vamos Começar!</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
