"use strict";
;(function(){
// 查看适应门店
$(document).on('click', '#searchStore', function (){
    var isHasOfflineStore = $('#isHasOfflineStore').val();
    if(isHasOfflineStore=='0'){
        return;
    }
    //优惠券对应的商户Id
    var  merchantId = $('#merchantId').val();
    this.href='/platform/store.do?storeId='+$('#channelId').val()+'&merchantId=' + merchantId;
});
})();