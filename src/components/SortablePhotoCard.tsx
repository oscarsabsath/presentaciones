import React from 'react';
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
} from 'lucide-react';
import { PhotoItem } from '../types';

interface SortablePhotoCardProps {
  photo: PhotoItem;
  index: number;
  total: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onToggleLayout: (id: string) => void;
  onRotate: (id: string) => void;
}

export const SortablePhotoCard: React.FC<SortablePhotoCardProps> = ({
  photo,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCaptionChange,
  onToggleLayout,
  onRotate,
}) => {
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
            {/* 16:9 Mini Preview of Photo */}
            <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className={`w-full h-full ${
                  photo.layoutMode === 'cover' ? 'object-cover' : 'object-contain p-1'
                }`}
              />
              <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-slate-200 px-1.5 py-0.5 rounded font-medium">
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    photo.layoutMode === 'cover'
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {photo.layoutMode === 'cover' ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Pantalla completa</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Ajustada con marco</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onRotate(photo.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                  title="Girar foto 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Caption / Slide Subtitle Input */}
          <div>
            <input
              type="text"
              value={photo.caption}
              onChange={(e) => onCaptionChange(photo.id, e.target.value)}
              placeholder="Añadir pie de foto o título en esta diapositiva (opcional)..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
