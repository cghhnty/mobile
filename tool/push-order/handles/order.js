/**
 * Created by Session on 15/11/2.
 */

var _push = require('./_push');
var utils = require('../../lib/utils');
var taiji = require(BASE + '/module/taiji');

var fengShouPayments = {
    UNIONPAY: 'POS刷卡',
    UPAY_ALIPAY: '支付宝',
    UPAY_WEIXIN: '微信'
};

/**
 *
 * @param ctx 包括运行上下文信息，如 logger
 * @param data 处理分支中可能要使用到的数据，来自于队列
 * @returns {*}
 */
module.exports = function(ctx, data){
    var logger = ctx.logger;
    logger.info('handle order event');
    var _data = {
        member: data.member,
        weixinConfig: data.weixinStore.weixinConfig,
        store: data.store,
        advertisement:data.advertisement,
        messageData: {}
    };

    var store = data.store;
    var order = data.order;
    var member = data.member;
    var advertisement = data.advertisement;
    if (order.types && order.types.indexOf('GROUPON') != -1){
        return logger.info('groupon order, will not push order');
    }
    logger.info('order id: ', order.orderCode);
    // 在商户或渠道的店铺信息中存放会员中心首页信息以满足定制的需求
    // 如果没有指定则用默认的
    var storeId = data.weixinStore.parentId == '0' ? data.weixinStore.id : data.weixinStore.parentId;
    var channelStore = conf.channelStore[storeId] || conf.channelStore[storeId];
    logger.info('order.js | storeId: %s', storeId);

//    if (channelStore && channelStore.myCenter) {
//        _data.messageData.url = 'http://postest.lakala.com.cn/' + channelStore.myCenter + '?storeId=' + storeId;
//        _data.messageData.url = 'http://postest.lakala.com.cn/lakala/consume?storeId=' + storeId;
//    }else{
        // 默认消费提醒中的详情是my/order
//        _data.messageData.url = 'http://postest.lakala.com.cn/my/order?storeId=' + storeId + '&orderId=' + order.id;
//    }

    var messageTemplate = {
        first: '',
        remark: ''
    };
    var storeId = data.weixinStore.parentId == '0' ? data.weixinStore.id : data.weixinStore.parentId;
    var channelStore = conf.channelStore[storeId] || conf.channelStore[storeId];
    if (channelStore && channelStore.order && channelStore.order.first) {
        messageTemplate.first = channelStore.order.first;
    }
    if (channelStore && channelStore.order && channelStore.order.remark) {
        messageTemplate.remark = channelStore.order.remark;
    }
    messageTemplate.first = parseMessageTemplate(ctx, messageTemplate.first, {
        store: store,
        order: order,
        member: member
    });
    messageTemplate.remark = parseMessageTemplate(ctx, messageTemplate.remark, {
        store: store,
        order: order,
        member: member
    });
    logger.debug(messageTemplate);
    var orderTime = utils.dateTime(order.statusChangeDate.FINISHED);
    var subtotal = 0;//实际支付金额
    var redeemAmount = 0;
    var _payment = {};

    // 2017/3/7 cjh
    var totalNum =0; // 订单金额

    var stampPeriodCardNumber = 0;
    var ifOnlyStampPeriodCard = true;//是否只有记次和时段卡
    var cardId;//卡Id
    var cardName;//卡名称
    var cardUseNow;//本次使用
    var cardUseAll;//累计使用

    logger.info(order.itemList);
    order.itemList.forEach(function(item) {
        //有其它支付方式
        if (!item.payment) {
            ifOnlyStampPeriodCard = false;
        }
        if (item.payment) {
            if (item.payment.stampRedeem){
                stampPeriodCardNumber ++;
            } else {
                ifOnlyStampPeriodCard = false;
            }
        }
        if(ifOnlyStampPeriodCard && stampPeriodCardNumber==1){
            for (var key in item.payment.stampRedeem){
                cardId = key;
                cardUseNow = item.payment.stampRedeem[key];
            }
        }

        if (item.unitDealPrice) {
            if (item.type == "DISCOUNT") {
                if (item.unitDealPrice < 0) {
                    subtotal += item.unitDealPrice;
                } else {
                    subtotal -= item.unitDealPrice;
                }
            }
            else if (item.type == "VOUCHER_REDEEM" || item.type == "GRADE_CARD") {
                redeemAmount = item.unitDealPrice;
            } else {
                subtotal = item.unitDealPrice;
                totalNum = Math.abs(subtotal);
            }
        }

        if (item.type == 'HONEBAO')
            _payment['红包'] = 1;

        if (item.payment && item.payment.balancePayment)
            _payment['储值卡'] = 1;

        if (item.type == 'VOUCHER_REDEEM')
            _payment['优惠券'] = 1;
    });
    
    subtotal += redeemAmount;

    //计算使用积分时的实付金额
    if(order.payment&&order.payment.pointPayment){
        subtotal= totalNum - Math.abs(order.payment.pointPayment.amount);
    }

    logger.info(ifOnlyStampPeriodCard);
    logger.info(data.weixinStore.weixinConfig);

    //使用计次卡时段卡模板
    if(ifOnlyStampPeriodCard){

        if(!data.weixinStore.weixinConfig.paymentMessageTemplateIds || !data.weixinStore.weixinConfig.paymentMessageTemplateIds.redeem){//没有设置模板id
            return logger.warn('has no paymentMessageTemplateIds of redeem');
        }

        _data.messageData.template_id = data.weixinStore.weixinConfig.paymentMessageTemplateIds.redeem;
        _data.messageData.topcolor = '#3f67ab';

        logger.info('start get card info');
        logger.info('card:' + cardId);
        taiji.card.getCardById({}, cardId, {}, function(err, card){
            logger.info('end get card info');
            if (err){
                return logger.fatal(err);
            }

            cardName = card.name;
            if(card.type == "PERIOD_CARD"){
                cardUseAll = 1;
            }else{
                cardUseAll = card.numberOfStamps - card.remainingStamps;
            }

            _data.messageData.data = {
                first: {
                    value: '',
                    color: '#173177'
                },

                keyword1: {
                    value: member.fullName + '\n',
                    color: '#173177'
                },

                keyword2: {
                    value: member.memberCode + '\n',
                    color: '#173177'
                },

                keyword3: {
                    value: cardName + '\n',
                    color: '#173177'
                },

                keyword4: {
                    value: cardUseNow + '\n',
                    color: '#173177'
                },

                keyword5: {
                    value: cardUseAll + '\n',
                    color: '#173177'
                },

                remark: {
                    value: '',
                    color: '#a94442'
                }
            };

            _push(ctx, _data);
        });
    } else{

        if(!data.weixinStore.weixinConfig.paymentMessageTemplateIds || !data.weixinStore.weixinConfig.paymentMessageTemplateIds.normal){//没有设置模板id
            return logger.warn('no paymentMessageTemplateIds of normal');
        }

        if (subtotal < 0)
            subtotal = 0;

        if (order.payment) {
            logger.debug(order.payment);
            if (order.payment.cashAmount)
                _payment['现金'] = 1;
            if (order.payment.pointAmount || (order.payment.pointPayment && order.payment.pointPayment.point > 0))
                _payment['积分'] = 1;
            if (order.payment.bankAmount)
                _payment['银行卡'] = 1;
            if (order.payment.balanceAmount)
                _payment['储值账户'] = 1;
            if (order.payment.weixinOnline)
                _payment['微信支付'] = 1;
            if (order.payment.fengShouPayments) {
                order.payment.fengShouPayments.forEach(function(p) {
                    if (fengShouPayments[p.payMethod]) _payment[fengShouPayments[p.payMethod]] = 1;
                });
            }
        }

        var payment = '';

        for (var k in _payment)
            payment += '/' + k;

        if (payment)
            payment = payment.slice(1);
        else
            payment = '无';



        logger.info("订单推送数据：\n"+
        "商户名称：" + store.details.fullName + "\n" +
        "订单编号：" + order.orderCode + "\n" +
        "支付金额：" + subtotal + "\n" +
        "支付时间：" + orderTime);

        //详情连接
        if(advertisement.advertiseUrl&&advertisement.advertiseUrl.trim()!=''&&advertisement.advertiseUrl.trim()!='null'&&advertisement.advertiseUrl.trim()!='NULL'){
            _data.messageData.url = advertisement.advertiseUrl;
        }

        _data.messageData.template_id = data.weixinStore.weixinConfig.paymentMessageTemplateIds.normal;
        _data.messageData.topcolor = '#3f67ab';
        _data.messageData.data = {
            first: {
                value: '尊敬的顾客：\n您好，您已成功支付,获得¥'+(order.discountAmount/100).toFixed(2)+'优惠。\n',
                color: '#173177'
            },

            keyword1: {
                value: store.details.fullName,
                color: '#000000'
            },

            keyword2: {
                value: order.orderCode,
                color: '#000000'
            },

            keyword3: {
                value: '￥'+(subtotal / 100).toFixed(2),
                color: '#173177'
            },

            keyword4: {
                value: orderTime+'\n',
                color: '#000000'
            },

            remark: {
                value: advertisement.advertiseContent,
                color: '#FF1493'
            }
        };

        _push(ctx, _data);
    }

};

function parseMessageTemplate(ctx, template, vars){
    ctx.logger.info('parse Message Template');
    var eventStr = template.replace(/\{\{[^\}\}]*\}\}/g, function (replacement) {
        ctx.logger.info(replacement);
        replacement = replacement.split(/\{\{|\}\}/).join('');
        ctx.logger.info(replacement);
        var fn = new Function('vars', 'try {with (vars) {return '+replacement+';};}catch(e){return "";};');
        ctx.logger.info(fn(vars, replacement));
        return fn(vars, replacement);
    });
    return eventStr;
}

