type SfxKind =
  | 'correct' | 'wrong' | 'victory' | 'defeat'
  | 'move' | 'chest' | 'buy' | 'heal' | 'roll' | 'boss';

let _ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

function tone(
  freq: number,
  type: OscillatorType,
  vol: number,
  attack: number,
  hold: number,
  release: number,
  delay = 0,
  freqEnd?: number,
) {
  const c  = ac();
  const t0 = c.currentTime + delay;
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 1),
      t0 + attack + hold,
    );
  }
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + attack);
  gain.gain.setValueAtTime(vol, t0 + attack + hold);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + attack + hold + release);
  osc.start(t0);
  osc.stop(t0 + attack + hold + release + 0.02);
}

function burst(vol: number, dur: number, delay = 0) {
  const c  = ac();
  const t0 = c.currentTime + delay;
  const n  = c.sampleRate * dur;
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src  = c.createBufferSource();
  const gain = c.createGain();
  src.buffer = buf;
  src.connect(gain);
  gain.connect(c.destination);
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function sfx(kind: SfxKind): void {
  try {
    switch (kind) {

      case 'correct':
        // Bright ascending C–E–G arpeggio
        tone(523,  'sine', 0.18, 0.01, 0.05, 0.09);
        tone(659,  'sine', 0.18, 0.01, 0.05, 0.09, 0.10);
        tone(784,  'sine', 0.22, 0.01, 0.09, 0.14, 0.20);
        break;

      case 'wrong':
        // Low buzzy descend + thud
        tone(200, 'sawtooth', 0.14, 0.01, 0.06, 0.14, 0.00, 120);
        tone(160, 'square',   0.07, 0.01, 0.04, 0.10, 0.06);
        break;

      case 'victory':
        // Short fanfare C–E–G–C
        tone(523,  'sine', 0.20, 0.01, 0.07, 0.10);
        tone(659,  'sine', 0.20, 0.01, 0.07, 0.10, 0.12);
        tone(784,  'sine', 0.20, 0.01, 0.07, 0.10, 0.24);
        tone(1046, 'sine', 0.25, 0.01, 0.20, 0.22, 0.36);
        break;

      case 'defeat':
        // Descending ominous tones
        tone(440, 'sawtooth', 0.17, 0.02, 0.10, 0.20, 0.00, 220);
        tone(220, 'sawtooth', 0.14, 0.02, 0.15, 0.28, 0.20, 110);
        tone(110, 'sine',     0.20, 0.03, 0.30, 0.50, 0.35);
        break;

      case 'move':
        // Very soft footstep click
        burst(0.05, 0.055);
        break;

      case 'boss':
        // Deep dramatic stab
        tone(110, 'sawtooth', 0.22, 0.02, 0.18, 0.38);
        tone(73,  'sine',     0.26, 0.03, 0.35, 0.50, 0.05);
        tone(147, 'sawtooth', 0.12, 0.02, 0.12, 0.30, 0.10);
        break;

      case 'chest':
        // Bright sparkle arpeggio
        tone(880,  'sine', 0.15, 0.01, 0.04, 0.09);
        tone(1108, 'sine', 0.15, 0.01, 0.04, 0.09, 0.09);
        tone(1318, 'sine', 0.18, 0.01, 0.09, 0.16, 0.18);
        break;

      case 'buy':
        // Coin jingle — two quick high tones
        tone(660, 'sine', 0.15, 0.01, 0.03, 0.08);
        tone(880, 'sine', 0.18, 0.01, 0.04, 0.09, 0.09);
        break;

      case 'heal':
        // Soft rising shimmer
        tone(523, 'sine', 0.13, 0.02, 0.14, 0.22, 0.00, 784);
        tone(659, 'sine', 0.11, 0.02, 0.10, 0.18, 0.16);
        break;

      case 'roll':
        // Dice rattle — three noise bursts
        burst(0.10, 0.07);
        burst(0.08, 0.06, 0.10);
        burst(0.09, 0.07, 0.19);
        break;
    }
  } catch {
    // AudioContext unavailable — silently skip
  }
}
