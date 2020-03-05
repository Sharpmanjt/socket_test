var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let historySchema = new Schema({
    player: {
        type: String
    },
    opponent: {
        type: String
    },
    date: {
        type: Date
    },
    time: {
        type: Date
    },
    message: {
        type: String
    }
}, {
    collection: 'history'
})

module.exports = mongoose.model('History', historySchema);