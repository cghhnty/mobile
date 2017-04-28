var APP = appdir(__dirname);
var Router = require(BASE + '/lib/Router');
var routes = require(APP + '/routes');
var router = new Router(routes);
var _404 = require(APP + '/view/404');
var wechat = require(BASE + '/module/wechat');

module.exports = function(req, res, ctx) {
	var route = router.resolve(ctx.pathInfo);
	// console.log(ctx.pathInfo); lakala/qrcode  / lakala/scan   [':controller/:method', 'controller/$1']
	//console.log(route);
	/*{ path: 'controller/lakala',
	params: { controller: 'lakala', method: 'scan' } }*/

	if (!route)
		return _404(req, res, ctx);

	req.params = ctx.params = route.params;

	try {
		var controller = require(APP + '/' + route.path);
	} catch(e) {
		return _404(req, res, ctx);
	}

	if (req.params.controller && req.params.method) {
		if (controller[req.params.method])
			var handler = controller[req.params.method];
		else
			return _404(req, res, ctx);
	} else {
		var handler = controller;
	}

	if (!req.query.storeId)
		return _404(req, res, ctx);

    taiji.store.getStore({storeId: req.query.merchantId}, ctx, function (err, store) {
        if (store && store.weixinConfig && store.weixinConfig.appId && store.weixinConfig.appSecret) {
            ctx.store = store;
            ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);
            handler(req, res, ctx);
        } else {
            taiji.store.getStore({storeId: req.query.storeId}, ctx, function (err, store) {
                if (err || !store)
                    return _404(req, res, ctx);

                ctx.store = store;

                if (store.weixinConfig && store.weixinConfig.appId && store.weixinConfig.appSecret)
                    ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);

                handler(req, res, ctx);
            });
        }
    });
};
