// Soft OS - Interactive Window Management & UI

class SoftOS {
    constructor() {
        this.windows = new Map();
        this.windowZIndex = 1000;
        this.activeWindow = null;
        this.sounds = new RetroSounds();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTime();
        this.setupDockInteractions();
        this.setupWindowControls();
        
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
            
            // Auto-launch soundboard in top-right corner
            setTimeout(() => {
                try {
                    this.launchApp('soundboard');
                    console.log('✅ Soundboard launched');
                } catch (error) {
                    console.error('❌ Error launching soundboard:', error);
                }
            }, 1500);
            
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
        
        // Menu interactions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                this.sounds.play('menuSelect');
                this.showMenuDropdown(item);
            });
            item.addEventListener('mouseenter', () => {
                this.sounds.play('menuSelect');
            });
        });
    }
    
    setupDockInteractions() {
        const dock = document.querySelector('.dock');
        const dockItems = document.querySelectorAll('.dock-item');
        
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
        let dragOffset = { x: 0, y: 0 };
        let draggedWindow = null;
        
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-header') && !e.target.classList.contains('control-btn')) {
                isDragging = true;
                draggedWindow = e.target.closest('.window');
                this.bringToFront(draggedWindow);
                
                const rect = draggedWindow.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                
                draggedWindow.style.cursor = 'grabbing';
                document.body.style.userSelect = 'none';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging && draggedWindow) {
                const x = e.clientX - dragOffset.x;
                const y = e.clientY - dragOffset.y;
                
                draggedWindow.style.left = `${x}px`;
                draggedWindow.style.top = `${y}px`;
                draggedWindow.style.transform = 'none';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (draggedWindow) {
                    draggedWindow.style.cursor = 'default';
                    draggedWindow = null;
                }
                document.body.style.userSelect = '';
            }
        });
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
                width: '400px',
                height: '500px',
                position: 'top-right'
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
                <div style="flex: 1; padding: 1rem;">
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
            </style>
        `;
    }
    
    createSoundboardContent() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="padding: 1rem; border-bottom: 1px solid rgba(184, 179, 173, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin: 0; font-weight: 300; color: var(--charcoal);">Sound Effects</h3>
                        <button class="soft-button" onclick="window.softOS.refreshSoundboard()" style="font-size: 12px; padding: 0.5rem 1rem;">🔄 Refresh</button>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <label style="font-size: 13px; color: var(--warm-gray);">Volume:</label>
                        <input type="range" min="0" max="100" value="50" id="soundboard-volume" 
                               style="flex: 1; accent-color: var(--primary-orange);">
                        <span id="volume-display" style="font-size: 12px; color: var(--warm-gray); min-width: 30px;">50%</span>
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 1rem;">
                    <div class="soundboard-grid" id="soundboard-grid">
                        <div style="text-align: center; color: var(--warm-gray); padding: 2rem;">
                            <div style="font-size: 48px; margin-bottom: 1rem;">🎵</div>
                            <p>Add audio files to the <strong>sounds/</strong> folder</p>
                            <p style="font-size: 12px; margin-top: 0.5rem;">Supported: .mp3, .wav, .ogg, .m4a</p>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .soundboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 0.75rem;
                }
                .sound-button {
                    aspect-ratio: 1;
                    border: 2px solid;
                    border-color: rgba(255, 255, 255, 0.8) rgba(184, 179, 173, 0.6) rgba(184, 179, 173, 0.8) rgba(255, 255, 255, 0.6);
                    border-radius: var(--radius-md);
                    background: linear-gradient(145deg, 
                        rgba(255, 220, 180, 0.9) 0%,
                        var(--cream) 25%,
                        var(--warm-cream) 75%,
                        rgba(184, 179, 173, 0.3) 100%);
                    cursor: pointer;
                    transition: all 0.15s ease-out;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--charcoal);
                    text-align: center;
                    padding: 0.5rem;
                    box-shadow: 
                        0 4px 8px rgba(45, 42, 37, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8),
                        inset 0 -1px 0 rgba(184, 179, 173, 0.5),
                        inset 1px 0 0 rgba(255, 255, 255, 0.6),
                        inset -1px 0 0 rgba(184, 179, 173, 0.4);
                }
                .sound-button:hover {
                    background: linear-gradient(145deg, 
                        rgba(255, 240, 200, 0.95) 0%,
                        var(--light-cream) 25%,
                        var(--cream) 75%,
                        rgba(184, 179, 173, 0.4) 100%);
                    box-shadow: 
                        0 6px 12px rgba(45, 42, 37, 0.25),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9),
                        inset 0 -1px 0 rgba(184, 179, 173, 0.6),
                        inset 1px 0 0 rgba(255, 255, 255, 0.7),
                        inset -1px 0 0 rgba(184, 179, 173, 0.5);
                }
                .sound-button:active {
                    background: linear-gradient(145deg, 
                        rgba(184, 179, 173, 0.2) 0%,
                        var(--cream) 25%,
                        var(--warm-cream) 75%,
                        rgba(255, 255, 255, 0.8) 100%);
                    transform: translateY(2px);
                    box-shadow: 0 2px 4px rgba(45, 42, 37, 0.4) inset;
                }
                .sound-button .icon {
                    font-size: 24px;
                    margin-bottom: 0.25rem;
                }
                #soundboard-volume {
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(184, 179, 173, 0.3);
                    outline: none;
                    border: none;
                }
                #soundboard-volume::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--primary-orange);
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
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
        
        categories.forEach(category => {
            category.addEventListener('click', () => {
                this.sounds.play('click');
                categories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');
            });
        });
        
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.sounds.play('click');
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            });
        });
    }
    
    setupSoundboard(windowElement) {
        this.soundboardAudio = new Map();
        this.soundboardVolume = 0.5;
        
        // Set up volume control
        const volumeSlider = windowElement.querySelector('#soundboard-volume');
        const volumeDisplay = windowElement.querySelector('#volume-display');
        
        if (volumeSlider && volumeDisplay) {
            volumeSlider.addEventListener('input', (e) => {
                this.soundboardVolume = e.target.value / 100;
                volumeDisplay.textContent = e.target.value + '%';
            });
        }
        
        // Load audio files (simulated - would normally scan sounds folder)
        this.loadSoundboardAudio(windowElement);
    }
    
    async loadSoundboardAudio(windowElement) {
        const soundGrid = windowElement.querySelector('#soundboard-grid');
        if (!soundGrid) return;
        
        try {
            // Load the manifest file
            const response = await fetch('sounds/manifest.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const sounds = await response.json();
            
            soundGrid.innerHTML = '';
            
            if (sounds.length === 0) {
                soundGrid.innerHTML = `
                    <div style="text-align: center; color: var(--warm-gray); padding: 2rem; grid-column: 1 / -1;">
                        <div style="font-size: 48px; margin-bottom: 1rem;">🎵</div>
                        <p>No audio files found</p>
                        <p style="font-size: 12px; margin-top: 0.5rem;">Add files to sounds/ and update manifest.json</p>
                    </div>
                `;
                return;
            }
            
            sounds.forEach(sound => {
                const button = document.createElement('div');
                button.className = 'sound-button';
                button.innerHTML = `
                    <div class="icon">${sound.emoji}</div>
                    <div>${sound.name}</div>
                `;
                
                button.addEventListener('click', () => {
                    this.playSound(sound.file, sound.name);
                });
                
                soundGrid.appendChild(button);
                
                // Preload the audio
                if (sound.file) {
                    const audio = new Audio(`sounds/${sound.file}`);
                    this.soundboardAudio.set(sound.file, audio);
                }
            });
            
        } catch (error) {
            console.error('Error loading soundboard manifest:', error);
            soundGrid.innerHTML = `
                <div style="text-align: center; color: var(--warm-gray); padding: 2rem; grid-column: 1 / -1;">
                    <div style="font-size: 48px; margin-bottom: 1rem;">⚠️</div>
                    <p>Error loading sounds</p>
                    <p style="font-size: 12px; margin-top: 0.5rem;">Check sounds/manifest.json</p>
                    <p style="font-size: 11px; color: var(--warm-gray); margin-top: 0.5rem;">${error.message}</p>
                </div>
            `;
        }
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
