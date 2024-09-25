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

function expandShown(elCell, i, j) {
    var negs = getValidNeighbors(i, j)

    for (var k = 0; k < negs.length; k++) {
        var currPositions = negs[k]
        var negCell = gBoard[currPositions.i][currPositions.j]
        var elCurrCell = document.querySelector(`.cell.cell-${currPositions.i}-${currPositions.j}`)
        if (negCell.isShown) continue

        negCell.isShown = true
        elCurrCell.classList.add('selected')
        elCurrCell.innerText = negCell.minesAroundCount === 0 ? '' : negCell.minesAroundCount
        gGame.showCount++
        if (negCell.minesAroundCount === 0) expandShown(elCurrCell, currPositions.i, currPositions.j)
    }
}