import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Sparkles,
  ImagePlus,
  LayoutTemplate,
  Images,
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowUpDown,
  Trash2,
  Wand2,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  Smartphone,
  Stamp,
  Wallpaper,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  LogoPosition,
  PhotoItem,
  PresentationConfig,
  TemplateId,
} from './types';
import { SLIDE_TEMPLATES, getTemplateById } from './templates';
import {
  fileToPhotoItem,
  rotatePhotoDataUrl,
  createDemoPhotos,
} from './utils/imageHelpers';
import {
  buildSuggestedPrompt,
  generateAiCoverBackground,
} from './services/aiImageGenerator';
import { SlideVisualPreview } from './components/SlideVisualPreview';
import { SortablePhotoCard } from './components/SortablePhotoCard';
import { generatePresentationPptx } from './services/pptxGenerator';

type ActiveStep = 'cover' | 'photos' | 'preview';

export function App() {
  const [activeStep, setActiveStep] = useState<ActiveStep>('cover');

  const [config, setConfig] = useState<PresentationConfig>({
    title: 'Reporte Fotográfico del Proyecto',
    subtitle: 'Presentación generada automáticamente',
    author: '',
    date: new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    templateId: 'corporate',
    showSlideNumbers: true,
    coverLogo: null,
    coverBackground: null,
  });

  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 0 = Cover, 1..N = Photos
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [lastDownloadedFile, setLastDownloadedFile] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);

  // Configure sensors for smooth mobile touch and mouse dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers for Cover Logo & Cover Background Image
  const handleLogoSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const item = await fileToPhotoItem(file);
      setConfig((prev) => ({
        ...prev,
        coverLogo: {
          dataUrl: item.dataUrl,
          width: item.width,
          height: item.height,
          position: prev.coverLogo?.position || 'top-right',
        },
      }));
      setLastDownloadedFile(null);
    } catch (err) {
      console.error('Error cargando logo:', err);
      alert('No se pudo cargar la imagen del logo.');
    } finally {
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverBgSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const item = await fileToPhotoItem(file);
      setConfig((prev) => ({
        ...prev,
        coverBackground: {
          dataUrl: item.dataUrl,
          width: item.width,
          height: item.height,
          overlayOpacity: prev.coverBackground?.overlayOpacity ?? 55,
          applyToAllSlides: prev.coverBackground?.applyToAllSlides ?? false,
        },
      }));
      setAiError(null);
      setLastDownloadedFile(null);
    } catch (err) {
      console.error('Error cargando fondo:', err);
      alert('No se pudo cargar la imagen de fondo.');
    } finally {
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const handleSuggestAiPrompt = () => {
    const suggested = buildSuggestedPrompt(
      config.title,
      config.subtitle,
      config.templateId
    );
    setAiPrompt(suggested);
    setAiError(null);
  };

  const handleGenerateAiCover = async () => {
    const promptToUse =
      aiPrompt.trim() ||
      buildSuggestedPrompt(config.title, config.subtitle, config.templateId);

    if (!aiPrompt.trim()) {
      setAiPrompt(promptToUse);
    }

    setIsGeneratingAiBg(true);
    setAiError(null);
    try {
      const result = await generateAiCoverBackground(
        promptToUse,
        config.templateId
      );
      setConfig((prev) => ({
        ...prev,
        coverBackground: {
          dataUrl: result.dataUrl,
          width: result.width,
          height: result.height,
          overlayOpacity: prev.coverBackground?.overlayOpacity ?? 50,
          applyToAllSlides: prev.coverBackground?.applyToAllSlides ?? false,
        },
      }));
      setLastDownloadedFile(null);
    } catch (err) {
      console.error('Error generando fondo con IA:', err);
      setAiError(
        'El servicio de IA tardó demasiado o está saturado. Intenta pulsar Generar nuevamente.'
      );
    } finally {
      setIsGeneratingAiBg(false);
    }
  };

  // Handlers for Photo Slide Upload
  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsLoadingPhotos(true);
    try {
      const filesArray = Array.from(fileList);
      const loadedItems = await Promise.all(filesArray.map(fileToPhotoItem));
      setPhotos((prev) => [...prev, ...loadedItems]);
      setLastDownloadedFile(null);
    } catch (err) {
      console.error('Error cargando fotos:', err);
      alert('Algunas imágenes no pudieron procesarse.');
    } finally {
      setIsLoadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadDemoPhotos = () => {
    const demos = createDemoPhotos();
    setPhotos((prev) => [...prev, ...demos]);
    setLastDownloadedFile(null);
  };

  // Drag and drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setLastDownloadedFile(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setPhotos((items) => arrayMove(items, index, index - 1));
    setLastDownloadedFile(null);
  };

  const handleMoveDown = (index: number) => {
    if (index >= photos.length - 1) return;
    setPhotos((items) => arrayMove(items, index, index + 1));
    setLastDownloadedFile(null);
  };

  const handleReverseOrder = () => {
    setPhotos((items) => [...items].reverse());
    setLastDownloadedFile(null);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((items) => items.filter((item) => item.id !== id));
    setLastDownloadedFile(null);
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setPhotos((items) =>
      items.map((item) => (item.id === id ? { ...item, caption } : item))
    );
    setLastDownloadedFile(null);
  };

  const handleToggleLayout = (id: string) => {
    setPhotos((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              layoutMode: item.layoutMode === 'contain' ? 'cover' : 'contain',
            }
          : item
      )
    );
    setLastDownloadedFile(null);
  };

  const handleRotatePhoto = async (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (!target) return;
    try {
      const rotated = await rotatePhotoDataUrl(target.dataUrl, 90);
      setPhotos((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                dataUrl: rotated.dataUrl,
                width: rotated.width,
                height: rotated.height,
                rotation: (item.rotation + 90) % 360,
              }
            : item
        )
      );
      setLastDownloadedFile(null);
    } catch (err) {
      console.error('Error al rotar la imagen:', err);
    }
  };

  // Export PPTX
  const handleGeneratePptx = async () => {
    setIsGeneratingPpt(true);
    setLastDownloadedFile(null);
    try {
      const fileName = await generatePresentationPptx(config, photos);
      setLastDownloadedFile(fileName);
    } catch (err) {
      console.error('Error generando PPTX:', err);
      alert('Ocurrió un problema al generar el archivo PowerPoint.');
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  const totalSlides = 1 + photos.length;
  const currentTemplate = getTemplateById(config.templateId);
  const safeSlideIndex = Math.min(currentSlideIndex, totalSlides - 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight text-white">
                  FotoPPT
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  IA + Móvil
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1 portada + {photos.length}{' '}
                {photos.length === 1 ? 'foto' : 'fotos'} ({totalSlides} diap.)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeneratePptx}
            disabled={isGeneratingPpt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isGeneratingPpt ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar PPT</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Stepper Progress Pills */}
      <div className="bg-slate-900/50 border-b border-slate-800/60 px-4 py-2.5">
        <div className="max-w-xl mx-auto grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveStep('cover')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeStep === 'cover'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Portada</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('photos')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeStep === 'photos'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Images className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Fotos ({photos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentSlideIndex(0);
              setActiveStep('preview');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeStep === 'preview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Vista Previa</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4 space-y-6">
        {/* =============================================================== */}
        {/* STEP 1: COVER SLIDE, LOGO, AI BACKGROUND & TEMPLATE SELECTION   */}
        {/* =============================================================== */}
        {activeStep === 'cover' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Live 16:9 Preview of the Cover Slide */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vista previa en vivo de la Portada
                </span>
                <span className="text-xs text-slate-400">
                  Plantilla:{' '}
                  <strong className="text-slate-200">
                    {currentTemplate.name}
                  </strong>
                </span>
              </div>
              <SlideVisualPreview config={config} />
            </div>

            {/* Presentation Title & Metadata Inputs */}
            <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Datos de la Primera Diapositiva (Portada)
              </h2>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Título principal de la presentación *
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) =>
                    setConfig({ ...config, title: e.target.value })
                  }
                  placeholder="Ej: Catálogo de Productos 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Subtítulo o descripción (opcional)
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) =>
                    setConfig({ ...config, subtitle: e.target.value })
                  }
                  placeholder="Ej: Evidencia visual y resultados del trimestre"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400">
                    Autor / Equipo (opcional)
                  </label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) =>
                      setConfig({ ...config, author: e.target.value })
                    }
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400">
                    Fecha (opcional)
                  </label>
                  <input
                    type="text"
                    value={config.date}
                    onChange={(e) =>
                      setConfig({ ...config, date: e.target.value })
                    }
                    placeholder="Oct 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>

            {/* Cover Logo & Custom / AI Background Image Section */}
            <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4 shadow-lg">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Logo y Fondo de Portada (Galería o IA)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Añade tu logotipo y sube o genera con Inteligencia Artificial el fondo de tu portada.
                </p>
              </div>

              {/* Hidden File Inputs for Logo & Background */}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelected}
                className="hidden"
              />
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverBgSelected}
                className="hidden"
              />

              {/* 1. LOGO UPLOAD CARD */}
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-indigo-400" />
                    Logo en Portada
                  </span>
                  {config.coverLogo && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, coverLogo: null })
                      }
                      className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-0.5"
                      title="Quitar logo"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Quitar logo</span>
                    </button>
                  )}
                </div>

                {config.coverLogo ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-10 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={config.coverLogo.dataUrl}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="text-xs font-medium text-indigo-400 hover:underline"
                      >
                        Cambiar imagen
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[11px] text-slate-400">
                        Ubicación en la portada:
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {(
                          [
                            { id: 'top-left', label: 'Arr. Izq.' },
                            { id: 'top-right', label: 'Arr. Der.' },
                            { id: 'bottom-right', label: 'Abj. Der.' },
                          ] as { id: LogoPosition; label: string }[]
                        ).map((pos) => (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() =>
                              setConfig({
                                ...config,
                                coverLogo: config.coverLogo
                                  ? {
                                      ...config.coverLogo,
                                      position: pos.id,
                                    }
                                  : null,
                              })
                            }
                            className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-colors ${
                              config.coverLogo?.position === pos.id
                                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Stamp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Subir Logo desde tu dispositivo (PNG / JPG)</span>
                  </button>
                )}
              </div>

              {/* 2. BACKGROUND IMAGE CARD (GALLERY UPLOAD + AI GENERATOR) */}
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Wallpaper className="w-4 h-4 text-indigo-400" />
                    Imagen de Fondo de Portada
                  </span>
                  {config.coverBackground && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({ ...config, coverBackground: null })
                      }
                      className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-0.5"
                      title="Quitar imagen de fondo"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Quitar fondo</span>
                    </button>
                  )}
                </div>

                {/* AI Prompt Generator Box */}
                <div className="rounded-xl bg-indigo-950/25 border border-indigo-500/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Generar Fondo con IA (Flux 16:9)
                    </span>
                    <button
                      type="button"
                      onClick={handleSuggestAiPrompt}
                      className="text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-0.5 rounded-md border border-indigo-500/30 transition-colors"
                    >
                      Sugerir según título
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Escribe cómo quieres la imagen de fondo (ej: Edificio corporativo moderno al atardecer con tonos azules, minimalista)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  {aiError && (
                    <p className="text-[11px] text-rose-400">{aiError}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiCover}
                      disabled={isGeneratingAiBg}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      {isGeneratingAiBg ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generando imagen con IA (5-9s)...</span>
                        </>
                      ) : config.coverBackground ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Generar Otra Variante con IA</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Crear Fondo con IA</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => bgInputRef.current?.click()}
                      disabled={isGeneratingAiBg}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Wallpaper className="w-3.5 h-3.5 text-slate-400" />
                      <span>Subir de Galería</span>
                    </button>
                  </div>
                </div>

                {/* Active Background Controls (Contrast & Apply to All Slides) */}
                {config.coverBackground && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                        <img
                          src={config.coverBackground.dataUrl}
                          alt="Fondo actual"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Velo de contraste para leer el título:</span>
                          <span className="font-semibold text-slate-200">
                            {config.coverBackground.overlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={85}
                          step={5}
                          value={config.coverBackground.overlayOpacity}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              coverBackground: config.coverBackground
                                ? {
                                    ...config.coverBackground,
                                    overlayOpacity: Number(e.target.value),
                                  }
                                : null,
                            })
                          }
                          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-0.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.coverBackground.applyToAllSlides}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            coverBackground: config.coverBackground
                              ? {
                                  ...config.coverBackground,
                                  applyToAllSlides: e.target.checked,
                                }
                              : null,
                          })
                        }
                        className="w-3.5 h-3.5 accent-indigo-600 rounded"
                      />
                      <span className="text-[11px] text-slate-300">
                        Usar este fondo también en las diapositivas de fotos
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Template Selector Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">
                  Elige una Plantilla de Diseño (6 estilos)
                </h2>
                <span className="text-[11px] text-slate-400">
                  Aplica a portada y diapositivas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SLIDE_TEMPLATES.map((tpl) => {
                  const isSelected = config.templateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          templateId: tpl.id as TemplateId,
                        })
                      }
                      className={`group text-left rounded-2xl p-3 border transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-lg'
                          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                      }`}
                    >
                      {/* Mini Color Swatch Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${tpl.colors.coverBg}` }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            style={{
                              backgroundColor: `#${tpl.colors.coverAccent}`,
                            }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${tpl.colors.slideBg}` }}
                          />
                        </div>

                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {tpl.badge}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs sm:text-sm text-white">
                        {tpl.name}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {tpl.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              onClick={() => setActiveStep('photos')}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
            >
              <span>Continuar a Selección y Orden de Fotos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP 2: UPLOAD & ORDER PHOTOS                                   */}
        {/* =============================================================== */}
        {activeStep === 'photos' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Hidden Multiple File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Primary Add Photos Card */}
            <div className="rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-950/20 p-4 text-center space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingPhotos}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  {isLoadingPhotos ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Cargando fotos...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" />
                      <span>Añadir Fotos de tu Galería</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLoadDemoPhotos}
                  className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Wand2 className="w-4 h-4 text-indigo-400" />
                  <span>Cargar 4 Fotos Demo</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Selecciona varias fotos a la vez y arrástralas para elegir el orden exacto en el que saldrán en tu PowerPoint.
              </p>
            </div>

            {/* Photo Ordering Toolbar */}
            {photos.length > 0 && (
              <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl">
                <span className="text-xs font-medium text-slate-300">
                  Orden de diapositivas ({photos.length}{' '}
                  {photos.length === 1 ? 'foto' : 'fotos'})
                </span>

                <div className="flex items-center gap-1.5">
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={handleReverseOrder}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>Invertir orden</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos([])}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sortable List of Photos */}
            {photos.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-8 text-center space-y-2">
                <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  Aún no has agregado fotos
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Pulsa "Añadir Fotos de tu Galería" o prueba con el botón "Cargar 4 Fotos Demo" para ver cómo se ordenan las diapositivas.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={photos.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {photos.map((photo, index) => (
                      <SortablePhotoCard
                        key={photo.id}
                        photo={photo}
                        index={index}
                        total={photos.length}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onDelete={handleDeletePhoto}
                        onCaptionChange={handleCaptionChange}
                        onToggleLayout={handleToggleLayout}
                        onRotate={handleRotatePhoto}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Navigation to Preview */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep('cover')}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Portada</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentSlideIndex(0);
                  setActiveStep('preview');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Ver Vista Previa y Descargar PPT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP 3: INTERACTIVE SLIDE PREVIEW & PPTX EXPORT                 */}
        {/* =============================================================== */}
        {activeStep === 'preview' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Interactive Carousel Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Simulador de Diapositivas (16:9)
                </h2>
                <p className="text-xs text-slate-400">
                  {safeSlideIndex === 0
                    ? 'Diapositiva 1: Portada Principal'
                    : `Diapositiva ${safeSlideIndex + 1}: Foto #${safeSlideIndex}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeSlideIndex === 0}
                  onClick={() =>
                    setCurrentSlideIndex((i) => Math.max(0, i - 1))
                  }
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300">
                  {safeSlideIndex + 1} / {totalSlides}
                </span>
                <button
                  type="button"
                  disabled={safeSlideIndex >= totalSlides - 1}
                  onClick={() =>
                    setCurrentSlideIndex((i) =>
                      Math.min(totalSlides - 1, i + 1)
                    )
                  }
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active 16:9 Slide Render */}
            <SlideVisualPreview
              config={config}
              photo={
                safeSlideIndex === 0 ? undefined : photos[safeSlideIndex - 1]
              }
              slideIndex={safeSlideIndex}
              totalSlides={totalSlides}
            />

            {/* Filmstrip Thumbnail Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(0)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  safeSlideIndex === 0
                    ? 'border-indigo-500 bg-indigo-600/20 text-white'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>1. Portada</span>
              </button>

              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx + 1)}
                  className={`shrink-0 p-1 rounded-xl border transition-all flex items-center gap-2 pr-2.5 ${
                    safeSlideIndex === idx + 1
                      ? 'border-indigo-500 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <img
                    src={p.dataUrl}
                    alt={p.name}
                    className="w-10 h-6 object-cover rounded-lg"
                  />
                  <span className="text-xs font-medium">#{idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Quick Options & Summary Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Plantilla seleccionada:</span>
                <button
                  type="button"
                  onClick={() => setActiveStep('cover')}
                  className="font-semibold text-indigo-400 hover:underline"
                >
                  {currentTemplate.name} (Cambiar)
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Personalización de portada:</span>
                <span className="font-semibold text-slate-200">
                  {[
                    config.coverLogo ? 'Con Logo' : null,
                    config.coverBackground ? 'Con Imagen de Fondo' : null,
                  ]
                    .filter(Boolean)
                    .join(' + ') || 'Estándar de plantilla'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total de diapositivas:</span>
                <span className="font-semibold text-slate-200">
                  {totalSlides} (1 Portada + {photos.length} Fotos)
                </span>
              </div>

              <label className="flex items-center justify-between pt-2 border-t border-slate-800 cursor-pointer">
                <span className="text-xs font-medium text-slate-300">
                  Mostrar numeración en diapositivas de fotos
                </span>
                <input
                  type="checkbox"
                  checked={config.showSlideNumbers}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      showSlideNumbers: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </label>
            </div>

            {/* Success Banner if file was downloaded */}
            {lastDownloadedFile && (
              <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/40 p-3.5 flex items-center gap-3 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">
                    ¡Presentación generada con éxito!
                  </p>
                  <p className="text-emerald-300/80">
                    Archivo descargado: <strong>{lastDownloadedFile}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Big Generate & Download Button */}
            <button
              type="button"
              onClick={handleGeneratePptx}
              disabled={isGeneratingPpt}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 transition-all"
            >
              {isGeneratingPpt ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generando archivo PowerPoint...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Generar y Descargar PowerPoint (.pptx)</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
