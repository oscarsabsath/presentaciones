import PptxGenJS from 'pptxgenjs';
import { PhotoItem, PresentationConfig, TextStyleConfig } from '../types';
import { getTemplateById } from '../templates';
import { DEFAULT_TEXT_STYLE, resolveTextColor } from '../utils/textEffects';

const SLIDE_W = 10; // inches (LAYOUT_16x9)
const SLIDE_H = 5.625; // inches

function addStyledSlideText(
  slide: PptxGenJS.Slide,
  text: string,
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
    fontFace: string;
    fontSize: number;
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
  },
  style: TextStyleConfig,
  defaultColorHex: string
) {
  const mainColor = resolveTextColor(style, defaultColorHex);
  const fxColor = style.effectColor || '09090B';
  const align = box.align || 'center';
  const valign = box.valign || 'middle';

  // For 3D and Pop3D, add an extruded 3D depth layer behind the main text
  if (style.effect === '3d' || style.effect === 'pop3d') {
    const offset = box.fontSize >= 32 ? 0.045 : 0.032;
    slide.addText(text, {
      x: box.x + offset,
      y: box.y + offset,
      w: box.w,
      h: box.h,
      fontFace: box.fontFace,
      fontSize: box.fontSize,
      bold: true,
      color: fxColor,
      align,
      valign,
      breakLine: true,
      shadow: {
        type: 'outer',
        color: '000000',
        blur: 6,
        offset: 3,
        angle: 45,
        opacity: 0.65,
      },
    });
  }

  // Build foreground PptxGenJS text options
  const textOpts: PptxGenJS.TextPropsOptions = {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontFace: box.fontFace,
    fontSize: box.fontSize,
    bold: true,
    color: mainColor,
    align,
    valign,
    breakLine: true,
  };

  switch (style.effect) {
    case 'shadow':
      textOpts.shadow = {
        type: 'outer',
        color: fxColor,
        blur: 8,
        offset: 4,
        angle: 45,
        opacity: 0.85,
      };
      break;

    case '3d':
      textOpts.outline = {
        color: fxColor,
        size: 0.75,
      };
      break;

    case 'outline':
      textOpts.outline = {
        color: fxColor,
        size: box.fontSize >= 32 ? 2.2 : 1.6,
      };
      textOpts.shadow = {
        type: 'outer',
        color: '000000',
        blur: 4,
        offset: 2,
        angle: 45,
        opacity: 0.45,
      };
      break;

    case 'neon':
      textOpts.glow = {
        color: fxColor,
        size: 12,
        opacity: 0.85,
      };
      textOpts.shadow = {
        type: 'outer',
        color: fxColor,
        blur: 10,
        offset: 0,
        angle: 0,
        opacity: 0.75,
      };
      break;

    case 'pop3d':
      textOpts.outline = {
        color: '09090B',
        size: box.fontSize >= 32 ? 1.8 : 1.3,
      };
      break;

    case 'none':
    default:
      break;
  }

  slide.addText(text, textOpts);
}

