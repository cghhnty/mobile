var fs = require('fs');
var url = require('url');
var jsonRpc = require(BASE + '/lib/jsonRpc');
var conf = require(BASE + '/conf');
var serviceConf = require(BASE + '/module/taiji.conf');

if (conf.taiji.ca)
	conf.taiji.ca = fs.readFileSync(conf.taiji.ca);


var taiji = {};
for (var serviceName in serviceConf) {
	var methodConf = serviceConf[serviceName];
	taiji[serviceName] = createService(serviceName, methodConf);
}
function createService(serviceName, methodConf) {
	var opts = url.parse(conf.taiji.url + '/' + serviceName);
	//console.log(opts);
	/*{
		protocol: 'http:',
			slashes: true,
		auth: null,
		host: '10.7.111.46:8080',
		port: '8080',
		hostname: '10.7.111.46',
		hash: null,
		search: null,
		query: null,
		pathname: '/taiji/rpc/product',
		path: '/taiji/rpc/product',
		href: 'http://10.7.111.46:8080/taiji/rpc/product'}*/
		if (conf.taiji.ca)
		opts.ca = conf.taiji.ca;
	if (conf.taiji.secureProtocol)
		opts.secureProtocol = conf.taiji.secureProtocol;
	if (conf.taiji.rejectUnauthorized == false)
		opts.rejectUnauthorized = false;

	var service = jsonRpc(opts);

	var methods = {};

	for (var method in methodConf) {
		methods[method] = (function(method) {
			return function(tjCtx) {
				var params = Array.prototype.slice.call(arguments);
				if (params[params.length - 1] && params[params.length - 1].constructor == Function)
					var cb = params.pop();
				else
					var cb = function() {};

				var ctx = params.pop();

				tjCtx.headers = {
					accountUsername: conf.taiji.accountUsername,
					accountPassword: conf.taiji.accountPassword
				};

				service(method, params, function(err, result) {
					if (!err)
						return cb(err, result);

					if (err.constructor == Error) { // node internal error
						return cb(error('INTERROR', err.message, ctx));
					} else { // taiji service error
						var e = error('TJ' + err.code); // translate error message
						if (e.code == e.message)
							e.message = err.message?err.message:error('TAIJIBACK').message;
						return cb(e);
					}
				});
			};
		})(method);
	}

	return methods;
}

module.exports = taiji;
