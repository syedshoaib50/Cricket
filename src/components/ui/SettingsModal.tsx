import React from 'react';
import { X, Settings, Volume2, Mic, Sun, Camera, Gauge, Sparkles, Sliders, Gamepad2 } from 'lucide-react';
import { WeatherCondition, WeatherType } from '../../types/cricket';
import { CameraPreset } from '../3d/CricketCanvas';
import { WEATHER_PRESETS } from '../../data/teamsAndWeather';

export type GameDifficulty = 'easy' | 'normal' | 'hard';

interface SettingsModalProps {
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  currentWeather: WeatherCondition;
  onSelectWeather: (weather: WeatherCondition) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  difficulty: GameDifficulty;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  onOpenUnityExport?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isAudioMuted,
  onToggleAudio,
  isVoiceEnabled,
  onToggleVoice,
  currentWeather,
  onSelectWeather,
  cameraPreset,
  onSelectCameraPreset,
  difficulty,
  onSelectDifficulty,
  onOpenUnityExport,
  onClose,
}) => {
  const cameraChoices: { id: CameraPreset; label: string; desc: string }[] = [
    { id: 'front_view', label: 'Front View (Front-On)', desc: 'Direct straight bowler-to-batsman view facing batsman' },
    { id: 'batsman_view', label: 'Batsman View', desc: 'Over-the-shoulder classic WCC2 batting perspective' },
    { id: 'bowler_runup', label: 'Bowler View', desc: 'Follow bowler run-up stride straight to crease' },
    { id: 'broadcast_tv', label: 'Broadcast TV', desc: 'Elevated wide sideline television broadcast angle' },
  ];

  const difficultyLevels: { id: GameDifficulty; label: string; desc: string }[] = [
    { id: 'easy', label: 'Easy / Rookie', desc: 'Generous timing sweet spot, moderate 115-125 km/h bowling' },
    { id: 'normal', label: 'Normal / Pro', desc: 'Authentic physical swing, realistic pace (130-142 km/h)' },
    { id: 'hard', label: 'Hard / Legend', desc: 'Express 145+ km/h pace, late swing, precision sweet spot' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="text-base font-black text-white uppercase tracking-wider">
              GAME & CAMERA SETTINGS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* 1. Playing Camera Perspective */}
          <div className="flex flex-col gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Default Playing Camera Perspective
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                {cameraPreset === 'front_view' ? '★ FRONT VIEW ACTIVE' : cameraPreset}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cameraChoices.map((cam) => {
                const isSelected = cameraPreset === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => onSelectCameraPreset(cam.id)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-black">{cam.label}</span>
                    <span className="text-[9px] opacity-80 leading-tight">{cam.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gameplay Difficulty */}
          <div className="flex flex-col gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                Gameplay Difficulty & Sweet Spot
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase">{difficulty}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {difficultyLevels.map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    onClick={() => onSelectDifficulty(diff.id)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-300 font-black shadow-md'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-black">{diff.label}</span>
                    <span className="text-[9px] opacity-80 leading-tight">{diff.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Audio & Voice Commentary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sound FX */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-xs text-white block">Stadium Audio FX</span>
                  <span className="text-[10px] text-slate-400">Bat cracks, roars</span>
                </div>
              </div>
              <button
                onClick={onToggleAudio}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                  !isAudioMuted
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {!isAudioMuted ? 'ON' : 'MUTED'}
              </button>
            </div>

            {/* Voice Commentary */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-xs text-white block">Voice Commentary</span>
                  <span className="text-[10px] text-slate-400">Synthesized speech</span>
                </div>
              </div>
              <button
                onClick={onToggleVoice}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer border ${
                  isVoiceEnabled
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isVoiceEnabled ? 'VOICE ON' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* 4. Match Atmosphere Preset */}
          <div className="flex flex-col gap-2 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                Default Atmosphere & Weather
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['night', 'sunny', 'sunset', 'rainy', 'overcast'] as WeatherType[]).map((wId) => {
                const preset = WEATHER_PRESETS[wId];
                const isSelected = currentWeather.id === wId;
                return (
                  <button
                    key={wId}
                    onClick={() => onSelectWeather(preset)}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition cursor-pointer capitalize text-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Unity 3D Engine Architecture & C# Scripts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-amber-500/40">
            <div className="flex flex-col">
              <span className="font-black text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                Unity 3D Engine Architecture &amp; C#
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Export and inspect full C# scripts for BatsmanController, BallPhysics, BowlerAI &amp; WebGL setup.
              </span>
            </div>
            {onOpenUnityExport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUnityExport();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shadow whitespace-nowrap self-start sm:self-auto"
              >
                View C# Scripts
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
