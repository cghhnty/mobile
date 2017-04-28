var APP = appdir(__dirname);
var jade = require('jade');
var _500 = require(BASE + '/error/500');
var _404 = require(BASE + '/error/404');
var sortUtil = require(BASE + '/lib/util/sort');

module.exports = function (req, res, ctx) {
    //console.log("invoice/view 首页及输出请求");

    if (ctx.pathInfo=='lakala/merchantInvoice') {
        taiji.invoice.queryInvoiceHeaderByOpenIdForWx({
            page: 1,
            pageSize: 2000
        }, ctx.member.weixinId, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            if (result && result.value && result.value[1].length > 0) {
                var arr = result.value[1], obj;
                //获取默认抬头
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    if (item.defaultFlag) {
                        obj = item;
                        break;
                    }
                }
                //存在默认抬头时
                if (obj) {
                    if (ctx.merchant) {
                        obj.merchant = ctx.merchant;
                    }
                    jade.renderFile(JADEdir + '/invoice/invoice.jade', obj, function (err, html) {
                        if (err) {
                            log.log(err);
                            return _500(req, res, ctx, error('MEUOUE2V'));
                        }
                        res.writeHead(200, {"Content-Type": "text/html"});
                        return res.end(html);
                    });
                    //不存在默认抬头时
                } else {
                    //对保存的发票抬头按修改时间排序
                    arr.sort(function(i,j){
                        return i.lastModified - j.lastModified;
                    });
                    obj = arr[arr.length - 1];
                    if (ctx.merchant) {
                        obj.merchant = ctx.merchant;
                    }
                    jade.renderFile(JADEdir + '/invoice/invoice.jade', obj, function (err, html) {
                        if (err) {
                            log.log(err);
                            return _500(req, res, ctx, error('MEUOUE2V'));
                        }
                        res.writeHead(200, {"Content-Type": "text/html"});
                        return res.end(html);
                    });
                }
            //用户没有保存过抬头
            } else {
                jade.renderFile(JADEdir + '/invoice/addInvoice.jade', ctx, function (err, html) {
                    if (err) {
                        log.log(err);
                        return _500(req, res, ctx, error('MEUOUE2V'));
                    }
                    res.writeHead(200, {"Content-Type": "text/html"});
                    return res.end(html);
                });

            }

        });

    } else if (ctx.pathInfo == 'invoice/invoiceChange') {
        var weixinId = req.query.weixinId;
        var member = {weixinId: weixinId};
        ctx.member = member;
        jade.renderFile(JADEdir + '/invoice/invoiceChange.jade', ctx, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });


    } else if (ctx.pathInfo == 'invoice/editHeader') {
        var id = req.query.id;
        ctx.id = id;
        jade.renderFile(JADEdir + '/invoice/invoiceEdit.jade', ctx, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });


    } else if (ctx.pathInfo == 'invoice/addHeader') {
        var weixinId = req.query.weixinId;
        var member = {weixinId: weixinId};
        ctx.member = member;
        jade.renderFile(JADEdir + '/invoice/addInvoice.jade', ctx, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });


    } else if (ctx.pathInfo == 'invoice/invoiceSuccess') {
        var weixin = conf.weixin;
        jade.renderFile(JADEdir + '/invoice/invoiceSuccess.jade', weixin, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else{
        return _404(req, res, ctx,"path");
    }

}