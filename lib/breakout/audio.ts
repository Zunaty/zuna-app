import type { BreakoutSettings } from "@/lib/breakout/storage";

export type BreakoutSoundKind =
  | "paddle"
  | "wall"
  | "brick-break"
  | "brick-hit"
  | "launch"
  | "life-lost"
  | "level-clear"
  | "draft-pick"
  | "game-over";

type ToneStep = {
  frequency: number;
  /** Seconds after the sound starts. */
  at: number;
  duration: number;
};

const SOUNDS: Record<BreakoutSoundKind, { type: OscillatorType; gain: number; steps: ToneStep[] }> = {
  paddle: { type: "square", gain: 0.08, steps: [{ frequency: 220, at: 0, duration: 0.06 }] },
  wall: { type: "square", gain: 0.05, steps: [{ frequency: 160, at: 0, duration: 0.04 }] },
  "brick-break": { type: "square", gain: 0.1, steps: [{ frequency: 440, at: 0, duration: 0.07 }] },
  "brick-hit": { type: "square", gain: 0.08, steps: [{ frequency: 300, at: 0, duration: 0.05 }] },
  launch: { type: "triangle", gain: 0.1, steps: [{ frequency: 330, at: 0, duration: 0.08 }] },
  "life-lost": {
    type: "sawtooth",
    gain: 0.09,
    steps: [
      { frequency: 330, at: 0, duration: 0.1 },
      { frequency: 247, at: 0.1, duration: 0.1 },
      { frequency: 165, at: 0.2, duration: 0.16 },
    ],
  },
  "level-clear": {
    type: "triangle",
    gain: 0.1,
    steps: [
      { frequency: 392, at: 0, duration: 0.09 },
      { frequency: 494, at: 0.09, duration: 0.09 },
      { frequency: 587, at: 0.18, duration: 0.14 },
    ],
  },
  "draft-pick": { type: "triangle", gain: 0.1, steps: [{ frequency: 523, at: 0, duration: 0.1 }] },
  "game-over": {
    type: "sawtooth",
    gain: 0.09,
    steps: [
      { frequency: 294, at: 0, duration: 0.12 },
      { frequency: 220, at: 0.12, duration: 0.12 },
      { frequency: 147, at: 0.24, duration: 0.22 },
    ],
  },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    const AudioContextCtor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

export function playBreakoutSound(kind: BreakoutSoundKind, settings: Pick<BreakoutSettings, "volume" | "isMuted">) {
  if (settings.isMuted || settings.volume <= 0) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  void context.resume();

  const sound = SOUNDS[kind];
  const start = context.currentTime;

  for (const step of sound.steps) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = sound.type;
    oscillator.frequency.value = step.frequency;
    gain.gain.value = settings.volume * sound.gain;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start + step.at);
    gain.gain.setValueAtTime(settings.volume * sound.gain, start + step.at);
    gain.gain.exponentialRampToValueAtTime(0.001, start + step.at + step.duration);
    oscillator.stop(start + step.at + step.duration);
  }
}
