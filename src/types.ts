export type TemplateId =
  | 'corporate'
  | 'minimal'
  | 'dark'
  | 'creative'
  | 'academic'
  | 'editorial';

export type PhotoLayoutMode = 'contain' | 'cover';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-right';

export type TextEffectType =
  | 'none'
  | 'shadow'
  | '3d'
  | 'outline'
  | 'neon'
  | 'pop3d';

export type SlideTextPosition = 'bottom' | 'center' | 'top';

export type TextSizeScale = 'sm' | 'md' | 'lg';

export interface TextStyleConfig {
  effect: TextEffectType;
  textColor: string; // Hex without #, or 'auto' to use template color
  effectColor: string; // Hex without # for stroke/3d/glow/shadow
  position: SlideTextPosition;
  size: TextSizeScale;
  showBackgroundBox: boolean;
}

export interface CoverLogoConfig {
  dataUrl: string;
  width: number;
  height: number;
  position: LogoPosition;
  scale: number; // 50 to 220 (percentage, 100 = default)
}

export interface CoverBackgroundConfig {
  dataUrl: string;
  width: number;
  height: number;
  overlayOpacity: number; // 0 to 85 (percentage)
  applyToAllSlides: boolean;
}

export interface PhotoItem {
  id: string;
  file?: File;
  dataUrl: string;
  name: string;
  caption: string;
  layoutMode: PhotoLayoutMode;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  customTextStyle?: TextStyleConfig; // Optional override per slide
}

export interface PresentationConfig {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  templateId: TemplateId;
  showSlideNumbers: boolean;
  coverLogo?: CoverLogoConfig | null;
  coverBackground?: CoverBackgroundConfig | null;
  textStyle: TextStyleConfig;
}

export interface SlideTemplate {
  id: TemplateId;
  name: string;
  tagline: string;
  badge: string;
  fontFace: string;
  colors: {
    coverBg: string; // Hex without #
    coverAccent: string;
    coverSecondaryAccent: string;
    coverTitle: string;
    coverSubtitle: string;
    slideBg: string;
    slideTitle: string;
    slideCaptionBg: string;
    slideCaptionText: string;
    slideAccent: string;
  };
  coverStyle:
    | 'geometric-bar'
    | 'minimal-frame'
    | 'dark-glow'
    | 'diagonal-split'
    | 'classic-header'
    | 'editorial-card';
}
