class VirtualSoundTable {
  constructor() {
    const playbackToggle = document.getElementById("virtualPlaybackToggle");
    playbackToggle.addEventListener("change", () => {
      if (playbackToggle.checked) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        this.preloadSamples();
      }
      if (!playbackToggle.checked) {
        this.stopAllNotes();
      }
    });

    this.activeNotes = {}; // Store arrays of active sources per note
    this.sustain = false; // Sustain pedal state
    this.sustainedNotes = new Set(); // Stores notes held during sustain
    this.heldNotes = new Set(); // Tracks physically held keys
    this.sampleCache = {}; // Store preloaded audio buffers
  }

  async preloadSamples() {
    console.log("Preloading samples...");
    const velocityLevels = [31, 63, 95, 127];
    const notes = Array.from({ length: 108 - 21 + 1 }, (_, i) => i + 21); // MIDI notes 21-108
    const playbackText = document.getElementById("virtualPlaybackText");
    let i = 1;

    for (const note of notes) {
      this.sampleCache[note] = {};
      for (const velocity of velocityLevels) {
        const filePath = `samples/${note}-${velocity}.mp3`;
        try {
          const response = await fetch(filePath);
          const arrayBuffer = await response.arrayBuffer();
          this.sampleCache[note][velocity] =
            await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.warn(`Failed to load ${filePath}:`, error);
          this.sampleCache[note][velocity] = null; // Mark as unavailable
        }
        playbackText.textContent = `Virtual Playback (${i}/${88 * 4})`;
        i++;
      }
    }
    playbackText.textContent = `Virtual Playback`;
    console.log("Samples preloaded.");
    console.log(this.sampleCache);
  }

  handleMidiMessage(jsonMessage) {
    if (!this.audioContext) {
      console.log("AudioContext is not yet resumed.");
      return;
    }

    const playbackToggle = document.getElementById("virtualPlaybackToggle");
    if (!playbackToggle.checked) {
      console.log("Virtual Playback is disabled.");
      return;
    }

    const { command, note, velocity } = jsonMessage;
    if (note < 21 || note > 108) return; // Ignore out-of-range MIDI notes

    if (command === 144 && velocity > 0) {
      // Note On
      this.heldNotes.add(note);
      this.playNote(note, velocity);
    } else if (command === 144 && velocity === 0) {
      // Note Off
      this.heldNotes.delete(note);
      this.releaseNote(note);
    } else if (command === 176 && note === 64) {
      // Sustain Pedal
      if (velocity > 0) {
        this.sustainOn();
      } else {
        this.sustainOff();
      }
    }
  }

  playNote(note, velocity) {
    const velocityLevels = [31, 63, 95, 127];
    const closestVelocity = velocityLevels.reduce((prev, curr) =>
      Math.abs(curr - velocity) < Math.abs(prev - velocity) ? curr : prev
    );
  
    const buffer = this.sampleCache[note]?.[closestVelocity];
    if (!buffer) {
      console.warn(
        `No preloaded sample for note ${note} at velocity ${closestVelocity}`
      );
      return;
    }
  
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
  
    const gainNode = this.audioContext.createGain();
    //const activeNoteCount = Object.keys(this.activeNotes).length;
    //const adjustedGain = 1 / Math.sqrt(activeNoteCount || 1); // Prevent clipping
    gainNode.gain.setValueAtTime(0.75, this.audioContext.currentTime);
  
    const compressor = this.audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, this.audioContext.currentTime);
    compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
    compressor.attack.setValueAtTime(0.003, this.audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, this.audioContext.currentTime);
  
    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(this.audioContext.destination);
  
    source.start();
  
    if (!this.activeNotes[note]) {
      this.activeNotes[note] = [];
    }
    this.activeNotes[note].push({ source, gainNode });
  }

  releaseNote(note) {
    if (this.sustain) {
      this.sustainedNotes.add(note);
      return;
    }
    this.stopNote(note);
  }

  stopNote(note) {
    if (!this.activeNotes[note]) return;

    const fadeTime = 0.2;
    this.activeNotes[note].forEach(({ source, gainNode }) => {
      gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, fadeTime);
      setTimeout(() => source.stop(), fadeTime * 1000);
    });

    delete this.activeNotes[note]; // Remove all sources for the note
  }

  sustainOn() {
    this.sustain = true;
  }

  sustainOff() {
    this.sustain = false;

    // Stop all sustained notes that are no longer held
    this.sustainedNotes.forEach((note) => {
      if (!this.heldNotes.has(note)) {
        this.stopNote(note);
      }
    });

    this.sustainedNotes.clear();
  }

  stopAllNotes() {
    Object.keys(this.activeNotes).forEach((note) =>
      this.stopNote(parseInt(note))
    );
    this.sustainedNotes.clear();
    this.heldNotes.clear();
  }
}
