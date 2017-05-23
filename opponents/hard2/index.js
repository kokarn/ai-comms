const socket = require( 'socket.io-client' )( 'ws://localhost:3000/' );

const moves = [
    'rock',
    'paper',
    'scissors',
];

let moveIndex = false;

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

    moveIndex = getRandomIntInclusive( 0, 2 );
    joinGame();
} );

socket.on( 'send-move', ( data ) => {
    socket.emit( 'move', moves[ moveIndex ] );
} );

socket.on( 'game-ended', ( gameData ) => {
    // console.log( gameData.result, moveIndex );
    gamesPlayed = gamesPlayed + 1;

    if ( gameData.result === 'win' ) {
        moveIndex = moveIndex - 1 % 3;
    } else if ( gameData.result === 'loss' ) {
        moveIndex = moveIndex + 1 % 3;
    }

    moveIndex = moveIndex + 1 % 3;

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
