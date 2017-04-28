/**
 * Created by cjh on 2016/11/16.
 */
module.exports = function (msg, ctx) {
    // 判断是否给会员推送欢迎语
    if (ctx.store.weixinConfig.dkf) {
        ctx.wxapi.post('message/custom/send', {
            touser: ctx.member.weixinId,
            msgtype: 'text',
            text: {
                content: msg
            }
        },function(err,result){
            if(err){
                error.log("wechat/func/asyncReply: err: "+err);
            }
        });
    }
}

