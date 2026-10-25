import React, { useState, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Zap,
  Target,
  Keyboard,
} from 'lucide-react';
import { ShotTiming, ShotType } from '../../types/cricket';

interface BattingControlsProps {
  onExecuteShot: (params: {
    shotType: ShotType;
    shotAngleRad: number;
    isLofted: boolean;
    timing: ShotTiming;
  }) => void;
  timingMeterProgress: number; // 0 to 1
  isTimingSweetSpot: boolean;
  isBallApproaching: boolean;
  disabled?: boolean;
}

interface ShotDirection {
  id: ShotType;
  label: string;
  keyLabel: string;
  icon: React.ReactNode;
  angleRad: number; // direction in field radians
}

export const BattingControls: React.FC<BattingControlsProps> = ({
  onExecuteShot,
  timingMeterProgress,
  isTimingSweetSpot,
  isBallApproaching,
  disabled = false,
}) => {
  const [selectedShot, setSelectedShot] = useState<ShotType>('straight_drive');
  const [isLofted, setIsLofted] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const shotDirections: ShotDirection[] = [
    { id: 'cover_drive', label: 'Cover Drive', keyLabel: 'D / →', icon: <ArrowUpRight className="w-4 h-4" />, angleRad: 0.65 },
    { id: 'straight_drive', label: 'Straight Drive', keyLabel: 'W / ↑', icon: <ArrowUp className="w-4 h-4" />, angleRad: 0.0 },
    { id: 'pull_shot', label: 'Mid-Wicket Pull', keyLabel: 'A / ←', icon: <ArrowUpLeft className="w-4 h-4" />, angleRad: -0.85 },
    { id: 'square_cut', label: 'Point / Cut', keyLabel: 'Q', icon: <ArrowRight className="w-4 h-4" />, angleRad: 1.45 },
    { id: 'helicopter', label: 'Helicopter 6', keyLabel: 'E', icon: <Zap className="w-4 h-4 text-amber-400" />, angleRad: -0.35 },
    { id: 'leg_glance', label: 'Square Leg', keyLabel: 'X', icon: <ArrowLeft className="w-4 h-4" />, angleRad: -1.5 },
    { id: 'late_cut', label: 'Third Man Cut', keyLabel: 'C', icon: <ArrowDownRight className="w-4 h-4" />, angleRad: 2.3 },
    { id: 'defensive', label: 'Forward Defense', keyLabel: 'S / ↓', icon: <ArrowDown className="w-4 h-4" />, angleRad: 0.0 },
    { id: 'dilscoop', label: 'Dilscoop Ramp', keyLabel: 'Z', icon: <ArrowDownLeft className="w-4 h-4" />, angleRad: 3.14 },
  ];

  // Global Keyboard listener for Batting (WASD, Arrows, Space, Enter, L, Shift)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toLowerCase();

      // Shot direction keys
      if (e.key === 'ArrowUp' || key === 'w') {
        setSelectedShot('straight_drive');
      } else if (e.key === 'ArrowRight' || key === 'd') {
        setSelectedShot('cover_drive');
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        setSelectedShot('pull_shot');
      } else if (e.key === 'ArrowDown' || key === 's') {
        setSelectedShot('defensive');
      } else if (key === 'q') {
        setSelectedShot('square_cut');
      } else if (key === 'e') {
        setSelectedShot('helicopter');
      } else if (key === 'x') {
        setSelectedShot('leg_glance');
      } else if (key === 'c') {
        setSelectedShot('late_cut');
      } else if (key === 'z') {
        setSelectedShot('dilscoop');
      } else if (key === 'l' || e.shiftKey) {
        setIsLofted((prev) => !prev);
      } else if ((e.key === ' ' || e.key === 'Enter') && isBallApproaching) {
        e.preventDefault();
        triggerHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isBallApproaching, timingMeterProgress, isTimingSweetSpot, isLofted, selectedShot]);

  const triggerHit = () => {
    let timing: ShotTiming = 'miss';
    let feedback = '';

    if (timingMeterProgress >= 0.72 && timingMeterProgress <= 0.88) {
      timing = 'perfect';
      feedback = '🔥 PERFECT TIMING! SWEET SPOT!';
    } else if (timingMeterProgress >= 0.58 && timingMeterProgress <= 0.95) {
      timing = 'good';
      feedback = '👍 GOOD TIMING!';
    } else if (timingMeterProgress < 0.58 && timingMeterProgress > 0.3) {
      timing = 'early';
      feedback = '⚠️ PLAYED TOO EARLY!';
    } else if (timingMeterProgress > 0.95) {
      timing = 'late';
      feedback = '⚠️ PLAYED TOO LATE!';
    } else {
      timing = 'miss';
      feedback = '❌ COMPLETE MISS!';
    }

    setLastFeedback(feedback);
    setTimeout(() => setLastFeedback(null), 2500);

    const dir = shotDirections.find((d) => d.id === selectedShot) || shotDirections[1];
    onExecuteShot({
      shotType: selectedShot,
      shotAngleRad: dir.angleRad,
      isLofted,
      timing,
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Timing Feedback Banner */}
      {lastFeedback && (
        <div className="bg-slate-900/95 border-2 border-amber-400 px-3 py-1 rounded-full text-xs font-black text-amber-300 shadow-xl animate-bounce">
          {lastFeedback}
        </div>
      )}

      {/* Timing Meter Bar */}
      <div className="w-72 bg-slate-950/80 p-2 rounded-xl border border-slate-700/80 shadow-lg flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3 text-amber-400" />
            TIMING METER
          </span>
          <span className={isTimingSweetSpot ? 'text-emerald-400 font-black' : 'text-slate-400'}>
            {isTimingSweetSpot ? '🔥 SWEET SPOT - PRESS SPACE NOW!' : isBallApproaching ? 'BALL APPROACHING...' : 'WAITING FOR BOWLER'}
          </span>
        </div>
        <div className="relative w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
          <div className="absolute left-[72%] w-[16%] h-full bg-emerald-500/40 border-x border-emerald-400 z-0" />
          <div
            className={`h-full transition-all duration-75 rounded-full ${
              isTimingSweetSpot ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, timingMeterProgress * 100))}%` }}
          />
        </div>
      </div>

      {/* Batting Controls Grid */}
      <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        {/* Wagon Wheel Shot Selector with Keycap Badges */}
        <div className="grid grid-cols-3 gap-1.5 w-52">
          {shotDirections.map((shot) => {
            const isSelected = selectedShot === shot.id;
            return (
              <button
                key={shot.id}
                onClick={() => setSelectedShot(shot.id)}
                title={`${shot.label} (Press ${shot.keyLabel})`}
                className={`h-11 rounded-lg flex flex-col items-center justify-center p-1 transition cursor-pointer border relative ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md scale-102'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  {shot.icon}
                  <span className="text-[9px] font-mono font-black opacity-75 bg-black/25 px-1 rounded">
                    {shot.keyLabel}
                  </span>
                </div>
                <span className="text-[8px] leading-tight font-bold truncate max-w-full">
                  {shot.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Column: Loft Toggle + HIT BUTTON */}
        <div className="flex flex-col gap-2 w-36">
          {/* Lofted Toggle */}
          <button
            onClick={() => setIsLofted((prev) => !prev)}
            className={`py-2 px-2 rounded-xl text-[11px] font-black tracking-wide border transition flex items-center justify-between cursor-pointer ${
              isLofted
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-900/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${isLofted ? 'text-yellow-300 fill-yellow-300' : 'text-slate-400'}`} />
              <span>{isLofted ? 'LOFT (SIX)' : 'GROUND SHOT'}</span>
            </div>
            <kbd className="bg-black/30 text-[9px] px-1.5 py-0.5 rounded font-mono border border-white/20">L</kbd>
          </button>

          {/* PLAY SHOT Trigger Button */}
          <button
            onClick={triggerHit}
            disabled={disabled}
            className={`py-3 px-3 rounded-xl text-xs font-black tracking-wider uppercase border shadow-xl transition cursor-pointer flex flex-col items-center justify-center ${
              isTimingSweetSpot
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 shadow-emerald-500/50 scale-105'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-900/40'
            }`}
          >
            <span className="text-sm font-black flex items-center gap-1">
              🏏 HIT SHOT
            </span>
            <kbd className="text-[10px] font-mono bg-black/25 px-2 py-0.5 rounded mt-0.5 text-slate-950 font-black">
              [SPACEBAR]
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
