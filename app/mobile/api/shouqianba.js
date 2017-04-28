var sqbApiCaller = require(BASE + '/module/sqb');

var config = {
    development: {
        redisDbIndex: 9
    },
    test: {
        redisDbIndex: 9
    },
    production: {
        redisDbIndex: 9
    }
}[opt.options.config];

var topRedisClient;
if (opt.options.config == 'production') {
    topRedisClient = require('redis').createClient('6379', '9e49ac46ec8d11e4.m.cnhza.kvstore.aliyuncs.com', {});
    topRedisClient.auth('9e49ac46ec8d11e4:wosaiAPI2015');
} else {
    topRedisClient = require('redis').createClient({});
}

var status = {
    OK: 'ok'
};

module.exports = {
    queryPoint: function(req, res, ctx){
        sqbApiCaller.http.get('query/' + req.query.id, null, function(err, result){
            if(err)
                return ctx.jsonback(err, null);

            if (result.status != status.OK) {
                return ctx.jsonback({message: result.msg}, null);
            }
            return ctx.jsonback(null, result.data);
        });
    },
    recodeHistory: function(req, res, ctx) {
        var page = req.query.page || 0;

        sqbApiCaller.http.get('history/' + req.query.id + '?page=' + page, null, function(err, result){
            if(err)
                return ctx.jsonback(err, null);

            if (result.status != status.OK) {
                return ctx.jsonback({message: result.msg}, null);
            }
            return ctx.jsonback(null, result.data);
        });
    },
    getPosOrder: function (req, res, ctx) {
        sqbApiCaller.rpc.order.getOrderDetailByOrderSn(req.query.TxSn, ctx, function(err, result) {
            if (!err) {
                console.log(result);
                if (result && result.flag == "POS") {
                    return ctx.jsonback(null, result);
                }
                return ctx.jsonback(null, null);
            }

            console.log(err);
            return ctx.jsonback(err);
        });
    },
    getOrder: function (req, res, ctx) {
        sqbApiCaller.rpc.order.getOrderDetailByOrderSn(req.query.TxSn, ctx, function(err, result) {
            if (!err) {
                console.log(result);
                return ctx.jsonback(null, result);
            }

            console.log(err);
            return ctx.jsonback(err);
        });
    },
    getOrderBatch: function(req, res, ctx){
        var errs = [];
        var results = {};
        var countRequest = req.body.TxSns.length;
        if(!countRequest) return ctx.jsonback(null, results);
        req.body.TxSns.forEach(function(TxSn){
            results[TxSn] = null;
            sqbApiCaller.rpc.order.getOrderDetailByOrderSn(TxSn, ctx, function(err, result) {
                countRequest--;
                if (!err)
                    results[TxSn] = result;
                else
                    errs.push(err);

                if(countRequest == 0) {
                    if (!errs.length){
                        return ctx.jsonback(null, results);
                    }

                    return ctx.jsonback(errs[0]);
                }
            });
        });
    },
    getDuibaOrderBatch: function(req, res, ctx){
        var errs = [];
        var results = {};
        var countRequest = req.body.TxSns.length;
        if(!countRequest) return ctx.jsonback(null, results);
        req.body.TxSns.forEach(function(TxSn){
            results[TxSn] = null;
            sqbApiCaller.http.post('queryOrderByMarketOrderNum', {
                marketOrderNum: TxSn
            }, function(err, result) {
                countRequest--;
                if (err)
                    errs.push(err);
                else if (result.status != status.OK)
                    errs.push({message: result.msg});
                else
                    results[TxSn] = result.data;

                if(countRequest == 0) {
                    if (!errs.length){
                        return ctx.jsonback(null, results);
                    }

                    return ctx.jsonback(errs[0]);
                }
            });
        });
    },
    // Get personal ranking information
    getPersonalRanking: function(req, res, ctx) {
        topRedisClient.select(config.redisDbIndex, function() {
            topRedisClient.hgetall('wechat:' + req.query.id, function(err, result) {
                if (err) {
                    return ctx.jsonback(err);
                }
                return ctx.jsonback(null, result);
            });
        });
    },
    // Get overall ranking list within 7 days
    getSevenDaysRanking: function(req, res, ctx) {
        topRedisClient.select(config.redisDbIndex, function() {
            topRedisClient.get('seven_days_ranking', function(err, result) {
                if (err) {
                    return ctx.jsonback(err);
                }

                var obj = JSON.parse(result);
                if (obj && obj.seven_days_ranking) {
                    var ranking = obj.seven_days_ranking;
                    var requestCount = ranking.length;
                    if (!requestCount) {
                        return ctx.jsonback(null, ranking);
                    }
                    // Get user information for each item in the ranking list
                    ranking.forEach(function(item) {
                        taiji.member.getMemberByWeixinId({storeId: ctx.store.id, extraStores: 'CHILDREN'}, item.weixinId, ctx, function(error, member) {
                            requestCount--;
                            if (error) {
                                console.log(error);
                            } else {
                                item.avatar = member ? member.avatar : '';
                                if (item.avatar.length > 0 && !item.avatar.match('^http')) {
                                    item.avatar = 'http://images.wosaimg.com/' + item.avatar;
                                }
                                item.name = member ? member.fullName : '';
                                item.location = '';
                                if (member) {
                                    if (member.province && member.city) {
                                        item.location = member.province + ' ' + member.city;
                                    } else if (member.province) {
                                        item.location = member.province;
                                    }
                                }
                            }

                            if (!requestCount) {
                                // Truncate each user name to protect privacy
                                ranking.forEach(function(item) {
                                    if (!item.name) item.name = '';
                                    if (item.name.length < 2) {
                                        item.name = '昵称*';
                                    } else {
                                        item.name = item.name.slice(0, 2) + '*';
                                    }
                                });
                                return ctx.jsonback(null, obj);
                            }
                        });
                    });
                } else {
                    return ctx.jsonback(null, []);
                }
            });
        });
    },
    // Get overall ranking list of all times
    getTotalRanking: function(req, res, ctx) {
        topRedisClient.select(9, function() {
            topRedisClient.get('total_ranking', function(err, result) {
                if (err) {
                    return ctx.jsonback(err);
                }

                var obj = JSON.parse(result);
                if (obj && obj.total_ranking) {
                    var ranking = obj.total_ranking;
                    var requestCount = ranking.length;
                    if (!requestCount) {
                        return ctx.jsonback(null, ranking);
                    }
                    // Get user information for each item in the ranking list
                    ranking.forEach(function(item) {
                        taiji.member.getMemberByWeixinId({storeId: ctx.store.id, extraStores: 'CHILDREN'}, item.weixinId, ctx, function(error, member) {
                            requestCount--;
                            if (error) {
                                console.log(error);
                            } else {
                                item.avatar = member ? member.avatar : ''; // Default image
                                if (item.avatar.length > 0 && !item.avatar.match('^http')) {
                                    item.avatar = 'http://images.wosaimg.com/' + item.avatar;
                                }
                                item.name = member ? member.fullName : ''; // Default name
                                item.location = '';
                                if (member) {
                                    if (member.province && member.city) {
                                        item.location = member.province + ' ' + member.city;
                                    } else if (member.province) {
                                        item.location = member.province;
                                    }
                                }
                            }

                            if (!requestCount) {
                                // Truncate each user name to protect privacy
                                ranking.forEach(function(item) {
                                    if (!item.name) item.name = '';
                                    if (item.name.length < 2) {
                                        item.name = '昵称*';
                                    } else {
                                        item.name = item.name.slice(0, 2) + '*';
                                    }
                                });
                                return ctx.jsonback(null, obj);
                            }
                        });
                    });
                } else {
                    return ctx.jsonback(null, []);
                }
            });
        });
    }
};

