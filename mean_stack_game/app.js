var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;
var HISTORY_COLLECTION = "history";
var EVENTS_COLLECTION = "events";
var SCORES_COLLECTION = "scores";

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// var distDir = __dirname + "/dist/";
// app.use(express.static(distDir));

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://admin:admin@aliens-shard-00-00-eukpc.mongodb.net:27017,aliens-shard-00-01-eukpc.mongodb.net:27017,aliens-shard-00-02-eukpc.mongodb.net:27017/test?ssl=true&replicaSet=aliens-shard-0&authSource=admin&retryWrites=true&w=majority", { useUnifiedTopology: true }, function (err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = client.db();
    console.log("Database connection ready");
})

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});   

/*** ROUTES ***/
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}
// get a list of all chat/game history
app.get("/api/history", function(req, res) {
    db.collection(HISTORY_COLLECTION).find({}).toArray(function(err, docs){
        if (err) {
            handleError(res, err.message, "Failed to get history.");
        } else {
            res.status(200).json(docs);
        }
    })
})
// get a list of chat/game history by room name
app.get("/api/roomhistory", function(req, res) {
    db.collection(HISTORY_COLLECTION).find({room: req.params.room}).toArray(function(err, docs){
        if (err) {
            handleError(res, err.message, "Failed to get history.");
        } else {
            res.status(200).json(docs);
        }
    })
})
// get a list of all events
app.get("/api/eventlog", function(req, res) {
    db.collection(EVENTS_COLLECTION).find({}).toArray(function(err, docs){
        if (err) {
            handleError(res, err.message, "Failed to get events.");
        } else {
            res.status(200).json(docs);
        }
    })
})


/*** SOCKETS ***/
var io = require("socket.io")(server);

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