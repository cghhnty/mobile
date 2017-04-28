var http = require('http');
var url = require('url');

/*
sms.send({
  to: '13812345678',
  template: 'templateId',
  vars: {...},
  user: storeId // opt. 系统短信不需要填写
}, ctx, cb)
*/

module.exports = {
	send: function(data, ctx, cb) {
		data.key = conf.sms.key;
		data = JSON.stringify(data);

		var reqOpts = url.parse(conf.sms.url + '/send');
		reqOpts.method = 'POST';
		reqOpts.headers = {
			'Content-Length': Buffer.byteLength(data),
			'Content-Type': 'application/json'
		};

		var req = http.request(reqOpts, function(res) {

			
			var data = new Buffer(0);

			res.on('data', function(chunk) {
				data = Buffer.concat([data, chunk]);
			});
            
			res.on('end', function() {
				// console.log(data);
                data = data.toString();


				if(res.statusCode == 200){
					var dataEx = JSON.parse(data);

				if (dataEx.error){
					return cb(error('INTERROR', dataEx.error, ctx));
				}
					
				else
					return cb(null, dataEx.result);
				}
				else  cb(error('JGG8SUM4'));
				
			});
		});

		req.on('error', function(err) {
			cb(error('INTERROR', err, ctx));
		});

		req.write(data);
		req.end();
	}
};
