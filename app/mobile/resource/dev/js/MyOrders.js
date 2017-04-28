function MyOrders(opts) {
    var me = this;
    me.init(opts);
    var docTitle = {
        BALANCE_ACCOUNT: "储值账户消费详情",
        BALANCE_CARD: "储值卡消费详情",
        STAMP_CARD: "计次卡消费详情",
        PERIOD_CARD: "时段卡消费详情"
    };
    document.title = docTitle[query.type] || "消费记录";
    me.$root.on("click", ".my-orders-order", function() {
        $(this).find(".my-orders-order-detail-wrap").animate({
            height: "toggle"
        });
        $(this).find(".my-orders-order-detail-toggle i").toggleClass("fa-caret-down").toggleClass("fa-caret-up");
        $(this).toggleClass("my-orders-order-expand");
    });
    me.load();
}

MyOrders.prototype = {
    defaults: {
        root: ".my-orders"
    },
    load: function() {
        var me = this;
        return api.get("report/getTransactionFlowReport4Member", {
            cardId: query.cardId
        }).done(function(err, orders) {
            me.orders = orders;
            me.orders = me.checkOnlyCards(me.orders);
            console.log(orders);
            me.render();
            localStorage.lastVisitMyOrders = Date.now();
        });
    },
    checkOnlyCards: function(value) {
        if (!!value) {
            value.forEach(function(val, index) {
                var isOnlycard = true;
                if (!!val) {
                    val.itemList.forEach(function(val, index) {
                        if (!(val.type in {
                            STAMP_CARD: 1,
                            PERIOD_CARD: 1,
                            DISCOUNT_CARD: 1,
                            BALANCE_CARD: 1
                        })) {
                            isOnlycard = false;
                        }
                    });
                    if (isOnlycard) {
                        value[index].isOnlycard = true;
                    }
                }
            });
        }
        return value;
    },
    payment: function(order) {
        var payment = [];
        if (order.bankPaid) payment.push("银行卡");
        if (order.balancePaid) payment.push("储值账户");
        if (order.hongBaoPaid) payment.push("红包");
        if (order.cashPaid) payment.push("现金");
        for (var cardName in order.cardUsage) {
            if (order.cardUsage[cardName].cardType == "BALANCE_CARD" && order.cardUsage[cardName].type == "DEBIT") {
                payment.push("储值卡");
                break;
            }
        }
        return payment.join("/");
    },
    productName: function(item) {
        var types = {
            RECHARGE: "充值",
            DISCOUNT: "优惠减免",
            VOUCHER_REDEEM: "代金券核销"
        };
        return item.productName || types[item.type] || item.content;
    },
    itemCount: function(items) {
        var n = 0;
        items.forEach(function(item) {
            if (item.type != "DISCOUNT") n += item.quantity;
        });
        return n;
    },
    showCardUsage: function(cardUsage, type) {
        for (var k in cardUsage) {
            if (cardUsage[k].type == type) return;
        }
        return "display: none";
    }
};

Module.extend(MyOrders);
//# sourceMappingURL=MyOrders.js.map