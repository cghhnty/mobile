var router = require(BASE + '/router');
var cryptoCookie = require('crypto-cookie');
var _404 = require(BASE + '/error/404');
var  fs =require('fs');

module.exports = function(req, res) {
	var ctx = {
		req: req,
		res: res,
		remoteAddress: req.connection.remoteAddress == '127.0.0.1' ? req.headers['x-real-ip'] || req.connection.remoteAddress : req.connection.remoteAddress,
		url: conf.protocol + '://' + req.headers.host + req.url,
		json: function(json) {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(json));
		},
		jsonback: function(err, result) {
			ctx.json({error: err, result: result});
		},
		toJson: function(obj) {
			res.setHeader('Content-Type', 'application/json;charset=utf-8');
			res.end(JSON.stringify(obj));
		},
		toHtml: function(html) {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(html);
		}
	};

	ctx.cookie = new cryptoCookie(req, res, {
		algorithm: 'aes-256-cbc',
		ivSize: 128,
		keys: conf.keys
	});

	req.cookies = ctx.cookie.reqCookies;
	req.cookie = ctx.cookie.get.bind(ctx.cookie);
	res.cookie = ctx.cookie.set.bind(ctx.cookie);

	res.json = ctx.json;
     //过滤掉页面传来的 /favicon.ico请求
	if(req.url=='/favicon.ico'){
		return res.end();
	}
	if(req.url=='/'){
		var realPath = JADEdir +'/app/index.html';
		var html = fs.readFileSync(realPath);
		res.end(html);
		return;
	}

	var route = router(req,res);
	if (route) {
		ctx.app = route.app;
		ctx.apps = route.apps;
		ctx.query = req.query = route.query;
		ctx.pathInfo = route.pathInfo;

		var app = require(BASE + '/' + route.path);

		var contentType = req.headers['content-type'];
		// charset maybe append
		if (contentType && contentType.indexOf('application/json') != -1) {
			var body = new Buffer(0);

			req.on('data', function(chunk) {
				body = Buffer.concat([body, chunk]);
			});

			req.on('end', function() {
				try {
					ctx.body = req.body = JSON.parse(body.toString());
				} catch (e) {
					ctx.body = req.body = {};
				}
				app(req, res, ctx);
			});
		} else {
			ctx.body = req.body = {};
			app(req, res, ctx);
		}
	} else {
		return _404(req, res, ctx,'path');
	}
};
