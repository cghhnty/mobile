/**
 * 需要使用 http 方式调用的接口
 * Created by Session on 15/10/10.
 */

var http = require('http');
var https = require('https');
var url = require('url');

function callApi(baseUrl){
    var baseUrl = baseUrl.toString();
    this.baseUrl = baseUrl[baseUrl.length-1] == '/'? baseUrl.slice(0, -1):baseUrl;
}

callApi.prototype.request = function(path, params, method, cb){
    if (cb.constructor != Function) cb = function() {};

    var opts = url.parse(path);
    opts.method = method.toUpperCase();

    var _http = opts.protocol=='http:'?http:https;
    var req = _http.request(opts, function(res){
        var body = new Buffer(0);

        res.on('data', function(chunk) {
            body = Buffer.concat([body, chunk]);
        });

        res.on('end', function() {
            body = body.toString();
            try {
                body = JSON.parse(body);
            } catch (e){
                body = null;
            }

            cb(null, body);
        });
    });

    req.on('error', function(e) {
        console.log(new Date, e);
        cb(e);
    });

    if (params){
        if (params.constructor == Object) params = JSON.stringify(params);
        req.write(params);
    }

    req.end();
};
callApi.prototype.get = function(api, params, cb){
    var url = this.baseUrl + '/' + api;
    var paramsStr = '';
    for(var key in params) {
        if (paramsStr) paramsStr += '&';
        paramsStr += key + '=' + params[key];
    }
    if(paramsStr) url += '?'+paramsStr;
    this.request(url, null, 'GET', cb);
};
callApi.prototype.post = function(api, params, cb){
    var url = this.baseUrl + '/' + api;
    this.request(url, params, 'POST', cb);
};

module.exports = function(baseUrl){
    return new callApi(baseUrl);
};
