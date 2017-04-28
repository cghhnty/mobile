var http = require('http');
var url = require('url');
var mime = require(BASE + '/lib/mime');

module.exports = {
	request: function(req, res, ctx) {
		var wxConf = ctx.store.weixinConfig;
		var u = url.parse(ctx.url, true);
		delete u.search;
		delete u.query.code;
		delete u.query.state;
		u = url.format(u);

		var redirect = url.parse('https://open.weixin.qq.com/connect/oauth2/authorize');
		delete redirect.search;
		redirect.query = {
			appid: wxConf.appId,
			redirect_uri: u,
			response_type: 'code',
			scope: 'snsapi_base',
			state: ctx.sid
		};
		redirect.hash = '#wechat_redirect';
		redirect = url.format(redirect);

		// 微信 302 重定向有bug, 会请求两次URL, 造成重复注册
		// 并且回到自己页面时, 复制/分享的链接是上一个页面的URL, 即 https://open.weixin.qq.com/... 
		// res.statusCode = 302;
		// res.setHeader('Location', redirect);
		res.end('<script>location = "' + redirect + '"</script>');
	},

	grant: function(req, res, ctx, cb) {
		var wxConf = ctx.store.weixinConfig;

		if (!req.query.code)
			return cb(error('CWXH9QM3'));
       // console.log(ctx.wxapi.url.base); -- https://api.weixin.qq.com
		ctx.wxapi.request('sns/oauth2/access_token', {
			base: ctx.wxapi.url.base,
			requireAccessToken: false,
			query: {
				appid: ctx.wxapi.appId,
				secret: ctx.wxapi.appSecret,
				code: req.query.code,
				grant_type: 'authorization_code'
			}
		}, function(err, result) {
			if (err)
				return cb(err);

			var weixinId = result.openid;
			ctx.session.set('weixinId', weixinId);

			taiji.member.getMemberByWeixinId({storeId: ctx.store.id, extraStores: 'CHILDREN'}, weixinId, ctx, function(err, member) {
				if (err)
					return cb(err);

				if (!member) {
					ctx.wxapi.get('user/info', {
						openid: weixinId,
						lang: 'zh_CN'
					}, function(err, result) {
						var member = {
							weixinId: weixinId,
							registerVia: 'WEIXIN'
						};
                        //cjh  if 没有关注公众号，注册的会员需要审校  else 关注了，库中会员被清，恢复
						if (result.subscribe == 0) {
							member.fullName = result.nickname;
							member.trial = true;
							enroll();
						} else {
							member.fullName = result.nickname;
							member.city = result.city;
							member.province = result.province;
							member.country = result.country;
							member.gender = result.sex == 1 ? 'MALE' : (result.sex == 2 ? 'FEMALE' : null);

							if (result.headimgurl) {
								/*var _req = http.request(result.headimgurl, function(_res) {
									file.uploadImage(_res, mime.extension(_res.headers['content-type']) || 'jpg', ctx, function(err, result) {
										if (err)
											return cb(err);

										member.avatar = conf.file.base + '/' + result;
										enroll();
									});
								});

								_req.on('error', function(err) {
									cb(error('INTERROR', err, ctx));
								});

								_req.end();*/
								member.avatar = result.headimgurl;
								enroll();
							} else {
								member.avatar = null;
								enroll();
							}
						}

						function enroll() {
							taiji.member.enroll({storeId: ctx.store.id}, member, null, true, ctx, function(err, member) {
								if (err)
									return cb(err);

								ctx.member = member;
								cb();
							});
						}
					});
				} else {
					ctx.member = member;
					cb();
				}
			});
		});
	}
};
