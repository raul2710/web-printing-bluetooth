import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Type,
  QrCode,
  Minus,
  Square,
  Plus,
  Trash2,
  Copy,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Sparkles,
  Move,
  RotateCw
} from 'lucide-react';
import { usePrinter, PaperWidth } from '../bluetooth/PrinterContext';

interface CanvasDesignerToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setCanvasHeight: (h: number) => void;
}

export type LayerType = 'text' | 'banner' | 'qrcode' | 'line' | 'box';

export interface CanvasLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontFamily: 'sans' | 'mono' | 'bebas';
  align: 'left' | 'center' | 'right';
  isBold: boolean;
  isItalic: boolean;
  borderWidth: number;
  isDashed: boolean;
  isInverted: boolean; // para banner: fundo preto, texto branco
}

export const CanvasDesignerTool: React.FC<CanvasDesignerToolProps> = ({
  canvasRef,
  setCanvasHeight
}) => {
  const { paperWidth, setPaperWidth } = usePrinter();

  // Dimensões do Canvas
  const [canvasH, setCanvasH] = useState<number>(360);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('layer-1');

  // Elementos do Canvas Designer
  const [layers, setLayers] = useState<CanvasLayer[]>([
    {
      id: 'layer-banner',
      type: 'banner',
      x: 0,
      y: 16,
      width: 384,
      height: 48,
      content: 'ETIQUETA PERSONALIZADA',
      fontSize: 26,
      fontFamily: 'bebas',
      align: 'center',
      isBold: true,
      isItalic: false,
      borderWidth: 0,
      isDashed: false,
      isInverted: true
    },
    {
      id: 'layer-1',
      type: 'text',
      x: 12,
      y: 80,
      width: 360,
      height: 60,
      content: 'Texto posicionado livremente no canvas!\nArraste ou use os controles de X e Y.',
      fontSize: 16,
      fontFamily: 'sans',
      align: 'left',
      isBold: false,
      isItalic: false,
      borderWidth: 0,
      isDashed: false,
      isInverted: false
    },
    {
      id: 'layer-line',
      type: 'line',
      x: 10,
      y: 154,
      width: 364,
      height: 2,
      content: '',
      fontSize: 0,
      fontFamily: 'sans',
      align: 'center',
      isBold: false,
      isItalic: false,
      borderWidth: 2,
      isDashed: true,
      isInverted: false
    },
    {
      id: 'layer-qr',
      type: 'qrcode',
      x: 117,
      y: 172,
      width: 150,
      height: 150,
      content: 'https://miniprint.com.br',
      fontSize: 0,
      fontFamily: 'sans',
      align: 'center',
      isBold: false,
      isItalic: false,
      borderWidth: 0,
      isDashed: false,
      isInverted: false
    }
  ]);

  // Interação de Arrasto no Canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number } | null>(null);
  const interactiveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  // Atualiza campo de uma camada
  const updateLayer = (id: string, updates: Partial<CanvasLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  // Adiciona nova camada
  const addLayer = (type: LayerType) => {
    const newId = `layer-${Date.now()}`;
    let newLayer: CanvasLayer;

    if (type === 'text') {
      newLayer = {
        id: newId,
        type: 'text',
        x: 10,
        y: 100,
        width: 364,
        height: 40,
        content: 'Novo texto editável',
        fontSize: 18,
        fontFamily: 'sans',
        align: 'left',
        isBold: false,
        isItalic: false,
        borderWidth: 0,
        isDashed: false,
        isInverted: false
      };
    } else if (type === 'banner') {
      newLayer = {
        id: newId,
        type: 'banner',
        x: 0,
        y: 50,
        width: 384,
        height: 44,
        content: 'DESTAQUE',
        fontSize: 24,
        fontFamily: 'bebas',
        align: 'center',
        isBold: true,
        isItalic: false,
        borderWidth: 0,
        isDashed: false,
        isInverted: true
      };
    } else if (type === 'qrcode') {
      newLayer = {
        id: newId,
        type: 'qrcode',
        x: 122,
        y: 120,
        width: 140,
        height: 140,
        content: 'https://exemplo.com',
        fontSize: 0,
        fontFamily: 'sans',
        align: 'center',
        isBold: false,
        isItalic: false,
        borderWidth: 0,
        isDashed: false,
        isInverted: false
      };
    } else if (type === 'line') {
      newLayer = {
        id: newId,
        type: 'line',
        x: 0,
        y: 100,
        width: 384,
        height: 2,
        content: '',
        fontSize: 0,
        fontFamily: 'sans',
        align: 'center',
        isBold: false,
        isItalic: false,
        borderWidth: 2,
        isDashed: false,
        isInverted: false
      };
    } else {
      // Box
      newLayer = {
        id: newId,
        type: 'box',
        x: 10,
        y: 80,
        width: 364,
        height: 100,
        content: '',
        fontSize: 0,
        fontFamily: 'sans',
        align: 'center',
        isBold: false,
        isItalic: false,
        borderWidth: 2,
        isDashed: false,
        isInverted: false
      };
    }

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const duplicateLayer = (layer: CanvasLayer) => {
    const copyId = `layer-${Date.now()}`;
    const newL = {
      ...layer,
      id: copyId,
      x: Math.min(384 - layer.width, layer.x + 10),
      y: Math.min(canvasH - layer.height, layer.y + 10)
    };
    setLayers((prev) => [...prev, newL]);
    setSelectedLayerId(copyId);
  };

  // Carregar Templates
  const loadTemplate = (templateName: string) => {
    if (templateName === 'preco') {
      setCanvasH(300);
      setLayers([
        {
          id: 't-banner',
          type: 'banner',
          x: 0,
          y: 10,
          width: 384,
          height: 40,
          content: 'PRODUTO EM OFERTA',
          fontSize: 22,
          fontFamily: 'bebas',
          align: 'center',
          isBold: true,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: true
        },
        {
          id: 't-nome',
          type: 'text',
          x: 12,
          y: 65,
          width: 360,
          height: 35,
          content: 'Café Especial Torrado 250g',
          fontSize: 20,
          fontFamily: 'sans',
          align: 'center',
          isBold: true,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: false
        },
        {
          id: 't-preco',
          type: 'text',
          x: 12,
          y: 108,
          width: 360,
          height: 60,
          content: 'R$ 29,90',
          fontSize: 48,
          fontFamily: 'bebas',
          align: 'center',
          isBold: true,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: false
        },
        {
          id: 't-line',
          type: 'line',
          x: 16,
          y: 175,
          width: 352,
          height: 2,
          content: '',
          fontSize: 0,
          fontFamily: 'sans',
          align: 'center',
          isBold: false,
          isItalic: false,
          borderWidth: 1,
          isDashed: true,
          isInverted: false
        },
        {
          id: 't-qr',
          type: 'qrcode',
          x: 142,
          y: 190,
          width: 90,
          height: 90,
          content: 'https://miniprint.com.br/produto/123',
          fontSize: 0,
          fontFamily: 'sans',
          align: 'center',
          isBold: false,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: false
        }
      ]);
    } else if (templateName === 'destinatario') {
      setCanvasH(340);
      setLayers([
        {
          id: 'd-box',
          type: 'box',
          x: 6,
          y: 8,
          width: 372,
          height: 324,
          content: '',
          fontSize: 0,
          fontFamily: 'sans',
          align: 'center',
          isBold: false,
          isItalic: false,
          borderWidth: 2,
          isDashed: false,
          isInverted: false
        },
        {
          id: 'd-title',
          type: 'banner',
          x: 8,
          y: 10,
          width: 368,
          height: 36,
          content: 'DESTINATÁRIO',
          fontSize: 22,
          fontFamily: 'bebas',
          align: 'center',
          isBold: true,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: true
        },
        {
          id: 'd-info',
          type: 'text',
          x: 20,
          y: 60,
          width: 344,
          height: 120,
          content: 'Nome: Maria Clara da Silva\nRua das Flores, 123 - Apto 402\nBairro Jardim Esperança\nSão Paulo - SP • CEP 01234-567',
          fontSize: 16,
          fontFamily: 'sans',
          align: 'left',
          isBold: false,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: false
        },
        {
          id: 'd-div',
          type: 'line',
          x: 18,
          y: 195,
          width: 348,
          height: 2,
          content: '',
          fontSize: 0,
          fontFamily: 'sans',
          align: 'center',
          isBold: false,
          isItalic: false,
          borderWidth: 1,
          isDashed: true,
          isInverted: false
        },
        {
          id: 'd-remetente',
          type: 'text',
          x: 20,
          y: 208,
          width: 344,
          height: 80,
          content: 'REMETENTE:\nMiniPrint Brasil • www.miniprint.com.br\nEnvio Express',
          fontSize: 13,
          fontFamily: 'mono',
          align: 'left',
          isBold: false,
          isItalic: false,
          borderWidth: 0,
          isDashed: false,
          isInverted: false
        }
      ]);
    }
    setSelectedLayerId(null);
  };

  // Renderização mestre no Canvas
  const renderMasterCanvas = useCallback(async (isCancelled?: () => boolean) => {
    if (!canvasRef.current) return;
    const W = 384;
    const H = canvasH;

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

    // Desenha cada camada em ordem
    for (const layer of layers) {
      if (layer.type === 'banner') {
        // Tarja preta com texto branco
        ctx.fillStyle = layer.isInverted ? '#000000' : '#ffffff';
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

        ctx.fillStyle = layer.isInverted ? '#ffffff' : '#000000';
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'middle';

        const fontFace =
          layer.fontFamily === 'mono'
            ? '"JetBrains Mono", monospace'
            : layer.fontFamily === 'bebas'
            ? '"Bebas Neue", sans-serif'
            : 'Nunito, sans-serif';

        ctx.font = `${layer.isItalic ? 'italic ' : ''}${layer.isBold ? 'bold ' : 'normal '}${layer.fontSize}px ${fontFace}`;

        let textX = layer.x + layer.width / 2;
        if (layer.align === 'left') textX = layer.x + 12;
        if (layer.align === 'right') textX = layer.x + layer.width - 12;

        ctx.fillText(layer.content, textX, layer.y + layer.height / 2);
      } else if (layer.type === 'text') {
        ctx.fillStyle = '#000000';
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'top';

        const fontFace =
          layer.fontFamily === 'mono'
            ? '"JetBrains Mono", monospace'
            : layer.fontFamily === 'bebas'
            ? '"Bebas Neue", sans-serif'
            : 'Nunito, sans-serif';

        ctx.font = `${layer.isItalic ? 'italic ' : ''}${layer.isBold ? 'bold ' : 'normal '}${layer.fontSize}px ${fontFace}`;

        const lines = layer.content.split('\n');
        const lineSpacing = Math.round(layer.fontSize * 1.35);

        let currentY = layer.y;
        for (const line of lines) {
          let textX = layer.x;
          if (layer.align === 'center') textX = layer.x + layer.width / 2;
          if (layer.align === 'right') textX = layer.x + layer.width;

          ctx.fillText(line, textX, currentY);
          currentY += lineSpacing;
        }
      } else if (layer.type === 'line') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = layer.borderWidth || 1;
        if (layer.isDashed) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(layer.x, layer.y);
        ctx.lineTo(layer.x + layer.width, layer.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (layer.type === 'box') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = layer.borderWidth || 2;
        if (layer.isDashed) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        ctx.setLineDash([]);
      } else if (layer.type === 'qrcode' && layer.content.trim()) {
        try {
          const qrSize = Math.max(40, Math.min(layer.width, layer.height));
          const qrDataUrl = await QRCode.toDataURL(layer.content, {
            width: qrSize,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M'
          });

          if (isCancelled && isCancelled()) return;

          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, layer.x, layer.y, qrSize, qrSize);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = qrDataUrl;
          });
        } catch (e) {
          console.warn('Erro ao desenhar QR code no designer:', e);
        }
      }
    }

    if (isCancelled && isCancelled()) return;

    // Copia para o canvas interativo local de edição
    if (interactiveCanvasRef.current) {
      const iCanvas = interactiveCanvasRef.current;
      if (iCanvas.width !== W) iCanvas.width = W;
      if (iCanvas.height !== H) iCanvas.height = H;
      const iCtx = iCanvas.getContext('2d');
      if (iCtx) {
        iCtx.clearRect(0, 0, W, H);
        iCtx.drawImage(tempCanvas, 0, 0);

        // Guia sutil da bobina de 55mm (se ativa ou como referência)
        if (paperWidth === '55mm') {
          // 55mm = ~360px úteis centralizados (12px de cada lado)
          iCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          iCtx.setLineDash([3, 3]);
          iCtx.lineWidth = 1;
          iCtx.beginPath();
          iCtx.moveTo(12, 0);
          iCtx.lineTo(12, H);
          iCtx.moveTo(W - 12, 0);
          iCtx.lineTo(W - 12, H);
          iCtx.stroke();
          iCtx.setLineDash([]);
        }

        // Bounding box da camada selecionada
        if (selectedLayerId) {
          const sel = layers.find((l) => l.id === selectedLayerId);
          if (sel) {
            iCtx.strokeStyle = '#2563eb';
            iCtx.lineWidth = 2;
            iCtx.setLineDash([4, 2]);
            iCtx.strokeRect(sel.x - 2, sel.y - 2, sel.width + 4, sel.height + 4);
            iCtx.setLineDash([]);

            // Cantos de destaque
            iCtx.fillStyle = '#2563eb';
            const s = 6;
            iCtx.fillRect(sel.x - 2 - s / 2, sel.y - 2 - s / 2, s, s);
            iCtx.fillRect(sel.x + sel.width + 2 - s / 2, sel.y - 2 - s / 2, s, s);
            iCtx.fillRect(sel.x - 2 - s / 2, sel.y + sel.height + 2 - s / 2, s, s);
            iCtx.fillRect(sel.x + sel.width + 2 - s / 2, sel.y + sel.height + 2 - s / 2, s, s);
          }
        }
      }
    }

    // Copia para o canvas principal compartilhado da bobina
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
  }, [canvasRef, setCanvasHeight, canvasH, layers, selectedLayerId, paperWidth]);

  useEffect(() => {
    let isCancelled = false;
    renderMasterCanvas(() => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [renderMasterCanvas]);

  // Manipulação de Mouse / Touch para Arrasto Direto no Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = interactiveCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 384 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    // Procura a camada clicada (da última desenhada para a primeira)
    const clickedLayer = [...layers].reverse().find((l) => {
      return (
        clickX >= l.x &&
        clickX <= l.x + l.width &&
        clickY >= l.y &&
        clickY <= l.y + l.height
      );
    });

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: clickX,
        mouseY: clickY,
        initialX: clickedLayer.x,
        initialY: clickedLayer.y
      };
    } else {
      setSelectedLayerId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayerId || !dragStartRef.current) return;
    const canvas = interactiveCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 384 / rect.width;
    const curX = (e.clientX - rect.left) * scale;
    const curY = (e.clientY - rect.top) * scale;

    const deltaX = Math.round(curX - dragStartRef.current.mouseX);
    const deltaY = Math.round(curY - dragStartRef.current.mouseY);

    const sel = layers.find((l) => l.id === selectedLayerId);
    if (!sel) return;

    // Limites de 0 a 384 e 0 a canvasH
    const newX = Math.max(0, Math.min(384 - sel.width, dragStartRef.current.initialX + deltaX));
    const newY = Math.max(0, Math.min(canvasH - sel.height, dragStartRef.current.initialY + deltaY));

    updateLayer(selectedLayerId, { x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div className="space-y-4">
      {/* 1 · Escolha do Papel e Altura */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-amber-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              1
            </span>
            <span>Tipo de Papel & Modelos Prontos</span>
          </span>

          <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200">
            {(['58mm', '55mm'] as PaperWidth[]).map((w) => (
              <button
                key={w}
                onClick={() => setPaperWidth(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  paperWidth === w
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Modelos rápidos */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Modelos:
          </span>
          <button
            onClick={() => loadTemplate('preco')}
            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition active:scale-95"
          >
            🏷️ Etiqueta de Preço
          </button>
          <button
            onClick={() => loadTemplate('destinatario')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition active:scale-95"
          >
            📦 Destinatário / Envio
          </button>
        </div>
      </div>

      {/* 2 · Canvas Visual Interativo com Drag & Drop */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-indigo-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
              2
            </span>
            <span>Canvas com Edição Visual Livre</span>
          </span>
          <span className="text-[11px] text-indigo-600 font-mono font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            384 × {canvasH}px
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          💡 <strong>Arraste qualquer elemento diretamente no canvas</strong> com o mouse ou toque para posicionar exatamente onde desejar!
        </p>

        {/* Área Interativa com Borda de Recorte */}
        <div className="w-full flex justify-center bg-slate-100/80 p-3 rounded-2xl border border-dashed border-indigo-200 overflow-hidden select-none">
          <canvas
            ref={interactiveCanvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="bg-white shadow-receipt cursor-grab active:cursor-grabbing block rounded-[2px]"
            style={{
              width: '100%',
              maxWidth: '384px',
              height: 'auto',
              imageRendering: 'pixelated'
            }}
          />
        </div>

        {/* Barra de Adição de Camadas */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-extrabold text-slate-700 mr-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-indigo-600" /> Inserir:
          </span>
          <button
            onClick={() => addLayer('text')}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1 transition active:scale-95"
          >
            <Type className="w-3.5 h-3.5" /> Texto
          </button>
          <button
            onClick={() => addLayer('banner')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-xs"
          >
            Tarja Destaque
          </button>
          <button
            onClick={() => addLayer('qrcode')}
            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1 transition active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" /> QR Code
          </button>
          <button
            onClick={() => addLayer('line')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" /> Linha
          </button>
          <button
            onClick={() => addLayer('box')}
            className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold flex items-center gap-1 transition active:scale-95"
          >
            <Square className="w-3.5 h-3.5" /> Caixa
          </button>
        </div>
      </div>

      {/* 3 · Controles e Propriedades da Camada Selecionada */}
      {selectedLayer ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-card space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center text-[10px] font-mono shadow-sm">
                3
              </span>
              <span>Propriedades do Elemento: {selectedLayer.type.toUpperCase()}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => duplicateLayer(selectedLayer)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Duplicar"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeLayer(selectedLayer.id)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conteúdo de Texto ou QR */}
          {(selectedLayer.type === 'text' || selectedLayer.type === 'banner' || selectedLayer.type === 'qrcode') && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">
                {selectedLayer.type === 'qrcode' ? 'Link / Texto do QR Code:' : 'Texto:'}
              </label>
              {selectedLayer.type === 'text' ? (
                <textarea
                  rows={3}
                  value={selectedLayer.content}
                  onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-blue-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              ) : (
                <input
                  type="text"
                  value={selectedLayer.content}
                  onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                  className="w-full bg-[#faf9f6] border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                />
              )}
            </div>
          )}

          {/* Posição X e Y com Ajuste Fino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            {/* Eixo X */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Move className="w-3 h-3 text-blue-500" /> Posição X:
                </span>
                <span className="font-mono text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {selectedLayer.x}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={384 - selectedLayer.width}
                value={selectedLayer.x}
                onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => updateLayer(selectedLayer.id, { x: 0 })}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400"
                >
                  Borda Esquerda (0)
                </button>
                <button
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      x: Math.round((384 - selectedLayer.width) / 2)
                    })
                  }
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400"
                >
                  Centralizar
                </button>
                <button
                  onClick={() =>
                    updateLayer(selectedLayer.id, {
                      x: 384 - selectedLayer.width
                    })
                  }
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600 hover:border-blue-400"
                >
                  Borda Direita
                </button>
              </div>
            </div>

            {/* Eixo Y */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Move className="w-3 h-3 text-indigo-500" /> Posição Y:
                </span>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {selectedLayer.y}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={canvasH - selectedLayer.height}
                value={selectedLayer.y}
                onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex items-center gap-1 pt-1">
                <button
                  onClick={() => updateLayer(selectedLayer.id, { y: Math.max(0, selectedLayer.y - 10) })}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600"
                >
                  ▲ -10px
                </button>
                <button
                  onClick={() => updateLayer(selectedLayer.id, { y: Math.min(canvasH - selectedLayer.height, selectedLayer.y + 10) })}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-600"
                >
                  ▼ +10px
                </button>
              </div>
            </div>
          </div>

          {/* Tamanho da Fonte (para texto ou banner) */}
          {(selectedLayer.type === 'text' || selectedLayer.type === 'banner') && (
            <div className="space-y-2 bg-blue-50/70 p-3 rounded-2xl border border-blue-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tamanho da Fonte</span>
                </span>
                <span className="font-mono text-xs font-black bg-white px-2.5 py-0.5 rounded-lg border border-blue-300 text-blue-800">
                  {selectedLayer.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={54}
                step={1}
                value={selectedLayer.fontSize}
                onChange={(e) => {
                  const fs = Number(e.target.value);
                  updateLayer(selectedLayer.id, {
                    fontSize: fs,
                    height: selectedLayer.type === 'banner' ? fs + 18 : Math.max(30, fs * 1.5)
                  });
                }}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}

          {/* Largura da Camada */}
          <div className="space-y-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700">Largura do Bloco:</span>
              <span className="font-mono text-xs font-bold text-slate-700">{selectedLayer.width}px</span>
            </div>
            <input
              type="range"
              min={30}
              max={384}
              value={selectedLayer.width}
              onChange={(e) => updateLayer(selectedLayer.id, { width: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
            <div className="flex items-center gap-2 pt-1 text-[10px]">
              <button
                onClick={() => updateLayer(selectedLayer.id, { x: 0, width: 384 })}
                className="px-2 py-0.5 font-bold bg-white border border-slate-200 rounded text-slate-700"
              >
                Largura Total (384px - Sangrado)
              </button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { x: 12, width: 360 })}
                className="px-2 py-0.5 font-bold bg-white border border-slate-200 rounded text-slate-700"
              >
                Ajuste 55mm (360px)
              </button>
            </div>
          </div>

          {/* Formatação e Estilos */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Alinhamento */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => updateLayer(selectedLayer.id, { align: 'left' })}
                className={`p-1.5 rounded-lg ${selectedLayer.align === 'left' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { align: 'center' })}
                className={`p-1.5 rounded-lg ${selectedLayer.align === 'center' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { align: 'right' })}
                className={`p-1.5 rounded-lg ${selectedLayer.align === 'right' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Estilo de Fonte */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['sans', 'mono', 'bebas'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => updateLayer(selectedLayer.id, { fontFamily: font })}
                  className={`px-2 py-1 rounded-lg font-bold capitalize ${
                    selectedLayer.fontFamily === font ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => updateLayer(selectedLayer.id, { isBold: !selectedLayer.isBold })}
                className={`p-1.5 rounded-xl border ${
                  selectedLayer.isBold ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => updateLayer(selectedLayer.id, { isItalic: !selectedLayer.isItalic })}
                className={`p-1.5 rounded-xl border ${
                  selectedLayer.isItalic ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
          👆 Clique em qualquer elemento no canvas acima para editar sua posição, tamanho ou estilo.
        </div>
      )}

      {/* 4 · Altura da Bobina */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-card space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Comprimento / Altura da Bobina</span>
          </span>
          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {canvasH}px (~{Math.round(canvasH / 8)} mm)
          </span>
        </div>
        <input
          type="range"
          min={180}
          max={600}
          step={20}
          value={canvasH}
          onChange={(e) => setCanvasH(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
        />
      </div>
    </div>
  );
};
