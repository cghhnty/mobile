var wechat = require(BASE + '/module/wechat');
var URL = require('url');

module.exports = {
  jsApiSign: function(req, res, ctx) {
// var wxapi = new wechat.Api(conf.weixin.appId, conf.weixin.appSecret, ctx);
// wxapi.jsApiSign(req.query.url, ctx.jsonback);
    //log.log("jsApiSign: "+req.query.url);
    ctx.wxapi.jsApiSign(req.query.url, ctx.jsonback);
  }
};
