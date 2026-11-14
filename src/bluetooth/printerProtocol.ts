/**
 * TermoPrint - Protocolo Web Bluetooth (BLE) para Mini Impressoras Térmicas 58mm
 * Compatível com SC03H, BQ95, MX06, GB01, Cat Printer e similares.
 *
 * Resolução da cabeça: 384 pontos de largura (48 bytes por linha).
 * Protocolo de pacotes 'Qx' (0x51 0x78) com checksum CRC8 e delimitador 0xFF.
 */

// Tabela de Lookup CRC8 (Polinômio 0x07 / CCITT)
export const CRC8_TABLE = [
  0x00,0x07,0x0e,0x09,0x1c,0x1b,0x12,0x15,0x38,0x3f,0x36,0x31,0x24,0x23,0x2a,0x2d,
  0x70,0x77,0x7e,0x79,0x6c,0x6b,0x62,0x65,0x48,0x4f,0x46,0x41,0x54,0x53,0x5a,0x5d,
  0xe0,0xe7,0xee,0xe9,0xfc,0xfb,0xf2,0xf5,0xd8,0xdf,0xd6,0xd1,0xc4,0xc3,0xca,0xcd,
  0x90,0x97,0x9e,0x99,0x8c,0x8b,0x82,0x85,0xa8,0xaf,0xa6,0xa1,0xb4,0xb3,0xba,0xbd,
  0xc7,0xc0,0xc9,0xce,0xdb,0xdc,0xd5,0xd2,0xff,0xf8,0xf1,0xf6,0xe3,0xe4,0xed,0xea,
  0xb7,0xb0,0xb9,0xbe,0xab,0xac,0xa5,0xa2,0x8f,0x88,0x81,0x86,0x93,0x94,0x9d,0x9a,
  0x27,0x20,0x29,0x2e,0x3b,0x3c,0x35,0x32,0x1f,0x18,0x11,0x16,0x03,0x04,0x0d,0x0a,
  0x57,0x50,0x59,0x5e,0x4b,0x4c,0x45,0x42,0x6f,0x68,0x61,0x66,0x73,0x74,0x7d,0x7a,
  0x89,0x8e,0x87,0x80,0x95,0x92,0x9b,0x9c,0xb1,0xb6,0xbf,0xb8,0xad,0xaa,0xa3,0xa4,
  0xf9,0xfe,0xf7,0xf0,0xe5,0xe2,0xeb,0xec,0xc1,0xc6,0xcf,0xc8,0xdd,0xda,0xd3,0xd4,
  0x69,0x6e,0x67,0x60,0x75,0x72,0x7b,0x7c,0x51,0x56,0x5f,0x58,0x4d,0x4a,0x43,0x44,
  0x19,0x1e,0x17,0x10,0x05,0x02,0x0b,0x0c,0x21,0x26,0x2f,0x28,0x3d,0x3a,0x33,0x34,
  0x4e,0x49,0x40,0x47,0x52,0x55,0x5c,0x5b,0x76,0x71,0x78,0x7f,0x6a,0x6d,0x64,0x63,
  0x3e,0x39,0x30,0x37,0x22,0x25,0x2c,0x2b,0x06,0x01,0x08,0x0f,0x1a,0x1d,0x14,0x13,
  0xae,0xa9,0xa0,0xa7,0xb2,0xb5,0xbc,0xbb,0x96,0x91,0x98,0x9f,0x8a,0x8d,0x84,0x83,
  0xde,0xd9,0xd0,0xd7,0xc2,0xc5,0xcc,0xcb,0xe6,0xe1,0xe8,0xef,0xfa,0xfd,0xf4,0xf3
];

/**
 * Calcula o checksum CRC8 de um payload de dados
 */
export function calculateCRC8(data: Uint8Array | number[]): number {
  let c = 0;
  for (let i = 0; i < data.length; i++) {
    c = CRC8_TABLE[(c ^ data[i]) & 0xFF];
  }
  return c & 0xFF;
}

/**
 * Monta um pacote de comando completo do protocolo 0x51 0x78 ('Qx')
 * Estrutura: [0x51, 0x78, CMD, 0x00, LEN_L, LEN_H, ...DADOS, CRC8, 0xFF]
 */
export function createPacket(cmd: number, dados: Uint8Array | number[]): Uint8Array {
  const payload = dados instanceof Uint8Array ? dados : new Uint8Array(dados);
  const len = payload.length;
  const lenLow = len & 0xFF;
  const lenHigh = (len >> 8) & 0xFF;
  const crc = calculateCRC8(payload);

  const packet = new Uint8Array(8 + len);
  packet[0] = 0x51; // 'Q'
  packet[1] = 0x78; // 'x'
  packet[2] = cmd;  // Comando
  packet[3] = 0x00; // Byte reservado
  packet[4] = lenLow;
  packet[5] = lenHigh;
  packet.set(payload, 6);
  packet[6 + len] = crc;
  packet[7 + len] = 0xFF; // Terminador

  return packet;
}

/**
 * Converte string hexadecimal para Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  const matches = clean.match(/../g) || [];
  return Uint8Array.from(matches.map(byte => parseInt(byte, 16)));
}

/**
 * Níveis de densidade/intensidade térmica
 */
