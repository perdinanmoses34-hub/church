// Audio Sound Effect Helper using Web Audio API for Chimes & Alerts

export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    
    // Function to play a clean harmonic tone
    const playNote = (freq: number, startTime: number, duration: number, vol = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Upbeat 3-note chime sequence: E5 (659Hz) -> A5 (880Hz) -> C#6 (1108Hz)
    playNote(659.25, 0.0, 0.25, 0.3);
    playNote(880.00, 0.12, 0.3, 0.35);
    playNote(1108.73, 0.26, 0.5, 0.4);
  } catch (err) {
    console.warn('Audio chime playback blocked or unavailable:', err);
  }
};

export const playWarningChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'triangle') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Urgent 2-tone alarm chime (A5 -> F#5 -> A5)
    playNote(880.00, 0.0, 0.18, 'sine');
    playNote(739.99, 0.15, 0.18, 'sine');
    playNote(880.00, 0.3, 0.35, 'sine');
  } catch (err) {
    console.warn('Warning chime playback blocked or unavailable:', err);
  }
};

/**
 * Loud security alarm siren with alternating frequencies (two-tone emergency siren)
 * and buzzer pulses to warn users of security rule violations.
 */
let activeAlarmOscillators: { stop: () => void } | null = null;

export const playSecurityAlarmSiren = (durationMs: number = 3000): (() => void) => {
  try {
    stopSecurityAlarmSiren();

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return () => {};

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    // Modulate frequency between 900Hz and 600Hz like a police/security alarm siren
    const now = ctx.currentTime;
    const cycle = 0.35; // cycle every 350ms
    const totalCycles = Math.ceil(durationMs / (cycle * 1000 * 2));

    for (let i = 0; i < totalCycles * 2; i++) {
      const t = now + i * cycle;
      const freq1 = i % 2 === 0 ? 987.77 : 659.25; // B5 to E5
      const freq2 = i % 2 === 0 ? 995.00 : 665.00; // Slight detune for harsh siren effect
      osc1.frequency.setValueAtTime(freq1, t);
      osc2.frequency.setValueAtTime(freq2, t);
    }

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    const stopFn = () => {
      try {
        gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            ctx.close().catch(() => {});
          } catch (e) {
            // ignore
          }
        }, 60);
      } catch (e) {
        // ignore
      }
      activeAlarmOscillators = null;
    };

    activeAlarmOscillators = { stop: stopFn };

    if (durationMs > 0) {
      setTimeout(() => {
        stopFn();
      }, durationMs);
    }

    return stopFn;
  } catch (err) {
    console.warn('Security alarm siren playback error:', err);
    return () => {};
  }
};

export const stopSecurityAlarmSiren = () => {
  if (activeAlarmOscillators) {
    try {
      activeAlarmOscillators.stop();
    } catch (e) {
      // ignore
    }
    activeAlarmOscillators = null;
  }
};

