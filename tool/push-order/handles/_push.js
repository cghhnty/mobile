/**
 * Created by Session on 15/11/2.
 */

var simpleWechat = require('simple-wechat');
var WechatTokenStore = require(BASE + '/module/WechatTokenStore');
var crypto = require('crypto');

module.exports = function(ctx, data){
    var logger = ctx.logger;
    logger.info('_push handle function inside');
    logger.info(ctx, data);

    if (!data.member.weixinId){
        logger.info('member has no weixin id.');
        logger.info('END');
        return;
    }

    var wechatApiClient = new simpleWechat.Api(data.weixinConfig.appId, data.weixinConfig.appSecret,
        new WechatTokenStore(data.weixinConfig.appId));

    var expire = Date.now() + conf.sessionExpire * 1000;
    var token = crypto.createHmac('md5', conf.keys[0]).update(data.member.weixinId + expire).digest('hex');
    var login = '&loginWeixin=' +  data.member.weixinId + '&loginExpire=' + expire + '&loginToken=' + token;

    logger.info('postest.lakala.com.cn');
    logger.info(login);

    var messageData = {
        touser: data.member.weixinId,
        data: {}
    };
    if (data.messageData) {
        for (var key in data.messageData) {
            messageData[key] = data.messageData[key];
        }
    }
   /* if( messageData.url){
        messageData.url += login;
    }*/


    logger.info(messageData);
    logger.info('start send template message');
    wechatApiClient.post('message/template/send', messageData, function(err, result) {
        logger.info('end send template message');
        logger.info(err, result);

        if (err) {
            return logger.fatal('push message occur err. error: ', err);
        }

        logger.info('END');
    });
};
