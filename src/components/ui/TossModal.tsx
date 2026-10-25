import React, { useState } from 'react';
import { Coins, Trophy } from 'lucide-react';
import { CricketTeam } from '../../types/cricket';

interface TossModalProps {
  playerTeam: CricketTeam;
  opponentTeam: CricketTeam;
  onTossComplete: (userBatsFirst: boolean) => void;
  onBackToTeams?: () => void;
}

export const TossModal: React.FC<TossModalProps> = ({
  playerTeam,
  opponentTeam,
  onTossComplete,
  onBackToTeams,
}) => {
  const [selectedCall, setSelectedCall] = useState<'heads' | 'tails' | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [tossResult, setTossResult] = useState<{
    coinLanded: 'heads' | 'tails';
    userWon: boolean;
  } | null>(null);

  const flipCoin = (call: 'heads' | 'tails') => {
    setSelectedCall(call);
    setIsFlipping(true);

    setTimeout(() => {
      const outcome: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
      const userWon = call === outcome;
      setTossResult({ coinLanded: outcome, userWon });
      setIsFlipping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col items-center p-6 text-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            OFFICIAL MATCH TOSS
          </span>
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          {playerTeam.name} vs {opponentTeam.name}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Call Heads or Tails for the match coin toss
        </p>

        {/* 3D Coin Animation */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-4 border-amber-300 shadow-2xl shadow-amber-500/50 flex flex-col items-center justify-center font-black text-slate-950 transition-all duration-700 ${
              isFlipping ? 'animate-spin scale-110' : ''
            }`}
          >
            <Coins className="w-8 h-8 text-slate-950 mb-0.5" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">
              {tossResult ? tossResult.coinLanded.toUpperCase() : 'TOSS'}
            </span>
          </div>
        </div>

        {/* Stage 1: Choose Call */}
        {!tossResult && !isFlipping && (
          <div className="flex gap-3 w-full">
            <button
              onClick={() => flipCoin('heads')}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
            >
              Call Heads
            </button>
            <button
              onClick={() => flipCoin('tails')}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
            >
              Call Tails
            </button>
          </div>
        )}

        {/* Flipping state */}
        {isFlipping && (
          <div className="text-sm font-bold text-amber-400 animate-pulse">
            Coin is in the air...
          </div>
        )}

        {/* Stage 2: Toss Result & Decision */}
        {tossResult && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-sm font-black text-white">
              {tossResult.userWon ? (
                <span className="text-emerald-400">
                  🎉 You WON the Toss! ({tossResult.coinLanded.toUpperCase()})
                </span>
              ) : (
                <span className="text-amber-400">
                  {opponentTeam.name} won the toss and elected to BOWL!
                </span>
              )}
            </div>

            {tossResult.userWon ? (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => onTossComplete(true)}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  🏏 Bat First
                </button>
                <button
                  onClick={() => onTossComplete(false)}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  ⚡ Bowl First
                </button>
              </div>
            ) : (
              <button
                onClick={() => onTossComplete(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
              >
                Proceed to Match
              </button>
            )}
          </div>
        )}

        {onBackToTeams && (
          <button
            onClick={onBackToTeams}
            className="mt-4 text-xs font-bold text-slate-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to Choose Teams</span>
          </button>
        )}
      </div>
    </div>
  );
};
