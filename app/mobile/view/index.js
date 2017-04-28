var APP = appdir(__dirname);
var jade = require('jade');
var _500 = require(__dirname + '/500');
var _404 = require(BASE + '/error/404');

module.exports = function (req, res, ctx) {
    // 会员等级卡
    if (ctx.pathInfo == 'lakala/memberGrade') {
        jade.renderFile(JADEdir + '/gradeCard/gradeCard.jade', ctx, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });

    } else if (ctx.pathInfo == 'lakala/center') {
        jade.renderFile(JADEdir + '/coupon/index.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    } else if (ctx.pathInfo == 'lakala/gradeDetail') {
        var cardId = req.query.cardId;
        ctx.cardId = cardId;
        if (req.query.share) {
            ctx.share = req.query.share;
            jade.renderFile(JADEdir + '/gradeCard/gradeDetailShare.jade', ctx, function (err, html) {
                if (err) {
                    //log.log(err);
                    return _500(req, res, ctx, error('MEUOUE2V'));
                }
                res.writeHead(200, {"Content-Type": "text/html"});
                return res.end(html);
            });

        } else {
            // 保存首次点击标记
            taiji.memberGradeFirst.saveFlag({}, cardId, ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                if (result) {
                    jade.renderFile(JADEdir + '/gradeCard/gradeDetail.jade', ctx, function (err, html) {
                        if (err) {
                            //log.log(err);
                            return _500(req, res, ctx, error('MEUOUE2V'));
                        }
                        res.writeHead(200, {"Content-Type": "text/html"});
                        return res.end(html);
                    });
                }
            });
        }

    } else if (ctx.pathInfo == 'lakala/consume') {
        jade.renderFile(JADEdir + '/consume/consumeList.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else if (ctx.pathInfo == 'lakala/invoicHead') {
        jade.renderFile(JADEdir + '/invoicewx/headHistory.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else if (ctx.pathInfo == 'lakala/invoic') {
        jade.renderFile(JADEdir + '/invoicewx/invoiceHistory.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else if (ctx.pathInfo == 'lakala/addHead') {
        jade.renderFile(JADEdir + '/invoicewx/addHead.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else if (ctx.pathInfo == 'lakala/editHead'){
        var id = req.query.id||'';
        ctx.id = id;
        jade.renderFile(JADEdir + '/invoicewx/editHead.jade', ctx, function (err, html) {
            if (err) {
                //log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            res.writeHead(200, {"Content-Type": "text/html"});
            return res.end(html);
        });
    }else{
        return _404(req, res, ctx,"path");
    }


};
