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
    //申请开票
    if (pathInfo == 'invoice/applyInvoice.do') {
        var headerId = req.query.headerId;
        taiji.invoice.queryInvoiceHeaderByIdForWx({},headerId,ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                var obj = {};
                if (result &&result.id) {
                    obj = result;
                   // console.log(obj);
                    if(ctx.merchant){
                       // console.log("陈多铫");
                        //console.log(ctx.merchant);
                        obj.merchant = ctx.merchant;
                    }
                    objectUtil.dField(obj, "@class");
                        jade.renderFile(JADEdir+'/invoice/invoice.jade',obj, function (err, html) {
                            if (err) {
                                return _500(req, res, ctx, error('MEUOUE2V'));
                            }
                            res.writeHead(200, {"Content-Type": "text/html"});
                            return res.end(html);
                        });

                }
            });

    }else if(pathInfo == 'invoice/saveInvoice.do'){
        var postData = "";
        var params = "";
        req.addListener('data', function (postDataChunck) {
            postData += postDataChunck;

        });

        req.addListener('end', function () {
            params = querystring.parse(postData);
           // console.log(params);
            var invoice= params;

            taiji.invoice.saveInvoice({}, invoice, ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                if (result) {
                   // console.log(result);
                    var o = JSON.stringify(result);
                    res.writeHead(200, {
                        'Content-Type': 'application/json;charset=utf-8'
                    });
                    res.end(o);
                }
            });
        });



    }
}
