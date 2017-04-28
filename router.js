var fs = require("fs");
var url = require('url');
resTarget = DEBUG ? 'dev' : 'dist';

module.exports = function(req,res) {
	if (!req.headers.host)
		return false;
	
	var userAgent = req.headers['user-agent'];
	var isCrawler = /bot|spider|crawl|index|slurp|Mediapartners-Google/i.test(userAgent);
	var isMobile = /mobile|phone|symbian|palm/i.test(userAgent);

	var urlInfo = url.parse(req.url, true);
	//console.log(urlInfo);
	var path = urlInfo.pathname.slice(1);
	var query = urlInfo.query;
	var pathInfo = path;

	var apps = {
		mobile: {
			base: conf.domain.domainName,
			api: conf.domain.api,
			resource: conf.domain.resource + resTarget
		}
	};

	if (path.substring(0,13) == "lakala/qrcode" || path.substring(0,11) == "lakala/scan") {	
		return {
			apps: apps,
			path: 'app/api',
			pathInfo: pathInfo,
			query: query
		};
	}else if (path.substring(0,6) == "mobile"||req.url=='/'+ conf.weixin.mp_verify) {
		return {
			path: 'framework/static',
			pathInfo: pathInfo
		};
	}else if(path.substring(0,7) == "invoice"||path=='lakala/merchantInvoice'){
		return {
			apps: apps,
			path: 'app/invoice',
			pathInfo: pathInfo,
			query: query
		};
	}else if (path.substring(0,6) == "lakala" || path.substring(0,8) == "platform" || path.substring(0,8) == "my/order" || path.substring(0,9) == "my/center" || path.substring(0,12) == "article/view" || path.substring(0,22) == "my/bind-existed-account" || path.substring(0,8) == "activity" || path.substring(0,3) == "api") {
		return {
			apps: apps,
			app: apps.mobile,
			path: 'app/mobile',
			pathInfo: pathInfo,
			query: query
		};
	}else if(("signature" in query)&&("timestamp" in query)&&("nonce" in query)){
		return {
			apps: apps,
			path: 'app/wechat',
			pathInfo: pathInfo,
			query: query
		};
	}


	return false;
};
