import React from 'react';
import { TextEffectType, TextStyleConfig } from '../types';

export interface TextEffectPresetInfo {
  id: TextEffectType;
  name: string;
  description: string;
  defaultEffectColor: string;
}

export const TEXT_EFFECT_PRESETS: TextEffectPresetInfo[] = [
  {
    id: 'none',
    name: 'Limpio',
    description: 'Texto nítido clásico',
    defaultEffectColor: '000000',
  },
  {
    id: 'shadow',
    name: 'Sombra Pro',
    description: 'Sombra intensa de alto contraste',
    defaultEffectColor: '000000',
  },
  {
    id: '3d',
    name: 'Efecto 3D',
    description: 'Relieve tridimensional extruido',
    defaultEffectColor: '1E1B4B',
  },
  {
    id: 'outline',
    name: 'Contorno / Trazo',
    description: 'Borde marcado alrededor de cada letra',
    defaultEffectColor: '0F172A',
  },
  {
    id: 'neon',
    name: 'Brillo Neón',
    description: 'Resplandor luminoso vivo',
    defaultEffectColor: '38BDF8',
  },
  {
    id: 'pop3d',
    name: '3D + Trazo Pop',
    description: 'Doble efecto: borde firme + bloque 3D',
    defaultEffectColor: 'E11D48',
  },
];

export const TEXT_COLOR_SWATCHES = [
  { label: 'Auto Plantilla', hex: 'auto' },
  { label: 'Blanco Puro', hex: 'FFFFFF' },
  { label: 'Amarillo Oro', hex: 'FACC15' },
  { label: 'Azul Cielo', hex: '38BDF8' },
  { label: 'Rosa Coral', hex: 'FB7185' },
  { label: 'Verde Menta', hex: '34D399' },
  { label: 'Naranja Vivo', hex: 'FB923C' },
  { label: 'Oscuro Carbón', hex: '0F172A' },
];

export const EFFECT_COLOR_SWATCHES = [
  { label: 'Negro', hex: '09090B' },
  { label: 'Azul Profundo', hex: '1E3A8A' },
  { label: 'Violeta Intenso', hex: '6D28D9' },
  { label: 'Rojo Carmesí', hex: 'BE123C' },
  { label: 'Cian Neón', hex: '0284C7' },
  { label: 'Esmeralda', hex: '047857' },
  { label: 'Dorado', hex: 'CA8A04' },
  { label: 'Blanco', hex: 'FFFFFF' },
];

export const DEFAULT_TEXT_STYLE: TextStyleConfig = {
  effect: 'shadow',
  textColor: 'auto',
  effectColor: '09090B',
  position: 'bottom',
  size: 'md',
  showBackgroundBox: true,
};

export function resolveTextColor(
  style: TextStyleConfig,
  templateDefaultHex: string
): string {
  if (!style.textColor || style.textColor === 'auto') {
    return templateDefaultHex;
  }
  return style.textColor;
}

export function getPreviewTextStyles(
  style: TextStyleConfig,
  templateDefaultTextColor: string,
  isCoverTitle: boolean = false
): React.CSSProperties {
  const mainColor = `#${resolveTextColor(style, templateDefaultTextColor)}`;
  const fxHex = `#${style.effectColor || '09090B'}`;

  const css: React.CSSProperties = {
    color: mainColor,
    paintOrder: 'stroke fill',
  };

  switch (style.effect) {
    case 'none':
      break;

    case 'shadow':
      css.textShadow = isCoverTitle
        ? `0 4px 12px ${fxHex}, 0 2px 4px rgba(0,0,0,0.85)`
        : `0 3px 8px ${fxHex}, 0 1px 3px rgba(0,0,0,0.9)`;
      break;

    case '3d':
      css.textShadow = isCoverTitle
        ? `1px 1px 0 ${fxHex}, 2px 2px 0 ${fxHex}, 3px 3px 0 ${fxHex}, 4px 4px 0 ${fxHex}, 5px 5px 0 ${fxHex}, 6px 6px 12px rgba(0,0,0,0.75)`
        : `1px 1px 0 ${fxHex}, 2px 2px 0 ${fxHex}, 3px 3px 0 ${fxHex}, 4px 4px 8px rgba(0,0,0,0.7)`;
      break;

    case 'outline':
      css.WebkitTextStroke = isCoverTitle
        ? `2.5px ${fxHex}`
        : `1.8px ${fxHex}`;
      css.textShadow = `0 2px 4px rgba(0,0,0,0.35)`;
      break;

    case 'neon':
      css.textShadow = `0 0 6px ${fxHex}, 0 0 14px ${fxHex}, 0 0 26px ${fxHex}, 0 2px 4px rgba(0,0,0,0.8)`;
      break;

    case 'pop3d':
      css.WebkitTextStroke = isCoverTitle
        ? `2px #09090B`
        : `1.5px #09090B`;
      css.textShadow = isCoverTitle
        ? `2px 2px 0 ${fxHex}, 4px 4px 0 ${fxHex}, 6px 6px 0 ${fxHex}, 7px 7px 10px rgba(0,0,0,0.65)`
        : `2px 2px 0 ${fxHex}, 3px 3px 0 ${fxHex}, 4px 4px 0 ${fxHex}, 5px 5px 8px rgba(0,0,0,0.6)`;
      break;
  }

  return css;
}
