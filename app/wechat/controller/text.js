var APP = appdir(__dirname);
var keywordsHandler = require(APP + '/func/keywordsHandler');

module.exports = function(req, res, ctx) {
	//keywordsHandler(ctx.message.Content, ctx);
	res.end();
};
