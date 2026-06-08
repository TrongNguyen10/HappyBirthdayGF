const MUSIC_KEY = 'birthdayMusicPlaying';
const TIME_KEY = 'birthdayMusicTime';

let toggleBtn = null;
let musicInitialized = false;

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
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        document.body.appendChild(audio);
    }
    return audio;
}

function getSavedTime() {
    const time = parseFloat(sessionStorage.getItem(TIME_KEY) || '0');
    return Number.isFinite(time) && time > 0 ? time : 0;
}

function seekToSavedTime(audio) {
    const savedTime = getSavedTime();
    if (!savedTime) return;

    try {
        if (audio.duration && Number.isFinite(audio.duration)) {
            audio.currentTime = savedTime % audio.duration;
        } else {
            audio.currentTime = savedTime;
        }
    } catch (e) {}
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

function playFromSavedPosition() {
    const audio = getBgMusic();
    seekToSavedTime(audio);
    sessionStorage.setItem(MUSIC_KEY, 'true');
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
        playAttempt.then(updateToggleIcon).catch(updateToggleIcon);
    } else {
        updateToggleIcon();
    }
}

function startMusic() {
    return playFromSavedPosition();
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
        playFromSavedPosition();
    }
}

function restoreAndPlay() {
    if (isPlaying()) {
        updateToggleIcon();
        return;
    }

    const audio = getBgMusic();

    const resume = () => {
        if (!shouldPlay()) {
            updateToggleIcon();
            return;
        }
        playFromSavedPosition();
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

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveMusicState();
    });

    window.addEventListener('pagehide', saveMusicState);
}

function createToggleButton() {
    if (document.getElementById('musicToggle')) {
        toggleBtn = document.getElementById('musicToggle');
        return;
    }

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
            -webkit-tap-highlight-color: transparent;
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
            playFromSavedPosition();
        }
        document.removeEventListener('touchend', unlock, true);
        document.removeEventListener('click', unlock, true);
    };
    document.addEventListener('touchend', unlock, true);
    document.addEventListener('click', unlock, true);
}

function initMusic() {
    if (musicInitialized) {
        updateToggleIcon();
        return;
    }
    musicInitialized = true;

    createToggleButton();
    setupMusicPersistence();
    restoreAndPlay();
    setupFirstInteractionFallback();
    updateToggleIcon();
}

document.addEventListener('DOMContentLoaded', initMusic);
