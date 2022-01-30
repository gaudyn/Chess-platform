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

    setSelection(sel) {
        this.setState({selection: sel});
    }

    renderInfoButton(sel, title) {
        return (
            <div className='info-button'
                onClick={ () => {this.setSelection(sel)}}
                style={{backgroundColor: this.state.selection == sel ? 'gray' : 'lightgray'}}>
                {title}
            </div>
        )
    }

    render() {
        return(
            <div>
                <div className='info-buttons'>
                    {this.renderInfoButton('chat', 'Rozmowa')}
                    {this.renderInfoButton('moves', 'Przebieg')}
                    {this.renderInfoButton('connected', 'Obecni')}
                    {this.renderInfoButton('settings', 'Ustawienia')}
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

    constructor(props) {
        super(props);
        this.state = {
            whitePlayer: undefined,
            blackPlayer: undefined
        }
        console.log(client);
        console.log(this);

        let self = this;
        client.updateWhitePlayer = (username) => {
            console.log(self);
            self.setState(prevState => ({
                ...prevState,
                whitePlayer: username
            }))
            console.log(self.state);
        }
        client.updateBlackPlayer = (username) => {
            self.setState(prevState => ({
                ...prevState,
                blackPlayer: username
            }))
        }
    }

    renderPlayerName(color, username) {
        if(username) {
            return(
                <div>
                    {username}
                    <button style={{marginLeft: '5px'}}
                    onClick={() => {client.unclaimPlace()}}>X</button>
                </div>
            )
        } else {
            return(
                <button onClick={() => {
                    if(color == 'white'){
                        client.claimWhitePlace()
                    } else {
                        client.claimBlackPlace()
                    }
                }}>Zajmij</button>
            )
        }
    }

    renderPlayerSeat(color, username){
        console.log(`Render player seat ${color}, ${username}`)
        return(
            <div className="player-seat">
                <div className="player-color" style={{backgroundColor: color}}></div>
                <div className="player-name">
                    {this.renderPlayerName(color, username)}
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
                    {this.renderPlayerSeat('white', this.state.whitePlayer)}
                    <div style={{width: '10px'}}></div>
                    {this.renderPlayerSeat('black', this.state.blackPlayer)}
                </div>
                <hr/>
                <div className="player-buttons">
                    <button style={{marginRight: '5px'}}>Rezygnuję</button>
                    <button>Remis</button>
                </div>
            </div>);
    }
}

class GameStatus extends React.Component {
    render() {
        return(
            <div className="game-status">
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
console.log(client.updateWhitePlayer);