'use strict'

const FLAG_IMG = '<img class="flag" src="img/flag.png">'
const MINE_IMG = '<img class="mine" src="img/mine.png">'
const HINT_IMG = '<img class="hint" onclick="onUseHint(this)" src="img/hint.png">'
const TIMER_INTERVAL = 1000
const INITIAL_TIMER_TEXT = '000'

var gBestTime = '999'
var gTimerIntrval // holds the interval
var gStartTime // holds the start timer

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
    livesCount: 3,
    hints: 3,
    safeClicks: 3,
    isHintStatus: false
}

function onInit() {
    resetTimer()
    gBoard = buildBoard()
    renderBoard()
    resetData()
}

function resetData() {
    // MODEL
    gGame.isOn = false
    gGame.isFirstStep = true
    gGame.isHintStatus = false
    gGame.markedCount = gLevel.MINES
    gGame.showCount = 0
    gGame.livesCount = gLevel.LIVES
    gGame.safeClicks = 3
    
    // LIVES
    var livesStr = '💝'
    for (var i = 1; i < gLevel.LIVES; i++) {
        livesStr += '💝'
    }

    // DOM
    document.querySelector('.lives').innerText = livesStr
    document.querySelector('.marked').innerText = gGame.markedCount
    document.querySelector('.exposed').innerText = gGame.showCount
    document.querySelector('.restart').innerText = '😁'
    document.querySelector('.res-msg').innerText = ''
    
    // HINTS
    var hintsContainer = document.querySelector('.hints')
    hintsContainer.innerHTML = ''
    for (var i = 0; i < 3; i++) {
        hintsContainer.innerHTML += HINT_IMG
    }
}

function onCellClicked(elCell, i, j) {
    if (gGame.isFirstStep) {
        startTimer()
        gGame.isFirstStep = false
        gGame.isOn = true
        buildMines(i, j)
        setMinesNegsCount()
    }

    if (gGame.isHintStatus) {
        var negsAndSelf = getNegsWithSelf(i, j)

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

        setTimeout(() => {
            hiddenNegsWithSelf(negsAndSelf)
        }, 1000);

        setTimeout(() => {
            backToRegularMode()
        }, 1000);

        gGame.isHintStatus = false
    } else {
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
        if (gGame.livesCount > 0) {
            gGame.livesCount--

            var elLives = document.querySelector('.lives').innerText
            var livesCount = elLives.replace('💝', '');
            elementToShow = MINE_IMG
            document.querySelector('.lives').innerText = livesCount
        } else {
            document.querySelector('.restart').innerText = '🤯'
            document.querySelector('.res-msg').innerText = 'YOU LOSE!'
            clearInterval(gTimerIntrval)
            elementToShow = MINE_IMG
            gGame.isOn = false
            return elementToShow
        }
    }
    // Mine - Game Over - Win
    else if (gGame.showCount === (gLevel.SIZE ** 2) - gLevel.MINES - 1) {
        document.querySelector('.restart').innerText = '😎'
        document.querySelector('.res-msg').innerText = 'YOU WIN!'
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

function onChangeDifficulty(elBtn) {
    if (elBtn.innerText === 'Beginner') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.LIVES = 1
    }
    else if (elBtn.innerText === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.LIVES = 2
    }
    else if (elBtn.innerText === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.LIVES = 3
    }


    var elBestTime = document.querySelector('.best-time')
    elBestTime.innerText = '000'
    onInit()
}

function restartGame() {
    onInit()
}

function onUseHint(elHint) {
    gGame.isHintStatus = true
    changeStyleValidCells()
    // alert('Pick cell to show him and his neighbors!\n It is quikly')

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

            safeCells.push({i, j})
        }
    }

    return safeCells
}