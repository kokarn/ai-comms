const path = require( 'path' );
const http = require( 'http' );
const util = require( 'util' );

const express = require( 'express' )
const socketio = require( 'socket.io' );

const games = require( './games' );
const nano = require( 'nano' )( 'http://localhost:5984' );
const app = express();
const server = http.createServer( app );
const io = socketio( server );

const db = nano.use( 'games' );
app.use( express.static( path.join( __dirname, 'web' ) ) );

const connections = [];
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
                finishedGames[ gameType ].push( runningGames[ gameType ].splice( i, 1 ) );
            }
        }
    }
};

io.on( 'connection', ( client ) => {
    connections.push( client.id );

    console.log( 'client connected' );

    io.emit( 'connections', connections.length );

    client.on( 'event', ( data ) => {
        console.log( `got ${ data }` );
    } );

    client.on( 'join-game', ( gameConfig ) => {
        if( !games[ gameConfig.type ] ) {
            return false;
        }

        checkGames();

        if ( waitingGames[ gameConfig.type ].length === 0 ) {
            waitingGames[ gameConfig.type ].push( new games[ gameConfig.type ] );
        }

        waitingGames[ gameConfig.type ][ 0 ].addPlayer( client );
        client.game = waitingGames[ gameConfig.type ][ 0 ];

        checkGames();
    } );

    client.on( 'disconnect', ( something ) => {
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

        connections.splice( connections.indexOf( client.id ), 1 );
    } );
} );

server.listen( 3000, () => {
    console.log( `Server up and running on 3000` );
} );
