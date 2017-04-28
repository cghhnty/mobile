var http = require('http');
var url = require('url');
var mime = require(BASE + '/lib/mime');

module.exports = {
	uploadImage: function(data, type, ctx, cb) {
		var opts = url.parse(conf.file.url + '/image/upload/' + type);
		opts.method = 'POST';
		var req = http.request(opts, function(res) {
			var body = new Buffer(0);
			res.on('data', function(chunk) {
				body = Buffer.concat([body, chunk]);
			});
			res.on('end', function() {
                body = body.toString();
				if (res.statusCode == 200) {
					var result = JSON.parse(body);
					cb(null, result);
				} else {
					cb(error('INTERROR', 'upload image failed. code: ' + res.statusCode + '; response: ' + body, ctx));
				}
			});
		});

		req.on('error', function(err) {
			cb(error('INTERROR', err, ctx));
		});

		if (data.constructor == Buffer) {
			req.write(buf);
			req.end();
		} else {
			data.pipe(req);
		}
	}
};
