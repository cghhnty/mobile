$(function () {
    var index = 0,
        data = {}
    data0 = {},
        data1 = {},
        flag0 = false,
        flag1 = false
    $('#addInvoiceSelect').change(function () {
        listenerSelect();
    });
    function listenerSelect(){
        index = $('#addInvoiceSelect')[0].selectedIndex;
        var value = $('#addInvoiceSelect')[0].options[index].text;
        $('#selectText').text(value);
        $('.invoiceForm ul').addClass('hide').eq(index).removeClass('hide');
        if (index == 0) {
            validate0();
        } else if (index == 1) {
            validate1();
        }
    }
    listenerSelect();

    $(document).on('blur', '.invoiceForm input', function (e) {
        var name = $(this).attr('name');
        var value = $.trim($(this).val());
        if (name == "invoiceHeader") {
            if (value == '')
                alert('名称不能为空');
            if( Tools.chkstrlen(value) > 100)
                alert('名称字数超限');
        } else if (name == "address") {
            if (value == '')
                alert('地址不能为空');
            if( Tools.chkstrlen(value) > 100)
                alert('地址字数超限');
        }else if (name == "taxpayerNo") {
            if (!/^[A-Za-z0-9]{15,20}$/.test(value))
                alert('请输入正确的纳税人识别号');
        } else if (name == "bankName") {
            if (value == '' || value.length == 0)
                alert('银行名字不能为空');
        } else if (name == "bankCardNo") {
            if (!/^\d{1,}$/.test(value))
                alert('银行账号不能为空');
        } else if (name == "telPhone") {
            if(value==''){
                alert('请输入电话');
            }else  if (!/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value)){
                alert('请输入正确的电话号码');
            }
        } else if (name == "phoneNo") {
            if (!/^1[34578]\d{9}$/.test(value))
                alert('请输入正确的手机号码');
        }

    })
    $('.invoiceForm input').bind('keyup cut paste',function(){
        var $this = $(this);
        setTimeout(function(){
            var name = $this.attr('name');
            var value = $.trim($this.val());
            var span = $this.prev('span');

            if (index == 0) {
                if (name == "invoiceHeader" || name == "address") {
                    if (value != '' && Tools.chkstrlen(value) <= 100) {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "bankName") {
                    if (value != '') {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "phoneNo") {
                    if (/^1[34578]\d{9}$/.test(value)) {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "taxpayerNo") {
                    if (/^[A-Za-z0-9]{15,20}$/.test(value)) {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "bankCardNo") {
                    if (/^\d{1,}$/.test(value)) {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "telPhone") {
                    if (/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value)) {
                        validate0();
                        span.removeClass('error');
                        return;
                    }

                }
            } else if (index == 1) {
                if (name == "invoiceHeader") {
                    if (value != '' &&  Tools.chkstrlen(value) <= 100) {
                        validate1();
                        span.removeClass('error');
                        return;
                    }

                } else if (name == "phoneNo") {
                    if (value.length == 11 && /^1[34578]\d{9}$/.test(value)) {
                        validate1();
                        span.removeClass('error');
                        return;
                    }

                }

            }
            span.addClass('error');
            restSubmit();
        },10)
    });

    function validate0() {
        flag0 = true;
        data0 = {};
        var inputs = $('.invoiceForm ul:eq(0) input');

        for (var i = 0; i < inputs.length; i++) {
            var name = $(inputs[i]).attr('name');
            var value = $.trim($(inputs[i]).val());

            if (name == 'bankName') {
                if (!(value != '')) {
                    flag0 = false;
                    break;
                }

            } else if (name == 'invoiceHeader' || name == "address") {
                if (!(value != '' &&  Tools.chkstrlen(value) <= 100)) {
                    flag0 = false;
                    break;
                }

            } else if (name == "phoneNo") {
                if (!(/^1[34578]\d{9}$/.test(value))) {
                    flag0 = false;
                    break;
                }

            } else if (name == "taxpayerNo") {
                if (!(/^[A-Za-z0-9]{15,20}$/.test(value))) {
                    flag0 = false;
                    break;
                }

            } else if (name == "bankCardNo") {
                if (!(/^\d{1,}$/.test(value))) {
                    flag0 = false;
                    break;
                }

            } else if (name == "telPhone") {
                if (!(/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value))) {
                    flag0 = false;
                    break;
                }

            }
            data0[name] = value;

        }
        //console.log(data0)

        if (flag0) {
            $('.invoiceSubmit').removeAttr('disabled');
        } else {
            restSubmit();
        }

    }

    function validate1() {
        flag1 = true;
        data1 = {};
        var inputs = $('.invoiceForm ul:eq(1) input');
        for (var i = 0; i < inputs.length; i++) {
            var name = $(inputs[i]).attr('name');
            var value = $.trim($(inputs[i]).val());

            if (name == 'invoiceHeader') {
                if (!(value != '' && value.length <= 100 )) {
                    flag1 = false;
                    break;
                }

            } else if (name == "phoneNo") {
                if (!(value.length == 11 && /^1[34578]\d{9}$/.test(value))) {
                    flag1 = false;
                    break;
                }

            }
            data1[name] = value;

        }

        if (flag1) {
            $('.invoiceSubmit').removeAttr('disabled');
        } else {
            restSubmit();
        }
        //console.log(data1)
    }

    function restSubmit() {
        $('.invoiceSubmit').attr('disabled', 'disabled');
    }

    $('.invoiceSubmit').click(function () {
        if (index == 0) {
            validate0();
            data = data0;
            if (!flag0) return;
        } else if (index == 1) {
            validate1();
            data = data1;
            if (!flag1) return;
        }

        data.type = $('#addInvoiceSelect').val();
        data.weixinId = $('#loginWeixin').val();
        $.ajax({
            type: 'post',
            data: data,
            url: '/invoice/saveInvoiceHeader.do',
            success: function (response) {
                loading.close();
                if (response && response.id)
                   var headerId = response.id;
                location.href = '/invoice/applyInvoice.do?headerId=' + headerId+'&merchantId='+$('#merchantId').val();
            },
            error: function (jqXHR) {
                loading.close();
                alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
            },
            beforeSend: function () {
                loading.open();
            }
        });
    })


})


