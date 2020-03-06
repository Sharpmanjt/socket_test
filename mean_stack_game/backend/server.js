var express = require('express');
var path = require('path');
var cors = require('cors');
var bodyParser = require('body-parser');

// models
let History = require('./models/history');
let Event = require('./models/event');
let User = require('./models/user');
let Game = require('./models/game');

// connecting to database
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const url = 'mongodb://admin:admin@aliens-shard-00-00-eukpc.mongodb.net:27017,aliens-shard-00-01-eukpc.mongodb.net:27017,aliens-shard-00-02-eukpc.mongodb.net:27017/test?ssl=true&replicaSet=aliens-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.connect(url, { useNewUrlParser: true })
    .then(() => {
        console.log('Database successfully connected')
    }, error => {
        console.log('Database could not be connected: ' + error)
    }
)

// setting up port
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'mean_stack_game')));

// create port
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('App listening on port ' + port);
})

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

/*** API ROUTES ***/
app.get("/api/history", function(req, res) {
    History.find({}, function(err, docs) {
        if (err) {
          handleError(res, err.message, "Failed to get history.");
        } else {
          res.status(200).json(docs);
        }
    });
});

app.get("/api/eventlog", function(req, res) {
    Event.find({}, function(err, docs) {
        if (err) {
          handleError(res, err.message, "Failed to get event log.");
        } else {
          res.status(200).json(docs);
        }
    });
});

app.get("/api/topscores", function(req, res) {
    User.find({}, function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get top scores.");
        } else {
            res.status(200).json(docs);
        } 
    }).sort({topScore:-1}).limit(10);
})

app.get("/api/topusers", function(req, res) {
    User.find({}, function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get top users.");
        } else {
            res.status(200).json(docs);
        } 
    }).sort({numWins:-1}).limit(10);
})

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

/*** SOCKETS ***/
var io = require("socket.io")(server);

var position = {
    x: 230,
    y: 400
};

var oldposx
var oldposy
//GET POSITION FROM HERE THIS FILE 
io.on('connection', (socket) => {
    /*** GENERAL ***/
    // default username
    socket.username = "Anonymous";

    console.log('new user connected');
    new Event({
        type: "CONNECTION",
        date: Date.now(),
        time: Date.now(),
        user: socket.username
    }).save();  
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
        new Event({
            type: "DISCONNECTION",
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
        new History({
            player: socket.username,
            opponent: "player2",
            date: Date.now(),
            time: Date.now(),
            message: data.message
        }).save();
    })
    // listen on typing
    // socket.on('typing', (data) => {
    //     socket.broadcast.emit('typing', { username: socket.username })
    // })

    /*** GAME ***/
    socket.emit("position", {position, oldposx, oldposy});
    socket.on("move", data => {
        oldposx = position.x
        oldposy = position.y
        switch(data) {
            case "left":
                position.x -= 5;
                io.emit("position", {position, oldposx, oldposy});
                break;
            case "right":
                position.x += 5;
                io.emit("position", {position, oldposx, oldposy});
                break;
            case "up":
                position.y -= 5;
                io.emit("position", {position, oldposx, oldposy});
                break;
            case "down":
                position.y += 5;
                io.emit("position", {position, oldposx, oldposy});
                break;
            case "appear":
                io.emit("position", {position, oldposx, oldposy}); //POSITIONS SPACESHIP AT LAS POSITION RECORDED
                break;
        }
    }); 

    socket.on("shoot", data=>{
        io.emit("shoot",position);
    })
    
});