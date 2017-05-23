class RockPaperScissors {
    constructor (){
        this.moves = [];
        this.numPlayers = 2;
        this.players = [];
        this.state = 'waiting';
        this.type = 'simultaneous';
        this.winner = false;
        this.opponent = false;

        this.roundLimit = 50;
        this.rounds = 0;

        this.results = {};
    }

    addPlayer ( client ){
        this.players.push( client );

        console.log( `Player ${ client.id } joined a game of Rock Paper Scissors` );

        client.on( 'move', ( moveData ) => {
            this.addMove( client.id, moveData );
        } );

        this.results[ client.id ] = {
            draws: 0,
            losses: 0,
            wins: 0,
        };

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

                delete this.results[ clientId ];

                break;
            }
        }
    }

    requestOpponent ( opponentIdentifier ) {
        this.opponent = opponentIdentifier;
    }

    maybeStart() {
        if( this.players.length === this.numPlayers ) {
            this.start();
        }
    }

    restart () {
        this.moves = [];

        this.start();
    }

    start () {
        this.state = 'running';

        this.getMoves();
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

        this.roundFinished();
    }

    addMove ( player, move ) {
        this.moves.push( {
            player: player,
            move: move,
        } );

        this.checkFinished();
    }

    roundFinished (){
        if (
            this.moves[ 0 ].move === 'rock' && this.moves[ 1 ].move === 'scissors' ||
            this.moves[ 0 ].move === 'scissors' && this.moves[ 1 ].move === 'paper' ||
            this.moves[ 0 ].move === 'paper' && this.moves[ 1 ].move === 'rock'
            )
        {
            this.winner = this.moves[ 0 ].player;

            this.results[ this.moves[ 0 ].player ].wins = this.results[ this.moves[ 0 ].player ].wins + 1;
            this.results[ this.moves[ 1 ].player ].losses = this.results[ this.moves[ 1 ].player ].losses + 1;
        } else if ( this.moves[ 0 ].move === this.moves[ 1 ].move ) {
            this.winner = 'draw';

            this.results[ this.moves[ 0 ].player ].draws = this.results[ this.moves[ 0 ].player ].draws + 1;
            this.results[ this.moves[ 1 ].player ].draws = this.results[ this.moves[ 1 ].player ].draws + 1;
        } else {
            this.winner = this.moves[ 1 ].player;

            this.results[ this.moves[ 1 ].player ].wins = this.results[ this.moves[ 1 ].player ].wins + 1;
            this.results[ this.moves[ 0 ].player ].losses = this.results[ this.moves[ 0 ].player ].losses + 1;
        }

        for ( let i = 0; i < this.players.length; i = i + 1 ) {
            if ( this.winner === 'draw' ) {
                this.players[ i ].emit( 'round-ended', { result: 'draw' } );

                continue;
            }

            if ( this.winner == this.players[ i ].id ) {
                this.players[ i ].emit( 'round-ended', { result: 'win' } );
            } else {
                this.players[ i ].emit( 'round-ended', { result: 'loss' } );
            }
        }

        this.rounds = this.rounds + 1;

        if ( this.rounds >= this.roundLimit ) {
            this.gameFinished();
        } else {
            this.restart();
        }

        return true;
    }

    gameFinished () {
        this.state = 'finished';

        for ( let i = 0; i < this.players.length; i = i + 1 ) {
            this.players[ i ].removeAllListeners( 'move' );

            this.players[ i ].emit( 'game-ended', this.results[ this.players[ i ].id ] );
        }

        return true;
    }
}

module.exports = RockPaperScissors;
