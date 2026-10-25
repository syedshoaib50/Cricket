import React, { useState } from 'react';
import { ArrowLeft, Play, Shield, Sun, CloudRain, Moon, Sunset, Cloud } from 'lucide-react';
import { CricketTeam, WeatherCondition, WeatherType } from '../../types/cricket';
import { CRICKET_TEAMS, WEATHER_PRESETS } from '../../data/teamsAndWeather';

interface TeamSelectionScreenProps {
  onStartGame: (config: {
    playerTeam: CricketTeam;
    opponentTeam: CricketTeam;
    overs: number;
    weather: WeatherCondition;
  }) => void;
  onBackToMenu: () => void;
}

export const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({
  onStartGame,
  onBackToMenu,
}) => {
  const [selectedPlayerTeamId, setSelectedPlayerTeamId] = useState<string>('ind');
  const [selectedOpponentTeamId, setSelectedOpponentTeamId] = useState<string>('aus');
  const [overs, setOvers] = useState<number>(2);
  const [weatherId, setWeatherId] = useState<WeatherType>('night');

  const playerTeam = CRICKET_TEAMS.find((t) => t.id === selectedPlayerTeamId) || CRICKET_TEAMS[0];
  const opponentTeam = CRICKET_TEAMS.find((t) => t.id === selectedOpponentTeamId) || CRICKET_TEAMS[1];
  const weather = WEATHER_PRESETS[weatherId];

  const handleStart = () => {
    onStartGame({
      playerTeam,
      opponentTeam,
      overs,
      weather,
    });
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col p-4 sm:p-8 overflow-y-auto select-none">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Menu
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
            TEAM & MATCH SETUP
          </h2>
          <span className="text-xs text-amber-400 font-semibold">
            Choose your squad, rivals, and conditions
          </span>
        </div>

        <div className="w-28" /> {/* spacer */}
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Teams Head-to-Head Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Team Card */}
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                YOUR TEAM (PLAYER)
              </span>
              <span className="text-3xl">{playerTeam.flagEmoji}</span>
            </div>

            {/* Team Picker Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CRICKET_TEAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedPlayerTeamId(t.id);
                    if (t.id === selectedOpponentTeamId) {
                      const other = CRICKET_TEAMS.find((o) => o.id !== t.id);
                      if (other) setSelectedOpponentTeamId(other.id);
                    }
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                    selectedPlayerTeamId === t.id
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{t.flagEmoji}</span>
                  <span className="text-[10px] font-bold">{t.shortName}</span>
                </button>
              ))}
            </div>

            {/* Squad Preview */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-black text-slate-400 uppercase">Key Players</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {playerTeam.players.slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-slate-900 p-2 rounded-xl flex items-center justify-between border border-slate-800">
                    <span className="font-bold text-white truncate mr-1">{p.name}</span>
                    <span className="text-[10px] font-black font-mono text-amber-400 bg-black/40 px-1 rounded">
                      {p.battingSkill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Opponent Team Card */}
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                OPPONENT TEAM (AI / RIVAL)
              </span>
              <span className="text-3xl">{opponentTeam.flagEmoji}</span>
            </div>

            {/* Team Picker Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CRICKET_TEAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedOpponentTeamId(t.id);
                    if (t.id === selectedPlayerTeamId) {
                      const other = CRICKET_TEAMS.find((o) => o.id !== t.id);
                      if (other) setSelectedPlayerTeamId(other.id);
                    }
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                    selectedOpponentTeamId === t.id
                      ? 'bg-sky-500 text-slate-950 font-black border-sky-300 shadow-md scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{t.flagEmoji}</span>
                  <span className="text-[10px] font-bold">{t.shortName}</span>
                </button>
              ))}
            </div>

            {/* Squad Preview */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-black text-slate-400 uppercase">Key Players</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {opponentTeam.players.slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-slate-900 p-2 rounded-xl flex items-center justify-between border border-slate-800">
                    <span className="font-bold text-white truncate mr-1">{p.name}</span>
                    <span className="text-[10px] font-black font-mono text-sky-400 bg-black/40 px-1 rounded">
                      {p.battingSkill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match Settings: Overs & Weather */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
          {/* Overs Selector */}
          <div>
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 block">
              Match Overs
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((ov) => (
                <button
                  key={ov}
                  onClick={() => setOvers(ov)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                    overs === ov
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-lg'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {ov === 1 ? '1 (Super Over)' : `${ov} Overs`}
                </button>
              ))}
            </div>
          </div>

          {/* Atmosphere / Weather Selector */}
          <div>
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 block">
              Stadium Weather & Atmosphere
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['night', 'sunny', 'sunset', 'rainy', 'overcast'] as WeatherType[]).map((wId) => {
                const w = WEATHER_PRESETS[wId];
                const isSelected = weatherId === wId;
                return (
                  <button
                    key={wId}
                    onClick={() => setWeatherId(wId)}
                    className={`py-2 px-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer capitalize text-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {w.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Start Match CTA */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleStart}
            className="w-full sm:w-80 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base uppercase tracking-widest shadow-2xl shadow-amber-500/40 flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-102"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            START MATCH (COIN TOSS)
          </button>
        </div>
      </div>
    </div>
  );
};
