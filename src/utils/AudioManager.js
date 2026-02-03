// Audio Manager - Procedural sound effects using Web Audio API
// No external audio files needed - all sounds generated programmatically

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.volume = 0.3;
    this.audioContext = null;

    // Initialize Web Audio API
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Resume audio context (required after user interaction)
  resumeAudio() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Create oscillator-based tone
  playTone(frequency, duration, type = 'sine', fadeOut = true) {
    if (!this.enabled || !this.audioContext) return;
    this.resumeAudio();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = this.volume;

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();

    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    }

    osc.stop(this.audioContext.currentTime + duration);
  }

  // Create noise burst (for explosions)
  playNoise(duration, volume = 1) {
    if (!this.enabled || !this.audioContext) return;
    this.resumeAudio();

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    gain.gain.value = this.volume * volume;
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    noise.start();
  }

  playScan() {
    if (!this.enabled) return;
    // Sonar ping - rising frequency sweep
    this.playTone(400, 0.15, 'sine');
    setTimeout(() => this.playTone(800, 0.1, 'sine'), 50);
  }

  playNeutralized() {
    if (!this.enabled) return;
    // Success sound - pleasant chord
    this.playTone(523, 0.2, 'sine'); // C
    setTimeout(() => this.playTone(659, 0.2, 'sine'), 50); // E
    setTimeout(() => this.playTone(784, 0.3, 'sine'), 100); // G
  }

  playExplosion() {
    if (!this.enabled) return;
    // Explosion - low noise burst with rumble
    this.playNoise(0.5, 1.5);
    this.playTone(60, 0.4, 'sine');
    this.playTone(40, 0.5, 'triangle');
  }

  playWarning() {
    if (!this.enabled) return;
    // Warning beep
    this.playTone(880, 0.1, 'square');
    setTimeout(() => this.playTone(880, 0.1, 'square'), 150);
  }

  playMiss() {
    if (!this.enabled) return;
    // Descending tone for miss
    this.playTone(400, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.15, 'sawtooth'), 100);
  }

  playBlueFalcon() {
    if (!this.enabled) return;
    // Shame sound - descending minor third
    this.playTone(440, 0.3, 'triangle');
    setTimeout(() => this.playTone(349, 0.4, 'triangle'), 200);
    // Distant explosion
    setTimeout(() => this.playNoise(0.4, 0.5), 400);
  }

  playPerfect() {
    if (!this.enabled) return;
    // Sparkle sound for perfect timing
    this.playTone(1047, 0.1, 'sine'); // High C
    setTimeout(() => this.playTone(1319, 0.1, 'sine'), 50); // High E
    setTimeout(() => this.playTone(1568, 0.15, 'sine'), 100); // High G
  }

  playCritical() {
    if (!this.enabled) return;
    // Urgent alarm
    this.playTone(880, 0.15, 'square');
    setTimeout(() => this.playTone(660, 0.15, 'square'), 200);
  }

  stopCritical() {
    // No-op for procedural audio
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  mute() {
    this.enabled = false;
  }

  unmute() {
    this.enabled = true;
  }
}
