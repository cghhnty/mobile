module.exports = {
	getMarketingTemplate: function(req, res, ctx) {
		taiji.marketing.getMarketingTemplate({storeId: ctx.store.id}, req.query.id, ctx, ctx.jsonback);
	}
};
