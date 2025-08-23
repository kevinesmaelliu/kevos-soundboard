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
        
        // Set up the start button
        this.setupStartButton();
    }
    
    setupStartButton() {
        const startScreen = document.getElementById('kevos-start');
        const startButton = document.getElementById('start-kevos');
        
        if (startButton) {
            startButton.addEventListener('click', async () => {
                console.log('🚀 Start button clicked - beginning kevOS launch');
                
                // Hide start screen
                if (startScreen) {
                    startScreen.style.animation = 'launchScreenFadeOut 0.5s ease-in-out forwards';
                    setTimeout(() => {
                        startScreen.style.display = 'none';
                    }, 500);
                }
                
                // Show and start the launch sequence
                const launchScreen = document.getElementById('kevos-launch');
                if (launchScreen) {
                    launchScreen.style.display = 'flex';
                    setTimeout(() => {
                        this.startKevOSLaunch();
                    }, 100);
                }
            });
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
            
            // Play the classic startup chime
            setTimeout(() => {
                if (this.sounds) {
                    this.sounds.playStartup();
                    console.log('✅ Startup chime played');
                } else {
                    console.error('❌ Sounds system not available');
                }
            }, 300);
            
            // Register the welcome window that's created in HTML
            try {
                this.registerWelcomeWindow();
                console.log('✅ Welcome window registered');
            } catch (error) {
                console.error('❌ Error registering welcome window:', error);
            }
            
            // Soundboard can be launched from desktop icon
            
        }, 1000);
    }
    
    registerWelcomeWindow() {
        const welcomeWindow = document.getElementById('welcome-window');
        if (welcomeWindow) {
            this.windows.set('welcome-window', welcomeWindow);
            welcomeWindow.style.zIndex = ++this.windowZIndex;
            
            // Position the welcome window properly (it was created in HTML)
            const centerX = (window.innerWidth - 480) / 2; // 480px is welcome window width
            const centerY = (window.innerHeight - 320) / 2; // 320px is welcome window height
            welcomeWindow.style.left = `${centerX}px`;
            welcomeWindow.style.top = `${centerY}px`;
            welcomeWindow.style.transform = 'none';
        }
    }
    
    setupEventListeners() {
        // Dock app launching
        document.querySelectorAll('.dock-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.sounds.play('dockBounce');
                this.launchApp(item.dataset.app);
                this.addRippleEffect(item, e);
            });
        });
        
        // Desktop icon launching
        document.querySelectorAll('.desktop-icon').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.sounds.play('hover');
            });
            
            item.addEventListener('click', (e) => {
                this.sounds.play('click');
                this.launchApp(item.dataset.app);
                this.addRippleEffect(item, e);
            });
            
            // Double-click for faster launch
            item.addEventListener('dblclick', (e) => {
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
            if (e.target.classList.contains('control-btn')) {
                const window = e.target.closest('.window');
                const action = e.target.classList.contains('close') ? 'close' :
                             e.target.classList.contains('minimize') ? 'minimize' : 'maximize';
                
                this.handleWindowControl(window, action);
            }
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
            }
        };
        
        const config = appConfigs[appName];
        if (config) {
            this.createWindow(config);
        }
    }
    
    createWindow(config) {
        this.sounds.play('windowOpen');
        
        const windowId = `window-${Date.now()}`;
        const window = document.createElement('div');
        window.className = 'window';
        window.id = windowId;
        window.style.width = config.width;
        window.style.height = config.height;
        window.style.zIndex = ++this.windowZIndex;
        
        // Calculate position BEFORE adding to DOM to prevent visual jump
        let posX, posY;
        
        if (config.position === 'top-right') {
            // Position in top right corner with some padding
            posX = window.innerWidth - parseInt(config.width) - 40;
            posY = 80; // Below taskbar
        } else {
            // Default cascading behavior for other windows
            const windowCount = this.windows.size;
            const offsetX = (windowCount * 30) % 200; // Reset after 6 windows
            const offsetY = (windowCount * 20) % 120; // Reset after 6 windows
            
            // Keep windows centered but with slight cascading offset
            const centerX = (window.innerWidth - parseInt(config.width)) / 2;
            const centerY = (window.innerHeight - parseInt(config.height)) / 2;
            
            posX = centerX + offsetX;
            posY = centerY + offsetY;
        }
        
        // Set position immediately, before adding to DOM
        window.style.left = `${posX}px`;
        window.style.top = `${posY}px`;
        window.style.transform = 'none';
        
        if (config.customWindow) {
            // Custom window without standard chrome
            window.innerHTML = config.content;
            window.classList.add('custom-window');
        } else {
            // Standard window with chrome
            window.innerHTML = `
                <div class="window-header">
                    <div class="window-controls">
                        <button class="control-btn close"></button>
                        <button class="control-btn minimize"></button>
                        <button class="control-btn maximize"></button>
                    </div>
                    <div class="window-title">${config.title}</div>
                </div>
                <div class="window-content">
                    ${config.content}
                </div>
            `;
        }
        
        document.querySelector('.windows-container').appendChild(window);
        this.windows.set(windowId, window);
        this.bringToFront(window);
        
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
                    <h3 style="font-weight: 300; margin-bottom: 0.5rem;">Quick Note</h3>
                </div>
                <textarea placeholder="Write your thoughts here..." style="
                    flex: 1;
                    border: none;
                    background: rgba(255, 107, 53, 0.05);
                    border-radius: 12px;
                    padding: 1rem;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.6;
                    color: var(--charcoal);
                    resize: none;
                    outline: none;
                "></textarea>
            </div>
        `;
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
            <div class="soundboard-device-standalone">
                <!-- Integrated window controls with drag handle -->
                <div class="soundboard-window-controls drag-handle">
                    <button class="soundboard-control-btn soundboard-close" title="Close"></button>
                    <button class="soundboard-control-btn soundboard-minimize" title="Minimize"></button>
                    <button class="soundboard-control-btn soundboard-maximize" title="Maximize"></button>
                    <div class="soundboard-brand">kevSOUND</div>
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
                <div class="mp3-window-controls drag-handle">
                    <button class="mp3-control-btn mp3-close" title="Close"></button>
                    <button class="mp3-control-btn mp3-minimize" title="Minimize"></button>
                    <button class="mp3-control-btn mp3-maximize" title="Maximize"></button>
                    <div class="mp3-brand">kevMP3</div>
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
                            <div class="btn-icon">⏮</div>
                        </button>
                        <button class="mp3-btn large" id="mp3-play" title="Play/Pause">
                            <div class="btn-icon" id="mp3-play-icon">▶</div>
                        </button>
                        <button class="mp3-btn" id="mp3-next" title="Next">
                            <div class="btn-icon">⏭</div>
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
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }
                
                .mp3-close {
                    background: linear-gradient(145deg, #ff6b6b, #ff5252);
                }
                
                .mp3-minimize {
                    background: linear-gradient(145deg, #ffd93d, #ffca28);
                }
                
                .mp3-maximize {
                    background: linear-gradient(145deg, #6bcf7f, #4caf50);
                }
                
                .mp3-control-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
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
                        var(--light-cream) 50%,
                        rgba(184, 179, 173, 0.3) 100%);
                    box-shadow: 
                        4px 4px 10px rgba(184, 179, 173, 0.5),
                        -2px -2px 8px rgba(255, 255, 255, 0.7),
                        inset 0 1px 3px rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                    color: var(--charcoal);
                }
                
                .mp3-btn.large {
                    width: 64px;
                    height: 64px;
                }
                
                .mp3-btn:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.98) 0%,
                        var(--cream) 50%,
                        rgba(184, 179, 173, 0.35) 100%);
                    transform: translateY(-1px);
                }
                
                .mp3-btn:active {
                    box-shadow: 
                        inset 3px 3px 6px rgba(184, 179, 173, 0.5),
                        inset -2px -2px 4px rgba(255, 255, 255, 0.4);
                    transform: translateY(1px);
                }
                
                .btn-icon {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .mp3-btn.large .btn-icon {
                    font-size: 24px;
                }
                
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
                
            </style>
        `;
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
        
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
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
                <h2 style="font-weight: 300; color: var(--primary-orange); margin-bottom: 0.5rem;">🎉 Welcome to Soft OS!</h2>
                
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
        switch(appTitle) {
            case 'Calculator':
                this.setupCalculator(windowElement);
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
        
        // Wire up integrated window controls
        const closeBtn = windowElement.querySelector('.soundboard-close');
        const minimizeBtn = windowElement.querySelector('.soundboard-minimize');
        const maximizeBtn = windowElement.querySelector('.soundboard-maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWindow(windowElement.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeWindow(windowElement);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
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
        
        // Wire up integrated window controls
        const closeBtn = windowElement.querySelector('.mp3-close');
        const minimizeBtn = windowElement.querySelector('.mp3-minimize');
        const maximizeBtn = windowElement.querySelector('.mp3-maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWindow(windowElement.id);
            });
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeWindow(windowElement);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                this.maximizeWindow(windowElement);
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
