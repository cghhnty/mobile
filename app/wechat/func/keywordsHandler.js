var async = require('async');
var crypto = require('crypto');

module.exports = function(keywords, ctx) {
	keywords = [].concat(keywords, '默认');

	var expire = Date.now() + conf.sessionExpire * 1000;
	var token = crypto.createHmac('md5', conf.keys[0]).update(ctx.member.weixinId + expire).digest('hex');
	var login = '&loginWeixin=' +  ctx.member.weixinId + '&loginExpire=' + expire + '&loginToken=' + token;

	// 多客服
	if (ctx.store.weixinConfig.dkf) {
		for (var i = 0; i < keywords.length; i++) {
			var keyword = keywords[i];
			if (keyword == 0 || keyword.indexOf('客服') != -1) {
				ctx.reply({
					msgType: 'transfer_customer_service'
				});

				ctx.wxapi.post('message/custom/send', {
					touser: ctx.member.weixinId,
					msgtype: 'text',
					text: {
						content: '已将您接入人工服务, 稍后会有客服代表为您服务, 请您耐心等待~'
					}
				});

				return;
			}
		}
	}

	if (keywords.indexOf('消费码') != -1) {
		taiji.card.getMyRedeemCodes({storeId: ctx.store.id}, 6, 1, ctx.member.id, ctx, function(err, result) {
			ctx.reply('请将此消费码 [ ' + result[0] + ' ] 出示给我们的店员。消费码5分钟内有效。');
		});
		return;
	}

	taiji.weixin.queryMessageByKeywords({storeId: ctx.store.id}, keywords, ctx, function(err, msg) {
		//console.log("输出msg");
		if (err || !msg)
			return ctx.res.end();

		var type = msg.msgType.toLowerCase();
		if (type == 'text') {
			var vars = {
				'会员名': ctx.member.fullName,
				'会员号': ctx.member.memberCode
			};
			msg = msg.content.replace(/\{([^}]+)}/g, function($0, $1) {
				if (vars[$1])
					return vars[$1];

				if ($1.indexOf('会员中心') == 0) {
					if ($1 == '会员中心')
						var text = $1;
					else {
						text = $1.slice(5);
					}
					return '<a href="' + ctx.apps.mobile.base + '/my/center?storeId=' + ctx.store.id + login + '">' + text + '</a>';
				}

				return $0;
			});
			ctx.reply(msg);
		} else if (type == 'news') {
			msg = msg.articles;
			ctx.reply(msg);
		} else if (type == '_reference') {
			async.map(msg.references, function(ref, cb) {
				if (ref.type == 'SYSTEM') {
					var systemPages = {
						MY_CENTER: {
							type: 'SYSTEM',
							title: '会员中心',
							description: '会员中心',
							picUrl: ctx.apps.mobile.resource + '/img/my-center/banner_new@2x.png',
							url: ctx.apps.mobile.base + '/my/center?storeId=' + ctx.store.id
						},

						BIND_EXISTED_ACCOUNT: {
							type: 'SYSTEM',
							title: '绑定已有会员号',
							description: '绑定已有会员号',
							picUrl: ctx.apps.mobile.resource + '/img/my-center/banner_new@2x.png',
							url: ctx.apps.mobile.base + '/my/bind-existed-account?storeId=' + ctx.store.id
						}
					};
					cb(null, systemPages[ref.id]);
				} else if (ref.type == 'ARTICLE') {
					taiji.weixin.getArticle({storeId: ctx.store.id}, ref.id, ctx, function(err, article) {
						if (err)
							return cb(err);

						if (!article)
							return cb();

						cb(null, {
							title: article.title,
							description: article.description,
							picUrl: article.thumbUrl,
							url: article.url || ctx.apps.mobile.base + '/article/view?storeId=' + ctx.store.id + '&id=' + article.id
						});
					});
				} else if (ref.type == 'ACTIVITY') {
					taiji.weixin.getActivity({storeId: ctx.store.id}, ref.id, ctx, function(err, activity) {
						if (err)
							return cb(err);

						if (!activity)
							return cb();

						cb(null, {
							title: activity.name,
							description: activity.intro,
							picUrl: activity.thumb || ctx.apps.mobile.resource + '/img/activity-' + activity.type.toLowerCase() + '/thumb.png',
							url: ctx.apps.mobile.base + '/activity/' + activity.type.toLowerCase() + '?storeId=' + ctx.store.id + '&id=' + activity.id
						});
					});
				}
			}, function(err, articles) {
				articles = articles.filter(function(article) {
					return article;
				});

				articles.forEach(function(article) {
					if (article.url.indexOf(ctx.apps.mobile.base) == 0)
						article.url += login;
				});
				ctx.reply(articles);
			});
		}
	});
};
