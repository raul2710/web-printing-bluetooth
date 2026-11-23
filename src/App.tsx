import { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ReceiptPreview } from './components/ReceiptPreview';
import { FotoTool } from './tools/FotoTool';
import { SudokuTool } from './tools/SudokuTool';
import { OraculoTool } from './tools/OraculoTool';
import { NotasTool } from './tools/NotasTool';
import { CanvasDesignerTool } from './tools/CanvasDesignerTool';
import { BingoTool } from './tools/BingoTool';
import { PassatemposTool } from './tools/PassatemposTool';
import {
  Camera,
  Grid,
  Sparkles,
  FileText,
  Palette,
  LayoutGrid,
  Dices,
  ChevronRight,
  Printer,
  Heart,
  Sliders,
  Eye
} from 'lucide-react';
import { usePrinter } from './bluetooth/PrinterContext';

type ToolType = 'foto' | 'oraculo' | 'sudoku' | 'notas' | 'designer' | 'bingo' | 'passatempos';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [canvasHeight, setCanvasHeight] = useState<number>(384);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isConnected, isPrinting, printCanvas } = usePrinter();

  const toolList = [
    {
      id: 'foto' as const,
      title: 'Fotos & Dithering',
      subtitle: 'Ajuste de contraste, Atkinson e moldura Polaroid',
      icon: Camera,
      tag: 'Fotos',
      gradient: 'from-rose-500 to-pink-500',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
      shadow: 'shadow-rose-300',
      hoverBorder: 'hover:border-rose-300',
      badge: 'Atkinson & Polaroid'
    },
    {
      id: 'oraculo' as const,
      title: 'Bilhete Secreto & Sorte',
      subtitle: 'Mensagem oculta: só revela ao imprimir no papel!',
      icon: Sparkles,
      tag: 'Segredo',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      shadow: 'shadow-orange-300',
      hoverBorder: 'hover:border-amber-300',
      badge: 'Surpresa Oculta'
    },
    {
      id: 'sudoku' as const,
      title: 'Sudoku 9x9',
      subtitle: 'Gera tabuleiros para imprimir e exercitar a mente',
      icon: Grid,
      tag: 'Sudoku',
      gradient: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-600 border-blue-200',
      shadow: 'shadow-blue-300',
      hoverBorder: 'hover:border-blue-300',
      badge: 'Fácil, Médio e Difícil'
    },
    {
      id: 'designer' as const,
      title: 'Canvas Livre & Designer',
      subtitle: 'Arraste e posicione textos, títulos e QR codes onde quiser',
      icon: LayoutGrid,
      tag: 'Designer',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      shadow: 'shadow-indigo-300',
      hoverBorder: 'hover:border-indigo-300',
      badge: '55mm & 58mm Livre'
    },
    {
      id: 'notas' as const,
      title: 'Notas Rápidas & QR',
      subtitle: 'Listas, lembretes, etiquetas e links dinâmicos',
      icon: FileText,
      tag: 'Notas',
      gradient: 'from-emerald-400 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      shadow: 'shadow-emerald-300',
      hoverBorder: 'hover:border-emerald-300',
      badge: 'QR Code Local'
    },
    {
      id: 'bingo' as const,
      title: 'Bingo em Família',
      subtitle: 'Sorteador de bolas e cartelas B-I-N-G-O até 90 bolas',
      icon: Dices,
      tag: 'Bingo',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      shadow: 'shadow-teal-300',
      hoverBorder: 'hover:border-teal-300',
      badge: '1 a 90 Bolas'
    },
    {
      id: 'passatempos' as const,
      title: 'Passatempos & Cores',
      subtitle: 'Caça-palavras temático e mandalas para colorir',
      icon: Palette,
      tag: 'Jogos',
      gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      shadow: 'shadow-purple-300',
      hoverBorder: 'hover:border-purple-300',
      badge: 'Colorir e Jogar'
    }
  ];

  const handleQuickPrint = async () => {
    if (!canvasRef.current) return;
    await printCanvas(canvasRef.current);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Header Sticky Minimalista e Colorido */}
      <Navbar
        activeTool={activeTool}
        onBackToMenu={() => setActiveTool(null)}
        toolTitle={activeTool ? toolList.find((t) => t.id === activeTool)?.title : undefined}
      />

      {/* Container Principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 sm:py-7">
        {!activeTool ? (
          /* ========================================================== */
          /* HOME: CARDS COLORIDOS E VIBRANTES                         */
          /* ========================================================== */
          <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
            {/* Banner Acolhedor com Gradiente Suave */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-100/90 via-amber-100/80 to-sky-100/90 border border-white/80 shadow-card text-center space-y-2 relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-rose-200/60 text-xs font-bold text-rose-600 mb-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Mini Impressora Térmica 58mm · 384px</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                Estúdio Criativo de Impressão
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
                Conecte sua impressora mágica e imprima fotos, bilhetes secretos, jogos e notas instantâneas!
              </p>
            </div>

            {/* Grid de Ferramentas com Ícones Coloridos */}
            <div className="space-y-3">
              {toolList.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/70 shadow-card card-interactive cursor-pointer flex items-center justify-between gap-4 group ${tool.hoverBorder} transition-all`}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* Ícone com Gradiente e Sombra Colorida */}
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.gradient} text-white flex items-center justify-center shadow-md ${tool.shadow} flex-shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-slate-800 group-hover:text-rose-600 transition-colors">
                            {tool.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeBg}`}
                          >
                            {tool.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                          {tool.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:translate-x-1 transition-all flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé Acolhedor */}
            <div className="pt-4 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <span>Feito com carinho</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                <span>para qualquer mini impressora térmica Bluetooth</span>
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* TELA DA FERRAMENTA: SPLIT VIEW COM ABAS COLORIDAS          */
          /* ========================================================== */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Seletor Rápido de Abas no Topo do Estúdio */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-rose-100">
              {toolList.map((tool) => {
                const Icon = tool.icon;
                const isCurrent = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                      isCurrent
                        ? `bg-gradient-to-r ${tool.gradient} text-white shadow-md ${tool.shadow}`
                        : 'bg-white/90 border border-slate-200/80 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tool.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Alternador Mobile (Apenas em telas pequenas) */}
            <div className="lg:hidden flex items-center bg-white/90 p-1 rounded-2xl border border-rose-100 text-xs font-bold shadow-card">
              <button
                onClick={() => setMobileTab('editor')}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  mobileTab === 'editor'
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1 & 2 · Ajustes</span>
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  mobileTab === 'preview'
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3 · Ver Bobina</span>
              </button>
            </div>

            {/* Layout Split-View Desktop (2 Colunas) / Empilhado no Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 lg:pb-6">
              {/* Coluna Esquerda: Ferramenta Ativa */}
              <div
                className={`lg:col-span-7 space-y-4 ${
                  mobileTab === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                {activeTool === 'foto' && (
                  <FotoTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'oraculo' && (
                  <OraculoTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'sudoku' && (
                  <SudokuTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'notas' && (
                  <NotasTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'designer' && (
                  <CanvasDesignerTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'bingo' && (
                  <BingoTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}
                {activeTool === 'passatempos' && (
                  <PassatemposTool canvasRef={canvasRef} setCanvasHeight={setCanvasHeight} />
                )}

                {/* Botão no rodapé do editor no mobile para ver a bobina */}
                <div className="lg:hidden pt-2">
                  <button
                    onClick={() => setMobileTab('preview')}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 font-extrabold text-xs flex items-center justify-between hover:bg-amber-100/70 transition shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span>Ver Bobina de Impressão (Preview)</span>
                    </span>
                    <span className="font-mono text-[10px] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
                      384px ➔
                    </span>
                  </button>
                </div>
              </div>

              {/* Coluna Direita: Prévia da Bobina Térmica */}
              <div
                className={`lg:col-span-5 ${
                  mobileTab === 'editor' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Botão para voltar a editar no mobile */}
                <div className="lg:hidden mb-3">
                  <button
                    onClick={() => setMobileTab('editor')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>← Voltar e Continuar Editando</span>
                  </button>
                </div>

                <div className="sticky top-16 p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-rose-100/90 shadow-card">
                  <ReceiptPreview canvasRef={canvasRef} height={canvasHeight} />
                </div>
              </div>
            </div>

            {/* Botão de Ação Rápida Flutuante Colorido para Celular */}
            <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto lg:hidden z-20">
              <button
                onClick={handleQuickPrint}
                disabled={isPrinting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Printer className="w-5 h-5" />
                <span>{isConnected ? 'Imprimir na Impressora' : 'Conectar e Imprimir'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
