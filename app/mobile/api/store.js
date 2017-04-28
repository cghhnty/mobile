module.exports = {
    getBranchStores: function (req, res, ctx) {
        taiji.store.getStoresByParent({storeId: ctx.store.id}, ctx.store.id, ctx, ctx.jsonback);
    },

    getStore: function (req, res, ctx) {
        ctx.jsonback(null, ctx.store);

        // taiji.store.getStore({storeId: ctx.store.id}, ctx, ctx.jsonback);
    },
    getStoreByStoreId: function (req, res, ctx) {
        console.log("getStoreByStoreId");
        console.log(req);
        taiji.store.getStore({storeId: req.query.memberStoreId || ctx.store.id}, ctx, ctx.jsonback);
    },
    getViewConsumeNum: function (req, res, ctx) {
        taiji.store.getViewConsumeNum({storeId: ctx.store.id}, ctx, function (err, count) {
            if (err)
                return jsonback(err, null);
            var isViewConsumeNum = true;
            if (!count) isViewConsumeNum = false;
            return jsonback(null, isViewConsumeNum);
        });
    }
};
