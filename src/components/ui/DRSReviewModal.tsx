import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle2, XCircle, Activity, ChevronRight } from 'lucide-react';
import { DRSReviewData } from '../../types/cricket';

interface DRSReviewModalProps {
  data: DRSReviewData;
  onClose: () => void;
  onApplyVerdict: (isOut: boolean) => void;
}

export const DRSReviewModal: React.FC<DRSReviewModalProps> = ({
  data,
  onClose,
  onApplyVerdict,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Auto-advance through DRS steps to create cinematic television drama
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 p-3 flex items-center justify-between text-white border-b border-red-500">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-300" />
            <span className="font-black tracking-widest text-sm uppercase">
              DRS HAWK-EYE REVIEW SYSTEM
            </span>
          </div>
          <span className="bg-black/40 text-yellow-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-yellow-400/40">
            THIRD UMPIRE REPLAY
          </span>
        </div>

        {/* Television Graphics Screen */}
        <div className="p-5 flex flex-col gap-4">
          {/* Step Progress indicators */}
          <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-400">
            <span className={currentStep >= 0 ? 'text-amber-400 font-black' : ''}>
              1. Front Foot Check
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className={currentStep >= 1 ? 'text-amber-400 font-black' : ''}>
              2. UltraEdge™
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className={currentStep >= 2 ? 'text-amber-400 font-black' : ''}>
              3. Ball Tracking
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className={currentStep >= 3 ? 'text-amber-400 font-black' : ''}>
              4. Big Screen Verdict
            </span>
          </div>

          {/* Visual Simulation Display Area */}
          <div className="relative bg-slate-950 rounded-xl h-56 border border-slate-800 flex flex-col items-center justify-center overflow-hidden p-4">
            {/* Step 0: Front foot check */}
            {currentStep === 0 && (
              <div className="flex flex-col items-center gap-2 text-center animate-fade-in">
                <div className="text-emerald-400 font-black text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  FAIR DELIVERY
                </div>
                <div className="text-slate-400 text-xs max-w-xs">
                  Bowler's heel landed well behind the popping crease line. No-ball check cleared.
                </div>
              </div>
            )}

            {/* Step 1: UltraEdge Soundwave */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Activity className="w-4 h-4 text-sky-400" />
                  ULTRAEDGE™ ACOUSTIC SENSOR
                </div>
                {/* Waveform graphic */}
                <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-800">
                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                    {Array.from({ length: 42 }).map((_, i) => {
                      const isMiddle = i > 18 && i < 24;
                      const spikeHeight = isMiddle && data.ultraEdgeSpike ? 80 : Math.random() * 8 + 4;
                      return (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isMiddle && data.ultraEdgeSpike ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-sky-500/40'
                          }`}
                          style={{ height: `${spikeHeight}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300">
                  {data.ultraEdgeSpike
                    ? '🔊 SPIKE DETECTED as ball passes bat edge!'
                    : 'No spike detected as ball passes edge of bat.'}
                </span>
              </div>
            )}

            {/* Step 2: 3D Hawk-Eye Ball Tracking Parameters */}
            {currentStep === 2 && (
              <div className="w-full grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pitching</span>
                  <span className="text-sm font-black text-emerald-400">IN LINE</span>
                  <span className="text-[9px] text-slate-500">Pitched middle & leg</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Impact</span>
                  <span className="text-sm font-black text-emerald-400">IN LINE</span>
                  <span className="text-[9px] text-slate-500">Impact on front pad</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Wickets</span>
                  <span className="text-sm font-black text-red-500 animate-pulse">
                    HITTING
                  </span>
                  <span className="text-[9px] text-slate-500">Hitting leg stump</span>
                </div>
              </div>
            )}

            {/* Step 3: Big Screen Decision Verdict */}
            {currentStep === 3 && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  THIRD UMPIRE BIG SCREEN VERDICT
                </span>
                <div
                  className={`text-4xl font-black px-8 py-3 rounded-2xl border-4 shadow-2xl tracking-widest animate-pulse ${
                    data.verdict === 'OUT'
                      ? 'bg-red-600/90 text-white border-red-400 shadow-red-600/50'
                      : 'bg-emerald-600/90 text-white border-emerald-400 shadow-emerald-600/50'
                  }`}
                >
                  {data.verdict}
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {data.verdict === 'OUT'
                    ? 'Decision confirmed by ball tracking. Player must leave the crease.'
                    : 'Decision overturned. Batsman survives!'}
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Skip to Decision
              </button>
            ) : (
              <button
                onClick={() => {
                  onApplyVerdict(data.verdict === 'OUT');
                  onClose();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                Continue Match
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
