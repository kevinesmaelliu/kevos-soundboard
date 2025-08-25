class MP3Player {
    constructor() {
        this.player = null;
        this.playerReady = false;
        this.isPlaying = false;
        this.volume = 75;
        this.currentVideoId = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.updateInterval = null;
        
        // Curated playlist
        this.defaultPlaylist = [
            'lvMchj_UytA', //Meditation
            'zbloDcecCvM', // song on the beach
            'HywzuV7yYmg', //Paradise
            'dqISnMuzrUQ', // saam sultan
            '76uzG6hStUs', // amoeba by extra small
            'Y_8mUx4VOmo', // chicago by mj
            'sKtl7-_6AjE', // One Step Clsoer
            'V_Ydoe4Q-Gg', // Weird Fishes / Arpeggi
        ];
        
        // Manual song/artist overrides for YouTube videos
        this.trackMetadata = {
            'lvMchj_UytA': { title: 'Meditation', artist: 'Walter Wanderley' },
            'zbloDcecCvM': { title: 'Song on the Beach', artist: 'Arcade Fire, Owen Pallett' },
            'HywzuV7yYmg': { title: 'Paradise', artist: 'Sade' },
            'dqISnMuzrUQ': { title: 'Wanderlust', artist: 'Saam Sultan' },
            '76uzG6hStUs': { title: 'Amoeba', artist: 'Extra Small' },
            'Y_8mUx4VOmo': { title: 'Chicago', artist: 'Michael Jackson' },
            'sKtl7-_6AjE': { title: 'One Step Closer', artist: 'Linkin Park' },
            'V_Ydoe4Q-Gg': { title: 'Weird Fishes / Arpeggi', artist: 'Radiohead' },
        };
    }
    
    init() {
        console.log('🎵 MP3Player.init() called');
        console.log('🎵 window.YT:', !!window.YT);
        console.log('🎵 window.YT.Player:', !!window.YT?.Player);
        
        // This will be called when YouTube API is ready
        if (window.YT && window.YT.Player) {
            console.log('🎵 YouTube API is ready, creating player');
            this.createPlayer();
        } else {
            console.log('🎵 YouTube API not ready, waiting...');
            // Try again after a short delay
            setTimeout(() => {
                if (window.YT && window.YT.Player) {
                    console.log('🎵 YouTube API ready after delay, creating player');
                    this.createPlayer();
                } else {
                    console.error('🎵 YouTube API still not ready after delay');
                    this.updateDisplay('YouTube API Loading...', 'Please wait or refresh');
                }
            }, 2000);
        }
    }
    
    createPlayer() {
        console.log('🎵 Creating YouTube player...');
        console.log('🎵 YouTube API available:', !!window.YT);
        console.log('🎵 YT.Player available:', !!window.YT?.Player);
        
        try {
            this.player = new YT.Player('mp3-youtube-player', {
                height: '0',
                width: '0',
                videoId: this.defaultPlaylist[0], // Start with first video
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'showinfo': 0
                },
                events: {
                    'onReady': this.onPlayerReady.bind(this),
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': this.onPlayerError.bind(this)
                }
            });
            console.log('🎵 YouTube player created successfully');
        } catch (error) {
            console.error('🎵 Error creating YouTube player:', error);
        }
    }
    
    onPlayerReady(event) {
        console.log('🎵 YouTube player ready - API methods now available:', {
            getCurrentTime: typeof this.player.getCurrentTime,
            getDuration: typeof this.player.getDuration,
            getPlayerState: typeof this.player.getPlayerState,
            playVideo: typeof this.player.playVideo,
            pauseVideo: typeof this.player.pauseVideo,
            loadVideoById: typeof this.player.loadVideoById
        });
        
        // Try to force-bind methods if they're undefined
        if (typeof this.player.getCurrentTime === 'undefined') {
            console.log('🎵 Attempting to fix undefined methods...');
            
            // Option 1: Try to access the player through the event target
            const eventPlayer = event.target;
            if (eventPlayer && typeof eventPlayer.getCurrentTime === 'function') {
                console.log('🎵 Using event.target player instead');
                this.player = eventPlayer;
            }
            
            // Option 2: Try accessing internal YouTube player object
            if (typeof this.player.getCurrentTime === 'undefined' && this.player.a) {
                console.log('🎵 Trying internal player object');
                const internalPlayer = this.player.a;
                if (typeof internalPlayer.getCurrentTime === 'function') {
                    this.player = internalPlayer;
                }
            }
        }
        
        // Final check
        console.log('🎵 Final method check after binding:', {
            getCurrentTime: typeof this.player.getCurrentTime,
            loadVideoById: typeof this.player.loadVideoById,
            playVideo: typeof this.player.playVideo
        });
        
        // Mark player as fully ready only if methods are available
        if (typeof this.player.getCurrentTime === 'function') {
            this.playerReady = true;
            console.log('🎵 Player is fully ready with working methods');
            
            this.setVolume(this.volume);
            
            // Auto-load the playlist when player is ready
            console.log('🎵 Loading playlist now that player is ready');
            this.loadPlaylist(this.defaultPlaylist);
            
            // Test initial progress update
            setTimeout(() => {
                console.log('🎵 Testing initial progress update...');
                this.updateProgress();
            }, 2000);
        } else {
            console.error('🎵 Player ready but methods still not available');
            console.log('🎵 Attempting fallback player creation...');
            
            // Option 3: Try recreating the player with a delay
            setTimeout(() => {
                try {
                    console.log('🎵 Recreating player as fallback...');
                    this.player = new YT.Player('mp3-youtube-player', {
                        height: '0',
                        width: '0',
                        videoId: this.defaultPlaylist[0],
                        events: {
                            'onReady': (evt) => {
                                console.log('🎵 Fallback player ready');
                                if (typeof evt.target.getCurrentTime === 'function') {
                                    console.log('🎵 Fallback player has working methods!');
                                    this.player = evt.target;
                                    this.playerReady = true;
                                    this.loadPlaylist(this.defaultPlaylist);
                                } else {
                                    this.updateDisplay('YouTube Error', 'API not working properly');
                                }
                            },
                            'onStateChange': this.onPlayerStateChange.bind(this)
                        }
                    });
                } catch (error) {
                    console.error('🎵 Fallback player creation failed:', error);
                    this.updateDisplay('YouTube Error', 'Please refresh the page');
                }
            }, 1000);
        }
    }
    
    onPlayerStateChange(event) {
        console.log(`🎵 Player state changed: ${event.data} (${this.getPlayerStateName(event.data)})`);
        
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            console.log('🎵 Starting update interval for progress bar');
            this.startUpdateInterval();
            // Toggle between play and pause SVGs
            const playBtn = document.getElementById('mp3-play');
            if (playBtn) {
                const playIcon = playBtn.querySelector('.play-icon');
                const pauseIcon = playBtn.querySelector('.pause-icon');
                console.log('Playing - found icons:', { playIcon, pauseIcon });
                if (playIcon) {
                    playIcon.style.setProperty('display', 'none', 'important');
                    console.log('Hiding play icon');
                }
                if (pauseIcon) {
                    pauseIcon.style.setProperty('display', 'block', 'important');
                    console.log('Showing pause icon');
                }
            }
            document.getElementById('mp3-visualizer')?.classList.add('playing');
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.stopUpdateInterval();
            // Toggle between play and pause SVGs
            const playBtn = document.getElementById('mp3-play');
            if (playBtn) {
                const playIcon = playBtn.querySelector('.play-icon');
                const pauseIcon = playBtn.querySelector('.pause-icon');
                console.log('Paused - found icons:', { playIcon, pauseIcon });
                if (playIcon) {
                    playIcon.style.setProperty('display', 'block', 'important');
                    console.log('Showing play icon');
                }
                if (pauseIcon) {
                    pauseIcon.style.setProperty('display', 'none', 'important');
                    console.log('Hiding pause icon');
                }
            }
            document.getElementById('mp3-visualizer')?.classList.remove('playing');
        } else if (event.data === YT.PlayerState.ENDED) {
            this.playNext();
        }
    }
    
    onPlayerError(event) {
        console.error('YouTube player error:', event.data);
        this.updateDisplay('Error loading video', 'Please try another URL');
    }
    
    startUpdateInterval() {
        console.log('⏰ Starting update interval');
        this.stopUpdateInterval();
        
        // First, immediately try to update progress
        console.log('⏰ Running immediate progress update');
        this.updateProgress();
        
        this.updateInterval = setInterval(() => {
            console.log('⏰ Interval tick - updating progress');
            this.updateProgress();
        }, 1000);
        console.log('⏰ Update interval started:', this.updateInterval);
        
        // Double-check that the interval is running after 2 seconds
        setTimeout(() => {
            console.log('⏰ Interval check - still running?', !!this.updateInterval);
            if (this.updateInterval) {
                console.log('⏰ Manual progress update test');
                this.updateProgress();
            }
        }, 2000);
    }
    
    stopUpdateInterval() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateProgress() {
        if (!this.player) {
            console.log('⏰ UpdateProgress: No player available');
            return;
        }
        
        // Check if player methods exist and are functions
        if (typeof this.player.getCurrentTime !== 'function' || typeof this.player.getDuration !== 'function') {
            console.log('⏰ UpdateProgress: Player methods not available yet');
            return;
        }
        
        try {
            const currentTime = this.player.getCurrentTime();
            const duration = this.player.getDuration();
            const playerState = this.player.getPlayerState();
            
            console.log(`⏰ UpdateProgress Raw Values:`, {
                currentTime,
                duration,
                playerState: this.getPlayerStateName(playerState),
                currentTimeType: typeof currentTime,
                durationType: typeof duration,
                isNaN_currentTime: isNaN(currentTime),
                isNaN_duration: isNaN(duration)
            });
            
            if (duration && duration > 0 && !isNaN(currentTime) && !isNaN(duration)) {
                const progress = Math.min(100, Math.max(0, (currentTime / duration) * 100));
                const progressEl = document.getElementById('mp3-progress');
                const currentTimeEl = document.getElementById('mp3-current-time');
                const totalTimeEl = document.getElementById('mp3-total-time');
                
                console.log('⏰ Progress elements found:', {
                    progressEl: !!progressEl,
                    currentTimeEl: !!currentTimeEl,
                    totalTimeEl: !!totalTimeEl
                });
                
                if (progressEl) {
                    const oldWidth = progressEl.style.width;
                    
                    // Force visible styling
                    progressEl.style.width = `${progress}%`;
                    progressEl.style.height = '100%';
                    progressEl.style.backgroundColor = '#ff6b35';
                    progressEl.style.transition = 'width 0.3s ease';
                    progressEl.style.borderRadius = '2px';
                    progressEl.style.minHeight = '4px';
                    
                    // Check parent container
                    const progressBar = progressEl.parentElement;
                    if (progressBar) {
                        progressBar.style.backgroundColor = 'rgba(255,255,255,0.3)';
                        progressBar.style.height = '4px';
                        progressBar.style.borderRadius = '2px';
                        progressBar.style.overflow = 'hidden';
                        progressBar.style.width = '100%';
                    }
                    
                    console.log(`⏰ Progress bar updated: ${oldWidth} -> ${progress.toFixed(1)}%`);
                    console.log('⏰ Progress element details:', {
                        width: progressEl.style.width,
                        backgroundColor: progressEl.style.backgroundColor,
                        height: progressEl.style.height,
                        offsetWidth: progressEl.offsetWidth,
                        offsetHeight: progressEl.offsetHeight,
                        parentHeight: progressBar?.offsetHeight,
                        parentWidth: progressBar?.offsetWidth,
                        computedWidth: getComputedStyle(progressEl).width,
                        computedHeight: getComputedStyle(progressEl).height
                    });
                } else {
                    console.warn('⏰ Progress bar element (mp3-progress) not found!');
                    console.log('⏰ Available mp3 elements:', Array.from(document.querySelectorAll('[id*="mp3"]')).map(el => el.id));
                }
                
                if (currentTimeEl) {
                    currentTimeEl.textContent = this.formatTime(currentTime);
                }
                
                if (totalTimeEl) {
                    totalTimeEl.textContent = this.formatTime(duration);
                }
            } else {
                console.log('⏰ Invalid duration or time values:', { currentTime, duration });
                
                // Reset progress bar if values are invalid
                const progressEl = document.getElementById('mp3-progress');
                if (progressEl) {
                    progressEl.style.width = '0%';
                }
            }
        } catch (error) {
            console.error('⏰ Error in updateProgress:', error);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    loadVideo(input) {
        if (!this.player) {
            console.error('🎵 Player not initialized yet');
            return;
        }
        
        // Wait for player to be fully ready
        if (!this.playerReady) {
            console.log('🎵 Player not ready yet, waiting for onPlayerReady callback...');
            this.updateDisplay('Loading...', 'Initializing player');
            return;
        }
        
        // Double-check that methods are available
        if (typeof this.player.loadVideoById !== 'function') {
            console.error('🎵 Player methods not available even after ready callback');
            this.updateDisplay('YouTube API Error', 'Please refresh the page');
            return;
        }
        
        let videoId = null;
        
        // Try to extract video ID from YouTube URL
        const urlMatch = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        if (urlMatch) {
            videoId = urlMatch[1];
        } else if (input.length === 11) {
            // Assume it's a video ID if it's 11 characters
            videoId = input;
        } else {
            // Treat as search query
            this.searchYouTube(input);
            return;
        }
        
        if (videoId) {
            console.log('🎵 Loading video:', videoId);
            this.currentVideoId = videoId;
            
            try {
                this.player.loadVideoById(videoId);
                console.log('🎵 Video load command sent successfully');
            } catch (error) {
                console.error('🎵 Error loading video:', error);
                return;
            }
            
            // Use custom metadata if available, otherwise show loading
            if (this.trackMetadata[videoId]) {
                const metadata = this.trackMetadata[videoId];
                this.updateDisplay(metadata.title, metadata.artist);
                console.log(`🎵 Using custom metadata: ${metadata.title} by ${metadata.artist}`);
            } else {
                this.updateDisplay('Loading...', '');
                
                // Get video info from YouTube API as fallback
                setTimeout(() => {
                    try {
                        if (this.player.getVideoData && typeof this.player.getVideoData === 'function') {
                            const data = this.player.getVideoData();
                            this.updateDisplay(data.title || 'Unknown Title', data.author || 'Unknown Artist');
                        }
                    } catch (error) {
                        console.error('🎵 Error getting video data:', error);
                    }
                }, 2000);
            }
        }
    }
    
    searchYouTube(query) {
        // For demo purposes, we'll just load a default video
        // In a real implementation, you'd use YouTube Data API to search
        this.updateDisplay('Search not available', 'Loading default playlist...');
        setTimeout(() => {
            this.loadPlaylist(this.defaultPlaylist);
        }, 1000);
    }
    
    loadPlaylist(videoIds) {
        console.log('Loading playlist with', videoIds.length, 'videos');
        this.playlist = videoIds;
        this.currentIndex = 0;
        if (this.playlist.length > 0) {
            this.loadVideo(this.playlist[0]);
        }
    }
    
    updateDisplay(title, artist) {
        document.getElementById('mp3-track-title').textContent = title;
        document.getElementById('mp3-track-artist').textContent = artist;
    }
    
    // Helper function to add custom metadata for a YouTube video
    addTrackMetadata(videoId, title, artist) {
        this.trackMetadata[videoId] = { title, artist };
        console.log(`Added custom metadata for ${videoId}: ${title} by ${artist}`);
    }
    
    // Helper function to get all current track metadata
    getTrackMetadata() {
        return this.trackMetadata;
    }
    
    play() {
        if (!this.player || !this.playerReady) {
            console.error('🎵 Cannot play - player not ready');
            return;
        }
        
        if (typeof this.player.playVideo !== 'function') {
            console.error('🎵 Cannot play - playVideo method not available');
            return;
        }
        
        try {
            console.log('🎵 Playing video...');
            this.player.playVideo();
        } catch (error) {
            console.error('🎵 Error playing video:', error);
        }
    }
    
    pause() {
        if (!this.player || !this.playerReady) {
            console.error('🎵 Cannot pause - player not ready');
            return;
        }
        
        if (typeof this.player.pauseVideo !== 'function') {
            console.error('🎵 Cannot pause - pauseVideo method not available');
            return;
        }
        
        try {
            console.log('🎵 Pausing video...');
            this.player.pauseVideo();
        } catch (error) {
            console.error('🎵 Error pausing video:', error);
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            // If no track is loaded, load the first song from the default playlist
            if (!this.currentVideoId && this.defaultPlaylist.length > 0) {
                console.log('🎵 No track loaded, loading first song from playlist');
                this.loadPlaylist(this.defaultPlaylist);
                return;
            }
            this.play();
        }
    }
    
    playNext() {
        if (this.playlist.length > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            this.loadVideo(this.playlist[this.currentIndex]);
        }
    }
    
    playPrev() {
        if (this.playlist.length > 0) {
            this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadVideo(this.playlist[this.currentIndex]);
        }
    }
    
    setVolume(value) {
        this.volume = value;
        if (this.player && this.player.setVolume) {
            this.player.setVolume(value);
        }
        document.getElementById('mp3-volume-value').textContent = value;
    }
    
    setupControls() {
        console.log('Setting up MP3 player controls');
        
        // Play/Pause button
        const playBtn = document.getElementById('mp3-play');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // Next button
        const nextBtn = document.getElementById('mp3-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.playNext());
        }
        
        // Previous button
        const prevBtn = document.getElementById('mp3-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.playPrev());
        }
        
        // Volume knob
        this.setupVolumeKnob();
        
        // EQ button setup with multiple retry attempts
        console.log('🎛️ Setting up EQ button...');
        this.setupEQButton();
        
            // Initialize YouTube player if API is ready
        if (window.YT && window.YT.Player && !this.player) {
            this.createPlayer();
        } else {
            console.log('🎵 YouTube API not ready yet, will retry when available');
        }
    }
    
    getPlayerStateName(state) {
        const states = {
            [-1]: 'UNSTARTED',
            [0]: 'ENDED',
            [1]: 'PLAYING', 
            [2]: 'PAUSED',
            [3]: 'BUFFERING',
            [5]: 'VIDEO_CUED'
        };
        return states[state] || `UNKNOWN(${state})`;
    }
    
    setupVolumeKnob() {
        const knob = document.getElementById('mp3-volume-knob');
        if (!knob) return;
        
        // Use the reusable VolumeKnob component
        this.volumeKnob = new VolumeKnob(knob, {
            initialValue: this.volume,
            minValue: 0,
            maxValue: 100,
            steps: 20,
            onValueChange: (value) => this.setVolume(value),
            soundManager: window.softOS ? window.softOS.sounds : null
        });
    }
    
    setupEQButton(attempt = 1) {
        console.log(`🎛️ EQ button setup attempt ${attempt}`);
        console.log('🎛️ All elements with mp3 in ID:', Array.from(document.querySelectorAll('[id*="mp3"]')).map(el => el.id));
        
        const eqBtn = document.getElementById('mp3-eq-btn');
        console.log('🎛️ EQ button found:', eqBtn);
        
        if (eqBtn) {
            console.log('🎛️ Adding click listener to EQ button');
            eqBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎛️ EQ button clicked - calling openEQWindow');
                this.openEQWindow();
            });
            console.log('🎛️ EQ button event listener added successfully');
        } else if (attempt < 5) {
            console.warn(`🎛️ EQ button not found on attempt ${attempt}, retrying in ${attempt * 500}ms...`);
            setTimeout(() => {
                this.setupEQButton(attempt + 1);
            }, attempt * 500);
        } else {
            console.error('🎛️ EQ button setup failed after 5 attempts');
            // Let's also try to find any button with "eq" in its class or id
            const eqElements = document.querySelectorAll('[class*="eq"], [id*="eq"]');
            console.log('🎛️ Elements containing "eq":', Array.from(eqElements).map(el => ({
                tag: el.tagName,
                id: el.id,
                class: el.className
            })));
        }
    }
    
    openEQWindow() {
        console.log('🎛️ openEQWindow called, checking for softOS...');
        if (window.softOS) {
            console.log('🎛️ Calling softOS.openEQWindow()');
            window.softOS.openEQWindow();
        } else {
            console.error('🎛️ window.softOS not found!');
        }
    }
}

// Make MP3Player class available globally
window.MP3Player = MP3Player;

// Create global instance
window.mp3Player = new MP3Player();

// Initialize when YouTube API is ready
window.onYouTubeIframeAPIReady = function() {
    console.log('🎵 YouTube API callback triggered - onYouTubeIframeAPIReady');
    console.log('🎵 window.YT available:', !!window.YT);
    console.log('🎵 window.YT.Player available:', !!window.YT?.Player);
    console.log('🎵 window.mp3Player available:', !!window.mp3Player);
    
    if (window.mp3Player) {
        console.log('🎵 Calling mp3Player.init()');
        window.mp3Player.init();
    } else {
        console.error('🎵 window.mp3Player not found when YouTube API ready');
        // Try to find and initialize any MP3 players
        setTimeout(() => {
            if (window.mp3Player) {
                console.log('🎵 Found mp3Player after delay, initializing...');
                window.mp3Player.init();
            }
        }, 1000);
    }
};