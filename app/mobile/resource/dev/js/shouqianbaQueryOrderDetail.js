function ShouqianbaQueryOrderDetail(opts) {
    var me = this;
    me.init(opts);
    document.title = "订单详情";
    var payWayMap = {
        WEIXIN: "微信支付",
        ALIPAY: "支付宝",
        ALIPAY_OPEN: "支付宝2.0",
        LAKALA: "银行卡",
        BAIFUBAO: "百度钱包",
        JD: "京东钱包",
        UNIONPAY: "银联钱包",
        QQ: "QQ钱包"
    };
    me.render();
    $("#fail-container").hide();
    $("#detail-container").hide();
    $("#back-btn1").on("touchstart", function(e) {
        history.go(-1);
    });
    $("#back-btn2").on("touchstart", function(e) {
        history.go(-1);
    });
    var orderSn = query.orderSn;
    if (orderSn) {
        api.get("shouqianba/getPosOrder", {
            TxSn: orderSn
        }).done(function(err, order) {
            if (err || !order) {
                console.log(err);
                $("#fail-container").show();
                $("#detail-container").hide();
            } else {
                console.log(order);
                order.ctime_str = formatDate(order.ctime);
                var receiptAmount = parseFloat(order.receipt_amount);
                if (isNaN(receiptAmount) || receiptAmount == 0) {
                    me.trade_amount = order.total_fee;
                } else {
                    me.trade_amount = (receiptAmount / 100).toFixed(2) + "";
                }
                me.payway = payWayMap[order.pay_way];
                me.orderStatus = orderStatus(order.status);
                me.order = order;
                $("#fail-container").hide();
                $("#detail-container").show();
            }
            me.render();
        });
    } else {
        $("#fail-container").show();
        $("#detail-container").hide();
        me.render();
    }
    function formatDate(time) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = padStr(date.getMonth() + 1);
        var day = padStr(date.getDate());
        var hour = padStr(date.getHours());
        var min = padStr(date.getMinutes());
        var sec = padStr(date.getSeconds());
        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    }
    function orderStatus(status) {
        var statusLabel = $("#order-status");
        if (status == 0) {
            statusLabel.css("color", "#7D7D7D");
            return "未支付";
        } else if (status == 1) {
            statusLabel.css("color", "#8fc31f");
            return "交易成功";
        } else if (status == 2) {
            statusLabel.css("color", "#7D7D7D");
            return "已退款";
        } else if (status == 3) {
            statusLabel.css("color", "#e60012");
            return "交易失败";
        } else if (status == 404) {
            statusLabel.css("color", "#e60012");
            return "交易关闭";
        }
        return "未知状态";
    }
    function padStr(i) {
        return i < 10 ? "0" + i : "" + i;
    }
}

ShouqianbaQueryOrderDetail.prototype = {
    defaults: {
        root: "#order-detail"
    }
};

Module.extend(ShouqianbaQueryOrderDetail);
//# sourceMappingURL=shouqianbaQueryOrderDetail.js.map