export type TemplateId =
  | 'corporate'
  | 'minimal'
  | 'dark'
  | 'creative'
  | 'academic'
  | 'editorial';

export type PhotoLayoutMode = 'contain' | 'cover';

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
}

export interface PresentationConfig {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  templateId: TemplateId;
  showSlideNumbers: boolean;
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
  coverStyle: 'geometric-bar' | 'minimal-frame' | 'dark-glow' | 'diagonal-split' | 'classic-header' | 'editorial-card';
}
