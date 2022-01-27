function Square(props) {
    if(props.color === 'white'){
        return (
            <div className="square" style={{
            backgroundColor: 'white'}}>
            <span>{props.value}</span>
            </div>
        );
    } else {
        return (
            <div className="square" style={{
            backgroundColor: 'gray'}}>
            <span>{props.value}</span>
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
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
            toSquare: null,
            fromSquare: null
        }
    }
    render() {
        return(
        [...Array(8).keys()].map((y) => {
            return (
            <div className="board-row" key={`Row ${y}`}>
                {
                [...Array(8).keys()].map((x) => {
                    return (<Square
                        color= {(x+y)%2 ? 'white' : 'black'} 
                        value={this.state.pieces[y][x]} 
                        key={`Square ${y}, ${x}`}
                        />
                    );
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