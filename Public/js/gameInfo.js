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
    /**
     * Render made moves.
     */
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
