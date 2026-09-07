import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { requestService } from '../../services/request.service';
import { RequestCategory, Department } from '../../types';
import { LocationPicker } from '../../components/map/LocationPicker';
import { CameraCaptureModal } from '../../components/common/CameraCaptureModal';
import { compressImage } from '../../utils/imageCompressor';
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';

const DRAFT_KEY = 'apponte_new_request_draft_v3';

const loadSavedDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY) || sessionStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load draft:', e);
  }
  return null;
};

export const NewRequestPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeTenant, activeCities } = useTenant();
  const navigate = useNavigate();

  // Load draft if user was in step 2/3 or if camera reloaded the page
  const draft = loadSavedDraft();

  const [step, setStep] = useState<number>(draft?.step || 1);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [tenantId, setTenantId] = useState<string>(draft?.tenantId || activeTenant?._id || '');
  const [departmentId, setDepartmentId] = useState<string>(draft?.departmentId || '');
  const [categoryId, setCategoryId] = useState<string>(draft?.categoryId || '');
  const [subcategoryId, setSubcategoryId] = useState<string>(draft?.subcategoryId || '');
  const [title, setTitle] = useState<string>(draft?.title || '');
  const [description, setDescription] = useState<string>(draft?.description || '');
  const [priority, setPriority] = useState<string>(draft?.priority || 'MEDIUM');

  // Location State
  const [latitude, setLatitude] = useState<number>(draft?.latitude ?? -22.8163);
  const [longitude, setLongitude] = useState<number>(draft?.longitude ?? -45.1925);
  const [formattedAddress, setFormattedAddress] = useState<string>(draft?.formattedAddress || '');
  const [street, setStreet] = useState<string>(draft?.street || '');
  const [number, setNumber] = useState<string>(draft?.number || '');
  const [neighborhood, setNeighborhood] = useState<string>(draft?.neighborhood || '');
  const [city, setCity] = useState<string>(draft?.city || activeTenant?.city || 'Guaratinguetá');
  const [state, setState] = useState<string>(draft?.state || activeTenant?.state || 'SP');
  const [reference, setReference] = useState<string>(draft?.reference || '');

  // Media State
  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; filename: string; type: any }>>(draft?.mediaFiles || []);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Scroll to top of form when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Sync draft to localStorage so camera/phone never loses progress
  useEffect(() => {
    try {
      const dataToSave = {
        step,
        tenantId,
        departmentId,
        categoryId,
        subcategoryId,
        title,
        description,
        priority,
        latitude,
        longitude,
        formattedAddress,
        street,
        number,
        neighborhood,
        city,
        state,
        reference,
        mediaFiles,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to persist draft:', e);
    }
  }, [
    step,
    tenantId,
    departmentId,
    categoryId,
    subcategoryId,
    title,
    description,
    priority,
    latitude,
    longitude,
    formattedAddress,
    street,
    number,
    neighborhood,
    city,
    state,
    reference,
    mediaFiles,
  ]);

  // Sync initial city coordinates if no draft exists
  useEffect(() => {
    if (activeTenant && !draft && !street && !formattedAddress) {
      setCity(activeTenant.city);
      setState(activeTenant.state);
      const slug = (activeTenant.slug || '').toLowerCase();
      if (slug.includes('guara')) {
        setLatitude(-22.8163);
        setLongitude(-45.1925);
      } else if (slug.includes('sao-bento')) {
        setLatitude(-21.5000);
        setLongitude(-44.5000);
      } else if (slug.includes('nova-esperanca')) {
        setLatitude(-23.5615);
        setLongitude(-46.6558);
      }
    }
  }, [activeTenant]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const effectiveTenantId = tenantId || activeTenant?._id;
    if (effectiveTenantId) {
      setIsLoadingMeta(true);
      Promise.all([
        requestService.getCategories(effectiveTenantId),
        requestService.getDepartments(effectiveTenantId),
      ])
        .then(([cats, depts]) => {
          setCategories(cats || []);
          setDepartments(depts || []);
          if (cats && cats.length > 0 && !categoryId) {
            setCategoryId(cats[0]._id);
            setDepartmentId(typeof cats[0].departmentId === 'object' ? cats[0].departmentId._id : cats[0].departmentId);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingMeta(false));
    }
  }, [tenantId, activeTenant]);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find((c) => c._id === catId);
    if (cat) {
      const dId = typeof cat.departmentId === 'object' ? cat.departmentId._id : cat.departmentId;
      setDepartmentId(dId);
      setPriority(cat.defaultPriority || 'MEDIUM');
      if (cat.subcategories && cat.subcategories.length > 0) {
        setSubcategoryId(cat.subcategories[0].slug);
      } else {
        setSubcategoryId('');
      }
    }
  };

  const processAndUpload = async (fileOrBlob: File | Blob, customFilename?: string) => {
    setUploadingMedia(true);
    setUploadError('');

    try {
      // Comprime a imagem no cliente para evitar estouro de memória no celular e acelerar upload
      const { file: compressedFile } = await compressImage(fileOrBlob);
      const uploaded = await requestService.uploadFile(compressedFile, customFilename);
      setMediaFiles((prev) => [...prev, uploaded]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(
        err.response?.data?.message || err.message || 'Falha ao processar ou enviar a imagem. Tente novamente.',
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await processAndUpload(file);
    e.target.value = '';
  };

  const handleCameraCapture = async (blob: Blob) => {
    await processAndUpload(blob, `foto-camera-${Date.now()}.jpg`);
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearDraft = () => {
    if (window.confirm('Deseja realmente limpar todos os campos e recomeçar a solicitação?')) {
      try {
        localStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
      window.location.href = '/new-request';
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        tenantId: tenantId || activeTenant?._id,
        departmentId,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        title,
        description,
        priority,
        latitude,
        longitude,
        address: {
          formattedAddress: formattedAddress || `${street || 'Via Pública'}, ${neighborhood || 'Centro'} - ${city}/${state}`,
          street: street || undefined,
          number: number || undefined,
          neighborhood: neighborhood || undefined,
          city: city || activeTenant?.city || 'Guaratinguetá',
          state: state || activeTenant?.state || 'SP',
          reference: reference || undefined,
        },
        media: mediaFiles.map((m) => ({
          url: m.url,
          filename: m.filename,
          type: m.type || 'IMAGE',
        })),
      };

      const created = await requestService.create(payload);
      // Clean draft on successful submit
      try {
        localStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
      navigate(`/requests/${created.protocol || created._id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Falha ao registrar solicitação. Verifique os campos preenchidos.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === categoryId);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Nova Solicitação Cidadã
          </h1>
          <p className="text-xs text-slate-500">
            Relate o problema para encaminharmos à secretaria responsável.
          </p>
        </div>

        {(title || description || mediaFiles.length > 0) && (
          <button
            type="button"
            onClick={handleClearDraft}
            title="Limpar rascunho e recomeçar"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recomeçar</span>
          </button>
        )}
      </div>

      {/* Visual Progress Bar & Step Tracker */}
      <div className="max-w-md mx-auto px-2 space-y-2.5">
        
        {/* Step Indicator Header with Percentage */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {step === 1 && 'Etapa 1 de 3: Identificação & Detalhes'}
              {step === 2 && 'Etapa 2 de 3: Localização & Endereço'}
              {step === 3 && 'Etapa 3 de 3: Fotos & Publicação'}
            </span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold font-mono">
            {step === 1 ? '33%' : step === 2 ? '66%' : '100%'}
          </span>
        </div>

        {/* Continuous Animated Progress Bar Track */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700 shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
          />
        </div>

        {/* Interactive Step Buttons with Connecting Lines */}
        <div className="relative flex items-center justify-between px-3 pt-1">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
          {/* Active Connecting Line */}
          <div
            className="absolute top-4 left-6 h-0.5 bg-emerald-600 transition-all duration-500 z-0"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { num: 1, label: 'Detalhes' },
            { num: 2, label: 'Local' },
            { num: 3, label: 'Fotos' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step || (s.num === 2 && title.trim() && description.trim()) || (s.num === 3 && title.trim() && description.trim())) {
                  setStep(s.num);
                }
              }}
              className="relative z-10 flex flex-col items-center gap-1 focus:outline-none group cursor-pointer"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step > s.num
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                    : step === s.num
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/35 ring-4 ring-emerald-500/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-[10px] font-bold ${
                  step === s.num
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : step > s.num
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Step Container */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cidade / Prefeitura
                </label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {activeCities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subcategoria
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {selectedCategory.subcategories.map((sc) => (
                    <option key={sc.slug} value={sc.slug}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título do Problema *
              </label>
              <input
                type="text"
                placeholder="Ex: Buraco profundo no asfalto em frente à padaria"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição Detalhada *
              </label>
              <textarea
                rows={3}
                placeholder="Descreva a gravidade do problema, riscos aos pedestres/veículos e referências..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!title.trim() || !description.trim()}
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Avançar para Localização</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-3.5 animate-in fade-in">
            <LocationPicker
              initialLat={latitude}
              initialLng={longitude}
              onLocationSelect={(loc) => {
                setLatitude(loc.lat);
                setLongitude(loc.lng);
                if (loc.formattedAddress) setFormattedAddress(loc.formattedAddress);
                if (loc.street) setStreet(loc.street);
                if (loc.neighborhood) setNeighborhood(loc.neighborhood);
                if (loc.city) setCity(loc.city);
                if (loc.state) setState(loc.state);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rua / Logradouro
                </label>
                <input
                  type="text"
                  placeholder="Nome da rua"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  placeholder="Nome do bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ponto de Referência (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Próximo ao posto de saúde, esquina com a farmácia..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Avançar para Fotos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos & Submit */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Upload Area with Separate Camera & Gallery Options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Fotos do Problema (Opcional, mas recomendado)
              </label>

              {uploadError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {uploadError}
                </p>
              )}

              {/* Responsive Camera vs Gallery Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Camera Trigger: Usa Câmera WebRTC se tiver HTTPS ou Câmera do Sistema direto se estiver em rede local HTTP */}
                {typeof window !== 'undefined' &&
                !!navigator.mediaDevices &&
                typeof navigator.mediaDevices.getUserMedia === 'function' &&
                (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    disabled={uploadingMedia}
                    className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-300 dark:border-emerald-700 flex flex-col items-center justify-center gap-1.5 text-center hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      Tirar Foto Agora
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Câmera instantânea no app
                    </span>
                  </button>
                ) : (
                  <label className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-300 dark:border-emerald-700 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-all active:scale-98">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                      Tirar Foto Agora
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Abre a câmera do celular
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                )}

                {/* 2. Gallery Trigger */}
                <label className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-98">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Escolher da Galeria
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Fotos salvas no aparelho
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingMedia}
                    className="hidden"
                  />
                </label>

              </div>

              {/* In-App Camera Modal */}
              <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCameraCapture}
                onCaptureFile={(file) => processAndUpload(file)}
              />

              {/* Uploading Spinner */}
              {uploadingMedia && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando foto para o servidor...</span>
                </div>
              )}

              {/* Uploaded Gallery Preview */}
              {mediaFiles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    Fotos Anexadas ({mediaFiles.length}):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video group">
                        <img src={m.url} alt="Upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Review Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">Resumo da Demanda:</p>
              <p><strong>Título:</strong> {title}</p>
              <p><strong>Categoria:</strong> {selectedCategory?.name}</p>
              <p><strong>Local:</strong> {street || formattedAddress || 'Ponto no Mapa'}, {neighborhood || city}</p>
            </div>

            <div className="flex items-center justify-between pt-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || uploadingMedia}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publicar Solicitação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
