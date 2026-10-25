/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CricketCanvas, CameraPreset } from './components/3d/CricketCanvas';
import { BroadcastHUD } from './components/ui/BroadcastHUD';
import { DRSReviewModal } from './components/ui/DRSReviewModal';
import { ScorecardModal } from './components/ui/ScorecardModal';
import { WeatherSelector } from './components/ui/WeatherSelector';
import { MultiplayerLobby } from './components/ui/MultiplayerLobby';
import { TournamentBracket } from './components/ui/TournamentBracket';
import { MatchOverModal } from './components/ui/MatchOverModal';
import { TossModal } from './components/ui/TossModal';
import { MainMenu } from './components/ui/MainMenu';
import { TeamSelectionScreen } from './components/ui/TeamSelectionScreen';
import { ControlsGuideModal } from './components/ui/ControlsGuideModal';
import { SettingsModal, GameDifficulty } from './components/ui/SettingsModal';
import { UnityExportModal } from './components/ui/UnityExportModal';
import {
  BallResult,
  CricketTeam,
  DeliveryType,
  DRSReviewData,
  MatchState,
  ShotTiming,
  ShotType,
  UserShotChoice,
  WeatherCondition,
} from './types/cricket';
import { CRICKET_TEAMS, WEATHER_PRESETS } from './data/teamsAndWeather';
import { soundEngine } from './audio/CricketAudioEngine';
import { commentaryEngine } from './engine/commentary';

type AppScreen = 'main_menu' | 'team_selection' | 'in_game';

