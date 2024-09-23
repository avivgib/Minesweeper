'use strict'

const FLAG_IMG = '<img class="flag" src="img/flag.png">'
const MINE_IMG = '<img class="mine" src="img/mine.png">'
const TIMER_INTERVAL = 31
const INITIAL_TIMER_TEXT = '00:00.000'

var gBestTime = '99:99.999'
var gTimerIntrval // holds the interval
var gStartTime // holds the start timer

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isFirstStep: true,
    isOn: false,
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

function resetTimer() {
    clearInterval(gTimerIntrval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = INITIAL_TIMER_TEXT
}

function resetData() {
    gGame.isFirstStep = true
    gGame.markedCount = gLevel.MINES
    gGame.showCount = 0
    document.querySelector('.marked').innerText = gGame.markedCount
    document.querySelector('.exposed').innerText = gGame.showCount
    document.querySelector('.res-msg').innerText = ''
}

function buildBoard() {
    var board = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board
}

function renderBoard() {
    var strHTML = ''

    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < gBoard[i].length; j++) {
            var cellClass = getClassName({ i: i, j: j })

            strHTML += `<td 
                            title="(${i}, ${j})" 
                            class="cell ${cellClass}" 
                            onclick="onCellClicked(this, ${i}, ${j})" 
                            oncontextmenu="onCellMarked(event, this, ${i}, ${j})">
                        </td>`
        }

        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

// Right Click Handler
function onCellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        elCell.innerHTML = FLAG_IMG
    } else {
        gBoard[i][j].isMarked = false
        elCell.innerHTML = " "
    }

    gGame.markedCount--
    document.querySelector('.marked').innerText = gGame.markedCount
}

function onCellClicked(elCell, i, j) {
    if (gGame.isFirstStep) {
        startTimer()
        gGame.isFirstStep = false
        gGame.isOn = true
        buildMines(i, j)
        setMinesNegsCount()
    }

    if (!gGame.isOn) return

    if (gBoard[i][j].isMarked) return

    // showElements()
    var currCell = gBoard[i][j]
    var elementToShow = currCell.minesAroundCount

    if (currCell.isMine) {
        document.querySelector('.res-msg').innerText = 'YOU LOSE!'
        clearInterval(gTimerIntrval)
        elementToShow = MINE_IMG
        gGame.isOn = false
    } else if (gGame.showCount === (gLevel.SIZE ** 2) - gLevel.MINES - 1) {
        document.querySelector('.res-msg').innerText = 'YOU WIN!'
        clearInterval(gTimerIntrval)
        updateBestTime()
        gGame.isOn = false
        gGame.showCount++
    } else {
        gGame.showCount++
    }

    elCell.innerHTML = elementToShow
    elCell.classList.add('selected')
    document.querySelector('.exposed').innerText = gGame.showCount
}

function updateBestTime() {
    var elTime = document.querySelector('.timer')
    const newTime = parseTime(elTime.innerText)
    const prevBestTime = parseTime(gBestTime)

    if(newTime < prevBestTime) {
        gBestTime = newTime.innerText
        document.querySelector('.best-time').innerText = formatTime(newTime)
    }
}

function parseTime(timerStr) {
    const splitTime = timerStr.split('.') 
    const ms = splitTime[1] 
    const seconds = splitTime[0].split(':')[1]
    const minutes = splitTime[0].split(':')[0]

    return (minutes * 60000) + (seconds * 1000) + (Number(ms))
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
    var minutes = Math.floor(ms / 60000);
    var seconds = Math.floor((ms % 60000) / 1000);
    var milliseconds = ms % 1000

    return `${padTime(minutes)}:${padTime(seconds)}.${padMiliseconds(milliseconds)}`
}

function padTime(val) {
    return String(val).padStart(2, '0')
}

function padMiliseconds(ms) {
    return String(ms).padStart(3, '0')
}

function buildMines(i, j) {
    var nums = generatetNumbers()
    var srcCell = (i * gLevel.SIZE) + j
    nums.splice(srcCell, 1)

    for (var i = 0; i < gLevel.MINES; i++) {
        var rndIdx = getRandomIntInclusive(0, nums.length)
        var rndNum = nums[rndIdx]
        nums.splice(rndIdx, 1)

        var iPos = Math.floor(rndNum / gLevel.SIZE)
        var jPos = rndNum % gLevel.SIZE

        gBoard[iPos][jPos].isMine = true
    }
}

function generatetNumbers() {
    var nums = []

    for (var i = 0; i < gLevel.SIZE ** 2; i++) {
        nums[i] = i
    }

    return nums
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine) continue

            updateNeighborCount(i, j)
        }
    }
}

function updateNeighborCount(iPos, jPos) {
    for (var i = iPos - 1; i <= iPos + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue

        for (var j = jPos - 1; j <= jPos + 1; j++) {
            if (i === iPos && j === jPos) continue
            if (j < 0 || j >= gLevel.SIZE) continue

            gBoard[i][j].minesAroundCount += 1
        }
    }
}

function onChangeDifficulty(elBtn) {
    if (elBtn.innerText === 'Beginner') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    }
    else if (elBtn.innerText === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
    }
    else if (elBtn.innerText === 'Expert') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }

    var elBestTime = document.querySelector('.best-time')
    elBestTime.innerText = '00:00.000'
    gBestTime = '99:99.999'
    gGame.isOn = false
    onInit()
}

function restartGame() {
    onInit()
}

function checkGameOver(currCell, elCell) {
    if (currCell.isMine) {
        elCell.innerHTML = MINE_IMG
        gGame.isOn = false
        return true
    }
    if (gGame.showCount > 0 && !gGame.isOn) {
        gGame.isOn = false
        return true
    }

    return false
}