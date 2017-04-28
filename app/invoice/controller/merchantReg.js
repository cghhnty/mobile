/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var _404 = require(BASE + '/error/404');
var jade = require('jade');
var querystring = require('querystring');
var sortUtil = require(BASE + '/lib/util/sort');
var objectUtil = require(BASE + '/lib/util/objectUtil');

module.exports = function (req, res, ctx) {
    var pathInfo = ctx.pathInfo;
    // 查询行政区域
    if (pathInfo == 'invoice/merchant/queryRegions.do') {
        var version = req.query.version || "";
        var id = req.query.id || "";
        var level = req.query.level || "";
        taiji.invoice.queryRegions({}, {version: version, id: id, level: level}, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            if (result && result.returnCode == '000002') {
                return _500(req, res, ctx, {code: result.returnCode, message: result.message});
            }
            var obj = [];
            if (result && result.value) {
                obj = result.value;
                for (var i = 0; i < obj.length; i++) {
                    objectUtil.dField(obj[i], "@class");
                }
            }

            ctx.toJson(obj);
        });

    } else if (pathInfo == 'invoice/merchant/regMerchant.do') {
        var postData = "";
        var params = "";
        req.addListener('data', function (postDataChunck) {
            postData += postDataChunck;

        });

        req.addListener('end', function () {
            params = querystring.parse(postData);
            // console.log(params);
            var regMerchant = params;

            taiji.invoice.registerMerchant({}, regMerchant, ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                if (result) {
                    ctx.toJson(result);
                }
            });
        });
        //验证短信验证码
    } else if (pathInfo == 'invoice/merchant/verifyCode.do') {
        var mobile =req.query.mobile;
        var verifyCode = req.query.verifyCode;
        taiji.invoice.verifySMSCode({}, {mobile: mobile, verifyCode: verifyCode}, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            ctx.toJson(result);
        });
    //  获取短信验证码
    }else if (pathInfo == 'invoice/merchant/getSMSVerifyCode.do') {
        var mobile =req.query.mobile;
        var weixinId = req.query.weixinId;
        taiji.invoice.getSMSVerifyCode({}, {mobile: mobile, weixinId: weixinId}, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
             ctx.toJson(result);
        });
    }
}