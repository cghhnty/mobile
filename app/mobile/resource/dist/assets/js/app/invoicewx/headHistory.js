
$(function(){
	var delflag;
	$(document).on('click','.invoiceSlideDown',function(){
		var amt = $(this).prev('ul');
		var $this = this;
		amt.slideToggle('fast',function(){
			var span = $($this).children('span');
			if( span.hasClass('icon-icon_arrowLeft') ){
				span.removeClass().addClass('icon-icon_arrowTop');
			}else{
				span.removeClass().addClass('icon-icon_arrowLeft');
			}
		});
	})
	$(document).on('click','.delHead',function(){
		var id = $(this).data('info');
		//$ajax
		confirm({
			text: '确定要删除该开票信息吗？',
			done: function (data) {
				$.ajax({
					type: 'get',
					//data: data,
					url: '/platform/delHead.do?id='+id+'&storeId='+$('#storeId').val(),
					success: function(response){
						loading.close();
						if(response&&response.returnCode=='000000'){
							delflag =1;
							ajax();
						}else{
							alert('删除失败');
						}

					},
					error: function(jqXHR){
						loading.close();
						alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
					},
					beforeSend :function(){
						loading.open();
					}
				});
			},
			fail: function (data) { }
		})
	})
	function createDOM(d){
		if(!d){
			$('#historyEmpty').removeClass('hide');
			$('#invoiceChange').addClass('hide');
			return false;
		}else{
			$('#historyEmpty').addClass('hide');
			$('#invoiceChange').removeClass('hide');
		}

		var html='';
			for (var i = 0; i < d.length; i++) {
				var item = d[i];
				item.storeId = $('#storeId').val();
				item.weixinId = item.weixinId ? item.weixinId : "";
				item.invoiceHeader = item.invoiceHeader ? item.invoiceHeader : "";
				item.phoneNo = item.phoneNo ? item.phoneNo : "";
				item.bankName = item.bankName ? item.bankName : "";
				item.bankCardNo = item.bankCardNo ? item.bankCardNo : "";
				item.address = item.address ? item.address : "";
				item.telPhone = item.telPhone ? item.telPhone : "";
				item.taxpayerNo = item.taxpayerNo ? item.taxpayerNo : "";
				item.type = item.type ? item.type : "";
				item.defaultFlag = item.defaultFlag ? item.defaultFlag : false;
				if (item.type == "profession") {
					html += template(invoiceHtml0, item);
				} else if (item.type == "normal") {
					html += template(invoiceHtml1, item);
				}

		}

		if(delflag==1){
			$('#invoiceChange').html($(html));
		}else{
			$('#invoiceChange').append($(html));
		}

	};
	
	var invoiceHtml0 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
				<ul class="list-unstyled padder-sm p-t-sm l-h-md m-b-none">\
					<li class="pos-rlt" style="padding-right:40px; padding-left:100px;min-height:22px;"><span class="absolute-left">名称：</span><%= invoiceHeader %></li>\
					<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:100px;min-height:22px;"><span class="absolute-left">纳税人识别号：</span><%= taxpayerNo %></li>\
				</ul>\
				<ul class="list-unstyled padder-sm l-h-md m-b-none" style="display:none">\
					<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">开户行：</span><%= bankName %></li>\
					<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">银行账号：</span><%= bankCardNo %></li>\
					<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">地址：</span><%= address%></li>\
					<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">电话：</span><%= telPhone %></li>\
					<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">手机号码：</span><%= phoneNo %></li>\
				</ul>\
            <div class="text-center padder-v-sm text-info el-click invoiceSlideDown"><span class="icon-icon_arrowLeft"></span></div>\
            <div class="clear b-t">\
				<% if(defaultFlag==true){ %> <div class="pull-left padder-v-sm m-l-sm text-info"><span class="icon-icon_currentslt m-r-xs v-a-middle"></span>默认</div> <%}%>\
                <a href="/lakala/editHead?id=<%= id %>&storeId=<%= storeId %>" class="pull-right padder-v-sm m-r-sm block"><span class="icon-icon_edit text-info m-r-xs"></span>编辑</a>\
                <span data-info="<%= id %>" class="delHead pull-right padder-v-sm m-r-sm block el-click"><span class="icon-icon_del text-info m-r-xs"></span>删除</span>\
            </div>\
            <span class="icon-icon_invoice1 pos-abt text-danger font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';
	var invoiceHtml1 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
				<ul class="list-unstyled padder-sm p-t-sm l-h-md m-b-none">\
					<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">名称：</span><%= invoiceHeader %></li>\
					<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">手机号码：</span><%= phoneNo %></li>\
				</ul>\
            <div class="clear b-t m-t-sm">\
				<% if(defaultFlag==true){ %> <div class="pull-left padder-v-sm m-l-sm text-info"><span class="icon-icon_currentslt m-r-xs v-a-middle"></span>默认</div> <%}%>\
                <a href="/lakala/editHead?id=<%= id %>&storeId=<%= storeId %>" class="pull-right padder-v-sm m-r-sm block"><span class="icon-icon_edit text-info m-r-xs"></span>编辑</a>\
                <span data-info="<%= id %>" class="delHead pull-right padder-v-sm m-r-sm block el-click"><span class="icon-icon_del text-info m-r-xs"></span>删除</span>\
            </div>\
            <span class="icon-icon_invoice2 pos-abt text-info font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';
	function ajax(){
	$.ajax({
		type: 'get',
		//data: data,
		url: '/platform/head.do?weixinId='+$('#loginWeixin').val()+'&storeId='+$('#storeId').val(),
		success: function(response){
			loading.close();
			if(response&&response.list){
				createDOM(response.list);
			}else{
				createDOM();
				//alert("没有查询到抬头记录");
			}
		},
		error: function(jqXHR){
			loading.close();
			alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
		},
		beforeSend :function(){
			loading.open();
		}
	});
	}
	ajax();
})







