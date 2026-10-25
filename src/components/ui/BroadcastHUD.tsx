import React from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  Camera,
  Layers,
  CloudSun,
  Award,
  Users,
  Settings,
  Shield,
} from 'lucide-react';
import { MatchState, BallResult } from '../../types/cricket';
import { CameraPreset } from '../3d/CricketCanvas';

interface BroadcastHUDProps {
  matchState: MatchState;
  lastBall: BallResult | null;
  cameraPreset: CameraPreset;
  onCameraChange: (preset: CameraPreset) => void;
  onOpenScorecard: () => void;
  onOpenWeather: () => void;
  onOpenSettings?: () => void;
  onOpenDRS?: () => void;
  canReviewDRS?: boolean;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenTournament?: () => void;
  onOpenMultiplayer?: () => void;
  onBackToMenu: () => void;
  onBackToTeams?: () => void;
}

export const BroadcastHUD: React.FC<BroadcastHUDProps> = ({
  matchState,
  lastBall,
  cameraPreset,
  onCameraChange,
  onOpenScorecard,
  onOpenWeather,
  onOpenSettings,
  onOpenDRS,
  canReviewDRS,
  isAudioMuted,
  onToggleAudio,
  onOpenTournament,
  onOpenMultiplayer,
  onBackToMenu,
  onBackToTeams,
}) => {
  const battingTeam = matchState.teams[matchState.battingTeamIndex];
  const bowlingTeam = matchState.teams[matchState.bowlingTeamIndex];

  const striker = battingTeam.players[matchState.strikerIndex] || battingTeam.players[0];
  const nonStriker = battingTeam.players[matchState.nonStrikerIndex] || battingTeam.players[1];
  const currentBowler = bowlingTeam.players[matchState.currentBowlerIndex] || bowlingTeam.players[6];

  // Camera presets list
  const cameraOptions: { id: CameraPreset; label: string }[] = [
    { id: 'front_view', label: 'Front View' },
    { id: 'batsman_view', label: 'Batsman' },
    { id: 'bowler_runup', label: 'Bowler' },
    { id: 'broadcast_tv', label: 'Broadcast' },
    { id: 'boundary_chase', label: 'Action Cam' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Bar: TV Header & Quick Controls */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Back to Menu, Back to Teams & Tournament Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToMenu}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
            title="Return to Main Menu"
          >
            <span>←</span>
            <span>Menu</span>
          </button>

          {onBackToTeams && (
            <button
              onClick={onBackToTeams}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-1.5 text-xs font-black transition cursor-pointer"
              title="Return to Choose Team Section"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>← Teams</span>
            </button>
          )}

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-black tracking-wider uppercase text-amber-400">
              {matchState.mode === 'tournament'
                ? '🏆 WORLD CUP T20'
                : matchState.mode === 'multiplayer'
                ? '🌐 MULTIPLAYER LIVE'
                : matchState.mode === 'super_over'
                ? '⚡ SUPER OVER'
                : 'WCC PREMIER CUP'}
            </span>
            <span className="text-slate-500 text-xs font-mono">|</span>
            <span className="text-slate-300 text-xs font-bold uppercase">{matchState.weather}</span>
          </div>

          {canReviewDRS && (
            <button
              onClick={onOpenDRS}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg border border-red-400 shadow-lg shadow-red-900/40 animate-bounce transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              DRS HAWK-EYE REVIEW
            </button>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleAudio}
            title={isAudioMuted ? 'Unmute Stadium Audio' : 'Mute Stadium Audio'}
            className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-300 border border-slate-700/70 shadow cursor-pointer transition"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Weather Selector */}
          <button
            onClick={onOpenWeather}
            title="Change Stadium Weather & Time"
            className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-amber-300 border border-slate-700/70 shadow cursor-pointer transition flex items-center gap-1 text-xs font-bold"
          >
            <CloudSun className="w-4 h-4" />
          </button>

          {/* Tournament Hub */}
          <button
            onClick={onOpenTournament}
            title="World Cup Tournament Hub"
            className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-yellow-400 border border-slate-700/70 shadow cursor-pointer transition"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Multiplayer Lobby */}
          <button
            onClick={onOpenMultiplayer}
            title="Online Multiplayer Room"
            className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-sky-400 border border-slate-700/70 shadow cursor-pointer transition"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Full Scorecard */}
          <button
            onClick={onOpenScorecard}
            title="Full Match Scorecard & Wagon Wheel"
            className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-700/70 shadow cursor-pointer transition flex items-center gap-1 text-xs font-bold"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Scorecard</span>
          </button>

          {/* Settings & Camera Options */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Game Settings, Camera & Difficulty"
              className="p-2 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-amber-400 border border-slate-700/70 shadow cursor-pointer transition flex items-center gap-1 text-xs font-bold"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center-Top: Ball-by-ball commentary banner */}
      <div className="flex flex-col items-center">
        {lastBall && (
          <div className="bg-slate-900/90 border border-slate-700/90 text-white px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                lastBall.isBoundary6
                  ? 'bg-purple-600 text-white'
                  : lastBall.isBoundary4
                  ? 'bg-emerald-600 text-white'
                  : lastBall.isWicket
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {lastBall.isBoundary6
                ? '6 RUNS'
                : lastBall.isBoundary4
                ? '4 RUNS'
                : lastBall.isWicket
                ? `WICKET (${lastBall.wicketType?.toUpperCase()})`
                : `${lastBall.runsScored} RUN`}
            </span>
            <span className="text-xs text-slate-200 font-medium max-w-md truncate">
              {lastBall.commentaryText}
            </span>
          </div>
        )}
      </div>

      {/* Lower Section: Professional TV Score Ticker */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Main Score Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t-2 border-amber-500/80 rounded-xl shadow-2xl overflow-hidden p-2.5 text-white flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Batting Team & Big Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{battingTeam.flagEmoji}</span>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider uppercase text-slate-100 flex items-center gap-1.5">
                  {battingTeam.shortName}
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1 rounded">BAT</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  vs {bowlingTeam.shortName}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="flex items-baseline gap-1.5 border-l border-slate-700 pl-3">
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {matchState.totalScore}/{matchState.totalWickets}
              </span>
              <span className="text-xs font-bold text-slate-300">
                ({matchState.currentOver}.{matchState.currentBallInOver} / {matchState.totalOvers} ov)
              </span>
            </div>

            {/* Target or Run Rate */}
            <div className="hidden lg:flex flex-col border-l border-slate-700 pl-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {matchState.innings === 2 ? `TARGET: ${matchState.targetScore}` : `CRR: ${matchState.currentRunRate.toFixed(2)}`}
              </span>
              {matchState.innings === 2 && matchState.targetScore && (
                <span className="text-[11px] font-black text-emerald-400">
                  Need {Math.max(0, matchState.targetScore - matchState.totalScore)} off{' '}
                  {matchState.totalOvers * 6 - matchState.totalBallsDelivered}b
                </span>
              )}
            </div>
          </div>

          {/* Center: Striker, Non-Striker & Bowler Stats */}
          <div className="flex items-center gap-4 text-xs font-medium">
            {/* Striker */}
            <div className="flex flex-col">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                {striker.name} *
              </span>
              <span className="text-slate-400 text-[11px]">
                {striker.runs} ({striker.ballsFaced}b) • 4s:{striker.fours} 6s:{striker.sixes}
              </span>
            </div>

            {/* Non-Striker */}
            <div className="hidden sm:flex flex-col border-l border-slate-700/80 pl-3">
              <span className="font-semibold text-slate-200">
                {nonStriker.name}
              </span>
              <span className="text-slate-400 text-[11px]">
                {nonStriker.runs} ({nonStriker.ballsFaced}b)
              </span>
            </div>

            {/* Bowler */}
            <div className="flex flex-col border-l border-slate-700/80 pl-3">
              <span className="font-bold text-sky-300">
                {currentBowler.name}
              </span>
              <span className="text-slate-400 text-[11px]">
                {currentBowler.wicketsTaken}/{currentBowler.runsConceded} ({currentBowler.oversBowled} ov)
              </span>
            </div>
          </div>

          {/* Right: Current Over Timeline & Camera Selector */}
          <div className="flex items-center gap-3">
            {/* Over ball pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 mr-1">OVER:</span>
              {matchState.overHistory.length === 0 ? (
                <span className="text-[10px] text-slate-500">Starting...</span>
              ) : (
                matchState.overHistory.map((ball, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      ball.isWicket
                        ? 'bg-red-600 text-white'
                        : ball.isBoundary6
                        ? 'bg-purple-600 text-white'
                        : ball.isBoundary4
                        ? 'bg-emerald-600 text-white'
                        : ball.runsScored === 0
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {ball.isWicket ? 'W' : ball.runsScored}
                  </span>
                ))
              )}
            </div>

            {/* Camera Switcher Buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
              <Camera className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {cameraOptions.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => onCameraChange(cam.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
