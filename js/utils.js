function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getValidNeighbors(iPos, jPos) {
    var validNegs = []

    for (var i = iPos - 1; i <= iPos + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue

        for (var j = jPos - 1; j <= jPos + 1; j++) {
            if (i === iPos && j === jPos) continue
            if (j < 0 || j >= gLevel.SIZE) continue

            validNegs.push({ i, j })
        }
    }
    return validNegs
}