// ===== SONG DATA =====
// To use real audio files, add them to an "audio/" folder and update the src paths below.
// Demo mode: uses free public domain audio from archive.org / freemusicarchive for demonstration.
const songs = [
  {
    title: "Midnight Drive",
    artist: "Neon Collective",
    album: "City Lights",
    year: "2024",
    duration: 213,
    color: 0,
    icon: "🌙",
    // Replace with your own audio file path, e.g.: src: "audio/midnight-drive.mp3"
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Solar Winds",
    artist: "Echo Chamber",
    album: "Frequencies",
    year: "2023",
    duration: 187,
    color: 1,
    icon: "☀️",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Deep Blue",
    artist: "Wave Theory",
    album: "Ocean EP",
    year: "2024",
    duration: 248,
    color: 2,
    icon: "🌊",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Forest Rain",
    artist: "Ambient Project",
    album: "Nature Sounds",
    year: "2023",
    duration: 195,
    color: 3,
    icon: "🌿",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    title: "Cosmic Drift",
    artist: "Stellar Mix",
    album: "Universe EP",
    year: "2024",
    duration: 230,
    color: 4,
    icon: "🚀",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

// ===== STATE =====
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
let shuffleOrder = [];
let isDraggingProgress = false;

// ===== DOM REFS =====
const audio        = document.getElementById('audioEl');
const btnPlay      = document.getElementById('btnPlay');
const playIcon     = document.getElementById('playIcon');
const btnPrev      = document.getElementById('btnPrev');
const btnNext      = document.getElementById('btnNext');
const btnShuffle   = document.getElementById('btnShuffle');
const btnRepeat    = document.getElementById('btnRepeat');
const btnMute      = document.getElementById('btnMute');
const volIcon      = document.getElementById('volIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volPct       = document.getElementById('volPct');
const progressBar  = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressThumb= document.getElementById('progressThumb');
const currentTime  = document.getElementById('currentTime');
const totalTime    = document.getElementById('totalTime');
const trackTitle   = document.getElementById('trackTitle');
const trackArtist  = document.getElementById('trackArtist');
const trackAlbum   = document.getElementById('trackAlbum');
const trackYear    = document.getElementById('trackYear');
const artworkInner = document.getElementById('artworkInner');
const artwork      = document.getElementById('artwork');
const artworkRing  = document.querySelector('.artwork-ring');
const eqBars       = document.getElementById('eqBars');
const playlistEl   = document.getElementById('playlist');
const playlistCount= document.getElementById('playlistCount');

// ===== INIT =====
function init() {
  buildPlaylist();
  loadSong(currentIndex);
  audio.volume = 0.8;
  generateShuffleOrder();
}

// ===== LOAD SONG =====
function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;

  // Update info
  trackTitle.textContent = song.title;
  trackArtist.textContent = song.artist;
  trackAlbum.textContent = song.album;
  trackYear.textContent = song.year;

  // Artwork
  artworkInner.className = `artwork-inner color${song.color}`;

  // Total duration (use actual or fallback)
  totalTime.textContent = formatTime(song.duration);
  currentTime.textContent = '0:00';
  progressFill.style.width = '0%';
  progressThumb.style.right = 'calc(100% - 0%)';

  // Marquee if title is long
  const parent = trackTitle.parentElement;
  if (song.title.length > 16) {
    trackTitle.classList.add('scrolling');
  } else {
    trackTitle.classList.remove('scrolling');
  }

  highlightPlaylistItem(index);
}

// ===== PLAY / PAUSE =====
function playSong() {
  audio.play().catch(() => {
    showToast('⚠️ Could not play. Check audio source.');
  });
  isPlaying = true;
  playIcon.className = 'fas fa-pause';
  artwork.classList.add('spinning');
  artworkRing.classList.add('spinning');
  eqBars.classList.add('active');
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playIcon.className = 'fas fa-play';
  artwork.classList.remove('spinning');
  artworkRing.classList.remove('spinning');
  eqBars.classList.remove('active');
}

function togglePlay() {
  if (isPlaying) pauseSong(); else playSong();
}

// ===== NAV =====
function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  if (isShuffle) {
    currentIndex = getPrevShuffleIndex();
  } else {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  }
  loadSong(currentIndex);
  if (isPlaying) playSong();
}

function nextSong() {
  if (isShuffle) {
    currentIndex = getNextShuffleIndex();
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  if (isPlaying) playSong();
}

// ===== SHUFFLE =====
function generateShuffleOrder() {
  shuffleOrder = [...Array(songs.length).keys()].sort(() => Math.random() - 0.5);
}
function getNextShuffleIndex() {
  const pos = shuffleOrder.indexOf(currentIndex);
  return shuffleOrder[(pos + 1) % shuffleOrder.length];
}
function getPrevShuffleIndex() {
  const pos = shuffleOrder.indexOf(currentIndex);
  return shuffleOrder[(pos - 1 + shuffleOrder.length) % shuffleOrder.length];
}

// ===== PROGRESS =====
function updateProgress() {
  if (isDraggingProgress) return;
  const { currentTime: ct, duration } = audio;
  if (!duration) return;
  const pct = (ct / duration) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.right = (100 - pct) + '%';
  currentTime.textContent = formatTime(ct);
  totalTime.textContent = formatTime(duration);
}

function seekTo(e) {
  const rect = progressBar.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const pct = x / rect.width;
  audio.currentTime = pct * audio.duration;
  progressFill.style.width = (pct * 100) + '%';
}

progressBar.addEventListener('mousedown', e => {
  isDraggingProgress = true;
  seekTo(e);
});
document.addEventListener('mousemove', e => {
  if (isDraggingProgress) seekTo(e);
});
document.addEventListener('mouseup', () => { isDraggingProgress = false; });
progressBar.addEventListener('click', seekTo);

// Touch support
progressBar.addEventListener('touchstart', e => {
  isDraggingProgress = true;
  seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (isDraggingProgress) seekTo(e.touches[0]);
}, { passive: true });
document.addEventListener('touchend', () => { isDraggingProgress = false; });

// ===== VOLUME =====
volumeSlider.addEventListener('input', () => {
  const val = volumeSlider.value;
  audio.volume = val / 100;
  isMuted = false;
  updateVolIcon(val);
});

function updateVolIcon(val) {
  volPct.textContent = val + '%';
  if (val == 0 || isMuted) {
    volIcon.className = 'fas fa-volume-xmark';
  } else if (val < 40) {
    volIcon.className = 'fas fa-volume-low';
  } else {
    volIcon.className = 'fas fa-volume-high';
  }
  // Visual fill on slider
  const pct = val / 100;
  volumeSlider.style.background = `linear-gradient(to right, var(--accent) ${pct*100}%, var(--dark3) ${pct*100}%)`;
}

btnMute.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  updateVolIcon(isMuted ? 0 : volumeSlider.value);
});

