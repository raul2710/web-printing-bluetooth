import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Type
} from 'lucide-react';

interface NotasToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type TextAlignment = 'left' | 'center' | 'right';

export const NotasTool: React.FC<NotasToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const [noteTitle, setNoteTitle] = useState<string>('LISTA DO DIA');
  const [noteContent, setNoteContent] = useState<string>(
    '[ ] Comprar frutas e pão\n[ ] Regar as plantinhas\n[x] Brincar com as crianças\n[ ] Ligar a mini impressora'
  );
  const [fontSize, setFontSize] = useState<number>(18);
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<'sans' | 'mono' | 'bebas'>('sans');
  const [showDivider, setShowDivider] = useState<boolean>(true);

  // QR Code
  const [includeQr, setIncludeQr] = useState<boolean>(true);
  const [qrText, setQrText] = useState<string>('https://miniprint.com.br');
  const [qrLabel, setQrLabel] = useState<string>('Acesse com a câmera:');
  const [qrSize] = useState<number>(200);

  const renderNoteToCanvas = useCallback(async (isCancelled?: () => boolean) => {
    if (!canvasRef.current) return;
    const W = 384;

    const fontPx = fontSize;
    const lineSpacing = Math.round(fontPx * 1.4);

    const fontFace =
      fontFamily === 'mono'
        ? '"JetBrains Mono", monospace'
        : fontFamily === 'bebas'
        ? '"Bebas Neue", sans-serif'
        : 'Nunito, sans-serif';

    const fullFontStyle = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : 'normal '}${fontPx}px ${fontFace}`;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.font = fullFontStyle;
    const maxTextW = W - 40;

    const rawParagraphs = noteContent.split('\n');
    const wrappedLines: string[] = [];

    for (const paragraph of rawParagraphs) {
      if (paragraph.trim() === '') {
        wrappedLines.push('');
        continue;
      }
      const words = paragraph.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (tempCtx.measureText(testLine).width > maxTextW && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    }

    let totalH = 40;
    if (noteTitle.trim()) totalH += 48;
    if (showDivider) totalH += 18;

    totalH += wrappedLines.length * lineSpacing + 20;

    if (includeQr && qrText.trim()) {
      totalH += qrSize + (qrLabel.trim() ? 32 : 10) + 30;
    }

    totalH += 30;

    tempCanvas.height = Math.round(totalH);

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, W, totalH);

    tempCtx.fillStyle = '#000000';
    tempCtx.strokeStyle = '#000000';

    let currentY = 32;

    if (noteTitle.trim()) {
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'top';
      tempCtx.font = 'bold 30px "Bebas Neue", sans-serif';
      tempCtx.fillText(noteTitle.toUpperCase(), W / 2, currentY);
      currentY += 36;
    }

    if (showDivider) {
      tempCtx.lineWidth = 1;
      tempCtx.setLineDash([4, 3]);
      tempCtx.beginPath();
      tempCtx.moveTo(20, currentY);
      tempCtx.lineTo(W - 20, currentY);
      tempCtx.stroke();
      tempCtx.setLineDash([]);
      currentY += 14;
    }

    tempCtx.font = fullFontStyle;
    tempCtx.textBaseline = 'top';

    for (const line of wrappedLines) {
      if (line === '') {
        currentY += lineSpacing * 0.7;
        continue;
      }

      if (alignment === 'center') {
        tempCtx.textAlign = 'center';
        tempCtx.fillText(line, W / 2, currentY);
      } else if (alignment === 'right') {
        tempCtx.textAlign = 'right';
        tempCtx.fillText(line, W - 20, currentY);
      } else {
        tempCtx.textAlign = 'left';
        tempCtx.fillText(line, 20, currentY);
      }

      currentY += lineSpacing;
    }

    if (includeQr && qrText.trim()) {
      currentY += 14;

      if (qrLabel.trim()) {
        tempCtx.textAlign = 'center';
        tempCtx.font = 'bold 12px Nunito, sans-serif';
        tempCtx.fillText(qrLabel, W / 2, currentY);
        currentY += 20;
      }

      try {
        const qrDataUrl = await QRCode.toDataURL(qrText, {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });

        if (isCancelled && isCancelled()) return;

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const qrX = (W - qrSize) / 2;
            tempCtx.drawImage(img, qrX, currentY, qrSize, qrSize);
            currentY += qrSize + 10;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = qrDataUrl;
        });
      } catch (err) {
        console.warn('Erro ao gerar QR code:', err);
      }
    }

    if (isCancelled && isCancelled()) return;

    tempCtx.setLineDash([3, 3]);
    tempCtx.beginPath();
    tempCtx.moveTo(20, totalH - 16);
    tempCtx.lineTo(W - 20, totalH - 16);
    tempCtx.stroke();
    tempCtx.setLineDash([]);

    const target = canvasRef.current;
    if (!target) return;
    if (target.width !== W) target.width = W;
    if (target.height !== Math.round(totalH)) target.height = Math.round(totalH);

    const targetCtx = target.getContext('2d');
    if (targetCtx) {
      targetCtx.clearRect(0, 0, W, Math.round(totalH));
      targetCtx.drawImage(tempCanvas, 0, 0);
    }

    setCanvasHeight(Math.round(totalH));
  }, [
    canvasRef,
    setCanvasHeight,
    noteTitle,
    noteContent,
    fontSize,
    alignment,
    isBold,
    isItalic,
    fontFamily,
    showDivider,
    includeQr,
    qrText,
    qrLabel,
    qrSize
  ]);

  useEffect(() => {
    let isCancelled = false;
    renderNoteToCanvas(() => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [renderNoteToCanvas]);

  return (
    <div className="space-y-4">
      {/* 1 · Conteúdo do Texto */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              1
            </span>
            <span>Texto & Título</span>
          </span>
        </div>

        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="Título da Etiqueta (ex: LISTA DE COMPRAS)"
          className="w-full bg-[#faf9f6] border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-extrabold"
        />

        <textarea
          rows={4}
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Escreva sua lista ou texto..."
          className="w-full bg-[#faf9f6] border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
        />
      </div>

      {/* 2 · Formatação & Estilos */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-teal-100 shadow-card space-y-3">
        <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
            2
          </span>
          <span>Tipografia & Alinhamento</span>
        </span>

        {/* Slider de Tamanho da Fonte (10px até 26px) */}
        <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tamanho da Fonte</span>
            </span>
            <span className="font-mono text-xs font-black bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              {fontSize}px
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-emerald-700 font-mono">10</span>
            <input
              type="range"
              min={10}
              max={26}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-emerald-200/90 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <span className="text-[10px] font-bold text-emerald-700 font-mono">26</span>
          </div>
        </div>

        {/* Família da Fonte */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-600">Estilo da Letra:</span>
          <div className="flex items-center gap-1 bg-teal-50/70 p-1 rounded-xl border border-teal-200 text-xs">
            {(
              [
                { id: 'sans', label: 'Amigável' },
                { id: 'mono', label: 'Mono' },
                { id: 'bebas', label: 'Poster' }
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                  fontFamily === f.id ? 'bg-teal-600 text-white shadow-sm' : 'text-teal-800 hover:text-teal-950'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alinhamento e Estilos */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setAlignment('left')}
              className={`p-1.5 rounded-lg transition active:scale-95 ${alignment === 'left' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlignment('center')}
              className={`p-1.5 rounded-lg transition active:scale-95 ${alignment === 'center' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlignment('right')}
              className={`p-1.5 rounded-lg transition active:scale-95 ${alignment === 'right' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-50/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsBold((b) => !b)}
              className={`p-1.5 rounded-lg transition active:scale-95 ${isBold ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsItalic((i) => !i)}
              className={`p-1.5 rounded-lg transition active:scale-95 ${isItalic ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDivider((d) => !d)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${showDivider ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
            >
              Linha {showDivider ? '✓' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* 3 · QR Code Opcional */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Adicionar QR Code</span>
          </label>
          <input
            type="checkbox"
            checked={includeQr}
            onChange={(e) => setIncludeQr(e.target.checked)}
            className="w-5 h-5 accent-emerald-600 cursor-pointer rounded-md"
          />
        </div>

        {includeQr && (
          <div className="space-y-2 text-xs pt-1">
            <input
              type="text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="Link, chave Pix ou texto..."
              className="w-full bg-[#faf9f6] border border-emerald-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <input
              type="text"
              value={qrLabel}
              onChange={(e) => setQrLabel(e.target.value)}
              placeholder="Legenda abaixo do QR (ex: Escaneie aqui)"
              className="w-full bg-[#faf9f6] border border-emerald-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
