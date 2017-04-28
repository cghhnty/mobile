var email = require(BASE + '/module/email');
module.exports = {
	getMemberEx: function(req, res, ctx) {
		taiji.member.getMemberEx({storeId: ctx.store.id, extraStores: 'CHILDREN'}, ctx.member.id, ctx, ctx.jsonback);
	},
    /**
     * 给拉卡拉云pos会员中心用的
     * @param req
     * @param res
     * @param ctx
     */
    getAllMemberExByChannelMemberId: function(req, res, ctx){
        taiji.member.getAllMemberExByChannelMemberId({storeId: ctx.store.id, extraStores: 'CHILDREN'}, ctx.member.id, ctx, function(err, memberExs){
            if (err)
                return ctx.jsonback(err);

            var countRequest = memberExs.length;
            var error;
            if (!countRequest)
                return ctx.jsonback(null, []);

            memberExs.forEach(function(memberEx){
                console.log('getStore | memberEx: \n', memberEx);
                taiji.store.getStore({storeId: memberEx.member.storeId}, ctx, function(err, store){
                    if (err)
                        return error = err;
                    console.log('getStore | Result: \n', store);
                    countRequest--;
                    memberEx.store = store;

                    if (countRequest == 0) {
                        if (error)
                            ctx.jsonback(error);
                        else
                            ctx.jsonback(null, memberExs);
                    }
                });
            });
        });
    },
    /**
     * 给拉卡拉云pos会员中心用的
     * @param req
     * @param res
     * @param ctx
     */
    getMerchantMemberEx: function(req, res, ctx){
		console.log('getMerchantMemberEx');
		console.log({storeId: req.query.merchantId, hextraStores: 'CHILDREN'});
        taiji.member.getMemberExByWeixinId({storeId: req.query.merchantId, hextraStores: 'CHILDREN'}, ctx.member.weixinId, ctx, function(err, memberEx){
            if (err) {
				console.log(err);
				return ctx.jsonback(err);
			}
			console.log('getMemberExByWeixinId Result:', memberEx);
            taiji.store.getStore({storeId: req.query.merchantId}, ctx, function(err, store){
                if (err) {
					console.log(err);
					return ctx.jsonback(err);
				}

                memberEx.store = store;
                ctx.jsonback(null, memberEx);
            });
        });
    },

	getMember: function(req, res, ctx) {
		taiji.member.getMember({storeId: ctx.store.id, extraStores: 'CHILDREN'}, req.query.memberId, ctx, ctx.jsonback);
	},

	sendAuthcode: function(req, res, ctx) {
		taiji.member.queryMemberByMobile({storeId: ctx.store.id, extraStores: 'CHILDREN'}, req.body.phone, ctx, function(err, members) {
			if (err)
				return ctx.jsonback(err);

			if (!members.length)
				return ctx.jsonback(error('DQN8OCEN')); // 未找到该与手机号码绑定的会员

			if (members.length > 1)
				return ctx.jsonback(error('BIJS4VS7')); // 该手机号码绑定了多个会员

			var member = members[0];

			if (member.id == ctx.member.id)
				return ctx.jsonback(error('SHRT60Y9')); // 已经绑定过该手机号码了

			var authcode = String(Math.random()).slice(-6);
			ctx.session.set('bind-existed-account:authcode', authcode);
			ctx.session.set('bind-existed-account:memberId', member.id);

			var emailBody = 'phoneNumber:' + req.body.phone + ', Merchant:' +ctx.store.details.name + ', member:' + ctx.member.fullName + ', 验证码: ' + authcode;
			email.sendMail(emailBody);
			sms.send({
				to: req.body.phone,
				template: '53HlM1',
				vars: {
					authcode: authcode
				}
			}, ctx, ctx.jsonback);
		});
	},

	verifyAuthcode: function(req, res, ctx) {
		if (ctx.sessions['bind-existed-account:authcode'] != req.body.authcode)
			return ctx.jsonback(error('JGG8SUM3'));

		var memberId = ctx.sessions['bind-existed-account:memberId'];
		taiji.member.getMember({storeId: ctx.store.id, extraStores: 'CHILDREN'}, memberId, ctx, function(err, member) {
			if (err)
				return ctx.jsonback(err);

			var oldMember = ctx.member;
			ctx.member = member;
			ctx.member.weixinId = oldMember.weixinId;
			ctx.member.avatar = oldMember.avatar;
			oldMember.weixinId = null;

			taiji.member.update({storeId: ctx.store.id}, ctx.member, ctx, function(err) {
				if (err)
					return ctx.jsonback(err);

				// 通过微信关注产生的会员, 并且没有交易记录, 可以认定为无用会员, 将其删除
				if (oldMember.registerVia == 'WEIXIN') {
					taiji.order.getOrders({storeId: ctx.store.id, page: 1, pageSize: 1}, oldMember.id, null, null, ctx, function(err, orders) {
						if (err)
							return;

						if (!orders.value.length) {
							taiji.member.removeMember({storeId: ctx.store.id}, oldMember.id, ctx, next);
						} else {
							taiji.member.update({storeId: ctx.store.id}, oldMember, ctx, next);
						}
					});
				} else {
					taiji.member.update({storeId: ctx.store.id}, oldMember, ctx, next);
				}

				function next(err) {
					if (err)
						return ctx.jsonback(err);

					ctx.jsonback(null, ctx.member);

					// 已认证的服务号发送绑定成功信息
					if (ctx.store.weixinConfig.type == 'SERVICE' && ctx.store.weixinConfig.verified) {
						ctx.wxapi.post('message/custom/send', {
							touser: ctx.member.weixinId,
							msgtype: 'text',
							text: {
								content: '绑定成功！您的会员号是' + ctx.member.memberCode + '。\n<a href="' + ctx.app.base + '/my/center?storeId=' + ctx.store.id + '">会员中心</a>'
							}
						});
					}
				}
			});
		});
	}
};
