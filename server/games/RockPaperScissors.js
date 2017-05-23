class RockPaperScissors {
    constructor (){
        this.moves = [];
        this.numPlayers = 2;
        this.players = [];
        this.state = 'waiting';
        this.type = 'simultaneous';
        this.winner = false;
        this.opponent = false;
    }

    addPlayer ( client ){
        this.players.push( client );

        console.log( `Player ${ client.id } joined a game of Rock Paper Scissors` );

        client.on( 'move', ( moveData ) => {
            this.addMove( client.id, moveData );
        } );

        this.maybeStart();
    }

    removePlayer ( clientId ) {
        for ( let i = 0; i < this.players.length; i = i + 1 ) {
            if( this.players[ i ].id === clientId ) {
                this.players.splice( i, 1 );

                if ( this.state === 'running' ) {
                    this.state = 'error';
                }

                if ( this.players.length === 0 ) {
                    this.opponent = false;
                }

                break;
            }
        }
    }

    requestOpponent ( opponentIdentifier ) {
        this.opponent = opponentIdentifier;
    }

    maybeStart() {
        if( this.players.length === this.numPlayers ) {
            this.state = 'running';

            this.getMoves();
        }
    }

    sendToPlayers ( eventName ) {
        for( let i = 0; i < this.players.length; i = i + 1 ) {
            this.players[ i ].emit( eventName );
        }
    }

    getMoves() {
        this.sendToPlayers( 'send-move' );
    }

    checkFinished (){
        if ( this.moves.length !== 2 ) {
            return false;
        }

        this.isFinished();
    }

    addMove ( player, move ) {
        this.moves.push( {
            player: player,
            move: move,
        } );

        this.checkFinished();
    }

    isFinished (){
        this.state = 'finished';

        if (
            this.moves[ 0 ].move === 'rock' && this.moves[ 1 ].move === 'scissors' ||
            this.moves[ 0 ].move === 'scissors' && this.moves[ 1 ].move === 'paper' ||
            this.moves[ 0 ].move === 'paper' && this.moves[ 1 ].move === 'rock'
            )
        {
            this.winner = this.moves[ 0 ].player;
        } else if ( this.moves[ 0 ].move === this.moves[ 1 ].move ) {
            this.winner = 'draw';
        } else {
            this.winner = this.moves[ 1 ].player;
        }

        for ( let i = 0; i < this.players.length; i = i + 1 ) {
            if ( this.winner === 'draw' ) {
                this.players[ i ].emit( 'game-ended', { result: 'draw' } );

                continue;
            }

            if ( this.winner == this.players[ i ].id ) {
                this.players[ i ].emit( 'game-ended', { result: 'win' } );
            } else {
                this.players[ i ].emit( 'game-ended', { result: 'loss' } );
            }
        }

        return true;
    }
}

module.exports = RockPaperScissors;
