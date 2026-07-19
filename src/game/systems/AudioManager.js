const TONES = Object.freeze({
  fire: ['square', 720, 390, .07, .035],
  hit: ['sawtooth', 230, 70, .12, .055],
  pickup: ['sine', 520, 1050, .18, .06],
  damage: ['square', 150, 52, .25, .075],
  shield: ['triangle', 420, 900, .26, .05],
  rapid: ['square', 780, 1280, .20, .045],
  success: ['sine', 500, 1450, .42, .07],
  failure: ['triangle', 270, 72, .48, .075],
});

export class AudioManager {
  #context = null;
  unlock() {
    this.#context ??= new AudioContext();
    if (this.#context.state === 'suspended') void this.#context.resume();
  }
  play(name) {
    const settings = TONES[name];
    const context = this.#context;
    if (!settings || !context || context.state !== 'running') return;
    const [wave, start, end, duration, volume] = settings;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.connect(gain); gain.connect(context.destination);
    const now = context.currentTime;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    oscillator.start(now); oscillator.stop(now + duration);
  }
}
