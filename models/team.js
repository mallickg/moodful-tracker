const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Config = new Schema({
    teams: Array
});

Config.plugin(passportLocalMongoose);

module.exports = mongoose.model('configs', Config);
