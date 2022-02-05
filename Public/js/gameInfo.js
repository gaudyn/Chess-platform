/**
 * Game information.
 */
class GameInfo extends React.Component {

    /**
     * Render information panel.
     * @param {string} child - Panel's name.  
     */
    renderChild(child) {
        if(child == 'connected') return(<ConnectedUsers/>);
        if(child == 'moves') return(<GameMoves/>);
        return null;
    }

    /**
     * Render game information.
     */
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

/**
 * Moves made in the game.
 */
class GameMoves extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            moves: []
        }

        let self = this;
        client.updateMoveList = (move) => {
            if(move == null){
                self.setState({
                    moves: []
                })
                return;
            }

            let oldMoves = self.state.moves;
            oldMoves.push(move);
            self.setState({
                moves: oldMoves
            })
        }
    }

    /**
     * Changes move from column/row format to chess format.
     * @param {{from: [x1,y1], to: [x,y]}} move - Game move
     */
    beautifyMove(move){
        const [x1, y1] = move.from;
        const [x2, y2] = move.to;

        return String.fromCharCode(x1+65)+(8-y1)+'-'+String.fromCharCode(x2+65)+(8-y2);
    }

    /**
     * Prepare move array for display.
     */
    getMadeMoves(){
        let preparedMoves = [];
        for(var i = 0; i < this.state.moves.length; i++){
            let move = this.state.moves[i];
            if(i%2 == 0){
                //White move
                preparedMoves.push({white: this.beautifyMove(move)})
            } else {
                //Black move
                let currentMove = preparedMoves.pop();
                currentMove.black = this.beautifyMove(move);
                preparedMoves.push(currentMove);
            }
        }
        return preparedMoves;
    }

    /**
     * Render made moves.
     */
    render() {
        return(
            <table>
            <thead>
                <tr>
                    <td>Move</td>
                    <td>White</td>
                    <td>Black</td>
                </tr>
            </thead>
            
            <tbody>
            {
                this.getMadeMoves().map((move, index) => {
                    return(
                    <tr key={`Move-row-${index}`}>
                        <td>{index}</td>
                        <td>{move.white}</td>
                        <td>{move.black ? move.black : ''}</td>
                    </tr>)
                })
            }
            </tbody>
                
            </table>
        )
    }
}

/**
 * Users connected to the room.
 */
class ConnectedUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            audience: []
        }
        
        // Get changes from the socket client.
        let self = this;
        client.updateAudience = (players) => {
            self.setState({
                audience: players
            })
        }
    }
    /**
     * Render users connected to the room.
     */
    render() {
        return(
            <div className="connected-users">
                <header>Players watching:</header>
                <ul>
                    {this.state.audience.map((player, index) => {
                        if(index == 0) return(<li key={player}><b>{player}</b></li>);
                        return(<li key={player}>
                        {player}
                        </li>);
                    })}
                </ul>
            </div>
        );
    }
}
