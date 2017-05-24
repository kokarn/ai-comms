const path = require( 'path' );
const http = require( 'http' );
const util = require( 'util' );

const express = require( 'express' )
const socketio = require( 'socket.io' );

const games = require( './games' );
// const nano = require( 'nano' )( 'http://localhost:5984' );
const app = express();
const server = http.createServer( app );
const io = socketio( server );

// const db = nano.use( 'games' );
app.use( express.static( path.join( __dirname, 'web' ) ) );

const connections = {};
const finishedGames = {};
const runningGames = {};
const waitingGames = {};

Object.keys( games ).forEach( ( gameType ) => {
    waitingGames[ gameType ] = [];
    runningGames[ gameType ] = [];
    finishedGames[ gameType ] = [];
} );

const checkGames = function checkGames(){
    for ( const gameType in waitingGames ) {
        for ( let i = 0; i < waitingGames[ gameType ].length; i = i + 1 ) {
            if ( waitingGames[ gameType ][ i ].state !== 'waiting' ){
                runningGames[ gameType ].push( waitingGames[ gameType ].splice( i, 1 ) );
            }
        }
    }

    for ( const gameType in runningGames ) {
        for ( let i = 0; i < runningGames[ gameType ].length; i = i + 1 ) {
            if ( runningGames[ gameType ][ i ].state !== 'running' ){
                // finishedGames[ gameType ].push( runningGames[ gameType ].splice( i, 1 ) );
                runningGames[ gameType ].splice( i, 1 );
            }
        }
    }
};

const findGame = function findGame( gameType, client, requiredOpponent ){
    if ( waitingGames[ gameType ].length <= 0 ) {
        return false;
    }

    for ( let i = 0; i < waitingGames[ gameType ].length; i = i + 1 ) {
        let currentGame = waitingGames[ gameType ][ i ];

        // If we have a game with no players, use that
        if ( currentGame.players.length < 1 ) {
            if ( requiredOpponent ) {
                currentGame.requestOpponent( requiredOpponent );
            }

            return currentGame;
        }

        // If we have a game with an opponent as this client id, use that
        if ( currentGame.opponent === client.id ) {
            return currentGame;
        }

        // Check if one of the games has a player defined as this requiredOpponent without another defined opponent
        if ( !currentGame.opponent && requiredOpponent ) {
            for ( let playerIndex = 0; playerIndex < currentGame.players.length; playerIndex = playerIndex + 1 ) {
                if ( currentGame.players[ playerIndex ].id === requiredOpponent ) {
                    return currentGame;
                }
            }

            return currentGame;
        }
    }

    return false;
};

io.on( 'connection', ( client ) => {
    connections[ client.id ] = client.id;

    console.log( `Client ${ client.id } connected` );

    io.emit( 'connections', connections.length );

    client.on( 'event', ( data ) => {
        console.log( `got ${ data }` );
    } );

    client.on( 'identifier', ( identifier ) => {
        connections[ identifier ] = client.id;
    } );

    client.on( 'join-game', ( gameConfig ) => {
        if( !games[ gameConfig.type ] ) {
            return false;
        }

        checkGames();

        let game = findGame( gameConfig.type, client, connections[ gameConfig.opponent ] || gameConfig.opponent );

        if ( !game ) {
            game = new games[ gameConfig.type ];

            if ( gameConfig.opponent ) {
                game.requestOpponent( connections[ gameConfig.opponent ] || gameConfig.opponent );
            }

            waitingGames[ gameConfig.type ].push( game );
        }

        game.addPlayer( client );

        checkGames();
    } );

    client.on( 'disconnect', () => {
        console.log( `Client ${ client.id } disconnected` );

        for ( const gameType in runningGames ) {
            for ( let i = 0; i < runningGames[ gameType ].length; i = i + 1 ) {
                runningGames[ gameType ][ i ].removePlayer( client.id );
            }
        }

        for ( const gameType in waitingGames ) {
            for ( let i = 0; i < waitingGames[ gameType ].length; i = i + 1 ) {
                waitingGames[ gameType ][ i ].removePlayer( client.id );
            }
        }

        checkGames();

        delete connections[ client.id ];

        for ( const identifier in connections ) {
            if ( connections[ identifier ] === client.id ) {
                delete connections[ identifier ];
            }
        }
    } );
} );

server.listen( 3000, () => {
    console.log( `Server up and running on 3000` );
} );
