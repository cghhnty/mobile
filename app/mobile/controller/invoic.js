/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var jade = require('jade');
var objectUtil = require(BASE + '/lib/util/objectUtil');

module.exports = function (req, res, ctx) {
    var pathInfo = ctx.pathInfo;
    if (pathInfo == 'platform/invoic.do') {
        var weixinId = req.query.weixinId;
        taiji.invoice.queryInvoiceHistoryForWechat({}, weixinId, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj = {};
            if (result && result.value && result.value.length > 0) {
                obj.list = result.value;
                for (var i = 0, arr = obj.list; i < arr.length; i++) {
                    objectUtil.dField(arr[i], "@class");
                }
            }
            var o = JSON.stringify(obj);
            res.writeHead(200, {
                'Content-Type': 'application/json;charset=utf-8'
            });
            res.end(o);

        });
    }
}
