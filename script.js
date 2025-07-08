(function() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const timerDiv = document.getElementById('timer');
    const popup = document.getElementById('popup');
    const setTimeButton = document.getElementById('set-time');
    const closePopupButton = document.getElementById('close-popup');
    const newHoursInput = document.getElementById('new-hours');
    const newMinutesInput = document.getElementById('new-minutes');
    const newSecondsInput = document.getElementById('new-seconds');

    let totalSeconds = 5 * 60 * 60;
    let countdown;

    function updateTimerDisplay() {
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    }

    function startCountdown() {
        clearInterval(countdown);
        countdown = setInterval(function() {
            if (totalSeconds <= 0) {
                clearInterval(countdown);
                timerDiv.textContent = "DETONATION";
                return;
            }
            totalSeconds--;
            updateTimerDisplay();
        }, 1000);
    }

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'j') {
            event.preventDefault();
            popup.classList.toggle('hidden');
        }
    });

    setTimeButton.addEventListener('click', function() {
        const newHours = parseInt(newHoursInput.value) || 0;
        const newMinutes = parseInt(newMinutesInput.value) || 0;
        const newSeconds = parseInt(newSecondsInput.value) || 0;

        totalSeconds = (newHours * 3600) + (newMinutes * 60) + newSeconds;
        updateTimerDisplay();
        popup.classList.add('hidden');
        startCountdown();
    });

    closePopupButton.addEventListener('click', function() {
        popup.classList.add('hidden');
    });

    updateTimerDisplay();
    startCountdown();
})();