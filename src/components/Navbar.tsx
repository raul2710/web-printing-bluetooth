import React, { useState } from 'react';
import { usePrinter } from '../bluetooth/PrinterContext';
import {
  Bluetooth,
  ArrowDownCircle,
  Settings,
  Flame,
  ChevronLeft
} from 'lucide-react';
import { ThermalDensity } from '../bluetooth/printerProtocol';

interface NavbarProps {
  activeTool: string | null;
  onBackToMenu?: () => void;
  toolTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTool, onBackToMenu, toolTitle }) => {
  const {
    isSupported,
    isConnected,
    isConnecting,
    isPrinting,
    deviceName,
    density,
    setDensity,
    connect,
    disconnect,
    feedPaper
  } = usePrinter();

  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-rose-100/80 px-4 py-2.5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Logo ou Voltar */}
        <div className="flex items-center gap-3">
          {activeTool && onBackToMenu ? (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors py-1.5 px-3 rounded-full border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-rose-500" />
              <span>Voltar</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-orange-400 to-amber-300 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-rose-300">
                🖨️
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-800">
                  Mini<span className="bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">Print</span>
                </span>
                <span className="text-slate-300 text-xs hidden sm:inline">•</span>
                <span className="text-[11px] font-bold text-rose-500/90 hidden sm:inline bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  58mm Studio
                </span>
              </div>
            </div>
          )}

          {activeTool && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>/</span>
              <span className="text-slate-800 font-extrabold">{toolTitle}</span>
            </div>
          )}
        </div>

        {/* Lado Direito: Pílulas de Status e Controles */}
        <div className="flex items-center gap-2">
          {/* Tag de Papel */}
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold text-slate-600 bg-amber-50/80 border border-amber-200/80">
            📏 384 px · 58 mm
          </span>

          {/* Botão de Ajustes de Densidade */}
          <div className="relative">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="h-8 px-2.5 rounded-xl bg-orange-50/80 border border-orange-200 hover:border-orange-300 text-orange-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="Ajustes de Impressão"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span className="capitalize hidden sm:inline">{density}</span>
              <Settings className="w-3 h-3 text-orange-400 ml-0.5" />
            </button>

            {/* Menu Dropdown de Configurações */}
            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-64 bg-white rounded-2xl p-4 shadow-xl border border-rose-100 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Intensidade Térmica</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(
                      [
                        { id: 'suave', label: 'Suave' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'escuro', label: 'Escuro' },
                        { id: 'intenso', label: 'Intenso' },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDensity(d.id as ThermalDensity);
                          setShowSettings(false);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                          density === d.id
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Avanço de Papel */}
                  <button
                    onClick={() => {
                      feedPaper(60);
                      setShowSettings(false);
                    }}
                    disabled={isPrinting}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <ArrowDownCircle className="w-4 h-4 text-orange-500" />
                    <span>Avançar Papel (+60 linhas)</span>
                  </button>

                  {/* Desconectar */}
                  {isConnected && (
                    <button
                      onClick={() => {
                        disconnect();
                        setShowSettings(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition active:scale-95 border border-rose-200"
                    >
                      Desconectar Impressora
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Botão de Conexão BLE Colorido */}
          {!isSupported ? (
            <div className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
              Sem BLE
            </div>
          ) : isConnected ? (
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shadow-sm active:scale-95 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="max-w-[100px] truncate">
                {deviceName ? deviceName.replace(/^MiniPrint[-_]?/i, '') : 'Conectada'}
              </span>
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-sm shadow-rose-300 active:scale-95 transition disabled:opacity-60"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Buscando...' : 'Conectar'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
