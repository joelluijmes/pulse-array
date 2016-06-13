var mongoose = require('mongoose');
var BpmModel = require('./bpm');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    bpms: [BpmModel.schema],
    username: String,
    deviceId: Number
});

module.exports = mongoose.model("UserModel", userSchema);
