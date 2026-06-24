// Utility to play synthesized beeps using Web Audio API
export const playBeep = (frequency: number = 440, duration: number = 0.1, type: OscillatorType = 'sine') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime); // Volume 10%
  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};
