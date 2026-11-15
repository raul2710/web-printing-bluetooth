import React from 'react';
import { usePrinter } from '../bluetooth/PrinterContext';
import { Download, ArrowDownCircle, XCircle, CheckCircle2, Printer } from 'lucide-react';

interface ReceiptPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  height: number;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ canvasRef, height }) => {
  const { isConnected, isPrinting, printProgress, statusMessage, printCanvas, feedPaper, cancelPrint, paperWidth } = usePrinter();

  const handlePrint = async () => {
    if (!canvasRef.current) return;
    await printCanvas(canvasRef.current);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `miniprint-recibo-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const estimatedMm = Math.round(height / 8);

  return (
    <div className="flex flex-col items-center w-full max-w-[420px] mx-auto">
      {/* Cabeçalho da Etapa 3 */}
      <div className="w-full flex items-center justify-between text-xs mb-3 px-1">
        <span className="text-xs font-bold tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 text-white flex items-center justify-center text-[10px] font-mono shadow-sm shadow-rose-300">
            3
          </span>
          <span>Bobina de Impressão</span>
        </span>
        <span className="font-mono text-[11px] bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5">
          <span>{paperWidth}</span>
          <span>•</span>
          <span>384 × {height}px (~{estimatedMm} mm)</span>
        </span>
      </div>

      {/* Recibo com textura e corte serrilhado em zigue-zague */}
      <div className="relative w-full flex flex-col items-center drop-shadow-md">
        {/* Serrilhado Superior */}
        <div className="w-[384px] max-w-full h-3 overflow-hidden text-[#faf8f0]">
          <svg className="w-full h-full fill-current" preserveAspectRatio="none" viewBox="0 0 384 12">
            <path d="M0,12 L12,0 L24,12 L36,0 L48,12 L60,0 L72,12 L84,0 L96,12 L108,0 L120,12 L132,0 L144,12 L156,0 L168,12 L180,0 L192,12 L204,0 L216,12 L228,0 L240,12 L252,0 L264,12 L276,0 L288,12 L300,0 L312,12 L324,0 L336,12 L348,0 L360,12 L372,0 L384,12 Z" />
          </svg>
        </div>

        {/* Papel Térmico */}
        <div className="w-[384px] max-w-full bg-[#faf8f0] text-[#111111] p-3 shadow-receipt relative flex flex-col items-center min-h-[180px] transition-all">
          <div className="w-full flex justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block select-none rounded-[2px]"
              style={{
                imageRendering: 'pixelated',
                maxWidth: '384px'
              }}
            />
          </div>

          {/* Overlay durante a impressão com cores alegres */}
          {isPrinting && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-slate-800 text-center rounded-2xl animate-in fade-in duration-200">
              <span className="text-4xl animate-bounce mb-2">🖨️</span>
              <div className="text-base font-black mb-0.5 text-slate-800">Imprimindo no Bluetooth...</div>
              <div className="text-xs text-slate-500 mb-3">{statusMessage}</div>

              {/* Barra de Progresso com Gradiente Colorido */}
              <div className="w-full max-w-[220px] bg-slate-100 rounded-full h-3 mb-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 h-full transition-all duration-200 rounded-full shadow-sm"
                  style={{ width: `${printProgress}%` }}
                ></div>
              </div>
              <div className="text-xs font-mono font-bold text-rose-600 mb-4">{printProgress}%</div>

              <button
                onClick={cancelPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar Impressão</span>
              </button>
            </div>
          )}
        </div>

        {/* Serrilhado Inferior */}
        <div className="w-[384px] max-w-full h-3 overflow-hidden text-[#faf8f0]">
          <svg className="w-full h-full fill-current" preserveAspectRatio="none" viewBox="0 0 384 12">
            <path d="M0,0 L12,12 L24,0 L36,12 L48,0 L60,12 L72,0 L84,12 L96,0 L108,12 L120,0 L132,12 L144,0 L156,12 L168,0 L180,12 L192,0 L204,12 L216,0 L228,12 L240,0 L252,12 L264,0 L276,12 L288,0 L300,12 L312,0 L324,12 L336,0 L348,12 L360,0 L372,12 L384,0 Z" />
          </svg>
        </div>
      </div>

      {/* Botões de Ação com Cores Vivas */}
      <div className="w-[384px] max-w-full mt-4 space-y-2.5">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-lg shadow-rose-500/25 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-[0.98] text-white disabled:opacity-50"
        >
          <Printer className="w-5 h-5 text-amber-200" />
          <span>{isConnected ? 'Imprimir na Mini Impressora' : 'Conectar e Imprimir'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => feedPaper(50)}
            disabled={isPrinting}
            className="py-2.5 px-3 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-200 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <ArrowDownCircle className="w-4 h-4 text-amber-600" />
            <span>Avançar Papel</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl bg-sky-50/90 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-sky-200 shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Salvar PNG</span>
          </button>
        </div>

        {/* Dica */}
        <p className="text-center text-[11px] text-slate-500 font-medium pt-1">
          {isConnected ? (
            <span className="text-emerald-600 flex items-center justify-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Impressora conectada e pronta para imprimir!
            </span>
          ) : (
            <span>Ligue a impressora no botão físico para conectar ✨</span>
          )}
        </p>
      </div>
    </div>
  );
};
