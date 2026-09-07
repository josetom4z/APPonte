import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { requestService } from '../../services/request.service';
import { RequestCategory, Department } from '../../types';
import { LocationPicker } from '../../components/map/LocationPicker';
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
} from 'lucide-react';

export const NewRequestPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { activeTenant, activeCities } = useTenant();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<RequestCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [tenantId, setTenantId] = useState(activeTenant?._id || '');
  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  // Location State
  const [latitude, setLatitude] = useState(-23.5615);
  const [longitude, setLongitude] = useState(-46.6558);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState(activeTenant?.city || 'Nova Esperança');
  const [state, setState] = useState(activeTenant?.state || 'SP');
  const [reference, setReference] = useState('');

  // Media State
  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; filename: string; type: any }>>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingMedia(true);
    try {
      const uploaded = await requestService.uploadFile(file);
      setMediaFiles((prev) => [...prev, uploaded]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          city: city || activeTenant?.city || 'Nova Esperança',
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
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Nova Solicitação Cidadã
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Relate o problema para encaminharmos à secretaria responsável.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between max-w-sm mx-auto px-4 py-2">
        {[
          { num: 1, label: 'Detalhes' },
          { num: 2, label: 'Local' },
          { num: 3, label: 'Fotos' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= s.num
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {s.num}
            </div>
            <span className={`text-[10px] font-bold ${step >= s.num ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Step Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
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
                Título do Problema
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Buraco profundo no asfalto em frente à padaria"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descrição Detalhada
              </label>
              <textarea
                rows={3}
                required
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
            
            {/* Upload Area */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Fotos do Problema (Opcional, mas recomendado)
              </label>

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Camera className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {uploadingMedia ? 'Enviando...' : 'Tirar foto ou anexar da galeria'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingMedia}
                  className="hidden"
                />
              </label>

              {/* Uploaded Gallery Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {mediaFiles.map((m, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                      <img src={m.url} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Review Card */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Título:</strong> {title}</p>
              <p><strong>Categoria:</strong> {selectedCategory?.name}</p>
              <p><strong>Local:</strong> {street || formattedAddress}, {neighborhood}</p>
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
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Solicitação'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
