module.exports = {
	getOrders: function(req, res, ctx) {
		taiji.order.getOrders({storeId: ctx.store.id, page: req.query.page, pageSize: req.query.pageSize, startDate: req.query.startDate}, ctx.member.id, null, req.query.status, ctx, ctx.jsonback);
	}
};
