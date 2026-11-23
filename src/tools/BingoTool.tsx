import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Printer, Dices, RotateCcw } from 'lucide-react';
import { usePrinter } from '../bluetooth/PrinterContext';

interface BingoToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

export type BingoMax = 20 | 30 | 50 | 75 | 90;

export const BingoTool: React.FC<BingoToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const { isConnected, isPrinting, printCanvas } = usePrinter();

  const [maxNumbers, setMaxNumbers] = useState<BingoMax>(90);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentDrawn, setCurrentDrawn] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Cartela atual
  const [cardSerial, setCardSerial] = useState<number>(() => Math.floor(1000 + Math.random() * 9000));
  const [cardNumbers, setCardNumbers] = useState<(number | 'LIVRE')[][]>([]);

  // Histórico de cartelas impressas nesta sessão para evitar repetição
  const printedCardsRef = useRef<number[][]>([]);

  // Determina a letra B-I-N-G-O para um número
  const getLetterForNumber = useCallback(
    (num: number, max: BingoMax): string => {
      if (max <= 20) return '';
      const range = max / 5;
      if (num <= range) return 'B';
      if (num <= range * 2) return 'I';
      if (num <= range * 3) return 'N';
      if (num <= range * 4) return 'G';
      return 'O';
    },
    []
  );

  // Gera números para a cartela autêntica estilo tradicional
  const generateCard = useCallback(
    (max: BingoMax): (number | 'LIVRE')[][] => {
      const serial = Math.floor(1000 + Math.random() * 9000);
      setCardSerial(serial);

      // Para max <= 20: Cartela 3x3 simples
      if (max <= 20) {
        const nums: number[] = [];
        while (nums.length < 9) {
          const r = Math.floor(Math.random() * max) + 1;
          if (!nums.includes(r)) nums.push(r);
        }
        nums.sort((a, b) => a - b);
        const grid: (number | 'LIVRE')[][] = [];
        for (let r = 0; r < 3; r++) {
          grid.push(nums.slice(r * 3, r * 3 + 3));
        }
        return grid;
      }

      // Para 30, 50, 75 e 90: Cartela clássica 5x5 com B-I-N-G-O e Centro Livre
      const rangeSize = max / 5;
      const columns: (number | 'LIVRE')[][] = [];

      for (let c = 0; c < 5; c++) {
        const colMin = Math.floor(c * rangeSize) + 1;
        const colMax = Math.floor((c + 1) * rangeSize);
        const colNumbers: number[] = [];

        while (colNumbers.length < 5) {
          const r = Math.floor(Math.random() * (colMax - colMin + 1)) + colMin;
          if (!colNumbers.includes(r)) {
            colNumbers.push(r);
          }
        }
        colNumbers.sort((a, b) => a - b);

        // Se for a coluna do meio (N - índice 2), a posição central (linha 2) é LIVRE!
        const finalCol: (number | 'LIVRE')[] = [...colNumbers];
        if (c === 2) {
          finalCol[2] = 'LIVRE';
        }
        columns.push(finalCol);
      }

      // Transpõe colunas para linhas (5x5)
      const grid: (number | 'LIVRE')[][] = [];
      for (let r = 0; r < 5; r++) {
        const row: (number | 'LIVRE')[] = [];
        for (let c = 0; c < 5; c++) {
          row.push(columns[c][r]);
        }
        grid.push(row);
      }

      return grid;
    },
    []
  );

  // Reinicia o sorteio e gera nova cartela
  const resetGame = useCallback(
    (max: BingoMax) => {
      const all: number[] = [];
      for (let i = 1; i <= max; i++) all.push(i);
      setAvailableNumbers(all);
      setDrawnNumbers([]);
      setCurrentDrawn(null);
      setIsSpinning(false);

      const newCard = generateCard(max);
      setCardNumbers(newCard);
    },
    [generateCard]
  );

  // Sorteia o próximo número com animação visual
  const drawNextNumber = useCallback(() => {
    if (availableNumbers.length === 0 || isSpinning) return;

    setIsSpinning(true);
    let counter = 0;
    const duration = 1500;
    const step = 60;

    const timer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      setCurrentDrawn(availableNumbers[randomIndex]);
      counter += step;

      if (counter >= duration) {
        clearInterval(timer);
        setIsSpinning(false);

        // Sorteio definitivo
        setAvailableNumbers((prev) => {
          if (prev.length === 0) return prev;
          const finalIndex = Math.floor(Math.random() * prev.length);
          const chosen = prev[finalIndex];
          const remaining = prev.filter((_, idx) => idx !== finalIndex);

          setCurrentDrawn(chosen);
          setDrawnNumbers((old) => [chosen, ...old]);
          return remaining;
        });
      }
    }, step);
  }, [availableNumbers, isSpinning]);

  // Inicializa o jogo ao mudar o maxNumbers
  useEffect(() => {
    resetGame(maxNumbers);
  }, [maxNumbers, resetGame]);

  // Renderiza a cartela clássica no canvas 384px (aproveitando ao máximo o papel, sem moldura, com linhas de corte)
  const renderBingoCardToCanvas = useCallback(() => {
    if (!canvasRef.current || cardNumbers.length === 0) return;
    const W = 384;
    const isSmall = maxNumbers <= 20;
    const H = isSmall ? 420 : 465;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Fundo térmico branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    // 1. Linha Superior de Corte (sem moldura externa nas laterais)
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(W - 4, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Marcações sutis de corte nos cantos
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✁', 6, 10);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, 10);

    // Cabeçalho da Cartela
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 30px "Bebas Neue", sans-serif';
    ctx.fillText('CARTELA DE BINGO', W / 2, 30);

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText(`1 a ${maxNumbers} Bolas • Série #${cardSerial}`, W / 2, 48);

    const gridSize = cardNumbers.length; // 3 ou 5
    // Aproveitamento máximo da largura do papel (380px úteis)
    const startX = 2;
    const gridW = 380;
    const cellW = gridW / gridSize;

    if (!isSmall) {
      // Cartela 5x5 com cabeçalho B - I - N - G - O ocupando a largura total
      const headerH = 38;
      const startY = 64;
      const cellH = 58;
      const bingoLetters = ['B', 'I', 'N', 'G', 'O'];

      // Faixa preta do cabeçalho com letras brancas B - I - N - G - O
      for (let c = 0; c < 5; c++) {
        const x = startX + c * cellW;
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, startY, cellW, headerH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, startY, cellW, headerH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Bebas Neue", sans-serif';
        ctx.fillText(bingoLetters[c], x + cellW / 2, startY + headerH / 2 + 1);
      }

      // Grade dos Números
      const numbersStartY = startY + headerH;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const x = startX + c * cellW;
          const y = numbersStartY + r * cellH;
          const val = cardNumbers[r]?.[c];

          // Retângulo da Célula
          ctx.strokeRect(x, y, cellW, cellH);

          if (val === 'LIVRE') {
            // Casa central especial FREE / LIVRE
            ctx.fillStyle = '#000000';
            ctx.font = '22px sans-serif';
            ctx.fillText('★', x + cellW / 2, y + cellH / 2 - 9);
            ctx.font = 'bold 12px Nunito, sans-serif';
            ctx.fillText('LIVRE', x + cellW / 2, y + cellH / 2 + 13);
          } else if (val !== undefined) {
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 28px "JetBrains Mono", monospace';
            ctx.fillText(String(val).padStart(2, ' '), x + cellW / 2, y + cellH / 2);
          }
        }
      }

      // Rodapé da Cartela
      const footerY = numbersStartY + 5 * cellH + 16;
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('Jogador: ________________________________', W / 2, footerY);
      ctx.fillText('★ BOA SORTE • MiniPrint Studio ★', W / 2, footerY + 18);
    } else {
      // Cartela 3x3 para 20 números aproveitando a largura total
      const startY = 68;
      const cellH = 86;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const x = startX + c * cellW;
          const y = startY + r * cellH;
          const val = cardNumbers[r]?.[c];

          ctx.strokeRect(x, y, cellW, cellH);
          if (val !== undefined) {
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 42px "JetBrains Mono", monospace';
            ctx.fillText(String(val), x + cellW / 2, y + cellH / 2);
          }
        }
      }

      const footerY = startY + 3 * cellH + 20;
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText('Jogador: ________________________________', W / 2, footerY);
      ctx.fillText('★ BINGO INFANTIL • BOA SORTE! ★', W / 2, footerY + 18);
    }

    // 2. Linha Inferior de Corte (sem moldura nas laterais)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, H - 10);
    ctx.lineTo(W - 4, H - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✁', 6, H - 10);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, H - 10);

    // Copia para o canvas compartilhado do preview
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
  }, [canvasRef, setCanvasHeight, cardNumbers, maxNumbers, cardSerial]);

  useEffect(() => {
    renderBingoCardToCanvas();
  }, [cardNumbers, maxNumbers, cardSerial, renderBingoCardToCanvas]);

  const handlePrintCurrentCard = async () => {
    if (!canvasRef.current) return;
    // Registra cartela para evitar duplicação futura
    const flatNums = cardNumbers.flat().filter((n): n is number => typeof n === 'number');
    printedCardsRef.current.push(flatNums);
    await printCanvas(canvasRef.current);
  };

  return (
    <div className="space-y-4">
      {/* 1 · Escolha o Modo de Bingo (1 a 90, 75, 50, etc.) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              1
            </span>
            <span>Tipo de Bingo (Total de Bolas)</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            1 a {maxNumbers} Bolas
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-xs">
          {(
            [
              { id: 20, label: '1 a 20', desc: 'Rápido' },
              { id: 30, label: '1 a 30', desc: 'Infantil' },
              { id: 50, label: '1 a 50', desc: 'Médio' },
              { id: 75, label: '1 a 75', desc: 'Americano' },
              { id: 90, label: '1 a 90', desc: 'Tradicional' }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setMaxNumbers(item.id)}
              className={`py-2 px-1 rounded-2xl border font-black text-center transition active:scale-95 flex flex-col items-center justify-center ${
                maxNumbers === item.id
                  ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-md shadow-emerald-200'
                  : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/60'
              }`}
            >
              <span className="text-xs">{item.label}</span>
              <span className={`text-[9px] font-medium ${maxNumbers === item.id ? 'text-emerald-100' : 'text-emerald-600'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2 · Globo de Sorteio de Bolas Interativo */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-teal-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Globo de Sorteio das Bolas</span>
          </span>
          <span className="text-[11px] font-mono text-teal-700 font-bold">
            {drawnNumbers.length} / {maxNumbers} sorteadas
          </span>
        </div>

        {/* Display da Bola Chamada */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white flex flex-col items-center justify-center shadow-xl shadow-teal-500/25 border-4 border-white ${
                isSpinning ? 'animate-spin' : 'animate-in zoom-in-90 duration-200'
              }`}
            >
              <span className="text-[10px] font-black tracking-widest uppercase opacity-80">
                {currentDrawn ? getLetterForNumber(currentDrawn, maxNumbers) : 'BINGO'}
              </span>
              <span className="text-3xl font-black font-mono tracking-tight leading-none">
                {currentDrawn !== null ? currentDrawn : '?'}
              </span>
            </div>
            {currentDrawn !== null && !isSpinning && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={drawNextNumber}
              disabled={availableNumbers.length === 0 || isSpinning}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-sm shadow-md shadow-emerald-300 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Dices className="w-5 h-5" />
              <span>{isSpinning ? 'Girando Globo...' : availableNumbers.length === 0 ? 'Fim do Jogo!' : 'Sortear Bola'}</span>
            </button>

            <button
              onClick={() => resetGame(maxNumbers)}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Sorteio</span>
            </button>
          </div>
        </div>

        {/* Mesa de Conferência das Bolas (Painel com todas as bolas) */}
        <div className="space-y-1.5 pt-2 border-t border-teal-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-700">Mesa de Conferência:</span>
            <span className="text-[10px] text-slate-500 font-medium">Bolas verdes já foram sorteadas</span>
          </div>

          <div className="max-h-36 overflow-y-auto p-2 bg-[#faf9f6] rounded-2xl border border-teal-100 grid grid-cols-10 sm:grid-cols-15 gap-1 text-[11px] font-mono font-bold scrollbar-thin">
            {Array.from({ length: maxNumbers }, (_, idx) => idx + 1).map((n) => {
              const isDrawn = drawnNumbers.includes(n);
              const isLast = currentDrawn === n;
              return (
                <div
                  key={n}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] transition ${
                    isLast
                      ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 font-black scale-110 shadow-sm'
                      : isDrawn
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'bg-white border border-slate-200 text-slate-400'
                  }`}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 · Gerar e Imprimir Cartelas Tradicionais */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-teal-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              3
            </span>
            <span>Cartela de Impressão Térmica</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            Série #{cardSerial}
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          A cartela impressa segue o formato clássico com o cabeçalho <strong>B-I-N-G-O</strong>, casa central <strong>LIVRE ★</strong> e números ordenados em cada coluna, pronta para os jogadores marcarem!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              const nextCard = generateCard(maxNumbers);
              setCardNumbers(nextCard);
            }}
            className="py-3 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100 active:scale-95 border border-teal-200 text-teal-800 font-extrabold text-xs flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
            <span>Gerar Outra Cartela (Nova Combinação)</span>
          </button>

          <button
            onClick={handlePrintCurrentCard}
            disabled={isPrinting}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-300 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isConnected ? 'Imprimir Esta Cartela' : 'Conectar e Imprimir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
