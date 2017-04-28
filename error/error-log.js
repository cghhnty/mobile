var yalt = require('yalt');
var util = require('util');

yalt('error-log', {
	'INTERROR': function(err, ctx) {
		return (ctx ? '[' + ctx.remoteAddress + ' ' + ctx.req.method + ' ' + ctx.url + '] ' : '') + (err.constructor == String ? err : util.inspect(err));
	}
});
