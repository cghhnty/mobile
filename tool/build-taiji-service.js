/*
usage: 
node build-taiji-service
*/

require('./init')();

var url = 'http://postest.lakala.com.cn/taiji/rpc/ls';
var filename = BASE + '/module/taiji.conf.json';

var http = require('http');
var fs = require('fs');

var req = http.request(url, function(res) {
	var body = new Buffer(0);
	
	res.on('data', function(chunk) {
		body = Buffer.concat([body, chunk]);
	});

	res.on('end', function() {
        body = body.toString();
		var json = JSON.parse(body);
		var conf = {};
		json.forEach(function(service) {
			var serviceName = service.serviceName.split('.').pop().slice(0, -7).toLowerCase();
			var srv = conf[serviceName] = {};
			service.methods.forEach(function(method) {
				var mth = srv[method.methodName] = [];
				method.parameters.forEach(function(param) {
					mth.push(param.paramName);
				});
			});
		});

		var data = JSON.stringify(conf, null, '\t');

		fs.writeFile(filename, data, function(err) {
			if (err)
				console.error(err);
		});
	});
});

req.on('error', function(e) {
	console.error(e);
});

req.end();
