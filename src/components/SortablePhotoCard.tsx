import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PhotoItem, TextStyleConfig } from '../types';
import { TextStyleControls } from './TextStyleControls';
import {
  DEFAULT_TEXT_STYLE,
  TEXT_EFFECT_PRESETS,
  getPreviewTextStyles,
} from '../utils/textEffects';

interface SortablePhotoCardProps {
  photo: PhotoItem;
  index: number;
  total: number;
  globalTextStyle: TextStyleConfig;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onToggleLayout: (id: string) => void;
  onRotate: (id: string) => void;
  onCustomTextStyleChange: (
    id: string,
    customStyle: TextStyleConfig | undefined
  ) => void;
}

export const SortablePhotoCard: React.FC<SortablePhotoCardProps> = ({
  photo,
  index,
  total,
  globalTextStyle,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCaptionChange,
  onToggleLayout,
  onRotate,
  onCustomTextStyleChange,
}) => {
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const activeTextStyle =
    photo.customTextStyle || globalTextStyle || DEFAULT_TEXT_STYLE;
  const activePresetName =
    TEXT_EFFECT_PRESETS.find((p) => p.id === activeTextStyle.effect)?.name ||
    'Limpio';

  const miniTextCss = getPreviewTextStyles(activeTextStyle, 'FFFFFF', false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border bg-slate-900/90 backdrop-blur-sm transition-all ${
        isDragging
          ? 'z-30 border-indigo-500 shadow-2xl shadow-indigo-500/25 scale-[1.02] opacity-95'
          : 'border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      <div className="p-3 sm:p-4 flex gap-3 items-start">
        {/* Drag Handle + Slide Order Badge */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shadow-inner">
            #{index + 1}
          </div>

          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Arrastrar para reordenar"
            className="touch-none p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white active:bg-indigo-600 active:text-white transition-colors cursor-grab active:cursor-grabbing"
            title="Mantén presionado y arrastra para cambiar el orden"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          {/* Quick tap Up/Down buttons for mobile convenience */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="p-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none"
              title="Subir una posición"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveDown(index)}
              className="p-1 rounded-lg bg-slate-800/60 text-slate-300 hover:bg-slate-700 disabled:opacity-25 disabled:pointer-events-none"
              title="Bajar una posición"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail + Main Controls */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex gap-3 items-center">
            {/* 16:9 Mini Preview of Photo + Live Text Effect */}
            <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className={`w-full h-full ${
                  photo.layoutMode === 'cover'
                    ? 'object-cover'
                    : 'object-contain p-1'
                }`}
              />
              {photo.caption.trim() && (
                <div
                  className={`absolute inset-x-1 px-1 text-center pointer-events-none truncate text-[9px] font-extrabold ${
                    activeTextStyle.position === 'top'
                      ? 'top-1'
                      : activeTextStyle.position === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-1'
                  }`}
                  style={miniTextCss}
                >
                  {photo.caption}
                </div>
              )}
              <span className="absolute top-1 right-1 bg-black/70 text-[8px] text-slate-200 px-1 py-0.5 rounded font-medium">
                Diap. {index + 2}
              </span>
            </div>

            {/* Action toolbar for this photo */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-slate-300 truncate">
                  {photo.name}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(photo.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleLayout(photo.id)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    photo.layoutMode === 'cover'
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {photo.layoutMode === 'cover' ? (
                    <>
                      <Maximize2 className="w-3 h-3" />
                      <span>Completa</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3 h-3" />
                      <span>Con marco</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onRotate(photo.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                  title="Girar foto 90°"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Girar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide Text Input + Button to open Rich Text Effects */}
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => onCaptionChange(photo.id, e.target.value)}
                placeholder="Escribe el texto de esta diapositiva..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowStyleEditor((v) => !v)}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 shrink-0 transition-colors ${
                  showStyleEditor || photo.customTextStyle
                    ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Personalizar efecto 3D, sombra, contorno o posición de este texto"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Efecto:</span>
                <span>{activePresetName}</span>
                {showStyleEditor ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Expandable Per-Slide Text Effect Customizer */}
            {showStyleEditor && (
              <div className="rounded-xl bg-slate-950/95 border border-indigo-500/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300">
                    Estilo del texto en Diapositiva #{index + 2}
                  </span>
                  {photo.customTextStyle && (
                    <button
                      type="button"
                      onClick={() =>
                        onCustomTextStyleChange(photo.id, undefined)
                      }
                      className="text-[11px] text-slate-400 hover:text-white underline"
                    >
                      Usar estilo global
                    </button>
                  )}
                </div>

                <TextStyleControls
                  value={activeTextStyle}
                  onChange={(updated) =>
                    onCustomTextStyleChange(photo.id, updated)
                  }
                  showSlidePlacementOptions={true}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
