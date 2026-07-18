export type ParcelPatrolSound = 'fire' | 'hit' | 'pickup' | 'damage' | 'success' | 'failure';

export class ToneSfx {
  #context: AudioContext | null = null;

  unlock(): void {
    const context = this.#getContext();
    if (context?.state === 'suspended') {
      void context.resume();
    }
  }

  play(sound: ParcelPatrolSound): void {
    const context = this.#getContext();
    if (!context || context.state !== 'running') {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    const settings = getSettings(sound);
    oscillator.type = settings.wave;
    oscillator.frequency.setValueAtTime(settings.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(settings.endFrequency, now + settings.duration);
    gain.gain.setValueAtTime(settings.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + settings.duration);

    oscillator.start(now);
    oscillator.stop(now + settings.duration);
  }

  #getContext(): AudioContext | null {
    if (this.#context) {
      return this.#context;
    }

    const AudioContextConstructor = globalThis.AudioContext;
    if (!AudioContextConstructor) {
      return null;
    }

    this.#context = new AudioContextConstructor();
    return this.#context;
  }
}

interface ToneSettings {
  readonly wave: OscillatorType;
  readonly startFrequency: number;
  readonly endFrequency: number;
  readonly duration: number;
  readonly volume: number;
}

function getSettings(sound: ParcelPatrolSound): ToneSettings {
  switch (sound) {
    case 'fire':
      return { wave: 'square', startFrequency: 680, endFrequency: 360, duration: 0.08, volume: 0.035 };
    case 'hit':
      return { wave: 'sawtooth', startFrequency: 210, endFrequency: 70, duration: 0.12, volume: 0.055 };
    case 'pickup':
      return { wave: 'sine', startFrequency: 520, endFrequency: 980, duration: 0.18, volume: 0.055 };
    case 'damage':
      return { wave: 'square', startFrequency: 140, endFrequency: 55, duration: 0.25, volume: 0.075 };
    case 'success':
      return { wave: 'sine', startFrequency: 520, endFrequency: 1320, duration: 0.42, volume: 0.065 };
    case 'failure':
      return { wave: 'triangle', startFrequency: 260, endFrequency: 75, duration: 0.48, volume: 0.07 };
  }
}
