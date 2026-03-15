/**
 * AudioManager - Handles all game sounds
 */

export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  
  async loadSound(name: string, path: string): Promise<void> {
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', reject, { once: true });
    });
  }
  
  play(name: string, loop: boolean = false): void {
    if (this.muted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      sound.loop = loop;
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Autoplay blocked - that's okay
      });
    }
  }
  
  stop(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  
  stopAll(): void {
    for (const sound of this.sounds.values()) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
  
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAll();
    }
  }
  
  isMuted(): boolean {
    return this.muted;
  }
}
