function buildMines(i, j) {
    var nums = generatetNumbers()
    var srcCell = (i * gLevel.SIZE) + j
    nums.splice(srcCell, 1)

    for (var k = 0; k < gLevel.MINES; k++) {
        var rndIdx = getRandomIntInclusive(0, nums.length - 1)
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

function resetMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]

            currCell.minesAroundCount = 0
        }
    }
}
