import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  PRINTER_SERVICE_UUIDS,
  PRINTER_CHARACTERISTIC_UUIDS,
  buildInitPackets,
  buildFooterPackets,
  createRowPacket,
  canvasTo1BitRows,
  buildFeedPackets,
  ThermalDensity
} from './printerProtocol';

export type PaperWidth = '58mm' | '55mm';

export interface PrinterContextType {
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isPrinting: boolean;
  deviceName: string | null;
  statusMessage: string;
  printProgress: number;
  density: ThermalDensity;
  setDensity: (density: ThermalDensity) => void;
  paperWidth: PaperWidth;
  setPaperWidth: (width: PaperWidth) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  printCanvas: (canvas: HTMLCanvasElement) => Promise<boolean>;
  feedPaper: (lines?: number) => Promise<boolean>;
  cancelPrint: () => void;
}

const PrinterContext = createContext<PrinterContextType | null>(null);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Pronto');
  const [printProgress, setPrintProgress] = useState<number>(0);
  const [density, setDensity] = useState<ThermalDensity>('normal');
  const [paperWidth, setPaperWidth] = useState<PaperWidth>('58mm');

  // Referências Bluetooth ativas
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const writeCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const cancelPrintRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      setIsSupported(false);
      setStatusMessage('Web Bluetooth não suportado neste navegador.');
    }
  }, []);

  const handleDisconnectEvent = useCallback(() => {
    setIsConnected(false);
    setDeviceName(null);
    writeCharRef.current = null;
    deviceRef.current = null;
    setStatusMessage('Impressora desconectada.');
  }, []);

  /**
   * Conecta à impressora BLE
   */
  const connect = async (): Promise<boolean> => {
    if (!navigator.bluetooth) {
      setStatusMessage('Web Bluetooth não é suportado pelo seu navegador (use Google Chrome ou Edge).');
      return false;
    }

    try {
      setIsConnecting(true);
      setStatusMessage('Buscando mini impressoras térmicas...');

      // Abre o diálogo nativo do navegador
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_UUIDS
      });

      setStatusMessage(`Conectando a "${device.name || 'Impressora'}"...`);

      device.addEventListener('gattserverdisconnected', handleDisconnectEvent);
      deviceRef.current = device;

      if (!device.gatt) {
        throw new Error('Servidor GATT não disponível.');
      }

      const server = await device.gatt.connect();

      // Procura o serviço primário compatível
      let writeChar: BluetoothRemoteGATTCharacteristic | null = null;

      for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          for (const charUuid of PRINTER_CHARACTERISTIC_UUIDS) {
            try {
              const char = await service.getCharacteristic(charUuid);
              if (char) {
                writeChar = char;
                break;
              }
            } catch {
              // Tenta próxima característica
            }
          }
          if (writeChar) break;

          // Se nenhuma das características conhecidas foi encontrada diretamente, lista todas
          const characteristics = await service.getCharacteristics();
          for (const c of characteristics) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              writeChar = c;
              break;
            }
          }
          if (writeChar) break;
        } catch {
          // Continua procurando nos outros UUIDs
        }
      }

      if (!writeChar) {
        throw new Error('Não foi possível encontrar a característica de escrita BLE da impressora.');
      }

      writeCharRef.current = writeChar;
      setIsConnected(true);
      setDeviceName(device.name || 'Mini Impressora BLE');
      setStatusMessage(`Conectado a ${device.name || 'Mini Impressora'}`);
      return true;
    } catch (error: unknown) {
      console.warn('Erro ao conectar Bluetooth:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('User cancelled')) {
        setStatusMessage('Busca cancelada pelo usuário.');
      } else {
        setStatusMessage(`Falha ao conectar: ${msg}`);
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Desconecta da impressora
   */
  const disconnect = () => {
    if (deviceRef.current && deviceRef.current.gatt && deviceRef.current.gatt.connected) {
      deviceRef.current.gatt.disconnect();
    }
    handleDisconnectEvent();
  };

  /**
   * Cancela a impressão em andamento
   */
  const cancelPrint = () => {
    cancelPrintRef.current = true;
    setStatusMessage('Cancelando impressão...');
  };

  /**
   * Envia um pacote de bytes para a característica BLE
   */
  const sendBytes = async (packet: Uint8Array): Promise<void> => {
    const char = writeCharRef.current;
    if (!char) throw new Error('Impressora desconectada');

    const bufferData = (packet.buffer.slice(packet.byteOffset, packet.byteOffset + packet.byteLength)) as ArrayBuffer;

    if (char.writeValueWithoutResponse) {
      await char.writeValueWithoutResponse(bufferData);
    } else {
      await char.writeValue(bufferData);
    }
  };

  /**
   * Executa a impressão do canvas 384px com controle de densidade e feedback de progresso
   */
  const printCanvas = async (canvas: HTMLCanvasElement): Promise<boolean> => {
    if (!writeCharRef.current || !isConnected) {
      const ok = await connect();
      if (!ok || !writeCharRef.current) return false;
    }

    try {
      setIsPrinting(true);
      setPrintProgress(0);
      cancelPrintRef.current = false;
      setStatusMessage('Preparando imagem...');

      // 1. Converte canvas 384px em linhas monocromáticas de 48 bytes
      const rows = canvasTo1BitRows(canvas);
      const totalRows = rows.length;

      // 2. Envia sequência de inicialização (com densidade configurada)
      setStatusMessage('Inicializando impressora...');
      const initPkts = buildInitPackets(density);
      for (const item of initPkts) {
        if (cancelPrintRef.current) throw new Error('Impressão cancelada');
        await sendBytes(item.packet);
        await delay(item.delayMs);
      }

      // 3. Envia linha por linha do bitmap
      setStatusMessage(`Imprimindo 0 de ${totalRows} linhas...`);
      for (let y = 0; y < totalRows; y++) {
        if (cancelPrintRef.current) {
          throw new Error('Impressão cancelada pelo usuário');
        }

        const rowPacket = createRowPacket(rows[y]);
        await sendBytes(rowPacket);
        await delay(15); // Delay crucial de 15ms entre linhas para resfriamento e sincronismo BLE

        if (y % 8 === 0 || y === totalRows - 1) {
          const pct = Math.round(((y + 1) / totalRows) * 100);
          setPrintProgress(pct);
          setStatusMessage(`Imprimindo... ${pct}% (${y + 1}/${totalRows})`);
        }
      }

      // 4. Envia sequência de encerramento e avanço de papel
      setStatusMessage('Finalizando corte...');
      const footPkts = buildFooterPackets();
      for (const item of footPkts) {
        await sendBytes(item.packet);
        await delay(item.delayMs);
      }

      setPrintProgress(100);
      setStatusMessage('Impressão concluída com sucesso!');
      setTimeout(() => {
        setStatusMessage('Pronto');
        setPrintProgress(0);
      }, 3000);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Erro de impressão: ${msg}`);
      return false;
    } finally {
      setIsPrinting(false);
      cancelPrintRef.current = false;
    }
  };

  /**
   * Avança papel sem imprimir (Feed)
   */
  const feedPaper = async (lines: number = 50): Promise<boolean> => {
    if (!writeCharRef.current || !isConnected) {
      const ok = await connect();
      if (!ok || !writeCharRef.current) return false;
    }

    try {
      setIsPrinting(true);
      setStatusMessage('Avançando papel...');
      const packets = buildFeedPackets(lines);
      for (const p of packets) {
        await sendBytes(p);
        await delay(12);
      }
      setStatusMessage('Papel avançado.');
      setTimeout(() => setStatusMessage('Pronto'), 2000);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Erro ao avançar papel: ${msg}`);
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <PrinterContext.Provider
      value={{
        isSupported,
        isConnected,
        isConnecting,
        isPrinting,
        deviceName,
        statusMessage,
        printProgress,
        density,
        setDensity,
        paperWidth,
        setPaperWidth,
        connect,
        disconnect,
        printCanvas,
        feedPaper,
        cancelPrint,
      }}
    >
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinter = (): PrinterContextType => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter deve ser usado dentro de um <PrinterProvider>');
  }
  return context;
};
