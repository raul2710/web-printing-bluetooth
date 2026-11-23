import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Search, RefreshCw, Compass, Sparkles } from 'lucide-react';
import { TEMAS_CACA_PALAVRAS, WordSearchTheme } from '../data/wordSearchData';
import { COLORING_DESIGNS, ColoringDesign } from '../data/coloringDesigns';

interface PassatemposToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type PassatempoMode = 'caca-palavras' | 'colorir' | 'mandala';

export const PassatemposTool: React.FC<PassatemposToolProps> = ({ canvasRef, setCanvasHeight }) => {
  const [mode, setMode] = useState<PassatempoMode>('caca-palavras');

  // Caça-Palavras
  const [selectedTheme, setSelectedTheme] = useState<WordSearchTheme>(TEMAS_CACA_PALAVRAS[0]);
  const [gridSize, setGridSize] = useState<number>(10);
  const [wordGrid, setWordGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);

  // Desenhos para Colorir
  const [selectedDesignId, setSelectedDesignId] = useState<string>(COLORING_DESIGNS[0].id);

  // Mandalas
  const [mandalaSeed, setMandalaSeed] = useState<number>(() => Math.floor(Math.random() * 99999));
  const [layersCount, setLayersCount] = useState<number>(4);
  const [petalsCount, setPetalsCount] = useState<number>(8);

  const selectedDesign: ColoringDesign =
    COLORING_DESIGNS.find((d) => d.id === selectedDesignId) || COLORING_DESIGNS[0];

  // Gera o tabuleiro do Caça-Palavras
  const generateWordSearch = useCallback(() => {
    const size = gridSize;
    const grid: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(''));

    const available = [...selectedTheme.palavras].sort(() => Math.random() - 0.5);
    const wordsToPlace: string[] = [];
    const maxWords = size === 8 ? 5 : size === 10 ? 6 : 8;

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

  // Renderiza o Caça-Palavras com letras MAXIMIZADAS e corte térmico
  const renderWordSearchToCanvas = useCallback(() => {
    if (!canvasRef.current || wordGrid.length === 0 || wordGrid.length !== gridSize) return;
    const W = 384;
    const size = gridSize;

    // Cálculo maximizado para ocupar praticamente 100% da largura útil da cabeça térmica (384px)
    // 8x8: célula de 47px (376px)
    // 10x10: célula de 38px (380px)
    // 12x12: célula de 31px (372px)
    const cellSize = size === 8 ? 47 : size === 10 ? 38 : 31;
    const gridTotal = cellSize * size;
    const startX = Math.floor((W - gridTotal) / 2);
    const startY = 68;

    const wordsListRows = Math.ceil(placedWords.length / 2);
    const listStartY = startY + gridTotal + 22;
    const H = listStartY + 38 + wordsListRows * 26 + 32;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;

    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Fundo branco térmico
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    // 1. Linha de Corte Superior (sem moldura pesada)
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(W - 4, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✁', 6, 10);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, 10);

    // Cabeçalho
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 30px "Bebas Neue", sans-serif';
    ctx.fillText('CAÇA-PALAVRAS', W / 2, 30);

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText(`Tema: ${selectedTheme.nome} (${selectedTheme.icone}) • ${size}×${size}`, W / 2, 48);

    // Letras GRANDES e destacadas
    // 8x8: 28px | 10x10: 24px | 12x12: 20px
    const fontPx = size === 8 ? 28 : size === 10 ? 24 : 20;
    ctx.font = `bold ${fontPx}px "JetBrains Mono", monospace`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = startX + c * cellSize + cellSize / 2;
        const y = startY + r * cellSize + cellSize / 2 + 1;
        const letter = wordGrid[r]?.[c] || '';
        ctx.fillText(letter, x, y);
      }
    }

    // Linhas internas da grade
    ctx.lineWidth = 1.5;
    ctx.strokeRect(startX, startY, gridTotal, gridTotal);

    for (let i = 1; i < size; i++) {
      // Linhas horizontais
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + gridTotal, startY + i * cellSize);
      ctx.stroke();

      // Linhas verticais
      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + gridTotal);
      ctx.stroke();
    }

    // Divisão para lista de palavras
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(12, listStartY);
    ctx.lineTo(W - 12, listStartY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PALAVRAS PARA ENCONTRAR:', W / 2, listStartY + 14);

    // Lista de Palavras em 2 colunas com fonte MAIOR e legível
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    const colLeftX = 28;
    const colRightX = W / 2 + 14;

    placedWords.forEach((word, idx) => {
      const isLeft = idx % 2 === 0;
      const rowIdx = Math.floor(idx / 2);
      const itemY = listStartY + 36 + rowIdx * 25;
      const x = isLeft ? colLeftX : colRightX;

      ctx.textAlign = 'left';
      ctx.fillText(`[ ] ${word}`, x, itemY);
    });

    // Rodapé
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.fillText('★ MiniPrint • Diversão em Família ★', W / 2, H - 20);

    // 2. Linha de Corte Inferior
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, H - 8);
    ctx.lineTo(W - 4, H - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✁', 6, H - 8);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, H - 8);

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

  // Renderiza o Desenho Selecionado para Colorir
  const renderColoringToCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const W = 384;
    const H = 450;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Fundo branco térmico
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    // Linha de Corte Superior
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(W - 4, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('✁', 6, 10);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, 10);

    // Cabeçalho do Desenho
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 28px "Bebas Neue", sans-serif';
    ctx.fillText(selectedDesign.title.toUpperCase(), W / 2, 32);

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText('DESENHO PARA COLORIR COM LÁPIS OU GIZ', W / 2, 50);

    // Desenha a ilustração vetorial escolhida
    ctx.save();
    selectedDesign.draw(ctx, W, H);
    ctx.restore();

    // Rodapé de Assinatura
    const footerY = H - 36;
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('Colorido por: ____________________________', W / 2, footerY);
    ctx.fillText('★ MiniPrint • Arte & Imaginação ★', W / 2, footerY + 18);

    // Linha de Corte Inferior
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, H - 8);
    ctx.lineTo(W - 4, H - 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✁', 6, H - 8);
    ctx.textAlign = 'right';
    ctx.fillText('✁', W - 6, H - 8);

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
  }, [canvasRef, setCanvasHeight, selectedDesign]);

  // Renderiza a Mandala Geométrica
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

    // Linha de Corte Superior
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(W - 4, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 28px "Bebas Neue", sans-serif';
    ctx.fillText('MANDALA PARA COLORIR', W / 2, 32);

    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText(`Arte Geométrica • #${mandalaSeed}`, W / 2, 50);

    const cx = W / 2;
    const cy = 230;
    const maxRadius = 160;

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

      ctx.lineWidth = 1.8;

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
    ctx.fillText('Dica: Pinte a bobina com lápis de cor ou giz de cera!', W / 2, H - 28);
    ctx.fillText('★ MiniPrint Studio ★', W / 2, H - 14);

    // Linha de Corte Inferior
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(4, H - 8);
    ctx.lineTo(W - 4, H - 8);
    ctx.stroke();
    ctx.setLineDash([]);

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
    } else if (mode === 'colorir') {
      renderColoringToCanvas();
    } else {
      renderMandalaToCanvas();
    }
  }, [mode, wordGrid, placedWords, selectedDesignId, mandalaSeed, layersCount, petalsCount, renderWordSearchToCanvas, renderColoringToCanvas, renderMandalaToCanvas]);

  return (
    <div className="space-y-4">
      {/* 1 · Escolha a Atividade: 3 Modos Divertidos */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-card space-y-3">
        <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
            1
          </span>
          <span>Modalidade do Passatempo</span>
        </span>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => setMode('caca-palavras')}
            className={`py-3 px-2 rounded-2xl border font-black flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-sm text-center ${
              mode === 'caca-palavras'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white shadow-md shadow-purple-300'
                : 'bg-purple-50/70 border-purple-200 text-purple-700 hover:brightness-95'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs">Caça-Palavras</span>
            <span className={`text-[9px] font-bold ${mode === 'caca-palavras' ? 'text-pink-100' : 'text-purple-600'}`}>
              Letras Grandes!
            </span>
          </button>

          <button
            onClick={() => setMode('colorir')}
            className={`py-3 px-2 rounded-2xl border font-black flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-sm text-center ${
              mode === 'colorir'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-600 text-white shadow-md shadow-pink-300'
                : 'bg-pink-50/70 border-pink-200 text-pink-700 hover:brightness-95'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="text-xs">Desenhos</span>
            <span className={`text-[9px] font-bold ${mode === 'colorir' ? 'text-pink-100' : 'text-pink-600'}`}>
              Para Colorir
            </span>
          </button>

          <button
            onClick={() => setMode('mandala')}
            className={`py-3 px-2 rounded-2xl border font-black flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-sm text-center ${
              mode === 'mandala'
                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 border-fuchsia-600 text-white shadow-md shadow-fuchsia-300'
                : 'bg-fuchsia-50/70 border-fuchsia-200 text-fuchsia-700 hover:brightness-95'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-xs">Mandalas</span>
            <span className={`text-[9px] font-bold ${mode === 'mandala' ? 'text-fuchsia-100' : 'text-fuchsia-600'}`}>
              Geometria
            </span>
          </button>
        </div>
      </div>

      {/* 2 · Configurações da Modalidade Ativa */}
      {mode === 'caca-palavras' ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
                2
              </span>
              <span>Tema e Tamanho da Grade</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {gridSize}×{gridSize} Letras Grandes
            </span>
          </div>

          {/* Temas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEMAS_CACA_PALAVRAS.map((theme) => {
              const isSelected = selectedTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                      : 'bg-white border-purple-100 text-slate-700 hover:border-purple-300'
                  }`}
                >
                  <span className="text-base">{theme.icone}</span>
                  <span className="truncate">{theme.nome}</span>
                </button>
              );
            })}
          </div>

          {/* Seletor de Tamanho com Letras Grandes */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100">
            <div className="flex items-center gap-1 bg-purple-50/70 p-1 rounded-xl border border-purple-200 text-xs">
              <span className="text-purple-700 px-2 text-[11px] font-black">Grade:</span>
              <button
                onClick={() => setGridSize(8)}
                className={`px-2.5 py-1 rounded-lg font-black text-xs transition active:scale-95 ${
                  gridSize === 8 ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-700'
                }`}
                title="8x8: Letras Gigantes (Fonte 28px)"
              >
                8×8 (Gigante)
              </button>
              <button
                onClick={() => setGridSize(10)}
                className={`px-2.5 py-1 rounded-lg font-black text-xs transition active:scale-95 ${
                  gridSize === 10 ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-700'
                }`}
                title="10x10: Letras Grandes (Fonte 24px)"
              >
                10×10 (Grande)
              </button>
              <button
                onClick={() => setGridSize(12)}
                className={`px-2.5 py-1 rounded-lg font-black text-xs transition active:scale-95 ${
                  gridSize === 12 ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-700'
                }`}
                title="12x12: Desafio (Fonte 20px)"
              >
                12×12
              </button>
            </div>

            <button
              onClick={() => generateWordSearch()}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-black transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
              <span>Embaralhar</span>
            </button>
          </div>
        </div>
      ) : mode === 'colorir' ? (
        /* Modo 2: Desenhos para Colorir */
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-pink-100 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
                2
              </span>
              <span>Galeria de Desenhos para Colorir</span>
            </span>
            <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              {COLORING_DESIGNS.length} Desenhos
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Desenhos com traços pretos contínuos e bem definidos, criados especialmente para imprimir com perfeição e colorir com lápis de cor ou giz de cera na bobina térmica!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {COLORING_DESIGNS.map((design) => {
              const isSelected = selectedDesignId === design.id;
              return (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesignId(design.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-md shadow-pink-200'
                      : 'bg-white border-pink-100 text-slate-800 hover:border-pink-300'
                  }`}
                >
                  <span className="text-2xl p-1.5 bg-white/90 rounded-xl shadow-xs border border-pink-100">
                    {design.icon}
                  </span>
                  <div className="truncate">
                    <div className="font-extrabold text-xs truncate">{design.title}</div>
                    <div className={`text-[10px] capitalize font-medium ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                      {design.category}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Modo 3: Mandalas Geométricas */
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-fuchsia-100 shadow-card space-y-3">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-fuchsia-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Geometria da Mandala</span>
          </span>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Camadas Circulares:</span>
                <span className="font-mono text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200">
                  {layersCount}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={6}
                value={layersCount}
                onChange={(e) => setLayersCount(Number(e.target.value))}
                className="w-full h-2 bg-fuchsia-100 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Pétalas por Camada:</span>
                <span className="font-mono text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200">
                  {petalsCount}
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={16}
                step={2}
                value={petalsCount}
                onChange={(e) => setPetalsCount(Number(e.target.value))}
                className="w-full h-2 bg-fuchsia-100 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setMandalaSeed(Math.floor(Math.random() * 99999))}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar Outra Mandala</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
