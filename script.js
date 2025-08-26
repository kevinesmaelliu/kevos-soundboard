// Soft OS - Interactive Window Management & UI

// Keyboard Sound Manager
class KeyboardSoundManager {
    constructor() {
        this.keyboardSounds = [];
        this.enabled = true;
        this.volume = 0.3;
        this.lastPlayTime = 0;
        this.minInterval = 50; // Minimum ms between sounds to prevent overlap
        
        this.loadKeyboardSounds();
    }
    
    async loadKeyboardSounds() {
        // Preload all keyboard click sounds
        const soundFiles = [
            'sounds/keyboard clicks/sample1.mp3',
            'sounds/keyboard clicks/sample2.mp3',
            'sounds/keyboard clicks/sample3.mp3',
            'sounds/keyboard clicks/sample4.mp3',
            'sounds/keyboard clicks/sample5.mp3'
        ];
        
        for (const file of soundFiles) {
            try {
                const audio = new Audio(file);
                audio.volume = this.volume;
                audio.preload = 'auto';
                this.keyboardSounds.push(audio);
                console.log(`Loaded keyboard sound: ${file}`);
            } catch (error) {
                console.error(`Failed to load keyboard sound ${file}:`, error);
            }
        }
        
        console.log(`Loaded ${this.keyboardSounds.length} keyboard sounds`);
    }
    
    playRandomKeySound() {
        if (!this.enabled || this.keyboardSounds.length === 0) return;
        
        // Throttle sounds to prevent overlap
        const now = Date.now();
        if (now - this.lastPlayTime < this.minInterval) return;
        this.lastPlayTime = now;
        
        // Pick a random sound
        const randomIndex = Math.floor(Math.random() * this.keyboardSounds.length);
        const sound = this.keyboardSounds[randomIndex];
        
        // Clone the audio to allow overlapping plays
        const audioClone = sound.cloneNode();
        audioClone.volume = this.volume;
        
        // Play the sound
        audioClone.play().catch(error => {
            console.error('Error playing keyboard sound:', error);
        });
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.keyboardSounds.forEach(sound => {
            sound.volume = this.volume;
        });
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

class SoftOS {
    constructor() {
        this.windows = new Map();
        this.windowZIndex = 1000;
        this.activeWindow = null;
        this.sounds = new RetroSounds();
        this.keyboardSounds = new KeyboardSoundManager();
        
        // Task tracking system
        this.completedTasks = new Set();
        this.isTypingWhileRadiohead = false;
        this.radioheadVideoId = 'V_Ydoe4Q-Gg';
        this.typingCharCount = 0;
        this.notesTextarea = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTime();
        this.setupDockInteractions();
        this.setupWindowControls();
        this.setupKeyboardSounds();
        
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
        
        // Set up the terminal
        this.setupTerminal();
    }
    
    setupTerminal() {
        console.log('🔧 Setting up terminal...');
        
        const terminalOutput = document.getElementById('terminal-output');
        if (!terminalOutput) {
            console.error('❌ Terminal output element not found!');
            return;
        }
        
        // Terminal startup sequence
        const bootSequence = [
            { text: 'kevOS Terminal v1.0.1\n', delay: 100 },
            { text: 'Copyright (c) 2025 kevs.fyi\n', delay: 50 },
            { text: 'All systems nominal.\n\n', delay: 100 },
            { text: '> Detecting audio hardware... [OK]\n', delay: 300 },
            { text: '> Initializing sound drivers... [OK]\n', delay: 200 },
            { text: '> Dilly-Dallying... [OK]\n', delay: 200 },
            { text: '> Injecting crypto miner... [ACTIVE]\n', delay: 300 },
            { text: '> Jk. [lol]\n', delay: 300 },
            { text: '> Checking for signs of intelligent life... [TIMEOUT]\n', delay: 1000 },
            { text: '> Anomaly "meow" detected... [???]\n', delay: 400 },
            { text: '  /\\_/\\\n', delay: 100 },
            { text: '  ( o.o )\n', delay: 100 },
            { text: '  > ^ <\n\n', delay: 100 },
            { text: 'System ready.\n', delay: 100 },
            { text: 'Awaiting user input...\n\n', delay: 200 },
            { text: '$ ', delay: 500, final: true }
        ];
        
        // Start with initial terminal animation first
        this.showInitialTerminalText(terminalOutput, bootSequence);
        
        // Make terminal draggable
        this.makeTerminalDraggable();
    }
    
    makeTerminalDraggable() {
        const terminalWindow = document.querySelector('.terminal-window');
        const dragHandle = document.querySelector('.terminal-header.drag-handle');
        
        if (!terminalWindow || !dragHandle) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                isDragging = true;
                dragHandle.style.cursor = 'grabbing';
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                terminalWindow.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
        
        function dragEnd() {
            if (isDragging) {
                isDragging = false;
                dragHandle.style.cursor = 'grab';
            }
        }
        
        // Set initial cursor style
        dragHandle.style.cursor = 'grab';
    }
    
    showInitialTerminalText(terminalOutput, bootSequence) {
        let currentStep = 0;
        let currentText = '';
        
        // Make sure cursor is visible
        const cursor = document.querySelector('.terminal-cursor');
        if (cursor) {
            cursor.style.opacity = '1';
        }
        
        const typeStep = () => {
            if (currentStep >= bootSequence.length) {
                // After animation completes, show prompt for user input
                setTimeout(() => {
                    const finalText = currentText + '\nPress Enter or type "start" to begin...\n$ ';
                    const cursor = terminalOutput.querySelector('.terminal-cursor');
                    terminalOutput.innerHTML = finalText;
                    if (cursor) {
                        terminalOutput.appendChild(cursor);
                    }
                    // Center cursor in viewport
                    requestAnimationFrame(() => {
                        const cursor = terminalOutput.querySelector('.terminal-cursor');
                        if (cursor) {
                            const cursorRect = cursor.getBoundingClientRect();
                            const terminalRect = terminalOutput.getBoundingClientRect();
                            const terminalHeight = terminalOutput.clientHeight;
                            const scrollOffset = terminalOutput.scrollTop;
                            
                            // Calculate cursor position relative to terminal content
                            const cursorTop = cursorRect.top - terminalRect.top + scrollOffset;
                            
                            // Center the cursor by scrolling to cursor position minus half viewport height
                            const targetScroll = cursorTop - (terminalHeight / 2);
                            terminalOutput.scrollTop = Math.max(0, targetScroll);
                        }
                    });
                    this.setupUserInput(terminalOutput);
                }, 500);
                return;
            }
            
            const step = bootSequence[currentStep];
            currentText += step.text;
            const cursor = terminalOutput.querySelector('.terminal-cursor');
            terminalOutput.innerHTML = currentText;
            if (cursor) {
                terminalOutput.appendChild(cursor);
            }
            // Center cursor in viewport
            requestAnimationFrame(() => {
                const cursor = terminalOutput.querySelector('.terminal-cursor');
                if (cursor) {
                    const cursorRect = cursor.getBoundingClientRect();
                    const terminalRect = terminalOutput.getBoundingClientRect();
                    const terminalHeight = terminalOutput.clientHeight;
                    const scrollOffset = terminalOutput.scrollTop;
                    
                    // Calculate cursor position relative to terminal content
                    const cursorTop = cursorRect.top - terminalRect.top + scrollOffset;
                    
                    // Center the cursor by scrolling to cursor position minus half viewport height
                    const targetScroll = cursorTop - (terminalHeight / 2);
                    terminalOutput.scrollTop = Math.max(0, targetScroll);
                }
            });
            
            currentStep++;
            setTimeout(typeStep, step.delay);
        };
        
        // Start typing immediately
        typeStep();
    }
    
    setupUserInput(terminalOutput) {
        // Store the base terminal content (everything before the input prompt) as text only
        const baseContent = terminalOutput.textContent;
        
        // Handle user input
        let userInput = '';
        let awaitingConfirmation = false;
        
        const scrollToCursor = () => {
            // Center the cursor in the terminal viewport
            requestAnimationFrame(() => {
                const cursor = terminalOutput.querySelector('.terminal-cursor');
                if (cursor) {
                    const cursorRect = cursor.getBoundingClientRect();
                    const terminalRect = terminalOutput.getBoundingClientRect();
                    const terminalHeight = terminalOutput.clientHeight;
                    const scrollOffset = terminalOutput.scrollTop;
                    
                    // Calculate cursor position relative to terminal content
                    const cursorTop = cursorRect.top - terminalRect.top + scrollOffset;
                    
                    // Center the cursor by scrolling to cursor position minus half viewport height
                    const targetScroll = cursorTop - (terminalHeight / 2);
                    terminalOutput.scrollTop = Math.max(0, targetScroll);
                }
            });
        };
        
        const updateDisplay = () => {
            // Update terminal content with base + current user input + cursor
            // Use textContent to avoid HTML conflicts, then add cursor as separate element
            terminalOutput.textContent = baseContent + userInput;
            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor';
            cursor.textContent = '█';
            terminalOutput.appendChild(cursor);
            scrollToCursor();
        };
        
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                if (userInput === '' || userInput.toLowerCase() === 'start') {
                    // Welcome message and transition
                    terminalOutput.innerHTML = baseContent + userInput + '\nWelcome aboard, guest.\n\n';
                    // Scroll to show the complete response
                    requestAnimationFrame(() => {
                        terminalOutput.scrollTop = terminalOutput.scrollHeight - terminalOutput.clientHeight + 20;
                    });
                    setTimeout(() => this.transitionToDesktop(), 1000);
                    document.removeEventListener('keydown', handleKeyPress);
                } else {
                    // Command not recognized
                    const newBaseContent = baseContent + userInput + '\nCommand not recognized. Did you mean "start"? (y/n): ';
                    terminalOutput.textContent = newBaseContent;
                    const cursor = document.createElement('span');
                    cursor.className = 'terminal-cursor';
                    cursor.textContent = '█';
                    terminalOutput.appendChild(cursor);
                    awaitingConfirmation = true;
                    userInput = '';
                    // Update the base content for the confirmation prompt
                    this.setupConfirmationInput(terminalOutput, newBaseContent);
                    document.removeEventListener('keydown', handleKeyPress);
                }
            } else if (event.key === 'Backspace') {
                if (userInput.length > 0) {
                    userInput = userInput.slice(0, -1);
                    updateDisplay();
                }
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                // Regular character (excluding modifier key combinations)
                userInput += event.key;
                updateDisplay();
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
    }
    
    setupConfirmationInput(terminalOutput, baseContent) {
        // Handle y/n confirmation input
        let userInput = '';
        
        const scrollToCursor = () => {
            // Center the cursor in the terminal viewport
            requestAnimationFrame(() => {
                const cursor = terminalOutput.querySelector('.terminal-cursor');
                if (cursor) {
                    const cursorRect = cursor.getBoundingClientRect();
                    const terminalRect = terminalOutput.getBoundingClientRect();
                    const terminalHeight = terminalOutput.clientHeight;
                    const scrollOffset = terminalOutput.scrollTop;
                    
                    // Calculate cursor position relative to terminal content
                    const cursorTop = cursorRect.top - terminalRect.top + scrollOffset;
                    
                    // Center the cursor by scrolling to cursor position minus half viewport height
                    const targetScroll = cursorTop - (terminalHeight / 2);
                    terminalOutput.scrollTop = Math.max(0, targetScroll);
                }
            });
        };
        
        const updateDisplay = () => {
            terminalOutput.textContent = baseContent + userInput;
            const cursor = document.createElement('span');
            cursor.className = 'terminal-cursor';
            cursor.textContent = '█';
            terminalOutput.appendChild(cursor);
            scrollToCursor();
        };
        
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                if (userInput.toLowerCase() === 'y' || userInput.toLowerCase() === 'yes') {
                    // Show welcome message and transition
                    terminalOutput.innerHTML = baseContent + userInput + '\nWelcome aboard, guest.\n\n';
                    // Scroll to show the complete response
                    requestAnimationFrame(() => {
                        terminalOutput.scrollTop = terminalOutput.scrollHeight - terminalOutput.clientHeight + 20;
                    });
                    setTimeout(() => this.transitionToDesktop(), 1000);
                    document.removeEventListener('keydown', handleKeyPress);
                } else if (userInput.toLowerCase() === 'n' || userInput.toLowerCase() === 'no') {
                    // Show sarcastic "no" response and force start anyway
                    const noResponse = baseContent + userInput + 
                        '\nNo? Well too bad.\n' +
                        'Starting kevOS anyway...\n' +
                        '> You can\'t escape that easily\n' +
                        '> Welcome aboard, reluctant user.\n\n';
                    terminalOutput.innerHTML = noResponse;
                    // Scroll to show the complete response
                    requestAnimationFrame(() => {
                        terminalOutput.scrollTop = terminalOutput.scrollHeight - terminalOutput.clientHeight + 20;
                    });
                    setTimeout(() => this.transitionToDesktop(), 3500);
                    document.removeEventListener('keydown', handleKeyPress);
                } else {
                    // Reset back to start prompt for any other input
                    const originalBaseContent = baseContent.replace(/Command not recognized.*\(y\/n\): $/, '').replace(/\n$/, '') + '\nPress Enter or type "start" to begin...\n$ ';
                    terminalOutput.textContent = originalBaseContent;
                    const cursor = document.createElement('span');
                    cursor.className = 'terminal-cursor';
                    cursor.textContent = '█';
                    terminalOutput.appendChild(cursor);
                    this.setupUserInput(terminalOutput);
                    document.removeEventListener('keydown', handleKeyPress);
                }
            } else if (event.key === 'Backspace') {
                if (userInput.length > 0) {
                    userInput = userInput.slice(0, -1);
                    updateDisplay();
                }
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                userInput += event.key;
                updateDisplay();
            }
        };
        
        document.addEventListener('keydown', handleKeyPress);
    }
    
    transitionToDesktop() {
        console.log('🚀 Transitioning to desktop...');
        
        // Play the kevOS launcher sound
        try {
            const launcherAudio = new Audio('./sounds/kevOS-launcher.mp3');
            launcherAudio.volume = 0.7;
            launcherAudio.play().catch(error => {
                console.log('Could not play kevOS launcher audio:', error);
            });
        } catch (error) {
            console.log('Error loading kevOS launcher audio:', error);
        }
        
        // Hide start screen
        const startScreen = document.getElementById('kevos-start');
        if (startScreen) {
            startScreen.style.animation = 'launchScreenFadeOut 0.5s ease-in-out forwards';
            setTimeout(() => {
                startScreen.style.display = 'none';
            }, 500);
        }
        
        // Go directly to desktop
        const desktop = document.querySelector('.desktop');
        if (desktop) {
            setTimeout(() => {
                desktop.style.display = 'flex';
                this.completeLaunchSequence(null, desktop);
            }, 500);
        }
    }
    
