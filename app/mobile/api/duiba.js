/**
 * 对吧回调接口
 *
 * Created by Session on 15/10/10.
 */

var duiba = require(BASE + '/module/duiba')('MSG7hbkGqTpjndhxJgh84QDpY3B', 'LtSmZA9kH3bM1UT8H3ng17JDYBt');
var sqbApiCaller = require(BASE + '/module/sqb');

module.exports = {
    /**
     * 供对吧回调扣减积分的接口
     *
     * 注意：这个接口的逻辑和对吧文档里说的逻辑有些不同
     * 这个接口暂时不扣减积分，只是判断当下积分是否足够
     * 扣减积分的动作在订单通知的接口里
     * @param req
     * @param res
     * @param ctx
     */
    creditsConsume: function(req, res, ctx){
        log.log('START');
        log.log('request consume credits from duiba');
        log.log('start: received duiba request');
        log.log('duiba request data: ', req.query);

        try {
            // 校验对吧请求
            log.log('start: parse credit consume request from duiba.');
            var data = duiba.parseCreditConsume(req.query);
            log.log('end: parse credit consume request from duiba.');
            log.log('credit consume request parse result: ', data);

        } catch (e) {
            log.log('parse credit consume request fail.', 'err: ', e.message);
            log.log('END');
            return ctx.json({
                'status': 'fail',
                'errorMessage': '解析请求失败',
                'credits': 0
            });
        }

        log.log('start: request member info.', 'member id: ', data.uid);
        taiji.member.getMember({}, data.uid, ctx, function(err, member){
            log.log('end: request member info.', 'result: ', member);
            if (err){
                log.log('request member info error.', 'error: ', err);
                log.log('END');
                return ctx.json({
                    'status': 'fail',
                    'errorMessage': '服务器内部错误',
                    'credits': 0
                });
            }

            if (!member) {
                log.log('member didn\'t exist.');
                log.log('END');
                return ctx.json({
                    'status': 'fail',
                    'errorMessage': '用户不存在',
                    'credits': 0
                });
            }

            // 获取积分
            log.log('start: request member point.', 'member id: ', member.weixinId);
            sqbApiCaller.http.get('query/' + member.weixinId, null, function(err, point){
                log.log('end: request member point.', 'member id: ', member.weixinId);
                log.log('member point api result: ', point);
                if (err || point.status != 'ok') {
                    log.log('request member point error.', 'error: ', err);
                    log.log('END');
                    return ctx.json({
                        'status': 'fail',
                        'errorMessage': '获取积分余额失败',
                        'credits': 0
                    });
                }

                /**
                 * Logic
                 *
                 * 先判断积分是否足够
                 *
                 * 如够则创建订单
                 * 否则返回错误
                 */
                if (point.data.total-data.credits < 0) {
                    log.log('point not enough');
                    log.log('END');
                    return ctx.json({
                        'status': 'fail',
                        'errorMessage': '积分不足',
                        'credits': point.data.total
                    });
                }

                log.log('start: create order');
                sqbApiCaller.http.post('createOrder', {
                    "user": member.weixinId,
                    "marketOrderNum": data.orderNum,
                    "amount": Number(data.credits),
                    "actual_price": Number(data.actualPrice),
                    "exchange_type": data.type,
                    "exchange_detail": data.params,
                    "status": "CREATED",
                    "order_source":"兑吧"
                }, function(err, orderId){
                    log.log('end: create order. result: ', orderId);
                    if (err || orderId.status != 'ok'){
                        log.log('create order error: ', err);
                        log.log('END');
                        return ctx.json({
                            'status': 'fail',
                            'errorMessage': '创建订单失败',
                            'credits': point.data.total
                        });
                    }

                    log.log('END');
                    return ctx.json({
                        'status': 'ok',
                        'bizId': orderId.data,
                        'credits': point.data.total-data.credits
                    });
                })

            });
        });
    },
    orderNotify: function(req, res, ctx) {
        log.log('START');
        log.log('order notify from duiba');
        log.log('start: received duiba request.');
        log.log('duiba request data: ', req.query);

        try {
            log.log('start: parse order notify request from duiba.');
            var data = duiba.parseCreditNotify(req.query);
            log.log('end: parse order notify request from duiba.');
            log.log('order notify request parse result: ', data);
        } catch (e){
            log.log('parse order notify request fail.', 'err: ', e);
            log.log('END');
            return res.end();
        }

        /**
         * Logic
         *
         * 判断订单是否已经处理，如已经处理则直接返回 ok
         *
         * 如未处理
         * 判断对吧订单是否成功
         * 如果成功：改变订单状态为成功,并扣减积分
         * 如果失败：改变订单状态失败
         */
        log.log('start: request order by duiba order number.');
        sqbApiCaller.http.post('queryOrderByMarketOrderNum', {marketOrderNum: data.orderNum}, function(err, order){
            log.log('end: request order by duiba order number.');
            log.log('request result: ', order);
            if (err || order.status != 'ok') {
                log.log('request order error: ', err);
                log.log('END');
                return res.end();
            }

            if(!order.data) {
                log.log('order not exist');
                log.log('END');
                return res.end('404');
            }

            if (order.data.status != 'CREATED') {
                log.log('order already handled');
                log.log('END');
                return res.end('ok');
            }

            // 处理订单
            log.log('start: handle order.');
            sqbApiCaller.http.post('updateOrder', {
                marketOrderNum: data.orderNum,
                status: data.success ? 'SUCCESS':'FAIL'
            }, function(err, wsOrder){
                log.log('end: handle order.');
                log.log('result: ', err, wsOrder);

                if (err && wsOrder.status != 'ok') {
                    log.log('handle order error.');
                    log.log('END');
                    return res.end();
                }

                if (data.success) {
                    // 扣减积分
                    log.log('start: consume point. member: ', order.data.user);
                    var domain = require('domain');
                    var d = domain.create();

                    d.on('error', function(e){
                        console.log(e);
                        log.log('END');
                        return res.end('ok');
                    });

                    d.run(function(){
                        sqbApiCaller.http.post('consume', {
                            event: 'duiba-convert',
                            subject: order.data.user,
                            amount: Number(wsOrder.data.amount),
                            remark: data.orderNum
                        }, function(consumePointErr, consumeResult){
                            log.log('end: consume point. member: ', order.data.user);
                            log.log('request result: ', consumeResult);
                            if (consumePointErr || consumeResult.status != 'ok') {
                                log.log('consume point error. error: ', consumePointErr);
                            }

                            log.log('END');
                            return res.end('ok');
                        });
                    });
                } else {
                    log.log('END');
                    res.end('ok');
                }
            });
        });
    },
    getCreditRecode: function(req, res, ctx){
        log.log('START');
        log.log('request credit recode from duiba');
        log.log('start: received duiba request.');
        log.log('duiba request data: ', req.query);

        try {
            log.log('start: parse request from duiba.');
            var data = duiba.parseCreditNotify(req.query);
            log.log('end: parse request from duiba.');
            log.log('request parse result: ', data);
        } catch (e){
            log.log('parse request fail.', 'err: ', e);
            log.log('END');
            return res.end();
        }

        log.log('start: request member info.', 'member id: ', data.uid);
        taiji.member.getMember({}, data.uid, ctx, function(err, member) {
            log.log('end: request member info.', 'result: ', member);
            if (err) {
                log.log('request member info error.', 'error: ', err);
                log.log('END');
                return ctx.json({
                    'success': false,
                    'message': '服务器内部错误'
                });
            }

            if (!member) {
                log.log('member didn\'t exist.');
                log.log('END');
                return ctx.json({
                    'success': false,
                    'message': '用户不存在'
                });
            }

            // 获取积分
            log.log('start: request member point.', 'member id: ', member.weixinId);
            sqbApiCaller.http.get('history/' + member.weixinId, {
                page: 0,
                size: 100
            }, function (err, histories) {
                log.log('end: request member point history.', 'member id: ', member.weixinId);
                log.log('member point hsitory api result: ', histories);
                if (err || histories.status != 'ok') {
                    log.log('request member point hsitory error.', 'error: ', err);
                    log.log('END');
                    return ctx.json({
                        'success': false,
                        'message': '服务器内部错误'
                    });
                }

                var addPointRecodes = [];
                var reasonMapping = {_default: 'UNKNOW', checkout: '消费赚取'};
                var returned = false;
                try {
                    histories.data.Detail.forEach(function(history){
                        if (history.amount > 0){
                            addPointRecodes.push({
                                credits: history.amount,
                                reason: reasonMapping[history.event] || reasonMapping._default,
                                time: history.ctime
                            });

                            if (addPointRecodes.length == 30) {
                                returned = true;
                                log.log(addPointRecodes.length);
                                log.log('END');
                                return ctx.json({
                                    'success': true,
                                    'message': '成功',
                                    'create_date': formatTimeToDateTime(member.registerDate),
                                    'add_records': addPointRecodes
                                })
                            }
                        }
                    });
                    if (!returned) {
                        log.log(addPointRecodes.length);
                        log.log('END');
                        return ctx.json({
                            'success': true,
                            'message': '成功',
                            'create_date': formatTimeToDateTime(member.registerDate),
                            'add_records': addPointRecodes
                        })
                    }
                } catch (e){
                    log.log(e.message);
                    log.log('END');
                    return ctx.json({
                        'success': false,
                        'message': '服务器内部错误'
                    });
                }
            });
        });
    }

};

function formatTimeToDateTime(time) {
    var timeObj = new Date(time);
    var dateArr = [timeObj.getFullYear(), formatToSpecialLength(timeObj.getMonth() + 1, 2, '0'), formatToSpecialLength(timeObj.getDate(), 2, '0')];
    var timeArr = [formatToSpecialLength(timeObj.getHours(), 2, '0'), formatToSpecialLength(timeObj.getMinutes(), 2, '0'), formatToSpecialLength(timeObj.getSeconds(), 2, '0')];

    return dateArr.join('-') + ' ' + timeArr.join(':');
}
function formatToSpecialLength(str, length, specialStr) {
    str += '';
    if (str.length >= length) return str;

    var originLength = str.length;
    for (var i = 0; i < length - originLength; i++) {
        str = specialStr + str;
    }

    return str;
}
