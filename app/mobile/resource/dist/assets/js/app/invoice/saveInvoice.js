$(function () {
    $('#saveInvoice').click(function () {

        confirm({
            text: '确定要申请开票吗？',
            done: function(data){
                var type = $.trim($('#invoiceType').val());
                var invoice = {
                    mechantId: $.trim($('#merchantId').val()),
                    type: $.trim($('#invoiceType').val()),
                    weixinId: $.trim($('#weixinId').val()),
                    termNo: $.trim($('#termNo').val()),
                    shopName: $.trim($('#shopName').text()),
                    shopNo : $.trim($('#shopNo').val())
                }
                if (type == 'normal') {
                    invoice.invoiceHeader = $.trim($('#invoiceHeader').text()),
                    invoice.phoneNo = $.trim($('#phoneNo').text());
                }else{
                    invoice.invoiceHeader = $.trim($('#invoiceHeader').text()),
                        invoice.taxpayerNo = $.trim($('#taxpayerNo').text()),
                        invoice.bankName = $.trim($('#bankName').text()),
                        invoice.bankCardNo = $.trim($('#bankCardNo').text()),
                        invoice.address = $.trim($('#address').text()),
                        invoice.telPhone = $.trim($('#telPhone').text()),
                        invoice.phoneNo = $.trim($('#phoneNo').text());
                }

                $.ajax({
                    type: 'post',
                    data: invoice,
                    url: '/invoice/saveInvoice.do',
                    success: function (response) {
                        loading.close();
                        //alert("请求成功");
                        location.href = '/invoice/invoiceSuccess';
                    },
                    error: function (jqXHR) {
                        loading.close();
                        alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
                    },
                    beforeSend: function () {
                        loading.open();
                    }
                });

            },
            fall: function(data){  }
        });



    });


});