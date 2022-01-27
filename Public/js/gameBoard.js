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
        const squares = this.state.pieces.slice();
        if (!this.state.fromSquare) {
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
            const fromSquare = this.state.fromSquare.slice();
            console.log("From:" + fromSquare + " to: " + [x,y]);
            // Make move
            this.setState({
                pieces: squares,
                fromSquare: null
            });
        }
        
    }

    renderSquare(x,y) {
        var color = (x+y)%2 ? 'white' : 'gray';
        if(this.state.fromSquare && this.state.fromSquare[0] == x && this.state.fromSquare[1] == y) {
            color = 'green'
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
    document.getElementById('gameBoard')
);