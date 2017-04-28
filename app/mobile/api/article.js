module.exports = {
	getArticle: function(req, res, ctx) {
		taiji.weixin.getArticle({storeId: ctx.store.id}, req.query.id, ctx, ctx.jsonback);
	}
};
