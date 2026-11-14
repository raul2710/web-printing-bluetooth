import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Dices,
  Feather,
  Moon,
  Cookie,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Printer
} from 'lucide-react';
import { PENSAMENTOS, HOROSCOPOS, CONSELHOS_BISCOITO, OracleItem } from '../data/oracleData';
import { usePrinter } from '../bluetooth/PrinterContext';

interface OraculoToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type OracleCategory = 'pensamento' | 'horoscopo' | 'conselho' | 'custom';

export const OraculoTool: React.FC<OraculoToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const { isPrinting, printCanvas } = usePrinter();

  const [category, setCategory] = useState<OracleCategory>('conselho');
  const [currentItem, setCurrentItem] = useState<OracleItem>(CONSELHOS_BISCOITO[0]);
  const [customText, setCustomText] = useState<string>('');
  const [customAuthor, setCustomAuthor] = useState<string>('Você');
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([7, 14, 21, 35, 42, 58]);

  // Modo Segredo: O usuário escolhe entre ver antes ou imprimir no escuro!
  const [isSecret, setIsSecret] = useState<boolean>(true);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [ticketCount, setTicketCount] = useState<number>(1);

  const drawNewCard = useCallback(() => {
    let pool: OracleItem[] = CONSELHOS_BISCOITO;
    if (category === 'pensamento') pool = PENSAMENTOS;
    if (category === 'horoscopo') pool = HOROSCOPOS;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    setCurrentItem(chosen);

    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 59) + 1);
    }
    setLuckyNumbers(Array.from(numbers).sort((a, b) => a - b));
    setIsRevealed(false);
    setTicketCount((c) => c + 1);
  }, [category]);

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  const renderOracleTicket = useCallback(
    (forceRealMessage: boolean = false) => {
      if (!canvasRef.current) return;
      const W = 384;

      const shouldHide = isSecret && !isRevealed && !forceRealMessage;

      const realText = category === 'custom' ? customText || 'Mensagem especial para você!' : currentItem.texto;
      const realAuthor = category === 'custom' ? customAuthor : currentItem.autor || 'Destino';

      const textToPrint = shouldHide
        ? '✦ ✦ ✦ BILHETE LACRADO ✦ ✦ ✦\n\nAs palavras do seu destino foram sorteadas em segredo!\n\nImprima para romper o lacre e descobrir sua sorte na bobina térmica.'
        : realText;

      const authorToPrint = shouldHide ? 'O Universo Secreto' : realAuthor;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = W;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.font = '600 18px Nunito, sans-serif';
      const words = textToPrint.split(' ');
      let linesCount = 1;
      let curLine = '';
      for (const w of words) {
        const test = curLine + w + ' ';
        if (tempCtx.measureText(test).width > W - 64 && curLine) {
          linesCount++;
          curLine = w + ' ';
        } else {
          curLine = test;
        }
      }

      const calculatedHeight = Math.max(380, 240 + linesCount * 28 + 100);
      const H = calculatedHeight;

      tempCanvas.height = H;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';

      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, W - 24, H - 24);

      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, W - 32, H - 32);

      const cornerSize = 8;
      const corners = [
        [16, 16],
        [W - 16, 16],
        [16, H - 16],
        [W - 16, H - 16]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
      });

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText(shouldHide ? '🔒 BILHETE SECRETO DO DESTINO 🔒' : '✦ ✦ ✦ BILHETE MÁGICO ✦ ✦ ✦', W / 2, 38);

      ctx.font = 'bold 30px "Bebas Neue", sans-serif';
      let title = 'BISCOITO DA SORTE';
      if (category === 'pensamento') title = 'PENSAMENTO DO DIA';
      if (category === 'horoscopo') title = 'HORÓSCOPO SINCERO';
      if (category === 'custom') title = 'MENSAGEM ESPECIAL';
      ctx.fillText(title, W / 2, 68);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(28, 88);
      ctx.lineTo(W - 28, 88);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'italic bold 44px Georgia, serif';
      ctx.fillText('“', W / 2, 116);

      ctx.font = shouldHide ? 'italic 16px Nunito, sans-serif' : '600 17px Nunito, sans-serif';
      ctx.textAlign = 'center';
      const textStartY = 145;
      const endY = wrapText(ctx, textToPrint, W / 2, textStartY, W - 64, 26);

      ctx.font = 'bold italic 13px Nunito, sans-serif';
      ctx.fillText(`— ${authorToPrint}`, W / 2, endY + 8);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(28, endY + 28);
      ctx.lineTo(W - 28, endY + 28);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText(shouldHide ? 'NÚMEROS DA SORTE (OCULTOS):' : 'NÚMEROS DA SORTE:', W / 2, endY + 46);

      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      const numsStr = shouldHide ? '?? • ?? • ?? • ?? • ?? • ??' : luckyNumbers.map((n) => String(n).padStart(2, '0')).join(' • ');
      ctx.fillText(numsStr, W / 2, endY + 66);

      const barcodeY = endY + 82;
      const barcodeWidth = 220;
      const barcodeStartX = (W - barcodeWidth) / 2;
      const barHeight = 18;

      const barPattern = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1];
      let curX = barcodeStartX;
      barPattern.forEach((w, idx) => {
        if (idx % 2 === 0) {
          ctx.fillRect(curX, barcodeY, w * 2.2, barHeight);
        }
        curX += w * 2.2 + 2;
      });

      const dateStr = new Date().toLocaleDateString('pt-BR');
      ctx.font = '10px Nunito, sans-serif';
      ctx.fillText(`Ticket #${ticketCount} • ${dateStr}`, W / 2, barcodeY + barHeight + 12);

      const target = canvasRef.current;
      if (!target) return;
      if (target.width !== W) target.width = W;
      if (target.height !== H) target.height = H;
      const targetCtx = target.getContext('2d');
      if (targetCtx) {
        targetCtx.clearRect(0, 0, W, H);
        targetCtx.drawImage(tempCanvas, 0, 0);
      }
      setCanvasHeight(H);
    },
    [canvasRef, setCanvasHeight, category, currentItem, customText, customAuthor, luckyNumbers, isSecret, isRevealed, ticketCount]
  );

  useEffect(() => {
    drawNewCard();
  }, [category, drawNewCard]);

  useEffect(() => {
    renderOracleTicket(false);
  }, [currentItem, customText, customAuthor, luckyNumbers, isSecret, isRevealed, renderOracleTicket]);

  const handlePrintSecret = async () => {
    renderOracleTicket(true);
    if (canvasRef.current) {
      await printCanvas(canvasRef.current);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1 · Escolha a Categoria com Botões Coloridos */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-amber-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              1
            </span>
            <span>Tipo de Bilhete</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            #{ticketCount} sorteado
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {(
            [
              { id: 'conselho', label: 'Biscoito', icon: Cookie, activeBg: 'bg-amber-500 text-white shadow-amber-300', inactiveColor: 'text-amber-600 bg-amber-50/70 border-amber-200' },
              { id: 'pensamento', label: 'Pensamento', icon: Feather, activeBg: 'bg-indigo-600 text-white shadow-indigo-300', inactiveColor: 'text-indigo-600 bg-indigo-50/70 border-indigo-200' },
              { id: 'horoscopo', label: 'Horóscopo', icon: Moon, activeBg: 'bg-rose-500 text-white shadow-rose-300', inactiveColor: 'text-rose-600 bg-rose-50/70 border-rose-200' },
              { id: 'custom', label: 'Próprio', icon: Edit3, activeBg: 'bg-emerald-600 text-white shadow-emerald-300', inactiveColor: 'text-emerald-700 bg-emerald-50/70 border-emerald-200' }
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = category === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={`py-3 px-3 rounded-2xl border text-center font-extrabold flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-sm ${
                  isSelected
                    ? `${item.activeBg} shadow-md`
                    : `${item.inactiveColor} hover:brightness-95`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 · O Modo Segredo / Carta Fechada (MISTÉRIO COLORIDO) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-orange-100 shadow-card space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Mensagem Secreta</span>
          </span>

          <button
            onClick={() => {
              setIsSecret((s) => !s);
              setIsRevealed(false);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition active:scale-95 ${
              isSecret
                ? 'bg-amber-100/80 border-amber-300 text-amber-800 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {isSecret ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isSecret ? 'Segredo Ativo' : 'Revelar Sempre'}</span>
          </button>
        </div>

        {/* Caixa de Exibição / Lacre da Mensagem com Gradiente Dourado */}
        <div className="relative rounded-2xl p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-rose-50/70 border border-amber-200/80 overflow-hidden text-center shadow-sm">
          {isSecret && !isRevealed ? (
            /* Visual Misterioso */
            <div className="space-y-3 py-2 animate-in fade-in duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-300 text-3xl">
                🔒
              </div>
              <div className="space-y-1">
                <div className="font-black text-base text-slate-800">
                  Mensagem Lacrada pelo Destino
                </div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                  As palavras foram sorteadas em segredo! Imprima para romper o lacre ou clique em espiar.
                </p>
              </div>

              {/* Botões do Segredo com Cores Vivas */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={handlePrintSecret}
                  disabled={isPrinting}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-rose-400/25 transition active:scale-95 disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 text-amber-200" />
                  <span>Imprimir no Escuro (Surpresa!)</span>
                </button>

                <button
                  onClick={() => setIsRevealed(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Espiar na Tela</span>
                </button>
              </div>
            </div>
          ) : (
            /* Visual Aberto */
            <div className="space-y-2 py-1 text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Mensagem Revelada:
                </span>
                {isSecret && (
                  <button
                    onClick={() => setIsRevealed(false)}
                    className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-[11px] font-bold bg-amber-100/80 px-2 py-0.5 rounded-full"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar</span>
                  </button>
                )}
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-800 italic leading-relaxed pt-1">
                "{category === 'custom' ? customText || '...' : currentItem.texto}"
              </p>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-amber-200/60">
                <span className="text-[11px] text-amber-800 font-mono font-bold bg-amber-100/60 px-2 py-0.5 rounded-full">
                  Números: {luckyNumbers.slice(0, 4).join(' • ')}...
                </span>
                <span className="text-rose-600 font-black text-xs">
                  — {category === 'custom' ? customAuthor : currentItem.autor}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Editor Personalizado */}
        {category === 'custom' && (
          <div className="space-y-2 pt-2 border-t border-orange-100">
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Digite sua mensagem personalizada de surpresa..."
              className="w-full bg-[#faf9f6] border border-orange-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
            <input
              type="text"
              value={customAuthor}
              onChange={(e) => setCustomAuthor(e.target.value)}
              placeholder="Assinatura (ex: Mamãe / Papai / Amigo Secreto)"
              className="w-full bg-[#faf9f6] border border-orange-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* Botão de Sortear Próximo */}
        <button
          onClick={drawNewCard}
          className="w-full py-3 px-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-900 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <Dices className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Sortear Novo Bilhete Mágico</span>
        </button>
      </div>
    </div>
  );
};
