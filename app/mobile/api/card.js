var async = require('async');

module.exports = {
	getVouchers: function(req, res, ctx) {
		async.parallel({
			vouchers: function(cb) {
				taiji.card.getAllCards({storeId: ctx.store.id, orderBy: [{field: 'ctime', order: 'DESC'}]}, 'VOUCHER_CARD', null, ctx.member.id, ctx, cb);
			}
		}, function(err, result) {
			if(err) return ctx.jsonback(err);
			var cards = [];
			if(result.vouchers && result.vouchers.value){
				result.vouchers.value.forEach(function(item){
					if(item.groupId && item.status !== 'INACTIVE' || !item.groupId) cards.push(item);
				});
			}
			ctx.jsonback(null,cards);
		});
	},

	getBalance: function(req, res, ctx) {
		async.parallel({
			account: function(cb) {
				taiji.card.getAllCards({storeId: ctx.store.id}, 'BALANCE_ACCOUNT', null, ctx.member.id, ctx, cb);
			},

			cards: function(cb) {
				taiji.card.getAllCards({storeId: ctx.store.id}, 'BALANCE_CARD', null, ctx.member.id, ctx, function(err, result) {
					if (err)
						return cb(err);
					async.map(result.value, function(card, cb) {
						taiji.product.getProduct({storeId: ctx.store.id}, card.cardDefId, ctx, function(err, cardDef) {
							if (err)
								return cb(err);
							card.cardDef = cardDef;
							cb();
						});
					}, function(err) {
						if (err)
							return cb(err);
						cb(null, result);
					});
				});
			}
		}, function(err, result) {
			if (result) {
				result.account = result.account.value[0];
				result.cards = result.cards.value;
			}
			ctx.jsonback(err, result);
		});
	},

	getStampcards: function(req, res, ctx) {
		async.parallel({
			report: function(cb) {
				taiji.report.getTransactionFlowReport4Member({storeId: ctx.store.id}, ctx.member.id, ctx, cb);
			},

			cards: function(cb) {
				taiji.card.getAllCards({storeId: ctx.store.id}, 'STAMP_CARD', null, ctx.member.id, ctx, cb);
			}
		}, function(err, result) {
			if (err)
				return ctx.jsonback(err);

			var report = result.report.recordList;
			var cards = result.cards.value;

			cards.forEach(function(card) {
				card.usage = [];
				report && report.forEach(function(record) {
					for (var k in record.cardUsage) {
						if (record.status == 'FINISHED' && record.cardUsage[k].cardId == card.id && record.cardUsage[k].type != 'CREATE') {
							var usage = record.cardUsage[k];
							for (var i = 0; i < usage.value; i++) {
								card.usage.push({
									datetime: record.datetime,
									orderCode: record.orderCode,
									storeName: record.storeName,
									staffName: record.staffName
								});
							}
						}
					}
				});
			});

			ctx.jsonback(null, cards);
		});
	},

	getPeriodcards: function(req, res, ctx) {
		taiji.card.getAllCards({storeId: ctx.store.id}, 'PERIOD_CARD', null, ctx.member.id, ctx, ctx.jsonback);
	},

	getStampAndPeriodCards: function(req, res, ctx) {
		taiji.card.getAllCards({storeId: ctx.store.id}, null, null, ctx.member.id, ctx, function(err, result) {
			if (err)
				return ctx.jsonback(err);

			var cards = result.value.filter(function(card) {
				return card.type == 'STAMP_CARD' || card.type == 'PERIOD_CARD' || card.type == 'BALANCE_CARD' || card.type == 'DISCOUNT_CARD';
			});

			var cardDefs = {};
			async.map(cards, function(card, cb) {
				if (cardDefs[card.cardDefId])
					return cb();

				cardDefs[card.cardDefId] = 1;
				taiji.product.getProduct({storeId: ctx.store.id}, card.cardDefId, ctx, function(err, cardDef) {
					if (err)
						return cb(err);

					cardDefs[card.cardDefId] = cardDef;
					cb();
				});
			}, function(err) {
				if (err)
					return ctx.jsonback(err);

				ctx.jsonback(null, {
					cards: cards,
					cardDefs: cardDefs
				});
			});
		});
	}
};
