var express = require('express');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');

// models
let History = require('./models/history');
let Event = require('./models/event');

// connecting with mongo db
var connect = require("./database/dbconnect");

// setting up port
const route = require('./routes/route');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'mean_stack_game')));
app.use('/api', route);

// create port
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('App listening on port ' + port);
})

// error handler
app.use((req, res, next) => {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});


/*** SOCKETS ***/
var io = require("socket.io")(server);

var position = {
    x: 200,
    y: 200
};

io.on('connection', (socket) => {
    /*** GENERAL ***/
    // default username
    socket.username = "Anonymous";

    console.log('new user connected');
    new Event({
        type: "CONNECT",
        date: Date.now(),
        time: Date.now(),
        user: socket.username
    }).save();  
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
        new Event({
            type: "DISCONNECT",
            date: Date.now(),
            time: Date.now(),
            user: socket.username
        }).save();
    });

    /*** CHAT ***/
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