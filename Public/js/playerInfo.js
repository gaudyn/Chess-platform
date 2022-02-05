/**
 * Button for confirming starting the game.
 */
class ConfirmButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false,
            seconds: 10
        };
    }

    /**
     * Change timer after a second. Unclaim place if the 10 seconds have elapsed.
     */
    tick() {
        if(this.state.seconds == 0 && !this.state.clicked) {
            client.unclaimPlace();
        }
        this.setState( state => ({
            seconds: state.seconds-1 > 0 ? state.seconds-1 : 0
        }));
    }

    /**
     * Set the timer after the component has been mounted.
     */
    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    /**
     * Remove the timer when the component is about to be unmounted.
     */
    componentWillUnmount(){
        clearInterval(this.interval);
    }

    /**
     * Render confirm button.
     */
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

/**
 * Information about playing users.
 */
class PlayerInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            whitePlayer: undefined,
            blackPlayer: undefined
        }

        // Get changes from the socket client.
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

    /**
     * Render user playing as `color`. If no user has been specified, renders button to claim the place.
     * @param {('black'|'white')} color - user's color.
     * @param {string} username - user's name.
     */
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

    /**
     * Render player seat for `color`.
     * @param {('black'|'white')} color - seat's color. 
     * @param {string} username - Name of the user that taken the seat.
     * @returns 
     */
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

    /**
     * Renders room message depending of the game state.
     */
    roomMessage() {
        if(this.props.canJoin){
            return 'Waiting for players';
        } else if(this.props.isCounting) {
            return 'The game is about to start'
        } else {
            return 'The game has started'
        }
    }

    /**
     * Renders player and room information.
     */
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
