// Audio System for background music and sound effects
export class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.music = null;
    this.soundEnabled = false; // Désactivé temporairement
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
  }

  // Create and play background music using Web Audio API
  playBackgroundMusic() {
    if (!this.soundEnabled || this.music) return;

    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create nodes
      const masterGain = audioContext.createGain();
      masterGain.gain.value = this.musicVolume;
      masterGain.connect(audioContext.destination);

      // Simple melody loop
      const playNote = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Musical notes (frequencies in Hz)
      const notes = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
        G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
      };

      // Simple cheerful melody
      const melody = [
        { note: notes.C4, duration: 0.3 },
        { note: notes.E4, duration: 0.3 },
        { note: notes.G4, duration: 0.3 },
        { note: notes.C5, duration: 0.6 },
        { note: notes.G4, duration: 0.3 },
        { note: notes.E4, duration: 0.3 },
        { note: notes.C4, duration: 0.6 }
      ];

      // Play melody in loop
      const loopMelody = () => {
        const currentTime = audioContext.currentTime;
        let time = currentTime;

        melody.forEach(({ note, duration }) => {
          playNote(note, time, duration);
          time += duration;
        });

        // Schedule next loop
        this.musicTimeout = setTimeout(loopMelody, melody.reduce((sum, m) => sum + m.duration, 0) * 1000);
      };

      loopMelody();
      this.music = { audioContext, masterGain };
      
      console.log('Background music started');
    } catch (error) {
      console.warn('Could not start background music:', error);
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.music) {
      try {
        if (this.musicTimeout) {
          clearTimeout(this.musicTimeout);
        }
        this.music.audioContext.close();
        this.music = null;
        console.log('Background music stopped');
      } catch (error) {
        console.warn('Error stopping music:', error);
      }
    }
  }

  // Play sound effect
  playSound(type) {
    if (!this.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      gainNode.gain.value = this.sfxVolume;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'collect':
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;

        case 'power':
          oscillator.frequency.value = 400;
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;

        case 'gift':
          oscillator.frequency.value = 1000;
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  // Toggle sound on/off
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    
    if (!this.soundEnabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.soundEnabled;
  }

  // Set music volume (0-1)
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music && this.music.masterGain) {
      this.music.masterGain.gain.value = this.musicVolume;
    }
  }

  // Clean up
  destroy() {
    this.stopBackgroundMusic();
  }
}
