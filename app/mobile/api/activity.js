var async = require('async');

module.exports = {
	/*
	Query:
		storeId,
		id: activityId

	Return:
		weixinActivity
	*/
	getActivity: function(req, res, ctx) {
		taiji.weixin.getActivity({storeId: ctx.store.id}, req.query.id, ctx, ctx.jsonback);
	},

	getLotteryActivity: function(req, res, ctx) {
		taiji.weixin.getActivity({storeId: ctx.store.id}, req.query.id, ctx, function(err, activity) {
			if (err)
				return ctx.jsonback(err);

			if (!activity || !(activity.type in {SCRATCHCARD: 1, WHEEL: 1}))
				return ctx.jsonback(error('JT3ZOPKY')); // 参数错误

/*			var now = Date.now();

			if (now < activity.startTime)
				return ctx.jsonback(error('PJB3CYCZ')); // 活动还没有开始

			if (now > activity.endTime)
				return ctx.jsonback(error('9ARX9CDY')); // 活动已经结束
*/
			var result = {
				activity: activity
			};

			async.parallel([
				function(cb) {
					if (!ctx.member.trial)
						return cb();

					taiji.weixin.getActivityHistories({storeId: ctx.store.id, page: 1, pageSize: 1}, ctx.member.id, activity.id, null, null, null, null, null, ctx, function(err, histories) {
						result.tried = histories.value.length > 0;
						cb();
					});
				},

				function(cb) {
					if (activity.limit == null) {
						result.remaining = null;
						return cb();
					}

					var drawStart = new Date((Date.now() - ((activity.period - 1) * 24 * 3600000))).setHours(0, 0, 0, 0);

					taiji.weixin.getActivityHistories({storeId: ctx.store.id}, ctx.member.id, activity.id, null, null, null, drawStart, null, ctx, function(err, histories) {
						if (err)
							return cb(err);

						histories = histories.value;

						if (histories.length == 0) {
							result.remaining = activity.limit;
							return cb();
						}

						var count = histories.length;

						if (histories[0].status == 'SEALED')
							count--;

						result.remaining = activity.limit - count;
						cb();
					});
				},

				function(cb) {
					async.map(activity.prizes, function(prize, cb) {
						taiji.product.getProduct({storeId: ctx.store.id}, prize.voucherDef, ctx, function(err, voucherDef) {
							if (err)
								return cb(err);
							prize.voucherDef = voucherDef;
							cb();
						});
					}, cb);
				},

				function(cb) {
					taiji.store.getStoresByParent({storeId: ctx.store.id}, ctx.store.id, ctx, function(err, branchStores) {
						if (err)
							return cb(err);

						if (!activity.storeWhiteList) {
							activity.storeWhiteList = branchStores;
						} else {
							activity.storeWhiteList = branchStores.filter(function(branchStore) {
								return activity.storeWhiteList.indexOf(branchStore.id) != -1;
							});
						}
						cb();
					});
				}
			], function(err) {
				if (err)
					return ctx.jsonback(err);

				ctx.jsonback(null, result);
			});
		});
	},

	/*
	Query:
		storeId,
		id: activityId

	Return: number
	*/
	remaining: function(req, res, ctx) {
		var activityId = req.query.id;

		taiji.weixin.getActivity({storeId: ctx.store.id}, req.query.id, ctx, function(err, activity) {
			if (err)
				ctx.jsonback(err);

			if (!activity)
				return ctx.jsonback(error('JT3ZOPKY'));

			var now = Date.now();

			if (now < activity.startTime)
				return ctx.jsonback(error('PJB3CYCZ')); // 活动还没有开始

			if (now > activity.endTime)
				return ctx.jsonback(error('9ARX9CDY')); // 活动已经结束

			if (activity.limit == null)
				return ctx.jsonback(null, null);

			var drawStart = new Date((Date.now() - ((activity.period - 1) * 24 * 3600000))).setHours(0, 0, 0, 0);

			taiji.weixin.getActivityHistories({storeId: ctx.store.id}, ctx.member.id, activityId, null, null, null, drawStart, null, ctx, function(err, result) {
				if (err)
					return ctx.jsonback(err);

				var histories = result.value;

				if (histories.length == 0)
					return ctx.jsonback(null, activity.limit);

				var count = histories.length;

				if (histories[0].status == 'SEALED')
					count--;

				ctx.jsonback(null, activity.limit - count);
			});
		});
	},

	/*
	POST:
		storeId,
		id: activityId

	Return: weixinActivityHistory
	*/
	draw: function(req, res, ctx) {
		var activityId = req.body.id;
		var activity;
		var now = Date.now();

		taiji.weixin.getActivity({storeId: ctx.store.id}, activityId, ctx, function(err, result) {
			if (err)
				return ctx.jsonback(err);

			if (!result)
				return ctx.jsonback(error('JT3ZOPKY')); // 参数错误

			activity = result;

			if (now < activity.startTime)
				return ctx.jsonback(error('PJB3CYCZ')); // 活动还没有开始

			if (now > activity.endTime)
				return ctx.jsonback(error('9ARX9CDY')); // 活动已经结束

			if (ctx.member && ctx.member.trial)
				return ctx.jsonback(error('NOSUBSCRIBENOVOUCHER')); // 请关注后再抽奖~

			var drawStart = new Date((now - ((activity.period - 1) * 24 * 3600000))).setHours(0, 0, 0, 0);

			taiji.weixin.getActivityHistories({storeId: ctx.store.id}, ctx.member.id, activityId, null, null, null, drawStart, null, ctx, function(err, result) {
				if (err)
					return ctx.jsonback(err);

				var histories = result.value;

				// 用户没有参加过这个抽奖活动
				if (histories.length == 0) {
					draw();

				// 最近一次的抽奖未打开
				} else if (histories[0].status == 'SEALED') {
					ctx.jsonback(null, histories[0]);

				// 活动没有抽奖次数限制, 或最近一轮没有抽过奖
				} else if (activity.limit == null || Math.floor((now + 8 * 3600000) / (24 * 3600000)) - Math.floor((histories[0].drawTime + 8 * 3600000) / (24 * 3600000)) >= activity.period) {
					draw();
				} else {
					if (histories.length >= activity.limit)
						ctx.jsonback(error('C9YSANJH')); // 本轮抽奖次数用完
					else
						draw();
				}
			});
		});

		function draw() {
			var top = 0;
			for (var i = 0; i < activity.prizes.length; i++) {
				var prize = activity.prizes[i];
				if (prize.amount > 0)
					top += prize.probability;
			}

			if (top < 100)
				top = 100;

			var rand = top * Math.random();

			var inc = 0;
			var level = -1;
			for (var i = 0; i < activity.prizes.length; i++) {
				var prize = activity.prizes[i];
				if (prize.amount > 0) {
					inc += prize.probability;
					if (rand < inc) {
						level = i;
						prize.amount--;

						taiji.weixin.updateActivity({storeId: ctx.store.id}, activity, ctx, function(err, result) {
							if (err)
								return ctx.jsonback(err);

							save();
						});

						return;
					}
				}
			}

			save();

			function save() {
				var ticket = {
					memberId: ctx.member.id,
					activityId: activityId,
					activityType: activity.type,
					activityName: activity.name,
					level: level,
					status: 'SEALED',
					drawTime: now
				};

				if (level == -1) {
					taiji.weixin.createActivityHistory({storeId: ctx.store.id}, ticket, ctx, ctx.jsonback);
				} else {
					attempt();
				}

				function attempt() {
					ticket.ticketId = Math.random().toString().slice(2, 12);

					taiji.weixin.getActivityHistoryByTicketId({storeId: ctx.store.id}, ticket.ticketId, ctx, function(err, result) {
						if (err)
							return ctx.jsonback(err);

						if (result)
							return attempt();

						taiji.weixin.createActivityHistory({storeId: ctx.store.id}, ticket, ctx, ctx.jsonback);
					});
				}
			}
		}
	},

	/*
	POST:
		storeId,
		id: activityHistoryId

	Return: null
	*/
	open: function(req, res, ctx) {
		taiji.weixin.getActivityHistory({storeId: ctx.store.id}, req.body.id, ctx, function(err, history) {
			if (err)
				return ctx.jsonback(err);

			if (history.status != 'SEALED')
				return ctx.jsonback(error('JT3ZOPKY')); // 参数错误
			
			if (history.level == -1) {
				history.status = 'OPENED';
				taiji.weixin.updateActivityHistory({storeId: ctx.store.id}, history, ctx, ctx.jsonback);
			} else {
				taiji.weixin.getActivity({storeId: ctx.store.id}, history.activityId, ctx, function(err, activity) {
					if (err)
						return ctx.jsonback(err);

					taiji.card.createVoucher({storeId: ctx.store.id},  activity.prizes[history.level].voucherDef, activity.id, ctx.member.id, ctx, function(err, voucher) {
						if (err)
							return ctx.jsonback(err);

						history.status = 'OPENED';
						history.cardId = voucher.id;
						taiji.weixin.updateActivityHistory({storeId: ctx.store.id}, history, ctx, ctx.jsonback);
					});
				});				
			}
		});
	},


	/*
	QUERY:
		storeId,
		type: SCRATCHCARD | WHEEL

	Return:
		weixinActivityHistory list
	*/
	getHistories: function(req, res, ctx) {
		var type = req.query.type;

		taiji.weixin.getActivityHistories({storeId: ctx.store.id, orderBy: [{field: 'ctime', order: 'DESC'}]}, ctx.member.id, null, type, true, null, null, null, ctx, function(err, result) {
			if (err)
				return ctx.jsonback(err);

			var histories = [];
			for (var i = 0; i < result.value.length; i++) {
				var history = result.value[i];
				if (history.status == 'OPENED')
					histories.push(history);
			}

			async.map(histories, function(history, cb) {
				taiji.card.getCardById({storeId: ctx.store.id}, history.cardId, ctx, function(err, card) {
					if (err)
						return err;

					history.card = card;
					cb();
				});
			}, function(err, result) {
				if (err)
					return ctx.jsonback(err);

				ctx.jsonback(null, histories);
			});
		});
	},

	getVoucherActivity: function(req, res, ctx) {
		taiji.weixin.getActivity({storeId: ctx.store.id}, req.query.id, ctx, function(err, activity) {
			if (err)
				return ctx.jsonback(err);

			if (!activity)
				return ctx.jsonback(error('JT3ZOPKY')); // 参数错误

			var result = {
				activity: activity
			};

			async.parallel([
				// 展开 storeWhiteList
				function(cb) {
					taiji.store.getStoresByParent({storeId: ctx.store.id}, ctx.store.id, ctx, function(err, branchStores) {
						if (err)
							return cb(err);

						if (!activity.storeWhiteList) {
							activity.storeWhiteList = branchStores;
						} else {
							activity.storeWhiteList = branchStores.filter(function(branchStore) {
								return activity.storeWhiteList.indexOf(branchStore.id) != -1;
							});
						}
						cb();
					});
				},

				// 展开 voucherDef
				function(cb) {
					taiji.product.getProduct({storeId: ctx.store.id}, activity.voucherDef, ctx, function(err, voucherDef) {
						if (err)
							return cb(err);

						activity.voucherDef = voucherDef;
						cb();
					});
				},

				// 已领取, 获得voucherCard
				function(cb) {
					taiji.weixin.getActivityHistories({storeId: ctx.store.id}, ctx.member.id, activity.id, null, null, null, null, null, ctx, function(err, histories) {
						if (err)
							return cb(err);

						if (histories.value.length == 0)
							return cb();

						taiji.card.getCardById({storeId: ctx.store.id}, histories.value[0].cardId, ctx, function(err, voucher) {
							if (err)
								return cb(err);

							result.voucher = voucher;
							cb();
						});
					});
				}
			], function(err) {
				if (err)
					return ctx.jsonback(err);

				ctx.jsonback(null, result);
			});
		});
	},

	createVoucher: function(req, res, ctx) {
		var now = Date.now();

		taiji.weixin.getActivity({storeId: ctx.store.id}, req.body.id, ctx, function(err, activity) {
			if (err)
				return ctx.jsonback(err);

			if (!activity || activity.type != 'VOUCHER')
				return ctx.jsonback(error('JT3ZOPKY')); // 参数错误

			if (now < activity.startTime)
				return ctx.jsonback(error('PJB3CYCZ')); // 活动还没有开始

			if (now > activity.endTime)
				return ctx.jsonback(error('9ARX9CDY')); // 活动已经结束

			taiji.product.getProduct({storeId: ctx.store.id}, activity.voucherDef, ctx, function(err, voucherDef) {
				if (err)
					return ctx.jsonback(err);

				if (voucherDef.limitNum <= voucherDef.actualPublishNum)
					return ctx.jsonback(error('JF63ICFI')); // 券已领完

				if (ctx.member && ctx.member.trial)
					return ctx.jsonback(error('NOSUBSCRIBENOVOUCHER')); // 请关注后再领券~

				taiji.card.createVoucher({storeId: ctx.store.id}, voucherDef.id, activity.id, ctx.member ? ctx.member.id : null, ctx, function(err, voucher) {
					if (err)
						return ctx.jsonback(err);

					var history = {
						memberId: ctx.member ? ctx.member.id : null,
						activityId: activity.id,
						activityType: activity.type,
						activityName: activity.name,
						cardId: voucher.id,
						level: 0 // -1: 参与活动但未得到奖品, 0: 得到奖品
					};

					taiji.weixin.createActivityHistory({storeId: ctx.store.id}, history, ctx, function(err, history) {
						if (err)
							return ctx.jsonback(err);

						ctx.jsonback(null, voucher);
					});
				});
			});
		});
	}
};
