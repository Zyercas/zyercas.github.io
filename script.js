(function() {
    const armingOverlay = document.getElementById('arming-overlay');
    const timerDiv = document.getElementById('timer');
    const popup = document.getElementById('popup');
    const setTimeButton = document.getElementById('set-time');
    const closePopupButton = document.getElementById('close-popup');
    const newHoursInput = document.getElementById('new-hours');
    const newMinutesInput = document.getElementById('new-minutes');
    const newSecondsInput = document.getElementById('new-seconds');
    const explosionContainer = document.getElementById('explosion-container');

    const explosionGifs = [
        'assets/explosion1.gif', 'assets/explosion2.gif', 'assets/explosion3.gif',
        'assets/explosion4.gif', 'assets/explosion5.gif'
    ];

    let hoursElement, minutesElement, secondsElement;
    let totalSeconds = 5 * 60 * 60;
    let countdown;
    let isDetonated = false;
    let soundInterval;

    // --- NEW WEB AUDIO API SOUND ENGINE ---
    let audioCtx;
    let alarmOscillator;
    let masterGain;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.8; // Set master volume
            masterGain.connect(audioCtx.destination);
        }
    }

    function playAlarm() {
        if (alarmOscillator) alarmOscillator.stop();
        alarmOscillator = audioCtx.createOscillator();
        alarmOscillator.type = 'sawtooth';
        alarmOscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        alarmOscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
        alarmOscillator.connect(masterGain);
        alarmOscillator.start();
        alarmOscillator.onended = () => {
            if (isDetonated) playAlarm(); // Loop the alarm sound
        };
    }

    function stopAlarm() {
        if (alarmOscillator) {
            alarmOscillator.onended = null; // Stop looping
            alarmOscillator.stop();
            alarmOscillator = null;
        }
    }

    function playExplosionSound() {
        const explosionGain = audioCtx.createGain();
        explosionGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        explosionGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5); // LOUD boom with decay
        
        const noise = audioCtx.createBufferSource();
        const bufferSize = audioCtx.sampleRate * 1.5; // 1.5 seconds of noise
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }
        noise.buffer = buffer;
        noise.connect(explosionGain);
        explosionGain.connect(masterGain);
        noise.start();
    }
    // --- END OF SOUND ENGINE ---

    function initializeTimerElements() {
        hoursElement = document.getElementById('hours');
        minutesElement = document.getElementById('minutes');
        secondsElement = document.getElementById('seconds');
    }

    function updateTimerDisplay() {
        if (isDetonated || !hoursElement) return;
        let h = Math.floor(totalSeconds / 3600);
        let m = Math.floor((totalSeconds % 3600) / 60);
        let s = totalSeconds % 60;
        hoursElement.textContent = String(h).padStart(2, '0');
        minutesElement.textContent = String(m).padStart(2, '0');
        secondsElement.textContent = String(s).padStart(2, '0');
    }

    function triggerDetonation() {
        if (isDetonated) return;
        isDetonated = true;
        clearInterval(countdown);
        timerDiv.textContent = "VITTORIA A TÀVOLINO!";
        document.body.style.animation = "shake 0.8s infinite";

        playAlarm(); // Start the new alarm
        
        soundInterval = setInterval(() => {
            playExplosionSound(); // Play the new explosion sound
            createExplosion();
        }, 500);
    }

    function createExplosion() {
        const explosion = document.createElement('img');
        explosion.src = explosionGifs[Math.floor(Math.random() * explosionGifs.length)];
        explosion.className = 'explosion';
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 250 + 200;
        explosion.style.width = `${size}px`;
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        explosionContainer.appendChild(explosion);
        setTimeout(() => explosion.remove(), 740);
    }

    function startCountdown() {
        clearInterval(countdown);
        if (isDetonated) return;
        countdown = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateTimerDisplay();
            } else {
                totalSeconds = 0;
                updateTimerDisplay();
                triggerDetonation();
            }
        }, 1000);
    }

    function resetTimer() {
        isDetonated = false;
        clearInterval(countdown);
        clearInterval(soundInterval);
        stopAlarm();
        document.body.style.animation = '';
        timerDiv.innerHTML = '<span id="hours">00</span>:<span id="minutes">00</span>:<span id="seconds">00</span>';
        initializeTimerElements();
    }

    setTimeButton.addEventListener('click', () => {
        resetTimer();
        totalSeconds = (parseInt(newHoursInput.value) || 0) * 3600 +
                       (parseInt(newMinutesInput.value) || 0) * 60 +
                       (parseInt(newSecondsInput.value) || 0);
        updateTimerDisplay();
        popup.classList.add('hidden');
        startCountdown();
    });

    closePopupButton.addEventListener('click', () => popup.classList.add('hidden'));

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'x') {
            event.preventDefault();
            popup.classList.toggle('hidden');
        }
    });

    armingOverlay.addEventListener('click', () => {
        initAudio(); // Initialize the Audio system on user click
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        armingOverlay.style.display = 'none';
        
        initializeTimerElements();
        updateTimerDisplay();
        startCountdown();
    }, { once: true });
})();
