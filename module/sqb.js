/**
 * 收钱吧 rpc 接口合集
 * Created by Session on 15/10/9.
 */
var url = require('url');
var jsonRpc = require(BASE + '/lib/jsonRpc');
var serviceConf = require(BASE + '/module/sqb.conf');

var config = {
    development: {
        pointApi: {
            address: 'http://127.0.0.1:3433'
        },
        shouqianbaApi: {
            address: 'http://backend.dev.shouqianba.com/rpc'
        }
    },
    test: {
        pointApi: {
            address: 'http://121.41.41.54:3333'
        },
        shouqianbaApi: {
            address: 'http://backend.test.shouqianba.com/rpc'
        }
    },
    production: {
        pointApi: {
            address: 'http://10.132.5.170:3333'
        },
        shouqianbaApi: {
            address: 'http://backend.shouqianba.com/rpc'
        }
    }
}[opt.options.config];

var sqb = {};

for (var serviceName in serviceConf) {
    var methodConf = serviceConf[serviceName];
    sqb[serviceName] = createService(serviceName, methodConf);
}

function createService(serviceName, methodConf) {
    var opts = url.parse(config.shouqianbaApi.address + '/' + serviceName);

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

                service(method, params, function(err, result) {
                    if (!err)
                        return cb(err, result);

                    if (err.constructor == Error) { // node internal error
                        return cb(error('INTERROR', err.message, ctx));
                    } else { // taiji service error
                        var e = error('TJ' + err.code); // translate error message
                        if (e.code == e.message)
                            e.message = err.message;
                        return cb(e);
                    }
                });
            };
        })(method);
    }

    return methods;
}

/**
 * 收钱吧 http 接口合集, 如 积分
 * @type {{}}
 */
var callApi = require(BASE + '/lib/callApi')(config.pointApi.address);
var httpApiFactory = {};
['get', 'post'].forEach(function(key){
    httpApiFactory[key] = function(api, params, cb){
        callApi[key](api, params, cb);
    }
});

module.exports = {rpc: sqb, http: httpApiFactory};
