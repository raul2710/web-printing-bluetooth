import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

interface SudokuToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type Difficulty = 'facil' | 'medio' | 'dificil';

export const SudokuTool: React.FC<SudokuToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medio');
  const [puzzleBoard, setPuzzleBoard] = useState<(number | '')[][]>([]);
  const [solutionBoard, setSolutionBoard] = useState<number[][]>([]);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const generateSudoku = useCallback((diff: Difficulty) => {
    const base: number[][] = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];

    const perm = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const fullSolution: number[][] = base.map((row) => row.map((val) => perm[val - 1]));

    let cellsToRemove = 38;
    if (diff === 'medio') cellsToRemove = 50;
    if (diff === 'dificil') cellsToRemove = 60;

    const puzzle: (number | '')[][] = fullSolution.map((row) => [...row]);
    const coords: { r: number; c: number }[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        coords.push({ r, c });
      }
    }
    coords.sort(() => Math.random() - 0.5);

    for (let i = 0; i < cellsToRemove; i++) {
      puzzle[coords[i].r][coords[i].c] = '';
    }

    setSolutionBoard(fullSolution);
    setPuzzleBoard(puzzle);
  }, []);

  const renderSudoku = useCallback(() => {
    if (!canvasRef.current || puzzleBoard.length === 0) return;
    const W = 384;
    const H = 490;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;

    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 34px "Bebas Neue", sans-serif';
    ctx.fillText('SUDOKU', W / 2, 38);

    const diffName = difficulty === 'facil' ? 'FÁCIL' : difficulty === 'medio' ? 'MÉDIO' : 'DIFÍCIL';
    ctx.font = 'bold 13px Nunito, sans-serif';
    const today = new Date().toLocaleDateString('pt-BR');
    ctx.fillText(`Nível: ${diffName} • ${today}`, W / 2, 66);

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(W - 30, 80);
    ctx.stroke();

    const cellSize = 38;
    const gridTotal = cellSize * 9;
    const startX = Math.floor((W - gridTotal) / 2);
    const startY = 96;

    const boardToDraw = showSolution ? solutionBoard : puzzleBoard;

    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = boardToDraw[r]?.[c];
        if (val !== undefined && val !== '') {
          const x = startX + c * cellSize + cellSize / 2;
          const y = startY + r * cellSize + cellSize / 2 + 1;
          ctx.fillText(String(val), x, y);
        }
      }
    }

    for (let i = 0; i <= 9; i++) {
      const isThick = i % 3 === 0;
      ctx.lineWidth = isThick ? 3 : 1;

      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + gridTotal, startY + i * cellSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + gridTotal);
      ctx.stroke();
    }

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('Desafio Sudoku • Preencha de 1 a 9', W / 2, H - 28);
    ctx.fillText('★ ★ ★ MiniPrint ★ ★ ★', W / 2, H - 12);

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
  }, [canvasRef, setCanvasHeight, difficulty, puzzleBoard, solutionBoard, showSolution]);

  useEffect(() => {
    generateSudoku(difficulty);
  }, [difficulty, generateSudoku]);

  useEffect(() => {
    renderSudoku();
  }, [puzzleBoard, showSolution, renderSudoku]);

  return (
    <div className="space-y-4">
      {/* 1 · Escolha o Nível com Cores */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              1
            </span>
            <span>Nível de Dificuldade</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 capitalize">
            {difficulty}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {(
            [
              { id: 'facil', label: 'Fácil', active: 'bg-emerald-500 text-white shadow-emerald-200', inactive: 'bg-emerald-50/70 border-emerald-200 text-emerald-700' },
              { id: 'medio', label: 'Médio', active: 'bg-blue-600 text-white shadow-blue-200', inactive: 'bg-blue-50/70 border-blue-200 text-blue-700' },
              { id: 'dificil', label: 'Difícil', active: 'bg-rose-500 text-white shadow-rose-200', inactive: 'bg-rose-50/70 border-rose-200 text-rose-700' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setDifficulty(item.id);
                generateSudoku(item.id);
              }}
              className={`py-3 px-2 rounded-2xl font-black border transition active:scale-95 text-center shadow-sm ${
                difficulty === item.id
                  ? `${item.active} shadow-md`
                  : `${item.inactive} hover:brightness-95`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2 · Ações do Jogo */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-indigo-100 shadow-card space-y-3">
        <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
            2
          </span>
          <span>Controles do Tabuleiro</span>
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => generateSudoku(difficulty)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-black transition active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <span>Novo Jogo</span>
          </button>

          <button
            onClick={() => setShowSolution((s) => !s)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-black transition active:scale-95 shadow-sm ${
              showSolution
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200'
                : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {showSolution ? (
              <>
                <EyeOff className="w-4 h-4 text-white" />
                <span>Ocultar Gabarito</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Ver Gabarito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