    async startKevOSLaunch() {
        console.log('🚀 Starting kevOS launch sequence...');
        
        const launchScreen = document.getElementById('kevos-launch');
        const desktop = document.querySelector('.desktop');
        const statusElement = document.querySelector('.launch-status');
        
        console.log('Launch screen element:', launchScreen);
        console.log('Desktop element:', desktop);
        console.log('Status element:', statusElement);
        
        if (!launchScreen) {
            console.error('❌ Launch screen not found!');
            return;
        }
        
        // Add skip button functionality for debugging
        const skipButton = document.getElementById('skip-launch');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                console.log('⏭️ Skip button clicked - jumping to desktop');
                this.completeLaunchSequence(launchScreen, desktop);
            });
        }
        
        // Load and play the kevOS launcher audio
        let launcherAudio = null;
        try {
            console.log('🔊 Attempting to load audio file...');
            launcherAudio = new Audio('./sounds/kevOS-launcher.mp3');
            launcherAudio.volume = 0.7;
            launcherAudio.preload = 'auto';
            
            // Add event listeners for debugging
            launcherAudio.addEventListener('loadstart', () => console.log('🔊 Audio load started'));
            launcherAudio.addEventListener('canplay', () => console.log('🔊 Audio can play'));
            launcherAudio.addEventListener('canplaythrough', () => console.log('🔊 Audio can play through'));
            launcherAudio.addEventListener('error', (e) => console.error('🔊 Audio error:', e));
            launcherAudio.addEventListener('play', () => console.log('🔊 Audio started playing'));
            launcherAudio.addEventListener('ended', () => console.log('🔊 Audio finished playing'));
            
            console.log('🔊 Audio object created:', launcherAudio.src);
        } catch (error) {
            console.error('❌ Could not load kevOS launcher audio:', error);
        }
        
        // Start the audio after a brief delay
        setTimeout(async () => {
            console.log('⏰ Attempting to play audio after delay...');
            if (launcherAudio) {
                try {
                    console.log('🔊 Audio context state:', this.sounds?.audioContext?.state);
                    // Ensure audio context is resumed
                    if (this.sounds && this.sounds.audioContext) {
                        console.log('🔊 Resuming audio context...');
                        await this.sounds.audioContext.resume();
                        console.log('🔊 Audio context resumed, state:', this.sounds.audioContext.state);
                    }
                    
                    console.log('🔊 Attempting to play audio...');
                    await launcherAudio.play();
                    console.log('✅ kevOS launcher audio started successfully');
                } catch (error) {
                    console.error('❌ Could not play kevOS launcher audio:', error.name, error.message);
                    console.log('🔊 Trying fallback approach with user interaction...');
                    
                    // Show a message to user about clicking to enable audio
                    if (statusElement) {
                        statusElement.textContent = 'Click anywhere to start with audio...';
                        statusElement.style.cursor = 'pointer';
                        statusElement.style.fontSize = '1rem';
                        statusElement.style.color = 'var(--light-orange)';
                    }
                    
                    // Make the entire launch screen clickable
                    launchScreen.style.cursor = 'pointer';
                    
                    // Try alternative approach with user interaction
                    const enableAudio = async () => {
                        try {
                            console.log('🔊 User interaction detected, trying to play audio...');
                            await launcherAudio.play();
                            console.log('✅ Audio enabled after user interaction');
                            if (statusElement) {
                                statusElement.textContent = 'Initializing kevOS...';
                                statusElement.style.cursor = 'default';
                                statusElement.style.fontSize = '0.9rem';
                                statusElement.style.color = 'var(--warm-cream)';
                            }
                            if (launchScreen) {
                                launchScreen.style.cursor = 'default';
                            }
                        } catch (e) {
                            console.error('❌ Still could not play audio after user interaction:', e);
                            // Continue without audio
                            if (statusElement) {
                                statusElement.textContent = 'Starting kevOS... (no audio)';
                                statusElement.style.cursor = 'default';
                                statusElement.style.fontSize = '0.9rem';
                                statusElement.style.color = 'var(--warm-cream)';
                            }
                        }
                    };
                    
                    launchScreen.addEventListener('click', enableAudio, { once: true });
                    document.addEventListener('keydown', enableAudio, { once: true });
                }
            } else {
                console.error('❌ No audio object available');
            }
        }, 800);
        
        // Synced status updates with the audio timing
        const statusUpdates = [
            { time: 1000, text: 'Initializing kevOS...' },
            { time: 2000, text: 'Loading system components...' },
            { time: 2800, text: 'Preparing workspace...' },
            { time: 3600, text: 'Almost ready...' },
            { time: 4200, text: 'Welcome to kevOS!' }
        ];
        
        statusUpdates.forEach(update => {
            setTimeout(() => {
                if (statusElement) {
                    statusElement.textContent = update.text;
                }
            }, update.time);
        });
        
        // Complete the launch sequence after 5 seconds
        setTimeout(() => {
            this.completeLaunchSequence(launchScreen, desktop);
        }, 5000);
        
        // Emergency fallback - if for some reason the launch sequence fails,
        // show the desktop after 10 seconds
        setTimeout(() => {
            if (desktop && window.getComputedStyle(desktop).display === 'none') {
                console.warn('⚠️ Emergency fallback: Showing desktop manually');
                if (launchScreen) launchScreen.style.display = 'none';
                desktop.style.display = 'flex';  // Changed to flex
                this.registerWelcomeWindow();
                setTimeout(() => this.launchApp('soundboard'), 500);
            }
        }, 10000);
    }
    
    completeLaunchSequence(launchScreen, desktop) {
        console.log('🏁 Completing launch sequence...');
        console.log('Launch screen element:', launchScreen);
        console.log('Desktop element:', desktop);
        
        // Fade out launch screen
        if (launchScreen) {
            launchScreen.style.animation = 'launchScreenFadeOut 1s ease-in-out forwards';
            console.log('✅ Launch screen fade animation applied');
        } else {
            console.error('❌ Launch screen element missing');
        }
        
        setTimeout(() => {
            // Hide launch screen and show desktop
            if (launchScreen) {
                launchScreen.style.display = 'none';
                console.log('✅ Launch screen hidden');
            }
            
            if (desktop) {
                desktop.style.display = 'flex';  // Changed from 'block' to 'flex' to match CSS
                console.log('✅ Desktop display set to flex');
                
                // Play background video after desktop is shown
                const bgVideo = desktop.querySelector('.webgl-background video');
                if (bgVideo) {
                    bgVideo.play().catch(e => {
                        console.log('Background video autoplay blocked, will play on user interaction');
                    });
                }
                
                // Check if dock is visible
                const dock = desktop.querySelector('.dock');
                const dockItems = desktop.querySelectorAll('.dock-item');
                console.log('Dock element:', dock);
                console.log('Dock items found:', dockItems.length);
                console.log('Desktop computed style:', window.getComputedStyle(desktop).display);
                
                if (dock) {
                    console.log('Dock computed style:', window.getComputedStyle(dock).display);
                    console.log('Dock visibility:', window.getComputedStyle(dock).visibility);
                }
                
                dockItems.forEach((item, index) => {
                    const app = item.dataset.app;
                    const style = window.getComputedStyle(item);
                    console.log(`Dock item ${index} (${app}):`, {
                        display: style.display,
                        visibility: style.visibility,
                        opacity: style.opacity
                    });
                });
                
            } else {
                console.error('❌ Desktop element missing');
            }
            
            console.log('🖥️ Desktop should now be visible');
            
            // Register the welcome window after 1 second delay
            setTimeout(() => {
                try {
                    this.registerWelcomeWindow();
                    console.log('✅ Welcome window registered');
                } catch (error) {
                    console.error('❌ Error registering welcome window:', error);
                }
            }, 1000);
            
            // Soundboard can be launched from desktop icon
            
        }, 1000);
    }
    
    registerWelcomeWindow() {
        const welcomeWindow = document.getElementById('welcome-window');
        if (welcomeWindow) {
            this.windows.set('welcome-window', welcomeWindow);
            welcomeWindow.style.zIndex = ++this.windowZIndex;
            
            // Show the window (was hidden in CSS)
            welcomeWindow.style.display = 'block';
            welcomeWindow.classList.add('show');
            
            // Initial centering is now handled by CSS
            // Don't set transform here to allow dragging to work properly
            
            // Play welcome sound when window appears
            this.sounds.play('windowOpen');
        }
    }
    
    setupEventListeners() {
        // Dock app launching
        document.querySelectorAll('.dock-item').forEach(item => {
            let hoverSound = null;
            let fadeInterval = null;
            
            item.addEventListener('mouseenter', () => {
                // Start persistent hover sound with fade in
                hoverSound = new Audio('sounds/haptics/hover.mp3');
                hoverSound.loop = true;
                hoverSound.volume = 0;
                hoverSound.play().catch(e => console.log('Hover sound blocked'));
                
                // Fade in
                let volume = 0;
                fadeInterval = setInterval(() => {
                    volume += 0.02;
                    if (volume >= 0.3) {
                        volume = 0.3;
                        clearInterval(fadeInterval);
                    }
                    hoverSound.volume = volume;
                }, 20);
            });
            
            item.addEventListener('mouseleave', () => {
                // Fade out hover sound when leaving
                if (fadeInterval) clearInterval(fadeInterval);
                
                if (hoverSound) {
                    let volume = hoverSound.volume;
                    fadeInterval = setInterval(() => {
                        volume -= 0.02;
                        if (volume <= 0) {
                            hoverSound.pause();
                            hoverSound.currentTime = 0;
                            hoverSound = null;
                            clearInterval(fadeInterval);
                        } else {
                            hoverSound.volume = volume;
                        }
                    }, 20);
                }
            });
            
            item.addEventListener('click', (e) => {
                // Stop hover sound on click
                if (fadeInterval) clearInterval(fadeInterval);
                if (hoverSound) {
                    hoverSound.pause();
                    hoverSound.currentTime = 0;
                    hoverSound = null;
                }
                this.sounds.play('dockBounce');
                this.launchApp(item.dataset.app);
                this.addRippleEffect(item, e);
            });
        });
        
        // Desktop icon launching
        document.querySelectorAll('.desktop-icon').forEach(item => {
            let hoverSound = null;
            let fadeInterval = null;
            
            item.addEventListener('mouseenter', () => {
                // Start persistent hover sound with fade in
                hoverSound = new Audio('sounds/haptics/hover.mp3');
                hoverSound.loop = true;
                hoverSound.volume = 0;
                hoverSound.play().catch(e => console.log('Hover sound blocked'));
                
                // Fade in
                let volume = 0;
                fadeInterval = setInterval(() => {
                    volume += 0.02;
                    if (volume >= 0.3) {
                        volume = 0.3;
                        clearInterval(fadeInterval);
                    }
                    hoverSound.volume = volume;
                }, 20);
            });
            
            item.addEventListener('mouseleave', () => {
                // Fade out hover sound when leaving
                if (fadeInterval) clearInterval(fadeInterval);
                
                if (hoverSound) {
                    let volume = hoverSound.volume;
                    fadeInterval = setInterval(() => {
                        volume -= 0.02;
                        if (volume <= 0) {
                            hoverSound.pause();
                            hoverSound.currentTime = 0;
                            hoverSound = null;
                            clearInterval(fadeInterval);
                        } else {
                            hoverSound.volume = volume;
                        }
                    }, 20);
                }
            });
            
            item.addEventListener('click', (e) => {
                // Stop hover sound on click
                if (fadeInterval) clearInterval(fadeInterval);
                if (hoverSound) {
                    hoverSound.pause();
                    hoverSound.currentTime = 0;
                    hoverSound = null;
                }
                this.sounds.play('click');
                this.launchApp(item.dataset.app);
                this.addRippleEffect(item, e);
            });
            
            // Double-click for faster launch
            item.addEventListener('dblclick', (e) => {
                // Stop hover sound on double click
                if (fadeInterval) clearInterval(fadeInterval);
                if (hoverSound) {
                    hoverSound.pause();
                    hoverSound.currentTime = 0;
                    hoverSound = null;
                }
                this.sounds.play('windowOpen');
                this.launchApp(item.dataset.app);
            });
        });
        
        // Dropdown menu interactions
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            
            item.addEventListener('click', () => {
                this.sounds.play('menuSelect');
                this.handleDropdownAction(item.dataset.action);
            });
        });
        
        // Menu hover sounds
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.sounds.play('menuSelect');
            });
        });
    }
    
    setupDockInteractions() {
        const dock = document.querySelector('.dock');
        const dockItems = document.querySelectorAll('.dock-item');
        
        // Check if dock exists before setting up interactions
        if (!dock) {
            console.log('🔧 Dock not found, skipping dock interactions setup');
            return;
        }
        
        // Add hover sound effects to dock items
        dockItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
        });
        
        // Magnetic dock effect
        dock.addEventListener('mousemove', (e) => {
            const dockRect = dock.getBoundingClientRect();
            const mouseX = e.clientX - dockRect.left;
            
            dockItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2 - dockRect.left;
                const distance = Math.abs(mouseX - itemCenterX);
                const maxDistance = 100;
                
                if (distance < maxDistance) {
                    const scale = 1 + (1 - distance / maxDistance) * 0.3;
                    const translateY = -(1 - distance / maxDistance) * 12;
                    item.style.transform = `translateY(${translateY}px) scale(${scale})`;
                } else {
                    item.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
        
        dock.addEventListener('mouseleave', () => {
            dockItems.forEach(item => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    setupWindowControls() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('control-btn') || e.target.classList.contains('app-control-btn')) {
                const window = e.target.closest('.window');
                const action = e.target.classList.contains('close') ? 'close' :
                             e.target.classList.contains('minimize') ? 'minimize' : 'maximize';
                
                console.log(`🎛️ Window control triggered - Window: ${window?.id}, Action: ${action}, Target:`, e.target);
                this.handleWindowControl(window, action);
            }
        });
        
        // Add hover sound effects to all control buttons
        document.querySelectorAll('.control-btn, .app-control-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
        });
        
        // Window dragging
        this.setupWindowDragging();
    }
    
    setupWindowDragging() {
        let isDragging = false;
        let dragStarted = false;
        let dragOffset = { x: 0, y: 0 };
        let draggedWindow = null;
        let initialRect = null;
        let startMousePos = { x: 0, y: 0 };
        const DRAG_THRESHOLD = 5; // pixels to move before starting drag
        
        document.addEventListener('mousedown', (e) => {
            // More specific event target detection
            const windowHeader = e.target.closest('.window-header');
            const dragHandle = e.target.closest('.drag-handle');
            
            // Check if we clicked directly on a button to avoid drag conflicts
            const isButton = e.target.matches('button, .control-btn, .mp3-control-btn, .soundboard-control-btn') ||
                           e.target.closest('button, .control-btn, .mp3-control-btn, .soundboard-control-btn');
            
            if (!isButton && ((windowHeader && !e.target.classList.contains('control-btn')) || 
                (dragHandle && !e.target.classList.contains('mp3-control-btn')))) {
                
                draggedWindow = e.target.closest('.window');
                this.bringToFront(draggedWindow);
                
                // Store initial mouse position for threshold check
                startMousePos.x = e.clientX;
                startMousePos.y = e.clientY;
                
                // Store initial position but don't modify CSS yet
                initialRect = draggedWindow.getBoundingClientRect();
                
                // Calculate offset from mouse to top-left of window
                dragOffset.x = e.clientX - initialRect.left;
                dragOffset.y = e.clientY - initialRect.top;
                
                // Prepare for dragging but don't start until mouse moves enough
                isDragging = true;
                dragStarted = false;
                
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && draggedWindow) {
                // Check if we've moved far enough to start dragging
                if (!dragStarted) {
                    const moveDistance = Math.sqrt(
                        Math.pow(e.clientX - startMousePos.x, 2) + 
                        Math.pow(e.clientY - startMousePos.y, 2)
                    );
                    
                    // Only start dragging if we've moved beyond the threshold
                    if (moveDistance >= DRAG_THRESHOLD) {
                        dragStarted = true;
                        
                        // Now it's safe to modify CSS since we're actually dragging
                        draggedWindow.style.transform = 'none';
                        draggedWindow.style.animation = 'none';
                        draggedWindow.style.position = 'absolute';
                        
                        // Set the exact current position as the starting point
                        draggedWindow.style.left = `${initialRect.left}px`;
                        draggedWindow.style.top = `${initialRect.top}px`;
                        
                        draggedWindow.style.cursor = 'grabbing';
                        document.body.style.userSelect = 'none';
                    } else {
                        // Haven't moved far enough, don't drag yet
                        return;
                    }
                }
                
                // Calculate new position based on mouse position minus the offset
                const x = e.clientX - dragOffset.x;
                const y = e.clientY - dragOffset.y;
                
                // Apply new position
                draggedWindow.style.left = `${x}px`;
                draggedWindow.style.top = `${y}px`;
                
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                dragStarted = false;
                if (draggedWindow) {
                    draggedWindow.style.cursor = 'default';
                    draggedWindow = null;
                }
                document.body.style.userSelect = '';
                initialRect = null;
            }
        });
    }
    
    setupKeyboardSounds() {
        // Listen for all keydown events on the document
        document.addEventListener('keydown', (e) => {
            // Don't play sounds for modifier keys alone
            if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') {
                return;
            }
            
            // Don't play sounds for certain system keys
            if (e.key === 'Tab' || e.key === 'Escape' || e.key.startsWith('F') && e.key.length <= 3) {
                return;
            }
            
            // Play random keyboard sound
            this.keyboardSounds.playRandomKeySound();
        });
        
        console.log('🎹 Keyboard sounds initialized - type to hear clicks!');
    }
    
    launchApp(appName) {
        const appConfigs = {
            finder: {
                title: 'Finder',
                content: this.createFinderContent(),
                width: '600px',
                height: '400px'
            },
            notes: {
                title: 'Notes',
                content: this.createNotesContent(),
                width: '500px',
                height: '350px'
            },
            calculator: {
                title: 'Calculator',
                content: this.createCalculatorContent(),
                width: '280px',
                height: '380px'
            },
            settings: {
                title: 'System Preferences',
                content: this.createSettingsContent(),
                width: '550px',
                height: '450px'
            },
            soundboard: {
                title: 'Soundboard',
                content: this.createSoundboardContent(),
                width: '440px',
                height: '580px',
                position: 'top-right',
                customWindow: true
            },
            mp3player: {
                title: 'MP3 Player',
                content: this.createMP3PlayerContent(),
                width: '360px',
                height: '560px',
                customWindow: true
            },
            pomodoro: {
                title: 'Pomodoro Timer',
                content: this.createPomodoroContent(),
                width: '400px',
                height: 'auto',
                customWindow: true
            }
        };
        
        const config = appConfigs[appName];
        if (config) {
            this.createWindow(config);
            
            // Track task completion
            if (appName === 'mp3player') {
                this.completeTask('mp3-player');
            } else if (appName === 'notes') {
                this.completeTask('notes');
            }
        }
    }
    
    openEQWindow() {
        console.log('🎛️ Opening EQ window...');
        
        // Check if EQ window is already open
        const existingEQ = document.getElementById('eq-window');
        if (existingEQ) {
            console.log('🎛️ EQ window already exists, removing and recreating');
            existingEQ.remove();
            this.windows.delete('eq-window');
        }
        
        // Create a super simple window without any complex positioning
        const windowId = 'eq-window';
        const window = document.createElement('div');
        window.className = 'window eq-window-simple';
        window.id = windowId;
        // Find MP3 player window for positioning
        const mp3Window = document.querySelector('.mp3-player-standalone')?.closest('.window');
        let left = '50%';
        let top = '50%';
        let transform = 'translate(-50%, -50%)';
        
        if (mp3Window) {
            const mp3Rect = mp3Window.getBoundingClientRect();
            left = `${Math.max(10, mp3Rect.right + 10)}px`;
            top = `${Math.max(10, mp3Rect.top)}px`;
            transform = 'none';
            console.log('🎛️ Positioning EQ window relative to MP3 player:', {
                mp3Right: mp3Rect.right,
                mp3Top: mp3Rect.top,
                eqLeft: left,
                eqTop: top
            });
        } else {
            console.log('🎛️ MP3 player not found, centering EQ window');
        }
        
        window.style.cssText = `
            position: fixed !important;
            left: ${left} !important;
            top: ${top} !important;
            transform: ${transform} !important;
            width: 360px !important;
            height: 500px !important;
            z-index: 9999 !important;
            display: block !important;
            background: white !important;
            border: 2px solid #ccc !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        `;
        
        // EQ window with proper styling matching other windows
        window.innerHTML = `
            <div class="eq-window-container">
                <div class="app-window-container">
                    <div class="app-window-header drag-handle">
                        <button class="app-control-btn close" title="Close"></button>
                        <button class="app-control-btn minimize" title="Minimize"></button>
                        <button class="app-control-btn maximize" title="Maximize"></button>
                        <div class="app-brand">Equalizer</div>
                        <div class="drag-grip">⋮⋮</div>
                    </div>
                    <div class="app-window-content eq-content">
                        <!-- EQ Display -->
                        <div class="eq-display">
                            <div class="eq-brand">AUDIO EQ-7</div>
                            <div class="eq-led-indicator"></div>
                        </div>
                        
                        <!-- Frequency Bands -->
                        <div class="eq-bands">
                            <div class="eq-band">
                                <div class="freq-label">60Hz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-60" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-60-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">170Hz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-170" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-170-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">310Hz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-310" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-310-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">600Hz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-600" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-600-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">1kHz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-1000" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-1000-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">3kHz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-3000" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-3000-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">6kHz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-6000" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-6000-value">0dB</div>
                            </div>
                            <div class="eq-band">
                                <div class="freq-label">12kHz</div>
                                <div class="eq-slider-container">
                                    <input type="range" class="eq-slider" id="eq-12000" min="-12" max="12" value="0" orient="vertical">
                                    <div class="eq-slider-track"></div>
                                    <div class="eq-slider-handle"></div>
                                </div>
                                <div class="freq-value" id="eq-12000-value">0dB</div>
                            </div>
                        </div>
                        
                        <!-- Effects Section -->
                        <div class="eq-effects">
                            <div class="effect-group">
                                <label>Master Volume</label>
                                <input type="range" id="master-volume" min="0" max="100" value="75" class="effect-slider">
                                <span id="master-volume-value">75%</span>
                            </div>
                            <div class="effect-group">
                                <label>Compression</label>
                                <input type="range" id="compression" min="0" max="100" value="0" class="effect-slider">
                                <span id="compression-value">0%</span>
                            </div>
                        </div>
                        
                        <!-- Presets -->
                        <div class="eq-presets">
                            <button class="eq-preset-btn active" data-preset="normal">Normal</button>
                            <button class="eq-preset-btn" data-preset="old-radio">Old Radio</button>
                            <button class="eq-preset-btn" data-preset="telephone">Telephone</button>
                            <button class="eq-preset-btn" data-preset="elevator">Elevator</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.windows-container').appendChild(window);
        this.windows.set(windowId, window);
        
        console.log('🎛️ Simple EQ window added to DOM');
        
        // Setup proper window controls (matching other windows)
        setTimeout(() => {
            this.setupEQWindowControls(window);
            this.setupEQControls();
            this.initializeAudioContext(); // Initialize Web Audio API
            console.log('🎛️ EQ window controls setup complete');
        }, 10);
        
        console.log('🎛️ EQ window setup complete');
        this.sounds.play('windowOpen');
    }

    openPomodoroSettingsWindow() {
        console.log('⚙️ openPomodoroSettingsWindow() called!');
        console.log('⚙️ Opening Pomodoro Settings window...');
        console.log('⚙️ this context:', this);
        
        try {
            // Check if settings window is already open
            const existingSettings = document.getElementById('pomodoro-settings-window');
            if (existingSettings) {
                console.log('⚙️ Settings window already exists, removing and recreating');
                existingSettings.remove();
                this.windows.delete('pomodoro-settings-window');
            }
        } catch (error) {
            console.error('⚙️ ERROR in openPomodoroSettingsWindow:', error);
            throw error;
        }
        
        // Create settings window
        const windowId = 'pomodoro-settings-window';
        const window = document.createElement('div');
        window.className = 'window pomodoro-settings-window-simple';
        window.id = windowId;
        
        // Find Pomodoro timer window for positioning
        const pomodoroWindow = document.querySelector('.pomodoro-app')?.closest('.window');
        let left = '50%';
        let top = '50%';
        let transform = 'translate(-50%, -50%)';
        
        if (pomodoroWindow) {
            const pomodoroRect = pomodoroWindow.getBoundingClientRect();
            left = `${Math.max(10, pomodoroRect.right + 10)}px`;
            top = `${Math.max(10, pomodoroRect.top)}px`;
            transform = 'none';
            console.log('⚙️ Positioning Settings window relative to Pomodoro timer');
        }
        
        window.style.left = left;
        window.style.top = top;
        window.style.transform = transform;
        window.style.width = '320px';
        window.style.height = '280px';
        window.style.zIndex = ++this.windowZIndex;
        
        // Create the settings content
        window.innerHTML = this.createPomodoroSettingsContent();
        
        // Add to DOM and register
        document.querySelector('.windows-container').appendChild(window);
        this.windows.set(windowId, window);
        
        // Setup interactions
        this.setupWindowControls();
        this.setupPomodoroSettingsWindow(window);
        
        // Show window
        setTimeout(() => {
            window.classList.add('show');
        }, 10);
        
        console.log('⚙️ Pomodoro Settings window setup complete');
        this.sounds.play('windowOpen');
    }
    
    createWindow(config) {
        this.sounds.play('windowOpen');
        
        const windowId = `window-${Date.now()}`;
        const window = document.createElement('div');
        window.className = 'window';
        window.id = windowId;
        window.style.width = config.width;
        if (config.height === 'auto') {
            window.style.height = 'auto';
            window.style.minHeight = '400px';
        } else {
            window.style.height = config.height;
        }
        window.style.zIndex = ++this.windowZIndex;
        
        // Calculate offset for cascading windows  
        if (config.position === 'top-right') {
            // Position in top right corner with some padding
            window.style.left = `${window.innerWidth - parseInt(config.width) - 40}px`;
            window.style.top = '80px';
            window.style.transform = 'none';
        } else {
            // Default centered behavior with slight cascading offset
            const windowCount = this.windows.size;
            const offsetX = (windowCount * 30) % 200; // Reset after 6 windows
            const offsetY = (windowCount * 20) % 120; // Reset after 6 windows
            
            // Use transform for centering with offset
            window.style.left = '50%';
            window.style.top = '50%';
            window.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        }
        
        if (config.customWindow) {
            // Custom window without standard chrome
            window.innerHTML = config.content;
            window.classList.add('custom-window');
        } else {
            // Standard window with new app-style chrome
            window.innerHTML = `
                <div class="app-window-container">
                    <div class="app-window-header drag-handle">
                        <button class="app-control-btn close" title="Close"></button>
                        <button class="app-control-btn minimize" title="Minimize"></button>
                        <button class="app-control-btn maximize" title="Maximize"></button>
                        <div class="app-brand">${config.title}</div>
                        <div class="drag-grip">⋮⋮</div>
                    </div>
                    <div class="app-window-content">
                        ${config.content}
                    </div>
                </div>
            `;
        }
        
        document.querySelector('.windows-container').appendChild(window);
        this.windows.set(windowId, window);
        this.bringToFront(window);
        
        // Make window visible after positioning is set
        setTimeout(() => {
            window.classList.add('show');
        }, 10);
        
        // Add event listeners for app-specific functionality
        this.setupAppFunctionality(window, config.title);
    }
    
    createFinderContent() {
        return `
            <div style="display: flex; height: 100%;">
                <div style="width: 150px; background: rgba(232, 213, 209, 0.3); padding: 1rem; border-right: 1px solid rgba(184, 179, 173, 0.2);">
                    <div style="margin-bottom: 1rem; font-weight: 500; font-size: 12px; color: var(--warm-gray);">FAVORITES</div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="finder-item">Desktop</div>
                        <div class="finder-item">Documents</div>
                        <div class="finder-item">Downloads</div>
                        <div class="finder-item">Pictures</div>
                    </div>
                </div>
                <div style="flex: 1; padding: 1rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 1rem;">
                        <div class="file-icon">📁 Projects</div>
                        <div class="file-icon">📄 README.md</div>
                        <div class="file-icon">🖼️ photo.jpg</div>
                        <div class="file-icon">🎵 music.mp3</div>
                    </div>
                </div>
            </div>
            <style>
                .finder-item {
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    font-size: 13px;
                }
                .finder-item:hover {
                    background: rgba(255, 107, 53, 0.1);
                }
                .file-icon {
                    text-align: center;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 12px;
                }
                .file-icon:hover {
                    background: rgba(255, 107, 53, 0.1);
                    transform: translateY(-2px);
                }
            </style>
        `;
    }
    
    createNotesContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="margin-bottom: 1rem;">
                    <h3 style="font-weight: 300; margin-bottom: 0.5rem;">Notes</h3>
                </div>
                
                <!-- Formatting Toolbar -->
                <div class="notes-toolbar" style="
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    padding: 0.5rem;
                    background: rgba(255, 107, 53, 0.05);
                    border-radius: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                ">
                    <!-- Text formatting -->
                    <button class="format-btn" data-command="bold" title="Bold">
                        <strong>B</strong>
                    </button>
                    <button class="format-btn" data-command="italic" title="Italic">
                        <em>I</em>
                    </button>
                    <button class="format-btn" data-command="underline" title="Underline">
                        <u>U</u>
                    </button>
                    
                    <div class="toolbar-separator"></div>
                    
                    <!-- Alignment -->
                    <button class="format-btn" data-command="justifyLeft" title="Align Left">
                        ◧
                    </button>
                    <button class="format-btn" data-command="justifyCenter" title="Center">
                        ▣
                    </button>
                    <button class="format-btn" data-command="justifyRight" title="Align Right">
                        ◨
                    </button>
                    
                    <div class="toolbar-separator"></div>
                    
                    <!-- Lists -->
                    <button class="format-btn" data-command="insertUnorderedList" title="Bullet List">
                        •
                    </button>
                    <button class="format-btn" data-command="insertOrderedList" title="Numbered List">
                        1.
                    </button>
                </div>
                
                <!-- Rich Text Editor -->
                <div class="notes-editor" contenteditable="true" style="
                    flex: 1;
                    border: none;
                    background: linear-gradient(145deg, 
                        #f8f7f5 0%,
                        #f2f0ee 15%,
                        #eeecea 30%,
                        #e8e6e3 60%,
                        #e2ddd9 85%,
                        #dbd6d2 100%);
                    border-radius: 12px;
                    padding: 1rem;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #8a7968;
                    outline: none;
                    overflow-y: auto;
                    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
                " data-placeholder="Start writing your notes...">
                </div>
            </div>
            
            <style>
                .format-btn {
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.95) 0%,
                        rgba(250, 245, 240, 0.9) 50%,
                        rgba(184, 179, 173, 0.3) 100%);
                    border: 1px solid rgba(184, 179, 173, 0.4);
                    border-radius: 6px;
                    padding: 0.25rem 0.5rem;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 
                        0 2px 4px rgba(0, 0, 0, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3);
                }
                
                .format-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.98) 0%,
                        rgba(255, 200, 150, 0.3) 50%,
                        rgba(255, 107, 53, 0.2) 100%);
                    border-color: rgba(255, 107, 53, 0.3);
                    box-shadow: 
                        0 3px 6px rgba(0, 0, 0, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.4);
                }
                
                .format-btn:active,
                .format-btn.active {
                    background: linear-gradient(145deg, 
                        rgba(184, 179, 173, 0.3) 0%,
                        rgba(255, 107, 53, 0.3) 50%,
                        rgba(255, 255, 255, 0.6) 100%);
                    border-color: rgba(255, 107, 53, 0.5);
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.2),
                        0 1px 2px rgba(255, 255, 255, 0.3);
                    transform: translateY(1px);
                }
                
                .toolbar-separator {
                    width: 1px;
                    height: 20px;
                    background: rgba(184, 179, 173, 0.3);
                }
                
                .notes-editor:empty:before {
                    content: attr(data-placeholder);
                    color: var(--warm-gray);
                    opacity: 0.6;
                }
                
                .notes-editor:focus:before {
                    display: none;
                }
                
                .notes-editor ul, .notes-editor ol {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                
                .notes-editor li {
                    margin: 0.25rem 0;
                }
            </style>
        `;
    }
    
    setupNotes(windowElement) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
            const editor = windowElement.querySelector('.notes-editor');
            const formatBtns = windowElement.querySelectorAll('.format-btn');
            
            if (!editor) {
                console.log('🔍 Notes editor not found');
                return;
            }
            
            console.log('📝 Setting up notes editor');
            
            this.setupNotesEditor(windowElement, editor, formatBtns);
        }, 100);
    }
    
    setupNotesEditor(windowElement, editor, formatBtns) {
        
        // Add click handlers for formatting buttons
        formatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                
                // Focus editor before executing command
                editor.focus();
                
                // Execute formatting command
                try {
                    document.execCommand(command, false, null);
                    
                    // Update button state for toggle commands
                    this.updateFormatButtonStates(windowElement);
                    
                } catch (error) {
                    console.log('Format command not supported:', command);
                }
            });
            
            // Add hover sound effects
            btn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
        });
        
        // Update button states when selection changes
        editor.addEventListener('mouseup', () => {
            this.updateFormatButtonStates(windowElement);
        });
        
        editor.addEventListener('keyup', () => {
            this.updateFormatButtonStates(windowElement);
        });
        
        // Save content to localStorage on change
        editor.addEventListener('input', () => {
            localStorage.setItem('kevOS-notes-content', editor.innerHTML);
        });
        
        // Always set default haiku content every time notes opens
        console.log('📝 Setting default haiku content');
        const haikuContent = `<div style="text-align: center; font-style: italic; color: #8a7968; margin-top: 2rem; line-height: 1.6;">
            <div>The perfect program</div>
            <div>has no bugs because it was</div>
            <div>never written at all</div>
        </div>`;
        editor.innerHTML = haikuContent;
        console.log('📝 Haiku content set:', editor.innerHTML);
        
        // Start tracking typing for Radiohead achievement
        this.trackTypingInNotes(editor);
    }
    
    updateFormatButtonStates(windowElement) {
        const formatBtns = windowElement.querySelectorAll('.format-btn');
        
        formatBtns.forEach(btn => {
            const command = btn.dataset.command;
            let isActive = false;
            
            try {
                switch(command) {
                    case 'bold':
                        isActive = document.queryCommandState('bold');
                        break;
                    case 'italic':
                        isActive = document.queryCommandState('italic');
                        break;
                    case 'underline':
                        isActive = document.queryCommandState('underline');
                        break;
                    case 'justifyLeft':
                        isActive = document.queryCommandState('justifyLeft');
                        break;
                    case 'justifyCenter':
                        isActive = document.queryCommandState('justifyCenter');
                        break;
                    case 'justifyRight':
                        isActive = document.queryCommandState('justifyRight');
                        break;
                    case 'insertUnorderedList':
                        isActive = document.queryCommandState('insertUnorderedList');
                        break;
                    case 'insertOrderedList':
                        isActive = document.queryCommandState('insertOrderedList');
                        break;
                }
                
                btn.classList.toggle('active', isActive);
            } catch (error) {
                // queryCommandState not supported for this command
            }
        });
    }
    
    createCalculatorContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column; gap: 1rem;">
                <div style="
                    background: rgba(45, 42, 37, 0.9);
                    color: var(--light-cream);
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
                    text-align: right;
                    font-family: var(--font-mono);
                    font-size: 24px;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                " id="calc-display">0</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; flex: 1;">
                    ${['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map(btn => 
                        `<button class="calc-btn" data-value="${btn}">${btn}</button>`
                    ).join('')}
                </div>
            </div>
            <style>
                .calc-btn {
                    background: rgba(253, 246, 240, 0.8);
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: 500;
                    color: var(--charcoal);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
                }
                .calc-btn:hover {
                    background: rgba(255, 107, 53, 0.1);
                    transform: translateY(-1px);
                }
                .calc-btn:active {
                    transform: translateY(0);
                    background: rgba(255, 107, 53, 0.2);
                    box-shadow: 0 1px 4px rgba(255, 107, 53, 0.2);
                }
            </style>
        `;
    }
    
    createSettingsContent() {
        return `
            <div style="display: flex; height: 100%;">
                <div style="width: 200px; background: rgba(232, 213, 209, 0.3); padding: 1rem;">
                    <div class="settings-category active">🎨 Appearance</div>
                    <div class="settings-category">🔊 Sound</div>
                    <div class="settings-category">🌐 Network</div>
                    <div class="settings-category">🔒 Privacy</div>
                    <div class="settings-category">⚙️ General</div>
                </div>
                <div style="flex: 1; padding: 1rem;" id="settings-content">
                    <div id="appearance-settings">
                        <h3 style="margin-bottom: 1rem; font-weight: 300;">Appearance</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="setting-item">
                                <label style="font-weight: 500;">Theme</label>
                                <select style="margin-top: 0.5rem; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(184, 179, 173, 0.3);">
                                    <option>Soft Light</option>
                                    <option>Warm Dark</option>
                                    <option>Auto</option>
                                </select>
                            </div>
                            <div class="setting-item">
                                <label style="font-weight: 500;">Accent Color</label>
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                    <div class="color-swatch" style="background: var(--primary-orange);"></div>
                                    <div class="color-swatch active" style="background: var(--soft-orange);"></div>
                                    <div class="color-swatch" style="background: var(--warm-orange);"></div>
                                    <div class="color-swatch" style="background: var(--light-orange);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="sound-settings" style="display: none;">
                        <h3 style="margin-bottom: 1rem; font-weight: 300;">Sound</h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div class="setting-item">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <label style="font-weight: 500;">Keyboard Sounds</label>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="keyboard-sound-toggle" checked>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                <p style="font-size: 12px; color: var(--warm-gray); margin-top: 0.5rem;">Play random click sounds while typing</p>
                            </div>
                            <div class="setting-item">
                                <label style="font-weight: 500;">Keyboard Volume</label>
                                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                                    <input type="range" min="0" max="100" value="30" id="keyboard-volume-slider" 
                                           style="flex: 1; accent-color: var(--primary-orange);">
                                    <span id="keyboard-volume-display" style="font-size: 12px; color: var(--warm-gray); min-width: 30px;">30%</span>
                                </div>
                            </div>
                            <div class="setting-item">
                                <button class="soft-button" id="test-keyboard-sound">Test Keyboard Sound</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .settings-category {
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                    transition: all 0.2s ease;
                    font-size: 13px;
                }
                .settings-category:hover {
                    background: rgba(255, 107, 53, 0.1);
                }
                .settings-category.active {
                    background: rgba(255, 107, 53, 0.15);
                    color: var(--primary-orange);
                }
                .color-swatch {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 3px solid transparent;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .color-swatch:hover, .color-swatch.active {
                    border-color: var(--primary-orange);
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
                }
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(184, 179, 173, 0.3);
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                input:checked + .slider {
                    background-color: var(--primary-orange);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
            </style>
        `;
    }
    
    createSoundboardContent() {
        return `
            <div class="app-window-container">
                <!-- Integrated window controls with drag handle -->
                <div class="app-window-header drag-handle">
                    <button class="app-control-btn close" title="Close"></button>
                    <button class="app-control-btn minimize" title="Minimize"></button>
                    <button class="app-control-btn maximize" title="Maximize"></button>
                    <div class="app-brand">kevSOUND</div>
                    <div class="drag-grip">⋮⋮</div>
                </div>
                
                <!-- Control Panel Header -->
                <div class="soundboard-controls-header">
                    <div class="soundboard-title">SOUND EFFECTS</div>
                    <div class="soundboard-status-lights">
                        <div class="status-light power-light active"></div>
                        <div class="status-light ready-light active"></div>
                        <div class="status-text">READY</div>
                    </div>
                </div>
                
                <!-- Volume Control Section -->
                <div class="soundboard-volume-section">
                    <div class="volume-panel">
                        <div class="volume-label">MASTER VOLUME</div>
                        <div class="mp3-volume-knob-large" id="volume-knob">
                            <!-- Outer ring with markings -->
                            <div class="knob-outer-ring">
                                <div class="knob-marking" style="transform: rotate(-135deg)"></div>
                                <div class="knob-marking" style="transform: rotate(-90deg)"></div>
                                <div class="knob-marking" style="transform: rotate(-45deg)"></div>
                                <div class="knob-marking" style="transform: rotate(0deg)"></div>
                                <div class="knob-marking" style="transform: rotate(45deg)"></div>
                                <div class="knob-marking" style="transform: rotate(90deg)"></div>
                                <div class="knob-marking" style="transform: rotate(135deg)"></div>
                            </div>
                            <!-- Main knob body -->
                            <div class="mp3-knob-body">
                                <div class="mp3-knob-indicator"></div>
                                <div class="mp3-knob-center">
                                    <div class="knob-texture-lines">
                                        <div class="texture-line"></div>
                                        <div class="texture-line"></div>
                                        <div class="texture-line"></div>
                                        <div class="texture-line"></div>
                                        <div class="texture-line"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="volume-display">
                            <span class="volume-value" id="volume-display">50</span>
                            <span class="volume-unit">%</span>
                        </div>
                    </div>
                    <div class="refresh-section">
                        <button class="device-btn refresh-btn" onclick="window.softOS.refreshSoundboard()">
                            <div class="btn-icon">🔄</div>
                            <div class="btn-label">REFRESH</div>
                        </button>
                    </div>
                </div>
                
                <!-- Sound Grid Area -->
                <div class="soundboard-grid-section">
                    <div class="soundboard-grid" id="soundboard-grid">
                        <div class="loading-state">
                            <div class="loading-icon">🎵</div>
                            <div class="loading-text">Add audio files to the <strong>sounds/</strong> folder</div>
                            <div class="loading-subtext">Supported: .mp3, .wav, .ogg, .m4a</div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- New device-style soundboard CSS will be in the global styles -->
            <style>
                /* Placeholder for soundboard styles - main styles defined globally */
            </style>
        `;
    }
    
    createMP3PlayerContent() {
        return `
            <div class="mp3-player-standalone">
                <!-- Integrated window controls -->
                <div class="app-window-header drag-handle">
                    <button class="app-control-btn close" title="Close"></button>
                    <button class="app-control-btn minimize" title="Minimize"></button>
                    <button class="app-control-btn maximize" title="Maximize"></button>
                    <div class="app-brand">kevMP3</div>
                    <div class="drag-grip">⋮⋮</div>
                </div>
                
                <!-- LCD Screen -->
                <div class="mp3-screen">
                    <div class="screen-content">
                        <div class="track-info">
                            <div class="track-title" id="mp3-track-title">No Track Playing</div>
                            <div class="track-artist" id="mp3-track-artist">--</div>
                        </div>
                        <div class="track-time">
                            <span id="mp3-current-time">0:00</span>
                            <div class="progress-bar">
                                <div class="progress-fill" id="mp3-progress"></div>
                            </div>
                            <span id="mp3-total-time">0:00</span>
                        </div>
                        <div class="visualizer" id="mp3-visualizer">
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Control Panel -->
                <div class="mp3-controls">
                    <!-- Main control buttons -->
                    <div class="control-row main-controls">
                        <button class="mp3-btn" id="mp3-prev" title="Previous">
                            <svg class="btn-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="inset-prev">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                                        <feOffset dx="1" dy="1" result="offsetblur"/>
                                        <feFlood flood-color="#ffffff" flood-opacity="0.5"/>
                                        <feComposite in2="offsetblur" operator="in"/>
                                        <feMerge>
                                            <feMergeNode/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M6 6v12l2-2V8l-2-2zm2 6l8-6v12l-8-6z" 
                                      fill="rgba(184, 179, 173, 0.4)"
                                      filter="url(#inset-prev)"
                                      stroke="rgba(45, 42, 37, 0.2)"
                                      stroke-width="0.5"/>
                            </svg>
                        </button>
                        <button class="mp3-btn large" id="mp3-play" title="Play/Pause">
                            <svg class="btn-icon-svg large play-icon" id="mp3-play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="inset-play">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
                                        <feOffset dx="1.5" dy="1.5" result="offsetblur"/>
                                        <feFlood flood-color="#ffffff" flood-opacity="0.6"/>
                                        <feComposite in2="offsetblur" operator="in"/>
                                        <feMerge>
                                            <feMergeNode/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M8 5v14l11-7z" 
                                      fill="rgba(184, 179, 173, 0.4)"
                                      filter="url(#inset-play)"
                                      stroke="rgba(45, 42, 37, 0.2)"
                                      stroke-width="0.5"/>
                            </svg>
                            <svg class="btn-icon-svg large pause-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: none;">
                                <defs>
                                    <filter id="inset-pause">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
                                        <feOffset dx="1.5" dy="1.5" result="offsetblur"/>
                                        <feFlood flood-color="#ffffff" flood-opacity="0.6"/>
                                        <feComposite in2="offsetblur" operator="in"/>
                                        <feMerge>
                                            <feMergeNode/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M6 5h4v14H6V5z" 
                                      fill="rgba(184, 179, 173, 0.4)"
                                      filter="url(#inset-pause)"
                                      stroke="rgba(45, 42, 37, 0.2)"
                                      stroke-width="0.5"/>
                                <path d="M14 5h4v14h-4V5z" 
                                      fill="rgba(184, 179, 173, 0.4)"
                                      filter="url(#inset-pause)"
                                      stroke="rgba(45, 42, 37, 0.2)"
                                      stroke-width="0.5"/>
                            </svg>
                        </button>
                        <button class="mp3-btn" id="mp3-next" title="Next">
                            <svg class="btn-icon-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="inset-next">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                                        <feOffset dx="1" dy="1" result="offsetblur"/>
                                        <feFlood flood-color="#ffffff" flood-opacity="0.5"/>
                                        <feComposite in2="offsetblur" operator="in"/>
                                        <feMerge>
                                            <feMergeNode/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M8 6v12l8-6-8-6zm8 2v8l2 2V6l-2 2z" 
                                      fill="rgba(184, 179, 173, 0.4)"
                                      filter="url(#inset-next)"
                                      stroke="rgba(45, 42, 37, 0.2)"
                                      stroke-width="0.5"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Volume knob section -->
                    <div class="control-row volume-section">
                        <div class="volume-panel">
                            <div class="volume-label">VOLUME</div>
                            <div class="mp3-volume-knob-large" id="mp3-volume-knob">
                                <!-- Outer ring with markings -->
                                <div class="knob-outer-ring">
                                    <div class="knob-marking" style="transform: rotate(-135deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(-90deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(-45deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(0deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(45deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(90deg)"></div>
                                    <div class="knob-marking" style="transform: rotate(135deg)"></div>
                                </div>
                                <!-- Main knob body -->
                                <div class="mp3-knob-body">
                                    <div class="mp3-knob-indicator"></div>
                                    <div class="mp3-knob-center">
                                        <div class="knob-texture-lines">
                                            <div class="texture-line"></div>
                                            <div class="texture-line"></div>
                                            <div class="texture-line"></div>
                                            <div class="texture-line"></div>
                                            <div class="texture-line"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="volume-display">
                                <span class="volume-value" id="mp3-volume-value">75</span>
                                <span class="volume-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- EQ Button - Bottom Left Corner -->
                <div class="eq-button-container">
                    <button class="eq-btn" id="mp3-eq-btn" title="Equalizer">
                        <svg class="eq-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <filter id="inset-eq">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                                    <feOffset dx="1" dy="1" result="offsetblur"/>
                                    <feFlood flood-color="#ffffff" flood-opacity="0.5"/>
                                    <feComposite in2="offsetblur" operator="in"/>
                                    <feMerge>
                                        <feMergeNode/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M3 13h2l1-4 2 8 2-12 2 4h9" 
                                  fill="none"
                                  stroke="rgba(184, 179, 173, 0.6)"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  filter="url(#inset-eq)"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Hidden YouTube iframe -->
                <div id="mp3-youtube-player" style="display: none;"></div>
            </div>
            
            <style>
                .mp3-player-standalone {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.98) 0%,
                        var(--cream) 25%,
                        var(--warm-cream) 75%,
                        rgba(184, 179, 173, 0.4) 100%);
                    border-radius: 28px;
                    padding: 0;
                    box-shadow: 
                        0 12px 32px rgba(45, 42, 37, 0.3),
                        inset 0 2px 6px rgba(255, 255, 255, 0.4),
                        inset 0 -2px 6px rgba(184, 179, 173, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.6);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                /* Integrated window controls */
                .mp3-window-controls {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    gap: 8px;
                    background: linear-gradient(135deg, 
                        rgba(255, 255, 255, 0.3) 0%,
                        rgba(184, 179, 173, 0.1) 100%);
                    border-bottom: 1px solid rgba(184, 179, 173, 0.2);
                }
                
                .mp3-control-btn {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    position: relative;
                    box-shadow: 
                        0 2px 4px rgba(0, 0, 0, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3);
                }
                
                .mp3-close {
                    background: linear-gradient(145deg, #ff8080, #ff5252, #cc4444);
                    border: 0.5px solid rgba(204, 68, 68, 0.3);
                }
                
                .mp3-minimize {
                    background: linear-gradient(145deg, #ffe066, #ffca28, #ccaa00);
                    border: 0.5px solid rgba(204, 170, 0, 0.3);
                }
                
                .mp3-maximize {
                    background: linear-gradient(145deg, #90ee90, #4caf50, #3d8b40);
                    border: 0.5px solid rgba(61, 139, 64, 0.3);
                }
                
                .mp3-control-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 
                        0 3px 6px rgba(0, 0, 0, 0.4),
                        inset 0 1px 3px rgba(255, 255, 255, 0.4);
                }
                
                .mp3-control-btn:active {
                    transform: translateY(1px);
                    box-shadow: 
                        0 1px 2px rgba(0, 0, 0, 0.4),
                        inset 0 2px 4px rgba(0, 0, 0, 0.3),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.2);
                }
                
                .mp3-close:active {
                    background: linear-gradient(145deg, #cc4444, #ff5252, #ff8080);
                }
                
                .mp3-minimize:active {
                    background: linear-gradient(145deg, #ccaa00, #ffca28, #ffe066);
                }
                
                .mp3-maximize:active {
                    background: linear-gradient(145deg, #3d8b40, #4caf50, #90ee90);
                }
                
                .mp3-brand {
                    margin-left: auto;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--warm-gray);
                    letter-spacing: 1px;
                    opacity: 0.7;
                }
                
                .drag-grip {
                    font-size: 14px;
                    color: var(--warm-gray);
                    opacity: 0.5;
                    cursor: move;
                    user-select: none;
                    padding: 0 4px;
                    line-height: 1;
                }
                
                .drag-handle {
                    cursor: move;
                }
                
                .drag-handle:active {
                    cursor: grabbing;
                }
                
                /* LCD Screen */
                .mp3-screen {
                    background: linear-gradient(135deg, #2a3f2a 0%, #1a2f1a 100%);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin: 1.5rem;
                    margin-bottom: 1rem;
                    box-shadow: 
                        inset 0 3px 10px rgba(0, 0, 0, 0.7),
                        0 1px 3px rgba(255, 255, 255, 0.3);
                    border: 3px solid rgba(0, 0, 0, 0.4);
                    position: relative;
                }
                
                .mp3-screen::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    right: 6px;
                    height: 40%;
                    background: linear-gradient(180deg, 
                        rgba(255, 255, 255, 0.05) 0%,
                        transparent 100%);
                    border-radius: 12px;
                    pointer-events: none;
                }
                
                .screen-content {
                    color: #7fb069;
                    font-family: var(--font-mono);
                    text-shadow: 0 0 4px rgba(127, 176, 105, 0.6);
                }
                
                .track-info {
                    margin-bottom: 1rem;
                    min-height: 48px;
                }
                
                .track-title {
                    font-size: 14px;
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 0.4rem;
                }
                
                .track-artist {
                    font-size: 11px;
                    opacity: 0.8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .track-time {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 11px;
                    margin-bottom: 1rem;
                }
                
                .progress-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 3px;
                    overflow: hidden;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
                }
                
                .progress-fill {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #7fb069, #9fc776);
                    box-shadow: 0 0 6px rgba(127, 176, 105, 0.8);
                    transition: width 0.3s ease;
                }
                
                .visualizer {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: 4px;
                    height: 24px;
                }
                
                .visualizer .bar {
                    width: 4px;
                    background: linear-gradient(180deg, #7fb069, #6ca55a);
                    box-shadow: 0 0 3px rgba(127, 176, 105, 0.7);
                    border-radius: 2px;
                    animation: none;
                    transition: height 0.15s ease;
                }
                
                .visualizer.playing .bar {
                    animation: pulse 0.8s ease-in-out infinite;
                }
                
                .visualizer.playing .bar:nth-child(2) { animation-delay: 0.1s; }
                .visualizer.playing .bar:nth-child(3) { animation-delay: 0.2s; }
                .visualizer.playing .bar:nth-child(4) { animation-delay: 0.3s; }
                .visualizer.playing .bar:nth-child(5) { animation-delay: 0.4s; }
                
                @keyframes pulse {
                    0%, 100% { height: 5px; }
                    50% { height: 20px; }
                }
                
                /* Controls */
                .mp3-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding: 0 2rem 2rem;
                    flex: 1;
                }
                
                .control-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .main-controls {
                    gap: 1.5rem;
                }
                
                .mp3-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.95) 0%,
                        var(--light-cream) 30%,
                        var(--warm-cream) 70%,
                        rgba(184, 179, 173, 0.4) 100%);
                    box-shadow: 
                        6px 6px 16px rgba(184, 179, 173, 0.4),
                        -3px -3px 12px rgba(255, 255, 255, 0.8),
                        inset 0 1px 2px rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: visible;
                }
                
                .mp3-btn.large {
                    width: 64px;
                    height: 64px;
                }
                
                .mp3-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.98) 0%,
                        var(--cream) 30%,
                        var(--warm-cream) 70%,
                        rgba(184, 179, 173, 0.45) 100%);
                    box-shadow: 
                        8px 8px 20px rgba(184, 179, 173, 0.5),
                        -4px -4px 16px rgba(255, 255, 255, 0.9),
                        inset 0 2px 4px rgba(255, 255, 255, 0.7);
                    transform: translateY(-2px);
                }
                
                .mp3-btn:active {
                    background: linear-gradient(145deg, 
                        var(--warm-cream) 0%,
                        rgba(184, 179, 173, 0.3) 30%,
                        var(--light-cream) 100%);
                    box-shadow: 
                        inset 4px 4px 8px rgba(184, 179, 173, 0.6),
                        inset -2px -2px 6px rgba(255, 255, 255, 0.3),
                        2px 2px 4px rgba(184, 179, 173, 0.2);
                    transform: translateY(1px);
                }
                
                /* SVG Icon Styles - Icons appear carved into the button */
                .btn-icon-svg {
                    width: 24px;
                    height: 24px;
                    position: relative;
                    filter: drop-shadow(0 -1px 1px rgba(255, 255, 255, 0.4))
                            drop-shadow(0 2px 2px rgba(45, 42, 37, 0.3));
                    transition: all 0.2s ease;
                }
                
                .btn-icon-svg.large {
                    width: 32px;
                    height: 32px;
                    filter: drop-shadow(0 -1px 2px rgba(255, 255, 255, 0.5))
                            drop-shadow(0 2px 3px rgba(45, 42, 37, 0.4));
                }
                
                .btn-icon-svg path,
                .btn-icon-svg g {
                    transition: all 0.2s ease;
                }
                
                /* Hover state - icons get slightly deeper */
                .mp3-btn:hover .btn-icon-svg {
                    filter: drop-shadow(0 -1px 2px rgba(255, 255, 255, 0.6))
                            drop-shadow(0 2px 3px rgba(45, 42, 37, 0.5));
                }
                
                .mp3-btn:hover .btn-icon-svg path {
                    fill: rgba(184, 179, 173, 0.5) !important;
                    stroke: rgba(45, 42, 37, 0.3) !important;
                }
                
                /* Active state - icons get pressed deeper */
                .mp3-btn:active .btn-icon-svg {
                    filter: drop-shadow(0 -0.5px 0.5px rgba(255, 255, 255, 0.3))
                            drop-shadow(0 1px 1px rgba(45, 42, 37, 0.6));
                }
                
                .mp3-btn:active .btn-icon-svg path {
                    fill: rgba(184, 179, 173, 0.6) !important;
                    stroke: rgba(45, 42, 37, 0.4) !important;
                    stroke-width: 0.7;
                }
                
                /* Position SVG icons absolutely to stack them */
                .mp3-btn.large {
                    position: relative;
                }
                
                .mp3-btn.large .btn-icon-svg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                
                .mp3-btn.large:active .btn-icon-svg {
                    transform: translate(-50%, -50%) translateY(1px);
                }
                
                /* Pause icon visibility is controlled by JavaScript inline styles only */
                
                /* Large Volume Knob */
                .volume-section {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .volume-panel {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                
                .volume-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--warm-gray);
                    letter-spacing: 1.5px;
                    opacity: 0.8;
                }
                
                .mp3-volume-knob-large {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }
                
                .knob-outer-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
                
                .knob-marking {
                    position: absolute;
                    top: 4px;
                    left: 50%;
                    width: 2px;
                    height: 8px;
                    background: rgba(184, 179, 173, 0.6);
                    border-radius: 1px;
                    transform-origin: center 36px;
                    margin-left: -1px;
                }
                
                .mp3-knob-body {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.95) 0%,
                        var(--cream) 30%,
                        var(--warm-cream) 70%,
                        rgba(184, 179, 173, 0.4) 100%);
                    box-shadow: 
                        4px 4px 12px rgba(184, 179, 173, 0.4),
                        -2px -2px 8px rgba(255, 255, 255, 0.6),
                        inset 0 2px 4px rgba(255, 255, 255, 0.4);
                    transition: all 0.1s ease;
                }
                
                .mp3-knob-body:hover {
                    box-shadow: 
                        4px 4px 14px rgba(184, 179, 173, 0.5),
                        -2px -2px 10px rgba(255, 255, 255, 0.7),
                        inset 0 2px 5px rgba(255, 255, 255, 0.5);
                }
                
                .mp3-knob-indicator {
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 3px;
                    height: 12px;
                    background: linear-gradient(180deg, var(--primary-orange), var(--soft-orange));
                    border-radius: 1.5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    transform-origin: center 24px;
                    transition: transform 0.15s ease;
                }
                
                .mp3-knob-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, 
                        rgba(248, 243, 238, 0.95) 0%,
                        var(--warm-cream) 50%,
                        rgba(184, 179, 173, 0.3) 100%);
                    box-shadow: 
                        inset 2px 2px 4px rgba(255, 255, 255, 0.5),
                        inset -2px -2px 4px rgba(184, 179, 173, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .knob-texture-lines {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    align-items: center;
                }
                
                .texture-line {
                    width: 16px;
                    height: 1px;
                    background: linear-gradient(90deg, 
                        transparent 0%,
                        rgba(184, 179, 173, 0.4) 50%,
                        transparent 100%);
                }
                
                .volume-display {
                    display: flex;
                    align-items: baseline;
                    gap: 2px;
                    font-family: var(--font-mono);
                    color: var(--warm-gray);
                }
                
                .volume-value {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .volume-unit {
                    font-size: 11px;
                    opacity: 0.7;
                }
                
                /* EQ Button Styling */
                .eq-button-container {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                }
                
                .eq-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 50%;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.95) 0%,
                        rgba(230, 225, 220, 0.8) 50%,
                        rgba(184, 179, 173, 0.6) 100%);
                    box-shadow: 
                        0 4px 8px rgba(45, 42, 37, 0.2),
                        inset 0 2px 4px rgba(255, 255, 255, 0.6),
                        inset 0 -2px 4px rgba(184, 179, 173, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }
                
                .eq-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 250, 245, 0.98) 0%,
                        rgba(240, 235, 230, 0.85) 50%,
                        rgba(194, 189, 183, 0.65) 100%);
                    box-shadow: 
                        0 6px 12px rgba(45, 42, 37, 0.25),
                        inset 0 3px 6px rgba(255, 255, 255, 0.7),
                        inset 0 -3px 6px rgba(184, 179, 173, 0.35);
                    transform: translateY(-1px);
                }
                
                .eq-btn:active {
                    background: linear-gradient(145deg, 
                        rgba(224, 219, 213, 0.9) 0%,
                        rgba(204, 199, 193, 0.8) 50%,
                        rgba(184, 179, 173, 0.7) 100%);
                    box-shadow: 
                        0 2px 4px rgba(45, 42, 37, 0.3),
                        inset 0 2px 6px rgba(184, 179, 173, 0.4),
                        inset 0 -1px 3px rgba(255, 255, 255, 0.3);
                    transform: translateY(1px);
                }
                
                .eq-icon {
                    width: 18px;
                    height: 18px;
                }
                
            </style>
        `;
    }
    
    createPomodoroContent() {
        return `
            <div class="pomodoro-app">
                <div class="app-window-header drag-handle">
                    <button class="app-control-btn close" title="Close"></button>
                    <button class="app-control-btn minimize" title="Minimize"></button>
                    <button class="app-control-btn maximize" title="Maximize"></button>
                    <div class="app-brand">Pomodoro Timer</div>
                    <div class="drag-grip">⋮⋮</div>
                </div>
                
                <div class="pomodoro-content">
                    <!-- Digital Clock Display -->
                    <div class="digital-clock-container">
                        <div class="digital-clock-frame">
                            <div class="digital-clock-screen">
                                <div class="lcd-display">
                                    <div class="timer-time" id="timer-time">25:00</div>
                                    <div class="session-indicator">
                                        <span class="session-type" id="session-type">WORK SESSION</span>
                                        <span class="session-count" id="session-count">1/4</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-bg">
                                            <div class="progress-bar-fill" id="progress-bar"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Control Buttons on Screen Bevel -->
                            <div class="screen-controls">
                                <button class="screen-btn primary" id="start-pause-btn">START</button>
                                <button class="screen-btn" id="reset-btn">RESET</button>
                                <button class="screen-btn" id="skip-btn">SKIP</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Settings Button -->
                    <div class="settings-button-container">
                        <button class="settings-open-btn" id="settings-open-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Goal Setting -->
                    <div class="goal-container">
                        <input type="text" class="goal-input" id="goal-input" placeholder="What are we working on next?">
                    </div>
                    
                </div>
            </div>
            
            <style>
                .pomodoro-app {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.98) 0%,
                        var(--cream) 25%,
                        var(--warm-cream) 75%,
                        rgba(184, 179, 173, 0.4) 100%);
                    border-radius: 20px;
                    overflow-x: hidden;
                    overflow-y: auto;
                    font-family: var(--font-main);
                }
                
                .pomodoro-content {
                    padding: 40px 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 25px;
                    height: auto;
                    overflow: visible;
                    position: relative;
                }
                
                /* Digital Clock Container */
                .digital-clock-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                
                .digital-clock-frame {
                    background: linear-gradient(145deg, 
                        rgba(45, 42, 37, 0.9) 0%,
                        rgba(30, 28, 25, 0.95) 50%,
                        rgba(20, 18, 16, 1) 100%);
                    border-radius: 24px;
                    padding: 18px;
                    box-shadow: 
                        0 15px 40px rgba(0, 0, 0, 0.4),
                        inset 0 3px 8px rgba(255, 255, 255, 0.1),
                        inset 0 -3px 8px rgba(0, 0, 0, 0.4);
                    border: 3px solid rgba(45, 42, 37, 0.8);
                    position: relative;
                }
                
                .digital-clock-screen {
                    background: linear-gradient(145deg, 
                        rgba(15, 15, 15, 1) 0%,
                        rgba(10, 10, 10, 1) 50%,
                        rgba(5, 5, 5, 1) 100%);
                    border-radius: 20px;
                    padding: 6px;
                    box-shadow: 
                        inset 0 4px 12px rgba(0, 0, 0, 0.8),
                        inset 0 -2px 8px rgba(0, 0, 0, 0.6);
                    border: 2px solid rgba(30, 28, 25, 0.6);
                    position: relative;
                }
                
                .digital-clock-screen::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(
                        ellipse at center,
                        rgba(250, 245, 240, 0.02) 0%,
                        rgba(250, 245, 240, 0.01) 50%,
                        transparent 100%
                    );
                    border-radius: 18px;
                    pointer-events: none;
                }
                
                .lcd-display {
                    background: linear-gradient(145deg, 
                        rgba(25, 25, 25, 1) 0%,
                        rgba(15, 15, 15, 1) 50%,
                        rgba(10, 10, 10, 1) 100%);
                    border-radius: 16px;
                    padding: 20px 18px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 18px;
                    min-width: 260px;
                    box-shadow: 
                        inset 0 3px 8px rgba(0, 0, 0, 0.6),
                        inset 0 -1px 4px rgba(250, 245, 240, 0.05);
                    border: 1px solid rgba(45, 42, 37, 0.4);
                    position: relative;
                    overflow: hidden;
                }
                
                .lcd-display::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, 
                        transparent 0%,
                        rgba(250, 245, 240, 0.1) 50%,
                        transparent 100%
                    );
                }
                
                .timer-time {
                    font-family: var(--font-pixel);
                    font-size: 3.5em;
                    font-weight: 500;
                    color: var(--orange);
                    text-shadow: 
                        0 2px 4px rgba(255, 87, 34, 0.3),
                        0 1px 2px rgba(255, 255, 255, 0.8);
                    letter-spacing: 3px;
                    margin: 0;
                    text-align: center;
                }
                
                .session-indicator {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    font-family: var(--font-main);
                    font-size: 0.95em;
                    color: var(--warm-gray);
                    font-weight: 600;
                    opacity: 0.8;
                }
                
                .progress-bar-container {
                    width: 100%;
                    margin-top: 8px;
                }
                
                .progress-bar-bg {
                    width: 100%;
                    height: 8px;
                    background: linear-gradient(145deg, 
                        rgba(184, 179, 173, 0.3) 0%,
                        rgba(200, 195, 190, 0.4) 100%);
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: 
                        inset 0 2px 4px rgba(184, 179, 173, 0.4),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(184, 179, 173, 0.2);
                }
                
                .progress-bar-fill {
                    height: 100%;
                    background: var(--orange);
                    border-radius: 3px;
                    transition: width 1s ease;
                    width: 0%;
                    box-shadow: 
                        0 0 8px rgba(255, 107, 53, 0.6),
                        0 1px 3px rgba(255, 87, 34, 0.4),
                        inset 0 1px 2px rgba(255, 255, 255, 0.4);
                }
                
                /* Screen Controls on Bevel */
                .screen-controls {
                    position: absolute;
                    bottom: 2px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 3px;
                    z-index: 50;
                    pointer-events: auto;
                }
                
                .screen-btn {
                    padding: 4px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-family: var(--font-main);
                    font-size: 8px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                    background: linear-gradient(145deg, 
                        rgba(45, 42, 37, 0.9) 0%, 
                        rgba(35, 32, 29, 0.95) 50%, 
                        rgba(25, 22, 19, 1) 100%);
                    color: rgba(250, 245, 240, 0.8);
                    box-shadow: 
                        0 1px 3px rgba(0, 0, 0, 0.3),
                        inset 0 1px 1px rgba(255, 255, 255, 0.1),
                        inset 0 -1px 1px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(60, 57, 54, 0.8);
                    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
                    min-width: 28px;
                    height: 18px;
                    pointer-events: auto;
                }
                
                .screen-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(55, 52, 49, 0.9) 0%, 
                        rgba(45, 42, 39, 0.95) 50%, 
                        rgba(35, 32, 29, 1) 100%);
                    color: rgba(250, 245, 240, 0.9);
                    transform: translateY(-1px);
                    box-shadow: 
                        0 3px 8px rgba(0, 0, 0, 0.4),
                        inset 0 1px 2px rgba(255, 255, 255, 0.15),
                        inset 0 -1px 2px rgba(0, 0, 0, 0.3);
                }
                
                .screen-btn:active {
                    transform: translateY(1px);
                    box-shadow: 
                        0 1px 3px rgba(0, 0, 0, 0.4),
                        inset 0 2px 4px rgba(0, 0, 0, 0.4),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.1);
                }
                
                .screen-btn.primary {
                    background: linear-gradient(145deg, 
                        var(--orange) 0%, 
                        rgba(255, 87, 34, 0.9) 50%, 
                        rgba(230, 74, 25, 1) 100%);
                    color: white;
                    font-size: 7px;
                    font-weight: 700;
                    padding: 3px 8px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 
                        0 1px 4px rgba(255, 87, 34, 0.3),
                        inset 0 1px 1px rgba(255, 255, 255, 0.3),
                        inset 0 -1px 1px rgba(0, 0, 0, 0.2);
                    min-width: 30px;
                }
                
                .screen-btn.primary:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 107, 53, 1) 0%, 
                        var(--orange) 50%, 
                        rgba(255, 87, 34, 0.9) 100%);
                    transform: translateY(-1px);
                    box-shadow: 
                        0 4px 10px rgba(255, 87, 34, 0.4),
                        inset 0 1px 2px rgba(255, 255, 255, 0.4),
                        inset 0 -1px 2px rgba(0, 0, 0, 0.2);
                }
                
                .screen-btn.primary:active {
                    transform: translateY(1px);
                    box-shadow: 
                        0 2px 5px rgba(255, 87, 34, 0.3),
                        inset 0 2px 4px rgba(0, 0, 0, 0.2),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.2);
                }
                
                /* Settings Button */
                .settings-button-container {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 20;
                }
                
                .settings-open-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.8) 0%, 
                        rgba(240, 235, 230, 0.6) 50%, 
                        rgba(220, 215, 210, 0.5) 100%);
                    color: var(--warm-gray);
                    box-shadow: 
                        0 2px 6px rgba(45, 42, 37, 0.1),
                        inset 0 1px 3px rgba(255, 255, 255, 0.7),
                        inset 0 -1px 3px rgba(184, 179, 173, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    pointer-events: auto;
                    z-index: 100;
                }
                
                .settings-open-btn:hover {
                    transform: translateY(-1px);
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.9) 0%, 
                        rgba(250, 245, 240, 0.7) 50%, 
                        rgba(240, 235, 230, 0.6) 100%);
                    box-shadow: 
                        0 4px 10px rgba(45, 42, 37, 0.15),
                        inset 0 1px 3px rgba(255, 255, 255, 0.8),
                        inset 0 -1px 3px rgba(184, 179, 173, 0.2);
                }
                
                .settings-open-btn:active {
                    transform: translateY(1px);
                    box-shadow: 
                        0 1px 4px rgba(45, 42, 37, 0.2),
                        inset 0 2px 6px rgba(184, 179, 173, 0.3),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.5);
                }
                
                /* Goal Container */
                .goal-container {
                    width: 100%;
                    max-width: 320px;
                }
                
                .goal-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid rgba(184, 179, 173, 0.3);
                    border-radius: 12px;
                    font-size: 14px;
                    background: linear-gradient(145deg, #fff, #f8f8f8);
                    color: var(--warm-gray);
                    box-shadow: 
                        inset 0 2px 6px rgba(0, 0, 0, 0.1),
                        0 1px 3px rgba(255, 255, 255, 0.8);
                    outline: none;
                    transition: all 0.2s ease;
                    font-family: var(--font-main);
                }
                
                .goal-input:focus {
                    border-color: var(--orange);
                    box-shadow: 
                        inset 0 2px 6px rgba(0, 0, 0, 0.1),
                        0 0 12px rgba(255, 107, 53, 0.3);
                    background: white;
                }
                
            </style>
        `;
    }
    
    createPomodoroSettingsContent() {
        return `
            <div class="app-window-container">
                <div class="app-window-header drag-handle">
                    <button class="app-control-btn close" title="Close"></button>
                    <button class="app-control-btn minimize" title="Minimize"></button>
                    <button class="app-control-btn maximize" title="Maximize"></button>
                    <div class="app-brand">⚙️ Timer Settings</div>
                    <div class="drag-grip">⋮⋮</div>
                </div>
                <div class="app-window-content settings-window-content">
                    <div class="settings-grid">
                        <div class="setting-group">
                            <label class="setting-label">WORK SESSION</label>
                            <div class="setting-control">
                                <button class="setting-btn decrease" data-target="work-duration">−</button>
                                <input type="number" id="work-duration" value="25" min="1" max="60" class="setting-input">
                                <button class="setting-btn increase" data-target="work-duration">+</button>
                            </div>
                            <span class="setting-unit">min</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">SHORT BREAK</label>
                            <div class="setting-control">
                                <button class="setting-btn decrease" data-target="short-break">−</button>
                                <input type="number" id="short-break" value="5" min="1" max="30" class="setting-input">
                                <button class="setting-btn increase" data-target="short-break">+</button>
                            </div>
                            <span class="setting-unit">min</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">LONG BREAK</label>
                            <div class="setting-control">
                                <button class="setting-btn decrease" data-target="long-break">−</button>
                                <input type="number" id="long-break" value="15" min="1" max="60" class="setting-input">
                                <button class="setting-btn increase" data-target="long-break">+</button>
                            </div>
                            <span class="setting-unit">min</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .settings-window-content {
                    padding: 20px;
                }
                
                .settings-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .setting-group {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                }
                
                .setting-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--warm-gray);
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                    min-width: 90px;
                    text-align: left;
                }
                
                .setting-control {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }
                
                .setting-btn {
                    width: 28px;
                    height: 32px;
                    border: none;
                    background: linear-gradient(145deg, 
                        #f5f5f5 0%, 
                        #e8e8e8 50%, 
                        #d0d0d0 100%);
                    color: var(--warm-gray);
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: 
                        inset 0 1px 3px rgba(255, 255, 255, 0.8),
                        inset 0 -1px 3px rgba(0, 0, 0, 0.1);
                    border-right: 1px solid rgba(184, 179, 173, 0.3);
                    user-select: none;
                }
                
                .setting-btn:last-child {
                    border-right: none;
                    border-left: 1px solid rgba(184, 179, 173, 0.3);
                }
                
                .setting-btn:hover {
                    background: linear-gradient(145deg, 
                        #ffffff 0%, 
                        #f0f0f0 50%, 
                        #e0e0e0 100%);
                    box-shadow: 
                        inset 0 1px 3px rgba(255, 255, 255, 0.9),
                        inset 0 -1px 3px rgba(0, 0, 0, 0.1);
                }
                
                .setting-btn:active {
                    background: linear-gradient(145deg, 
                        #d0d0d0 0%, 
                        #e8e8e8 50%, 
                        #f5f5f5 100%);
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.2),
                        inset 0 -1px 2px rgba(255, 255, 255, 0.5);
                    transform: translateY(1px);
                }
                
                .setting-input {
                    width: 45px;
                    height: 32px;
                    border: none;
                    text-align: center;
                    font-size: 13px;
                    font-weight: bold;
                    font-family: var(--font-pixel);
                    background: linear-gradient(145deg, #fff, #f8f8f8);
                    color: var(--warm-gray);
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.1);
                    outline: none;
                    transition: all 0.2s ease;
                    -webkit-appearance: none;
                    -moz-appearance: textfield;
                }
                
                .setting-input::-webkit-outer-spin-button,
                .setting-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                
                .setting-input:focus {
                    background: white;
                    color: var(--orange);
                }
                
                .setting-unit {
                    font-size: 9px;
                    color: var(--warm-gray);
                    opacity: 0.6;
                    font-weight: 500;
                }
            </style>
        `;
    }
    
    setupPomodoroSettingsWindow(windowElement) {
        console.log('⚙️ Setting up Pomodoro Settings window interactions');
        
        // Always use default settings (don't read from main window or localStorage)
        let currentSettings = {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15
        };
        console.log('⚙️ Using default settings for settings window:', currentSettings);
        
        // Set initial values in settings window
        const workInput = windowElement.querySelector('#work-duration');
        const shortInput = windowElement.querySelector('#short-break');
        const longInput = windowElement.querySelector('#long-break');
        
        if (workInput) workInput.value = currentSettings.workDuration;
        if (shortInput) shortInput.value = currentSettings.shortBreak;
        if (longInput) longInput.value = currentSettings.longBreak;
        
        // Add event listeners for +/- buttons
        const buttons = windowElement.querySelectorAll('.setting-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sounds.play('click');
                
                const target = btn.dataset.target;
                const input = windowElement.querySelector(`#${target}`);
                const isIncrease = btn.classList.contains('increase');
                
                if (input) {
                    let value = parseInt(input.value);
                    const min = parseInt(input.min);
                    const max = parseInt(input.max);
                    
                    if (isIncrease) {
                        value = Math.min(max, value + 1);
                    } else {
                        value = Math.max(min, value - 1);
                    }
                    
                    input.value = value;
                    
                    // Update main timer immediately
                    this.updatePomodoroTimerSettings(target, value);
                }
            });
        });
        
        // Add event listeners for direct input changes
        [workInput, shortInput, longInput].forEach(input => {
            if (input) {
                input.addEventListener('change', (e) => {
                    const value = parseInt(e.target.value);
                    const min = parseInt(e.target.min);
                    const max = parseInt(e.target.max);
                    
                    // Validate and clamp value
                    const clampedValue = Math.min(max, Math.max(min, value || min));
                    e.target.value = clampedValue;
                    
                    // Update main timer
                    this.updatePomodoroTimerSettings(e.target.id, clampedValue);
                });
            }
        });
        
        console.log('⚙️ Pomodoro Settings window interactions setup complete');
    }
    
    updatePomodoroTimerSettings(settingName, value) {
        const pomodoroWindow = document.querySelector('.pomodoro-app');
        if (!pomodoroWindow) return;
        
        // Update the display values in the main timer
        let displayElement;
        switch (settingName) {
            case 'work-duration':
                displayElement = pomodoroWindow.querySelector('#work-duration-display');
                break;
            case 'short-break':
                displayElement = pomodoroWindow.querySelector('#short-break-display');
                break;
            case 'long-break':
                displayElement = pomodoroWindow.querySelector('#long-break-display');
                break;
        }
        
        if (displayElement) {
            displayElement.textContent = value;
        }
        
        // Save to localStorage and trigger timer refresh
        const settings = JSON.parse(localStorage.getItem('pomodoro-settings') || '{}');
        switch (settingName) {
            case 'work-duration':
                settings.workDuration = value;
                break;
            case 'short-break':
                settings.shortBreakDuration = value;
                break;
            case 'long-break':
                settings.longBreakDuration = value;
                break;
        }
        localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
        
        // Trigger a custom event to notify the timer to reload settings
        const settingsUpdateEvent = new CustomEvent('pomodoroSettingsUpdated', {
            detail: { settingName, value, settings }
        });
        document.dispatchEvent(settingsUpdateEvent);
        
        console.log(`⚙️ Updated ${settingName} to ${value} minutes`);
    }
    
    showPomodoroNotification(message, duration = 4000) {
        // Remove any existing notification
        const existingNotification = document.getElementById('pomodoro-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Find the Pomodoro window to position relative to it
        const pomodoroWindow = document.querySelector('.pomodoro-app')?.closest('.window');
        if (!pomodoroWindow) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'pomodoro-notification';
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
            <style>
                #pomodoro-notification {
                    position: fixed;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(145deg, 
                        rgba(255, 107, 53, 0.95) 0%, 
                        rgba(255, 87, 34, 0.9) 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    box-shadow: 
                        0 8px 32px rgba(255, 87, 34, 0.3),
                        0 4px 16px rgba(0, 0, 0, 0.2);
                    font-family: var(--font-main);
                    font-size: 14px;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideInFromTop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    margin-top: 20px;
                    max-width: 400px;
                    text-align: center;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                @keyframes slideOutToTop {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-100px);
                    }
                }
            </style>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutToTop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }
        }, duration);
        
        console.log(`🍅 Pomodoro notification: ${message}`);
    }
    
    createEQContent() {
        return `
            <div class="eq-window-container">
                <div class="app-window-container">
                    <div class="app-window-header drag-handle">
                        <button class="app-control-btn close" title="Close"></button>
                        <button class="app-control-btn minimize" title="Minimize"></button>
                        <button class="app-control-btn maximize" title="Maximize"></button>
                        <div class="app-brand">Equalizer</div>
                        <div class="drag-grip">⋮⋮</div>
                    </div>
                    <div class="app-window-content eq-content">
                        <!-- Audio Effects Section -->
                        <div class="eq-section">
                            <h3>Audio Effects</h3>
                            <div class="eq-controls">
                                <div class="eq-control">
                                    <label>Low-pass Filter</label>
                                    <input type="range" id="lowpass-freq" min="200" max="8000" value="8000" class="eq-slider">
                                    <span class="eq-value" id="lowpass-value">8000 Hz</span>
                                </div>
                                <div class="eq-control">
                                    <label>High-pass Filter</label>
                                    <input type="range" id="highpass-freq" min="20" max="2000" value="20" class="eq-slider">
                                    <span class="eq-value" id="highpass-value">20 Hz</span>
                                </div>
                                <div class="eq-control">
                                    <label>Compression</label>
                                    <input type="range" id="compression" min="0" max="100" value="0" class="eq-slider">
                                    <span class="eq-value" id="compression-value">0%</span>
                                </div>
                                <div class="eq-control">
                                    <label>Distortion</label>
                                    <input type="range" id="distortion" min="0" max="100" value="0" class="eq-slider">
                                    <span class="eq-value" id="distortion-value">0%</span>
                                </div>
                                <div class="eq-control">
                                    <label>Gain</label>
                                    <input type="range" id="gain" min="0" max="200" value="100" class="eq-slider">
                                    <span class="eq-value" id="gain-value">100%</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Presets Section -->
                        <div class="eq-section">
                            <h3>Presets</h3>
                            <div class="eq-presets">
                                <button class="eq-preset-btn active" data-preset="normal">Normal</button>
                                <button class="eq-preset-btn" data-preset="old-radio">Old Radio</button>
                                <button class="eq-preset-btn" data-preset="telephone">Telephone</button>
                                <button class="eq-preset-btn" data-preset="elevator">Elevator</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .eq-window-container {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.98) 0%,
                        var(--cream) 25%,
                        var(--warm-cream) 75%,
                        rgba(184, 179, 173, 0.4) 100%);
                    border-radius: 28px;
                    padding: 0;
                    box-shadow: 
                        0 12px 32px rgba(45, 42, 37, 0.3),
                        inset 0 2px 6px rgba(255, 255, 255, 0.4),
                        inset 0 -2px 6px rgba(184, 179, 173, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.6);
                    overflow: hidden;
                }
                
                .eq-content {
                    padding: 16px;
                    height: calc(100% - 50px);
                    overflow-y: auto;
                }
                
                .eq-section {
                    margin-bottom: 24px;
                }
                
                .eq-section h3 {
                    color: var(--warm-gray);
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .eq-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .eq-control {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: inset 0 1px 3px rgba(184, 179, 173, 0.2);
                }
                
                .eq-control label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--warm-gray);
                    min-width: 80px;
                }
                
                .eq-slider {
                    flex: 1;
                    margin: 0 12px;
                    -webkit-appearance: none;
                    height: 4px;
                    background: linear-gradient(90deg, 
                        rgba(184, 179, 173, 0.3) 0%,
                        rgba(255, 255, 255, 0.8) 100%);
                    border-radius: 2px;
                    outline: none;
                }
                
                .eq-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: linear-gradient(145deg, 
                        rgba(250, 245, 240, 0.95) 0%,
                        rgba(230, 225, 220, 0.8) 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 
                        0 2px 4px rgba(45, 42, 37, 0.2),
                        inset 0 1px 2px rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(184, 179, 173, 0.3);
                }
                
                .eq-value {
                    font-size: 11px;
                    color: var(--warm-gray);
                    font-family: var(--font-mono);
                    min-width: 50px;
                    text-align: right;
                }
                
                .eq-presets {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                
                .eq-preset-btn {
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 500;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.6) 0%,
                        rgba(240, 235, 230, 0.4) 100%);
                    box-shadow: 
                        0 2px 4px rgba(45, 42, 37, 0.1),
                        inset 0 1px 2px rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    color: var(--warm-gray);
                }
                
                .eq-preset-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.8) 0%,
                        rgba(250, 245, 240, 0.6) 100%);
                    transform: translateY(-1px);
                    box-shadow: 
                        0 4px 8px rgba(45, 42, 37, 0.15),
                        inset 0 1px 3px rgba(255, 255, 255, 0.7);
                }
                
                .eq-preset-btn.active {
                    background: linear-gradient(145deg, 
                        rgba(255, 107, 53, 0.8) 0%,
                        rgba(255, 87, 34, 0.9) 100%);
                    color: white;
                    box-shadow: 
                        0 3px 6px rgba(255, 107, 53, 0.3),
                        inset 0 1px 2px rgba(255, 255, 255, 0.3);
                }
                
                .eq-preset-btn:active {
                    transform: translateY(1px);
                }
            </style>
        `;
    }
    
    setupEQWindowControls(window) {
        console.log('🎛️ Setting up EQ window-specific controls');
        
        // Only setup controls for this specific EQ window
        const closeBtn = window.querySelector('.close');
        const minimizeBtn = window.querySelector('.minimize');
        const maximizeBtn = window.querySelector('.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎛️ EQ window close button clicked');
                this.closeWindow(window.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎛️ EQ window minimize button clicked');
                this.minimizeWindow(window);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎛️ EQ window maximize button clicked');
                this.maximizeWindow(window);
            });
        }
        
        // Setup dragging for the EQ window
        const dragHandle = window.querySelector('.drag-handle');
        if (dragHandle) {
            this.setupEQWindowDragging(window, dragHandle);
        }
    }
    
    setupEQWindowDragging(window, dragHandle) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            const rect = window.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            window.style.zIndex = ++this.windowZIndex;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                window.style.left = `${e.clientX - dragOffset.x}px`;
                window.style.top = `${e.clientY - dragOffset.y}px`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    initializeAudioContext() {
        console.log('🎛️ Initializing Web Audio API for EQ');
        
        // Create audio context and EQ filters
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create biquad filters for each frequency band
        this.eqFilters = {
            '60': this.audioContext.createBiquadFilter(),
            '170': this.audioContext.createBiquadFilter(), 
            '310': this.audioContext.createBiquadFilter(),
            '600': this.audioContext.createBiquadFilter(),
            '1000': this.audioContext.createBiquadFilter(),
            '3000': this.audioContext.createBiquadFilter(),
            '6000': this.audioContext.createBiquadFilter(),
            '12000': this.audioContext.createBiquadFilter()
        };
        
        // Configure filter frequencies
        this.eqFilters['60'].frequency.value = 60;
        this.eqFilters['170'].frequency.value = 170;
        this.eqFilters['310'].frequency.value = 310;
        this.eqFilters['600'].frequency.value = 600;
        this.eqFilters['1000'].frequency.value = 1000;
        this.eqFilters['3000'].frequency.value = 3000;
        this.eqFilters['6000'].frequency.value = 6000;
        this.eqFilters['12000'].frequency.value = 12000;
        
        // Set all filters to peaking type
        Object.values(this.eqFilters).forEach(filter => {
            filter.type = 'peaking';
            filter.Q.value = 1;
            filter.gain.value = 0;
        });
        
        // Create compressor
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // Create gain node for master volume
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 1.0;
        
        console.log('🎛️ Web Audio API EQ initialized');
        console.log('⚠️  Note: YouTube IFrame API audio cannot be routed through Web Audio API due to CORS restrictions');
        console.log('🎛️ EQ will control master volume via YouTube player, but frequency bands are for demonstration');
    }
    
    connectAudioNodes(sourceNode) {
        if (!this.eqFilters || !sourceNode) return sourceNode;
        
        // Chain all EQ filters
        let currentNode = sourceNode;
        Object.values(this.eqFilters).forEach(filter => {
            currentNode.connect(filter);
            currentNode = filter;
        });
        
        // Connect to compressor and master gain
        currentNode.connect(this.compressor);
        this.compressor.connect(this.masterGain);
        
        return this.masterGain;
    }

    updateSliderHandle(slider, value) {
        const container = slider.parentElement;
        const handle = container.querySelector('.eq-slider-handle');
        if (handle) {
            // Convert value (-12 to +12) to position (0 to 164px from bottom)
            const percentage = (value + 12) / 24; // Convert to 0-1 range
            const position = 164 - (percentage * 164); // Invert for bottom-to-top
            handle.style.top = `${8 + position}px`; // Add 8px offset for track top
        }
    }

    setupEQControls() {
        // Setup slider value updates and audio processing
        const sliders = document.querySelectorAll('.eq-slider');
        sliders.forEach(slider => {
            const valueDisplay = document.getElementById(slider.id + '-value');
            const frequency = slider.id.replace('eq-', '');
            
            if (valueDisplay) {
                slider.addEventListener('input', () => {
                    const value = parseFloat(slider.value);
                    valueDisplay.textContent = `${value > 0 ? '+' : ''}${value}dB`;
                    
                    // Update visual slider handle position
                    this.updateSliderHandle(slider, value);
                    
                    // Apply EQ filter gain in real-time
                    if (this.eqFilters && this.eqFilters[frequency]) {
                        this.eqFilters[frequency].gain.value = value;
                        console.log(`🎛️ EQ ${frequency}Hz set to ${value}dB`);
                    }
                });
                
                // Initialize slider handle position
                this.updateSliderHandle(slider, 0);
            }
        });
        
        // Setup master volume and compression controls
        const masterVolume = document.getElementById('master-volume');
        const compression = document.getElementById('compression');
        
        if (masterVolume) {
            masterVolume.addEventListener('input', () => {
                const value = masterVolume.value;
                document.getElementById('master-volume-value').textContent = `${value}%`;
                
                // Apply to YouTube player volume
                if (window.mp3Player && window.mp3Player.player && window.mp3Player.player.setVolume) {
                    window.mp3Player.player.setVolume(value);
                    window.mp3Player.volume = value;
                }
                
                // Also apply to Web Audio master gain if available
                if (this.masterGain) {
                    this.masterGain.gain.value = value / 100;
                }
            });
        }
        
        if (compression) {
            compression.addEventListener('input', () => {
                const value = compression.value;
                document.getElementById('compression-value').textContent = `${value}%`;
                
                // Apply compression settings
                if (this.compressor) {
                    this.compressor.ratio.value = 1 + (value / 100) * 19; // 1-20 ratio
                    this.compressor.threshold.value = -24 + (value / 100) * 20; // -24 to -4 dB
                }
            });
        }
        
        // Setup preset buttons
        const presetButtons = document.querySelectorAll('.eq-preset-btn');
        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                presetButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.applyEQPreset(button.dataset.preset);
            });
        });
    }
    
    applyEQPreset(presetName) {
        const presets = {
            'normal': {
                '60': 0, '170': 0, '310': 0, '600': 0, 
                '1000': 0, '3000': 0, '6000': 0, '12000': 0
            },
            'old-radio': {
                '60': -8, '170': -4, '310': 2, '600': 4,
                '1000': 2, '3000': -2, '6000': -6, '12000': -8
            },
            'telephone': {
                '60': -10, '170': -6, '310': 4, '600': 6,
                '1000': 4, '3000': 2, '6000': -4, '12000': -8
            },
            'elevator': {
                '60': -4, '170': -2, '310': 0, '600': 1,
                '1000': 0, '3000': -1, '6000': -3, '12000': -5
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            // Apply preset values to sliders and filters
            Object.keys(preset).forEach(frequency => {
                const sliderId = `eq-${frequency}`;
                const slider = document.getElementById(sliderId);
                const valueDisplay = document.getElementById(sliderId + '-value');
                const gainValue = preset[frequency];
                
                if (slider && valueDisplay) {
                    slider.value = gainValue;
                    valueDisplay.textContent = `${gainValue > 0 ? '+' : ''}${gainValue}dB`;
                    
                    // Update visual slider handle
                    this.updateSliderHandle(slider, gainValue);
                    
                    // Apply to audio filter
                    if (this.eqFilters && this.eqFilters[frequency]) {
                        this.eqFilters[frequency].gain.value = gainValue;
                    }
                }
            });
            
            console.log(`🎛️ Applied EQ preset: ${presetName}`);
        }
    }

    // ===== TASK TRACKING & ACHIEVEMENTS =====

    showAchievement(title, description, icon = '🎉') {
        // Create achievement popup element
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <button class="app-control-btn close achievement-close-btn" title="Close" style="
                position: absolute;
                top: 8px;
                right: 8px;
                width: 20px;
                height: 20px;
                min-width: 20px;
                min-height: 20px;
            "></button>
            <div class="achievement-header">
                <div class="achievement-icon">${icon}</div>
                <div>
                    <div class="achievement-title">${title}</div>
                    <div class="achievement-subtitle">Achievement Unlocked</div>
                </div>
            </div>
            <div class="achievement-description">${description}</div>
        `;

        document.body.appendChild(popup);
        this.sounds.play('achievement');

        // Show the popup
        setTimeout(() => popup.classList.add('show'), 100);

        // Auto-dismiss after 5 seconds
        const autoDismiss = setTimeout(() => {
            this.dismissAchievement(popup);
        }, 5000);

        // Manual dismiss on click
        popup.addEventListener('click', () => {
            clearTimeout(autoDismiss);
            this.dismissAchievement(popup);
        });

        // Close button
        popup.querySelector('.achievement-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            clearTimeout(autoDismiss);
            this.dismissAchievement(popup);
        });
    }

    dismissAchievement(popup) {
        popup.classList.add('hide');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 400);
    }

    completeTask(taskName) {
        if (this.completedTasks.has(taskName)) return; // Already completed

        this.completedTasks.add(taskName);
        console.log(`✅ Task completed: ${taskName}`);

        // Update UI
        const taskItem = document.querySelector(`[data-task="${taskName}"]`);
        if (taskItem) {
            taskItem.classList.add('completed');
        }

        // Show achievement based on task
        switch (taskName) {
            case 'mp3-player':
                this.showAchievement('WERE YOU RUSHING OR DRAGGING?', 'At least you found the MP3 player, the most important app.', '🎵');
                break;
            case 'notes':
                this.showAchievement('Haiku-kinda', 'You opened the notes app!', '📝');
                break;
            case 'typing-radiohead':
                this.showAchievement('#Vibes', 'Click clack + weird fishes = Music to my ears.', '🎸');
                break;
        }

        this.sounds.play('achievement');
    }

    checkRadioheadPlaying() {
        // Check if MP3 player is playing the Radiohead track
        if (window.mp3Player && window.mp3Player.player) {
            try {
                const videoData = window.mp3Player.player.getVideoData();
                const currentVideoId = videoData ? videoData.video_id : null;
                const playerState = window.mp3Player.player.getPlayerState();
                
                // YouTube player state: 1 = playing
                return currentVideoId === this.radioheadVideoId && playerState === 1;
            } catch (error) {
                return false;
            }
        }
        return false;
    }

    trackTypingInNotes(editor) {
        this.notesTextarea = editor;
        let lastLength = 0;

        const trackTyping = () => {
            if (!this.notesTextarea) return;
            
            // Get text content length (not innerHTML length)
            const currentLength = this.notesTextarea.textContent.length;
            
            if (currentLength > lastLength && this.checkRadioheadPlaying()) {
                this.typingCharCount += (currentLength - lastLength);
                console.log(`🎸 Typing while Radiohead: ${this.typingCharCount}/100 characters`);
                
                if (this.typingCharCount >= 100) {
                    this.completeTask('typing-radiohead');
                }
            }
            
            lastLength = currentLength;
        };

        // Track typing
        editor.addEventListener('input', trackTyping);
        
        // Check Radiohead status periodically
        setInterval(() => {
            if (this.notesTextarea && this.checkRadioheadPlaying()) {
                this.isTypingWhileRadiohead = true;
            } else {
                this.isTypingWhileRadiohead = false;
            }
        }, 1000);
    }
    
    applyAudioEffect(effectType, value) {
        // In a real implementation, this would connect to the Web Audio API
        // and apply the effects to the MP3 player's audio context
        console.log(`Applied ${effectType}: ${value}`);
        
        // TODO: Integrate with MP3Player's Web Audio API context
        // This would require modifying the MP3Player class to use Web Audio API
        // instead of just the YouTube player for audio processing
    }
    
    handleWindowControl(window, action) {
        const windowId = window.id;
        
        switch (action) {
            case 'close':
                this.closeWindow(windowId);
                break;
            case 'minimize':
                this.minimizeWindow(window);
                break;
            case 'maximize':
                this.maximizeWindow(window);
                break;
        }
    }
    
    closeWindow(windowId) {
        console.log(`🚪 Closing window: ${windowId}`);
        console.trace('Window close call stack');
        
        this.sounds.play('windowClose');
        
        const window = this.windows.get(windowId);
        if (window) {
            window.style.animation = 'windowDisappear 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            setTimeout(() => {
                window.remove();
                this.windows.delete(windowId);
            }, 300);
        }
    }
    
    minimizeWindow(window) {
        window.style.animation = 'windowMinimize 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        setTimeout(() => {
            window.style.display = 'none';
        }, 400);
    }
    
    maximizeWindow(window) {
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
            window.style.width = window.dataset.originalWidth;
            window.style.height = window.dataset.originalHeight;
            window.style.left = window.dataset.originalLeft;
            window.style.top = window.dataset.originalTop;
            window.style.transform = 'none';
        } else {
            window.dataset.originalWidth = window.style.width;
            window.dataset.originalHeight = window.style.height;
            window.dataset.originalLeft = window.style.left;
            window.dataset.originalTop = window.style.top;
            
            window.classList.add('maximized');
            window.style.width = 'calc(100% - 2rem)';
            window.style.height = 'calc(100% - 4rem)';
            window.style.left = '1rem';
            window.style.top = '2rem';
        }
    }
    
    bringToFront(window) {
        window.style.zIndex = ++this.windowZIndex;
        this.activeWindow = window;
    }
    
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
        
        // Update existing time element (if any)
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
        
        // Update desktop time display
        const desktopTimeElement = document.getElementById('desktop-time');
        const desktopDateElement = document.getElementById('desktop-date');
        
        if (desktopTimeElement) {
            desktopTimeElement.textContent = timeString;
        }
        
        if (desktopDateElement) {
            desktopDateElement.textContent = dateString;
        }
    }
    
    addRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            left: ${x - 2}px;
            top: ${y - 2}px;
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    handleDropdownAction(action) {
        switch(action) {
            case 'open-finder':
                this.launchApp('finder');
                break;
            case 'recent-files':
                // Could show recent files in finder
                this.launchApp('finder');
                break;
            case 'new-folder':
                // Could create new folder dialog
                this.sounds.play('windowOpen');
                break;
            case 'open-settings':
                this.launchApp('settings');
                break;
            case 'about':
                this.showAboutDialog();
                break;
            case 'restart':
                this.showRestartDialog();
                break;
            case 'shutdown':
                this.showShutdownDialog();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    showAboutDialog() {
        const aboutConfig = {
            title: 'About kevOS',
            content: `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 48px; margin-bottom: 1rem;">🖥️</div>
                    <h2 style="margin: 0 0 1rem 0; font-weight: 300;">kevOS</h2>
                    <p style="color: var(--warm-gray); margin-bottom: 1rem;">Version 1.0</p>
                    <p style="font-size: 14px; line-height: 1.6;">A warm, tactile computing experience inspired by retro interfaces with modern web technologies.</p>
                </div>
            `,
            width: '320px',
            height: '280px'
        };
        this.createWindow(aboutConfig);
    }
    
    showRestartDialog() {
        const restartConfig = {
            title: 'Restart kevOS',
            content: `
                <div style="padding: 2rem; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 1rem;">🔄</div>
                    <p style="margin-bottom: 2rem;">Are you sure you want to restart kevOS?</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="soft-button" onclick="window.location.reload()">Restart</button>
                        <button class="soft-button" onclick="window.softOS.closeWindow(this.closest('.window').id)">Cancel</button>
                    </div>
                </div>
            `,
            width: '300px',
            height: '220px'
        };
        this.createWindow(restartConfig);
    }
    
    showShutdownDialog() {
        const shutdownConfig = {
            title: 'Shut Down',
            content: `
                <div style="padding: 2rem; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 1rem;">⏻</div>
                    <p style="margin-bottom: 2rem;">Are you sure you want to shut down kevOS?</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="soft-button" onclick="window.close()">Shut Down</button>
                        <button class="soft-button" onclick="window.softOS.closeWindow(this.closest('.window').id)">Cancel</button>
                    </div>
                </div>
            `,
            width: '300px',
            height: '220px'
        };
        this.createWindow(shutdownConfig);
    }
    
    getStarted() {
        this.sounds.play('click');
        
        // Close the welcome window
        const welcomeWindow = document.getElementById('welcome-window');
        if (welcomeWindow) {
            this.closeWindow('welcome-window');
        }
        
        // Show a quick tour of the OS
        setTimeout(() => {
            this.sounds.play('windowOpen');
            this.showTourWindow();
        }, 500);
    }
    
    showTourWindow() {
        const tourConfig = {
            title: 'Welcome Tour',
            content: this.createTourContent(),
            width: '520px',
            height: '400px'
        };
        
        this.createWindow(tourConfig);
    }
    
    createTourContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column; gap: 1rem;">
                <h2 style="font-weight: 300; color: var(--primary-orange); margin-bottom: 0.5rem;">🎉 Welcome to KevOS!</h2>
                
                <div style="flex: 1; overflow-y: auto; padding-right: 0.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="font-size: 16px; font-weight: 500; margin-bottom: 0.5rem; color: var(--charcoal);">🏠 Desktop Features</h3>
                        <p style="font-size: 14px; line-height: 1.6; color: var(--warm-gray); margin-bottom: 1rem;">Your warm, tactile computing environment with:</p>
                        <ul style="font-size: 13px; line-height: 1.6; color: var(--warm-gray); margin-left: 1rem;">
                            <li>✨ Retro-modern design with "Her" movie aesthetics</li>
                            <li>🎵 Authentic system sounds for every interaction</li>
                            <li>🪟 Draggable, resizable windows with smooth animations</li>
                            <li>🎯 Magnetic dock with app shortcuts</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="font-size: 16px; font-weight: 500; margin-bottom: 0.5rem; color: var(--charcoal);">📱 Built-in Apps</h3>
                        <ul style="font-size: 13px; line-height: 1.6; color: var(--warm-gray); margin-left: 1rem;">
                            <li>📁 <strong>Finder</strong> - Browse files and folders (click dock)</li>
                            <li>📝 <strong>Notes</strong> - Write and organize your thoughts</li>
                            <li>🧮 <strong>Calculator</strong> - Full-featured calculator</li>
                            <li>⚙️ <strong>Settings</strong> - Customize your experience</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <h3 style="font-size: 16px; font-weight: 500; margin-bottom: 0.5rem; color: var(--charcoal);">🎮 Try These Actions</h3>
                        <ul style="font-size: 13px; line-height: 1.6; color: var(--warm-gray); margin-left: 1rem;">
                            <li>🖱️ Click menu items in the top bar</li>
                            <li>🎯 Hover over the dock for magnetic effects</li>
                            <li>📄 Double-click files in Finder to open them</li>
                            <li>🪟 Drag windows by their title bars</li>
                            <li>🎨 Change theme colors in Settings</li>
                        </ul>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="soft-button" onclick="window.softOS.launchApp('finder')">Open Finder</button>
                    <button class="soft-button primary" onclick="window.softOS.closeWindow(this.closest('.window').id)">Let's Go!</button>
                </div>
            </div>
        `;
    }
    
    showMenuDropdown(menuItem) {
        const menuText = menuItem.textContent;
        
        // Create simple menu functionality
        switch(menuText) {
            case 'Files':
                this.launchApp('finder');
                break;
            case 'Apps':
                this.showApplicationsMenu();
                break;
            case 'System':
                this.launchApp('settings');
                break;
        }
    }
    
    showApplicationsMenu() {
        // Launch all apps for demo
        setTimeout(() => this.launchApp('notes'), 100);
        setTimeout(() => this.launchApp('calculator'), 200);
        setTimeout(() => this.launchApp('settings'), 300);
    }
    
    setupAppFunctionality(windowElement, appTitle) {
        console.log('🍅 setupAppFunctionality called with:', { appTitle, windowElement });
        switch(appTitle) {
            case 'Calculator':
                this.setupCalculator(windowElement);
                break;
            case 'Notes':
                this.setupNotes(windowElement);
                break;
            case 'Settings':
                this.setupSettings(windowElement);
                break;
            case 'Soundboard':
                this.setupSoundboard(windowElement);
                break;
            case 'MP3 Player':
                this.setupMP3Player(windowElement);
                break;
            case 'Pomodoro Timer':
                console.log('🍅 Matched Pomodoro Timer case, calling setupPomodoroTimer...');
                this.setupPomodoroTimer(windowElement);
                console.log('🍅 setupPomodoroTimer call completed');
                break;
        }
    }
    
    setupCalculator(windowElement) {
        const display = windowElement.querySelector('#calc-display');
        const buttons = windowElement.querySelectorAll('.calc-btn');
        
        let currentValue = '0';
        let operator = null;
        let previousValue = null;
        let waitingForOperand = false;
        
        const calculate = () => {
            const prev = parseFloat(previousValue);
            const current = parseFloat(currentValue);
            
            if (isNaN(prev) || isNaN(current)) return;
            
            switch(operator) {
                case '+':
                    return prev + current;
                case '−':
                    return prev - current;
                case '×':
                    return prev * current;
                case '÷':
                    return current !== 0 ? prev / current : 0;
                default:
                    return current;
            }
        };
        
        const updateDisplay = () => {
            display.textContent = currentValue;
        };
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.sounds.play('click');
                const value = button.dataset.value;
                
                if (value >= '0' && value <= '9' || value === '.') {
                    if (waitingForOperand) {
                        currentValue = value;
                        waitingForOperand = false;
                    } else {
                        currentValue = currentValue === '0' ? value : currentValue + value;
                    }
                } else if (value === 'C') {
                    currentValue = '0';
                    operator = null;
                    previousValue = null;
                    waitingForOperand = false;
                } else if (value === '±') {
                    currentValue = (parseFloat(currentValue) * -1).toString();
                } else if (value === '%') {
                    currentValue = (parseFloat(currentValue) / 100).toString();
                } else if (value === '=') {
                    if (operator && !waitingForOperand) {
                        currentValue = calculate().toString();
                        operator = null;
                        previousValue = null;
                        waitingForOperand = true;
                    }
                } else {
                    if (operator && !waitingForOperand) {
                        const result = calculate();
                        currentValue = result.toString();
                    }
                    
                    previousValue = currentValue;
                    operator = value;
                    waitingForOperand = true;
                }
                
                updateDisplay();
            });
        });
    }
    
    setupSettings(windowElement) {
        const categories = windowElement.querySelectorAll('.settings-category');
        const colorSwatches = windowElement.querySelectorAll('.color-swatch');
        const settingsContent = windowElement.querySelector('#settings-content');
        const appearanceSettings = windowElement.querySelector('#appearance-settings');
        const soundSettings = windowElement.querySelector('#sound-settings');
        
        // Category switching
        categories.forEach(category => {
            category.addEventListener('click', () => {
                this.sounds.play('click');
                categories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');
                
                // Switch content based on category
                const categoryText = category.textContent.trim();
                if (categoryText.includes('Appearance')) {
                    if (appearanceSettings) appearanceSettings.style.display = 'block';
                    if (soundSettings) soundSettings.style.display = 'none';
                } else if (categoryText.includes('Sound')) {
                    if (appearanceSettings) appearanceSettings.style.display = 'none';
                    if (soundSettings) soundSettings.style.display = 'block';
                } else {
                    // Hide both for other categories
                    if (appearanceSettings) appearanceSettings.style.display = 'none';
                    if (soundSettings) soundSettings.style.display = 'none';
                }
            });
        });
        
        // Color swatches
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.sounds.play('click');
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            });
        });
        
        // Keyboard sound controls
        const keyboardToggle = windowElement.querySelector('#keyboard-sound-toggle');
        const keyboardVolumeSlider = windowElement.querySelector('#keyboard-volume-slider');
        const keyboardVolumeDisplay = windowElement.querySelector('#keyboard-volume-display');
        const testButton = windowElement.querySelector('#test-keyboard-sound');
        
        if (keyboardToggle) {
            keyboardToggle.addEventListener('change', (e) => {
                this.sounds.play('click');
                const isEnabled = this.keyboardSounds.toggle();
                console.log('Keyboard sounds:', isEnabled ? 'enabled' : 'disabled');
            });
        }
        
        if (keyboardVolumeSlider && keyboardVolumeDisplay) {
            keyboardVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.keyboardSounds.setVolume(volume);
                keyboardVolumeDisplay.textContent = e.target.value + '%';
            });
        }
        
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.sounds.play('click');
                this.keyboardSounds.playRandomKeySound();
            });
        }
    }
    
    setupSoundboard(windowElement) {
        this.soundboardAudio = new Map();
        this.soundboardVolume = 0.5;
        
        // Set up volume knob control using the reusable component
        const volumeKnob = windowElement.querySelector('#volume-knob');
        
        if (volumeKnob) {
            this.soundboardVolumeKnob = new VolumeKnob(volumeKnob, {
                initialValue: 50,
                minValue: 0,
                maxValue: 100,
                steps: 20,
                onValueChange: (value) => {
                    this.soundboardVolume = value / 100;
                    const volumeDisplay = windowElement.querySelector('#volume-display');
                    if (volumeDisplay) {
                        volumeDisplay.textContent = Math.round(value);
                    }
                },
                soundManager: this.sounds
            });
        }
        
        // Wire up integrated window controls with hover sounds
        const closeBtn = windowElement.querySelector('.app-control-btn.close');
        const minimizeBtn = windowElement.querySelector('.app-control-btn.minimize');
        const maximizeBtn = windowElement.querySelector('.app-control-btn.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            closeBtn.addEventListener('click', () => {
                this.sounds.play('windowClose');
                this.closeWindow(windowElement.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            minimizeBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.minimizeWindow(windowElement);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            maximizeBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.maximizeWindow(windowElement);
            });
        }
        
        // Load audio files (simulated - would normally scan sounds folder)
        this.loadSoundboardAudio(windowElement);
    }
    
    async loadSoundboardAudio(windowElement) {
        const soundGrid = windowElement.querySelector('#soundboard-grid');
        if (!soundGrid) return;
        
        soundGrid.innerHTML = '<div style="text-align: center; padding: 2rem;"><div style="font-size: 24px;">🔄 Loading sounds...</div></div>';
        
        let allSounds = [];
        
        try {
            // Try to load from manifest.json first
            const response = await fetch('sounds/manifest.json');
            if (response.ok) {
                const manifestSounds = await response.json();
                allSounds = [...manifestSounds];
                console.log(`✅ Loaded ${manifestSounds.length} sounds from manifest.json`);
            }
        } catch (error) {
            console.log('No manifest.json found, will try to detect files');
        }
        
        // Also try to detect some actual files you might have added
        const knownFiles = [
            'airhorn.mp3', 'applause.mp3', 'wow.mp3', 'clash of clans.mp3',
            'boom.mp3', 'bruh.mp3', 'oof.mp3', 'nice.mp3', 'epic.mp3'
        ];
        
        for (const filename of knownFiles) {
            // Skip if already in manifest
            if (allSounds.find(s => s.file === filename)) continue;
            
            try {
                const testResponse = await fetch(`sounds/${filename}`, { method: 'HEAD' });
                if (testResponse.ok) {
                    const name = filename.replace(/\.(mp3|wav|ogg|m4a)$/i, '')
                                        .replace(/-/g, ' ')
                                        .replace(/_/g, ' ')
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
                    
                    const emoji = this.getEmojiForFilename(filename);
                    
                    allSounds.push({
                        name: name,
                        file: filename,
                        emoji: emoji
                    });
                    
                    console.log(`🔍 Found: ${filename}`);
                }
            } catch (error) {
                // File doesn't exist, skip
            }
        }
        
        // Clear loading message
        soundGrid.innerHTML = '';
        
        if (allSounds.length === 0) {
            soundGrid.innerHTML = `
                <div style="text-align: center; color: var(--warm-gray); padding: 2rem; grid-column: 1 / -1;">
                    <div style="font-size: 48px; margin-bottom: 1rem;">🎵</div>
                    <p>No audio files found</p>
                    <p style="font-size: 12px; margin-top: 0.5rem;">Add .mp3, .wav, .ogg, or .m4a files to the sounds/ folder</p>
                    <p style="font-size: 11px; margin-top: 0.5rem;">Update manifest.json or use common filenames</p>
                </div>
            `;
            return;
        }
        
        // Display all sounds
        allSounds.forEach(sound => {
            const button = document.createElement('div');
            button.className = 'sound-button';
            button.innerHTML = `
                <div class="icon">${sound.emoji || '🔊'}</div>
                <div style="font-size: 10px; line-height: 1.1;">${sound.name}</div>
            `;
            
            button.addEventListener('click', () => {
                this.playSound(sound.file, sound.name);
            });
            
            soundGrid.appendChild(button);
            
            // Preload the audio
            if (sound.file) {
                const audio = new Audio(`sounds/${sound.file}`);
                audio.volume = this.soundboardVolume || 0.5;
                this.soundboardAudio.set(sound.file, audio);
            }
        });
        
        console.log(`✅ Loaded ${allSounds.length} total sounds`);
    }
    
    getEmojiForFilename(filename) {
        const name = filename.toLowerCase();
        
        if (name.includes('airhorn')) return '📯';
        if (name.includes('applause')) return '👏';
        if (name.includes('wow')) return '😲';
        if (name.includes('boom')) return '💥';
        if (name.includes('bruh')) return '🤦';
        if (name.includes('oof')) return '😵';
        if (name.includes('nice')) return '👌';
        if (name.includes('epic')) return '⭐';
        if (name.includes('clash')) return '⚔️';
        if (name.includes('launcher') || name.includes('kevos')) return '🚀';
        
        return '🔊';
    }
    
    playSound(audioFile, displayName) {
        // If no audioFile provided, fall back to OS click sound
        if (!audioFile) {
            this.sounds.play('click');
            return;
        }
        
        // Get the preloaded audio element
        const audio = this.soundboardAudio.get(audioFile);
        if (audio) {
            try {
                // Reset to beginning and set volume
                audio.currentTime = 0;
                audio.volume = this.soundboardVolume;
                
                // Play the audio
                audio.play().catch(error => {
                    console.error('Error playing sound:', error);
                    // Fall back to OS click sound if audio fails
                    this.sounds.play('click');
                });
                
                console.log(`Playing ${displayName || audioFile} at volume: ${Math.round(this.soundboardVolume * 100)}%`);
            } catch (error) {
                console.error('Error setting up audio:', error);
                this.sounds.play('click');
            }
        } else {
            // Audio not found, play OS click sound as fallback
            this.sounds.play('click');
            console.warn(`Audio file not found: ${audioFile}`);
        }
    }
    
    refreshSoundboard() {
        this.sounds.play('click');
        
        // Find the soundboard window
        for (let [windowId, windowElement] of this.windows) {
            if (windowElement.querySelector('.soundboard-content')) {
                this.loadSoundboardAudio(windowElement);
                break;
            }
        }
    }
    
    setupMP3Player(windowElement) {
        // Setup MP3 player controls
        console.log('Setting up MP3 player in window');
        if (window.mp3Player) {
            window.mp3Player.setupControls();
            // If YouTube API is already loaded, initialize the player
            if (window.YT && window.YT.Player) {
                window.mp3Player.init();
            }
        } else if (window.MP3Player) {
            console.log('MP3 player not found, creating new instance');
            window.mp3Player = new window.MP3Player();
            window.mp3Player.setupControls();
            if (window.YT && window.YT.Player) {
                window.mp3Player.init();
            }
        } else {
            console.error('MP3Player class not loaded');
        }
        
        // Add hover sound effects to playback buttons
        const playbackButtons = windowElement.querySelectorAll('.mp3-btn');
        playbackButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            btn.addEventListener('click', () => {
                this.sounds.play('click');
            });
        });
        
        // Wire up integrated window controls
        const closeBtn = windowElement.querySelector('.app-control-btn.close');
        const minimizeBtn = windowElement.querySelector('.app-control-btn.minimize');
        const maximizeBtn = windowElement.querySelector('.app-control-btn.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            closeBtn.addEventListener('click', () => {
                this.sounds.play('windowClose');
                this.closeWindow(windowElement.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            minimizeBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.minimizeWindow(windowElement);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            maximizeBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.maximizeWindow(windowElement);
            });
        }
    }

    setupPomodoroTimer(windowElement) {
        console.log('🍅 Setting up Pomodoro Timer...');
        console.log('🍅 Window element:', windowElement);
        console.log('🍅 Window innerHTML preview:', windowElement.innerHTML.substring(0, 500));
        
        // Check if this is a custom window (should be for Pomodoro)
        console.log('🍅 Window classes:', windowElement.className);
        console.log('🍅 Is custom window?', windowElement.classList.contains('custom-window'));
        
        // Pomodoro Timer State
        let isRunning = false;
        let timeRemaining = 25 * 60; // 25 minutes in seconds
        let currentSession = 1;
        let sessionType = 'work'; // 'work', 'shortBreak', 'longBreak'
        let timerInterval = null;
        let totalTime = 25 * 60;
        
        // Settings
        const settings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15
        };
        
        // Always start with fresh default settings
        console.log('🍅 Clearing any existing pomodoro settings from localStorage');
        localStorage.removeItem('pomodoro-settings');
        console.log('🍅 Using default settings:', settings);
        
        // DOM Elements
        console.log('🍅 Finding DOM elements...');
        const timerTime = windowElement.querySelector('#timer-time');
        const startPauseBtn = windowElement.querySelector('#start-pause-btn');
        const resetBtn = windowElement.querySelector('#reset-btn');
        const skipBtn = windowElement.querySelector('#skip-btn');
        const sessionCount = windowElement.querySelector('#session-count');
        const sessionTypeEl = windowElement.querySelector('#session-type');
        const goalInput = windowElement.querySelector('#goal-input');
        // Note: Motivational messages now show as notifications above the window
        const progressBar = windowElement.querySelector('#progress-bar');
        
        console.log('🍅 Button elements found:');
        console.log('  startPauseBtn:', startPauseBtn);
        console.log('  resetBtn:', resetBtn);
        console.log('  skipBtn:', skipBtn);
        console.log('  timerTime:', timerTime);
        console.log('  goalInput:', goalInput);
        // Note: Duration inputs are now in the separate settings window, not in main timer
        console.log('🍅 Skipping duration input initialization - inputs are in settings window');
        
        // These inputs don't exist in main window anymore since settings moved to separate window
        // const workDurationInput = windowElement.querySelector('#work-duration');
        // const shortBreakInput = windowElement.querySelector('#short-break');
        // const longBreakInput = windowElement.querySelector('#long-break');
        
        // Load saved goal
        const savedGoal = localStorage.getItem('pomodoro-goal');
        if (savedGoal) {
            goalInput.value = savedGoal;
        }
        
        // Motivational messages
        const motivationalMessages = {
            work: [
                "Ready to focus? Let's make these minutes count! 🍅",
                "Deep work mode activated. You've got this! 💪",
                "Time to tackle that important task! 🎯",
                "Your future self will thank you for this focus! ⭐"
            ],
            shortBreak: [
                "Great work! Take a breather and recharge. 🌸",
                "Stretch those muscles and rest your mind! 🧘",
                "A short break well earned. Hydrate and relax! 💧",
                "Step away from the screen for a moment! 🌿"
            ],
            longBreak: [
                "Excellent progress! Take a longer break and celebrate! 🎉",
                "Time for a proper rest. You've earned it! 🏆",
                "Great session! Go for a walk or grab a snack! 🚶",
                "Fantastic focus! Enjoy your well-deserved break! ✨"
            ]
        };
        
        // Initialize timer display
        console.log('🍅 Initial timer state - sessionType:', sessionType, 'currentSession:', currentSession);
        console.log('🍅 About to call setTimerForCurrentSession...');
        setTimerForCurrentSession();
        console.log('🍅 After setTimerForCurrentSession - timeRemaining:', timeRemaining);
        updateTimerDisplay();
        updateSessionInfo();
        updateMotivationalMessage();
        
        // Event Listeners
        console.log('🍅 Adding event listeners to buttons...');
        
        if (startPauseBtn) {
            console.log('🍅 Adding click listener to startPauseBtn');
            startPauseBtn.addEventListener('click', (e) => {
                console.log('🍅 START/PAUSE button clicked!');
                e.preventDefault();
                e.stopPropagation();
                if (isRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            });
        } else {
            console.error('🍅 ERROR: startPauseBtn not found!');
        }
        
        if (resetBtn) {
            console.log('🍅 Adding click listener to resetBtn');
            resetBtn.addEventListener('click', (e) => {
                console.log('🍅 RESET button clicked!');
                e.preventDefault();
                e.stopPropagation();
                resetTimer();
            });
        } else {
            console.error('🍅 ERROR: resetBtn not found!');
        }
        
        if (skipBtn) {
            console.log('🍅 Adding click listener to skipBtn');
            skipBtn.addEventListener('click', (e) => {
                console.log('🍅 SKIP button clicked!');
                e.preventDefault();
                e.stopPropagation();
                skipSession();
            });
        } else {
            console.error('🍅 ERROR: skipBtn not found!');
        }
        
        goalInput.addEventListener('input', () => {
            localStorage.setItem('pomodoro-goal', goalInput.value);
        });
        
        // Settings button click handler
        console.log('🍅 Looking for settings button...');
        const settingsBtn = windowElement.querySelector('#settings-open-btn');
        console.log('🍅 Settings button found:', settingsBtn);
        
        if (settingsBtn) {
            console.log('🍅 Adding click listener to settings button');
            settingsBtn.addEventListener('click', (e) => {
                console.log('🍅 SETTINGS button clicked!');
                e.preventDefault();
                e.stopPropagation();
                try {
                    this.sounds.play('click');
                    console.log('🍅 Calling openPomodoroSettingsWindow...');
                    this.openPomodoroSettingsWindow();
                } catch (error) {
                    console.error('🍅 ERROR in settings button click:', error);
                }
            });
            
            settingsBtn.addEventListener('mouseenter', () => {
                console.log('🍅 Settings button hovered');
                this.sounds.play('hover');
            });
        } else {
            console.error('🍅 ERROR: Settings button not found!');
        }
        
        // Listen for settings updates from the separate settings window
        const handleSettingsUpdate = (event) => {
            console.log('🍅 Settings updated:', event.detail);
            const { settings: newSettings } = event.detail;
            
            // Update local settings object
            settings.workDuration = newSettings.workDuration || settings.workDuration;
            settings.shortBreakDuration = newSettings.shortBreakDuration || settings.shortBreakDuration;
            settings.longBreakDuration = newSettings.longBreakDuration || settings.longBreakDuration;
            
            console.log('🍅 Updated timer settings:', settings);
            
            // If timer is not running, update the current session duration
            if (!isRunning && sessionType) {
                console.log('🍅 Timer not running, updating session duration for:', sessionType);
                setTimerForCurrentSession();
                updateTimerDisplay();
                updateProgressBar();
            }
        };
        
        document.addEventListener('pomodoroSettingsUpdated', handleSettingsUpdate);
        console.log('🍅 Added settings update listener');
        
        // Debug function - you can call this in browser console if needed
        window.clearPomodoroSettings = function() {
            localStorage.removeItem('pomodoro-settings');
            console.log('🍅 Cleared pomodoro settings from localStorage');
            console.log('🍅 Refresh the page to use defaults');
        };
        
        // Timer Functions
        function startTimer() {
            console.log('🍅 startTimer() called');
            isRunning = true;
            if (startPauseBtn) {
                startPauseBtn.textContent = 'PAUSE';
                console.log('🍅 Button text updated to PAUSE');
            }
            
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                updateProgressBar();
                
                if (timeRemaining <= 0) {
                    completeSession();
                }
            }, 1000);
            
            // Play start sound
            if (window.softOS && window.softOS.sounds) {
                window.softOS.sounds.play('click');
            }
        }
        
        function pauseTimer() {
            console.log('🍅 pauseTimer() called');
            isRunning = false;
            if (startPauseBtn) {
                startPauseBtn.textContent = 'RESUME';
                console.log('🍅 Button text updated to RESUME');
            }
            clearInterval(timerInterval);
            
            // Play pause sound
            if (window.softOS && window.softOS.sounds) {
                window.softOS.sounds.play('click');
            }
        }
        
        function resetTimer() {
            console.log('🍅 resetTimer() called');
            isRunning = false;
            clearInterval(timerInterval);
            if (startPauseBtn) {
                startPauseBtn.textContent = 'START';
                console.log('🍅 Button text updated to START');
            }
            
            // Reset to first work session
            currentSession = 1;
            sessionType = 'work';
            console.log('🍅 Reset to first work session');
            
            setTimerForCurrentSession();
            updateTimerDisplay();
            updateSessionInfo();
            updateProgressBar();
            updateMotivationalMessage();
            
            // Play reset sound
            if (window.softOS && window.softOS.sounds) {
                window.softOS.sounds.play('click');
            }
        }
        
        function skipSession() {
            completeSession();
            
            // Play skip sound
            if (window.softOS && window.softOS.sounds) {
                window.softOS.sounds.play('click');
            }
        }
        
        function completeSession() {
            isRunning = false;
            clearInterval(timerInterval);
            startPauseBtn.textContent = 'START';
            
            // Play completion sound
            if (window.softOS && window.softOS.sounds) {
                window.softOS.sounds.play('windowOpen');
            }
            
            // Advance to next session
            if (sessionType === 'work') {
                if (currentSession % 4 === 0) {
                    sessionType = 'longBreak';
                } else {
                    sessionType = 'shortBreak';
                }
            } else {
                sessionType = 'work';
                if (sessionType === 'work') {
                    currentSession++;
                }
            }
            
            // Reset for next session
            setTimerForCurrentSession();
            updateTimerDisplay();
            updateSessionInfo();
            updateMotivationalMessage();
            updateProgressBar();
        }
        
        function setTimerForCurrentSession() {
            console.log('🍅 setTimerForCurrentSession called for sessionType:', sessionType);
            console.log('🍅 Current settings values:', settings);
            
            switch (sessionType) {
                case 'work':
                    timeRemaining = settings.workDuration * 60;
                    totalTime = settings.workDuration * 60;
                    console.log('🍅 Set work timer to', settings.workDuration, 'minutes =', timeRemaining, 'seconds');
                    break;
                case 'shortBreak':
                    timeRemaining = settings.shortBreakDuration * 60;
                    totalTime = settings.shortBreakDuration * 60;
                    console.log('🍅 Set short break timer to', settings.shortBreakDuration, 'minutes =', timeRemaining, 'seconds');
                    break;
                case 'longBreak':
                    timeRemaining = settings.longBreakDuration * 60;
                    totalTime = settings.longBreakDuration * 60;
                    console.log('🍅 Set long break timer to', settings.longBreakDuration, 'minutes =', timeRemaining, 'seconds');
                    break;
                default:
                    console.log('🍅 Unknown sessionType:', sessionType);
            }
        }
        
        function updateTimerDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        function updateSessionInfo() {
            sessionCount.textContent = `${currentSession}/4`;
            
            switch (sessionType) {
                case 'work':
                    sessionTypeEl.textContent = 'WORK SESSION';
                    break;
                case 'shortBreak':
                    sessionTypeEl.textContent = 'SHORT BREAK';
                    break;
                case 'longBreak':
                    sessionTypeEl.textContent = 'LONG BREAK';
                    break;
            }
        }
        
        function updateMotivationalMessage() {
            const messages = motivationalMessages[sessionType];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            // Show as notification above the window instead of inline
            if (window.softOS) {
                window.softOS.showPomodoroNotification(randomMessage);
            }
        }
        
        function updateProgressBar() {
            const progress = (totalTime - timeRemaining) / totalTime;
            const progressPercent = (progress * 100).toFixed(1);
            progressBar.style.width = `${progressPercent}%`;
        }
        
        // Initialize progress bar
        progressBar.style.width = '0%';
        
        // Set up window control buttons
        const closeBtn = windowElement.querySelector('.app-control-btn.close');
        const minimizeBtn = windowElement.querySelector('.app-control-btn.minimize');
        const maximizeBtn = windowElement.querySelector('.app-control-btn.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('hover');
                }
            });
            closeBtn.addEventListener('click', () => {
                // Clean up timer before closing
                if (timerInterval) {
                    clearInterval(timerInterval);
                }
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('windowClose');
                }
                if (window.softOS) {
                    window.softOS.closeWindow(windowElement.id);
                }
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('mouseenter', () => {
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('hover');
                }
            });
            minimizeBtn.addEventListener('click', () => {
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('click');
                }
                windowElement.style.animation = 'windowMinimize 0.3s ease-in-out forwards';
                setTimeout(() => {
                    windowElement.style.display = 'none';
                }, 300);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('mouseenter', () => {
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('hover');
                }
            });
            maximizeBtn.addEventListener('click', () => {
                if (window.softOS && window.softOS.sounds) {
                    window.softOS.sounds.play('click');
                }
                windowElement.classList.toggle('maximized');
            });
        }
    }
}

