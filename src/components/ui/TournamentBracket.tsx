import React from 'react';
import { X, Trophy, CheckCircle, ChevronRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CricketTeam } from '../../types/cricket';
import { CRICKET_TEAMS } from '../../data/teamsAndWeather';

interface TournamentBracketProps {
  onPlayFixture: (team1: CricketTeam, team2: CricketTeam, stageName: string) => void;
  onClose: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  onPlayFixture,
  onClose,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const fixtures = [
    { id: 'qf1', stage: 'Quarterfinal 1', team1: CRICKET_TEAMS[0], team2: CRICKET_TEAMS[3], status: 'Ready' },
    { id: 'qf2', stage: 'Quarterfinal 2', team1: CRICKET_TEAMS[1], team2: CRICKET_TEAMS[2], status: 'Upcoming' },
    { id: 'qf3', stage: 'Quarterfinal 3', team1: CRICKET_TEAMS[4], team2: CRICKET_TEAMS[5], status: 'Upcoming' },
    { id: 'qf4', stage: 'Quarterfinal 4', team1: CRICKET_TEAMS[6], team2: CRICKET_TEAMS[0], status: 'Upcoming' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-amber-500/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-4 flex items-center justify-between text-slate-950 font-black">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <span className="text-base uppercase tracking-wider">
              ICC T20 WORLD CHAMPIONSHIP KNOCKOUT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bracket Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
            <span>Quarterfinals</span>
            <span>Semifinals</span>
            <span>Grand Final</span>
          </div>

          {/* Fixture cards */}
          <div className="flex flex-col gap-2.5">
            {fixtures.map((fix) => (
              <div
                key={fix.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {fix.stage}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{fix.team1.flagEmoji}</span>
                      {fix.team1.name}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">VS</span>
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{fix.team2.flagEmoji}</span>
                      {fix.team2.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerConfetti();
                    onPlayFixture(fix.team1, fix.team2, fix.stage);
                    onClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  PLAY MATCH
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">Championship Glory & Trophy</span>
                <span className="text-[10px] text-slate-400">Win 3 consecutive knockout matches to lift the World Cup!</span>
              </div>
            </div>
            <button
              onClick={triggerConfetti}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Celebrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
