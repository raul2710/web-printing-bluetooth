/**
 * TermoPrint - Algoritmos de Dithering e Processamento de Imagem para Impressão Térmica Monocromática (384px)
 */

export type DitherMode = 'atkinson' | 'floyd-steinberg' | 'threshold' | 'bayer';

export interface ImageProcessingOptions {
  brightness: number;  // -100 a +100
  contrast: number;    // -100 a +100
  sharpness: number;   // 0 a 100
  thresholdVal?: number; // 0 a 255 (padrão 128)
  ditherMode: DitherMode;
}

export interface ImageAnalysisResult {
  avgLuminance: number;
  contrastDev: number;
  suggestedBrightness: number;
  suggestedContrast: number;
  suggestedSharpness: number;
  tags: { label: string; type: 'warn' | 'neutral' | 'ok' }[];
  description: string;
}

/**
 * Analisa a imagem e sugere calibrações ideais para cabeça térmica de 203 DPI
 */
export function analyzeThermalImage(canvas: HTMLCanvasElement): ImageAnalysisResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      avgLuminance: 128,
      contrastDev: 50,
      suggestedBrightness: 0,
      suggestedContrast: 0,
      suggestedSharpness: 30,
      tags: [{ label: 'Normal', type: 'ok' }],
      description: 'Imagem pronta para processamento.'
    };
  }

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  let totalLum = 0;
  let totalPix = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalLum += lum;
    totalPix++;
  }

  const avgLum = totalPix > 0 ? totalLum / totalPix : 128;
  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    variance += (lum - avgLum) ** 2;
  }
  const stdDev = Math.sqrt(variance / totalPix);

  let suggestedBrightness = 0;
  let suggestedContrast = 0;
  const suggestedSharpness = 30;
  const tags: { label: string; type: 'warn' | 'neutral' | 'ok' }[] = [];

  if (avgLum < 80) {
    suggestedBrightness = Math.round(Math.min(75, (80 - avgLum) * 0.85));
    tags.push({ label: 'Foto Muito Escura', type: 'warn' });
  } else if (avgLum > 190) {
    suggestedBrightness = Math.round(Math.max(-50, (190 - avgLum) * 0.7));
    tags.push({ label: 'Foto Muito Clara', type: 'warn' });
  } else if (avgLum < 115) {
    suggestedBrightness = Math.round((115 - avgLum) * 0.45);
    tags.push({ label: 'Levemente Escura', type: 'neutral' });
  } else if (avgLum > 165) {
    suggestedBrightness = Math.round((165 - avgLum) * 0.4);
    tags.push({ label: 'Levemente Clara', type: 'neutral' });
  } else {
    tags.push({ label: 'Brilho Equilibrado', type: 'ok' });
  }

  if (stdDev < 35) {
    suggestedContrast = Math.round(Math.min(60, (35 - stdDev) * 1.8));
    tags.push({ label: 'Baixo Contraste', type: 'warn' });
  } else if (stdDev < 50) {
    suggestedContrast = Math.round((50 - stdDev) * 1.1);
    tags.push({ label: 'Contraste Médio', type: 'neutral' });
  } else if (stdDev > 90) {
    suggestedContrast = Math.round(Math.max(-25, (90 - stdDev) * 0.4));
    tags.push({ label: 'Alto Contraste', type: 'neutral' });
  } else {
    tags.push({ label: 'Contraste Bom', type: 'ok' });
  }

  const parts: string[] = [];
  if (suggestedBrightness > 15) parts.push(`aumentar brilho (+${suggestedBrightness})`);
  else if (suggestedBrightness < -10) parts.push(`reduzir brilho (${suggestedBrightness})`);

  if (suggestedContrast > 10) parts.push(`aumentar contraste (+${suggestedContrast})`);
  else if (suggestedContrast < -5) parts.push(`suavizar contraste (${suggestedContrast})`);

  parts.push(`nitidez (+${suggestedSharpness})`);

  const description = parts.length > 0
    ? `Sugestão para térmica: ${parts.join(', ')} para máxima nitidez.`
    : 'A imagem está com excelente equilíbrio para a térmica!';

  return {
    avgLuminance: Math.round(avgLum),
    contrastDev: Math.round(stdDev),
    suggestedBrightness,
    suggestedContrast,
    suggestedSharpness,
    tags,
    description
  };
}

/**
 * Aplica máscara de nitidez (Unsharp Mask)
 */
export function applyUnsharpMask(data: Uint8ClampedArray, width: number, height: number, amount: number): Uint8ClampedArray {
  if (amount <= 0) return data;
  const strength = (amount / 100) * 0.65;
  const blurred = new Float32Array(width * height);
  const gray = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    gray[i] = data[i * 4];
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += gray[(y + dy) * width + (x + dx)];
        }
      }
      blurred[y * width + x] = sum / 9;
    }
  }

  const result = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const g = gray[y * width + x];
      const b = blurred[y * width + x];
      const sharp = Math.min(255, Math.max(0, g + strength * (g - b)));
      result[idx] = result[idx + 1] = result[idx + 2] = sharp;
    }
  }
  return result;
}

/**
 * Matriz de Bayer 4x4 para Ordered Dithering
 */
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