export default function App() {
  // Navigation Screen State (Starts on Main Menu as requested)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main_menu');

  // Weather State
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>(WEATHER_PRESETS.night);

  // Teams & Match setup
  const [matchState, setMatchState] = useState<MatchState>(() => {
    const team1: CricketTeam = JSON.parse(JSON.stringify(CRICKET_TEAMS[0])); // IND
    const team2: CricketTeam = JSON.parse(JSON.stringify(CRICKET_TEAMS[1])); // AUS
    return {
      id: 'match_1',
      mode: 'quick',
      totalOvers: 2,
      weather: 'night',
      battingTeamIndex: 0,
      bowlingTeamIndex: 1,
      teams: [team1, team2],
      innings: 1,
      currentOver: 0,
      currentBallInOver: 0,
      totalBallsDelivered: 0,
      totalScore: 0,
      totalWickets: 0,
      targetScore: null,
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 6,
      overHistory: [],
      allDeliveries: [],
      isMatchOver: false,
      currentRunRate: 0,
    };
  });

  // Camera & Visual states (Default Front View as requested)
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front_view');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [batsmanX, setBatsmanX] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  // Modals
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState<boolean>(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
  const [isTossOpen, setIsTossOpen] = useState<boolean>(false);
  const [isControlsGuideOpen, setIsControlsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isUnityExportOpen, setIsUnityExportOpen] = useState<boolean>(false);

  // DRS Review State
  const [drsData, setDrsData] = useState<DRSReviewData | null>(null);
  const [canReviewDRS, setCanReviewDRS] = useState<boolean>(false);
  const [lastBallResult, setLastBallResult] = useState<BallResult | null>(null);

  // Bowling Parameters
  const [deliveryTriggerId, setDeliveryTriggerId] = useState<number>(0);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType>('fast_straight');
  const [bowlingPitchX, setBowlingPitchX] = useState<number>(0.15);
  const [bowlingPitchZ, setBowlingPitchZ] = useState<number>(-11.5);
  const [bowlingSpeedKmh, setBowlingSpeedKmh] = useState<number>(138);
  const [isBowlingActive, setIsBowlingActive] = useState<boolean>(false);

  // Batting timing meter
  const [timingMeterProgress, setTimingMeterProgress] = useState<number>(0);
  const [isTimingSweetSpot, setIsTimingSweetSpot] = useState<boolean>(false);

  // User Shot choice
  const [userShotChoice, setUserShotChoice] = useState<UserShotChoice | null>(null);

  // Track user role: player can bat or bowl
  const [isUserBatting, setIsUserBatting] = useState<boolean>(true);

  // Auto-bowl for AI when user is batting
  const autoBowlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNextDelivery = () => {
    setIsBowlingActive(true);
    setUserShotChoice(null);
    setDeliveryTriggerId((prev) => prev + 1);
  };

  const handleBackToTeams = () => {
    setIsBowlingActive(false);
    setUserShotChoice(null);
    setIsTossOpen(false);
    setIsScorecardOpen(false);
    setIsWeatherOpen(false);
    setDrsData(null);
    if (autoBowlTimeoutRef.current) clearTimeout(autoBowlTimeoutRef.current);
    setCurrentScreen('team_selection');
  };

  // AI Bowler delivers automatically if user is batting and currently in-game
  useEffect(() => {
    if (
      currentScreen === 'in_game' &&
      isUserBatting &&
      !isBowlingActive &&
      !matchState.isMatchOver &&
      !drsData?.isOpen &&
      !isTossOpen
    ) {
      const variations: DeliveryType[] =
        difficulty === 'easy'
          ? ['fast_straight', 'slower_ball']
          : difficulty === 'hard'
          ? ['fast_straight', 'outswinger', 'inswinger', 'yorker', 'bouncer']
          : ['fast_straight', 'outswinger', 'inswinger', 'yorker', 'slower_ball', 'bouncer'];

      const picked = variations[Math.floor(Math.random() * variations.length)];
      setSelectedDelivery(picked);

      const spread = difficulty === 'easy' ? 0.5 : difficulty === 'hard' ? 1.0 : 0.8;
      setBowlingPitchX((Math.random() - 0.45) * spread);
      setBowlingPitchZ(-9.5 - Math.random() * 4.0);

      const baseSpeed = difficulty === 'easy' ? 116 : difficulty === 'hard' ? 142 : 128;
      const speedSpread = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 14 : 14;
      setBowlingSpeedKmh(Math.floor(baseSpeed + Math.random() * speedSpread));

      autoBowlTimeoutRef.current = setTimeout(() => {
        triggerNextDelivery();
      }, 2500);
    }
    return () => {
      if (autoBowlTimeoutRef.current) clearTimeout(autoBowlTimeoutRef.current);
    };
  }, [currentScreen, matchState.totalBallsDelivered, isUserBatting, matchState.isMatchOver, drsData?.isOpen, isTossOpen, difficulty]);

  // Handle Ball Complete from 3D Canvas
  const handleBallComplete = (ball: BallResult) => {
    setIsBowlingActive(false);
    setTimingMeterProgress(0);
    setIsTimingSweetSpot(false);
    setLastBallResult(ball);

    commentaryEngine.speak(ball.commentaryText);

    setMatchState((prev) => {
      if (prev.isMatchOver) return prev;

      const newBallsDelivered = prev.totalBallsDelivered + 1;
      const newBallInOver = (prev.currentBallInOver + 1) % 6;
      const newOver = newBallInOver === 0 ? prev.currentOver + 1 : prev.currentOver;
      const newScore = prev.totalScore + ball.runsScored;
      const newWickets = ball.isWicket ? prev.totalWickets + 1 : prev.totalWickets;

      const currentBatTeam = prev.teams[prev.battingTeamIndex];
      const striker = currentBatTeam.players[prev.strikerIndex];
      if (striker) {
        striker.runs += ball.runsScored;
        striker.ballsFaced += 1;
        if (ball.isBoundary4) striker.fours += 1;
        if (ball.isBoundary6) striker.sixes += 1;
        if (ball.isWicket) {
          striker.isOut = true;
          striker.howOut = ball.wicketType || 'out';
        }
      }

      if (ball.isWicket && (ball.wicketType === 'lbw' || ball.wicketType === 'caught')) {
        setCanReviewDRS(true);
      } else {
        setCanReviewDRS(false);
      }

      let nextStriker = prev.strikerIndex;
      let nextNonStriker = prev.nonStrikerIndex;

      if (ball.isWicket) {
        nextStriker = Math.min(10, Math.max(nextStriker, nextNonStriker) + 1);
      } else if (ball.runsScored % 2 === 1) {
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
      }

      if (newBallInOver === 0) {
        const temp = nextStriker;
        nextStriker = nextNonStriker;
        nextNonStriker = temp;
      }

      const updatedHistory = [...prev.overHistory, ball];
      const allDelivs = [...prev.allDeliveries, ball];

      const totalBallsInInnings = prev.totalOvers * 6;
      let isMatchFinished = false;
      let winnerName = prev.winnerTeamName;
      let winMargin = prev.winMargin;

      // Innings 2 Chase Check
      if (prev.innings === 2 && prev.targetScore) {
        if (newScore >= prev.targetScore) {
          isMatchFinished = true;
          winnerName = `${currentBatTeam.name} WON!`;
          winMargin = `Won by ${10 - newWickets} wickets in a sensational chase!`;
        } else if (newBallsDelivered >= totalBallsInInnings || newWickets >= 10) {
          isMatchFinished = true;
          const runDiff = prev.targetScore - 1 - newScore;
          if (runDiff > 0) {
            winnerName = `${prev.teams[prev.bowlingTeamIndex].name} WON!`;
            winMargin = `Defended total by ${runDiff} runs!`;
          } else {
            winnerName = 'MATCH TIED!';
            winMargin = 'Scores level! Heading to a Super Over!';
          }
        }
      } else if (prev.innings === 1) {
        if (newBallsDelivered >= totalBallsInInnings || newWickets >= 10) {
          const target = newScore + 1;
          commentaryEngine.speak(`End of 1st Innings! Target set to ${target} runs.`);
          setIsUserBatting((prevBat) => !prevBat);
          setCameraPreset(isUserBatting ? 'bowler_runup' : 'batsman_view');

          return {
            ...prev,
            innings: 2,
            battingTeamIndex: prev.bowlingTeamIndex,
            bowlingTeamIndex: prev.battingTeamIndex,
            totalBallsDelivered: 0,
            currentOver: 0,
            currentBallInOver: 0,
            totalScore: 0,
            totalWickets: 0,
            targetScore: target,
            strikerIndex: 0,
            nonStrikerIndex: 1,
            currentBowlerIndex: 6,
            overHistory: [],
            allDeliveries: allDelivs,
            currentRunRate: 0,
          };
        }
      }

      const crr = newBallsDelivered > 0 ? (newScore / (newBallsDelivered / 6)) : 0;

      return {
        ...prev,
        currentOver: newOver,
        currentBallInOver: newBallInOver,
        totalBallsDelivered: newBallsDelivered,
        totalScore: newScore,
        totalWickets: newWickets,
        strikerIndex: nextStriker,
        nonStrikerIndex: nextNonStriker,
        overHistory: newBallInOver === 0 ? [] : updatedHistory,
        allDeliveries: allDelivs,
        isMatchOver: isMatchFinished,
        winnerTeamName: winnerName,
        winMargin,
        currentRunRate: crr,
      };
    });
  };

  const handleOpenDRS = (ball?: BallResult) => {
    const res = ball || lastBallResult;
    if (!res) return;

    setCameraPreset('hawk_eye_drs');
    const isOutDecision = Math.random() < 0.65;

    setDrsData({
      isOpen: true,
      ballResult: res,
      pitching: 'in_line',
      impact: 'in_line',
      wickets: isOutDecision ? 'hitting' : 'missing',
      ultraEdgeSpike: isOutDecision,
      verdict: isOutDecision ? 'OUT' : 'NOT OUT',
      stage: 'checking_no_ball',
    });
  };

  const handleApplyDRSVerdict = (isOut: boolean) => {
    setDrsData(null);
    setCanReviewDRS(false);
    setCameraPreset(isUserBatting ? 'batsman_view' : 'bowler_runup');

    if (!isOut && lastBallResult?.isWicket) {
      setMatchState((prev) => ({
        ...prev,
        totalWickets: Math.max(0, prev.totalWickets - 1),
      }));
      commentaryEngine.speak('Decision overturned by Third Umpire! NOT OUT.');
    } else {
      commentaryEngine.speak('Decision upheld. OUT confirmed on big screen.');
    }
  };

  const handleExecuteShot = (params: {
    shotType: ShotType;
    shotAngleRad: number;
    isLofted: boolean;
    timing: ShotTiming;
  }) => {
    setUserShotChoice({
      deliveryId: deliveryTriggerId,
      ...params,
      isPlayerShot: true,
    });
  };

  const triggerPlayerShot = (specificShot?: ShotType) => {
    if (!isBowlingActive) return;

    let timing: ShotTiming = 'good';
    if (isTimingSweetSpot) {
      timing = Math.random() < 0.7 ? 'perfect' : 'good';
    } else if (timingMeterProgress > 0.45 && timingMeterProgress < 0.85) {
      timing = 'good';
    } else if (timingMeterProgress > 0.85) {
      timing = 'late';
    } else if (timingMeterProgress < 0.25) {
      timing = 'miss';
    } else {
      timing = 'early';
    }

    let shotType: ShotType = specificShot || 'straight_drive';
    let angleRad = 0;
    let isLofted = timing === 'perfect' || Math.random() < 0.35;

    if (!specificShot) {
      if (batsmanX < -0.25) {
        shotType = batsmanX < -0.6 ? 'square_cut' : 'cover_drive';
        angleRad = batsmanX < -0.6 ? 1.35 : 0.65;
      } else if (batsmanX > 0.25) {
        shotType = batsmanX > 0.6 ? 'leg_glance' : 'pull_shot';
        angleRad = batsmanX > 0.6 ? -1.5 : -0.85;
      } else {
        shotType = 'straight_drive';
        angleRad = 0.0;
      }
    } else {
      if (specificShot === 'cover_drive') angleRad = 0.65;
      else if (specificShot === 'pull_shot') angleRad = -0.85;
      else if (specificShot === 'square_cut') angleRad = 1.45;
      else if (specificShot === 'leg_glance') angleRad = -1.5;
      else if (specificShot === 'helicopter') {
        angleRad = -0.35;
        isLofted = true;
      } else if (specificShot === 'dilscoop') {
        angleRad = 3.14;
        isLofted = true;
      } else if (specificShot === 'defensive') {
        angleRad = 0;
        isLofted = false;
      }
    }

    handleExecuteShot({
      shotType,
      shotAngleRad: angleRad,
      isLofted,
      timing,
    });
  };

  // Launch Match from Team Selection Screen
  const handleStartGameFromTeamSelect = (config: {
    playerTeam: CricketTeam;
    opponentTeam: CricketTeam;
    overs: number;
    weather: WeatherCondition;
  }) => {
    const t1 = JSON.parse(JSON.stringify(config.playerTeam));
    const t2 = JSON.parse(JSON.stringify(config.opponentTeam));

    setCurrentWeather(config.weather);
    setMatchState({
      id: 'match_' + Date.now(),
      mode: 'quick',
      totalOvers: config.overs,
      weather: config.weather.id,
      battingTeamIndex: 0,
      bowlingTeamIndex: 1,
      teams: [t1, t2],
      innings: 1,
      currentOver: 0,
      currentBallInOver: 0,
      totalBallsDelivered: 0,
      totalScore: 0,
      totalWickets: 0,
      targetScore: null,
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 6,
      overHistory: [],
      allDeliveries: [],
      isMatchOver: false,
      currentRunRate: 0,
    });

    setCurrentScreen('in_game');
    setIsTossOpen(true);
  };

  // Launch Super Over Mode
  const handleStartSuperOver = () => {
    const t1 = JSON.parse(JSON.stringify(CRICKET_TEAMS[0]));
    const t2 = JSON.parse(JSON.stringify(CRICKET_TEAMS[1]));

    setMatchState({
      id: 'super_over_' + Date.now(),
      mode: 'super_over',
      totalOvers: 1,
      weather: currentWeather.id,
      battingTeamIndex: 0,
      bowlingTeamIndex: 1,
      teams: [t1, t2],
      innings: 1,
      currentOver: 0,
      currentBallInOver: 0,
      totalBallsDelivered: 0,
      totalScore: 0,
      totalWickets: 0,
      targetScore: null,
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 6,
      overHistory: [],
      allDeliveries: [],
      isMatchOver: false,
      currentRunRate: 0,
    });

    setCurrentScreen('in_game');
    setIsTossOpen(true);
  };

  // Launch Match from Multiplayer Lobby
  const handleStartMultiplayerMatch = (config: {
    roomCode: string;
    opponentName: string;
    playerTeam: CricketTeam;
    opponentTeam: CricketTeam;
    totalOvers: number;
    userBatsFirst: boolean;
  }) => {
    const t1 = JSON.parse(JSON.stringify(config.playerTeam));
    const t2 = JSON.parse(JSON.stringify(config.opponentTeam));

    setMatchState({
      id: config.roomCode,
      mode: 'multiplayer',
      totalOvers: config.totalOvers,
      weather: currentWeather.id,
      battingTeamIndex: config.userBatsFirst ? 0 : 1,
      bowlingTeamIndex: config.userBatsFirst ? 1 : 0,
      teams: [t1, t2],
      innings: 1,
      currentOver: 0,
      currentBallInOver: 0,
      totalBallsDelivered: 0,
      totalScore: 0,
      totalWickets: 0,
      targetScore: null,
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 6,
      overHistory: [],
      allDeliveries: [],
      isMatchOver: false,
      currentRunRate: 0,
    });

    setIsUserBatting(config.userBatsFirst);
    setCameraPreset(config.userBatsFirst ? 'batsman_view' : 'bowler_runup');
    setCurrentScreen('in_game');
  };

  // Launch Tournament Fixture
  const handlePlayFixture = (team1: CricketTeam, team2: CricketTeam) => {
    const t1 = JSON.parse(JSON.stringify(team1));
    const t2 = JSON.parse(JSON.stringify(team2));

    setMatchState({
      id: 'tourney_' + Date.now(),
      mode: 'tournament',
      totalOvers: 2,
      weather: currentWeather.id,
      battingTeamIndex: 0,
      bowlingTeamIndex: 1,
      teams: [t1, t2],
      innings: 1,
      currentOver: 0,
      currentBallInOver: 0,
      totalBallsDelivered: 0,
      totalScore: 0,
      totalWickets: 0,
      targetScore: null,
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 6,
      overHistory: [],
      allDeliveries: [],
      isMatchOver: false,
      currentRunRate: 0,
    });
    setIsUserBatting(true);
    setCameraPreset('batsman_view');
    setCurrentScreen('in_game');
  };

  // Toss Complete
  const handleTossComplete = (userBatsFirst: boolean) => {
    setIsTossOpen(false);
    setIsUserBatting(userBatsFirst);
    setCameraPreset(userBatsFirst ? 'batsman_view' : 'bowler_runup');
    setMatchState((prev) => ({
      ...prev,
      battingTeamIndex: userBatsFirst ? 0 : 1,
      bowlingTeamIndex: userBatsFirst ? 1 : 0,
    }));
  };

  // Audio Toggle
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    commentaryEngine.setVoiceEnabled(next);
  };

  // Global Keyboard Shortcuts (active during in_game match)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'escape' && currentScreen === 'in_game') {
        setCurrentScreen('main_menu');
        return;
      }

      if (key === 'u') {
        setIsUnityExportOpen(true);
        return;
      }

      if (currentScreen === 'in_game') {
        if (isUserBatting) {
          // Player movement left & right along crease
          if (e.key === 'ArrowLeft' || key === 'a') {
            e.preventDefault();
            setBatsmanX((prev) => Math.max(-1.1, +(prev - 0.12).toFixed(2)));
            return;
          }
          if (e.key === 'ArrowRight' || key === 'd') {
            e.preventDefault();
            setBatsmanX((prev) => Math.min(1.1, +(prev + 0.12).toFixed(2)));
            return;
          }
          // Bat swing triggers
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            triggerPlayerShot();
            return;
          }
          if (key === 'w' || e.key === 'ArrowUp') {
            e.preventDefault();
            triggerPlayerShot('straight_drive');
            return;
          }
          if (key === 's' || e.key === 'ArrowDown') {
            e.preventDefault();
            triggerPlayerShot('defensive');
            return;
          }
          if (key === 'q') {
            e.preventDefault();
            triggerPlayerShot('square_cut');
            return;
          }
          if (key === 'e') {
            e.preventDefault();
            triggerPlayerShot('helicopter');
            return;
          }
          if (key === 'z') {
            e.preventDefault();
            triggerPlayerShot('dilscoop');
            return;
          }
        } else {
          // User is bowling
          if (e.key === 'ArrowLeft' || key === 'a') {
            setBowlingPitchX((prev) => Math.max(-1.0, +(prev - 0.1).toFixed(2)));
            return;
          }
          if (e.key === 'ArrowRight' || key === 'd') {
            setBowlingPitchX((prev) => Math.min(1.0, +(prev + 0.1).toFixed(2)));
            return;
          }
          if (e.key === 'ArrowUp' || key === 'w') {
            setBowlingPitchZ((prev) => Math.max(-14.0, +(prev - 0.4).toFixed(2)));
            return;
          }
          if (e.key === 'ArrowDown' || key === 's') {
            setBowlingPitchZ((prev) => Math.min(-8.0, +(prev + 0.4).toFixed(2)));
            return;
          }
          if (e.key === ' ' || e.key === 'Enter') {
            if (!isBowlingActive) triggerNextDelivery();
            return;
          }
          if (key === '1') setSelectedDelivery('fast_straight');
          else if (key === '2') setSelectedDelivery('outswinger');
          else if (key === '3') setSelectedDelivery('inswinger');
          else if (key === '4') setSelectedDelivery('yorker');
          else if (key === '5') setSelectedDelivery('bouncer');
        }

        // Camera and UI shortcuts
        if (key === 'c') {
          setCameraPreset((prev) => {
            if (prev === 'front_view') return 'batsman_view';
            if (prev === 'batsman_view') return 'bowler_runup';
            if (prev === 'bowler_runup') return 'broadcast_tv';
            if (prev === 'broadcast_tv') return 'boundary_chase';
            return 'front_view';
          });
        } else if (key === 'b') {
          setIsUserBatting((prev) => {
            const next = !prev;
            setCameraPreset(next ? 'front_view' : 'bowler_runup');
            return next;
          });
        } else if (key === 'r') {
          if (canReviewDRS) {
            handleOpenDRS();
          }
        } else if (e.key === 'Tab') {
          e.preventDefault();
          setIsScorecardOpen((prev) => !prev);
        } else if (key === 'x') {
          setIsWeatherOpen((prev) => !prev);
        } else if (key === 'm') {
          toggleAudio();
        } else if (key === 't') {
          setIsTossOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [currentScreen, canReviewDRS, isAudioMuted, isUserBatting, isBowlingActive, timingMeterProgress, isTimingSweetSpot, batsmanX, deliveryTriggerId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Main Menu Screen */}
      {currentScreen === 'main_menu' && (
        <MainMenu
          onStartQuickMatch={() => setCurrentScreen('team_selection')}
          onOpenTournament={() => setIsTournamentOpen(true)}
          onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
          onStartSuperOver={handleStartSuperOver}
          onOpenControlsGuide={() => setIsControlsGuideOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUnityExport={() => setIsUnityExportOpen(true)}
        />
      )}

      {/* 2. Team Selection Screen */}
      {currentScreen === 'team_selection' && (
        <TeamSelectionScreen
          onStartGame={handleStartGameFromTeamSelect}
          onBackToMenu={() => setCurrentScreen('main_menu')}
        />
      )}

      {/* 3. In-Game 3D Cricket Experience (Clean Viewport, Pure 3D Field) */}
      {currentScreen === 'in_game' && (
        <>
          {/* 3D WebGL Canvas Layer with Direct Click/Tap to Swing Bat */}
          <div
            className="w-full h-full cursor-pointer select-none"
            onClick={() => {
              if (isUserBatting && isBowlingActive) {
                triggerPlayerShot();
              }
            }}
          >
            <CricketCanvas
              weather={currentWeather}
              battingTeam={matchState.teams[matchState.battingTeamIndex]}
              bowlingTeam={matchState.teams[matchState.bowlingTeamIndex]}
              cameraPreset={cameraPreset}
              onBallComplete={handleBallComplete}
              onTimingMeterTick={(progress, sweetSpot) => {
                setTimingMeterProgress(progress);
                setIsTimingSweetSpot(sweetSpot);
              }}
              deliveryTriggerId={deliveryTriggerId}
              selectedDelivery={selectedDelivery}
              bowlingPitchX={bowlingPitchX}
              bowlingPitchZ={bowlingPitchZ}
              bowlingSpeedKmh={bowlingSpeedKmh}
              userShotChoice={userShotChoice}
              isUserBatting={isUserBatting}
              onTriggerDRS={handleOpenDRS}
              batsmanX={batsmanX}
            />
          </div>

          {/* Television Broadcast HUD Overlay (with Back to Menu & Back to Teams buttons) */}
          <BroadcastHUD
            matchState={matchState}
            lastBall={lastBallResult}
            cameraPreset={cameraPreset}
            onCameraChange={setCameraPreset}
            onOpenScorecard={() => setIsScorecardOpen(true)}
            onOpenWeather={() => setIsWeatherOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenDRS={() => handleOpenDRS()}
            canReviewDRS={canReviewDRS}
            isAudioMuted={isAudioMuted}
            onToggleAudio={toggleAudio}
            onOpenTournament={() => setIsTournamentOpen(true)}
            onOpenMultiplayer={() => setIsMultiplayerOpen(true)}
            onBackToMenu={() => setCurrentScreen('main_menu')}
            onBackToTeams={handleBackToTeams}
          />
        </>
      )}

      {/* Modals & Overlays */}
      {/* 4. Controls & Keybindings Guide Modal */}
      {isControlsGuideOpen && (
        <ControlsGuideModal onClose={() => setIsControlsGuideOpen(false)} />
      )}

      {/* 5. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isAudioMuted={isAudioMuted}
          onToggleAudio={toggleAudio}
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={toggleVoice}
          currentWeather={currentWeather}
          onSelectWeather={(w) => {
            setCurrentWeather(w);
            setMatchState((prev) => ({ ...prev, weather: w.id }));
          }}
          cameraPreset={cameraPreset}
          onSelectCameraPreset={setCameraPreset}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          onOpenUnityExport={() => setIsUnityExportOpen(true)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Unity 3D Engine Architecture & C# Scripts Modal */}
      {isUnityExportOpen && (
        <UnityExportModal onClose={() => setIsUnityExportOpen(false)} />
      )}

      {/* 6. DRS Review Modal */}
      {drsData && (
        <DRSReviewModal
          data={drsData}
          onClose={() => setDrsData(null)}
          onApplyVerdict={handleApplyDRSVerdict}
        />
      )}

      {/* 7. Full Match Scorecard Modal */}
      {isScorecardOpen && (
        <ScorecardModal
          matchState={matchState}
          onClose={() => setIsScorecardOpen(false)}
        />
      )}

      {/* 8. Weather Selector Modal */}
      {isWeatherOpen && (
        <WeatherSelector
          currentWeather={currentWeather}
          onSelectWeather={(w) => {
            setCurrentWeather(w);
            setMatchState((prev) => ({ ...prev, weather: w.id }));
          }}
          onClose={() => setIsWeatherOpen(false)}
        />
      )}

      {/* 9. Online Multiplayer Lobby */}
      {isMultiplayerOpen && (
        <MultiplayerLobby
          onStartMatch={handleStartMultiplayerMatch}
          onClose={() => setIsMultiplayerOpen(false)}
        />
      )}

      {/* 10. Tournament Bracket Modal */}
      {isTournamentOpen && (
        <TournamentBracket
          onPlayFixture={handlePlayFixture}
          onClose={() => setIsTournamentOpen(false)}
        />
      )}

      {/* 11. Match Conclusion Modal */}
      {matchState.isMatchOver && (
        <MatchOverModal
          matchState={matchState}
          onRematch={() => {
            const t1 = JSON.parse(JSON.stringify(CRICKET_TEAMS[0]));
            const t2 = JSON.parse(JSON.stringify(CRICKET_TEAMS[1]));
            setMatchState({
              id: 'match_' + Date.now(),
              mode: 'quick',
              totalOvers: 2,
              weather: currentWeather.id,
              battingTeamIndex: 0,
              bowlingTeamIndex: 1,
              teams: [t1, t2],
              innings: 1,
              currentOver: 0,
              currentBallInOver: 0,
              totalBallsDelivered: 0,
              totalScore: 0,
              totalWickets: 0,
              targetScore: null,
              strikerIndex: 0,
              nonStrikerIndex: 1,
              currentBowlerIndex: 6,
              overHistory: [],
              allDeliveries: [],
              isMatchOver: false,
              currentRunRate: 0,
            });
            setIsTossOpen(true);
          }}
          onOpenScorecard={() => setIsScorecardOpen(true)}
          onBackToTeams={handleBackToTeams}
        />
      )}

      {/* 12. Coin Toss Modal */}
      {isTossOpen && (
        <TossModal
          playerTeam={matchState.teams[0]}
          opponentTeam={matchState.teams[1]}
          onTossComplete={handleTossComplete}
          onBackToTeams={handleBackToTeams}
        />
      )}
    </div>
  );
}
