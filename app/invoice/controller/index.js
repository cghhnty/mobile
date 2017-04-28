module.exports = function (req, res, ctx) {
    //console.log("mobile/controller首页及输出请求");
    // console.log(req.url);
    var pathInfo = ctx.pathInfo;
    switch(true){
        case /header/i.test(pathInfo):
            require(__dirname + '/invoiceHeader')(req, res, ctx);
            break;
        case /merchant/i.test(pathInfo):
            require(__dirname + '/merchantReg')(req, res, ctx);
            break;
        case /invoice/i.test(pathInfo):
            require(__dirname + '/invoice')(req, res, ctx);
            break;
    }
}