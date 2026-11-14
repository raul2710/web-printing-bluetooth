import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  RotateCw,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import {
  DitherMode,
  processCanvasToMonochrome,
  analyzeThermalImage,
  ImageAnalysisResult
} from '../utils/dither';

interface FotoToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

export const FotoTool: React.FC<FotoToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [ditherMode, setDitherMode] = useState<DitherMode>('atkinson');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [sharpness, setSharpness] = useState<number>(30);
  const [thresholdVal, setThresholdVal] = useState<number>(128);
  const [isPolaroid, setIsPolaroid] = useState<boolean>(false);
  const [polaroidCaption, setPolaroidCaption] = useState<string>('');
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const renderImage = useCallback(() => {
    if (!rawImageRef.current || !canvasRef.current) return;
    const img = rawImageRef.current;
    const W = 384;

    const tempCanvas = document.createElement('canvas');
    const isRotated = rotation % 180 !== 0;
    const sourceW = isRotated ? img.naturalHeight : img.naturalWidth;
    const sourceH = isRotated ? img.naturalWidth : img.naturalHeight;

    if (isPolaroid) {
      const fotoSize = 328;
      const marginX = (W - fotoSize) / 2;
      const marginTop = 28;
      const marginBottom = polaroidCaption ? 80 : 60;
      const totalH = marginTop + fotoSize + marginBottom;

      tempCanvas.width = W;
      tempCanvas.height = totalH;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, totalH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(marginX, marginTop, fotoSize, fotoSize);
      ctx.clip();

      ctx.translate(marginX + fotoSize / 2, marginTop + fotoSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(
        img,
        (img.naturalWidth - minDim) / 2,
        (img.naturalHeight - minDim) / 2,
        minDim,
        minDim,
        -fotoSize / 2,
        -fotoSize / 2,
        fotoSize,
        fotoSize
      );
      ctx.restore();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(marginX, marginTop, fotoSize, fotoSize);

      if (polaroidCaption.trim()) {
        ctx.setLineDash([]);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(polaroidCaption.toUpperCase(), W / 2, marginTop + fotoSize + 42);
      }
    } else {
      const scale = W / sourceW;
      const H = Math.round(sourceH * scale);

      tempCanvas.width = W;
      tempCanvas.height = H;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (isRotated) {
        ctx.drawImage(img, -H / 2, -W / 2, H, W);
      } else {
        ctx.drawImage(img, -W / 2, -H / 2, W, H);
      }
      ctx.restore();
    }

    const processedCanvas = processCanvasToMonochrome(tempCanvas, {
      brightness,
      contrast,
      sharpness,
      thresholdVal,
      ditherMode
    });

    const target = canvasRef.current;
    target.width = processedCanvas.width;
    target.height = processedCanvas.height;
    setCanvasHeight(processedCanvas.height);

    const targetCtx = target.getContext('2d');
    if (targetCtx) {
      targetCtx.drawImage(processedCanvas, 0, 0);
    }
  }, [
    canvasRef,
    setCanvasHeight,
    rotation,
    ditherMode,
    brightness,
    contrast,
    sharpness,
    thresholdVal,
    isPolaroid,
    polaroidCaption
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        rawImageRef.current = img;
        setImageSrc(src);

        const testCanvas = document.createElement('canvas');
        testCanvas.width = 384;
        testCanvas.height = Math.round((img.naturalHeight / img.naturalWidth) * 384) || 384;
        const ctx = testCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
          const res = analyzeThermalImage(testCanvas);
          setAnalysis(res);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (imageSrc) {
      renderImage();
    }
  }, [imageSrc, renderImage]);

  const applyAutoSuggestion = () => {
    if (!analysis) return;
    setBrightness(analysis.suggestedBrightness);
    setContrast(analysis.suggestedContrast);
    setSharpness(analysis.suggestedSharpness);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Não foi possível acessar a câmera: ' + err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const c = document.createElement('canvas');
    c.width = video.videoWidth || 640;
    c.height = video.videoHeight || 480;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = c.toDataURL('image/jpeg');
    const img = new Image();
    img.onload = () => {
      rawImageRef.current = img;
      setImageSrc(dataUrl);
      stopCamera();
    };
    img.src = dataUrl;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="space-y-4">
      {/* 1 · Escolha da Foto */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-rose-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm shadow-rose-300">
              1
            </span>
            <span>Imagem de Entrada</span>
          </span>
          <span className="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-semibold">PNG, JPG, WebP</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-black transition active:scale-95 shadow-sm"
          >
            <Upload className="w-5 h-5 text-rose-500" />
            <span>Escolher Arquivo</span>
          </button>

          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-black transition active:scale-95 shadow-sm"
            >
              <Camera className="w-5 h-5 text-emerald-500" />
              <span>Usar Câmera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-700 text-xs font-black transition active:scale-95"
            >
              <span>Fechar Câmera</span>
            </button>
          )}
        </div>

        {/* Visor da Câmera */}
        {isCameraActive && (
          <div className="relative rounded-2xl overflow-hidden bg-black p-2 flex flex-col items-center shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[240px] object-cover rounded-xl"
            />
            <button
              onClick={capturePhoto}
              className="mt-3 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Tirar Foto Agora</span>
            </button>
          </div>
        )}
      </div>

      {/* 2 · Ajustes & Dithering */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-rose-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Ajustes & Dithering</span>
          </span>
          {analysis && (
            <button
              onClick={applyAutoSuggestion}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto Ajuste</span>
            </button>
          )}
        </div>

        {/* Seletor Segmentado de Dithering */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-700">Algoritmo Monocromático</label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(
              [
                { id: 'atkinson', label: 'Atkinson', desc: 'Nítido / Mac' },
                { id: 'floyd-steinberg', label: 'Floyd-St.', desc: 'Suave' },
                { id: 'threshold', label: 'Threshold', desc: 'Linhas / P&B' }
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setDitherMode(mode.id)}
                className={`py-2 px-2 rounded-xl border text-center transition font-extrabold active:scale-95 ${
                  ditherMode === mode.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 border-rose-500 text-white shadow-sm shadow-rose-300'
                    : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>{mode.label}</div>
                <div className="text-[10px] font-normal opacity-85">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rotação e Moldura */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-800 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5 text-sky-600" />
            <span>Girar ({rotation}°)</span>
          </button>

          <button
            onClick={() => setIsPolaroid((p) => !p)}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
              isPolaroid
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-amber-200'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Polaroid {isPolaroid ? '✓' : ''}</span>
          </button>
        </div>

        {isPolaroid && (
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Legenda da Polaroid (ex: FAMÍLIA 2026 ❤️)"
              value={polaroidCaption}
              onChange={(e) => setPolaroidCaption(e.target.value)}
              maxLength={26}
              className="w-full bg-[#faf9f6] border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 font-bold"
            />
          </div>
        )}

        {/* Sliders de Exposição Coloridos */}
        <div className="space-y-3 pt-2 border-t border-rose-100">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-700 font-extrabold">
              <span>Brilho</span>
              <span className="font-mono text-rose-600 font-bold">{brightness > 0 ? `+${brightness}` : brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-700 font-extrabold">
              <span>Contraste</span>
              <span className="font-mono text-orange-600 font-bold">{contrast > 0 ? `+${contrast}` : contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-700 font-extrabold">
              <span>Nitidez Térmica</span>
              <span className="font-mono text-sky-600 font-bold">+{sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sharpness}
              onChange={(e) => setSharpness(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Limiar Threshold se ativo */}
          {ditherMode === 'threshold' && (
            <div className="space-y-1 pt-1 border-t border-[#eae8e1]">
              <div className="flex justify-between text-xs text-ink-700 font-bold">
                <span>Limiar P&B (Threshold)</span>
                <span className="font-mono text-ink-900">{thresholdVal}</span>
              </div>
              <input
                type="range"
                min="20"
                max="230"
                value={thresholdVal}
                onChange={(e) => setThresholdVal(parseInt(e.target.value))}
                className="w-full accent-terracotta-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
