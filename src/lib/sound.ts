/**
 * Optional sounds, made on the fly with WebAudio so there are no audio files to ship.
 * Both are silent unless the "Page sound" setting is on (callers pass `enabled`).
 */
let audio: AudioContext | null = null;
const ctx = () => (audio ??= new AudioContext());

/** A soft rustle of paper for each page turn. */
export function playPaper(enabled: boolean): void {
  if (!enabled) return;
  try {
    const a = ctx(),
      dur = 0.42,
      sr = a.sampleRate;
    const buf = a.createBuffer(1, Math.floor(sr * dur), sr),
      d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 2) * (0.6 + 0.4 * Math.random());
    }
    const src = a.createBufferSource();
    src.buffer = buf;
    const bp = a.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2300;
    bp.Q.value = 0.6;
    const g = a.createGain();
    g.gain.value = 0.16;
    src.connect(bp).connect(g).connect(a.destination);
    src.start();
  } catch {
    /* audio is a nicety; never let it break reading */
  }
}

/** A gentle bloop when a button is released. Higher `pitch` for toggling something on. */
export function bloop(enabled: boolean, pitch = 1): void {
  if (!enabled) return;
  try {
    const a = ctx(),
      t = a.currentTime,
      o = a.createOscillator(),
      g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(520 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(260 * pitch, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 0.2);
  } catch {
    /* see above */
  }
}
