// Biblioteca de desenhos line-art de contorno para colorir em papel térmico 384px

export interface ColoringDesign {
  id: string;
  title: string;
  category: 'animais' | 'fantasia' | 'natureza' | 'arte' | 'veículos';
  icon: string;
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void;
}

export const COLORING_DESIGNS: ColoringDesign[] = [
  {
    id: 'gatinho',
    title: 'Gatinho Fofo',
    category: 'animais',
    icon: '🐱',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 200;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Corpo
      ctx.beginPath();
      ctx.ellipse(cx, cy + 90, 75, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orelhas
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy - 35);
      ctx.lineTo(cx - 70, cy - 95);
      ctx.lineTo(cx - 15, cy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 50, cy - 35);
      ctx.lineTo(cx + 70, cy - 95);
      ctx.lineTo(cx + 15, cy - 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Interior das orelhas
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 42, cy - 38);
      ctx.lineTo(cx - 58, cy - 80);
      ctx.lineTo(cx - 20, cy - 55);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 42, cy - 38);
      ctx.lineTo(cx + 58, cy - 80);
      ctx.lineTo(cx + 20, cy - 55);
      ctx.stroke();

      // Olhos grandes para colorir
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx - 26, cy - 8, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 26, cy - 8, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Pupilas
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 23, cy - 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 23, cy - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Focinho e Boca
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 12);
      ctx.lineTo(cx + 6, cy + 12);
      ctx.lineTo(cx, cy + 18);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 18);
      ctx.lineTo(cx, cy + 26);
      ctx.moveTo(cx, cy + 26);
      ctx.quadraticCurveTo(cx - 12, cy + 34, cx - 18, cy + 24);
      ctx.moveTo(cx, cy + 26);
      ctx.quadraticCurveTo(cx + 12, cy + 34, cx + 18, cy + 24);
      ctx.stroke();

      // Bigodes
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 35, cy + 15);
      ctx.lineTo(cx - 85, cy + 8);
      ctx.moveTo(cx - 35, cy + 22);
      ctx.lineTo(cx - 88, cy + 24);

      ctx.moveTo(cx + 35, cy + 15);
      ctx.lineTo(cx + 85, cy + 8);
      ctx.moveTo(cx + 35, cy + 22);
      ctx.lineTo(cx + 88, cy + 24);
      ctx.stroke();

      // Patinhas
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx - 30, cy + 128, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 30, cy + 128, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Novelo de lã
      const ballX = cx + 90;
      const ballY = cy + 115;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ballX - 4, ballY - 2, 16, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ballX + 4, ballY + 4, 14, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
    }
  },
  {
    id: 'cachorrinho',
    title: 'Cachorrinho Feliz',
    category: 'animais',
    icon: '🐶',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 195;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Corpo
      ctx.beginPath();
      ctx.ellipse(cx, cy + 95, 75, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça
      ctx.beginPath();
      ctx.ellipse(cx, cy, 65, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orelhas caídas
      ctx.beginPath();
      ctx.ellipse(cx - 65, cy - 5, 22, 45, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx + 65, cy - 5, 22, 45, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Olhos grandes
      ctx.beginPath();
      ctx.arc(cx - 24, cy - 10, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 24, cy - 10, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 22, cy - 9, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 22, cy - 9, 6, 0, Math.PI * 2);
      ctx.fill();

      // Focinho
      ctx.beginPath();
      ctx.ellipse(cx, cy + 18, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Boca com língua feliz
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 26);
      ctx.lineTo(cx, cy + 34);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy + 34, 18, 0, Math.PI);
      ctx.stroke();

      // Língua
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + 42, 10, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Ossinho no chão
      const boneX = cx - 75;
      const boneY = cy + 125;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(boneX - 18, boneY - 4, 36, 8);
      ctx.arc(boneX - 18, boneY - 6, 6, 0, Math.PI * 2);
      ctx.arc(boneX - 18, boneY + 6, 6, 0, Math.PI * 2);
      ctx.arc(boneX + 18, boneY - 6, 6, 0, Math.PI * 2);
      ctx.arc(boneX + 18, boneY + 6, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  {
    id: 'foguete',
    title: 'Foguete no Espaço',
    category: 'fantasia',
    icon: '🚀',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 200;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Corpo do Foguete
      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.bezierCurveTo(cx + 55, cy - 40, cx + 55, cy + 50, cx + 45, cy + 70);
      ctx.lineTo(cx - 45, cy + 70);
      ctx.bezierCurveTo(cx - 55, cy + 50, cx - 55, cy - 40, cx, cy - 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bico
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 60);
      ctx.quadraticCurveTo(cx, cy - 70, cx + 30, cy - 60);
      ctx.stroke();

      // Janela redonda
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Asas laterais
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy + 10);
      ctx.lineTo(cx - 80, cy + 75);
      ctx.lineTo(cx - 45, cy + 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 45, cy + 10);
      ctx.lineTo(cx + 80, cy + 75);
      ctx.lineTo(cx + 45, cy + 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fogo da turbina
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy + 70);
      ctx.lineTo(cx - 35, cy + 115);
      ctx.lineTo(cx, cy + 95);
      ctx.lineTo(cx + 35, cy + 115);
      ctx.lineTo(cx + 25, cy + 70);
      ctx.stroke();

      // Planeta com anel
      const px = cx - 105;
      const py = cy - 60;
      ctx.beginPath();
      ctx.arc(px, py, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(px, py, 35, 10, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Estrelas brilhantes
      const stars = [
        [cx + 100, cy - 80],
        [cx + 115, cy + 40],
        [cx - 95, cy + 85],
        [cx + 75, cy + 100]
      ];
      stars.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  },
  {
    id: 'dinossauro',
    title: 'Dinossauro Baby',
    category: 'animais',
    icon: '🦖',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 200;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Corpo gordinho
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 40, 65, 75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça arredondada
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy - 50, 55, 45, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Olho expressivo
      ctx.beginPath();
      ctx.arc(cx + 35, cy - 60, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx + 37, cy - 60, 6, 0, Math.PI * 2);
      ctx.fill();

      // Sorriso amigável
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx + 45, cy - 35, 14, 0, Math.PI * 0.7);
      ctx.stroke();

      // Espinhos dorsais
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const sx = cx - 35 - i * 18;
        const sy = cy - 20 + i * 26;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 16, sy - 8);
        ctx.lineTo(sx - 4, sy + 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Patinha dianteira
      ctx.beginPath();
      ctx.ellipse(cx + 30, cy + 20, 16, 9, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pernas fortes
      ctx.beginPath();
      ctx.ellipse(cx - 30, cy + 105, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 15, cy + 105, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rabo curvado
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 60);
      ctx.quadraticCurveTo(cx - 125, cy + 65, cx - 110, cy + 20);
      ctx.quadraticCurveTo(cx - 100, cy + 45, cx - 60, cy + 90);
      ctx.fill();
      ctx.stroke();
    }
  },
  {
    id: 'fundo-do-mar',
    title: 'Polvo & Fundo do Mar',
    category: 'natureza',
    icon: '🐙',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 180;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Cabeça do polvo
      ctx.beginPath();
      ctx.arc(cx, cy, 58, Math.PI * 0.8, Math.PI * 2.2);
      ctx.quadraticCurveTo(cx, cy + 50, cx - 40, cy + 40);
      ctx.fill();
      ctx.stroke();

      // Olhos
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 20, cy - 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 18, cy - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 18, cy - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Boca
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy + 16, 10, 0, Math.PI);
      ctx.stroke();

      // Tentáculos ondulados
      ctx.fillStyle = '#ffffff';
      const tentacleAngles = [-50, -25, 0, 25, 50];
      tentacleAngles.forEach((offset, idx) => {
        const tx = cx + offset;
        const ty = cy + 42;
        ctx.beginPath();
        ctx.moveTo(tx - 10, ty);
        ctx.bezierCurveTo(tx - 20, ty + 40, tx + 20, ty + 70, tx + (idx % 2 === 0 ? -15 : 15), ty + 95);
        ctx.bezierCurveTo(tx + 25, ty + 65, tx - 10, ty + 35, tx + 10, ty);
        ctx.fill();
        ctx.stroke();
      });

      // Bolhinhas de ar
      const bubbles = [
        [cx - 85, cy - 50, 10],
        [cx - 75, cy - 80, 7],
        [cx + 80, cy - 40, 12],
        [cx + 90, cy - 75, 8]
      ];
      bubbles.forEach(([bx, by, br]) => {
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.stroke();
      });
    }
  },
  {
    id: 'borboleta-flor',
    title: 'Borboleta & Flores',
    category: 'natureza',
    icon: '🌸',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 165;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Corpo da borboleta
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça
      ctx.beginPath();
      ctx.arc(cx, cy - 42, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Antenas
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 52);
      ctx.quadraticCurveTo(cx - 24, cy - 75, cx - 22, cy - 80);
      ctx.moveTo(cx + 4, cy - 52);
      ctx.quadraticCurveTo(cx + 24, cy - 75, cx + 22, cy - 80);
      ctx.stroke();

      // Asas superiores
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 15);
      ctx.bezierCurveTo(cx - 75, cy - 90, cx - 125, cy - 30, cx - 80, cy + 10);
      ctx.bezierCurveTo(cx - 45, cy + 18, cx - 15, cy + 12, cx - 6, cy + 15);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 15);
      ctx.bezierCurveTo(cx + 75, cy - 90, cx + 125, cy - 30, cx + 80, cy + 10);
      ctx.bezierCurveTo(cx + 45, cy + 18, cx + 15, cy + 12, cx + 6, cy + 15);
      ctx.fill();
      ctx.stroke();

      // Asas inferiores
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 15);
      ctx.bezierCurveTo(cx - 85, cy + 30, cx - 75, cy + 75, cx - 35, cy + 65);
      ctx.bezierCurveTo(cx - 15, cy + 50, cx - 10, cy + 35, cx - 6, cy + 30);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 15);
      ctx.bezierCurveTo(cx + 85, cy + 30, cx + 75, cy + 75, cx + 35, cy + 65);
      ctx.bezierCurveTo(cx + 15, cy + 50, cx + 10, cy + 35, cx + 6, cy + 30);
      ctx.fill();
      ctx.stroke();

      // Detalhes internos das asas para colorir
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx - 55, cy - 25, 20, 14, -0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 55, cy - 25, 20, 14, 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Flores no chão
      const flowerY = cy + 125;
      const flowerX = cx;

      // Miolo da flor
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(flowerX, flowerY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pétalas da flor
      for (let p = 0; p < 6; p++) {
        const ang = (Math.PI * 2 / 6) * p;
        const px = flowerX + Math.cos(ang) * 35;
        const py = flowerY + Math.sin(ang) * 35;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  },
  {
    id: 'panda',
    title: 'Ursinho Panda',
    category: 'animais',
    icon: '🐼',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 205;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Bambu ao lado
      const bx = cx - 110;
      ctx.lineWidth = 2.5;
      for (let b = 0; b < 3; b++) {
        const by = cy - 60 + b * 60;
        ctx.beginPath();
        ctx.rect(bx, by, 14, 55);
        ctx.stroke();
        // Folhas do bambu
        ctx.beginPath();
        ctx.ellipse(bx - 12, by + 15, 14, 6, -0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(bx + 26, by + 30, 14, 6, 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Corpo fofinho
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 90, 78, 62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Barriguinha branca interna
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 95, 52, 42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Patas inferiores
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx - 56, cy + 130, 24, 18, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 56, cy + 130, 24, 18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Almofadas das patas (para colorir)
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx - 56, cy + 130, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 56, cy + 130, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Patas superiores (braços)
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx - 70, cy + 60, 22, 16, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 70, cy + 60, 22, 16, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cabeça redonda
      ctx.beginPath();
      ctx.arc(cx, cy, 68, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Orelhas pretas com contorno largo
      ctx.beginPath();
      ctx.arc(cx - 54, cy - 54, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 54, cy - 54, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Interior da orelha para colorir
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 54, cy - 54, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 54, cy - 54, 13, 0, Math.PI * 2);
      ctx.stroke();

      // Manchas dos olhos do Panda (grandes para colorir)
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx - 28, cy - 6, 20, 16, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 28, cy - 6, 20, 16, 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Olhos brilhantes
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 25, cy - 6, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 25, cy - 6, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 23, cy - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 23, cy - 6, 4, 0, Math.PI * 2);
      ctx.fill();

      // Focinho e Boca
      ctx.beginPath();
      ctx.ellipse(cx, cy + 18, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 24);
      ctx.lineTo(cx, cy + 32);
      ctx.moveTo(cx, cy + 32);
      ctx.quadraticCurveTo(cx - 14, cy + 42, cx - 18, cy + 30);
      ctx.moveTo(cx, cy + 32);
      ctx.quadraticCurveTo(cx + 14, cy + 42, cx + 18, cy + 30);
      ctx.stroke();

      // Bochechas fofas (círculos pontilhados)
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx - 46, cy + 16, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 46, cy + 16, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  {
    id: 'carrinho',
    title: 'Carro Divertido',
    category: 'veículos',
    icon: '🚗',
    draw: (ctx, W) => {
      const cx = W / 2;
      const cy = 200;

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#ffffff';

      // Nuvens no céu
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 90, cy - 90, 16, 0, Math.PI * 2);
      ctx.arc(cx - 70, cy - 96, 20, 0, Math.PI * 2);
      ctx.arc(cx - 50, cy - 90, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Sol sorridente
      ctx.beginPath();
      ctx.arc(cx + 100, cy - 90, 20, 0, Math.PI * 2);
      ctx.stroke();
      // Raios do sol
      for (let r = 0; r < 8; r++) {
        const ang = (Math.PI * 2 / 8) * r;
        ctx.beginPath();
        ctx.moveTo(cx + 100 + Math.cos(ang) * 24, cy - 90 + Math.sin(ang) * 24);
        ctx.lineTo(cx + 100 + Math.cos(ang) * 32, cy - 90 + Math.sin(ang) * 32);
        ctx.stroke();
      }

      // Chão / Pista
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, cy + 85);
      ctx.lineTo(W - 20, cy + 85);
      ctx.stroke();

      // Linhas da pista
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(30, cy + 110);
      ctx.lineTo(W - 30, cy + 110);
      ctx.stroke();
      ctx.setLineDash([]);

      // Chassi / Corpo do Carro
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      // Inicia na frente
      ctx.moveTo(cx - 130, cy + 50);
      ctx.quadraticCurveTo(cx - 135, cy + 20, cx - 110, cy + 15);
      // Capô
      ctx.lineTo(cx - 50, cy + 12);
      // Pára-brisa
      ctx.quadraticCurveTo(cx - 30, cy - 45, cx + 10, cy - 50);
      // Teto
      ctx.lineTo(cx + 60, cy - 50);
      // Vidro traseiro
      ctx.quadraticCurveTo(cx + 100, cy - 35, cx + 115, cy + 15);
      // Traseira
      ctx.quadraticCurveTo(cx + 130, cy + 25, cx + 130, cy + 50);
      // Base inferior
      ctx.lineTo(cx - 130, cy + 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Janelas (para colorir)
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy + 8);
      ctx.lineTo(cx - 24, cy - 38);
      ctx.lineTo(cx + 8, cy - 38);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 16, cy + 8);
      ctx.lineTo(cx + 16, cy - 38);
      ctx.lineTo(cx + 56, cy - 38);
      ctx.quadraticCurveTo(cx + 85, cy - 25, cx + 96, cy + 8);
      ctx.closePath();
      ctx.stroke();

      // Farol dianteiro com feixes
      ctx.beginPath();
      ctx.ellipse(cx - 124, cy + 32, 10, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy + 26);
      ctx.lineTo(cx - 156, cy + 22);
      ctx.moveTo(cx - 140, cy + 34);
      ctx.lineTo(cx - 158, cy + 34);
      ctx.moveTo(cx - 140, cy + 42);
      ctx.lineTo(cx - 156, cy + 46);
      ctx.stroke();

      // Farol traseiro
      ctx.beginPath();
      ctx.ellipse(cx + 124, cy + 32, 7, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Maçanetas das portas
      ctx.beginPath();
      ctx.roundRect(cx - 10, cy + 16, 12, 5, 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(cx + 36, cy + 16, 12, 5, 2);
      ctx.stroke();

      // Rodas (2 grandes rodas com calotas para colorir)
      const wheelR = 30;
      const leftWx = cx - 72;
      const rightWx = cx + 72;
      const wheelY = cy + 55;

      // Recortes do para-lama
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(leftWx, wheelY, wheelR + 8, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightWx, wheelY, wheelR + 8, Math.PI, 0, false);
      ctx.stroke();

      // Pneu Esquerdo
      ctx.beginPath();
      ctx.arc(leftWx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Aro / Calota esquerda
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(leftWx, wheelY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(leftWx, wheelY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pneu Direito
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rightWx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Aro / Calota direita
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rightWx, wheelY, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rightWx, wheelY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
];
