/**
 * Created by Session on 15/11/2.
 */

var _push = require('./_push');
var utils = require('../../lib/utils');

module.exports = function(ctx, data){
    var logger = ctx.logger;
    logger.info('handle voucherCard event');
    var _data = {
        member: data.member,
        weixinConfig: data.weixinStore.weixinConfig,
        store: data.store,
        messageData: {}
    };
    var member = data.member;
    var store = data.store;
    var voucherCard = data.voucherCard;

    // 在商户或渠道的店铺信息中存放会员中心首页信息以满足定制的需求
    // 如果没有指定则用默认的
    var storeId = data.weixinStore.parentId == '0' ? data.weixinStore.id : data.weixinStore.parentId;
    var channelStore = conf.channelStore[storeId] || conf.channelStore[storeId];
    var msg1 = '您很久没光临啦';
    var secondLastTime = 0;
    logger.info("-------------打印最后登录时间 start--------------------------------");
    logger.info(member);
    if (member.lastLoginInTime && member.lastLoginInTime > 1451577600000){
	if (member.lastLoginInTime2 && member.lastLoginInTime2 >1451577600000){
		secondLastTime = member.lastLoginInTime2;
	}else{
	 	secondLastTime = member.lastLoginInTime;
	}
    logger.info(secondLastTime);
 	msg1 = '您最近一次于' + utils.dateFormat(secondLastTime) + '光临 ' + store.details.name;
    }
    logger.info("-------------打印最后登录时间 end--------------------------------");

     _data.messageData.url = conf.domain.domainName+'/platform/couponDetail.do?storeId=' + storeId + '&cardId=' + voucherCard.id;

    if(!data.weixinStore.weixinConfig.paymentMessageTemplateIds || !data.weixinStore.weixinConfig.paymentMessageTemplateIds.coupon){//没有设置模板id
        logger.info('no paymentMessageTemplateIds========================================');
        return logger.warn('no paymentMessageTemplateIds');
    }
    logger.info('data.weixinStore.weixinConfig.paymentMessageTemplateIds.coupon========================================' + data.weixinStore.weixinConfig.paymentMessageTemplateIds.coupon);
    _data.messageData.template_id = data.weixinStore.weixinConfig.paymentMessageTemplateIds.coupon;
    _data.messageData.data = {
        first: {
            value: '尊敬的顾客：\n'+ store.details.name + '赠送给您一张优惠券：\n',
            color: '#173177'
        },
        keyword1: {
            value: voucherCard.cardCode,
            color: '#000000'
        },

        keyword2: {
            value: voucherCard.name+'代金券，面值' + voucherCard.faceValue/100 + '元',
            color: '#173177'
        },
        keyword3: {
            value: store.details.name,
            color: '#000000'
        },

        keyword4: {
            value: utils.date(voucherCard.createDate),
            color: '#000000'
        },

        remark: {
            value: '备注：'+msg1+'，请查看详情畅享优惠吧。\n',
            color: '#FF1493'
        }
    };
    _push(ctx, _data);
    
};
