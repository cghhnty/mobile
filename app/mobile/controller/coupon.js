/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var jade = require('jade');
var querystring = require('querystring');
var timeUtil = require(BASE+'/lib/util/time');

module.exports = function (req, res, ctx) {
    var pathInfo = ctx.pathInfo;
    if (pathInfo == 'platform/couponDetail.do') {
        var cardId = req.query.cardId;
        taiji.product.getCouponDetail({}, cardId, ctx, function (err, result) {
            if (err) {
                return _500(req, res, ctx, err);
            }
            var obj ={};
            if (result&&result.value) {
                obj = result.value;
                for (var p in obj) {
                    if (p == '@class') {
                        delete obj[p];
                    }
                }
                var oldTime = (new Date("1970/01/01 00:00:00")).getTime();
                obj.name = obj.name ? obj.name : '';
                obj.type = obj.type == 'VOUCHER_CARD' ? '代金券' : '';
                obj.faceValue = obj.faceValue ? Math.round(obj.faceValue / 100) : 0;
                obj.flag = obj.flag ? (obj.limitAmount ? '满' + ( Math.round(obj.limitAmount / 100)) + '元可用' : '无门槛') : '无门槛';
                obj.effectiveTime = obj.effectiveTime ? (timeUtil.date(obj.effectiveTime)) : '';
                obj.expirationTime = obj.expirationTime ? (timeUtil.date(obj.expirationTime)) : '永久有效';
                obj.storeId = obj.storeId ? obj.storeId : '';
                obj.isHasOfflineStore = obj.isHasOfflineStore;
                obj.effectiveStart = obj.effectiveStart ? (timeUtil.time2(oldTime+parseInt(obj.effectiveStart))) : '';
                obj.effectiveEnd = obj.effectiveEnd ? (timeUtil.time2(oldTime + parseInt(obj.effectiveEnd))) : '';
                obj.description = obj.description ? obj.description : '无';
                // 绑定渠道id
                obj.channelId = req.query.storeId;
            }

            jade.renderFile(JADEdir + '/coupon/ticketDetail.jade', obj, function (err, html) {
                if (err) {
                    //log.log(err);
                    return _500(req,res,ctx,error('MEUOUE2V'));
                }
                res.writeHead(200, {"Content-Type": "text/html"});
                return res.end(html);
            });
        });
    } else {
        req.setEncoding('utf-8');
        var postData = "";
        var params = "";
        req.addListener('data', function (postDataChunck) {
            postData += postDataChunck;

        });
        req.addListener('end', function () {
            params = querystring.parse(postData);
            log.log('查询优惠券请求参数接收完毕输出微信id: ' + params.weixinId);
            var type = "", sortType = "", state = "active";
            str1 = params['data0[filter0]'];
            str2 = params['data1[filter0]'];
            str3 = params['data2[filter0]'];
            switch (str1) {
                case 'name0':
                    type = 'VOUCHER_CARD';
                    break;
                case 'name1':
                    type = 'VOUCHER_CARD';
                    break;
                case 'name2':
                    type = 'VOUCHER_CARD';
                    break;
            }

            switch (str2) {
                case 'name0':
                    sortType = 'default';
                    break;
                case 'name1':
                    sortType = 'expirate';
                    break;
            }
            switch (str3) {
                // 未使用
                case 'name0':
                    state = 'ACTIVE';
                    break;
                // 已过期
                case 'name1':
                    state = 'INACTIVE';
                    break;
                // 已使用
                case 'name2':
                    state = 'REDEEMED';
                    break;
            }
            var weixinId = params.weixinId;
            var pageSize = params.pageSize;
            var currentPage = params.currentPage;
            var rst = taiji.product.getCouponsV3({},
                {
                    "weixinId": weixinId,
                    "type": type,
                    "sortType": sortType,
                    "state": state,
                    "pageSize": pageSize,
                    "currentPage": currentPage
                },
                ctx,
                function (err, result) {
                    // console.log(data);
                    if (err) {
                        return _500(req, res, ctx, err);
                    }
                    var obj = {};
                    obj.cardUnused = result.value.cardUnused[1];
                    obj.countSum = result.value.countSum[1];
                    obj.total = result.totalCount;
                    obj.gradeNum =result.value.gradeNum;
                    if (result.value.products[1].length > 0) {
                        obj.pList = result.value.products[1];
                    }
                    var o = JSON.stringify(obj);
                    res.writeHead(200, {
                        'Content-Type': 'application/json;charset=utf-8'
                    });
                    // console.log(o);
                    res.end(o);
                    return;
                });
        });
    }
}
