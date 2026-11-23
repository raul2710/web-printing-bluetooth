import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Palette, Search, RefreshCw, Compass, Sparkles, Upload, Image as ImageIcon, Sliders, Wand2, Trash2 } from 'lucide-react';
import { TEMAS_CACA_PALAVRAS, WordSearchTheme } from '../data/wordSearchData';
import { COLORING_DESIGNS, ColoringDesign } from '../data/coloringDesigns';

interface PassatemposToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

type PassatempoMode = 'caca-palavras' | 'colorir' | 'mandala' | 'meu-desenho';

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

  // Meu Desenho (Upload da Web / Personalizado)
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);
  const [customDrawingTitle, setCustomDrawingTitle] = useState<string>('MEU DESENHO');
  const [customThreshold, setCustomThreshold] = useState<number>(150);
  const [customEdgeMode, setCustomEdgeMode] = useState<boolean>(false);
  const [customInvert, setCustomInvert] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Renderiza o Caça-Palavras com letras MAXIMIZADAS, sem emotes no tema e com espaçamento harmônico
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
    const startY = 76;

    const wordsListRows = Math.ceil(placedWords.length / 2);
    const listStartY = startY + gridTotal + 26;
    const footerY = listStartY + 44 + wordsListRows * 30 + 22;
    const H = footerY + 32;

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

    // Cabeçalho com letras e palavras ampliadas e espaçadas
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 34px "Bebas Neue", sans-serif';
    ctx.fillText('CAÇA-PALAVRAS', W / 2, 32);

    // Sem emotes no tema impresso para visual limpo
    ctx.font = 'bold 13px Nunito, sans-serif';
    ctx.fillText(`Tema: ${selectedTheme.nome} • Grade: ${size}×${size}`, W / 2, 56);

    // Letras GRANDES e destacadas
    // 8x8: 28px | 10x10: 24px | 12x12: 20px
    const fontPx = size === 8 ? 28 : size === 10 ? 24 : 20;
    ctx.font = `bold ${fontPx}px "JetBrains Mono", monospace`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = startX + c * cellSize + cellSize / 2;
        const y = startY + r * cellSize + cellSize / 2;
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
    ctx.moveTo(10, listStartY);
    ctx.lineTo(W - 10, listStartY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 15px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PALAVRAS PARA ENCONTRAR:', W / 2, listStartY + 16);

    // Lista de Palavras em 2 colunas com fonte AUMENTADA (16px) e bem legível
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    const colLeftX = 22;
    const colRightX = W / 2 + 10;

    placedWords.forEach((word, idx) => {
      const isLeft = idx % 2 === 0;
      const rowIdx = Math.floor(idx / 2);
      const itemY = listStartY + 44 + rowIdx * 30;
      const x = isLeft ? colLeftX : colRightX;

      ctx.textAlign = 'left';
      ctx.fillText(`[ ] ${word}`, x, itemY);
    });

    // Rodapé aumentado com espaçamento harmônico
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText('★ MiniPrint • Diversão em Família ★', W / 2, footerY);

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

  // Renderiza o Desenho Selecionado para Colorir com espaçamento ampliado
  const renderColoringToCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const W = 384;
    const H = 460;

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

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText('DESENHO PARA COLORIR COM LÁPIS OU GIZ', W / 2, 54);

    // Desenha a ilustração vetorial escolhida
    ctx.save();
    selectedDesign.draw(ctx, W, H);
    ctx.restore();

    // Rodapé de Assinatura com espaçamento harmônico
    const footerY = H - 42;
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('Colorido por: ____________________________', W / 2, footerY);
    ctx.fillText('★ MiniPrint • Arte & Imaginação ★', W / 2, footerY + 20);

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

  // Renderiza o Meu Desenho (Upload da Web com conversão inteligente para colorir)
  const renderCustomDrawingToCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const W = 384;

    if (!customImage) {
      // Estado de espera: convite para o usuário enviar um desenho da internet
      const H = 400;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = W;
      tempCanvas.height = H;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';

      // Linha superior de corte
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
      ctx.fillText('MEU DESENHO • PARA COLORIR', W / 2, 34);
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('IMPRIMA QUALQUER DESENHO DA INTERNET', W / 2, 58);

      // Caixa central pontilhada
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 85, W - 48, 220);
      ctx.setLineDash([]);

      ctx.font = '42px sans-serif';
      ctx.fillText('🎨', W / 2, 142);
      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.fillText('ENVIE UMA IMAGEM OU FOTO', W / 2, 195);
      ctx.font = '12px Nunito, sans-serif';
      ctx.fillText('Baixe um desenho para colorir na internet', W / 2, 222);
      ctx.fillText('e envie no botão abaixo para imprimir!', W / 2, 242);

      // Rodapé
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText('★ MiniPrint Studio • Meu Desenho ★', W / 2, 350);

      // Linha inferior de corte
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
      return;
    }

    // Com imagem carregada: processamento e binarização de alta qualidade
    const targetW = 360;
    const aspect = customImage.naturalHeight / (customImage.naturalWidth || 1);
    const targetH = Math.max(120, Math.min(650, Math.round(targetW * aspect)));

    const startY = 76;
    const footerY = startY + targetH + 24;
    const H = footerY + 58;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    // Linha superior de corte
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
    const titleText = (customDrawingTitle.trim() || 'MEU DESENHO').toUpperCase();
    ctx.fillText(titleText, W / 2, 32);

    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText('DESENHO PARA COLORIR • IMPRESSÃO TÉRMICA', W / 2, 56);

    // Canvas temporário para processar os pixels da imagem
    const procCanvas = document.createElement('canvas');
    procCanvas.width = targetW;
    procCanvas.height = targetH;
    const procCtx = procCanvas.getContext('2d');
    if (procCtx) {
      procCtx.fillStyle = '#ffffff';
      procCtx.fillRect(0, 0, targetW, targetH);
      procCtx.drawImage(customImage, 0, 0, targetW, targetH);

      const imgData = procCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      const w = targetW;
      const h = targetH;

      if (customEdgeMode) {
        // Detecção de contornos Sobel (transforma fotos e artes em traços para colorir)
        const gray = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
          const idx = i * 4;
          gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }

        const outData = new Uint8ClampedArray(w * h * 4);
        const edgeThreshold = Math.max(15, 255 - customThreshold);

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const gx =
              -gray[(y - 1) * w + (x - 1)] + gray[(y - 1) * w + (x + 1)] +
              -2 * gray[y * w + (x - 1)] + 2 * gray[y * w + (x + 1)] +
              -gray[(y + 1) * w + (x - 1)] + gray[(y + 1) * w + (x + 1)];

            const gy =
              -gray[(y - 1) * w + (x - 1)] - 2 * gray[(y - 1) * w + x] - gray[(y - 1) * w + (x + 1)] +
              gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];

            const mag = Math.sqrt(gx * gx + gy * gy);
            let isBlack = mag > edgeThreshold;
            if (customInvert) isBlack = !isBlack;

            const pIdx = idx * 4;
            const val = isBlack ? 0 : 255;
            outData[pIdx] = val;
            outData[pIdx + 1] = val;
            outData[pIdx + 2] = val;
            outData[pIdx + 3] = 255;
          }
        }
        for (let i = 0; i < outData.length; i++) data[i] = outData[i];
      } else {
        // Limiarização direta (Thresholding ideal para desenhos com traços baixados da web)
        for (let i = 0; i < data.length; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          let isBlack = luma < customThreshold;
          if (customInvert) isBlack = !isBlack;
          const val = isBlack ? 0 : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
      }

      procCtx.putImageData(imgData, 0, 0);

      // Desenha a imagem processada centralizada (12px de margem lateral)
      ctx.drawImage(procCanvas, 12, startY);
    }

    // Moldura delicada
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, startY, targetW, targetH);

    // Rodapé de assinatura
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillText('Colorido por: ____________________________', W / 2, footerY);
    ctx.fillText('Data: _____ / _____ / ________', W / 2, footerY + 22);
    ctx.font = 'bold 11px Nunito, sans-serif';
    ctx.fillText('★ MiniPrint Studio • Meu Desenho ★', W / 2, footerY + 42);

    // Linha inferior de corte
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
  }, [canvasRef, setCanvasHeight, customImage, customDrawingTitle, customThreshold, customEdgeMode, customInvert]);

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

  // Manipulador de upload de imagem personalizada da web / celular
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomImage(img);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (nameWithoutExt && nameWithoutExt.length <= 25) {
          setCustomDrawingTitle(nameWithoutExt.toUpperCase());
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setCustomImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Carrega exemplo vetorial de desenho para teste imediato
  const loadSampleDrawing = () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <rect width="360" height="360" fill="white" stroke="none"/>
      <path d="M180,30 L215,120 L310,125 L235,185 L260,280 L180,225 L100,280 L125,185 L50,125 L145,120 Z" fill="white" stroke="black" stroke-width="6"/>
      <circle cx="155" cy="155" r="8" fill="black"/>
      <circle cx="205" cy="155" r="8" fill="black"/>
      <path d="M165,180 Q180,195 195,180" fill="none" stroke="black" stroke-width="4"/>
      <ellipse cx="140" cy="170" rx="8" ry="5" fill="none" stroke="black" stroke-width="2" stroke-dasharray="2,2"/>
      <ellipse cx="220" cy="170" rx="8" ry="5" fill="none" stroke="black" stroke-width="2" stroke-dasharray="2,2"/>
      <path d="M80,60 L85,75 L100,75 L88,85 L92,100 L80,90 L68,100 L72,85 L60,75 L75,75 Z" fill="white" stroke="black" stroke-width="3"/>
      <path d="M280,70 L284,82 L296,82 L286,90 L290,102 L280,94 L270,102 L274,90 L264,82 L276,82 Z" fill="white" stroke="black" stroke-width="3"/>
    </svg>`;
    const blob = new Blob([sampleSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      setCustomImage(img);
      setCustomDrawingTitle('ESTRELA MÁGICA');
    };
    img.src = url;
  };

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
    } else if (mode === 'mandala') {
      renderMandalaToCanvas();
    } else if (mode === 'meu-desenho') {
      renderCustomDrawingToCanvas();
    }
  }, [
    mode,
    wordGrid,
    placedWords,
    selectedDesignId,
    mandalaSeed,
    layersCount,
    petalsCount,
    customImage,
    customDrawingTitle,
    customThreshold,
    customEdgeMode,
    customInvert,
    renderWordSearchToCanvas,
    renderColoringToCanvas,
    renderMandalaToCanvas,
    renderCustomDrawingToCanvas,
  ]);

  return (
    <div className="space-y-4">
      {/* 1 · Escolha a Atividade: 4 Modos Divertidos */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-card space-y-3">
        <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
            1
          </span>
          <span>Modalidade do Passatempo</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
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
              Galeria Pronta
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

          <button
            onClick={() => setMode('meu-desenho')}
            className={`py-3 px-2 rounded-2xl border font-black flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-sm text-center ${
              mode === 'meu-desenho'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-600 text-white shadow-md shadow-emerald-300'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:brightness-95'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-xs">Meu Desenho</span>
            <span className={`text-[9px] font-bold ${mode === 'meu-desenho' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              Web / Foto
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
      ) : mode === 'mandala' ? (
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
      ) : (
        /* Modo 4: Meu Desenho (Upload da Web com Filtro para Colorir) */
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
                2
              </span>
              <span>Personalizar Meu Desenho para Colorir</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Papel 58mm (384px)
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Imprima qualquer desenho que você encontrou na internet (Google Imagens, Pinterest, etc.) ou foto do celular. O sistema otimiza os traços pretos e brancos para colorir com lápis de cor ou giz de cera!
          </p>

          {/* Upload e Ações */}
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{customImage ? 'Trocar Imagem do Computador / Celular' : 'Selecionar Imagem do Desenho'}</span>
              </button>

              {!customImage && (
                <button
                  onClick={loadSampleDrawing}
                  className="py-3 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                  title="Carregar exemplo rápido de desenho para colorir"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Testar com Exemplo</span>
                </button>
              )}

              {customImage && (
                <button
                  onClick={handleClearImage}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                  title="Remover imagem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Ajuste do Título da Cartela */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Título Impresso no Desenho:</label>
              <input
                type="text"
                value={customDrawingTitle}
                onChange={(e) => setCustomDrawingTitle(e.target.value)}
                placeholder="Ex: POKÉMON, PRINCESA, MEU DESENHO"
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 uppercase tracking-wide bg-white"
                maxLength={30}
              />
            </div>

            {/* Configurações de Tratamento de Imagem */}
            {customImage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span>Ajustes de Contorno para Impressão Térmica</span>
                </div>

                {/* Slider de Limiar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>Espessura do Traço / Limiar:</span>
                    <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {customThreshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={230}
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Mais fino / claro</span>
                    <span>Mais grosso / escuro</span>
                  </div>
                </div>

                {/* Opções de Modo */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setCustomEdgeMode(false)}
                    className={`p-2.5 rounded-xl border font-bold text-left transition flex items-center gap-2 active:scale-95 ${
                      !customEdgeMode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <div>
                      <div className="text-xs">Traço Direto</div>
                      <div className={`text-[9px] ${!customEdgeMode ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Desenhos da Web
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCustomEdgeMode(true)}
                    className={`p-2.5 rounded-xl border font-bold text-left transition flex items-center gap-2 active:scale-95 ${
                      customEdgeMode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <div>
                      <div className="text-xs">Filtro de Bordas</div>
                      <div className={`text-[9px] ${customEdgeMode ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Fotos & Ilustrações
                      </div>
                    </div>
                  </button>
                </div>

                {/* Inverter Cores */}
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={customInvert}
                    onChange={(e) => setCustomInvert(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                  />
                  <span className="text-xs">Inverter Preto e Branco (fundo preto para branco)</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
