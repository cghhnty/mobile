var APP = appdir(__dirname);
var keywordsHandler = require(APP + '/func/keywordsHandler');
var asyncReply = require(APP + '/func/asyncReply');
var crypto = require('crypto');
var util = require('util');

module.exports = function(req, res, ctx) {
	//console.log(req.url);
	if (ctx.message.Event == 'subscribe') {
		// 推送上次为推送成功的历史消息
		if (ctx.message.EventKey) {
			var sceneId = ctx.message.EventKey.slice('qrscene_'.length);
			res.end();
			sceneHandler(sceneId, ctx);
		} else {
			//keywordsHandler('关注', ctx);
			res.end();
		}
	} else if (ctx.message.Event == 'CLICK') {
		//keywordsHandler(ctx.message.EventKey, ctx);
		res.end();
	} else if (ctx.message.Event == 'SCAN') {
		res.end();
		sceneHandler(ctx.message.EventKey, ctx);
	} else {
		res.end();
	}
};

function sceneHandler(sceneId, ctx) {
	var expire = Date.now() + conf.sessionExpire * 1000;
	var token = crypto.createHmac('md5', conf.keys[0]).update(ctx.member.weixinId + expire).digest('hex');
	var login = '&loginWeixin=' +  ctx.member.weixinId + '&loginExpire=' + expire + '&loginToken=' + token;

	var pathPieces = ctx.pathInfo ? ctx.pathInfo.split('\/') : [];
	var storeId = pathPieces[0];
	var merchantId = pathPieces[1];
	var msg = '亲，拉卡拉客服小拉欢迎您的光临。';

	if ((0 & sceneId) == 0) {
		log.log('--------------member scan log----------');
		log.log('sceneId : ' + sceneId);
		if (sceneId.substring(5) == 'de_no')
			return asyncReply(msg,ctx);

		red.hget(storeId + ':' + sceneId, 'merchantId', function (err, merchantId) {
			if (err || !merchantId)
				return asyncReply('请重新扫码！',ctx);
			log.log('获取商户参数：[ storeId : ' + storeId + ', sceneId : ' + sceneId + ', merchantId : ' + merchantId + ']');

			red.hset(storeId + ':' + sceneId, 'openId', ctx.member.weixinId, function () {
				taiji.member.getMemberByWeixinIdExp({
					storeId: merchantId,
					extraStores: 'CHILDREN'
				}, ctx.member.weixinId, ctx, function (err, member) {
					if (member) {
						msg = '亲,' + '/:sun' + member.storeIdLabel + '/:sun' + '欢迎您的光临。';
						asyncReply(msg,ctx);
						log.log("app/wechat/controller/event: weixinId: "+member.weixinId+" visit storeId: "+member.storeId+" successed!");
					} else {
						taiji.member.enroll({storeId: ctx.store.id}, {
							weixinId: ctx.member.weixinId,
							registerVia: 'WEIXIN',
							fullName: ctx.member.fullName,
							gender: ctx.member.gender,
							avatar: ctx.member.avatar,
							city: ctx.member.city,
							province: ctx.member.province,
							country: ctx.member.country,
							storeId: merchantId
						}, 'merchant', true, ctx, function (err, member) {
							if (err){
								return asyncReply(err.message?err.message:"merchantId is right?",ctx);
							}
							if(!member||!member.id){
								return asyncReply(" merchantId is right?",ctx);
							}
							taiji.merchantGrade.queryMerchantGrade({}, {
								merchantId: merchantId,
								memberGrades: 'BRONZE'
							}, ctx, function (err, merchantGrade) {
								if (err)
									return asyncReply(err.message,ctx);

								if (merchantGrade&&merchantGrade.id) {
								//注册会员等级
									taiji.memberGrade.regBRONZEGradeForWx({},{"memberId":member.id,"merchantId":merchantId},ctx,function(err,memberGrade){
										//console.log("输出商户id");
										//console.log(merchantId,member.id);
										if (err)
											return asyncReply(err.message,ctx);
									    msg = '亲,' + '/:sun' + member.storeIdLabel + '/:sun' + '欢迎您的光临,恭喜您已经成为' + member.storeIdLabel + '的青铜会员。';
										asyncReply(msg,ctx);
									})
								} else {
									msg = '亲,' + '/:sun' + member.storeIdLabel + '/:sun' + '欢迎您的光临。';
									asyncReply(msg,ctx);
								}

							});
						});
					}
				});
			});
		});
	}else {
		ctx.res.end();
	}
}
