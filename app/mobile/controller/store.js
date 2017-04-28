/**
 * Created by cjh on 2016/9/21.
 */
var APP = appdir(__dirname);
var _500 = require(BASE + '/error/500');
var jade = require('jade');


module.exports=function(req, res, ctx){
    var pathInfo = ctx.pathInfo;
    if(pathInfo=='platform/store.do'){
        var merchantId = req.query.merchantId;
        taiji.store.getStoresByParent({},merchantId,ctx,function(err,result){
            if(err){
                return _500(req, res, ctx, err);
            }
            var obj ={};
            if(result&&result.length>0){
                obj.list = result;
            }else{
                obj.list=[];
            }
            jade.renderFile(JADEdir + '/coupon/storeList.jade',obj,function (err, html){
                if(err){
                    //log.log(err);
                    return _500(req,res,ctx,error('MEUOUE2V'));
                }
                res.writeHead(200, {"Content-Type": "text/html"});
                return res.end(html);
            });
        });
    }
}
