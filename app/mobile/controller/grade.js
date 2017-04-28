/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var _404 = require(BASE + '/error/404');
var jade = require('jade');
var sortUtil = require(BASE + '/lib/util/sort');
var objectUtil = require(BASE + '/lib/util/objectUtil');

module.exports = function (req, res, ctx) {
    var pathInfo = ctx.pathInfo;
    //会员等级卡
    if (pathInfo == 'platform/grade.do') {
        //console.log("查询会员等级卡");
        var weixinId = req.query.weixinId;
        taiji.memberGrade.getMemberGradeForWx({},
            {
                "weixinId": weixinId,
            },
            ctx, function (err, result) {
                if (err) {
                    return _500(req, res, ctx, err);
                }
                var obj = {};
                if (result&&result.value[1].length > 0) {
                    obj.pList = result.value[1];
                }
                var o = JSON.stringify(obj);
                res.writeHead(200, {
                    'Content-Type': 'application/json;charset=utf-8'
                });
                res.end(o);
                return;
            });

    } else if (pathInfo == 'platform/gradeDetail.do') { // 等级卡详情
        var cardId = req.query.cardId;
        var share = req.query.share||'0';
        taiji.memberGrade.getMGradeDetailForWx({}, cardId,share,ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj = {};
            if (result && result.value) {
                obj = result.value;
                objectUtil.dField(obj, "@class");
            }
            var o = JSON.stringify(obj);
            res.writeHead(200, {
                'Content-Type': 'application/json;charset=utf-8'
            });
            res.end(o);
        });
    } else { // 等级卡门店列表
        var merchantId = req.query.merchantId;
        taiji.store.getStoresByParent({}, merchantId, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj = {};
            obj.cardId = req.query.cardId;
            obj.storeId = ctx.store.id;
            if(result&&result.length>0){
                obj.list = result;
                obj.list.forEach(function (item) {
                    item.sortName = item.details.aliasName ? item.details.aliasName : item.details.name;
                })
                sortUtil.chSort(obj.list, 'sortName');
            }else{
                obj.list=[];
            }
            if(req.query.share){
                jade.renderFile(JADEdir + '/gradeCard/gradeStoreListShare.jade', obj, function (err, html) {
                    if (err) {
                        return _500(req, res, ctx, error('MEUOUE2V'));
                    }
                    res.writeHead(200, {"Content-Type": "text/html"});
                    return res.end(html);
                });
            }else{
                jade.renderFile(JADEdir + '/gradeCard/gradeStoreList.jade', obj, function (err, html) {
                    if (err) {
                        return _500(req, res, ctx, error('MEUOUE2V'));
                    }
                    res.writeHead(200, {"Content-Type": "text/html"});
                    return res.end(html);
                });
            }

        });
    }
}
