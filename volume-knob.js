class VolumeKnob {
    constructor(knobElement, options = {}) {
        this.knob = knobElement;
        this.currentValue = options.initialValue || 75;
        this.minValue = options.minValue || 0;
        this.maxValue = options.maxValue || 100;
        this.steps = options.steps || 20;
        this.onValueChange = options.onValueChange || (() => {});
        this.soundManager = options.soundManager || null;
        
        this.isDragging = false;
        this.setupEventListeners();
        this.updateVisual();
    }
    
    setupEventListeners() {
        if (!this.knob) return;
        
        let startValue = this.currentValue;
        
        const getValueFromAngle = (centerX, centerY, mouseX, mouseY) => {
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
            const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
            
            // Map angle to value (0-270° range, starting from -135° to +135°)
            let mappedAngle;
            if (degrees <= 135) {
                mappedAngle = degrees + 135; // 0-135° becomes 135-270°
            } else {
                mappedAngle = degrees - 225; // 136-360° becomes -89° to 135°, but we only want 225-360° to become 0-135°
                if (mappedAngle < 0) mappedAngle = 0;
            }
            
            // Convert angle to discrete step
            const rawStep = (mappedAngle / 270) * this.steps;
            const step = Math.round(rawStep);
            return Math.max(this.minValue, Math.min(this.maxValue, (step / this.steps) * (this.maxValue - this.minValue) + this.minValue));
        };
        
        this.knob.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            startValue = this.currentValue;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const rect = this.knob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const newValue = getValueFromAngle(centerX, centerY, e.clientX, e.clientY);
            
            if (Math.abs(newValue - this.currentValue) >= (this.maxValue - this.minValue) / this.steps) {
                this.setValue(newValue, true); // Play sound for significant changes
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Mouse wheel support
        this.knob.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5; // Invert for natural scrolling
            this.setValue(this.currentValue + delta, true);
        });
    }
    
    setValue(value, playSound = false) {
        const oldValue = this.currentValue;
        this.currentValue = Math.max(this.minValue, Math.min(this.maxValue, Math.round(value)));
        
        if (this.currentValue !== oldValue) {
            if (playSound && this.soundManager) {
                this.soundManager.play('hover');
            }
            
            this.updateVisual();
            this.onValueChange(this.currentValue);
        }
    }
    
    updateVisual() {
        const indicator = this.knob.querySelector('.knob-indicator, .mp3-knob-indicator');
        const valueDisplay = document.querySelector(`#${this.knob.id.replace('-knob', '-value')}`);
        
        if (indicator) {
            const percentage = (this.currentValue - this.minValue) / (this.maxValue - this.minValue);
            const rotation = percentage * 270 - 135; // Map to -135° to +135°
            
            // Handle both small and large knob indicators
            if (indicator.classList.contains('mp3-knob-indicator')) {
                // Large knob with different transform origin
                indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            } else {
                // Standard small knob
                indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            }
        }
        
        if (valueDisplay) {
            valueDisplay.textContent = this.currentValue;
        }
    }
    
    getValue() {
        return this.currentValue;
    }
}

// Make available globally
window.VolumeKnob = VolumeKnob;