import React, { useState } from 'react';
import { X, Users, Globe, Copy, Check, Send, Swords } from 'lucide-react';
import { CricketTeam } from '../../types/cricket';
import { CRICKET_TEAMS } from '../../data/teamsAndWeather';

interface MultiplayerLobbyProps {
  onStartMatch: (config: {
    roomCode: string;
    opponentName: string;
    playerTeam: CricketTeam;
    opponentTeam: CricketTeam;
    totalOvers: number;
    userBatsFirst: boolean;
  }) => void;
  onClose: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onStartMatch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');
  const [roomCode, setRoomCode] = useState<string>('WCC-' + Math.floor(1000 + Math.random() * 9000));
  const [joinCode, setJoinCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedMyTeam, setSelectedMyTeam] = useState<string>('ind');
  const [selectedOpponentTeam, setSelectedOpponentTeam] = useState<string>('aus');
  const [overs, setOvers] = useState<number>(2);

  const handleQuickMatch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const myTeam = CRICKET_TEAMS.find((t) => t.id === selectedMyTeam) || CRICKET_TEAMS[0];
      const oppTeam = CRICKET_TEAMS.find((t) => t.id === selectedOpponentTeam) || CRICKET_TEAMS[1];

      onStartMatch({
        roomCode: 'LIVE-' + Math.floor(1000 + Math.random() * 9000),
        opponentName: 'ApexStriker_99 (Rating: 1840)',
        playerTeam: myTeam,
        opponentTeam: oppTeam,
        totalOvers: overs,
        userBatsFirst: Math.random() < 0.5,
      });
      onClose();
    }, 1800);
  };

  const handleCustomRoom = () => {
    const myTeam = CRICKET_TEAMS.find((t) => t.id === selectedMyTeam) || CRICKET_TEAMS[0];
    const oppTeam = CRICKET_TEAMS.find((t) => t.id === selectedOpponentTeam) || CRICKET_TEAMS[1];

    onStartMatch({
      roomCode: joinCode ? joinCode.toUpperCase() : roomCode,
      opponentName: 'Challenger_XI',
      playerTeam: myTeam,
      opponentTeam: oppTeam,
      totalOvers: overs,
      userBatsFirst: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-sky-400" />
            <span className="text-base font-black text-white uppercase tracking-wider">
              ONLINE MULTIPLAYER ARENA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            Quick Matchmaking
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Custom Room Code
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 flex flex-col gap-4">
          {/* Team Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Your Team</label>
              <select
                value={selectedMyTeam}
                onChange={(e) => setSelectedMyTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              >
                {CRICKET_TEAMS.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.flagEmoji} {tm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Opponent Team</label>
              <select
                value={selectedOpponentTeam}
                onChange={(e) => setSelectedOpponentTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              >
                {CRICKET_TEAMS.filter((t) => t.id !== selectedMyTeam).map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.flagEmoji} {tm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overs Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Match Overs</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 5, 10].map((ov) => (
                <button
                  key={ov}
                  onClick={() => setOvers(ov)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    overs === ov
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {ov} {ov === 1 ? 'Super Over' : 'Overs'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'quick' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full border-4 border-amber-500/30 border-t-amber-400 flex items-center justify-center animate-spin">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-300">
                {isSearching ? 'Finding active online rival across global servers...' : 'Ready for 1v1 PvP Live Clash'}
              </span>
              <button
                onClick={handleQuickMatch}
                disabled={isSearching}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition cursor-pointer"
              >
                {isSearching ? 'Connecting...' : 'FIND MATCH NOW'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Share Room Code */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Your Room Code</div>
                  <div className="text-lg font-black text-amber-400 font-mono tracking-widest">{roomCode}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Join Existing Room */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Friend's Code (e.g. WCC-1234)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold"
                />
                <button
                  onClick={handleCustomRoom}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
