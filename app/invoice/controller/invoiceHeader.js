/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var jade = require('jade');
var querystring = require('querystring');
var timeUtil = require(BASE + '/lib/util/time');
var objectUtil = require(BASE + '/lib/util/objectUtil');

module.exports = function (req, res, ctx) {
    var pathInfo = ctx.pathInfo;
    if (pathInfo == 'invoice/saveInvoiceHeader.do') {
        var postData = "";
        var params = "";
        req.addListener('data', function (postDataChunck) {
            postData += postDataChunck;

        });
        req.addListener('end', function () {
            params = querystring.parse(postData);
            //console.log(params);
            var invoiceHeader = params;

            taiji.invoice.saveOrUpdateInvoiceHeader({}, invoiceHeader, ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                if(result&&!result.value){
                    //console.log(result);
                    if(result.returnCode=='000003'){
                      //  console.log(result);
                        return _500(req, res, ctx, {code:result.returnCode,message:result.returnMsg});
                    }
                }
                var obj = {};
                if (result && result.value) {
                    //console.log(result);
                    obj = result.value;
                    objectUtil.dField(result.value, "@class");

                    var o = JSON.stringify(obj);
                    res.writeHead(200, {
                        'Content-Type': 'application/json;charset=utf-8'
                    });
                    res.end(o);
                    return ;
                }
            });
        });

    } else if (pathInfo == 'invoice/invoiceHeader.do') {
        var weixinId = req.query.weixinId;
        taiji.invoice.queryInvoiceHeaderByOpenIdForWx({page: 1, pageSize: 2000}, weixinId, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj = {};
            if (result && result.value && result.value[1].length > 0) {
                obj.list = result.value[1];
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
    } else if (pathInfo == 'invoice/getHeader.do') {
        var headId = req.query.headId;
        taiji.invoice.queryInvoiceHeaderByIdForWx({}, headId, ctx, function (err, header) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj = {};
            if (header && header.id) {
               // console.log(header);
                obj = header;
                objectUtil.dField(obj, "@class");
            }
            var o = JSON.stringify(obj);
            res.writeHead(200, {
                'Content-Type': 'application/json;charset=utf-8'
            });
            res.end(o);

        });

    }
}
