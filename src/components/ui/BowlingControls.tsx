import React, { useEffect } from 'react';
import { DeliveryType } from '../../types/cricket';
import { Gauge, Wind, Play, Keyboard } from 'lucide-react';

interface BowlingControlsProps {
  selectedDelivery: DeliveryType;
  onSelectDelivery: (delivery: DeliveryType) => void;
  pitchX: number; // -1 to 1
  pitchZ: number; // -13.5 to -8.0
  onChangePitchSpot: (x: number, z: number) => void;
  speedKmh: number;
  onChangeSpeed: (speed: number) => void;
  onBowlDelivery: () => void;
  isBowlingActive: boolean;
}

export const BowlingControls: React.FC<BowlingControlsProps> = ({
  selectedDelivery,
  onSelectDelivery,
  pitchX,
  pitchZ,
  onChangePitchSpot,
  speedKmh,
  onChangeSpeed,
  onBowlDelivery,
  isBowlingActive,
}) => {
  const deliveries: { id: DeliveryType; label: string; desc: string; key: string }[] = [
    { id: 'fast_straight', label: 'Fast Seam', desc: 'True line & speed', key: '1' },
    { id: 'outswinger', label: 'Outswinger', desc: 'Shapes away to slips', key: '2' },
    { id: 'inswinger', label: 'Inswinger', desc: 'Darting into pads', key: '3' },
    { id: 'yorker', label: 'Toe Yorker', desc: 'Crushing at the base', key: '4' },
    { id: 'bouncer', label: 'Bouncer', desc: 'Steep chest bounce', key: '5' },
    { id: 'slower_ball', label: 'Slower Dipper', desc: 'Deceptive off-pace', key: '6' },
    { id: 'off_break', label: 'Off-Spin', desc: 'Turns into batsman', key: '7' },
    { id: 'leg_break', label: 'Leg-Spin', desc: 'Sharp turn away', key: '8' },
  ];

  // Full Keyboard event listener for bowling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBowlingActive) return;
      const key = e.key.toLowerCase();

      // Number keys 1-8 for delivery selection
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        onSelectDelivery(deliveries[num - 1].id);
        return;
      }

      // Arrow keys / WASD for pitch landing target
      const stepX = 0.12;
      const stepZ = 0.45;

      if (e.key === 'ArrowUp' || key === 'w') {
        // Fuller length (closer to batsman at -14)
        onChangePitchSpot(pitchX, Math.max(-13.8, pitchZ - stepZ));
      } else if (e.key === 'ArrowDown' || key === 's') {
        // Shorter length (closer to bowler at -8)
        onChangePitchSpot(pitchX, Math.min(-8.2, pitchZ + stepZ));
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        // Off stump line (for right hander, negative X or leftwards)
        onChangePitchSpot(Math.max(-0.8, pitchX - stepX), pitchZ);
      } else if (e.key === 'ArrowRight' || key === 'd') {
        // Leg stump line
        onChangePitchSpot(Math.min(0.8, pitchX + stepX), pitchZ);
      } else if (key === '-' || key === '_') {
        onChangeSpeed(Math.max(90, speedKmh - 5));
      } else if (key === '=' || key === '+') {
        onChangeSpeed(Math.min(152, speedKmh + 5));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onBowlDelivery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBowlingActive, pitchX, pitchZ, speedKmh, selectedDelivery]);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-950/90 p-3 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Left: Pitch Landing Zone Selector */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="text-[10px] font-bold text-slate-300 flex items-center justify-between w-full px-1">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" />
              PITCH TARGET
            </span>
            <span className="text-[9px] font-mono text-amber-400 font-bold">W/A/S/D</span>
          </div>

          <div className="relative w-40 h-28 bg-amber-950/40 rounded-xl border-2 border-amber-800/80 p-1 flex flex-col justify-between">
            <div className="flex justify-between text-[8px] text-slate-400 font-bold px-1">
              <span>Short [S]</span>
              <span>Good</span>
              <span>Full</span>
              <span>Yorker [W]</span>
            </div>

            <div
              className="relative w-full h-16 bg-amber-900/30 rounded border border-amber-700/50 cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = (e.clientX - rect.left) / rect.width;
                const clickY = (e.clientY - rect.top) / rect.height;
                const mappedX = (clickX - 0.5) * 1.6;
                const mappedZ = -8.0 - clickY * 5.8;
                onChangePitchSpot(mappedX, mappedZ);
              }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-amber-400 rounded-t" />
              <div
                className="absolute w-4 h-4 rounded-full border-2 border-yellow-300 bg-yellow-400/50 shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                style={{
                  left: `${((pitchX / 1.6) + 0.5) * 100}%`,
                  top: `${((-pitchZ - 8.0) / 5.8) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-slate-400 font-bold px-1">
              <span>[A] Off</span>
              <span>Middle</span>
              <span>Leg [D]</span>
            </div>
          </div>
        </div>

        {/* Center: Delivery Style Selector with 1-8 Keycaps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-68">
          {deliveries.map((del) => {
            const isSelected = selectedDelivery === del.id;
            return (
              <button
                key={del.id}
                onClick={() => onSelectDelivery(del.id)}
                className={`p-1.5 rounded-lg text-left transition border cursor-pointer relative ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-300 font-black shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold leading-tight">{del.label}</span>
                  <kbd className="text-[9px] font-mono bg-black/30 px-1 rounded font-black">
                    {del.key}
                  </kbd>
                </div>
                <div className="text-[8px] opacity-80 leading-tight truncate">{del.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Right: Pace Slider & BOWL Button */}
        <div className="flex flex-col gap-2 w-32">
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                PACE
              </span>
              <span className="text-amber-400 font-mono font-black">{speedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="90"
              max="152"
              value={speedKmh}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={onBowlDelivery}
            disabled={isBowlingActive}
            className={`py-3 px-3 rounded-xl text-xs font-black tracking-wider uppercase border shadow-xl transition cursor-pointer flex flex-col items-center justify-center ${
              isBowlingActive
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-red-400 shadow-red-900/50'
            }`}
          >
            <span className="flex items-center gap-1 text-sm font-black">
              <Play className="w-3.5 h-3.5 fill-white" />
              BOWL BALL
            </span>
            <kbd className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded mt-0.5 text-white font-bold">
              [SPACEBAR]
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
