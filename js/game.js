'use strict'

const FLAG_IMG = '<img class="flag" src="img/flag.png">'
const MINE_IMG = '<img class="mine" src="img/mine.png">'
const HINT_IMG = '<img class="hint" onclick="onUseHint(this)" src="img/hint.png">'
const MINE_DETECTOR_IMG = '<img class="mine-detector" onclick="removeMines(this)" src="img/metal-detector.png">'
const TIMER_INTERVAL = 1000
const INITIAL_TIMER_TEXT = '000'

var gBestTime = '999'
if (!localStorage.getItem('beginnerBestTime')) {
    localStorage.setItem('beginnerBestTime', gBestTime)
}
if (!localStorage.getItem('mediumBestTime')) {
    localStorage.setItem('mediumBestTime', gBestTime)
}
if (!localStorage.getItem('expertBestTime')) {
    localStorage.setItem('expertBestTime', gBestTime)
}

var gTimerIntrval // holds the interval
var gStartTime // holds the start timer
var gTouchTimeout // for mark cells in touch screen
var gIsLongPress = false

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1
}
var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0,

    isFirstStep: true,
    hints: 0,
    safeClicks: 1,
    isHintStatus: false
}

function onInit() {
    resetTimer()
    gBoard = buildBoard()
    renderBoard()
    resetGameState()
}

function resetGameState() {
    resetGameModel()
    resetGameUI()
    resetBestTime()
    resetLives()
    resetHints()
    resetMineDetector()
}

function resetGameModel() {
    // MODEL
    gGame.isOn = false
    gGame.isFirstStep = true
    gGame.isHintStatus = false
    gGame.markedCount = gLevel.MINES
    gGame.showCount = 0
}

function resetGameUI() {
    // DOM
    document.querySelector('.safe-container span').innerText = `${gGame.safeClicks} clicks available`
    document.querySelector('.marked').innerText = gGame.markedCount
    document.querySelector('.exposed').innerText = gGame.showCount
    document.querySelector('.restart').innerText = '😁'
    document.querySelector('.res-msg').innerText = ''
}

function resetBestTime() {
    // BEST TIME
    if (gLevel.SIZE === 4) {
        gBestTime = localStorage.getItem('beginnerBestTime')
    } else if (gLevel.SIZE === 8) {
        gBestTime = localStorage.getItem('mediumBestTime')
    } else if (gLevel.SIZE === 12) {
        gBestTime = localStorage.getItem('expertBestTime')
    }
    document.querySelector('.best-time').innerText = gBestTime === '999' ? '000' : padTime(gBestTime)
}

function resetLives() {
    // LIVES
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = ''
    for (var i = 0; i < gLevel.LIVES; i++) {
        elLives.innerHTML += '💝'
    }
}

function resetHints() {
    // HINTS
    var elHintsContainer = document.querySelector('.hints')
    elHintsContainer.innerHTML = ''
    for (var i = 0; i < gGame.hints; i++) {
        elHintsContainer.innerHTML += HINT_IMG
    }
}

function resetMineDetector() {
    // MINE-DETECTOR
    var elMineDetectorContainer = document.querySelector('.mine-detector-container')
    var elMineDetector = document.querySelector('.mine-detector')

    elMineDetectorContainer.classList.add('hidden')

    if (gLevel.SIZE > 4) {
        elMineDetectorContainer.classList.remove('hidden')
        elMineDetector.innerHTML = MINE_DETECTOR_IMG
    }
}

function onCellClicked(elCell, i, j) {
    if (gGame.isFirstStep) {
        processFirstClick(i, j)
    }

    if (gGame.isHintStatus) {
        revealHintCells(i, j)
    } else {
        processRegularClick(elCell, i, j)
    }
}

function processFirstClick(i, j) {
    startTimer()
    gGame.isFirstStep = false
    gGame.isOn = true
    buildMines(i, j)
    setMinesNegsCount()
}

function revealHintCells(i, j) {
    var negsAndSelf = getNegsWithSelf(i, j)
    showHintedCells(negsAndSelf)

    setTimeout(() => {
        hiddenNegsWithSelf(negsAndSelf)
    }, 1000);

    setTimeout(() => {
        backToRegularMode()
    }, 1000);

    gGame.isHintStatus = false
}

function showHintedCells(negsAndSelf) {
    for (var k = 0; k < negsAndSelf.length; k++) {
        var currPos = negsAndSelf[k]
        var currCell = gBoard[currPos.i][currPos.j]
        var elCell = document.querySelector(`.cell-${currPos.i}-${currPos.j}`)

        elCell.classList.add('selected')
        if (currCell.isMine) {
            elCell.innerHTML = MINE_IMG
        } else {
            elCell.innerText = currCell.minesAroundCount === 0 ? '' : currCell.minesAroundCount
        }
    }
}

function processRegularClick(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (!gGame.isOn || currCell.isMarked || currCell.isShown) return

    currCell.isShown = true

    // Recursion - 0
    if (currCell.minesAroundCount === 0 && !currCell.isMine) {
        expandShown(elCell, i, j)
    }
    var elementToShow = checkGameOver(elCell, i, j)


    elCell.innerHTML = elementToShow === 0 ? '' : elementToShow
    elCell.classList.add('selected')
    document.querySelector('.exposed').innerText = gGame.showCount
}

