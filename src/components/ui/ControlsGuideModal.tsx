import React from 'react';
import { X, Keyboard, ArrowRight, Zap, Target, Gauge, Camera, Trophy, Eye } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-amber-500/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-4 flex items-center justify-between text-slate-950 font-black">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-6 h-6" />
            <span className="text-base uppercase tracking-wider">
              KEYBOARD CONTROLS & GAMEPLAY GUIDE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-slate-950 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-200">
          {/* Batting Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span>🏏</span> Batting Controls
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-300 block">Move Left &amp; Right</span>
                  <span className="text-[10px] text-slate-400">Shuffle across batting crease (Off/Leg)</span>
                </div>
                <div className="flex gap-1 font-mono font-bold">
                  <kbd className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/40">A / D</kbd>
                  <kbd className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/40">← / →</kbd>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Time &amp; Hit Shot</span>
                  <span className="text-[10px] text-slate-400">Press in sweet spot or tap screen</span>
                </div>
                <kbd className="bg-emerald-500 text-slate-950 font-mono font-black px-3 py-1 rounded shadow">
                  SPACEBAR / TAP
                </kbd>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Toggle Loft (Six Mode)</span>
                  <span className="text-[10px] text-slate-400">Switch between Ground & Six-Hitter Loft</span>
                </div>
                <kbd className="bg-purple-700 text-white font-mono font-bold px-2.5 py-1 rounded">
                  L / SHIFT
                </kbd>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Special Strokes</span>
                  <span className="text-[10px] text-slate-400">Helicopter, Dilscoop, Late Cut</span>
                </div>
                <div className="flex gap-1 font-mono font-bold">
                  <kbd className="bg-slate-800 px-1.5 py-1 rounded text-amber-300">E</kbd>
                  <kbd className="bg-slate-800 px-1.5 py-1 rounded text-amber-300">Z</kbd>
                  <kbd className="bg-slate-800 px-1.5 py-1 rounded text-amber-300">C</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Bowling Section */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span>⚡</span> Bowling Controls
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Move Pitch Target Spot</span>
                  <span className="text-[10px] text-slate-400">Yorker, Full, Good Length, Bouncer</span>
                </div>
                <div className="flex gap-1 font-mono font-bold">
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">W/A/S/D</kbd>
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">Arrows</kbd>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Delivery Type</span>
                  <span className="text-[10px] text-slate-400">1: Fast, 2: Outswing, 3: Inswing, 4: Yorker...</span>
                </div>
                <kbd className="bg-sky-600 text-white font-mono font-bold px-2.5 py-1 rounded">
                  1 - 8
                </kbd>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Adjust Bowling Pace</span>
                  <span className="text-[10px] text-slate-400">Speed range 90 - 152 km/h</span>
                </div>
                <div className="flex gap-1 font-mono font-bold">
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">-</kbd>
                  <kbd className="bg-slate-800 px-2 py-1 rounded text-white border border-slate-700">+</kbd>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Bowl Delivery</span>
                  <span className="text-[10px] text-slate-400">Start bowler run-up & release</span>
                </div>
                <kbd className="bg-red-600 text-white font-mono font-black px-3 py-1 rounded shadow">
                  SPACEBAR
                </kbd>
              </div>
            </div>
          </div>

          {/* System & Camera Shortcuts */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span>🎮</span> System & 3D Camera Controls
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">C</kbd>
                <span className="text-[11px] font-bold text-slate-300">Cycle 3D Camera</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">B</kbd>
                <span className="text-[11px] font-bold text-slate-300">Bat / Bowl Role</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">R</kbd>
                <span className="text-[11px] font-bold text-slate-300">DRS Hawk-Eye</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">TAB</kbd>
                <span className="text-[11px] font-bold text-slate-300">Scorecard</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">X</kbd>
                <span className="text-[11px] font-bold text-slate-300">Weather & Time</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">T</kbd>
                <span className="text-[11px] font-bold text-slate-300">Coin Toss</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center text-center gap-1">
                <kbd className="bg-slate-800 px-2 py-1 rounded text-white font-mono font-bold">M</kbd>
                <span className="text-[11px] font-bold text-slate-300">Audio Mute</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex flex-col items-center text-center gap-1">
                <kbd className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded font-mono font-bold border border-amber-500/40">U</kbd>
                <span className="text-[11px] font-bold text-amber-300">Unity C# Scripts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
