'use strict'

const FLAG_IMG = '<img class="flag" src="img/flag.png">'
const MINE_IMG = '<img class="mine" src="img/mine.png">'

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    showCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = buildBoard()
    renderBoard()
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
    if (gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        elCell.innerHTML = FLAG_IMG
    } else {
        gBoard[i][j].isMarked = false
        elCell.innerHTML = " "
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        gGame.isOn = true
        buildMines(i, j)
        setMinesNegsCount()
    }

    var currCell = gBoard[i][j]
    var elementToShow = currCell.minesAroundCount
    if (currCell.isMine) elementToShow = MINE_IMG

    elCell.innerHTML = elementToShow
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

    gGame.isOn = false
    onInit()
}