export async function generatePresentationPptx(
  config: PresentationConfig,
  photos: PhotoItem[]
): Promise<string> {
  const pptx = new PptxGenJS();
  const template = getTemplateById(config.templateId);
  const globalTextStyle = config.textStyle || DEFAULT_TEXT_STYLE;

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = config.title || 'Presentación';
  pptx.author = config.author || 'FotoPPT App';
  pptx.subject = config.subtitle || 'Presentación generada automáticamente';

  // =========================================================================
  // 1. COVER SLIDE (PRIMERA DIAPOSITIVA CON TÍTULO, PLANTILLA, FONDO Y LOGO)
  // =========================================================================
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: template.colors.coverBg };

  // Optional Custom Background Image on Cover Slide
  if (config.coverBackground?.dataUrl) {
    coverSlide.addImage({
      data: config.coverBackground.dataUrl,
      x: 0,
      y: 0,
      w: SLIDE_W,
      h: SLIDE_H,
    });

    const overlayOpacity = config.coverBackground.overlayOpacity ?? 55;
    if (overlayOpacity > 0) {
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: SLIDE_H,
        fill: {
          color: template.colors.coverBg,
          transparency: Math.max(0, Math.min(100, 100 - overlayOpacity)),
        },
      });
    }
  }

  const titleText = config.title.trim() || 'Título de la Presentación';
  const subtitleText = config.subtitle.trim();
  const metaParts = [config.author.trim(), config.date.trim()].filter(Boolean);
  const metaText = metaParts.join('  •  ');

  switch (template.coverStyle) {
    case 'geometric-bar': {
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
      coverSlide.addShape(pptx.ShapeType.rect, {
        x: 7.8,
        y: 4.9,
        w: 2.2,
        h: 0.725,
        fill: { color: template.colors.coverSecondaryAccent },
      });
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

  // Optional Custom Logo on Cover Slide
  if (config.coverLogo?.dataUrl) {
    const logo = config.coverLogo;
    const logoRatio = (logo.width || 1) / (logo.height || 1);
    const maxLogoW = 1.65;
    const maxLogoH = 0.85;

    let logoW = maxLogoW;
    let logoH = logoW / logoRatio;
    if (logoH > maxLogoH) {
      logoH = maxLogoH;
      logoW = logoH * logoRatio;
    }

    let logoX = 1.1;
    let logoY = 0.45;
    if (logo.position === 'top-left') {
      logoX = 1.1;
      logoY = 0.45;
    } else if (logo.position === 'top-right') {
      logoX = SLIDE_W - logoW - 0.75;
      logoY = 0.45;
    } else if (logo.position === 'bottom-right') {
      logoX = SLIDE_W - logoW - 0.75;
      logoY = SLIDE_H - logoH - 0.55;
    }

    coverSlide.addImage({
      data: logo.dataUrl,
      x: logoX,
      y: logoY,
      w: logoW,
      h: logoH,
    });
  }

  // Main Cover Title with Rich Text Effects (3D / Shadow / Outline / Neon)
  const coverFontSize =
    globalTextStyle.size === 'lg'
      ? 44
      : globalTextStyle.size === 'sm'
      ? 34
      : 40;

  addStyledSlideText(
    coverSlide,
    titleText,
    {
      x: 1.1,
      y: 1.65,
      w: 6.6,
      h: 1.65,
      fontFace: template.fontFace,
      fontSize: coverFontSize,
      align: 'left',
      valign: 'middle',
    },
    globalTextStyle,
    template.colors.coverTitle
  );

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
  // 2. PHOTO SLIDES (CON TEXTO VIVO EN CADA DIAPOSITIVA)
  // =========================================================================
  photos.forEach((photo, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: template.colors.slideBg };

    const slideTextStyle = photo.customTextStyle || globalTextStyle;
    const showBox = slideTextStyle.showBackgroundBox;
    const pos = slideTextStyle.position || 'bottom';

    // Optional Shared Background Image on Photo Slides
    if (
      config.coverBackground?.dataUrl &&
      config.coverBackground.applyToAllSlides
    ) {
      slide.addImage({
        data: config.coverBackground.dataUrl,
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: SLIDE_H,
      });

      const overlayOpacity = config.coverBackground.overlayOpacity ?? 55;
      if (overlayOpacity > 0) {
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: SLIDE_W,
          h: SLIDE_H,
          fill: {
            color: template.colors.slideBg,
            transparency: Math.max(0, Math.min(100, 100 - overlayOpacity)),
          },
        });
      }
    }

    const hasCaption = photo.caption.trim().length > 0;
    const imgRatio = (photo.width || 16) / (photo.height || 9);

    if (photo.layoutMode === 'cover') {
      const areaH =
        hasCaption && showBox && pos === 'bottom' ? SLIDE_H - 0.85 : SLIDE_H;
      const areaW = SLIDE_W;

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
    } else {
      // 'contain' mode (Framed with template styling)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: 0.08,
        fill: { color: template.colors.slideAccent },
      });

      const marginX = 0.65;
      const topY = hasCaption && showBox && pos === 'top' ? 1.05 : 0.35;
      const maxW = SLIDE_W - marginX * 2;
      const maxH =
        hasCaption && showBox && (pos === 'bottom' || pos === 'top')
          ? SLIDE_H - 1.45
          : SLIDE_H - 0.75;

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
    }

    // Render Rich Text on Photo Slide
    if (hasCaption) {
      const captionFontSize =
        slideTextStyle.size === 'lg'
          ? 28
          : slideTextStyle.size === 'sm'
          ? 16
          : 21;

      const defaultCaptionColor = showBox
        ? template.colors.slideCaptionText
        : slideTextStyle.effect !== 'none'
        ? 'FFFFFF'
        : template.colors.slideTitle;

      let boxX = 0.7;
      let boxY = SLIDE_H - 0.95;
      let boxW = SLIDE_W - 1.4;
      let boxH = 0.72;

      if (pos === 'top') {
        boxY = 0.25;
      } else if (pos === 'center') {
        boxY = (SLIDE_H - 1.1) / 2;
        boxH = 1.1;
      } else {
        // bottom
        if (photo.layoutMode === 'cover' && showBox) {
          boxX = 0;
          boxY = SLIDE_H - 0.85;
          boxW = SLIDE_W;
          boxH = 0.85;
        }
      }

      if (showBox) {
        if (photo.layoutMode === 'cover' && pos === 'bottom') {
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
        } else {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: boxX,
            y: boxY,
            w: boxW,
            h: boxH,
            rectRadius: 0.08,
            fill: { color: template.colors.slideCaptionBg, transparency: 10 },
          });
        }
      }

      addStyledSlideText(
        slide,
        photo.caption.trim(),
        {
          x: boxX + 0.2,
          y: boxY,
          w: boxW - 0.4,
          h: boxH,
          fontFace: template.fontFace,
          fontSize: captionFontSize,
          align: 'center',
          valign: 'middle',
        },
        slideTextStyle,
        defaultCaptionColor
      );
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
          photo.layoutMode === 'cover' && hasCaption && showBox && pos === 'bottom'
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
