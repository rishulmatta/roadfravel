var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	local: {
		username: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String,
		gender: String,
		profileUrl:String,
		profilePicUrl:String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});



module.exports = mongoose.model('User', userSchema);