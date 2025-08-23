class MP3Player {
    constructor() {
        this.player = null;
        this.isPlaying = false;
        this.volume = 75;
        this.currentVideoId = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.updateInterval = null;
        
        // Curated playlist
        this.defaultPlaylist = [
            'zbloDcecCvM', // song on the beach
            'dqISnMuzrUQ', // saam sultan
            '76uzG6hStUs', // amoeba by extra small
            'Y_8mUx4VOmo', // chicago by mj
            'rPjez8z61rI', // Jazz Vibes
            'DWcJFNfaw9c', // Lofi Sleep
        ];
    }
    
    init() {
        // This will be called when YouTube API is ready
        if (window.YT && window.YT.Player) {
            this.createPlayer();
        }
    }
    
    createPlayer() {
        this.player = new YT.Player('mp3-youtube-player', {
            height: '0',
            width: '0',
            videoId: '',
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
    }
    
    onPlayerReady(event) {
        console.log('YouTube player ready');
        this.setVolume(this.volume);
        // Auto-load the playlist when player is ready
        this.loadPlaylist(this.defaultPlaylist);
    }
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.startUpdateInterval();
            document.getElementById('mp3-play-icon').textContent = '⏸';
            document.getElementById('mp3-visualizer')?.classList.add('playing');
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.stopUpdateInterval();
            document.getElementById('mp3-play-icon').textContent = '▶';
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
        this.stopUpdateInterval();
        this.updateInterval = setInterval(() => {
            this.updateProgress();
        }, 1000);
    }
    
    stopUpdateInterval() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateProgress() {
        if (!this.player || !this.player.getCurrentTime) return;
        
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            document.getElementById('mp3-progress').style.width = `${progress}%`;
            document.getElementById('mp3-current-time').textContent = this.formatTime(currentTime);
            document.getElementById('mp3-total-time').textContent = this.formatTime(duration);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    loadVideo(input) {
        if (!this.player) {
            console.log('Player not initialized yet');
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
            console.log('Loading video:', videoId);
            this.currentVideoId = videoId;
            this.player.loadVideoById(videoId);
            this.updateDisplay('Loading...', '');
            
            // Get video info
            setTimeout(() => {
                if (this.player.getVideoData) {
                    const data = this.player.getVideoData();
                    this.updateDisplay(data.title || 'Unknown Title', data.author || 'Unknown Artist');
                }
            }, 2000);
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
    
    play() {
        if (!this.player) return;
        this.player.playVideo();
    }
    
    pause() {
        if (this.player) {
            this.player.pauseVideo();
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
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
        
        // Initialize YouTube player if API is ready
        if (window.YT && window.YT.Player && !this.player) {
            this.createPlayer();
        }
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
}

// Make MP3Player class available globally
window.MP3Player = MP3Player;

// Create global instance
window.mp3Player = new MP3Player();

// Initialize when YouTube API is ready
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready');
    if (window.mp3Player) {
        window.mp3Player.init();
    }
};