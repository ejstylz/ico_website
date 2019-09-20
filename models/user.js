const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: String,
	email: String,
	password: String,
	tokenAddress: String,
	tokensOwned: { type: Number, default: 0 },
	withdrawalStatus: { type: String, default: "Inactive" },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	referrer: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
