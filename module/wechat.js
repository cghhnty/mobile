var simpleWechat = require('simple-wechat');
var WechatTokenStore = require('./WechatTokenStore');

var wechat = {};

wechat.Response = function(req, res, token, cb) {
	return new simpleWechat.Response(req, res, token, cb);
};

wechat.Api = function(appId, appSecret, ctx) {
	this.ctx = ctx;
	this.appId = appId;
	this.appSecret = appSecret;
	var _store = new WechatTokenStore(appId);
	var store = {
		get: function(key, cb) {
			_store.get(key, function(err, result) {
				if (err)
					return cb(error('INTERROR', err, ctx));
				return cb(null, result);
			});
		},

		set: function(key, value, expire) {
			_store.set(key, value, expire);
		},

		lock: function(key, cb) {
			_store.lock(key, cb);
		}
	};

	this.api = new simpleWechat.Api(appId, appSecret, store);
	this.url = this.api.url;
};

['request', 'get', 'post', 'jsApiSign'].forEach(function(method) {
	wechat.Api.prototype[method] = function() {
		var me = this;
		var args = Array.prototype.slice.call(arguments);
		var cb = args[args.length - 1];
		if (!cb || cb.constructor != Function) {
			cb = function() {};
			args.push(cb);
		}

		args[args.length - 1] = function(err, result) {
			if (!err)
				return cb(err, result);

			if (err.errcode != undefined) { // wechat error
				var e = error('WX' + err.errcode); // translate error message
				if (e.code == e.message)
					e.message = err.errmsg;
				return cb(e);
			} else { // node internal error
				error.log("module/wechat: WeChat return result failure: ");
				return cb(error('INTERROR', err, me.ctx));
			}
		};

		return this.api[method].apply(this.api, args);
	};
});

module.exports = wechat;
