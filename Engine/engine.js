var BLACK = 'b'
var WHITE = 'w'

var EMPTY = -1
var PAWN = 'p'
var BISHOP = 'b'
var KNIGHT = 'n'
var ROOK = 'r'
var QUEEN = 'q'
var KING = 'k'

var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:   8, b7:  9,  c7:  10, d7:  11, e7:  12, f7:  13, g7:  14, h7:  15,
    a6:  16, b6:  17, c6:  18, d6:  19, e6:  20, f6:  21, g6:  22, h6:  23,
    a5:  24, b5:  25, c5:  26, d5:  27, e5:  28, f5:  29, g5:  30, h5:  31,
    a4:  32, b4:  33, c4:  34, d4:  35, e4:  36, f4:  37, g4:  38, h4:  39,
    a3:  40, b3:  41, c3:  42, d3:  43, e3:  44, f3:  45, g3:  46, h3:  47,
    a2:  48, b2:  49, c2:  50, d2:  51, e2:  52, f2:  53, g2:  54, h2:  55,
    a1:  56, b1:  57, c1:  58, d1:  59, e1:  60, f1:  61, g1:  62, h1:  63
  }

var turn = WHITE;
var board = new Array(64)
var kings = {w: SQUARES.e1, b: SQUARES.e8} //positions of the kings, important for checking mates etc.
var move_number = 1

/**
 * Initializes the board and pieces on it. 
 * Generally does everything necessary before starting the game.
 */
function initialize() {
    turn = WHITE
    kings = {w: SQUARES.e1, b: SQUARES.e8}
    board = new Array(64)
    move_number = 1
    board[SQUARES[a8]] = board[SQUARES[h8]] = {type: ROOK, color: BLACK}
    board[SQUARES[a1]] = board[SQUARES[h1]] = {type: ROOK, color: WHITE}
    board[SQUARES[b8]] = board[SQUARES[g8]] = {type: KNIGHT, color: BLACK}
    board[SQUARES[b1]] = board[SQUARES[g1]] = {type: KNIGHT, color: WHITE}
    board[SQUARES[c8]] = board[SQUARES[f8]] = {type: BISHOP, color: BLACK}
    board[SQUARES[c1]] = board[SQUARES[f1]] = {type: BISHOP, color: WHITE}
    board[SQUARES[d8]] = {type: QUEEN, color: BLACK}
    board[SQUARES[d1]] = {type: QUEEN, color: WHITE}
    board[SQUARES[e8]] = {type: KING, color: BLACK}
    board[SQUARES[e1]] = {type: KING, color: WHITE}

}

/**
 * Gets the piece on the requested square.
 * @param {STRING} square
 * @returns piece on the given square (its type and color)
 */
function get(square) {
    var piece = board[SQUARES[square]]
    return piece ? { type: piece.type, color: piece.color } : null
}

/**
 * Removes the piece from the given square.
 * @param {STRING} square 
 * @returns piece on the given square (its type and color)
 */
function remove(square) {
    var piece = get(square)
    board[SQUARES[square]] = null
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY
    }
    return piece
}

/**
 * Puts the piece on the square.
 * @param {*} piece 
 * @param {*} square 
 */
function put(piece, square) {
    var sq = SQUARES[square]
    board[sq] = { type: piece.type, color: piece.color }
    if (piece.type === KING) {
      kings[piece.color] = sq
    }
}

function check_move(from, to) { //oh boy, here we go
    //1. check if the 'to' square is empty or if it is a legal attack
    //2. check if the piece's move is legal (for example if the bishop runs diagonally)
    //3. check if the king is (still) checked
    //4. check if the move is even on board :) (idk if this is necessary, maybe not)
}

function make_move(from, to) { //a lot TODO here
    //maybe we should check here if a king is checked
    //but i'm not sure about localization of that in code
    var piece = remove(from)
    put(piece, to)
}