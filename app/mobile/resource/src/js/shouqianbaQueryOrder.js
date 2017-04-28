function ShouqianbaQueryOrder(opts) {
    var me = this;
    me.init(opts);

    document.title = '订单查询';

    me.render();
    var needsCursor = true;
    setInterval(function() {
      var cursor = $('#cursor');
      if (needsCursor) {
        cursor.toggle();
        // if (cursor.css("display") == "block") {
        //   cursor.css("display", "none");
        // } else {
        //   cursor.css("display", "block");
        // }
      } else {
        cursor.toggle(false);
      }
    }, 600);

    api.get('weixin/jsApiSign?url=' + location.href.split('#')[0]).done(function(err, result) {
     // alert(result.appId + ' ' + result.timestamp + ' ' + result.nonceStr + ' ' + result.signature);
      if (result) {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: result.appId, // 必填，公众号的唯一标识
          timestamp: result.timestamp, // 必填，生成签名的时间戳
          nonceStr: result.nonceStr, // 必填，生成签名的随机串
          signature: result.signature,// 必填，签名，见附录1
          jsApiList: ['closeWindow', 'scanQRCode', 'showMenuItems'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      }
    });

    wx.ready(function(){
      if (navigator.userAgent.match(/Android/i)) {
        // alert('Android');
      }
      wx.showMenuItems({
        menuList: ['menuItem:refresh', 'menuItem:addContact'] // 要显示的菜单项，所有menu项见附录3
      });
    });

    wx.error(function(res){
      alert('微信授权失败，请关闭该页面重试');
      // history.go(0);
    });

    $('#qr-scan').on('click', function(){
      wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          // alert(result);
          var input = $('#sn-input');
          if (result.slice(0, 9) == 'CODE_128,') {
            input.html(result.slice(9));
            // $('#addmount').val(result.slice(9));
          } else {
            // $('#addmount').val(result);
            input.html(result);
          }
          input.css('color', '#313131');
          needsCursor = false;
        }
      });
    });

    // 键盘逻辑
    $('#keyboard').on('touchstart', function(e){

        // var input = $('#addmount');
        var input = $('#sn-input');

        var clickEl = $(e.target);
        var key = clickEl.data('key');

        // var originVal = input.val();
        var originVal = input.html() == '请输入订单号' ? '' : input.html();
        var newValue = originVal;
        if (key == 'clear') {
          newValue = '';
        } else if (key == 'del') {
            // 删除键
            newValue = originVal ? originVal.substr(0, originVal.length - 1):'';
        } else {
            // 普通键
            newValue = originVal+key;
        }

        // 订单号长度不超过16位
        if (newValue.toString().length > 16) {
            newValue = originVal;
        }

        if (!newValue) {
          input.css('color', '#dcdcdc');
          newValue = '请输入订单号';
          needsCursor = true;
        } else {
          input.css('color', '#313131');
          needsCursor = false;
          $('#cursor').toggle(false);
        }

        // input.val(newValue);
        input.html(newValue);
    });

    // 检查是否允许下单
    $('#submit').on('touchstart', function(e){
        var orderSn = $('#sn-input').html();
        if (/[0-9]{12,16}/.test(orderSn)) {
          window.location = '/shouqianba/order-detail' + location.search + '&orderSn=' + orderSn;
        } else {
          window.location = '/shouqianba/order-detail' + location.search;
        }
    });
}

ShouqianbaQueryOrder.prototype = {
    defaults: {
        root: '#queryOrder'
    }
};

Module.extend(ShouqianbaQueryOrder);
