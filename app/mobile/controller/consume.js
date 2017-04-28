/**
 * Created by cjh on 2016/9/21.
 */
var _500 = require(BASE + '/error/500');

module.exports= function(req, res, ctx){
    var pathInfo = ctx.pathInfo;
    if(pathInfo=='platform/consumeList.do'){
        var weixinId = req.query.weixinId || req.body.weixinId || null;
        taiji.order.getOrdersByWeixinId({},{"weixinId":weixinId},ctx,function(err,result){
            if (err) {
                return _500(req, res, ctx, err);
            }

            var obj = {};
            if(result){
                if (result.value[1].length> 0) {
                    obj.pList = result.value[1];
                }
            }
            var o = JSON.stringify(obj);
            res.writeHead(200, {
                'Content-Type': 'application/json;charset=utf-8'
            });
            // console.log(o);
            res.end(o);
            return;
        });

    }

}