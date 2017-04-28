/**
 * 拉卡拉扫码到店接口
 *
 * 1. 请求二维码时带上渠道 storeId 和商户 sotreId
 *  会返回过期时间／二维码地址／随机ID
 * 2. 轮询扫描状态时带上从上一接口返回的随机 ID
 *
 * Created by Session on 15/10/26.
 */
var domain = require('domain');
var event = require('events');

var expireSeconds = 604800; // 604800/3600*24 =7天

module.exports = {
    qrcode: function(req, res, ctx){
        var d = domain.create();
        d.on('error', function(e){
           // console.error(e);
            error.log("app/api/controller/lakala: create qrcode err: "+ e.stack);
            return ctx.jsonback({code: 10000, msg: '系统繁忙'});
        });
        d.add(red);

        //调用微信接口，获取生成二维码的ticket，进而获取二维码图片
        d.run(function(){
            generateSceneId(0, function(scene_id){
                ctx.wxapi.post('qrcode/create', {
                    expire_seconds: expireSeconds,
                    action_name: 'QR_SCENE',
                    action_info: {
                        scene: {
                            scene_id: scene_id
                        }
                    }
                }, function(error, ticket){
                    if(error)
                        throw new Error(error);

                    red.hset(req.query.storeId+':'+scene_id, 'merchantId', req.query.merchantId, function(err){
                        if (err)
                            throw new Error(err);

                        red.expire(req.query.storeId+':'+scene_id, ticket.expire_seconds+10, function(err){
                            if (err)
                                throw new Error(err);

                            ctx.jsonback(null, {
                                expire: (ticket.expire_seconds-60)*1000,
                                qrcode: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+ticket.ticket,
                                qrcodeText: ticket.url,
                                sceneId: scene_id
                            })
                        });
                    });
                });
            });
            //生成随机数sceneId
            function generateSceneId(base, cb){
                var sceneId = base + Math.floor(Math.random() * 268435454);
                if (sceneId < 100001) generateSceneId(base, cb);
                red.exists(req.query.storeId +':'+ sceneId, function(err, result){
                    if (err)
                        throw new Error(err);

                    if (result > 0) {
                        generateSceneId(base, cb);
                    }else{
                        cb(sceneId);
                    }
                });
            }
        });
    },
    //扫描二维码
    scan: function(req, res, ctx){
        var d = domain.create();
        d.on('error', function(e){
            console.error(e);
            clearInterval(timer);
            return ctx.jsonback({code: 10000, msg: '系统繁忙'});
        });

        d.run(function(){
            red.exists(req.query.storeId+':'+req.query.sceneId, function(err, result){
                if (err)
                    throw new Error(err);

                if (!result) {
                    log.log('no qrcode info in db');
                    return ctx.jsonback(null, null);
                }

                red.hmget(req.query.storeId+':'+req.query.sceneId, 'merchantId', 'openId', function(err, result){
                    if (err)
                        throw new Error(err);

                    if (!result || !result[1]){
                        log.log('user do not login');
                        return ctx.jsonback(null, null);
                    }

                    log.log('get member');
                    taiji.member.getMemberByWeixinId({storeId: result[0], extraStores: 'CHILDREN'}, result[1], ctx, function(err, member){
                        if (err)
                            throw new Error(err);

                        if (!member) {
                            log.log('no member in system. open id: '+result[1]);
                            return ctx.jsonback(null, null);
                        }

                        red.hdel(req.query.storeId+':'+req.query.sceneId, 'openId');

                        log.log('Login success');
                        ctx.jsonback(null, member);
                    });
                });
            });
        });
    }
};

