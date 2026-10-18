import { TemplateId } from '../types';

const TEMPLATE_STYLE_HINTS: Record<TemplateId, string> = {
  corporate:
    'modern corporate architecture, clean professional business aesthetic, deep blue and sleek glass tones, minimal, high-end presentation background, no text',
  minimal:
    'minimalist bright clean studio background, soft natural shadows, subtle architectural geometry, airy light tones, high key photography, no text',
  dark:
    'cinematic dark futuristic abstract background, subtle purple and indigo neon rim lighting, sleek matte dark surfaces, depth of field, no text',
  creative:
    'vibrant dynamic creative design background, bold artistic shapes, modern colorful lighting, inspiring studio atmosphere, no text',
  academic:
    'classic academic library or botanical architectural aesthetic, warm natural light, refined scholarly atmosphere, soft focus, no text',
  editorial:
    'warm editorial magazine photography, terracotta and golden hour sunlight, organic textures, cinematic composition, no text',
};

export function buildSuggestedPrompt(
  title: string,
  subtitle: string,
  templateId: TemplateId
): string {
  const cleanTitle = title.trim() || 'Presentación profesional';
  const cleanSub = subtitle.trim();
  const baseTopic = cleanSub ? `${cleanTitle} (${cleanSub})` : cleanTitle;

  const styleDesc: Record<TemplateId, string> = {
    corporate: 'estilo corporativo moderno, iluminación profesional azul y cristal',
    minimal: 'estilo minimalista limpio, tonos claros y elegantes',
    dark: 'estilo cinematográfico oscuro con luces violetas sutiles',
    creative: 'estilo artístico vibrante, colores modernos y dinámicos',
    academic: 'estilo clásico académico y elegante con luz cálida',
    editorial: 'estilo fotografía editorial cálida al atardecer',
  };

  return `Fondo visual sobre "${baseTopic}", ${styleDesc[templateId]}, formato panorámico sin texto`;
}

export async function generateAiCoverBackground(
  userPrompt: string,
  templateId: TemplateId,
  customSeed?: number
): Promise<{ dataUrl: string; width: number; height: number; seed: number }> {
  const seed = customSeed ?? Math.floor(Math.random() * 900000) + 100000;
  const styleHint = TEMPLATE_STYLE_HINTS[templateId] || TEMPLATE_STYLE_HINTS.corporate;

  const fullPrompt = `${userPrompt.trim()}. ${styleHint}, widescreen 16:9 presentation wallpaper, ultra detailed, 8k, no text, no letters, no watermark`;

  const width = 1280;
  const height = 720;

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    fullPrompt
  )}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  // Fetch image as Blob and convert to base64 DataURL so PptxGenJS embeds it offline
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Servidor IA respondió con estado ${response.status}`);
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      width,
      height,
      seed,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo convertir la imagen generada a Base64'));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo imagen de IA'));
    reader.readAsDataURL(blob);
  });
}
