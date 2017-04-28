/**
 * Created by cjh on 2016/9/30.
 */
var _push = require('./_push');
var utils = require('../../lib/utils');

module.exports = function(ctx, data){
    var logger = ctx.logger;
    var _data = {
        member: data.member,
        weixinConfig: data.weixinStore.weixinConfig,
        store: data.store,
        messageData: {}
    };
    var member = data.member;
    var store = data.store;
    var memberGrade = data.memberGrade;

    // 在商户或渠道的店铺信息中存放会员中心首页信息以满足定制的需求
    // 如果没有指定则用默认的
    var storeId = data.weixinStore.parentId == '0' ? data.weixinStore.id : data.weixinStore.parentId;

    //logger.info("-------------等级卡升级通知--------------------------------");
    _data.messageData.url = conf.domain.domainName+'/lakala/gradeDetail?storeId=' + storeId + '&cardId=' + memberGrade.id;

    if(!data.weixinStore.weixinConfig.paymentMessageTemplateIds || !data.weixinStore.weixinConfig.paymentMessageTemplateIds.grade){//没有设置模板id
        logger.info('no paymentMessageTemplateIds========================================');
        return logger.warn('no paymentMessageTemplateIds');
    }
    _data.messageData.template_id = data.weixinStore.weixinConfig.paymentMessageTemplateIds.grade;
    var total ="";
    var satisfy = "";
    //等级条件 0、2金额，1次数
   switch(memberGrade.satisfyFlags){
        case '0':
            satisfy = memberGrade.satisfyMoney?memberGrade.satisfyMoney/100+'元':'0元';
            break;
        case '1':
            satisfy = memberGrade.satisfyCount?memberGrade.satisfyCount+'次':'0次';
            break;
        case '2':
           satisfy = memberGrade.satisfyMoney?memberGrade.satisfyMoney/100+'元':'0元';
           break;
    }
    var msg='';
    if(memberGrade.discount&&memberGrade.remark){
        msg='您可以享有全场'+((100-memberGrade.discount)/10).toFixed(1)+'折优惠，'+memberGrade.remark+'，感谢您的光临,期待您的再次惠顾！\n';
    }else if(memberGrade.discount&&!memberGrade.remark){
        msg='您可以享有全场'+((100-memberGrade.discount)/10).toFixed(1)+'折优惠'+'，感谢您的光临,期待您的再次惠顾！\n';
    }else if(!memberGrade.discount&&memberGrade.remark){
        msg='您可以享有'+memberGrade.remark+'，感谢您的光临,期待您的再次惠顾！\n';
    }else{
        msg='感谢您的光临，期待您的再次惠顾！\n';
    }

        _data.messageData.data = {
            first: {
                value: '尊敬的顾客：\n'+ '恭喜您在'+store.details.name +'的会员卡等级升级了！\n',
                color: '#173177'
            },
            keyword1: {
                value: member.fullName,
                color: '#000000'
            },

            keyword2: {
                value: memberGrade.memberGradeName,
                color: '#000000'
            },
            keyword3: {
                value: memberGrade.createTime?memberGrade.createTime.slice(0,memberGrade.createTime.lastIndexOf(":")):'',
                color: '#000000'
            },
            remark: {
                value: msg,
                color: '#173177'
            }
        };
    _push(ctx, _data);
};

