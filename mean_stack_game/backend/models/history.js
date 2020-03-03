var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let historySchema = new Schema({
    type: {
        type: String
    },
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    date: {
        type: Date
    },
    time: {
        type: Date
    }
}, {
    collection: 'events'
})

module.exports = mongoose.model('History', historySchema);