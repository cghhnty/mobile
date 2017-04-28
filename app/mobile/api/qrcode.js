var cp = require('child_process');
var notModified = require('not-modified');

module.exports = function(req, res, ctx) {
	var args = ['-o', '-', '-s', req.query.s || 9, req.query.text];

	notModified.ex(req, res, null, args, function(err, notmod) {
		if (err) {
			res.statusCode = 500;
			return res.end();
		}

		if (notmod) {
			return res.end();
		} else {
			res.setHeader('Content-Type', 'image/png');
			var qrcode = cp.spawn('qrencode', args, {stdio: [0, 'pipe', 2]});
			qrcode.stdout.pipe(res);			
		}
	});
};
