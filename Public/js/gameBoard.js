/**
 * Creates a square for the gameboard.
 * @param {*} props `.color` - Square color, `.cursor` - Type of cursor for the square, `.value` - 
 */
function Square(props) {
    return (
        <div className="square" 
        style={{
            backgroundColor: props.color,
            cursor: props.cursor
            }}
        onClick={props.onClick}>
        {props.value}
        </div>
    );
}

/**
 * Gameboard react component
 */
class Board extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            // TODO: Replace with actual game object array
            pieces : [
                ['♜','♞','♝','♚','♛','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♔','♕','♗','♘','♖']
            ],
            fromSquare: null,
            isBlackPlaying: false
        }

        // Get changes from the socket client.
        var self = this;
        client.turnGameboard = (isBlackPlaying) => {
            self.setState({isBlackPlaying: isBlackPlaying});
        }

        client.newMoveMade = (move) => {
            let squares = this.state.pieces.slice();
            const [x1, y1] = move.from;
            const [x, y] = move.to;
            squares[y][x] = squares[y1][x1];
            squares[y1][x1] = ' ';
            console.log("From:" + [x1,y1] + " to: " + [x,y]);
            // Make move
            self.setState({
                pieces: squares
            });
        }

        client.resetBoard = () => {
            self.setState({
                // TODO: Replace with actual game object array
                pieces : [
                    ['♜','♞','♝','♚','♛','♝','♞','♜'],
                    ['♟','♟','♟','♟','♟','♟','♟','♟'],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    [' ',' ',' ',' ',' ',' ',' ',' '],
                    ['♙','♙','♙','♙','♙','♙','♙','♙'],
                    ['♖','♘','♗','♔','♕','♗','♘','♖']
                ],
                fromSquare: null
            });
        }
    }

    /**
     * Handle click on gameboard square.
     * @param {number} x - X coordinate of the square
     * @param {number} y - Y coordinate of the square
     */
    handleClick(x,y) {
        let squares = this.state.pieces.slice();
        if (!this.state.fromSquare && squares[y][x] != ' ') {
            // Clicked first square
            this.setState({
                pieces: squares,
                fromSquare: [x,y]
            });
        } else if (this.isSelected(x,y)) {
            // Undo clicking first square
            this.setState({
                pieces: squares,
                fromSquare: null
            });
        } else if (this.state.fromSquare && this.isMovePossible(x,y)){
            // Move piece to second square
            const [x1, y1] = this.state.fromSquare.slice();
            squares[y][x] = squares[y1][x1];
            squares[y1][x1] = ' ';
            console.log("From:" + [x1,y1] + " to: " + [x,y]);
            client.makeMove({from: [x1, y1], to: [x,y]})
            // Make move
            this.setState({
                pieces: squares,
                fromSquare: null
            });
        }
        
    }

    /**
     * Check if the square was selected by player.
     * @param {number} x - X coordinate of the square
     * @param {number} y - Y coordinate of the square
     * @returns `true` if the square was selected, `false` otherwise
     */
    isSelected(x,y) {
        return (this.state.fromSquare 
            && this.state.fromSquare[0] == x 
            && this.state.fromSquare[1] == y);
    }

    /**
     * Check if player can move selected piece to the square.
     * @param {number} x - X coordinate of the square
     * @param {number} y - Y coordinate of the square
     * @returns `true` if the move can be made, `false` otherwise
     */
    isMovePossible(x,y) {
        if (!this.state.fromSquare) return false;
        // TODO: Check in engine if the move is possible
        return (this.state.fromSquare[0] == x || this.state.fromSquare[1] == y);
    }

    /**
     * Get the square for position.
     * @param {number} x - X coordinate of the square
     * @param {number} y - Y coordinate of the square
     * @returns `square` to be rendered 
     */
    renderSquare(x,y) {
        var isLight = (x+y)%2;
        var cursor = 'pointer';
        var color;
        if (this.isSelected(x,y)) {
            color = isLight ? '#4CB22E' : '#306F1D';
        } else if (this.isMovePossible(x,y)) {
            color = isLight ? '#2EB288' : '#1D6F55';
        } else {
            color = isLight ? '#F5F4E7' : '#7C7B77';
            cursor = this.state.pieces[y][x] != ' ' ? 'pointer' : 'auto';
        }

        return (<Square
            color = {color} 
            value = {this.state.pieces[y][x]} 
            cursor = {cursor}
            key = {`Square ${y}, ${x}`}
            onClick = {() => this.handleClick(x,y)}
            />
        );
    }

    /**
     * Returns gameboard to be rendered
     */
    render() {
        return(
        [...Array(8).keys()].map((y) => {
            return (
            <div className="board-row" key={`Row ${y}`}>
                {
                [...Array(8).keys()].map((x) => {
                    return this.state.isBlackPlaying? this.renderSquare(7-x, 7-y) : this.renderSquare(x,y);
                })
                }
            </div>
            );
        })
        )
    }
}