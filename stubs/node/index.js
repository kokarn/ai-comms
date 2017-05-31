const socket = require( 'socket.io-client' )( 'ws://localhost:3000/' );

const joinGame = function joinGame(){
    socket.emit(
        'join-game',
        {
            type: 'RockPaperScissors',
            queue: false,
        }
    );
    console.log( 'Joining game' );
};

socket.on( 'connect', () => {
    console.log( `Connected to socket server as ${ socket.id }` );
    joinGame();
} );

socket.on( 'send-move', () => {
    socket.emit( 'move', 'paper' );
} );

socket.on( 'round-ended', ( data ) => {
    console.log( JSON.stringify( data, null, 4 ) );
} );

socket.on( 'game-ended', ( gameData ) => {
    console.log( 'Game done!' );
    console.log( JSON.stringify( gameData, null, 4 ) );
} );

socket.on( 'disconnect', () => {
    console.log( 'Disconnected from socket server' );
} );
