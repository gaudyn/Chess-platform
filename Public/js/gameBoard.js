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
        var cursor = 'pointer';
        var color;
        if (this.isSelected(x,y)) {
            color = isLight ? '#4CB22E' : '#306F1D';
        } else if (this.isMovePossible(x,y)) {
            color = isLight ? '#2EB288' : '#1D6F55';
        } else {
            color = isLight ? '#F5F4E7' : '#5C5B57';
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

class GameInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: 'chat'
        }
    }

    renderChild() {
        switch (this.state.selection) {
            case 'chat':
                return(<Chat/>);
            case 'connected':
                return(<ConnectedUsers/>);
            case 'moves':
                return(<GameMoves/>);
            default:
                return('Tu jest domyślne');
        }
    }

    render() {
        return(
            <div>
                <div className='infoButtons'>
                    <div>Rozmowa</div>
                    <div>Przebieg</div>
                    <div>Obecni</div>
                    <div>Ustawienia</div>
                </div>
                {this.renderChild(this.state.selection)}
            </div>
        )
    }
}

class GameMoves extends React.Component {
    render() {
        return(
            <table>
            <thead>
                <tr>
                    <td>Ruch</td>
                    <td>Biały</td>
                    <td>Czarny</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>We5</td>
                    <td>Hh6</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>e7</td>
                    <td>Kh3</td>
                </tr>
            </tbody>
                
            </table>
        )
    }
}

class Chat extends React.Component {
    render() {
        return("Czat");
    }
}

class ConnectedUsers extends React.Component {
    render() {
        return("Połączeni użytkownicy");
    }
}

class PlayerInfo extends React.Component {

    renderPlayerName(username) {
        if(username) {
            return(
                <div>
                    {username}
                    <button>X</button>
                </div>
            )
        } else {
            return(
                <button>Zajmij</button>
            )
        }
    }

    renderPlayerSeat(color, username){
        return(
            <div class="player-seat">
                <div class="player-color" style={{backgroundColor: color}}></div>
                <div class="player-name">
                    {this.renderPlayerName(username)}
                </div>
            </div>
        )
    }

    render() {
        return(
            <div className="player-info">
                Pokój {roomId}
                <hr/>
                <div className="player-seats">
                    {this.renderPlayerSeat('white')}
                    <div style={{width: '10px'}}></div>
                    {this.renderPlayerSeat('black', 'gracz2')}
                </div>
                <hr/>
                <div className="player-buttons">
                    <button>Rezygnuję</button>
                    <button>Remis</button>
                </div>
            </div>);
    }
}

class GameStatus extends React.Component {
    render() {
        return(
            <div>
                <PlayerInfo/>
                <GameInfo/>
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return(
            <div className="game">
                <div className="board-border">
                    <Board/>
                </div>
                <GameStatus/>
            </div>
        )
    }
}

// ============

ReactDOM.render(
    <Game />,
    document.getElementById('gameboard')
);