function MyOrder(opts) {
    var me = this;
    me.init(opts);
    document.title = '消费详情';
    me.load();
}

MyOrder.prototype = {
    defaults: {
        root: '.my-order'
    },

    load: function () {
        var me = this;
        var params = {
            orderId: query.orderId,
            orderCode: query.orderCode
        };
        return api.get('report/getTransactionDetail', params).done(function (err, order) {
            me.orders = [order];
            me.orders = me.checkOnlyCards(me.orders);
            // console.log(orders);
            me.randomTicketUrl = 'http://121.199.9.9:3000/diditaxi.html?channel=6d27d9c7b33a3f4369bcf4a321b3475f&from=weixin&timestamp=' + (new Date()).getTime();
            me.render();
            // 以下为随机获取各种券的接口，此处只需要嘀嘀打车故注释掉
            //api.get('shouqianba/randomTicket').done(function (err, result) {
            //    if (!err && result)
            //        if (!result.err && /^http.*(from=weixin)$/.test(result.result))
            //            me.randomTicketUrl = result.result;
            //    me.render();
            //});
        });
    }
};

['payment', 'productName', 'itemCount', 'showCardUsage', 'checkOnlyCards'].forEach(function (method) {
    MyOrder.prototype[method] = MyOrders.prototype[method];
});

Module.extend(MyOrder);
