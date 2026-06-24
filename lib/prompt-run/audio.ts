import type { PromptRunSettings } from "@/lib/prompt-run/storage";
import type { Rarity } from "@/lib/prompt-run/types";

const RARITY_FREQUENCIES: Record<Rarity, number> = {
  common: 220,
  uncommon: 277,
  rare: 349,
  epic: 440,
  legendary: 554,
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

export function playRaritySound(rarity: Rarity, settings: Pick<PromptRunSettings, "volume" | "isMuted">): void {
  if (settings.isMuted || settings.volume <= 0) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  void context.resume();

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequency = RARITY_FREQUENCIES[rarity];

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = settings.volume * 0.12;

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  const duration = rarity === "legendary" ? 0.22 : rarity === "epic" ? 0.18 : 0.14;
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
}
