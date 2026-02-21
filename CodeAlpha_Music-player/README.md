# 🎵 SoundWave — Music Player

A stylish, fully-featured music player built with pure HTML, CSS & JavaScript.

## ✨ Features

- ▶️ Play / Pause / Next / Previous controls
- 📋 Playlist with autoplay
- 📊 Progress bar with click & drag to seek
- 🔊 Volume slider + mute toggle
- 🔀 Shuffle mode
- 🔁 Repeat mode
- 🎨 Animated album artwork (spinning vinyl)
- 📡 EQ visualizer bars while playing
- ⌨️ Keyboard shortcuts

## ⌨️ Keyboard Shortcuts

| Key         | Action           |
|-------------|------------------|
| `Space`     | Play / Pause     |
| `→`         | Next track       |
| `←`         | Previous track   |
| `↑`         | Volume up        |
| `↓`         | Volume down      |
| `M`         | Mute / Unmute    |
| `S`         | Toggle Shuffle   |
| `R`         | Toggle Repeat    |

## 🚀 How to Use

1. Open `index.html` in any modern browser.
2. The player loads demo tracks from SoundHelix (requires internet).

## 🎵 Adding Your Own Music

1. Create an `audio/` folder inside the project directory.
2. Add your `.mp3` files there.
3. Open `script.js` and update the `songs` array:

```javascript
const songs = [
  {
    title: "My Song",
    artist: "My Artist",
    album: "My Album",
    year: "2024",
    duration: 210,       // in seconds (fallback, actual duration auto-detected)
    color: 0,            // 0–4 for artwork color themes
    icon: "🎵",          // emoji shown in playlist
    src: "audio/my-song.mp3"  // path to your audio file
  },
  // ... more songs
];
```

## 🛠️ Tech Stack

- **HTML5** — Structure & Audio API
- **CSS3** — Animations, glassmorphism, gradients
- **JavaScript (ES6+)** — Player logic, DOM manipulation
- **Font Awesome 6** — Icons
- **Google Fonts** — Bebas Neue + DM Sans

## 📁 Project Structure

```
music-player/
├── index.html     # Main HTML
├── style.css      # All styles & animations
├── script.js      # Player logic
└── README.md      # This file
```

---
Built for Task 4 — JavaScript Music Player Assignment