export type ThermalDensity = 'suave' | 'normal' | 'escuro' | 'intenso';

export const DENSITY_VALUES: Record<ThermalDensity, number> = {
  suave: 0x19,   // 25 - mais claro, gasta menos bateria
  normal: 0x33,  // 51 - padrão de fábrica equilibrado
  escuro: 0x4D,  // 77 - contraste mais forte
  intenso: 0x66  // 102 - máximo para desenhos e QR Codes nítidos
};

/**
 * Sequência de inicialização da impressora antes de começar o bitmap
 */
export function buildInitPackets(density: ThermalDensity = 'normal'): { packet: Uint8Array; delayMs: number }[] {
  const densityByte = DENSITY_VALUES[density] || 0x33;
  return [
    { packet: createPacket(0xA3, [0x00]), delayMs: 100 },
    { packet: createPacket(0xA4, [densityByte]), delayMs: 25 },
    { packet: createPacket(0xA6, [0xAA, 0x55, 0x17, 0x38, 0x44, 0x5F, 0x5F, 0x5F, 0x44, 0x38, 0x2C]), delayMs: 20 },
    { packet: createPacket(0xAF, [0xE0, 0x2E]), delayMs: 20 },
    { packet: createPacket(0xBE, [0x00]), delayMs: 20 },
    { packet: createPacket(0xBD, [0x1E]), delayMs: 20 },
    { packet: createPacket(0xBF, [0x7F, 0x7F, 0x7F, 0x03]), delayMs: 10 },
    { packet: createPacket(0xBF, [0x7F, 0x7F, 0x7F, 0x03]), delayMs: 10 },
  ];
}

/**
 * Sequência de finalização após a impressão do bitmap
 */
export function buildFooterPackets(): { packet: Uint8Array; delayMs: number }[] {
  return [
    { packet: createPacket(0xBF, [0x7F, 0x7F, 0x7F, 0x03]), delayMs: 10 },
    { packet: createPacket(0xBD, [0x19]), delayMs: 10 },
    { packet: createPacket(0xA1, [0x30, 0x00]), delayMs: 20 },
    { packet: createPacket(0xA1, [0x30, 0x00]), delayMs: 20 },
    { packet: createPacket(0xBD, [0x19]), delayMs: 10 },
    { packet: createPacket(0xA6, [0xAA, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17]), delayMs: 20 },
    { packet: createPacket(0xA3, [0x00]), delayMs: 20 },
  ];
}

/**
 * Cria pacote de impressão de linha de bitmap monocromático (Comando 0xA2)
 * payload deve ter exatamente 48 bytes (384 pixels / 8)
 */
export function createRowPacket(rowBytes: Uint8Array): Uint8Array {
  return createPacket(0xA2, rowBytes);
}

/**
 * Converte um HTMLCanvasElement com largura de 384px para um array de linhas binárias (48 bytes por linha)
 * Bit 1 = Queima o ponto térmico (preto)
 * Bit 0 = Ponto frio / em branco (branco)
 * Mapeamento: LSB-first: row[Math.floor(x / 8)] |= (1 << (x % 8))
 */
export function canvasTo1BitRows(canvas: HTMLCanvasElement): Uint8Array[] {
  const width = canvas.width;
  const height = canvas.height;
  if (width !== 384) {
    throw new Error(`A largura do canvas para mini impressora deve ser 384px (recebido: ${width}px)`);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível obter o contexto 2D do canvas');

  const imgData = ctx.getImageData(0, 0, width, height);
  const px = imgData.data;
  const bytesPerRow = width / 8; // 48 bytes
  const rows: Uint8Array[] = new Array(height);

  for (let y = 0; y < height; y++) {
    const row = new Uint8Array(bytesPerRow);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Considera a luminância perceptual ou canal R (em monocromático R=G=B)
      const r = px[idx];
      const g = px[idx + 1];
      const b = px[idx + 2];
      const a = px[idx + 3];

      // Pixel transparente vira branco
      if (a < 64) continue;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 128) {
        // Ponto preto -> Aciona a agulha térmica
        const byteIndex = Math.floor(x / 8);
        const bitOffset = x % 8;
        row[byteIndex] |= (1 << bitOffset);
      }
    }
    rows[y] = row;
  }

  return rows;
}

/**
 * Gera pacotes de avanço em branco de papel (feed)
 */
export function buildFeedPackets(lines: number = 40): Uint8Array[] {
  const blankRow = new Uint8Array(48);
  const packets: Uint8Array[] = [];
  for (let i = 0; i < lines; i++) {
    packets.push(createPacket(0xA2, blankRow));
  }
  return packets;
}

/**
 * Lista de UUIDs de serviços BLE comuns em mini impressoras térmicas chinesas
 */
export const PRINTER_SERVICE_UUIDS = [
  '0000ae30-0000-1000-8000-00805f9b34fb', // SC03H, BQ95, MX06, GB01, etc.
  '0000ff00-0000-1000-8000-00805f9b34fb', // Peripage / Cat clones
  '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent / Jerry chipset
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Mini thermal BLE alt
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC transparent UART
];

/**
 * Lista de UUIDs de características com permissão de escrita
 */
export const PRINTER_CHARACTERISTIC_UUIDS = [
  '0000ae01-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
];
