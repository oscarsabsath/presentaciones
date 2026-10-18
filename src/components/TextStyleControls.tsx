import React from 'react';
import {
  SlideTextPosition,
  TextEffectType,
  TextSizeScale,
  TextStyleConfig,
} from '../types';
import {
  EFFECT_COLOR_SWATCHES,
  TEXT_COLOR_SWATCHES,
  TEXT_EFFECT_PRESETS,
  getPreviewTextStyles,
} from '../utils/textEffects';
import { AlignCenter, ArrowDownToLine, ArrowUpToLine, BoxSelect, Sparkles, Type } from 'lucide-react';

interface TextStyleControlsProps {
  value: TextStyleConfig;
  onChange: (updated: TextStyleConfig) => void;
  showSlidePlacementOptions?: boolean;
  compact?: boolean;
}

export const TextStyleControls: React.FC<TextStyleControlsProps> = ({
  value,
  onChange,
  showSlidePlacementOptions = true,
  compact = false,
}) => {
  const handleSelectEffect = (effect: TextEffectType) => {
    const preset = TEXT_EFFECT_PRESETS.find((p) => p.id === effect);
    // When choosing 3D, Outline, Neon, or Pop3D, default text color to White if auto so the stroke/3D pops immediately
    const nextTextColor =
      effect !== 'none' && value.textColor === 'auto'
        ? 'FFFFFF'
        : value.textColor;

    onChange({
      ...value,
      effect,
      textColor: nextTextColor,
      effectColor: preset ? preset.defaultEffectColor : value.effectColor,
      // For outline / 3d / pop3d, floating text without box looks awesome by default
      showBackgroundBox:
        effect === 'outline' || effect === '3d' || effect === 'pop3d'
          ? false
          : value.showBackgroundBox,
    });
  };

  return (
    <div className={`space-y-3.5 ${compact ? 'text-xs' : ''}`}>
      {/* 1. Selector de Efecto Visual (WordArt / 3D / Sombra / Contorno) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Efecto visual del texto (3D, Sombra, Contorno, Neón)</span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {TEXT_EFFECT_PRESETS.map((preset) => {
            const isSelected = value.effect === preset.id;
            const sampleStyle = getPreviewTextStyles(
              {
                ...value,
                effect: preset.id,
                textColor: 'FFFFFF',
                effectColor:
                  isSelected && value.effect !== 'none'
                    ? value.effectColor
                    : preset.defaultEffectColor,
              },
              'FFFFFF',
              false
            );

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectEffect(preset.id)}
                className={`rounded-xl p-2 border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-md'
                    : 'border-slate-800 bg-slate-950/90 hover:border-slate-700'
                }`}
              >
                <span
                  className="text-base sm:text-lg font-extrabold tracking-wide leading-none py-0.5 select-none"
                  style={sampleStyle}
                >
                  Abc
                </span>
                <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Colores del Texto y del Trazo / Sombra / 3D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Color de Relleno de la Letra */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-medium text-slate-400">
            Color de la letra:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {TEXT_COLOR_SWATCHES.map((swatch) => {
              const active = value.textColor === swatch.hex;
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() =>
                    onChange({ ...value, textColor: swatch.hex })
                  }
                  title={swatch.label}
                  className={`h-6 rounded-full border transition-transform flex items-center justify-center ${
                    swatch.hex === 'auto' ? 'px-2 text-[10px] font-semibold' : 'w-6'
                  } ${
                    active
                      ? 'scale-110 ring-2 ring-indigo-400 border-white text-white bg-indigo-600'
                      : 'border-white/25 opacity-85 hover:opacity-100 bg-slate-800 text-slate-300'
                  }`}
                  style={
                    swatch.hex !== 'auto'
                      ? { backgroundColor: `#${swatch.hex}` }
                      : undefined
                  }
                >
                  {swatch.hex === 'auto' ? 'Auto' : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color del Efecto (Contorno / Trazo / Relieve 3D / Sombra / Neón) */}
        {value.effect !== 'none' && (
          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium text-slate-400">
              Color de {value.effect === 'outline' ? 'contorno / trazo' : value.effect === '3d' || value.effect === 'pop3d' ? 'relieve 3D' : value.effect === 'neon' ? 'brillo neón' : 'sombra'}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {EFFECT_COLOR_SWATCHES.map((swatch) => {
                const active = value.effectColor === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() =>
                      onChange({ ...value, effectColor: swatch.hex })
                    }
                    title={swatch.label}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      active
                        ? 'scale-110 ring-2 ring-indigo-400 border-white'
                        : 'border-white/25 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: `#${swatch.hex}` }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Posición, Tamaño y Placa de Fondo (para Diapositivas de Fotos) */}
      {showSlidePlacementOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          {/* Ubicación del texto */}
          <div className="space-y-1">
            <span className="block text-[11px] text-slate-400">
              Posición en diapositiva:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'top', label: 'Arriba', icon: ArrowUpToLine },
                  { id: 'center', label: 'Centro', icon: AlignCenter },
                  { id: 'bottom', label: 'Abajo', icon: ArrowDownToLine },
                ] as { id: SlideTextPosition; label: string; icon: any }[]
              ).map((pos) => {
                const Icon = pos.icon;
                const active = value.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onChange({ ...value, position: pos.id })}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                      active
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{pos.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tamaño de letra */}
          <div className="space-y-1">
            <span className="block text-[11px] text-slate-400">
              Tamaño de letra:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'sm', label: 'Normal' },
                  { id: 'md', label: 'Grande' },
                  { id: 'lg', label: 'Impacto' },
                ] as { id: TextSizeScale; label: string }[]
              ).map((sz) => {
                const active = value.size === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => onChange({ ...value, size: sz.id })}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                      active
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Type className="w-3 h-3" />
                    <span>{sz.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caja de fondo vs Texto flotante libre */}
          <div className="space-y-1">
            <span className="block text-[11px] text-slate-400">
              Fondo del texto:
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() =>
                  onChange({ ...value, showBackgroundBox: false })
                }
                className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                  !value.showBackgroundBox
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Texto Libre</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...value, showBackgroundBox: true })
                }
                className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                  value.showBackgroundBox
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <BoxSelect className="w-3 h-3" />
                <span>Con Cinta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
