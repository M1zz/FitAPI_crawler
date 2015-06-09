var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApiKeySet = new Schema({
	jawboneAccessToken: Array,
	fitbitAccessToken: Array,
	googlefitAccessToken: Array
});

module.exports = mongoose.model('api_key_set', ApiKeySet);
