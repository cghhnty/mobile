function ArticleView(opts) {
	var me = this;
	me.init(opts);

	var me = this;
	api.get('article/getArticle', {id: query.id}).done(function(err, article) {
		me.article = article;
		document.title = me.article.title;

		var template = 'html/article/template/' + article.template + '.html';
		inc(template, function() {
			me.$root.append(inc.get(template));
			me.render();
		});

		wxOnMenuShare({
			desc: me.article.description,
			imgUrl: me.article.thumbUrl
		});
	});
}

ArticleView.prototype = {
	defaults: {
		root: '.article-view'
	}
};


Module.extend(ArticleView);
