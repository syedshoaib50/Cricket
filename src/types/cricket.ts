/**
 * Core Cricket Game Types and Data Structures
 */

export type WeatherType = 'sunny' | 'overcast' | 'rainy' | 'sunset' | 'night';

export interface WeatherCondition {
  id: WeatherType;
  name: string;
  temperature: string;
  humidity: number; // 0 - 100
  windSpeed: number; // km/h
  swingFactor: number; // 1.0 = normal, 1.8 = heavy swing
  pitchBounce: number; // 1.0 = standard, 0.8 = wet/dead, 1.2 = hard/bouncy
  pitchFriction: number; // slows down ball
  skyColor: string;
  fogColor: string;
  lightIntensity: number;
  description: string;
}

export type ShotType =
  | 'cover_drive'
  | 'straight_drive'
  | 'pull_shot'
  | 'helicopter'
  | 'late_cut'
  | 'dilscoop'
  | 'square_cut'
  | 'leg_glance'
  | 'defensive';

export type DeliveryType =
  | 'fast_straight'
  | 'outswinger'
  | 'inswinger'
  | 'yorker'
  | 'bouncer'
  | 'slower_ball'
  | 'off_break'
  | 'leg_break'
  | 'googly';

export type ShotTiming = 'perfect' | 'good' | 'early' | 'late' | 'miss';

export interface UserShotChoice {
  deliveryId: number;
  shotType: ShotType;
  shotAngleRad: number;
  isLofted: boolean;
  timing: ShotTiming;
  isPlayerShot: boolean;
}

export interface PlayerStats {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all_rounder' | 'wicket_keeper';
  battingSkill: number; // 60-99
  bowlingSkill: number; // 60-99
  handedness: 'right' | 'left';
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  howOut?: string;
  oversBowled: number;
  runsConceded: number;
  wicketsTaken: number;
  maidens: number;
}

export interface CricketTeam {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  flagEmoji: string;
  players: PlayerStats[];
}

export interface BallResult {
  overNumber: number;
  ballNumber: number;
  runsScored: number;
  isExtra: boolean;
  extraType?: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped';
  shotType?: ShotType;
  shotTiming?: ShotTiming;
  shotDistance?: number;
  commentaryText: string;
  hitX?: number; // landing position on field
  hitZ?: number;
  isBoundary4?: boolean;
  isBoundary6?: boolean;
  bowlerName: string;
  batsmanName: string;
}

export interface MatchState {
  id: string;
  mode: 'quick' | 'multiplayer' | 'tournament' | 'super_over' | 'practice';
  totalOvers: number;
  weather: WeatherType;
  battingTeamIndex: number; // 0 or 1
  bowlingTeamIndex: number;
  teams: [CricketTeam, CricketTeam];
  innings: 1 | 2;
  currentOver: number;
  currentBallInOver: number;
  totalBallsDelivered: number;
  totalScore: number;
  totalWickets: number;
  targetScore: number | null;
  strikerIndex: number;
  nonStrikerIndex: number;
  currentBowlerIndex: number;
  overHistory: BallResult[];
  allDeliveries: BallResult[];
  isMatchOver: boolean;
  winnerTeamName?: string;
  winMargin?: string;
  requiredRunRate?: number;
  currentRunRate: number;
}

export interface DRSReviewData {
  isOpen: boolean;
  ballResult: BallResult;
  pitching: 'in_line' | 'outside_off' | 'outside_leg';
  impact: 'in_line' | 'outside';
  wickets: 'hitting' | 'missing' | 'umpire_call';
  ultraEdgeSpike: boolean;
  verdict: 'OUT' | 'NOT OUT';
  stage: 'checking_no_ball' | 'ultra_edge' | 'ball_tracking' | 'decision';
}

export interface MultiplayerRoom {
  roomCode: string;
  hostName: string;
  guestName: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  selectedTeamHost: string;
  selectedTeamGuest: string;
  turn: 'host_bat' | 'guest_bat';
  overs: number;
  lastActionTimestamp: number;
}
