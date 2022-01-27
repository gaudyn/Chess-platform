function Square(props) {
    if(props.color === 'white'){
        return (
            <div className="square" key={props.key} style={{
            backgroundColor: 'white'}}>
            <span>{props.value}</span>
            </div>
        );
    } else {
        return (
            <div className="square" key={props.key} style={{
            backgroundColor: 'gray'}}>
            <span>{props.value}</span>
            </div>
        );
    }
}

class Board extends React.Component {
    constructor() {
        super()
        this.pieces = [
            ['♜','♞','♝','♚','♛','♝','♞','♜'],
            ['♟','♟','♟','♟','♟','♟','♟','♟'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['♙','♙','♙','♙','♙','♙','♙','♙'],
            ['♖','♘','♗','♔','♕','♗','♘','♖']
          ]
    }
    render() {
        return(
        [...Array(8).keys()].map((y) => {
            return (
            <div className="board-row" key={y}>
                {
                [...Array(8).keys()].map((x) => {
                    return (Square({color: (x+y)%2 ? 'white' : 'black', value: this.pieces[y][x], key:x}))
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