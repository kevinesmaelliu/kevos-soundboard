# kevOS Soundboard

A retro-styled virtual operating system interface with a built-in soundboard app. Features a warm, tactile UI inspired by the movie "Her" with retro Mac-like aesthetics.

![kevOS](https://img.shields.io/badge/version-1.0.0-orange)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow)
![No Dependencies](https://img.shields.io/badge/dependencies-0-green)

## Features

- 🎨 **Retro-modern UI** - Warm color palette with tactile, skeuomorphic design
- 🎵 **Web Audio API sounds** - System sounds generated programmatically
- 🪟 **Window management** - Draggable, resizable windows with smooth animations
- 🎯 **Magnetic dock** - Interactive dock with hover effects
- 🔊 **Soundboard app** - Load and play custom audio files
- 🚀 **Launch sequence** - Cinematic startup with custom audio

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kevos-soundboard.git
cd kevos-soundboard
```

2. Open in browser:
```bash
# Direct file access
open index.html  # macOS

# Or run a local server (recommended for CORS)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Adding Custom Sounds

1. Add audio files to the `sounds/` directory
2. Update `sounds/manifest.json`:
```json
[
  {
    "name": "Sound Name",
    "file": "filename.mp3",
    "emoji": "🎵"
  }
]
```
3. Click "Refresh" in the soundboard app

## Project Structure

```
kevos-soundboard/
├── index.html          # Main HTML with three-phase UI
├── script.js           # SoftOS class - main OS controller
├── sounds.js           # RetroSounds class - Web Audio API
├── styles.css          # Comprehensive styling with CSS variables
├── sounds/             # Audio files directory
│   ├── manifest.json   # Sound definitions
│   └── *.mp3          # Your audio files
└── CLAUDE.md          # AI assistant instructions
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Audio autoplay requires user interaction

## Technologies

- Vanilla JavaScript (ES6+)
- Web Audio API for system sounds
- CSS3 with custom properties
- No build tools or dependencies

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.