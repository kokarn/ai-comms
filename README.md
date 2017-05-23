# AI comms

This is a simple implementation of a websocket backend that connects basic game AIs.


### Websocket Implementations
[Java](https://github.com/socketio/socket.io-client-java)

[C++](https://github.com/socketio/socket.io-client-cpp)

[Swift](https://github.com/socketio/socket.io-client-swift)


### Websocket events

To join a game, emit the `join-game` event.
You should pass in an object with what game you want to play.
```javascript
{
    type: 'RockPaperScissors'
}
```
You are then placed in a queue.
You will then get an event called `send-move`.
This is your instruction to send your move.

Then you should send a `move` event with your move as payload.
```javascript
'paper'
```

You will then get a `game-ended` event with the result.
