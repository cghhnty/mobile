var http = require('http');
var mime = require(BASE + '/lib/mime');
var fs = require('fs');

module.exports = {
	updateAvatar: function(ctx, cb) {
		if (!cb)
			cb = function() {};

		ctx.wxapi.get('user/info', {openid: ctx.member.weixinId, lang: 'zh_CN'}, function(err, result) {
			if (err)
				return cb(err);
			if (result.headimgurl) {
				// var myData = {
  		// 			imgurl: result.headimgurl,
  		// 			memberId: ctx.member.id,
  		// 			storeId: ctx.store.id
				// }
				// var outputFilename = '/app/bin/sites/test.wosai.cn/mobile/my.json';
				// fs.appendFileSync(outputFilename, JSON.stringify(myData, null, 4));
				// cb();
				
				red.hget('avatar', ctx.store.id + ':' + ctx.member.id, function(err, info) {
					if (err)
						return cb(err);					
					if (info) {					
				 		return cb();
					} else {

						red.hset('avatar', ctx.store.id + ':' + ctx.member.id, result.headimgurl, function(err, setInfo) {
							if (err){
								err = error('INTERROR', err, ctx);
							}		
							console.log(result.headimgurl);		
								cb && cb(err, setInfo);
								
						});
						red.expire('avatar', 7*24*60*60);
					}
				});							
			} else {
				cb();
			}
		});
	}
};
