module.exports = {
	getTransactionFlowReport4Member: function(req, res, ctx) {
		taiji.store.getViewConsumeNum({storeId: ctx.store.id}, ctx, function(err, count){
			if(err) return ctx.jsonback(err);
			var param1 = {
				storeId: ctx.store.id
			};
			if(!count){
				return ctx.jsonback(null, 0);
			}
			if(count > 0){
				param1.page = 1;
				param1.pageSize = count;
			}			
			taiji.report.getTransactionFlowReport4Member(param1, ctx.member.id, ctx, function(err, result) {
				if (err)
					return ctx.jsonback(err);
				console.log(param1);
				var records = result.recordList || [];

				if (!req.query.cardId)
					return ctx.jsonback(err, records);

				records = records.filter(function(record) {
					for (var k in record.cardUsage) {
						if (record.cardUsage[k].cardId == req.query.cardId)
							return true;
					}
					return false;
				});

				ctx.jsonback(null, records);
			});
		});


	},

	getBalanceCardRedeemReport: function(req, res, ctx) {
		taiji.report.getBalanceCardRedeemReportByCard({storeId: ctx.store.id}, req.query.id, ctx, function(err, result) {
			ctx.jsonback(err, result && result.records);
		});
	},
	getViewConsumeNum: function(req, res, ctx) {
		taiji.store.getViewConsumeNum({storeId: ctx.store.id}, ctx, function(err, count){
			if(err) 
				return ctx.jsonback(err,null);
			var isViewConsumeNum = true;
			if(!count) isViewConsumeNum = false;
			return ctx.jsonback(null,isViewConsumeNum);
		});
	},

	getTransactionDetail: function(req, res, ctx) {
		if(!!req.query.orderId)
			taiji.report.getTransactionDetailByOrderId({storeId: ctx.store.id}, req.query.orderId, ctx, ctx.jsonback);
		else if(!!req.query.orderCode)
			taiji.report.getTransactionDetail({storeId: ctx.store.id}, req.query.orderCode, ctx, ctx.jsonback);
		
	}
};
