var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bpmSchema = new Schema({
    date: { type: Date, default: Date.now },
    bpm: Number
});

module.exports = mongoose.model("BpmModel", bpmSchema);
