"use_strict";
const { performance } = require('node:perf_hooks');
const MAX_TRIES = 1000000;
const MAX_MOVES = 32;
const _b_ = Symbol();
const _X_ = Symbol("X");
const _O_ = Symbol("O");

const getNewBoard = () => [
    [_b_, _b_, _X_, _X_, _X_, _b_, _b_],
    [_b_, _b_, _X_, _X_, _X_, _b_, _b_],
    [_X_, _X_, _X_, _X_, _X_, _X_, _X_],
    [_X_, _X_, _X_, _O_, _X_, _X_, _X_],
    [_X_, _X_, _X_, _X_, _X_, _X_, _X_],
    [_b_, _b_, _X_, _X_, _X_, _b_, _b_],
    [_b_, _b_, _X_, _X_, _X_, _b_, _b_]
];

const drawBoard = _board => {
    process.stdout.write("\n");
    _board.forEach(_line =>
    (_line.forEach(_cell =>
        process.stdout.write(_cell === _b_ ? "   "
            : _cell === _X_ ? "🟡 "
                : "⚫ ")
    ), process.stdout.write("\n"))
    );
    process.stdout.write("\n");
};

const getAvailableMovesSouth = _board => {
    const solutions = [];
    for (let r = 0; r < (_board.length - 2); r++) {
        for (let c = 0; c < _board[0].length; c++) {
            const _cell = _board[r][c];
            const _cellS = _board[r + 1][c];
            const _cellSS = _board[r + 2][c];
            if (_cell === _X_ && _cellS === _X_ && _cellSS === _O_)
                solutions.push({ from: [r, c], to: [r + 2, c], removes: [r + 1, c] })
        }
    }
    return solutions;
};

const getAvailableMovesEast = _board => {
    const solutions = [];
    for (let c = 0; c < (_board[0].length - 2); c++) {
        for (let r = 0; r < _board.length; r++) {
            const _cell = _board[r][c];
            const _cellE = _board[r][c + 1];
            const _cellEE = _board[r][c + 2];
            if (_cell === _X_ && _cellE === _X_ && _cellEE === _O_)
                solutions.push({ from: [r, c], to: [r, c + 2], removes: [r, c + 1] })
        }
    }
    return solutions;
};

const getAvailableMovesNorth = _board => {
    const solutions = [];
    for (let r = (_board.length - 1); r > 1; r--) {
        for (let c = (_board[0].length - 1); c >= 0; c--) {
            const _cell = _board[r][c];
            const _cellN = _board[r - 1][c];
            const _cellNN = _board[r - 2][c];
            if (_cell === _X_ && _cellN === _X_ && _cellNN === _O_)
                solutions.push({ from: [r, c], to: [r - 2, c], removes: [r - 1, c] })
        }
    }
    return solutions;
};

const getAvailableMovesWest = _board => {
    const solutions = [];
    for (let c = (_board[0].length - 1); c > 1; c--) {
        for (let r = (_board.length - 1); r >= 0; r--) {
            const _cell = _board[r][c];
            const _cellW = _board[r][c - 1];
            const _cellWW = _board[r][c - 2];
            if (_cell === _X_ && _cellW === _X_ && _cellWW === _O_)
                solutions.push({ from: [r, c], to: [r, c - 2], removes: [r, c - 1] })
        }
    }
    return solutions;
};

const getPossibleSolutions = _board => [
    ...getAvailableMovesSouth(_board),
    ...getAvailableMovesEast(_board),
    ...getAvailableMovesNorth(_board),
    ...getAvailableMovesWest(_board)
];

const pickRandomSolution = _possibles => _possibles[Math.floor(Math.random() * _possibles.length)]

const applySolution = (_board, _solution) => {
    const { from, to, removes } = _solution;
    _board[from[0]][from[1]] = _O_;
    _board[removes[0]][removes[1]] = _O_;
    _board[to[0]][to[1]] = _X_;
    return _board;
};

const getRemaining = _board => _board.reduce((t, r) => t + r.reduce((s, c) => (c === _X_ ? s + 1 : s), 0), 0);

const makeTry = (_verbose) => {
    let move = 0;
    let board = getNewBoard();
    do {
        const possibleSolutions = getPossibleSolutions(board);
        if (possibleSolutions.length === 0 || move === MAX_MOVES)
            break;
        const solution = pickRandomSolution(possibleSolutions);
        board = applySolution(board, solution);
        _verbose && console.log("\n=======\nMOVE ", move);
        _verbose && drawBoard(board);
    } while (++move)
    const remainingCount = getRemaining(board);
    _verbose && console.log("\nRemaining count: ", remainingCount);
    return {
        success: remainingCount === 1,
        remaining: remainingCount,
        moves: move,
        board
    }
};

const run = (_verbose) => {
    const startTime = performance.now();
    const tries = [];
    let tryNr = 0;
    let currentTry;
    while (++tryNr) {
        currentTry = makeTry(_verbose);
        tries.push(currentTry);
        if (currentTry.success || tryNr === MAX_TRIES)
            break;
    }
    const totalTime = performance.now() - startTime;
    const totalMoves = tries.reduce((m, t) => m + t.moves, 0);
    const bestScore = tries.reduce((min, t) => Math.min(min, t.remaining), 31);
    const bestTry = tries.find(t => t.remaining === bestScore);
    const worstScore = tries.reduce((max, t) => Math.max(max, t.remaining), 0);
    const worstTry = tries.find(t => t.remaining === worstScore);
    console.log(tryNr.toLocaleString("en-US"), "tries.");
    console.log("Success:", currentTry.success);
    console.log("Total moves:", totalMoves.toLocaleString("en-US"));
    console.log("Best score in a try:", bestScore);
    drawBoard(bestTry.board);
    console.log("Worst score in a try:", worstScore);
    drawBoard(worstTry.board);
    console.log("Total time:", totalTime > 10000 ? (totalTime / 1000).toFixed(2) + "s"
        : totalTime.toFixed(2).toLocaleString("en-US") + "ms");
}
console.log(run(false));