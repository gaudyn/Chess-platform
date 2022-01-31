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
 * Gameboard
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
        var self = this;
        client.turnGameboard = (isBlackPlaying) => {
            self.setState({isBlackPlaying: isBlackPlaying});
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
                    return this.state.isBlackPlaying? this.renderSquare(7-x, 7-y) : this.renderSquare(x,y);
                })
                }
            </div>
            );
        })
        )
    }
}

class GameInfo extends React.Component {

    renderChild(child) {
        switch (child) {
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
                {this.renderChild('connected')}
                <hr/>
                {this.renderChild('moves')}
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

class ConnectedUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            audience: []
        }
        
        let self = this;
        client.updateAudience = (players) => {
            self.setState({
                audience: players
            })
        }
    }
    render() {
        return(
            <div className="connected-users">
                <header>Players watching:</header>
                <ul>
                    {this.state.audience.map((player) => {
                        return(<li key={player}>{player}</li>);
                    })}
                </ul>
            </div>
        );
    }
}

class ConfirmButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false,
            seconds: 10
        };
    }

    tick() {
        if(this.state.seconds == 0 && !this.state.clicked) {
            client.unclaimPlace();
        }
        this.setState( state => ({
            seconds: state.seconds-1 > 0 ? state.seconds-1 : 0
        }));
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    render() {
        return(!this.state.clicked ?
                <button onClick={() => {
                    this.setState({clicked: true})
                    client.confirmStart()}}>
                Confirm start ({this.state.seconds})
                </button> :
                <button style={{backgroundColor: 'gray', cursorEvents: 'none'}}>
                    Waiting ({this.state.seconds})
                </button>
        )
    }
}

class PlayerInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            whitePlayer: undefined,
            blackPlayer: undefined
        }

        let self = this;
        client.updateWhitePlayer = (username) => {
            self.setState({
                whitePlayer: username
            })
        }
        client.updateBlackPlayer = (username) => {
            self.setState({
                blackPlayer: username
            })
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
                }}>Take</button>
            )
        }
    }

    renderPlayerSeat(color, username){
        return(
            <div className="player-seat">
                <div className="player-color" style={{backgroundColor: color}}></div>
                <div className="player-name">
                    {this.renderPlayerName(color, username)}
                </div>
            </div>
        )
    }

    roomMessage() {
        if(this.props.canJoin){
            return 'Waiting for players';
        } else if(this.props.isCounting) {
            return 'The game is about to start'
        } else {
            return 'The game has started'
        }
    }

    render() {
        return(
            <div className="player-info">
                Room {roomId} - {this.roomMessage()}
                <hr/>
                <div className="player-seats">
                    {this.renderPlayerSeat('white', this.state.whitePlayer)}
                    <div style={{width: '10px'}}></div>
                    {this.renderPlayerSeat('black', this.state.blackPlayer)}
                </div>
                <hr/>
                <div className="player-buttons">
                    <button style={{marginRight: '5px'}}>Surrender</button>
                    <button style={{marginRight: '5px'}}>Tie</button>
                    {
                        this.props.isCounting ? <ConfirmButton/> : null
                    }
                </div>
            </div>);
    }
}

class GameStatus extends React.Component {
    render() {
        return(
            <div className="game-status">
                <PlayerInfo isCounting={this.props.isCounting}
                    canJoin={this.props.canJoin}/>
                <hr/>
                <GameInfo/>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameState: 'waiting',
            canPlay: false
        }

        var self = this;
        client.gameStateChanged = (state) => {
            
            self.setState({
                gameState: state,
                canPlay: this.state.gameState == "countdown" && state == 'playing'
            })
        }
    }
    render() {
        console.log(this.state.gameState);
        return(
            <div className="game">
                <div className="board-border" style={{pointerEvents: this.state.canPlay ? 'auto' : 'none'}}>
                    <Board/>
                </div>
                <GameStatus isCounting={this.state.gameState == 'countdown'}
                    canJoin={this.state.gameState == 'waiting'}
                />
            </div>
        )
    }
}

// ============

ReactDOM.render(
    <Game />,
    document.getElementById('gameboard')
);