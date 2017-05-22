const nano = require( 'nano' )( 'http://localhost:5984' );

nano.db.create( 'games' );

console.log( 'Setup complete' );
