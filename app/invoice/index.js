var APP = appdir(__dirname);
var _404 = require(BASE + '/error/404');
var _500 = require(BASE + '/error/500');
var wechat = require(BASE + '/module/wechat');
var Router = require(BASE + '/lib/Router');
var routes = require(APP + '/routes');
var fs =require('fs');    // 文件操作
var router = new Router(routes);
var jade = require('jade');

module.exports = function (req, res, ctx) {

    // 本地测试
    /*if(ctx.pathInfo=='invoice/merchantReg'){
        var weixinId = "oF5THwfC8MJJTAp5FoQE6rzFwMlY";
        var member = {weixinId: weixinId};
        ctx.member = member;
        var merchant ={merchantId:"92200000001445599014456"};
        ctx.merchant = merchant;
        jade.renderFile(JADEdir + '/invoice/merchant/register.jade', ctx, function (err, html) {
            if (err) {
                log.log(err);
                return _500(req, res, ctx, error('MEUOUE2V'));
            }
            ctx.toHtml(html);
        });
        return;
    }*/



   // console.log("invoice/首页及输出请求");
    var route = router.resolve(ctx.pathInfo);
    if (!route)
        return _404(req, res, ctx,"path");
    req.params = ctx.params = route.params;
    var controller = require(APP + '/' + route.path);

    //console.log(APP);
    //console.log(route.path);

    // 授权，获取openid
    if(ctx.pathInfo=='lakala/merchantInvoice'){
        var storeId = req.query.state || null;
        var merchantId = req.query.merchantId || null;
        //console.log(merchantId);
        if (storeId == 'undefined')
            storeId = "";
        if (!storeId)
            return _500(req, res, ctx, error("CHANNELID"));
        taiji.store.getStore({storeId: storeId},ctx, function (err, store){
            if (err)
                return _500(req, res, ctx, err);

            if (!store)
                return _404(req, res, ctx, "obj store");

            ctx.store = store;
            //console.log("查询渠道信息成功+请求:");
            //console.log(ctx.pathInfo);
            if (store.weixinConfig && store.weixinConfig.appId && store.weixinConfig.appSecret)
                ctx.wxapi = new wechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, ctx);

            if (!req.query.code)
                return _500(req, res, ctx,error('CWXH9QM3'));

            ctx.wxapi.request('sns/oauth2/access_token', {
                base: ctx.wxapi.url.base,
                requireAccessToken: false,
                query: {
                    appid: ctx.wxapi.appId,
                    secret: ctx.wxapi.appSecret,
                    code: req.query.code,
                    grant_type: 'authorization_code'
                }
            }, function (err, result) {
                if (err){
                     return  _500(req, res, ctx, {code:err.code,message:"链接失效，请重新扫描二维码！"});
                    /*var realPath = BASE +'/error/err404.html';
                    var indexpage = fs.readFileSync(realPath);
                    res.end(indexpage);*/
                }
                if (result) {
                    //console.log(result);
                    var weixinId = result.openid;
                    ctx.wxapi.get('user/info', {
                        openid: weixinId,
                        lang: 'zh_CN'
                    }, function (err, user) {
                        if (err)
                            return  _500(req, res, ctx, err);
                        if (user) {
                            //console.log(user);
                            var member = {
                                weixinId: user.openid,
                                isSubscribe: user.subscribe
                            }
                            // 关注了公众号初始化详细信息
                            if (user.subscribe == 1){
                                    member.fullName = user.nickname,
                                    member.city = user.city,
                                    member.province = user.province,
                                    member.country = user.country,
                                    member.gender = user.sex == 1 ? 'MALE' : (user.sex == 2 ? 'FEMALE' : null)
                            }
                            ctx.member = member;

                            taiji.store.queryInvoiceMerchant({},merchantId,ctx,function(err,merchant){
                                if(err)
                                    return _500(req, res, ctx, err);
                                if(!merchant||!merchant.shopNo){
                                    //return _404(req, res, ctx,"object merchant");
                                     var merchant ={merchantId:merchantId}
                                       ctx.merchant = merchant;
                                    jade.renderFile(JADEdir + '/invoice/merchant/register.jade', ctx, function (err, html) {
                                        if (err) {
                                            log.log(err);
                                            return _500(req, res, ctx, error('MEUOUE2V'));
                                        }
                                        ctx.toHtml(html);
                                    });
                                    return;

                                }

                                //console.log(merchant);
                                merchant.merchantId = merchantId;
                                ctx.merchant = merchant;
                                controller(req, res, ctx);
                            });


                        }

                    });
                }
            });

        });
    }else{
        if(req.query.merchantId){
            var merchantId = req.query.merchantId;
            taiji.store.queryInvoiceMerchant({},merchantId,ctx,function(err,merchant){
                if(err)
                    return _500(req, res, ctx, err);
                if(!merchant||!merchant.shopNo)
                    return _404(req, res, ctx,"object merchant");

                //console.log(merchant);
                merchant.merchantId = merchantId;
                ctx.merchant = merchant;
                controller(req, res, ctx);
            });

        }else{
            controller(req, res, ctx);
        }
    }



}