function onTouchStart(event, elCell, i, j) {
    if (gBoard[i][j].isMarked) {
        onCellMarked(event, elCell, i, j)
        return
    }
    event.preventDefault()
    gIsLongPress = false

    gTouchTimeout = setTimeout(() => {
        onCellMarked(event, elCell, i, j)
        gIsLongPress = true
    }, 500);
}

function onTouchEnd(event, elCell, i, j) {
    clearTimeout(gTouchTimeout)
    if (!gIsLongPress) {
        onCellClicked(elCell, i, j)
    }
    event.preventDefault()
}

// Right Click Handler
function onCellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn || gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        elCell.innerHTML = FLAG_IMG
        gGame.markedCount--
    } else {
        gBoard[i][j].isMarked = false
        elCell.innerHTML = ''
        gGame.markedCount++
    }

    document.querySelector('.marked').innerText = gGame.markedCount
}

function checkGameOver(elCell, i, j) {

    // showElements()
    var currCell = gBoard[i][j]
    var elementToShow = currCell.minesAroundCount

    // Mine - Game Over - Lose
    if (currCell.isMine) {
        if (gLevel.LIVES > 0) {
            gLevel.LIVES--

            var audio = new Audio("sound/mine.mp3");
            audio.play();
            var elLives = document.querySelector('.lives').innerText
            var livesCount = elLives.replace('💝', '');
            elementToShow = MINE_IMG
            document.querySelector('.lives').innerText = livesCount
        } else {
            var audio = new Audio("sound/failure_trombone.mp3");
            audio.play();
            document.querySelector('.restart').innerText = '🤯'
            document.querySelector('.res-msg').innerText = 'YOU LOST!'
            clearInterval(gTimerIntrval)
            elementToShow = MINE_IMG
            gGame.isOn = false
            return elementToShow
        }
    }
    // Mine - Game Over - Win
    else if (gGame.showCount === (gLevel.SIZE ** 2) - gLevel.MINES - 1) {
        var audio = new Audio("sound/win_game.mp3");
        audio.play();
        document.querySelector('.restart').innerText = '😎'
        document.querySelector('.res-msg').innerText = 'YOU WON!'
        clearInterval(gTimerIntrval)
        gGame.isOn = false
        updateBestTime()
        gGame.showCount++
    } else {
        // for cell with mine neighbors
        gGame.showCount++
    }

    return elementToShow
}

function restartGame() {
    var level
    if (gLevel.SIZE === 4) level = 'beginner'
    else if (gLevel.SIZE === 8) level = 'medium'
    else if (gLevel.SIZE === 12) level = 'expert'

    resetLevelData(level)
    onInit()
}

function onChangeDifficulty(elBtn) {
    var level = elBtn.innerText.toLowerCase()
    resetLevelData(level)

    var elBestTime = document.querySelector('.best-time')
    elBestTime.innerText = '000'
    onInit()
}

function resetLevelData(level) {
    var levels = {
        beginner: { size: 4, mines: 2, lives: 1, hints: 0, safeClicks: 1 },
        medium: { size: 8, mines: 14, lives: 2, hints: 2, safeClicks: 2 },
        expert: { size: 12, mines: 32, lives: 3, hints: 3, safeClicks: 3 },
    }

    if (levels[level]) {
        gLevel.SIZE = levels[level].size
        gLevel.MINES = levels[level].mines
        gLevel.LIVES = levels[level].lives

        gGame.hints = levels[level].hints
        gGame.safeClicks = levels[level].safeClicks
    }
}


// BONUS

// Hints
function onUseHint(elHint) {
    gGame.isHintStatus = true
    changeStyleValidCells()

    gGame.hints--
    elHint.remove()
}

function changeStyleValidCells() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown) continue

            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.classList.add('hint-valid-cell')
        }
    }
}

function getNegsWithSelf(iPos, jPos) {
    var negsWithSelf = []

    for (var i = iPos - 1; i <= iPos + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue

        for (var j = jPos - 1; j <= jPos + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            var currCell = gBoard[i][j]
            if (currCell.isShown) continue

            negsWithSelf.push({ i, j })
        }
    }

    return negsWithSelf
}

function hiddenNegsWithSelf(negsAndSelf) {
    for (var k = 0; k < negsAndSelf.length; k++) {
        var currCell = negsAndSelf[k]

        var elCell = document.querySelector(`.cell-${currCell.i}-${currCell.j}`)
        elCell.classList.remove('selected')
        elCell.classList.remove('hint-valid-cell')
        elCell.innerText = ''
    }
}

function backToRegularMode() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown) continue

            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.classList.remove('selected')
            elCurrCell.classList.remove('hint-valid-cell')
        }
    }
}


// Safe Click
function markSafeCell() {
    if (gGame.safeClicks === 0) return
    gGame.safeClicks--

    var safeCells = getSafeCells()
    var rndIdx = getRandomIntInclusive(0, safeCells.length - 1)
    var rndPos = safeCells[rndIdx]
    safeCells.splice(rndIdx, 1)

    var elCell = document.querySelector(`.cell-${rndPos.i}-${rndPos.j}`)
    elCell.classList.add('hint-valid-cell')

    setTimeout(() => {
        elCell.classList.remove('hint-valid-cell')
    }, 2000);


    var elSpanText = document.querySelector('.safe-container span')
    elSpanText.innerText = `${gGame.safeClicks} clicks available`
}

function getSafeCells() {
    var safeCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown) continue
            if (gBoard[i][j].isMine) continue

            safeCells.push({ i, j })
        }
    }

    return safeCells
}