/**
 * Aplica Dithering Atkinson (famoso pelo Mac clássico - pontos limpos e nítidos em impressoras térmicas)
 * Distribui 1/8 do erro para 6 vizinhos:
 * (x+1, y), (x+2, y), (x-1, y+1), (x, y+1), (x+1, y+1), (x, y+2)
 */
export function applyAtkinsonDither(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data);
  const buffer = new Float32Array(width * height);

  // Copia luminância
  for (let i = 0; i < width * height; i++) {
    buffer[i] = data[i * 4];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = buffer[idx];
      const newVal = oldVal > 128 ? 255 : 0;
      const err = (oldVal - newVal) / 8;

      const outIdx = idx * 4;
      output[outIdx] = newVal;
      output[outIdx + 1] = newVal;
      output[outIdx + 2] = newVal;
      output[outIdx + 3] = 255;

      // Distribuição Atkinson
      if (x + 1 < width) buffer[y * width + (x + 1)] += err;
      if (x + 2 < width) buffer[y * width + (x + 2)] += err;
      if (y + 1 < height) {
        if (x > 0) buffer[(y + 1) * width + (x - 1)] += err;
        buffer[(y + 1) * width + x] += err;
        if (x + 1 < width) buffer[(y + 1) * width + (x + 1)] += err;
      }
      if (y + 2 < height) {
        buffer[(y + 2) * width + x] += err;
      }
    }
  }

  return output;
}

/**
 * Aplica Dithering Floyd-Steinberg padrão (7/16, 3/16, 5/16, 1/16)
 */
export function applyFloydSteinbergDither(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data);
  const buffer = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    buffer[i] = data[i * 4];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = buffer[idx];
      const newVal = oldVal > 128 ? 255 : 0;
      const err = oldVal - newVal;

      const outIdx = idx * 4;
      output[outIdx] = newVal;
      output[outIdx + 1] = newVal;
      output[outIdx + 2] = newVal;
      output[outIdx + 3] = 255;

      if (x + 1 < width) buffer[y * width + (x + 1)] += err * (7 / 16);
      if (y + 1 < height) {
        const nextRow = (y + 1) * width;
        if (x > 0) buffer[nextRow + (x - 1)] += err * (3 / 16);
        buffer[nextRow + x] += err * (5 / 16);
        if (x + 1 < width) buffer[nextRow + (x + 1)] += err * (1 / 16);
      }
    }
  }

  return output;
}

/**
 * Aplica Threshold puro (Preto e Branco puro, ideal para arte em linhas, desenhos e textos)
 */
export function applyThreshold(data: Uint8ClampedArray, width: number, height: number, thresholdVal: number = 128): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const lum = data[idx];
    const val = lum >= thresholdVal ? 255 : 0;
    output[idx] = val;
    output[idx + 1] = val;
    output[idx + 2] = val;
    output[idx + 3] = 255;
  }
  return output;
}

/**
 * Aplica Dithering Ordenado (Bayer 4x4)
 */
export function applyBayerDither(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const lum = data[idx];
      const m = (BAYER_4X4[y % 4][x % 4] + 0.5) * (255 / 16);
      const val = lum > m ? 255 : 0;
      output[idx] = val;
      output[idx + 1] = val;
      output[idx + 2] = val;
      output[idx + 3] = 255;
    }
  }
  return output;
}

/**
 * Pipeline principal de processamento de imagem para canvas térmico (384px)
 */
export function processCanvasToMonochrome(
  sourceCanvas: HTMLCanvasElement,
  options: ImageProcessingOptions
): HTMLCanvasElement {
  const W = 384;
  const ratio = W / sourceCanvas.width;
  const H = Math.round(sourceCanvas.height * ratio);

  const workCanvas = document.createElement('canvas');
  workCanvas.width = W;
  workCanvas.height = H;
  const ctx = workCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  // Fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(sourceCanvas, 0, 0, W, H);

  const imgData = ctx.getImageData(0, 0, W, H);
  const d = imgData.data;

  // 1. Ajuste de Brilho e Contraste
  const bVal = options.brightness;
  const cVal = options.contrast;
  const contrastFactor = (259 * (cVal + 255)) / (255 * (259 - cVal));

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] + bVal;
    let g = d[i + 1] + bVal;
    let b = d[i + 2] + bVal;

    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = Math.min(255, Math.max(0, gray));

    d[i] = gray;
    d[i + 1] = gray;
    d[i + 2] = gray;
    d[i + 3] = 255;
  }

  // 2. Máscara de Nitidez
  let processedData: Uint8ClampedArray = d;
  if (options.sharpness > 0) {
    processedData = applyUnsharpMask(d, W, H, options.sharpness);
  }

  // 3. Dithering Monocromático 1-bit
  let finalData: Uint8ClampedArray;
  switch (options.ditherMode) {
    case 'atkinson':
      finalData = applyAtkinsonDither(processedData, W, H);
      break;
    case 'floyd-steinberg':
      finalData = applyFloydSteinbergDither(processedData, W, H);
      break;
    case 'bayer':
      finalData = applyBayerDither(processedData, W, H);
      break;
    case 'threshold':
    default:
      finalData = applyThreshold(processedData, W, H, options.thresholdVal || 128);
      break;
  }

  const finalImgData = ctx.createImageData(W, H);
  finalImgData.data.set(finalData);
  ctx.putImageData(finalImgData, 0, 0);

  return workCanvas;
}
