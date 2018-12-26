var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); // To encrypt the password and store in db.

mongoose.connect('mongodb://localhost:<port>/nodeauth'); // Give the mongo db connection string.

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage:{
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema); // Export the moongoose schema so that it can be used in
// external js files using 'User'.

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	callback(null, isMatch);
	});
}

module.exports.createUser = function(newUser, callback){
	// Refer https://www.npmjs.com/package/bcryptjs for usage.
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
   			newUser.password = hash; // Replace the password with hashed value.
   			newUser.save(callback); // Persist the user obj, mongoose will map the variables to the schema.
    	});
	});
}