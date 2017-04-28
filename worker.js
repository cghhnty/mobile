var cluster = require('cluster');
var fs = require('fs');

error = require(BASE + '/lib/error');
require(BASE + '/error/zh-CN');
require(BASE + '/error/error-log');

var domain = require('domain');
var http = require('http');
var jate = require(DEBUG ? 'jate/jate.esprima' : 'jate');
jate.usecache = !DEBUG;
appdir = require(BASE + '/framework/appdir');

var listener = require(BASE + '/listener');

server = http.createServer(function(req, res) {
	var dm = domain.create();
	dm.on('error', function(err){
		try {
			// make sure we close down within 30 seconds
			var killtimer = setTimeout(function() {
				process.exit(1);
			}, 30000);
			// But don't keep the process open just for that!
			killtimer.unref();

			// Let the master know we're dead. This will trigger a
			// 'disconnect' in the cluster master, and then it will fork
			// a new worker.
			cluster.worker.disconnect();

			// stop taking new requests.
			server.close();

			// try to send an error to the request that triggered the problem
			error.log("mobie/worker: system err: ");
			error('INTERROR', err.stack, req.ctx);
			res.statusCode = 500;
			return res.end();
		} catch (e) {
			error.log(e);
		}
	});

	dm.add(req);
	dm.add(res);

	dm.run(function() {
		listener(req, res);
	});
});

var redis = require('redis');
red = redis.createClient(conf.redis.port, conf.redis.host, conf.redis.options);

if (typeof conf.redis.dbIndex != 'undefined') {
    red.select(conf.redis.dbIndex);
}
taiji = require(BASE + '/module/taiji');
sms = require(BASE + '/module/sms');
file = require(BASE + '/module/file');
log = require(BASE + '/lib/log')();
/*queue = require('amqplib').connect(conf.queue.address).then(function (conn) {
    conn.createChannel().then(function(ch){
        amqpChannel = ch;
    });
});*/

model = {};
fs.readdirSync(BASE + '/model').forEach(function(file) {
	model[file.slice(0, -3)] = require(BASE + '/model/' + file);
});

server.listen(conf.port);
