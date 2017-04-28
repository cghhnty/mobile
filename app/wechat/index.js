var APP = appdir(__dirname);
var wechat = require(BASE + '/module/wechat');
var http = require('http');
var mime = require(BASE + '/lib/mime');
var async = require('async');
//var asyncReply = require(APP + '/func/asyncReply');

module.exports = function (req, res, ctx) {
    var pathPieces = ctx.pathInfo ? ctx.pathInfo.split('\/') : [];
    var storeId = pathPieces[0];
    var merchantId = pathPieces[1];
    // console.log(req.url);
    async.waterfall([
        function (done) {
            if (merchantId) {
                taiji.store.getStore({storeId: merchantId}, ctx, function (err, store) {
                    if (err || !store) {
                        done();
                    } else {
                        done(null, store);
                    }
                });
            } else {
                done()
            }
        },
        function (store, done) {
            if (typeof store === 'function') {
                done = store;
            }
            if (typeof store === 'object') {
                done(null, store);
            } else {
                taiji.store.getStore({storeId: storeId}, ctx, done);
            }
        }
    ], function (err, store) {
        if (err || !store)
            return res.end();
        ctx.store = store;

        if (store.weixinConfig.appId && store.weixinConfig.appSecret)
            ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);

        ctx.wxres = new wechat.Response(req, res, store.weixinConfig.token, function (err, msg, wxres) {
            if (err){
                error.log("app/wechat/index: parse weixin xml data failed: "+err);
                return res.end();
            }
            log.log("app/wechat/index: wechat request body data: ",msg);
            ctx.reply = wxres.reply.bind(wxres);
            ctx.message = msg;
           /* if (storeId == conf.sqbStoreId) {
             amqpChannel.publish(conf.queue.wechatEvent.exchange, '', new Buffer(JSON.stringify(msg)));
             }*/

            var controller = require(APP + '/controller/' + msg.MsgType);
            var weixinId = msg.FromUserName;
            //查询渠道会员
            taiji.member.getMemberByWeixinId({
                storeId: store.id,
                extraStores: 'CHILDREN'
            }, weixinId, ctx, function (err, member) {
                if (err)
                    return ctx.reply(err.message);

                if (member && !member.trial) {
                    ctx.member = member;
                    controller(req, res, ctx);

                    // 更新头像
                   /* if (ctx.store.weixinConfig.type == 'SERVICE' && ctx.store.weixinConfig.verified && (!ctx.member.avatar || ctx.member.lastModified + 7 * 24 * 60 * 60 * 1000 < Date.now()) && !(ctx.message.Event in {
                            VIEW: 1,
                            unsubscribe: 1
                        })) {
                        model.weixin.updateAvatar(ctx);
                    }*/
                } else {
                    // 点击菜单跳转链接的事件和取消关注事件不注册会员
                    if (ctx.message.MsgType == 'event' && ctx.message.Event in {VIEW: 1, unsubscribe: 1})
                        return controller(req, res, ctx);
                    // 公众号已认证
                    if (ctx.store.weixinConfig.verified) {
                        ctx.wxapi.get('user/info', {
                            openid: weixinId,
                            lang: 'zh_CN'
                        }, function (err, user) {
                            if (err)
                                return ctx.reply(err.message);

                            var mem = {
                                fullName: user.nickname,
                                gender: user.sex == 1 ? 'MALE' : (user.sex == 2 ? 'FEMALE' : null),
                                avatar: user.headimgurl,
                                city: user.city,
                                province: user.province,
                                country: user.country
                            };
                            // 没关注，但库中存在会员信息（微信网页授权，注册成的会员）
                            if (member) {
                                member.trial = false;
                                member.fullName = mem.fullName;
                                member.gender = mem.gender;
                                member.avatar = mem.avatar;
                                member.city = mem.city;
                                member.province = mem.province;
                                member.country = mem.country;
                                taiji.member.update({storeId: store.id}, member, ctx, function (err, member) {
                                    if (err)
                                        return ctx.reply(err.message);

                                    ctx.member = member;
                                   // downloadAvatar();
                                    controller(req, res, ctx);
                                });
                            } else {
                                member = {
                                    weixinId: weixinId,
                                    registerVia: 'WEIXIN',
                                    fullName: mem.fullName,
                                    gender: mem.gender,
                                    avatar: mem.avatar,
                                    city: mem.city,
                                    province: mem.province,
                                    country: mem.country
                                };
                                enroll(member);
                            }
                        });
                    } else {
                        enroll({
                            weixinId: weixinId,
                            registerVia: 'WEIXIN',
                            fullName: ctx.store.details.name + '微信会员'
                        });
                    }

                    function enroll(member) {
                        taiji.member.enroll({storeId: store.id}, member, null, true, ctx, function (err, member) {
                            if (err)
                                return ctx.reply(err.message);

                            ctx.member = member;
                           // downloadAvatar();
                            controller(req, res, ctx);
                        });
                    }

                   /* function downloadAvatar() {
                        if (!ctx.member.avatar)
                            return;

                        var _req = http.request(ctx.member.avatar, function (_res) {
                            file.uploadImage(_res, mime.extension(_res.headers['content-type']) || 'jpg', ctx, function (err, result) {
                                if (err)
                                    return;

                                ctx.member.avatar = conf.file.base + '/' + result;
                                taiji.member.update({
                                    storeId: store.id,
                                    modifiedFields: ['avatar']
                                }, ctx.member, ctx);
                            });
                        });

                        _req.end();
                    }*/
                }
            });
        });
    });

    //var storeId = ctx.pathInfo;
    //taiji.store.getStore({storeId: storeId}, ctx, function(err, store) {
    //	if (err || !store)
    //		return res.end();
    //
    //	ctx.store = store;
    //
    //	if (store.weixinConfig.appId && store.weixinConfig.appSecret)
    //		ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);
    //
    //	ctx.wxres = new wechat.Response(req, res, store.weixinConfig.token, function(err, msg, wxres) {
    //		if (err)
    //			return res.end();
    //
    //		ctx.reply = wxres.reply.bind(wxres);
    //		ctx.message = msg;
    //
    //		var controller = require(APP + '/controller/' + msg.MsgType);
    //
    //		var weixinId = msg.FromUserName;
    //		taiji.member.getMemberByWeixinId({storeId: store.id, extraStores: 'CHILDREN'}, weixinId, ctx, function(err, member) {
    //			if (err)
    //				return ctx.reply(err.message);
    //
    //			if (member && !member.trial) {
    //				ctx.member = member;
    //				controller(req, res, ctx);
    //
    //				// 更新头像
    //				if (ctx.store.weixinConfig.type == 'SERVICE' && ctx.store.weixinConfig.verified && (!ctx.member.avatar || ctx.member.lastModified + 7 * 24 * 60 * 60 * 1000 < Date.now()) && !(ctx.message.Event in {VIEW: 1, unsubscribe: 1}))
    //					model.weixin.updateAvatar(ctx);
    //			} else {
    //				// 点击菜单跳转链接的事件和取消关注事件不注册会员
    //				if (ctx.message.MsgType == 'event' && ctx.message.Event in {VIEW: 1, unsubscribe: 1})
    //					return controller(req, res, ctx);
    //
    //				if (ctx.store.weixinConfig.verified) {
    //					ctx.wxapi.get('user/info', {
    //						openid: weixinId,
    //						lang: 'zh_CN'
    //					}, function(err, user) {
    //						if (err)
    //							return ctx.reply(err.message);
    //
    //						var mem = {
    //							fullName: user.nickname,
    //							gender: user.sex == 1 ? 'MALE' : (user.sex == 2 ? 'FEMALE' : null),
    //							avatar: user.headimgurl,
    //							city: user.city,
    //							province: user.province,
    //							country: user.country
    //						};
    //
    //						if (member) {
    //							member.trial = false;
    //							member.fullName = mem.fullName;
    //							member.gender = mem.gender;
    //							member.avatar = mem.avatar;
    //							member.city = mem.city;
    //							member.province = mem.province;
    //							member.country = mem.country;
    //							taiji.member.update({storeId: store.id}, member, ctx, function(err, member) {
    //								if (err)
    //									return ctx.reply(err.message);
    //
    //								ctx.member = member;
    //								downloadAvatar();
    //								controller(req, res, ctx);
    //							});
    //						} else {
    //							member = {
    //								weixinId: weixinId,
    //								registerVia: 'WEIXIN',
    //								fullName: mem.fullName,
    //								gender: mem.gender,
    //								avatar: mem.avatar,
    //								city: mem.city,
    //								province: mem.province,
    //								country: mem.country
    //							};
    //							enroll(member);
    //						}
    //					});
    //				} else {
    //					enroll({
    //						weixinId: weixinId,
    //						registerVia: 'WEIXIN',
    //						fullName: ctx.store.details.name + '微信会员'
    //					});
    //				}
    //
    //				function enroll(member) {
    //					taiji.member.enroll({storeId: store.id}, member, null, true, ctx, function(err, member) {
    //						if (err)
    //							return ctx.reply(err.message);
    //
    //						ctx.member = member;
    //						downloadAvatar();
    //						controller(req, res, ctx);
    //					});
    //				}
    //
    //				function downloadAvatar() {
    //					if (!ctx.member.avatar)
    //						return;
    //
    //					var _req = http.request(ctx.member.avatar, function(_res) {
    //						file.uploadImage(_res, mime.extension(_res.headers['content-type']) || 'jpg', ctx, function(err, result) {
    //							if (err)
    //								return;
    //
    //							ctx.member.avatar = conf.file.base + '/' + result;
    //							taiji.member.update({storeId: store.id, modifiedFields: ['avatar']}, ctx.member, ctx);
    //						});
    //					});
    //
    //					_req.end();
    //				}
    //			}
    //		});
    //	});
    //});
};
