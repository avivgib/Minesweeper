'use strict'

const FLAG_IMG = '<img class="flag" src="img/flag.png">'
const MINE_IMG = '<img class="mine" src="img/mine.png">'
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
    isFirstStep: true,
    isOn: false,
    livesCount: 3,
    showCount: 0,
    markedCount: gLevel.MINES,
    secsPassed: 0
}

function onInit() {
    resetTimer()
    gBoard = buildBoard()
    renderBoard()
    resetData()
}

function resetData() {
    gGame.isOn = false
    gGame.isFirstStep = true
    gGame.markedCount = gLevel.MINES
    gGame.showCount = 0
    gGame.livesCount = gLevel.LIVES
    document.querySelector('.marked').innerText = gGame.markedCount
    document.querySelector('.exposed').innerText = gGame.showCount
    document.querySelector('.res-msg').innerText = ''
    document.querySelector('.restart').innerText = '😁'
    document.querySelector('.lives').innerText = ''
    
    var livesStr = '💝'
    for(var i = 1; i < gLevel.LIVES; i++) {
        livesStr += '💝'
    }
    document.querySelector('.lives').innerText = livesStr
}

function onCellClicked(elCell, i, j) {
    if (gGame.isFirstStep) {
        startTimer()
        gGame.isFirstStep = false
        gGame.isOn = true
        buildMines(i, j)
        setMinesNegsCount()
    }
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
    gBestTime = '999'
    onInit()
}

function restartGame() {
    onInit()
}