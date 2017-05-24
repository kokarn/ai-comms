const socket = require( 'socket.io-client' )( 'ws://localhost:3000/' );

const joinGame = function joinGame(){
    socket.emit(
        'join-game',
        {
            type: 'RockPaperScissors',
            queue: false,
        }
    );
};

socket.on( 'connect', () => {
    console.log( `Connected to socket server as ${ socket.id }` );
    joinGame();
} );

socket.on( 'send-move', () => {
    socket.emit( 'move', 'paper' );
} );

socket.on( 'game-ended', ( gameData ) => {
    console.log( gameData );
} );

socket.on( 'disconnect', () => {
    console.log( 'Disconnected from socket server' );
} );
