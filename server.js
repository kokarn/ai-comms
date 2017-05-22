const path = require( 'path' );
const http = require( 'http' );
const util = require( 'util' );

const express = require( 'express' )
const socketio = require( 'socket.io' );

const nano = require( 'nano' )( 'http://localhost:5984' );
const app = express();
const server = http.createServer( app );
const io = socketio( server );

const db = nano.use( 'games' );
app.use( express.static( path.join( __dirname, 'web' ) ) );

const connections = [];

io.on( 'connection', ( client ) => {
    connections.push( client.id );

    client.on( 'event', ( data ) => {
        console.log( `got ${ data }` );
    } );

    client.on( 'disconnect', ( something ) => {
        console.log( 'Client disconnected' );

        connections.splice( connections.indexOf( client.id ), 1 );
    } );
} );

server.listen( 3000, () => {
    console.log( `Server up and running on 3000` );
} );
