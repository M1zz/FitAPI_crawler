var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExtradayWalk = new Schema({
	refAccessToken	: Schema.ObjectId,
	extradayWalk	: Array
});

module.exports = mongoose.model('extraday_walk', ExtradayWalk);
