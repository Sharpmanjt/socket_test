const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

server = app.listen(3000);

const io = require("socket.io")(server)

var position = {
    x: 200,
    y: 200
};

io.on('connection', (socket) => {
    /*** GENERAL ***/
    console.log('new user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    /*** CHAT ***/
    // default username
    socket.username = "Anonymous";
    // listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })
    // listen on new_message
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', { message: data.message, username: socket.username });
    })
    // listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })

    /*** GAME ***/
    socket.emit("position", position);
    socket.on("move", data => {
        switch(data) {
            case "left":
                position.x -= 5;
                io.emit("position", position);
                break;
            case "right":
                position.x += 5;
                io.emit("position", position);
                break;
            case "up":
                position.y -= 5;
                io.emit("position", position);
                break;
            case "down":
                position.y += 5;
                io.emit("position", position);
                break;
        }
    }); 
});