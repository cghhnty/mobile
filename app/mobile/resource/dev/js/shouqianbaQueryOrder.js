function ShouqianbaQueryOrder(opts) {
    var me = this;
    me.init(opts);
    document.title = "订单查询";
    me.render();
    var needsCursor = true;
    setInterval(function() {
        var cursor = $("#cursor");
        if (needsCursor) {
            cursor.toggle();
        } else {
            cursor.toggle(false);
        }
    }, 600);
    api.get("weixin/jsApiSign?url=" + location.href.split("#")[0]).done(function(err, result) {
        if (result) {
            wx.config({
                debug: false,
                appId: result.appId,
                timestamp: result.timestamp,
                nonceStr: result.nonceStr,
                signature: result.signature,
                jsApiList: [ "closeWindow", "scanQRCode", "showMenuItems" ]
            });
        }
    });
    wx.ready(function() {
        if (navigator.userAgent.match(/Android/i)) {}
        wx.showMenuItems({
            menuList: [ "menuItem:refresh", "menuItem:addContact" ]
        });
    });
    wx.error(function(res) {
        alert("微信授权失败，请关闭该页面重试");
    });
    $("#qr-scan").on("click", function() {
        wx.scanQRCode({
            needResult: 1,
            scanType: [ "qrCode", "barCode" ],
            success: function(res) {
                var result = res.resultStr;
                var input = $("#sn-input");
                if (result.slice(0, 9) == "CODE_128,") {
                    input.html(result.slice(9));
                } else {
                    input.html(result);
                }
                input.css("color", "#313131");
                needsCursor = false;
            }
        });
    });
    $("#keyboard").on("touchstart", function(e) {
        var input = $("#sn-input");
        var clickEl = $(e.target);
        var key = clickEl.data("key");
        var originVal = input.html() == "请输入订单号" ? "" : input.html();
        var newValue = originVal;
        if (key == "clear") {
            newValue = "";
        } else if (key == "del") {
            newValue = originVal ? originVal.substr(0, originVal.length - 1) : "";
        } else {
            newValue = originVal + key;
        }
        if (newValue.toString().length > 16) {
            newValue = originVal;
        }
        if (!newValue) {
            input.css("color", "#dcdcdc");
            newValue = "请输入订单号";
            needsCursor = true;
        } else {
            input.css("color", "#313131");
            needsCursor = false;
            $("#cursor").toggle(false);
        }
        input.html(newValue);
    });
    $("#submit").on("touchstart", function(e) {
        var orderSn = $("#sn-input").html();
        if (/[0-9]{12,16}/.test(orderSn)) {
            window.location = "/shouqianba/order-detail" + location.search + "&orderSn=" + orderSn;
        } else {
            window.location = "/shouqianba/order-detail" + location.search;
        }
    });
}

ShouqianbaQueryOrder.prototype = {
    defaults: {
        root: "#queryOrder"
    }
};

Module.extend(ShouqianbaQueryOrder);
//# sourceMappingURL=shouqianbaQueryOrder.js.map