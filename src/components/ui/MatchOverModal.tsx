import React, { useEffect } from 'react';
import { Trophy, RefreshCw, Layers, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MatchState } from '../../types/cricket';

interface MatchOverModalProps {
  matchState: MatchState;
  onRematch: () => void;
  onOpenScorecard: () => void;
  onBackToTeams?: () => void;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({
  matchState,
  onRematch,
  onOpenScorecard,
  onBackToTeams,
}) => {
  useEffect(() => {
    // Launch festive fireworks / confetti
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  const winner = matchState.winnerTeamName || 'Match Drawn';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-center items-center p-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-3">
          <Trophy className="w-10 h-10 text-amber-400" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
          MATCH CONCLUDED
        </span>

        <h2 className="text-2xl font-black text-white mb-2">
          {winner}
        </h2>

        <p className="text-sm font-semibold text-emerald-400 mb-6">
          {matchState.winMargin || 'Sensational victory in a thrilling finish!'}
        </p>

        <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-around mb-6 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400 font-bold">{matchState.teams[0].shortName}</span>
            <span className="text-lg font-black text-white">{matchState.teams[0].players.reduce((acc, p) => acc + p.runs, 0)} runs</span>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-400 font-bold">{matchState.teams[1].shortName}</span>
            <span className="text-lg font-black text-white">{matchState.teams[1].players.reduce((acc, p) => acc + p.runs, 0)} runs</span>
          </div>
        </div>

        <div className="flex w-full gap-3">
          <button
            onClick={onOpenScorecard}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            Full Scorecard
          </button>
          <button
            onClick={onRematch}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </div>

        {onBackToTeams && (
          <button
            onClick={onBackToTeams}
            className="w-full mt-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-750 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Choose New Teams
          </button>
        )}
      </div>
    </div>
  );
};
