const socket = require( 'socket.io-client' )( 'ws://localhost:3000/' );

const moves = [
    'rock',
    'paper',
    'scissors',
];

let move = false;

let gamesPlayed = 0;

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
    console.log( `Connected to socket server as ${ socket.id }` );

    joinGame();
} );

socket.on( 'send-move', ( data ) => {
    move = moves[ getRandomIntInclusive( 0, 2 ) ];
    socket.emit( 'move', move );
} );

socket.on( 'game-ended', ( gameData ) => {
    // console.log( gameData.result, move );
    gamesPlayed = gamesPlayed + 1;

    joinGame();
} );

socket.on( 'disconnect', () => {
    console.log( 'Disconnected from socket server' );
} );

function exitHandler( options, err ) {
    console.log( `Played ${ gamesPlayed } games` );

    process.exit();
}

//do something when app is closing
process.on( 'exit', exitHandler.bind( null ) );

//catches ctrl+c event
process.on( 'SIGINT', exitHandler.bind( null ) );
