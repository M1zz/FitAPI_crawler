var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApiKeySet = new Schema({
	jawboneAccessToken: String,
	fitbitAccessToken: String,
	googlefitAccessToken: String
});

module.exports = mongoose.model('api_key_set', ApiKeySet);