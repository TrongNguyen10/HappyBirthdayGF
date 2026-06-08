const MUSIC_KEY = 'birthdayMusicPlaying';
const TIME_KEY = 'birthdayMusicTime';

let toggleBtn = null;
let timeRestored = false;

function shouldPlay() {
    return sessionStorage.getItem(MUSIC_KEY) !== 'false';
}

function getBgMusic() {
    let audio = document.getElementById('bgMusic');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'bgMusic';
        audio.src = 'music2.mp3';
        audio.loop = true;
        audio.preload = 'auto';
        document.body.appendChild(audio);
    }
    return audio;
}

function getSavedTime() {
    const time = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
    return Number.isFinite(time) && time > 0 ? time : 0;
}

function applySavedTime(audio) {
    if (timeRestored) return;
    const savedTime = getSavedTime();
    if (!savedTime) {
        timeRestored = true;
        return;
    }
    if (audio.duration && Number.isFinite(audio.duration)) {
        audio.currentTime = savedTime % audio.duration;
    } else {
        audio.currentTime = savedTime;
    }
    timeRestored = true;
}

function saveMusicState() {
    const audio = document.getElementById('bgMusic');
    if (!audio) return;
    sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    sessionStorage.setItem(MUSIC_KEY, audio.paused ? 'false' : 'true');
}

function isPlaying() {
    const audio = getBgMusic();
    return !audio.paused && !audio.ended;
}

function updateToggleIcon() {
    if (!toggleBtn) return;
    toggleBtn.textContent = isPlaying() ? '🔊' : '🔇';
}

function startMusic() {
    const audio = getBgMusic();
    sessionStorage.setItem(MUSIC_KEY, 'true');
    return audio.play().then(() => {
        updateToggleIcon();
    }).catch(() => {
        updateToggleIcon();
    });
}

function pauseMusic() {
    const audio = getBgMusic();
    audio.pause();
    saveMusicState();
    updateToggleIcon();
}

function toggleMusic() {
    if (isPlaying()) {
        pauseMusic();
    } else {
        startMusic();
    }
}

function restoreAndPlay() {
    const audio = getBgMusic();

    const resume = () => {
        applySavedTime(audio);
        if (shouldPlay()) {
            startMusic();
        } else {
            updateToggleIcon();
        }
    };

    if (audio.readyState >= 1) {
        resume();
    } else {
        audio.addEventListener('loadedmetadata', resume, { once: true });
    }
}

function setupMusicPersistence() {
    const audio = getBgMusic();
    let lastSave = 0;

    audio.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastSave < 500) return;
        lastSave = now;
        sessionStorage.setItem(TIME_KEY, String(audio.currentTime));
    });

    window.addEventListener('pagehide', saveMusicState);
    window.addEventListener('beforeunload', saveMusicState);
}

function createToggleButton() {
    if (document.getElementById('musicToggle')) return;

    const style = document.createElement('style');
    style.textContent = `
        #musicToggle {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 9999;
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
            font-size: 22px;
            line-height: 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, background 0.2s;
        }
        #musicToggle:hover {
            transform: scale(1.1);
            background: #fff;
        }
    `;
    document.head.appendChild(style);

    toggleBtn = document.createElement('button');
    toggleBtn.id = 'musicToggle';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Bật/tắt nhạc');
    toggleBtn.textContent = '🔇';
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });
    document.body.appendChild(toggleBtn);
}

function setupFirstInteractionFallback() {
    const unlock = () => {
        if (shouldPlay() && !isPlaying()) {
            restoreAndPlay();
        }
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
}

document.addEventListener('DOMContentLoaded', () => {
    createToggleButton();
    setupMusicPersistence();
    restoreAndPlay();
    setupFirstInteractionFallback();
    updateToggleIcon();
});
