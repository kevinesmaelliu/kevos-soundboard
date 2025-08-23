# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript web application called "kevOS" - a retro-styled virtual operating system interface with a built-in soundboard app. It features a warm, tactile UI inspired by the movie "Her" with retro Mac-like aesthetics.

## Architecture

### Core Components

1. **SoftOS Class** (`script.js`): Main OS controller managing windows, apps, and system interactions
   - Window management (dragging, minimizing, maximizing, closing)
   - App launching and lifecycle
   - Dock interactions with magnetic hover effects
   - System UI updates (time display, taskbar)

2. **RetroSounds Class** (`sounds.js`): Web Audio API sound system
   - Generates system sounds programmatically (no external files needed)
   - Provides startup chime, clicks, window sounds, and error beeps

3. **Soundboard App**: Dynamic audio player that loads sounds from `sounds/` directory
   - Reads from `sounds/manifest.json` for sound definitions
   - Each sound entry needs: `name`, `file`, and `emoji` properties

### Key Files

- `index.html`: Three-phase UI (start screen → launch screen → desktop)
- `styles.css`: Comprehensive styling with CSS variables for theming
- `sounds/manifest.json`: Defines available sounds for the soundboard app

## Development Commands

Since this is a vanilla JavaScript project with no build system:

```bash
# Start development (open index.html in browser)
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Run a simple HTTP server (if needed for CORS)
python3 -m http.server 8000
# or
npx serve .
```

## Adding New Sounds

1. Place audio files in `sounds/` directory
2. Update `sounds/manifest.json`:
```json
{
  "name": "Sound Name",
  "file": "filename.mp3",
  "emoji": "🎵"
}
```
3. Click "Refresh" in the soundboard app

## Launch Sequence

The app has a sophisticated startup flow:
1. Start screen with kevOS branding
2. Launch screen with progress animation and kevOS-launcher.mp3 playback
3. Desktop with auto-opened welcome window and soundboard

## Browser Compatibility Notes

- Uses Web Audio API for system sounds
- Audio autoplay requires user interaction (handled with click-to-enable fallback)
- CSS uses modern properties like `backdrop-filter` for blur effects