import React, { useState } from 'react';
import { X, Trophy, PieChart, Layers } from 'lucide-react';
import { MatchState } from '../../types/cricket';

interface ScorecardModalProps {
  matchState: MatchState;
  onClose: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  matchState,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'wagon_wheel'>('scorecard');
  const [selectedInning, setSelectedInning] = useState<number>(matchState.battingTeamIndex);

  const battingTeam = matchState.teams[selectedInning];
  const bowlingTeam = matchState.teams[selectedInning === 0 ? 1 : 0];

  // Calculate Wagon Wheel scoring sectors from all deliveries
  const wagonSectors: { [key: string]: number } = {
    'Cover': 0,
    'Long Off': 0,
    'Long On': 0,
    'Mid Wicket': 0,
    'Square Leg': 0,
    'Fine Leg': 0,
    'Third Man': 0,
    'Point': 0,
  };

  matchState.allDeliveries.forEach((del) => {
    if (del.runsScored > 0 && del.shotType) {
      if (del.shotType === 'cover_drive') wagonSectors['Cover'] += del.runsScored;
      else if (del.shotType === 'straight_drive') wagonSectors['Long Off'] += del.runsScored;
      else if (del.shotType === 'pull_shot') wagonSectors['Mid Wicket'] += del.runsScored;
      else if (del.shotType === 'helicopter') wagonSectors['Long On'] += del.runsScored;
      else if (del.shotType === 'square_cut') wagonSectors['Point'] += del.runsScored;
      else if (del.shotType === 'leg_glance') wagonSectors['Square Leg'] += del.runsScored;
      else if (del.shotType === 'dilscoop') wagonSectors['Fine Leg'] += del.runsScored;
      else if (del.shotType === 'late_cut') wagonSectors['Third Man'] += del.runsScored;
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-base font-black text-white uppercase tracking-wider">
                MATCH SCORECARD & ANALYTICS
              </span>
              <span className="text-xs text-slate-400">
                {matchState.teams[0].name} vs {matchState.teams[1].name} • {matchState.totalOvers} Overs Match
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 pt-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'scorecard'
                  ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Full Scorecard
            </button>
            <button
              onClick={() => setActiveTab('wagon_wheel')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wagon_wheel'
                  ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              Wagon Wheel
            </button>
          </div>

          {/* Team Innings Switcher */}
          <div className="flex gap-1 mb-2">
            {matchState.teams.map((tm, idx) => (
              <button
                key={tm.id}
                onClick={() => setSelectedInning(idx)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  selectedInning === idx
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{tm.flagEmoji}</span>
                <span>{tm.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'scorecard' ? (
            <div className="flex flex-col gap-6">
              {/* Batting Table */}
              <div>
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <span>🏏</span> {battingTeam.name} Batting
                </h4>
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-700">
                      <tr>
                        <th className="py-2 px-3">Batter</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2 text-right">R</th>
                        <th className="py-2 px-2 text-right">B</th>
                        <th className="py-2 px-2 text-right">4s</th>
                        <th className="py-2 px-2 text-right">6s</th>
                        <th className="py-2 px-3 text-right">SR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {battingTeam.players.map((p) => {
                        const sr = p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : '-';
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-semibold text-white">
                              {p.name}
                            </td>
                            <td className="py-2 px-2 text-[10px] text-slate-400">
                              {p.isOut ? (p.howOut || 'out') : p.ballsFaced > 0 ? 'not out *' : 'yet to bat'}
                            </td>
                            <td className="py-2 px-2 text-right font-black text-amber-400">{p.runs}</td>
                            <td className="py-2 px-2 text-right text-slate-400">{p.ballsFaced}</td>
                            <td className="py-2 px-2 text-right text-slate-300">{p.fours}</td>
                            <td className="py-2 px-2 text-right text-purple-300 font-bold">{p.sixes}</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">{sr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bowling Table */}
              <div>
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⚡</span> {bowlingTeam.name} Bowling
                </h4>
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-700">
                      <tr>
                        <th className="py-2 px-3">Bowler</th>
                        <th className="py-2 px-2 text-right">O</th>
                        <th className="py-2 px-2 text-right">M</th>
                        <th className="py-2 px-2 text-right">R</th>
                        <th className="py-2 px-2 text-right">W</th>
                        <th className="py-2 px-3 text-right">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {bowlingTeam.players.slice(6, 11).map((b) => {
                        const econ = b.oversBowled > 0 ? (b.runsConceded / b.oversBowled).toFixed(2) : '-';
                        return (
                          <tr key={b.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-semibold text-white">{b.name}</td>
                            <td className="py-2 px-2 text-right text-slate-300">{b.oversBowled}</td>
                            <td className="py-2 px-2 text-right text-slate-400">{b.maidens}</td>
                            <td className="py-2 px-2 text-right text-slate-300">{b.runsConceded}</td>
                            <td className="py-2 px-2 text-right font-black text-red-400">{b.wicketsTaken}</td>
                            <td className="py-2 px-3 text-right text-slate-400 font-mono">{econ}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Wagon Wheel Analytics */
            <div className="flex flex-col items-center gap-4 py-2">
              <span className="text-xs font-bold text-slate-300">
                Shot Run Distribution across 360° Outfield Sectors
              </span>
              <div className="relative w-64 h-64 rounded-full border-4 border-emerald-600 bg-emerald-950/60 flex items-center justify-center shadow-2xl">
                {/* 30 yard circle */}
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center">
                  <div className="w-4 h-12 bg-amber-700/60 rounded" />
                </div>

                {/* Sector labels */}
                {Object.entries(wagonSectors).map(([sector, runs], idx) => {
                  const angle = (idx / 8) * Math.PI * 2 - Math.PI / 2;
                  const rad = 95;
                  const x = Math.cos(angle) * rad;
                  const y = Math.sin(angle) * rad;

                  return (
                    <div
                      key={sector}
                      className="absolute flex flex-col items-center justify-center pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                      }}
                    >
                      <span className="text-[9px] font-bold text-slate-300 uppercase leading-none">
                        {sector}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          runs > 0 ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        {runs}r
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
