
$(function(){
	var index,
		data = {}
		data0 = {},
		data1 = {},
		flag0 = false,
		flag1 = false,
	    temp ={}
	
	
	function createDOM(html, d){
		var html = template(html, d);
		$('#invoiceEdit').append($(html));
        startListening();
	};
	
	var invoiceHtml0 = '\
		<ul class="list-unstyled bg-white m-b-n m-t-sm">\
			<li>\
				<span>名称</span><input type="text" name="invoiceHeader" value="<%= invoiceHeader %>" placeholder="请输入企业名称" />\
			</li>\
			<li>\
				<span>纳税人识别号</span><input type="text" name="taxpayerNo" value="<%= taxpayerNo %>" placeholder="请输入纳税人识别号" />\
			</li>\
			<li>\
				<span>开户行</span><input type="text" name="bankName" value="<%= bankName %>" placeholder="请输入开户行" />\
			</li>\
			<li>\
				<span>银行账号</span><input type="text" name="bankCardNo" value="<%= bankCardNo %>" placeholder="请输入银行账号" />\
			</li>\
			<li>\
				<span>地址</span><input type="text" name="address" value="<%= address %>" placeholder="请输入地址" />\
			</li>\
			<li>\
				<span>电话</span><input type="text" name="telPhone" value="<%= telPhone %>" placeholder="请输入电话" />\
			</li>\
			<li>\
				<span>手机号码</span><input type="tel" name="phoneNo" value="<%= phoneNo %>" placeholder="请输入手机号码" />\
			</li>\
			<li>\
				<span>设为默认开票信息</span>\
				<div class="text-right p-t-sm">\
					<label class="i-switch i-switch-md bg-success m-r text-left"><input type="checkbox" name="defaultFlag" <%if(defaultFlag){%> checked <%}%> ><i></i></label>\
				</div>\
			</li>\
		</ul>\
	';
	var invoiceHtml1 = '\
		<ul class="list-unstyled bg-white m-b-n m-t-sm">\
			<li>\
				<span>名称</span><input type="text" name="invoiceHeader" value="<%= invoiceHeader %>" placeholder="请输入姓名/企业名称" />\
			</li>\
			<li>\
				<span>手机号码</span><input type="tel" name="phoneNo" value="<%= phoneNo %>" placeholder="请输入手机号码" />\
			</li>\
			<li>\
				<span>设为默认开票信息</span>\
				<div class="text-right p-t-sm">\
					<label class="i-switch i-switch-md bg-success m-r text-left"><input type="checkbox" name="defaultFlag" <%if(defaultFlag){%> checked <%}%> ><i></i></label>\
				</div>\
			</li>\
		</ul>\
	';
	//发起请求
	$.ajax({
		type: 'get',
		url: '/platform/getHead.do?headId='+$('#headId').val()+'&storeId='+$('#storeId').val(),
		success: function(response){
			loading.close();
			if(response){
				temp = response;
				if(response.type == "profession") {
					index = 0;
					flag0 = true;
					createDOM(invoiceHtml0, response);
					validate1();
				}else if(response.type == "normal"){
					index = 1;
					flag1 = true;
					createDOM(invoiceHtml1, response);
					validate1();
				}

			}

			
			//console.log(response);
		},
		error: function(){
			loading.close();
			alert('网络异常，请求数据失败！')
		},
		beforeSend :function(){
			loading.open();
		}
	});
	
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
    function startListening(){
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
    }
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
        var inputs = $('.invoiceForm ul:eq(0) input');
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
	
	function restSubmit(){
		$('.invoiceSubmit').attr('disabled','disabled');
	}
	$('.invoiceSubmit').click(function(){
		if( index==0 ){
			validate0();
			data = data0;
			if( !flag0 ) return;
		}else if( index==1 ){
			validate1();
			data = data1;
			if( !flag1 ) return;
		}
		console.log(data);
		var inputs = $('.invoiceForm ul:eq(0) input');
		var checkbox = $(inputs[inputs.length-1]);
		var name = checkbox.attr('name');
		if( checkbox.is(":checked") ){
			data[name] = 'true'
		}else{
			data[name] = 'false'
		}
		//console.log(data1);
		//console.log(temp);
		data.weixinId = temp.weixinId;
		//alert(temp.weixinId);
		data.id = temp.id;
		data.type = temp.type;

		$.ajax({
			type: 'post',
			data: data,
			url: '/platform/saveHead.do?storeId='+$('#storeId').val(),
			success: function(response){
				loading.close();
				if (response && response.id)
					//alert("保存成功");
					location.replace('/lakala/invoicHead?storeId='+$('#storeId').val()+'&r='+Math.random());
			},
			error: function(jqXHR){
				loading.close();
				alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
			},
			beforeSend :function(){
				loading.open();
			}
		});
	})
	
	
})