// Add additional CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes windowDisappear {
        to {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
        }
    }
    
    @keyframes windowMinimize {
        to {
            opacity: 0;
            transform: scale(0.1) translateY(100px);
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(20);
            opacity: 0;
        }
    }
    
    .maximized {
        transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
    }
`;
document.head.appendChild(style);

// Initialize the OS when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.softOS = new SoftOS();
    
    // Debug function to clear notes content (can be run in browser console)
    window.clearNotesContent = function() {
        localStorage.removeItem('kevOS-notes-content');
        console.log('🗑️ Notes content cleared from localStorage');
    };
    
    // Add global refresh function for soundboard
    window.softOS.refreshSoundboard = function() {
        this.sounds.play('click');
        
        // Find the soundboard window
        for (let [windowId, windowElement] of this.windows) {
            if (windowElement.querySelector('.soundboard-content')) {
                this.loadSoundboardAudio(windowElement);
                break;
            }
        }
    };
});

// Add missing setupFinder method
SoftOS.prototype.setupFinder = function(windowElement) {
    const finderItems = windowElement.querySelectorAll(".finder-item");
    const fileIcons = windowElement.querySelectorAll(".file-icon");
    
    finderItems.forEach(item => {
        item.addEventListener("click", () => {
            this.sounds.play("click");
            finderItems.forEach(i => i.style.background = "");
            item.style.background = "rgba(255, 107, 53, 0.2)";
        });
    });
    
    fileIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            this.sounds.play("click");
            fileIcons.forEach(i => i.style.background = "");
            icon.style.background = "rgba(255, 107, 53, 0.2)";
        });
        
        icon.addEventListener("dblclick", () => {
            this.sounds.play("windowOpen");
            const fileName = icon.textContent;
            if (fileName.includes("README")) {
                this.launchApp("notes");
            } else if (fileName.includes("music")) {
                alert("🎵 Playing music file...");
            } else if (fileName.includes("photo")) {
                alert("🖼️ Opening image viewer...");
            }
        });
    });
};

// Update setupAppFunctionality to include Finder
const originalSetupApp = SoftOS.prototype.setupAppFunctionality;
SoftOS.prototype.setupAppFunctionality = function(windowElement, appTitle) {
    if (appTitle === "Finder") {
        this.setupFinder(windowElement);
    } else {
        originalSetupApp.call(this, windowElement, appTitle);
    }
};
