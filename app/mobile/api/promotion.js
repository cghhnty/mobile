module.exports = {
    getActivePromotions: function(req, res, ctx){
        taiji.groupon.getPromotions({storeId: ctx.store.id}, {status: 'PUBLISHED'}, ctx, ctx.jsonback);
    },
    getNumOfGroup: function(req, res, ctx){
        taiji.groupon.getGroups({storeId: ctx.store.id}, ctx.member.id, null, null, ctx, function(err, result){
            if (!err) {
                result = result.length;
                ctx.jsonback(err, result);
                return;
            }
            ctx.jsonback(err, 0);
        });
    }
};