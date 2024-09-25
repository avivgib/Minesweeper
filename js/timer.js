function resetTimer() {
    clearInterval(gTimerIntrval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = INITIAL_TIMER_TEXT
}

function startTimer() {
    gStartTime = Date.now()
    gTimerIntrval = setInterval(updateTimer, TIMER_INTERVAL);
}

function updateTimer() {
    const delta = Date.now() - gStartTime
    const elTimer = document.querySelector('.timer')
    elTimer.innerText = formatTime(delta)
}

function formatTime(ms) {
    var seconds = Math.floor(ms / 1000);
    return padTime(seconds)
}

function padTime(val) {
    return String(val).padStart(3, '0')
}

function updateBestTime() {
    var elTime = document.querySelector('.timer')
    const newTime = elTime.innerText

    if (newTime < gBestTime) {
        gBestTime = String(newTime)
        document.querySelector('.best-time').innerText = newTime
    }
}