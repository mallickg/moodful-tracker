const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
/*
const Account = new Schema({
	firstName: String,
    username: String,
    password: String,
    entries: Array
});


Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);*/


const AccountSchema = new Schema({
	firstName: String,
    username: String,
    password: String,
    entries: Array,
    team: String
    },
    { usePushEach: true }
);


AccountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model('accounts', AccountSchema);
module.exports = {Account};

