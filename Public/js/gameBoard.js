function Square(props) {
    return (
        <div className="square" 
        style={{backgroundColor: props.color}}
        onClick={props.onClick}>
        <span>{props.value}</span>
        </div>
    );
}

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
            fromSquare: null
        }
    }

    handleClick(x,y) {
        let squares = this.state.pieces.slice();
        if (!this.state.fromSquare && squares[y][x] != ' ') {
            // Clicked first square
            this.setState({
                pieces: squares,
                fromSquare: [x,y]
            });
        } else if (this.state.fromSquare[0] == x && this.state.fromSquare[1] == y) {
            // Undo clicking first square
            this.setState({
                pieces: squares,
                fromSquare: null
            });
        } else {
            // Move piece to second square
            const [x1, y1] = this.state.fromSquare.slice();
            squares[y][x] = squares[y1][x1];
            squares[y1][x1] = ' ';
            console.log("From:" + [x1,y1] + " to: " + [x,y]);

            // Make move
            this.setState({
                pieces: squares,
                fromSquare: null
            });
        }
        
    }

    isSelected(x,y) {
        return (this.state.fromSquare 
            && this.state.fromSquare[0] == x 
            && this.state.fromSquare[1] == y);
    }

    isMovePossible(x,y) {
        if (!this.state.fromSquare) return false;
        // TODO: Check in engine if the move is possible
        return (this.state.fromSquare[0] == x || this.state.fromSquare[1] == y);
    }

    renderSquare(x,y) {
        var isLight = (x+y)%2;
        var color;
        if (this.isSelected(x,y)) {
            color = isLight ? '#4CB22E' : '#306F1D';
        } else if (this.isMovePossible(x,y)) {
            color = isLight ? '#2EB288' : '#1D6F55';
        } else {
            color = isLight ? '#F5F4E7' : '#5C5B57';
        }

        return (<Square
            color= {color} 
            value={this.state.pieces[y][x]} 
            key={`Square ${y}, ${x}`}
            onClick={() => this.handleClick(x,y)}
            />
        );
    }

    render() {
        return(
        [...Array(8).keys()].map((y) => {
            return (
            <div className="board-row" key={`Row ${y}`}>
                {
                [...Array(8).keys()].map((x) => {
                    return this.renderSquare(x,y);
                })
                }
            </div>
            );
        })
        )
    }
}

// ============

ReactDOM.render(
    <Board />,
    document.getElementById('gameboard')
);