import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Search, RefreshCw, Compass } from 'lucide-react';
import { TEMAS_CACA_PALAVRAS, WordSearchTheme } from '../data/wordSearchData';

interface PassatemposToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type PassatempoMode = 'caca-palavras' | 'mandala';

export const PassatemposTool: React.FC<PassatemposToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const [mode, setMode] = useState<PassatempoMode>('caca-palavras');

  const [selectedTheme, setSelectedTheme] = useState<WordSearchTheme>(TEMAS_CACA_PALAVRAS[0]);
  const [gridSize, setGridSize] = useState<number>(10);
  const [wordGrid, setWordGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);

  const [mandalaSeed, setMandalaSeed] = useState<number>(() => Math.floor(Math.random() * 99999));
  const [layersCount, setLayersCount] = useState<number>(4);
  const [petalsCount, setPetalsCount] = useState<number>(8);

  const generateWordSearch = useCallback(() => {
    const size = gridSize;
    const grid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(''));

    const available = [...selectedTheme.palavras].sort(() => Math.random() - 0.5);
    const wordsToPlace: string[] = [];
    const maxWords = size === 10 ? 6 : 7;

    for (const w of available) {
      if (w.length <= size) {
        wordsToPlace.push(w.toUpperCase());
        if (wordsToPlace.length >= maxWords) break;
      }
    }

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
    ];

    const successfullyPlaced: string[] = [];

    for (const word of wordsToPlace) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 150) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const dr = dir[0];
        const dc = dir[1];

        const maxR = size - (word.length - 1) * dr;
        const maxC = size - (word.length - 1) * dc;

        if (maxR <= 0 || maxC <= 0) continue;

        const startR = Math.floor(Math.random() * maxR);
        const startC = Math.floor(Math.random() * maxC);

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = startR + i * dr;
          const c = startC + i * dc;
          const currentCell = grid[r][c];
          if (currentCell !== '' && currentCell !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[startR + i * dr][startC + i * dc] = word[i];
          }
          placed = true;
          successfullyPlaced.push(word);
        }
      }
    }

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setWordGrid(grid);
    setPlacedWords(successfullyPlaced);
  }, [gridSize, selectedTheme]);

  const renderWordSearchToCanvas = useCallback(() => {
    if (!canvasRef.current || wordGrid.length === 0 || wordGrid.length !== gridSize) return;
    const W = 384;

    const size = gridSize;
    const cellSize = size === 10 ? 32 : 27;
    const gridTotal = cellSize * size;
    const startX = Math.floor((W - gridTotal) / 2);
    const startY = 96;

    const wordsListRows = Math.ceil(placedWords.length / 2);
    const H = startY + gridTotal + 50 + wordsListRows * 24 + 40;

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
    ctx.font = 'bold 30px "Bebas Neue", sans-serif';
    ctx.fillText('CAÇA-PALAVRAS', W / 2, 38);

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText(`Tema: ${selectedTheme.nome} (${selectedTheme.icone}) • ${size}x${size}`, W / 2, 66);

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.lineTo(W - 30, 80);
    ctx.stroke();

    ctx.font = `bold ${size === 10 ? 18 : 15}px "JetBrains Mono", monospace`;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = startX + c * cellSize + cellSize / 2;
        const y = startY + r * cellSize + cellSize / 2 + 1;
        const letter = wordGrid[r]?.[c] || '';
        ctx.fillText(letter, x, y);
      }
    }

    ctx.lineWidth = 2;
    ctx.strokeRect(startX - 2, startY - 2, gridTotal + 4, gridTotal + 4);

    const listStartY = startY + gridTotal + 25;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(25, listStartY);
    ctx.lineTo(W - 25, listStartY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PALAVRAS PARA ENCONTRAR:', W / 2, listStartY + 16);

    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    const colLeftX = 40;
    const colRightX = W / 2 + 15;

    placedWords.forEach((word, idx) => {
      const isLeft = idx % 2 === 0;
      const rowIdx = Math.floor(idx / 2);
      const itemY = listStartY + 38 + rowIdx * 22;
      const x = isLeft ? colLeftX : colRightX;

      ctx.textAlign = 'left';
      ctx.fillText(`[ ] ${word}`, x, itemY);
    });

    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.fillText('★ MiniPrint • Diversão em Família ★', W / 2, H - 14);

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
  }, [canvasRef, setCanvasHeight, wordGrid, gridSize, placedWords, selectedTheme]);

  const renderMandalaToCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const W = 384;
    const H = 450;

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
    ctx.font = 'bold 30px "Bebas Neue", sans-serif';
    ctx.fillText('MANDALA PARA COLORIR', W / 2, 34);

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText(`Arte Geométrica • #${mandalaSeed}`, W / 2, 58);

    const cx = W / 2;
    const cy = 240;
    const maxRadius = 165;

    let localSeed = mandalaSeed;
    const pseudoRand = (max: number) => {
      localSeed = (localSeed * 9301 + 49297) % 233280;
      return (localSeed / 233280) * max;
    };

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let c = layersCount; c >= 1; c--) {
      const radius = (maxRadius / layersCount) * c;
      const innerRadius = (maxRadius / layersCount) * (c - 1);
      const petalSize = radius - innerRadius;

      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      const offsetAngle = c % 2 === 0 ? Math.PI / petalsCount : 0;
      const styleType = Math.floor(pseudoRand(4));

      for (let p = 0; p < petalsCount; p++) {
        const angle = (Math.PI * 2 / petalsCount) * p + offsetAngle;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        if (styleType === 0) {
          ctx.moveTo(0, innerRadius);
          ctx.quadraticCurveTo(petalSize * 0.45, innerRadius + petalSize * 0.5, 0, radius);
          ctx.quadraticCurveTo(-petalSize * 0.45, innerRadius + petalSize * 0.5, 0, innerRadius);
        } else if (styleType === 1) {
          ctx.moveTo(0, innerRadius);
          ctx.lineTo(petalSize * 0.35, innerRadius + petalSize * 0.5);
          ctx.lineTo(0, radius);
          ctx.lineTo(-petalSize * 0.35, innerRadius + petalSize * 0.5);
          ctx.closePath();
        } else if (styleType === 2) {
          ctx.arc(0, innerRadius + petalSize * 0.4, petalSize * 0.4, 0, Math.PI * 2);
        } else {
          ctx.moveTo(0, innerRadius);
          ctx.bezierCurveTo(petalSize * 0.4, innerRadius, petalSize * 0.4, radius, 0, radius);
          ctx.bezierCurveTo(-petalSize * 0.4, radius, -petalSize * 0.4, innerRadius, 0, innerRadius);
          ctx.moveTo(0, innerRadius);
          ctx.lineTo(0, radius - 2);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('Dica: Pinte a bobina com lápis de cor ou giz de cera!', W / 2, H - 24);
    ctx.fillText('★ ★ ★ MiniPrint ★ ★ ★', W / 2, H - 10);

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
  }, [canvasRef, setCanvasHeight, mandalaSeed, layersCount, petalsCount]);

  useEffect(() => {
    if (mode === 'caca-palavras') {
      generateWordSearch();
    }
  }, [mode, selectedTheme, gridSize, generateWordSearch]);

  useEffect(() => {
    if (mode === 'caca-palavras') {
      renderWordSearchToCanvas();
    } else {
      renderMandalaToCanvas();
    }
  }, [mode, wordGrid, placedWords, mandalaSeed, layersCount, petalsCount, renderWordSearchToCanvas, renderMandalaToCanvas]);

  return (
    <div className="space-y-4">
      {/* 1 · Escolha a Atividade */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-card space-y-3">
        <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
            1
          </span>
          <span>Modalidade do Passatempo</span>
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setMode('caca-palavras')}
            className={`py-3 px-3 rounded-2xl border font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
              mode === 'caca-palavras'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white shadow-md shadow-purple-300'
                : 'bg-purple-50/70 border-purple-200 text-purple-700 hover:brightness-95'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Caça-Palavras</span>
          </button>

          <button
            onClick={() => setMode('mandala')}
            className={`py-3 px-3 rounded-2xl border font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${
              mode === 'mandala'
                ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 border-fuchsia-600 text-white shadow-md shadow-fuchsia-300'
                : 'bg-fuchsia-50/70 border-fuchsia-200 text-fuchsia-700 hover:brightness-95'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Mandala para Colorir</span>
          </button>
        </div>
      </div>

      {mode === 'caca-palavras' ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-card space-y-3">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Tema & Tamanho</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {TEMAS_CACA_PALAVRAS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`py-2 px-2.5 rounded-xl border text-left flex items-center gap-2 transition font-bold active:scale-95 ${
                  selectedTheme.id === t.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm shadow-purple-200 border-purple-400'
                    : 'bg-purple-50/50 border-purple-100 text-purple-900 hover:border-purple-300'
                }`}
              >
                <span className="text-sm">{t.icone}</span>
                <span className="truncate">{t.nome}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-100">
            <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-xl border border-purple-200 text-xs">
              <span className="text-purple-700 px-2 text-[11px] font-black">Grade:</span>
              <button
                onClick={() => setGridSize(10)}
                className={`px-3 py-1 rounded-lg font-black text-xs transition active:scale-95 ${
                  gridSize === 10 ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-600'
                }`}
              >
                10×10
              </button>
              <button
                onClick={() => setGridSize(12)}
                className={`px-3 py-1 rounded-lg font-black text-xs transition active:scale-95 ${
                  gridSize === 12 ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-600'
                }`}
              >
                12×12
              </button>
            </div>

            <button
              onClick={() => {
                generateWordSearch();
              }}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-black transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
              <span>Embaralhar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-fuchsia-100 shadow-card space-y-3">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Geometria da Mandala</span>
          </span>

          <button
            onClick={() => setMandalaSeed(Math.floor(Math.random() * 99999))}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-black text-xs shadow-md shadow-fuchsia-300 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Palette className="w-4 h-4 text-fuchsia-200" />
            <span>Gerar Nova Geometria 🎨</span>
          </button>

          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-purple-800 font-extrabold">
                <span>Camadas Concêntricas</span>
                <span className="font-mono text-purple-900 font-black">{layersCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="6"
                value={layersCount}
                onChange={(e) => setLayersCount(parseInt(e.target.value))}
                className="w-full accent-fuchsia-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-purple-800 font-extrabold">
                <span>Pétalas Simétricas</span>
                <span className="font-mono text-purple-900 font-black">{petalsCount}</span>
              </div>
              <input
                type="range"
                min="6"
                max="16"
                step="2"
                value={petalsCount}
                onChange={(e) => setPetalsCount(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
