module.exports = function (req, res, ctx) {
    //console.log("mobile/controller首页及输出请求");
    // console.log(req.url);
    var pathInfo = ctx.pathInfo;
    switch(true){
        case /grade/i.test(pathInfo):
            require(__dirname + '/grade')(req, res, ctx);
            break;
        case /coupon/i.test(pathInfo):
            require(__dirname + '/coupon')(req, res, ctx);
            break;
        case /consume/i.test(pathInfo):
            require(__dirname + '/consume')(req, res, ctx);
            break;
        case /store/i.test(pathInfo):
            require(__dirname + '/store')(req, res, ctx);
            break;
        case /invoic/i.test(pathInfo):
            require(__dirname + '/invoic')(req, res, ctx);
            break;
        case /head/i.test(pathInfo):
            require(__dirname + '/head')(req, res, ctx);
            break;
    }
}