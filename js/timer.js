function resetTimer() {
    clearInterval(gTimerIntrval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = INITIAL_TIMER_TEXT
    gGame.secsPassed = 0
}

function startTimer() {
    gStartTime = Date.now()
    gTimerIntrval = setInterval(updateTimer, TIMER_INTERVAL);
}

function updateTimer() {
    const delta = Date.now() - gStartTime
    const secondsPassed = Math.floor(delta / 1000)
    gGame.secsPassed = secondsPassed
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
    const currBetTime = Number(gBestTime)
    if (gGame.secsPassed < currBetTime || isNaN(currBetTime)) {
        gBestTime = formatTime(gGame.secsPassed * 1000)
        document.querySelector('.best-time').innerText = gBestTime
    }
}