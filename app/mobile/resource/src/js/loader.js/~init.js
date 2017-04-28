function api(url, opts, cb) {
	if (opts && opts.constructor == Function) {
		cb = opts;
		opts = null;
	}

	if (!opts)
		opts = {};

	url = app.api + '/' + url;

	if (!opts.query)
		opts.query = {};

	opts.query.storeId = store.id;

	var promise = request(url, opts, cb);

	if (!cb) {
		promise.fail(function(err) {
			handleError(err);
		});
	}

	return promise;
}

api.get = function(url, query, cb) {
	if (query && query.constructor == Function) {
		cb = query;
		query = null;
	}

	return api(url, {method: 'GET', query: query}, cb);
};

api.delete = function(url, query, cb) {
	if (query && query.constructor == Function) {
		cb = query;
		query = null;
	}

	return api(url, {method: 'DELETE', query: query}, cb);
};

api.post = function(url, body, cb) {
	if (body && body.constructor == Function) {
		cb = body;
		body = null;
	}

	return api(url, {method: 'POST', body: body}, cb);
};

api.put = function(url, body, cb) {
	if (body && body.constructor == Function) {
		cb = body;
		body = null;
	}

	return api(url, {method: 'PUT', body: body}, cb);
};

function date(timestamp) {
	if (!timestamp)
		timestamp = Date.now();
	else if (timestamp < 10000000000)
		timestamp *= 1000;

	var date = new Date(timestamp);
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function time(timestamp) {
	if (!timestamp)
		timestamp = Date.now();
	else if (timestamp < 10000000000)
		timestamp *= 1000;

	var date = new Date(timestamp);
	return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
}

function datetime(timestamp) {
	return date(timestamp) + ' ' + time(timestamp);
}

function dateOfMonth(timestamp) {
	if (!timestamp)
		timestamp = Date.now();
	else if (timestamp < 10000000000)
		timestamp *= 1000;

	var date = new Date(timestamp);
	return ('0' + date.getDate()).slice(-2);
}

function monthCn(timestamp) {
	if (!timestamp)
		timestamp = Date.now();
	else if (timestamp < 10000000000)
		timestamp *= 1000;

	var month = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
	return month[new Date(timestamp).getMonth()] + '月';
}

function yuan(cent) {
	return (cent / 100).toFixed(2);
}

function link(url, query) {
	url = new Url(app.base + '/' + url).addQuery('storeId', store.id);
	if (query)
		url.addQuery(query);
	return url.format();
}

function mapLink(latitude, longitude, title, addr, tel) {
	return new Url('http://apis.map.qq.com/uri/v1/marker').addQuery({
		marker: 'coord:' + latitude + ',' + longitude + ';title:' + title + ';addr:' + addr + ';tel:' + tel,
		referer: 'm.wosai.cn'
	}).format();
}

function hide(bool) {
	return bool ? 'display: none;' : '';
}

function show(bool) {
	return bool ? '' : 'display: none;';
}

// new by yiwei
function greycolor(bool) {
	return bool ? '' : 'color: rgb(208,235,255);';
}

function img(id, style) {
	var url = imgServer + '/' + id;
	if (style)
		url += '@' + style;
	return url;
}

function modal(opts, apply) {
	var $modal = $('.common-modal');

	if (opts.constructor == String) {
		opts = {
			body: opts
		};
	}

	if (apply)
		opts.apply = apply;

	$modal.find('.common-modal-close').off('.common-modal').on('click.common-modal', function(e) {
		opts.close && opts.close();
	});

	$modal.find('.common-modal-apply').off('.common-modal').on('click.common-modal', function(e) {
		opts.apply && opts.apply();
	});

	render('.common-modal', opts);
	$modal.modal('show');
}

function wxConfig(jsApiList) {
	if (wxConfig.promise)
		return wxConfig.promise;

	var def = $.Deferred();
	wxConfig.promise = def.promise();
	if (!store.weixinConfig) {
		def.reject();
		return wxConfig.promise;
	}

	inc(
		'http://res.wx.qq.com/open/js/jweixin-1.0.0.js',
		function() {
			var url = new Url();
			url.hash = '';
			url = url.format();
			api.get('weixin/jsApiSign', {url: url}).fail(function(err) {
				def.reject(err);
			}).done(function(err, opts) {
				opts.jsApiList = jsApiList;
				wx.config(opts);
				wx.ready(function() {
					def.resolve();
				});
				wx.error(function(err) {
					def.reject(err);
				});
			});
		}
	);

	return wxConfig.promise;
}

function wxOnMenuShare(data) {
	if (!data)
		data = {};

	if (!data.title)
		data.title = document.title;
	if (!data.desc)
		data.desc = '';
	if (!data.link)
		data.link = location.href;
	if (!data.imgUrl)
		data.imgUrl = $('img').prop('src') || res('img/common/logo@200x200.png');

	function cb() {
		$('.common-wx-share-overlay').hide();
	}

	if (!data.success)
		data.success = cb;
	if (!data.cancel)
		data.cancel = cb;

	var url = new Url(data.link);
	url.removeQuery('loginWeixin', 'loginMember', 'loginToken', 'loginExpire');
	if (member)
		url.query.referrer = member.id;
	data.link = url.format();

	wxConfig(['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo']).done(function() {
		wx.onMenuShareTimeline(data);
		wx.onMenuShareAppMessage(data);
		wx.onMenuShareQQ(data);
		wx.onMenuShareWeibo(data);
	});
}

(function() {
	handleError.handlers = {
		_default: function(err) {
			modal(err.message);
		}
	};

	res.data = resdata;
	res.base = app.resource;
	inc.resolveUrl = res;

	FastClick.attach(document.body);

	query = new Url().query;

	if (!standalone) {
		inc(
			'lib/bootstrap/css/bootstrap.css',
			'lib/bootstrap/js/bootstrap.js'
		);
	}

	inc(
		'lib/font-awesome/css/font-awesome.css',
		'css/common.css',
		'html/common.html',
		function() {
			$(document.body).append(inc.get('html/common.html'));

			$('.common-wx-share-overlay, .common-wx-subscribe-overlay').click(function() {
				$(this).hide();
			});

			$('body').on('click', '.common-wx-share', function() {
				$('.common-wx-share-overlay').show();
			});

			$('body').on('click', '.common-wx-subscribe', function() {
				$('.common-wx-subscribe-overlay').show();
			});
		}
	);

	var screenWidth = cookie.get('screenWith');
	if (screenWidth)
		$('html').width(screenWidth);

	if (masterpage) {
		var masterpageUrl = 'html/' + masterpage + '.html';
		inc(masterpageUrl);
	}

	var partialUrl = 'html/' + partial + '.html';

	inc(partialUrl, function() {
		var partial = inc.get(partialUrl);
		if (masterpage) {
			var $masterpage = $(inc.get(masterpageUrl));
			$masterpage.find('.partial-container').append(partial);
			$(document.body).append($masterpage);
		} else {
			$(document.body).append(partial);
		}
	});

	window.addEventListener('beforeunload', function() {
		$('.common-preloader').show();
	}, false);

	// inc('//hm.baidu.com/hm.js?80f8de18a8d0447503c59ab8598d61cd');
})();
