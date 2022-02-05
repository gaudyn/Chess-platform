
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

ReactDOM.render(
    <Game />,
    document.getElementById('gameboard')
);