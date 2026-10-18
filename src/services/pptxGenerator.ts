import PptxGenJS from 'pptxgenjs';
import { PhotoItem, PresentationConfig } from '../types';
import { getTemplateById } from '../templates';

const SLIDE_W = 10; // inches (LAYOUT_16x9)
const SLIDE_H = 5.625; // inches

export async function generatePresentationPptx(
  config: PresentationConfig,
  photos: PhotoItem[]
): Promise<string> {
  const pptx = new PptxGenJS();
  const template = getTemplateById(config.templateId);

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = config.title || 'Presentación';
  pptx.author = config.author || 'FotoPPT App';
  pptx.subject = config.subtitle || 'Presentación generada automáticamente';

  // =========================================================================
  // 1. COVER SLIDE (PRIMERA DIAPOSITIVA CON TÍTULO Y PLANTILLA)
  // =========================================================================
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: template.colors.coverBg };

  const titleText = config.title.trim() || 'Título de la Presentación';
  const subtitleText = config.subtitle.trim();
  const metaParts = [config.author.trim(), config.date.trim()].filter(Boolean);
  const metaText = metaParts.join('  •  ');

  switch (template.coverStyle) {
    case 'geometric-bar': {
      // Left vertical accent bars
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.45,
        h: SLIDE_H,
        fill: { color: template.colors.coverAccent },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0.45,
        y: 0,
        w: 0.15,
        h: SLIDE_H,
        fill: { color: template.colors.coverSecondaryAccent },
      });
      // Decorative right-bottom accent block
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 7.8,
        y: 4.9,
        w: 2.2,
        h: 0.725,
        fill: { color: template.colors.coverSecondaryAccent },
      });
      // Small accent pill above title
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 1.1,
        y: 1.45,
        w: 1.2,
        h: 0.08,
        fill: { color: template.colors.coverAccent },
      });
      break;
    }

    case 'minimal-frame': {
      // Crisp minimal border frame inside the cover
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.5,
        w: SLIDE_W - 1.0,
        h: SLIDE_H - 1.0,
        line: { color: template.colors.coverSecondaryAccent, width: 1.5 },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 1.1,
        y: 1.55,
        w: 0.8,
        h: 0.06,
        fill: { color: template.colors.coverAccent },
      });
      break;
    }

    case 'dark-glow': {
      // Top and bottom neon accent bars
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: 0.12,
        fill: { color: template.colors.coverAccent },
      });
      coverSlide.addShape(pptx.ShapeType.ellipse, {
        x: 7.4,
        y: -0.8,
        w: 3.4,
        h: 3.4,
        fill: { color: template.colors.coverSecondaryAccent, transparency: 75 },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 1.1,
        y: 1.5,
        w: 0.9,
        h: 0.08,
        fill: { color: template.colors.coverAccent },
      });
      break;
    }

    case 'diagonal-split': {
      // Bold color blocks
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 8.2,
        y: 0,
        w: 1.8,
        h: SLIDE_H,
        fill: { color: template.colors.coverAccent },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 7.85,
        y: 0,
        w: 0.35,
        h: SLIDE_H,
        fill: { color: template.colors.coverSecondaryAccent },
      });
      break;
    }

    case 'classic-header': {
      // Top institutional band + bottom thin line
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: 0.45,
        fill: { color: template.colors.coverAccent },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 1.1,
        y: 4.35,
        w: 7.8,
        h: 0.04,
        fill: { color: template.colors.coverAccent },
      });
      break;
    }

    case 'editorial-card': {
      // Warm editorial card accent
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0.7,
        y: 0.65,
        w: 0.12,
        h: SLIDE_H - 1.3,
        fill: { color: template.colors.coverAccent },
      });
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 1.1,
        y: 1.4,
        w: 1.4,
        h: 0.07,
        fill: { color: template.colors.coverSecondaryAccent },
      });
      break;
    }
  }

  // Main Cover Title
  coverSlide.addText(titleText, {
    x: 1.1,
    y: 1.7,
    w: 6.6,
    h: 1.6,
    fontFace: template.fontFace,
    fontSize: 40,
    bold: true,
    color: template.colors.coverTitle,
    valign: 'middle',
    breakLine: true,
  });

  // Optional Subtitle
  if (subtitleText) {
    coverSlide.addText(subtitleText, {
      x: 1.1,
      y: 3.35,
      w: 6.5,
      h: 0.85,
      fontFace: template.fontFace,
      fontSize: 20,
      color: template.colors.coverSubtitle,
      valign: 'top',
    });
  }

  // Optional Author / Date Footer
  if (metaText) {
    coverSlide.addText(metaText, {
      x: 1.1,
      y: 4.55,
      w: 6.5,
      h: 0.45,
      fontFace: template.fontFace,
      fontSize: 13,
      color: template.colors.coverSubtitle,
      italic: template.id === 'academic' || template.id === 'editorial',
    });
  }

  // =========================================================================
  // 2. PHOTO SLIDES (EN EL ORDEN ELEGIDO POR EL USUARIO)
  // =========================================================================
  photos.forEach((photo, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: template.colors.slideBg };

    const hasCaption = photo.caption.trim().length > 0;
    const imgRatio = (photo.width || 16) / (photo.height || 9);

    if (photo.layoutMode === 'cover') {
      // Full-bleed mode (fills slide or leaves bottom bar if caption exists)
      const areaH = hasCaption ? SLIDE_H - 0.85 : SLIDE_H;
      const areaW = SLIDE_W;
      const boxRatio = areaW / areaH;

      let drawW = areaW;
      let drawH = areaH;
      if (imgRatio > boxRatio) {
        drawH = areaH;
        drawW = areaH * imgRatio;
      } else {
        drawW = areaW;
        drawH = areaW / imgRatio;
      }

      // PptxGenJS sizing crop/contain fallback: center within slide bounds
      let finalW = areaW;
      let finalH = areaW / imgRatio;
      if (finalH > areaH) {
        finalH = areaH;
        finalW = areaH * imgRatio;
      }
      const finalX = (areaW - finalW) / 2;
      const finalY = (areaH - finalH) / 2;

      slide.addImage({
        data: photo.dataUrl,
        x: finalX,
        y: finalY,
        w: finalW,
        h: finalH,
      });

      if (hasCaption) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: SLIDE_H - 0.85,
          w: SLIDE_W,
          h: 0.85,
          fill: { color: template.colors.slideCaptionBg },
        });
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: SLIDE_H - 0.85,
          w: SLIDE_W,
          h: 0.05,
          fill: { color: template.colors.slideAccent },
        });
        slide.addText(photo.caption.trim(), {
          x: 0.5,
          y: SLIDE_H - 0.8,
          w: SLIDE_W - 1.4,
          h: 0.75,
          fontFace: template.fontFace,
          fontSize: 16,
          bold: true,
          color: template.colors.slideCaptionText,
          valign: 'middle',
        });
      }
    } else {
      // 'contain' mode (Framed with template styling)
      // Top thin accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: 0.08,
        fill: { color: template.colors.slideAccent },
      });

      const marginX = 0.65;
      const topY = 0.35;
      const maxW = SLIDE_W - marginX * 2;
      const maxH = hasCaption ? SLIDE_H - 1.45 : SLIDE_H - 0.75;

      let drawW = maxW;
      let drawH = drawW / imgRatio;

      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * imgRatio;
      }

      const drawX = (SLIDE_W - drawW) / 2;
      const drawY = topY + (maxH - drawH) / 2;

      slide.addImage({
        data: photo.dataUrl,
        x: drawX,
        y: drawY,
        w: drawW,
        h: drawH,
      });

      if (hasCaption) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: SLIDE_H - 0.92,
          w: SLIDE_W - 1.6,
          h: 0.65,
          rectRadius: 0.08,
          fill: { color: template.colors.slideCaptionBg },
        });

        slide.addText(photo.caption.trim(), {
          x: 1.05,
          y: SLIDE_H - 0.92,
          w: SLIDE_W - 2.1,
          h: 0.65,
          fontFace: template.fontFace,
          fontSize: 15,
          bold: true,
          color: template.colors.slideCaptionText,
          align: 'center',
          valign: 'middle',
        });
      }
    }

    // Optional Slide Number Badge
    if (config.showSlideNumbers) {
      slide.addText(`${index + 2} / ${photos.length + 1}`, {
        x: SLIDE_W - 1.15,
        y: SLIDE_H - 0.42,
        w: 0.9,
        h: 0.3,
        fontFace: template.fontFace,
        fontSize: 10,
        color:
          photo.layoutMode === 'cover' && hasCaption
            ? template.colors.slideCaptionText
            : template.colors.slideAccent,
        align: 'right',
      });
    }
  });

  const cleanFileName =
    (config.title || 'Presentacion')
      .trim()
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-_]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40) || 'Presentacion';

  const fullFileName = `${cleanFileName}.pptx`;
  await pptx.writeFile({ fileName: fullFileName });
  return fullFileName;
}
