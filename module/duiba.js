/**
 * 对吧接口处理函数封装
 *
 * usage: var duiba = require('duiba')();
 * duiba.xxx();
 *
 * Created by Session on 15/10/9.
 */

var crypto = require('crypto');

module.exports = function(appkey, appSecret){
    return new duibaSDK(appkey, appSecret);
};

function duibaSDK(appKey, appSecret){
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.baseUrl = 'http://www.duiba.com.cn';
}

/**
 * 对吧 md5 签名，只需要实际参数，不需要包含对吧 appSecret
 * @param params
 */
duibaSDK.prototype.sign = function(params){
    params = clone(params);
    params.appKey = this.appKey;
    params.appSecret = this.appSecret;

    var keys = [];
    for (var key in params) {
        keys.push(key);
    }
    var originStr = keys.sort().map(function(key){
        return params[key];
    }).join('');

    return crypto.createHash('md5').update(originStr, 'utf8').digest('hex');
};

/**
 * 验证对吧调用接口时的签名
 * @param request
 * @returns {boolean}
 */
duibaSDK.prototype.verifySign = function(request){
    var newRequest = clone(request);
    var sign = newRequest.sign;

    delete newRequest.sign;

    return sign == this.sign(newRequest);
};

function clone(old) {
    var newObj;

    if (old instanceof Array) {
        newObj = [];
    } else if (old instanceof Object) {
        newObj = {};
    } else {
        return old;
    }
    for (var key in old) {
        if (typeof old[key] == 'object') {
            newObj[key] = clone(old[key]);
        } else {
            newObj[key] = old[key];
        }
    }
    return newObj;
}

/**
 * 生成对吧自动登陆链接
 * @param uid
 * @param credits
 * @param specialAddress
 * @returns {string}
 */
duibaSDK.prototype.generateAutoLoginUrl = function(uid, credits, specialAddress){

    // 校验传进来的参数
    if (specialAddress && specialAddress.indexOf(this.baseUrl) != 0) specialAddress = null;
    if (typeof uid == 'undefined') throw new Error('Invalid uid');
    if (typeof credits == 'undefined') throw new Error('Invalid credits');

    var timestamp = new Date().getTime();
    var params = {uid: uid, credits: credits, appKey: this.appKey, timestamp: timestamp};
    if (specialAddress) params.redirect = specialAddress;

    params.sign = this.sign(params);

    if (params.redirect) params.redirect = encodeURIComponent(params.redirect);

    var url = this.baseUrl + '/autoLogin/autologin?';
    var paramsStr = '';
    for (var key in params) {
        if (paramsStr) paramsStr += '&';

        paramsStr += (key + '=' + params[key]);
    }

    return url + paramsStr;
};

/**
 * 解析对吧扣积分请求
 * @param request
 * @returns {*}
 */
duibaSDK.prototype.parseCreditConsume = function(request){
    // 校验
    if (!(request instanceof Object)) throw new Error('Invalid request type');
    if (!request.appKey || request.appKey != this.appKey) throw new Error('appKey not match');
    if (!request.sign || !this.verifySign(request)) throw new Error('Invalid sign');
    if (!request.timestamp) throw new Error('Invalid timestamp');

    delete request.sign;
    return request;
};

/**
 * 解析对吧订单结果通知
 * @param request
 * @returns {*}
 */
duibaSDK.prototype.parseCreditNotify = function(request){
    // 校验
    if (!(request instanceof Object)) throw new Error('Invalid request type');
    if (!request.appKey || request.appKey != this.appKey) throw new Error('appKey not match');
    if (!request.sign || !this.verifySign(request)) throw new Error('Invalid sign');
    if (!request.timestamp) throw new Error('Invalid timestamp');

    delete request.sign;
    return request;
};

/**
 * 解析对吧违规查询请求
 * @param request
 * @returns {*}
 */
duibaSDK.prototype.parseCreditRecode = function(request){
    // 校验
    if (!(request instanceof Object)) throw new Error('Invalid request type');
    if (!request.appKey || request.appKey != this.appKey) throw new Error('appKey not match');
    if (!request.sign || !this.verifySign(request)) throw new Error('Invalid sign');
    if (!request.timestamp) throw new Error('Invalid timestamp');

    delete request.sign;
    return request;
};
