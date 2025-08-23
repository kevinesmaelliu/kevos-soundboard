// Retro Mac System Sounds - Web Audio API Implementation

class RetroSounds {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.audioFiles = new Map(); // For external audio files
        this.initAudioContext();
        this.generateSystemSounds();
        this.loadSystemAudioFiles();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // Generate classic Mac system sounds using Web Audio API
    generateSystemSounds() {
        if (!this.audioContext) return;
        
        // Classic Mac startup chime
        this.sounds.set('startup', this.createStartupChime());
        
        // Button click sound
        this.sounds.set('click', this.createClickSound());
        
        // Window open/close sounds
        this.sounds.set('windowOpen', this.createWindowSound('open'));
        this.sounds.set('windowClose', this.createWindowSound('close'));
        
        // Menu selection sound
        this.sounds.set('menuSelect', this.createMenuSound());
        
        // Error beep
        this.sounds.set('error', this.createErrorBeep());
        
        // Dock bounce sound
        this.sounds.set('dockBounce', this.createDockBounce());
        
        // Simple knob click
        this.sounds.set('knobClick', this.createKnobClick());
    }
    
    createStartupChime() {
        return () => {
            const duration = 1.5;
            const now = this.audioContext.currentTime;
            
            // Create the classic C major chord progression
            const frequencies = [
                [523.25, 659.25, 783.99], // C major
                [587.33, 739.99, 880.00], // D major  
                [659.25, 830.61, 987.77]  // E major
            ];
            
            frequencies.forEach((chord, chordIndex) => {
                chord.forEach((freq, noteIndex) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, now);
                    oscillator.type = 'sine';
                    
                    // Envelope
                    gainNode.gain.setValueAtTime(0, now + chordIndex * 0.4);
                    gainNode.gain.linearRampToValueAtTime(0.1, now + chordIndex * 0.4 + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + chordIndex * 0.4 + 0.5);
                    
                    oscillator.start(now + chordIndex * 0.4);
                    oscillator.stop(now + chordIndex * 0.4 + 0.5);
                });
            });
        };
    }
    
    createClickSound() {
        return () => {
            const duration = 0.1;
            const now = this.audioContext.currentTime;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + duration);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    createWindowSound(type) {
        return () => {
            const duration = 0.3;
            const now = this.audioContext.currentTime;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            if (type === 'open') {
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + duration);
            } else {
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + duration);
            }
            
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.03, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    createMenuSound() {
        return () => {
            const duration = 0.08;
            const now = this.audioContext.currentTime;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, now);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    createErrorBeep() {
        return () => {
            const duration = 0.2;
            const now = this.audioContext.currentTime;
            
            // Double beep pattern
            for (let i = 0; i < 2; i++) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(400, now + i * 0.15);
                oscillator.type = 'sawtooth';
                
                gainNode.gain.setValueAtTime(0.08, now + i * 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);
                
                oscillator.start(now + i * 0.15);
                oscillator.stop(now + i * 0.15 + 0.1);
            }
        };
    }
    
    createDockBounce() {
        return () => {
            const duration = 0.4;
            const now = this.audioContext.currentTime;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Bouncy frequency pattern
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.3);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + duration);
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    createKnobClick() {
        return () => {
            const duration = 0.05;
            const now = this.audioContext.currentTime;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Simple, short click sound
            oscillator.frequency.setValueAtTime(1200, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + duration);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    loadSystemAudioFiles() {
        // Load hover click sound
        const hoverAudio = new Audio('system-sounds/click.mp3');
        hoverAudio.volume = 0.3;
        hoverAudio.preload = 'auto';
        this.audioFiles.set('hover', hoverAudio);
        
        console.log('Loaded system audio files');
    }
    
    play(soundName) {
        // First check if it's an external audio file
        if (this.audioFiles.has(soundName)) {
            const audio = this.audioFiles.get(soundName);
            audio.currentTime = 0; // Reset to beginning
            audio.play().catch(error => {
                console.warn(`Error playing audio file '${soundName}':`, error);
            });
            return;
        }
        
        // Then check if it's a generated sound
        if (!this.audioContext || !this.sounds.has(soundName)) return;
        
        // Resume audio context if it's suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const soundGenerator = this.sounds.get(soundName);
        soundGenerator();
    }
    
    // Play startup sound with delay for dramatic effect
    playStartup() {
        setTimeout(() => this.play('startup'), 500);
    }
}

// Export for use in main script
window.RetroSounds = RetroSounds;