const socket = require( 'socket.io-client' )( 'ws://192.168.205.117:3000/' );

const moves = [
    'rock',
    'paper',
    'scissors',
];

let move = false;

function getRandomIntInclusive( min, max ) {
    min = Math.ceil( min );
    max = Math.floor( max );

    return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function joinGame(){
    socket.emit(
        'join-game',
        {
            type: 'RockPaperScissors',
        }
    );
}

socket.on( 'connect', () => {
    console.log( 'Connected to socket server' );

    joinGame();
} );

socket.on( 'send-move', ( data ) => {
    move = moves[ getRandomIntInclusive( 0, 2 ) ];
    socket.emit( 'move', move );
} );

socket.on( 'game-ended', ( gameData ) => {
    console.log( gameData.result, move );

    joinGame();
} );

socket.on( 'disconnect', () => {
    console.log( 'Disconnected from socket server' );
} );
