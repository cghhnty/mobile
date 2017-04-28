var product ={}
product.prototype.getCoupons=function(req, res, ctx){
    taiji.product.getCoupons({method:"getCoupons",params:[{},{memberId:"158b8d5c-cdbc-42ae-9cc1-9813d5c07d39"}],jsonrpc:"2.0", id:1}, ctx, function(err,memberExs){
        if (err)
            return ctx.jsonback(err);

        var countRequest = memberExs.length;
        var error;
        if (!countRequest)
            return ctx.jsonback(null, []);

        memberExs.forEach(function(memberEx){
            console.log('getStore | memberEx: \n', memberEx);
            taiji.store.getStore({storeId: memberEx.member.storeId}, ctx, function(err, store){
                if (err)
                    return error = err;
                console.log('getStore | Result: \n', store);
                countRequest--;
                memberEx.store = store;

                if (countRequest == 0) {
                    if (error)
                        ctx.jsonback(error);
                    else
                        ctx.jsonback(null, memberExs);
                }
            });
        });
    });
}
module.exports = product;