// ===== PLAYLIST =====
function buildPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    li.dataset.index = i;
    li.innerHTML = `
      <span class="pli-num">${i + 1}</span>
      <span class="pli-playing"><i class="fas fa-music"></i></span>
      <div class="pli-color color${song.color}">${song.icon}</div>
      <div class="pli-info">
        <div class="pli-title">${song.title}</div>
        <div class="pli-artist">${song.artist}</div>
      </div>
      <span class="pli-dur">${formatTime(song.duration)}</span>
    `;
    li.addEventListener('click', () => {
      currentIndex = i;
      loadSong(currentIndex);
      playSong();
    });
    playlistEl.appendChild(li);
  });
  playlistCount.textContent = `${songs.length} tracks`;
}

function highlightPlaylistItem(index) {
  document.querySelectorAll('.playlist-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
}

// ===== AUTOPLAY NEXT =====
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch(e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowRight': nextSong(); break;
    case 'ArrowLeft': prevSong(); break;
    case 'ArrowUp':
      e.preventDefault();
      volumeSlider.value = Math.min(100, +volumeSlider.value + 5);
      volumeSlider.dispatchEvent(new Event('input'));
      break;
    case 'ArrowDown':
      e.preventDefault();
      volumeSlider.value = Math.max(0, +volumeSlider.value - 5);
      volumeSlider.dispatchEvent(new Event('input'));
      break;
    case 'KeyM': btnMute.click(); break;
    case 'KeyS': btnShuffle.click(); break;
    case 'KeyR': btnRepeat.click(); break;
  }
});

// ===== BUTTON EVENTS =====
btnPlay.addEventListener('click', togglePlay);
btnPrev.addEventListener('click', prevSong);
btnNext.addEventListener('click', nextSong);

btnShuffle.addEventListener('click', () => {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle('active', isShuffle);
  if (isShuffle) generateShuffleOrder();
  showToast(isShuffle ? '🔀 Shuffle On' : '🔀 Shuffle Off');
});

btnRepeat.addEventListener('click', () => {
  isRepeat = !isRepeat;
  btnRepeat.classList.toggle('active', isRepeat);
  showToast(isRepeat ? '🔁 Repeat On' : '🔁 Repeat Off');
});

// ===== AUDIO EVENTS =====
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  totalTime.textContent = formatTime(audio.duration);
});

// ===== HELPERS =====
function formatTime(sec) {
  sec = Math.floor(sec) || 0;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===== PLAYLIST COLOR ITEMS =====
// Apply gradient backgrounds to color dots in playlist
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .pli-color.color0 { background: linear-gradient(135deg,#1a1a2e,#533483); }
  .pli-color.color1 { background: linear-gradient(135deg,#1a0a00,#ff3c00); }
  .pli-color.color2 { background: linear-gradient(135deg,#0a1628,#2980b9); }
  .pli-color.color3 { background: linear-gradient(135deg,#1a0a2e,#38ef7d); }
  .pli-color.color4 { background: linear-gradient(135deg,#200122,#fc00ff); }
`;
document.head.appendChild(styleSheet);

// Initial volume visual
updateVolIcon(80);

// ===== START =====
init();
