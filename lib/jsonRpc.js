var http = require('http');
var https = require('https');

module.exports = function(opts) {
	var _http = opts.protocol == 'http:' ? http : https;
	opts.method = 'POST';

	return function(method, params, cb) {
		var data = JSON.stringify({
			id: Date.now(),
			method: method,
			params: params
		});

		opts.headers = {
			'Content-Length': Buffer.byteLength(data)
		};

		var req = _http.request(opts, function(res) {
			var body = new Buffer(0);

			res.on('data', function(chunk) {
				body = Buffer.concat([body, chunk]);
			});

			res.on('end', function() {
                body = body.toString();
				try{
					var data = JSON.parse(body);
				}catch(err){
					log.log(err);
					return cb({code:"000001",message:"解析TJ返回数据失败"});
				}
				if (data.error){
					return cb(data.error);
				}else{
					if(data.result){
						// 针对taiji后台，如果返回结果是ServiceResult对象且returnCode存在
						if(data.result.returnCode&&data.result.returnCode!='000000'){
							var err = {code:data.result.returnCode,message:data.result.returnMsg}
							return cb(err);
						}
					}
					return cb(null, data.result);
				}
			});
		});

		req.on('error', function(e) {
			cb(e);
		});
		log.log('lib/jsonRpc：post to taiji data: ',data);
		req.write(data);
		req.end();
	};
};
