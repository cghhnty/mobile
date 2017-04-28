var APP = appdir(__dirname);
var Router = require(BASE + '/lib/Router');
var routes = require(APP + '/routes');
var router = new Router(routes);
var _404 = require(APP + '/view/404');
var _500 = require(APP + '/view/500');
var cuuid = require('cuuid');
var wxOAuth = require(APP + '/func/wxOAuth');
var crypto = require('crypto');
var wechat = require(BASE + '/module/wechat');
var fs =require('fs');   // 文件操作
var	url =require('url'); // url处理
var http =require('http');
var jade = require('jade');

module.exports = function(req, res, ctx) {
	//console.log('mobile目录首页及输出访问请求');
	//console.log(req.url);
	var route = router.resolve(ctx.pathInfo);
	if (!route)
		return _404(req, res, ctx);
    //console.log(route);
	req.params = ctx.params = route.params;

	if (req.params.requireLogin == undefined)
		req.params.requireLogin = 1;

	// cjh 分享链接不要求检测有无会员信息，允许放行
	if(req.query.share){
		req.params.requireLogin = 0;
	}
	/*if(ctx.pathInfo =='platform/gradeDetail.do'){
		req.params.requireLogin = 0;
	}*/

	if (req.params.contentType == undefined)
		req.params.contentType = 'json';
	try {
		//console.log(route.path);
		var controller = require(APP + '/' + route.path);
	} catch(e){
		//console.log("ffgg");
		return _404(req, res, ctx,"path");
	}
	if (req.params.method) {
		if (controller[req.params.method])
			var handler = controller[req.params.method];
		else
 			return _404(req, res, ctx);
	} else {
		var handler = controller;
	}

	if (req.params.noSession)
		return handler(req, res, ctx);

	var storeId = req.query.storeId || req.body.storeId || null;
	    if(storeId =='undefined'){
			storeId ="";
		}
	    if (!storeId){
		   return _500(req, res, ctx,error("CHANNELID"));
		}

		taiji.store.getStore({storeId: storeId}, ctx, function (err, store){
			if (err)
				return _500(req, res, ctx, err);

			if (!store)
				return _404(req, res, ctx,"obj store");

			ctx.store = store;
			//console.log("查询渠道信息成功+请求:");
			//console.log(ctx.pathInfo);
			if (store.weixinConfig && store.weixinConfig.appId && store.weixinConfig.appSecret)
				ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);

			// get or set sid
			var sid = req.cookie('sid', true) || cuuid();
			//console.log("客户端cookie sid:"+sid);

			// renew cookie sid
			res.cookie('sid', sid, {
				encrypt: true,
				path: '/',
				expires: Date.now() + conf.sessionExpire * 1000
			});

			ctx.sid = ctx.store.id + ':' + sid;

			ctx.session = {
				get: function (name, cb) {
					red.hget(ctx.sid, name, function (err, result) {
						if (err)
							return cb(error('INTERROR', err, ctx));
						cb(null, result);
					});
				},

				set: function (name, value, cb) {
					red.hset(ctx.sid, name, value, function (err, result) {
						if (err)
							err = error('INTERROR', err, ctx);
						cb && cb(err, result);
					});
				},

				delete: function (name, cb) {
					red.hdel(ctx.sid, name, function (err, result) {
						if (err)
							err = error('INTERROR', err, ctx);
						cb && cb(err, result);
					});
				}
			};
			// renew session
			ctx.session.set('lastVisit', Date.now());
			red.expire(ctx.sid, conf.sessionExpire);

			req.session = ctx.session.get;
			res.session = ctx.session.set;

			red.hgetall(ctx.sid, function (err, result) {
				if (err)
					return _500(req, res, ctx, error('INTERROR', err, ctx));

				req.sessions = ctx.sessions = result;

				var memberId, weixinId;

				// url带登录信息
				if (req.query.loginToken && req.query.loginExpire && (req.query.loginWeixin || req.query.loginMember)) {
					//log.log("带微信号等验证信息访问");
					var id = req.query.loginWeixin || req.query.loginMember;
					var flag = false;
					for (var i = 0; i < conf.keys.length; i++) {
						var key = conf.keys[i];
						var token = crypto.createHmac('md5', key).update(id + req.query.loginExpire).digest('hex');
						if (token == req.query.loginToken) {
							if (req.query.loginExpire > Date.now()) {
								if (req.query.loginWeixin) {
									//log.log("获取参数微信id");
									weixinId = req.query.loginWeixin;
									ctx.session.set('weixinId', weixinId);
								} else {
									//log.log("获取参数会员id");
									memberId = req.query.loginMember;
									ctx.session.set('memberId', memberId);
								}
							}else{
								res.setHeader('Content-Type', 'text/html; charset=utf-8');
								return res.end("<span style='color:#ff2f33'>登录验证参数loginExpire已过期!</span>");
							}
							flag =true;
							break;
						}
					}
					if(!flag){
						res.setHeader('Content-Type', 'text/html; charset=utf-8');
						return res.end("<span style='color:#ff2f33'>登录验证参数不通过！</span>");
					}
				} else if (req.sessions.weixinId) { // session存有weixinId
					//console.log("登录微信了，session中存在微信id");
					weixinId = req.sessions.weixinId;
				} else if (req.sessions.memberId) { // session存有memberId
					memberId = req.sessions.memberId;
				}

				if (weixinId) {
					//console.log("通过微信id与渠道storeId查会员信息");
					taiji.member.getMemberByWeixinId({
						storeId: ctx.store.id,
						extraStores: 'CHILDREN'
					}, weixinId, ctx, function (err, member) {
						if (err)
							return _500(req, res, ctx, err);

						if (member) {
							ctx.member = member;

							// 更新头像
							if (ctx.store.weixinConfig.type == 'SERVICE' && ctx.store.weixinConfig.verified && (!ctx.member.avatar || ctx.member.lastModified + 7 * 24 * 60 * 60 * 1000 < Date.now())) {
								model.weixin.updateAvatar(ctx, function (err) {
									if (err)
										return ctx.jsonback(err);
									next();
								});
							} else {
								next();
							}
						} else {
							next();
						}
					});
				} else if (memberId) {
					//console.log("通过会员id与渠道storeId查会员信息");
					taiji.member.getMember({
						storeId: ctx.store.id,
						extraStores: 'CHILDREN'
					}, memberId, ctx, function (err, member) {
						if (err)
							return _500(req, res, ctx, err);

						if (member && !member.deleted)
							ctx.member = member;

						next();
					});
				} else {
					next();
				}

				function next() {
					if (ctx.member)
						return handler(req, res, ctx);

					if (req.query.state == ctx.sid) {
						log.log("输出微信重定向地址");
						log.log(req.url);
						wxOAuth.grant(req, res, ctx, function (err) {
							if (err && req.params.requireLogin)
								return _500(req, res, ctx, err);
							// 首次访问通过优惠券菜单，微信授权成功后，重写路径，方便前端页面缓存数据
							if(ctx.pathInfo=='lakala/center'){
								var redirect = conf.protocol + '://' + req.headers.host +'/'+ctx.pathInfo+'?storeId='+ctx.store.id;
								res.end('<script>location = "' + redirect + '"</script>');
								return;
							}
							handler(req, res, ctx);
						});
					} else if (req.params.requireLogin && req.headers['user-agent'] && req.headers['user-agent'].indexOf('MicroMessenger') != -1 && ctx.store.weixinConfig && ctx.store.weixinConfig.type == 'SERVICE' && ctx.store.weixinConfig.verified) {
						wxOAuth.request(req, res, ctx);
					} else if (req.params.requireLogin == 1){ // 必须登录
						_500(req, res, ctx, error('3PJK7YBO'));
					} else {
						handler(req, res, ctx);
					}
				}
			});
		});
};
