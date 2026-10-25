import React from 'react';
import { Play, Trophy, Users, Zap, Keyboard, Settings, Sparkles, Gamepad2 } from 'lucide-react';
import { soundEngine } from '../../audio/CricketAudioEngine';

interface MainMenuProps {
  onStartQuickMatch: () => void;
  onOpenTournament: () => void;
  onOpenMultiplayer: () => void;
  onStartSuperOver: () => void;
  onOpenControlsGuide: () => void;
  onOpenSettings: () => void;
  onOpenUnityExport?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartQuickMatch,
  onOpenTournament,
  onOpenMultiplayer,
  onStartSuperOver,
  onOpenControlsGuide,
  onOpenSettings,
  onOpenUnityExport,
}) => {
  const handleClick = (cb: () => void) => {
    soundEngine.playBatHit('sweet');
    cb();
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto">
      {/* Top Bar with Brand Badge and Utility Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-black tracking-widest text-slate-300 uppercase">
            OFFICIAL 3D CRICKET SIMULATION
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenUnityExport && (
            <button
              onClick={() => handleClick(onOpenUnityExport)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/50 transition cursor-pointer text-xs font-bold shadow-lg"
              title="View & Export Unity C# Project Scripts"
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Unity C# Project</span>
            </button>
          )}

          <button
            onClick={() => handleClick(onOpenControlsGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition cursor-pointer text-xs font-bold shadow-lg"
          >
            <Keyboard className="w-4 h-4" />
            <span>Keybindings &amp; Controls</span>
          </button>

          <button
            onClick={() => handleClick(onOpenSettings)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer shadow-lg"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Center Section: WCC2 Inspired Title & Visual Identity */}
      <div className="flex flex-col items-center text-center my-auto py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen 3D Physics Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight uppercase drop-shadow-2xl">
          WCC Premier Cricket 3D
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium max-w-lg mt-2">
          Experience authentic international cricket with dynamic stadium weather, DRS Hawk-Eye reviews, and pure keyboard gameplay.
        </p>

        {/* Primary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mt-10">
          {/* 1. Quick Match / Team Select */}
          <button
            onClick={() => handleClick(onStartQuickMatch)}
            className="group relative bg-gradient-to-br from-amber-500 to-yellow-600 p-5 rounded-3xl text-left shadow-2xl shadow-amber-500/20 border-2 border-amber-300 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-amber-500/40 cursor-pointer flex flex-col justify-between h-44"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-black/25 rounded-2xl">
                <Play className="w-6 h-6 text-slate-950 fill-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 text-slate-950 px-2 py-0.5 rounded-full">
                SELECT TEAMS
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight leading-tight">
                Quick Match
              </h3>
              <p className="text-xs text-slate-900 font-semibold opacity-90 mt-1">
                Custom squad selection, weather & overs
              </p>
            </div>
          </button>

          {/* 2. World Cup Tournament */}
          <button
            onClick={() => handleClick(onOpenTournament)}
            className="group relative bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl text-left shadow-xl border-2 border-slate-700/80 hover:border-amber-500 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-500/15 rounded-2xl border border-amber-500/30">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                KNOCKOUT
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                World Cup T20
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                8-team championship knockout bracket
              </p>
            </div>
          </button>

          {/* 3. Online Multiplayer */}
          <button
            onClick={() => handleClick(onOpenMultiplayer)}
            className="group relative bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl text-left shadow-xl border-2 border-slate-700/80 hover:border-sky-500 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-sky-500/15 rounded-2xl border border-sky-500/30">
                <Users className="w-6 h-6 text-sky-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                1V1 ARENA
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                Online Multiplayer
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                PvP matchmaking & custom room codes
              </p>
            </div>
          </button>

          {/* 4. Super Over */}
          <button
            onClick={() => handleClick(onStartSuperOver)}
            className="group relative bg-slate-900/90 hover:bg-slate-850 p-5 rounded-3xl text-left shadow-xl border-2 border-slate-700/80 hover:border-purple-500 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-500/15 rounded-2xl border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/30">
                HIGH STAKES
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                Super Over
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                6-ball chase thriller with max pressure
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-4">
        <span>Inspired by World Cricket Championship 2 & Real Cricket</span>
        <span>Keyboard Enabled • 3D WebGL PBR Engine</span>
      </div>
    </div>
  );
};
