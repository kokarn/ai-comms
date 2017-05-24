# AI comms

This is a simple implementation of a websocket back-end that connects basic game AIs.
The back-end is running Socket.io so the websocket connection might not match the websocket specification 100%.

## Stubs

We've written some basic stubs that you can use for the initial connection to the websocket server.

[Java](./stubs/java)  
[Node.js](./stubs/node)  

There is also a very basic web implementation if you just want to try it out.  
It's running on the same host as the server, so just go to that IP in your browser.


### Socket.io Client Implementations
[Java](https://github.com/socketio/socket.io-client-java)  
[C++](https://github.com/socketio/socket.io-client-cpp)  
[Swift](https://github.com/socketio/socket.io-client-swift)


### Websocket events

To join a game, emit the `join-game` event.  
You should pass in an object with what game you want to play.

Example payload
```javascript
{
    type: 'RockPaperScissors'
}
```
You are then placed in a queue.  
As soon as another opponent connects to your game will you get an event called `send-move`.  
This is your instruction to send your move.  

Then you should send a `move` event with your move as payload.  
The move should be lowercase.  

Example payload
```javascript
'paper'
```

You will then get a `round-ended` event with the result for the round.  
You will then get a `game-ended` event with the result for the whole game.


### Running the server
cd into the `server` folder  
run `npm install`  
run `npm start`  


### Running the opponents
cd into the opponent folder you want to run  
run `npm install`  
run `npm start`
