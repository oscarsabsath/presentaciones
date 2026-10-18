import React from 'react';
import { PhotoItem, PresentationConfig } from '../types';
import { getTemplateById } from '../templates';
import { DEFAULT_TEXT_STYLE, getPreviewTextStyles } from '../utils/textEffects';

interface SlideVisualPreviewProps {
  config: PresentationConfig;
  photo?: PhotoItem; // If omitted, renders the Cover slide
  slideIndex?: number; // 0 = cover, 1..N = photo slides
  totalSlides?: number;
}

export const SlideVisualPreview: React.FC<SlideVisualPreviewProps> = ({
  config,
  photo,
  slideIndex = 0,
  totalSlides = 1,
}) => {
  const template = getTemplateById(config.templateId);
  const globalTextStyle = config.textStyle || DEFAULT_TEXT_STYLE;

  // =========================================================================
  // RENDER COVER SLIDE (PRIMERA DIAPOSITIVA)
  // =========================================================================
  if (!photo) {
    const titleText = config.title.trim() || 'Título de la Presentación';
    const subtitleText =
      config.subtitle.trim() ||
      'Subtítulo o descripción breve de tu presentación';
    const metaParts = [config.author.trim(), config.date.trim()].filter(
      Boolean
    );
    const metaText = metaParts.join('  •  ');
    const hasCustomBg = Boolean(config.coverBackground?.dataUrl);
    const overlayOpacity =
      (config.coverBackground?.overlayOpacity ?? 55) / 100;
    const logo = config.coverLogo;

    const coverTitleStyles = getPreviewTextStyles(
      globalTextStyle,
      template.colors.coverTitle,
      true
    );

    const coverSizeClass =
      globalTextStyle.size === 'lg'
        ? 'text-xl sm:text-3xl md:text-4xl'
        : globalTextStyle.size === 'sm'
        ? 'text-base sm:text-xl md:text-2xl'
        : 'text-lg sm:text-2xl md:text-3xl';

    return (
      <div
        className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl select-none transition-all duration-300"
        style={{
          backgroundColor: `#${template.colors.coverBg}`,
          fontFamily: template.fontFace,
        }}
      >
        {/* Optional Custom Cover Background Image */}
        {hasCustomBg && config.coverBackground && (
          <>
            <img
              src={config.coverBackground.dataUrl}
              alt="Fondo de portada"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: `#${template.colors.coverBg}`,
                  opacity: overlayOpacity,
                }}
              />
            )}
          </>
        )}

        {/* Template-specific decorations */}
        {template.coverStyle === 'geometric-bar' && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-[4.5%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
            <div
              className="absolute left-[4.5%] top-0 bottom-0 w-[1.5%]"
              style={{
                backgroundColor: `#${template.colors.coverSecondaryAccent}`,
              }}
            />
            <div
              className="absolute right-0 bottom-0 w-[22%] h-[13%]"
              style={{
                backgroundColor: `#${template.colors.coverSecondaryAccent}`,
              }}
            />
            <div
              className="absolute left-[11%] top-[25%] w-[12%] h-[1.4%] rounded-full"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
          </>
        )}

        {template.coverStyle === 'minimal-frame' && (
          <>
            <div
              className="absolute inset-[5%] pointer-events-none"
              style={{
                border: `2px solid #${template.colors.coverSecondaryAccent}`,
              }}
            />
            <div
              className="absolute left-[11%] top-[27%] w-[8%] h-[1.2%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
          </>
        )}

        {template.coverStyle === 'dark-glow' && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-[2.2%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
            <div
              className="absolute -right-[8%] -top-[15%] w-[36%] aspect-square rounded-full blur-xl opacity-35"
              style={{
                backgroundColor: `#${template.colors.coverSecondaryAccent}`,
              }}
            />
            <div
              className="absolute left-[11%] top-[26%] w-[9%] h-[1.4%] rounded-full"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
          </>
        )}

        {template.coverStyle === 'diagonal-split' && (
          <>
            <div
              className="absolute right-0 top-0 bottom-0 w-[18%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
            <div
              className="absolute right-[18%] top-0 bottom-0 w-[3.5%]"
              style={{
                backgroundColor: `#${template.colors.coverSecondaryAccent}`,
              }}
            />
          </>
        )}

        {template.coverStyle === 'classic-header' && (
          <>
            <div
              className="absolute top-0 left-0 right-0 h-[8%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
            <div
              className="absolute left-[11%] right-[11%] bottom-[22%] h-[0.7%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
          </>
        )}

        {template.coverStyle === 'editorial-card' && (
          <>
            <div
              className="absolute left-[7%] top-[11.5%] bottom-[11.5%] w-[1.2%]"
              style={{ backgroundColor: `#${template.colors.coverAccent}` }}
            />
            <div
              className="absolute left-[11%] top-[25%] w-[14%] h-[1.2%]"
              style={{
                backgroundColor: `#${template.colors.coverSecondaryAccent}`,
              }}
            />
          </>
        )}

        {/* Optional Cover Logo */}
        {logo && logo.dataUrl && (
          <div
            className={`absolute z-20 flex items-center justify-center ${
              logo.position === 'top-left'
                ? 'left-[11%] top-[8%]'
                : logo.position === 'top-right'
                ? 'right-[8%] top-[8%]'
                : 'right-[8%] bottom-[10%]'
            }`}
            style={{ maxWidth: '18%', maxHeight: '16%' }}
          >
            <img
              src={logo.dataUrl}
              alt="Logo"
              className="max-w-full max-h-10 sm:max-h-14 object-contain drop-shadow-md"
            />
          </div>
        )}

        {/* Cover Text Block */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center pl-[11%] pr-[22%] py-[8%]">
          <h2
            className={`font-extrabold leading-tight line-clamp-2 tracking-tight ${coverSizeClass}`}
            style={coverTitleStyles}
          >
            {titleText}
          </h2>

          {(config.subtitle.trim() || !config.title.trim()) && (
            <p
              className="mt-2 text-xs sm:text-sm md:text-base line-clamp-2 font-medium opacity-95"
              style={{
                color: `#${template.colors.coverSubtitle}`,
                textShadow:
                  globalTextStyle.effect !== 'none'
                    ? '0 2px 6px rgba(0,0,0,0.65)'
                    : undefined,
              }}
            >
              {subtitleText}
            </p>
          )}

          {metaText && (
            <p
              className="absolute bottom-[10%] left-[11%] text-[10px] sm:text-xs opacity-90"
              style={{
                color: `#${template.colors.coverSubtitle}`,
                fontStyle:
                  template.id === 'academic' || template.id === 'editorial'
                    ? 'italic'
                    : 'normal',
              }}
            >
              {metaText}
            </p>
          )}
        </div>

        <div className="absolute top-2.5 left-3 z-20 bg-black/45 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/15">
          Portada (Diapositiva 1)
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER PHOTO SLIDE (DIAPOSITIVA DE FOTO CON TEXTO VIVO)
  // =========================================================================
  const hasCaption = photo.caption.trim().length > 0;
  const slideTextStyle = photo.customTextStyle || globalTextStyle;
  const showBox = slideTextStyle.showBackgroundBox;
  const pos = slideTextStyle.position || 'bottom';

  const useCustomSlideBg = Boolean(
    config.coverBackground?.dataUrl && config.coverBackground?.applyToAllSlides
  );
  const slideOverlayOpacity =
    (config.coverBackground?.overlayOpacity ?? 55) / 100;

  const defaultCaptionColor = showBox
    ? template.colors.slideCaptionText
    : slideTextStyle.effect !== 'none'
    ? 'FFFFFF'
    : template.colors.slideTitle;

  const captionCss = getPreviewTextStyles(
    slideTextStyle,
    defaultCaptionColor,
    false
  );

  const fontSizeClass =
    slideTextStyle.size === 'lg'
      ? 'text-base sm:text-xl md:text-2xl'
      : slideTextStyle.size === 'sm'
      ? 'text-xs sm:text-sm'
      : 'text-sm sm:text-base md:text-lg';

  const positionContainerClass =
    pos === 'top'
      ? showBox
        ? 'top-[4%] left-[6%] right-[6%] py-2 px-4 rounded-xl shadow-lg'
        : 'top-[5%] left-[6%] right-[6%] py-1 px-3'
      : pos === 'center'
      ? showBox
        ? 'top-1/2 -translate-y-1/2 left-[8%] right-[8%] py-3 px-4 rounded-2xl shadow-xl'
        : 'top-1/2 -translate-y-1/2 left-[6%] right-[6%] py-2 px-3'
      : photo.layoutMode === 'cover' && showBox
      ? 'bottom-0 left-0 right-0 h-[15%] px-[5%]'
      : showBox
      ? 'bottom-[4%] left-[8%] right-[8%] h-[12%] rounded-xl px-4 shadow-md'
      : 'bottom-[5%] left-[6%] right-[6%] py-1 px-3';

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl select-none transition-all duration-300"
      style={{
        backgroundColor: `#${template.colors.slideBg}`,
        fontFamily: template.fontFace,
      }}
    >
      {/* Optional Shared Background Image on Photo Slides */}
      {useCustomSlideBg && config.coverBackground && (
        <>
          <img
            src={config.coverBackground.dataUrl}
            alt="Fondo de diapositiva"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {slideOverlayOpacity > 0 && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `#${template.colors.slideBg}`,
                opacity: slideOverlayOpacity,
              }}
            />
          )}
        </>
      )}

      {photo.layoutMode === 'contain' && (
        <div
          className="absolute top-0 left-0 right-0 h-[1.5%] z-10"
          style={{ backgroundColor: `#${template.colors.slideAccent}` }}
        />
      )}

      {/* Image Container */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center overflow-hidden ${
          photo.layoutMode === 'contain'
            ? hasCaption && showBox && pos === 'bottom'
              ? 'px-[6.5%] pt-[5%] pb-[18%]'
              : hasCaption && showBox && pos === 'top'
              ? 'px-[6.5%] pt-[16%] pb-[5%]'
              : 'px-[6.5%] py-[6%]'
            : hasCaption && showBox && pos === 'bottom'
            ? 'pb-[15%]'
            : ''
        }`}
      >
        <img
          src={photo.dataUrl}
          alt={photo.name}
          className={`max-w-full max-h-full transition-all ${
            photo.layoutMode === 'cover'
              ? 'w-full h-full object-cover'
              : 'object-contain rounded shadow-sm'
          }`}
        />
      </div>

      {/* Rich Styled Slide Text / Caption */}
      {hasCaption && (
        <div
          className={`absolute z-20 flex items-center justify-center ${positionContainerClass}`}
          style={
            showBox
              ? {
                  backgroundColor: `#${template.colors.slideCaptionBg}`,
                  borderTop:
                    photo.layoutMode === 'cover' && pos === 'bottom'
                      ? `3px solid #${template.colors.slideAccent}`
                      : undefined,
                }
              : undefined
          }
        >
          <p
            className={`${fontSizeClass} font-extrabold text-center w-full break-words leading-snug`}
            style={captionCss}
          >
            {photo.caption}
          </p>
        </div>
      )}

      {/* Slide Number */}
      {config.showSlideNumbers && (
        <div
          className="absolute z-30 bottom-2 right-3 text-[10px] font-semibold opacity-80"
          style={{
            color:
              photo.layoutMode === 'cover' && hasCaption && showBox && pos === 'bottom'
                ? `#${template.colors.slideCaptionText}`
                : `#${template.colors.slideAccent}`,
          }}
        >
          {slideIndex + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
};
