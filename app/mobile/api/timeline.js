module.exports = {
	getList: function(req, res, ctx) {
		taiji.weixin.getCustomerEvents({storeId: ctx.store.id, page: req.query.page, pageSize: req.query.pageSize, startDate: req.query.startDate}, req.query.memberId, null, ctx, ctx.jsonback);
	},

	getItem: function(req, res, ctx) {
		taiji.member.getTimelineItem({storeId: ctx.store.id}, req.query.id, ctx, ctx.jsonback);
	}
};
