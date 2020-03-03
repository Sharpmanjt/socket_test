const express = require('express');
const app = express();
const route = express.Router();

// models
let History = require('../models/history');
let Event = require('../models/event');

route.route('/addhistory').post((req, res, next) => {
    History.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

route.route('/history').get((req, res) => {
    // get a list of all chat/game history
    History.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(data);
        }
    })
})

route.route('/roomhistory').get((req, res) => {
    // get a list of chat/game history by room name
    History.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(data);
        }
    })
})

route.route('/addevent').post((req, res, next) => {
    Event.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

route.route('/eventlog').get((req, res) => {
    // get a list of all events
    Event.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(data);
        }
    })
})

module.exports = route;

// module.exports = function(app) {
//     // get a list of all chat/game history
//     app.get("/api/history", function(req, res) {
//         History.find({}).toArray(function(err, docs){
//             if (err) {
//                 handleError(res, err.message, "Failed to get history.");
//             } else {
//                 res.status(200).json(docs);
//             }
//         })
//     })
//     // get a list of chat/game history by room name
//     app.get("/api/roomhistory", function(req, res) {
//         History.find({room: req.params.room}).toArray(function(err, docs){
//             if (err) {
//                 handleError(res, err.message, "Failed to get history.");
//             } else {
//                 res.status(200).json(docs);
//             }
//         })
//     })
//     // get a list of all events
//     app.get("/api/eventlog", function(req, res) {
//         Event.find({}).toArray(function(err, docs){
//             if (err) {
//                 handleError(res, err.message, "Failed to get events.");
//             } else {
//                 res.status(200).json(docs);
//             }
//         })
//     }) 
// }