import type { AnalysisResult } from '../types/analysis';

type ShareCardInput = {
  analysis: AnalysisResult;
  shareUrl?: string;
  uploadedPhoto?: string | null;
  includePhoto?: boolean;
};

type NativeShareInput = {
  title: string;
  text: string;
  url?: string;
  file?: File;
};

type ShareNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
};

const cardWidth = 1080;
const cardHeight = 1350;

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Unable to load share image.'));
  image.src = src;
});

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.slice(0, maxLines).forEach((lineText, index) => {
    const output = index === maxLines - 1 && lines.length > maxLines ? `${lineText}...` : lineText;
    context.fillText(output, x, y + (index * lineHeight));
  });

  return y + (Math.min(lines.length, maxLines) * lineHeight);
};

const drawRoundedImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  context.save();
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.clip();

  const imageRatio = image.width / image.height;
  const boxRatio = width / height;
  const drawWidth = imageRatio > boxRatio ? height * imageRatio : width;
  const drawHeight = imageRatio > boxRatio ? height : width / imageRatio;
  const drawX = x + ((width - drawWidth) / 2);
  const drawY = y + ((height - drawHeight) / 2);

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
};

export const createShareCardBlob = async ({
  analysis,
  shareUrl,
  uploadedPhoto,
  includePhoto = false
}: ShareCardInput): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = cardWidth;
  canvas.height = cardHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas is not supported in this browser.');
  }

  context.fillStyle = '#FFFCFA';
  context.fillRect(0, 0, cardWidth, cardHeight);
  context.fillStyle = '#FBEEF1';
  context.fillRect(0, 0, cardWidth, 430);

  context.fillStyle = '#D8647A';
  context.font = '700 34px Inter, Arial, sans-serif';
  context.fillText('ColorSnap', 72, 92);

  context.fillStyle = '#181414';
  context.font = '800 92px Inter, Arial, sans-serif';
  drawWrappedText(
    context,
    analysis.season_result?.primary || 'Color Analysis',
    72,
    210,
    760,
    100,
    2
  );

  context.fillStyle = '#6E6460';
  context.font = '400 36px Inter, Arial, sans-serif';
  drawWrappedText(
    context,
    analysis.summary?.one_liner || 'Your personalized color report is ready.',
    72,
    420,
    880,
    52,
    3
  );

  if (includePhoto && uploadedPhoto) {
    try {
      const image = await loadImage(uploadedPhoto);
      drawRoundedImage(context, image, 720, 96, 250, 320, 28);
    } catch {
      // If the photo cannot be exported, keep the card shareable without it.
    }
  }

  context.fillStyle = '#181414';
  context.font = '700 42px Inter, Arial, sans-serif';
  context.fillText('Recommended Palette', 72, 620);

  const colors = (analysis.recommended_palette || []).slice(0, 5);
  colors.forEach((color, index) => {
    const x = 72 + (index * 190);
    context.fillStyle = color.hex;
    context.fillRect(x, 670, 138, 138);
    context.strokeStyle = 'rgba(24, 20, 20, 0.12)';
    context.strokeRect(x, 670, 138, 138);
    context.fillStyle = '#181414';
    context.font = '700 22px Inter, Arial, sans-serif';
    drawWrappedText(context, color.name, x, 846, 145, 28, 2);
  });

  context.fillStyle = '#181414';
  context.font = '700 42px Inter, Arial, sans-serif';
  context.fillText('Top Beauty Picks', 72, 990);

  const topProducts = (analysis.products || []).slice(0, 3);
  context.fillStyle = '#6E6460';
  context.font = '400 30px Inter, Arial, sans-serif';
  if (topProducts.length > 0) {
    topProducts.forEach((product, index) => {
      context.fillText(`${index + 1}. ${product.name}`, 72, 1050 + (index * 48));
    });
  } else {
    context.fillText('Personalized lipstick, blush, and eyeshadow picks.', 72, 1050);
  }

  context.fillStyle = '#D8647A';
  context.font = '700 28px Inter, Arial, sans-serif';
  context.fillText(shareUrl || 'Create your own report with ColorSnap', 72, 1260);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to export share card.'));
        return;
      }

      resolve(blob);
    }, 'image/png', 0.95);
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

export const copyToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export const shareWithNativeSheet = async ({
  title,
  text,
  url,
  file
}: NativeShareInput): Promise<'shared' | 'unsupported' | 'cancelled'> => {
  const shareNavigator = navigator as ShareNavigator;

  if (!shareNavigator.share) {
    return 'unsupported';
  }

  const fileData = file ? { files: [file] } : {};
  const canShareFile = Boolean(file && shareNavigator.canShare?.(fileData));

  try {
    if (file && canShareFile) {
      await shareNavigator.share({
        title,
        text,
        url,
        files: [file]
      });
      return 'shared';
    }

    await shareNavigator.share({
      title,
      text,
      url
    });
    return 'shared';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }

    throw error;
  }
};
