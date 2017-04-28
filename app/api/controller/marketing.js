var cp = require('child_process');

module.exports = {
	signOnQRCode: function(req, res, ctx) {
		if (!ctx.store.weixinConfig || ctx.store.weixinConfig.type != 'SERVICE' || !ctx.store.weixinConfig.verified)
			return res.end();

		red.get(ctx.wxapi.appId + ':signOn', function(err, result) {
			if (err)
				return ctx.jsonback(error('INTERROR', err, ctx));

			if (result)
				return genQRCode(result);

			ctx.wxapi.post('qrcode/create', {
				expire_seconds: 1800,
				action_name: 'QR_SCENE',
				action_info: {
					scene: {
						scene_id: 100001
					}
				}
			}, function(err, result) {
				if (err)
					return ctx.jsonback(err);

				red.set(ctx.wxapi.appId + ':signOn', result.url, 'EX', 1500);
				genQRCode(result.url);
			});
		});

		function genQRCode(text) {
			res.setHeader('Cache-Control', 'max-age=1500');
			res.setHeader('Content-Type', 'image/png');
			var qrcode = cp.spawn('qrencode', ['-o', '-', '-s', 9, text], {stdio: [0, 'pipe', 2]});
			qrcode.stdout.pipe(res);
		}
	}
};
