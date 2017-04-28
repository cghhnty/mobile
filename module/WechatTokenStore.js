function WechatTokenStore(appId) {
	this.appId = appId;
}

WechatTokenStore.prototype = {
	get: function(key, cb) {
		var me = this;

		red.get(me.appId + ':' + key, function(err, result) {
			if (err)
				return cb(err);

			if (result) {
				return cb(null, JSON.parse(result));
			} else {
				red.get(me.appId + ':' + key + ':lock', function(err, result) {
					if (err)
						return cb(err);

					if (result) { // 并发请求已经在获取accessToken/jsapiTicket
						setTimeout(function() { // 延时1秒钟等并发请求获取到accessToken/jsapiTicket后, 获取结果
							me.get(key, cb);
						}, 1000);
						return;
					} else {
						// 并发请求可能已经更新了值, 重新获取一次
						red.get(me.appId + ':' + key, function(err, result) {
							if (err)
								return cb(err);
							return cb(null, JSON.parse(result));
						});
					}
				});				
			}
		});
	},

	set: function(key, value, expire) {
		var me = this;
		red.set(me.appId + ':' + key, JSON.stringify(value), 'EX', expire);
		red.del(me.appId + ':' + key + ':lock');
	},

	lock: function(key, cb) {
		var me = this;
		red.set(me.appId + ':' + key + ':lock', 1, 'EX', 10, 'NX', cb);
	}
};

module.exports = WechatTokenStore;
