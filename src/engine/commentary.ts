import { BallResult, MatchState } from '../types/cricket';

/**
 * Cricket Commentary System with Text-to-Speech support
 */
class CricketCommentaryEngine {
  private voiceEnabled: boolean = true;
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth?.getVoices() || [];
      // Prefer British or Indian English accent for authentic cricket flavor
      const cricketVoice =
        voices.find((v) => v.lang === 'en-GB') ||
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang.startsWith('en'));
      if (cricketVoice) {
        this.selectedVoice = cricketVoice;
      }
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public speak(text: string) {
    if (!this.voiceEnabled || !this.synth) return;
    try {
      this.synth.cancel(); // clear queue for fresh line
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.pitch = 1.05;
      utterance.rate = 1.1;
      this.synth.speak(utterance);
    } catch {
      // SpeechSynthesis gracefully fails in some environments
    }
  }

  public generateOverSummary(over: number, score: number, wickets: number, runsInOver: number): string {
    return `End of Over ${over}. The score moves to ${score} for ${wickets}. ${runsInOver} runs came off that over.`;
  }

  public generateSituationBanner(state: MatchState): string {
    if (state.innings === 2 && state.targetScore) {
      const runsNeeded = state.targetScore - state.totalScore;
      const ballsRemaining = state.totalOvers * 6 - state.totalBallsDelivered;
      if (runsNeeded <= 0) {
        return `${state.teams[state.battingTeamIndex].name} has won the championship match!`;
      }
      return `Need ${runsNeeded} runs from ${ballsRemaining} balls to win (Req. RR: ${state.requiredRunRate?.toFixed(2)})`;
    }
    return `Current Run Rate: ${state.currentRunRate.toFixed(2)} | Target projected: ${Math.round(state.currentRunRate * state.totalOvers)}`;
  }
}

export const commentaryEngine = new CricketCommentaryEngine();
