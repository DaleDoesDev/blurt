const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    secretKey: String,
    keyExpiration: Number,
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //adds username & pw to the schema. The username must be unique. 

module.exports = mongoose.model('User', UserSchema);