
$(function(){
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
			for( var i=0; i< d.length; i++ ){
				var item = d[i];
				item.shopName = item.shopName?item.shopName:" ";
				item.weixinId = item.weixinId?item.weixinId:"";
				item.invoiceHeader = item.invoiceHeader?item.invoiceHeader:"";
				item.phoneNo = item.phoneNo?item.phoneNo:"";
				item.createTime = item.createTime?item.createTime:"";
				item.bankName = item.bankName?item.bankName:"";
				item.bankCardNo = item.bankCardNo?item.bankCardNo:"";
				item.address = item.address?item.address:"";
				item.telPhone = item.telPhone?item.telPhone:"";
				item.taxpayerNo = item.taxpayerNo?item.taxpayerNo:"";
				item.type = item.type?item.type:"";
				item.defaultFlag = item.defaultFlag?item.defaultFlag:false;
				if( item.type=="profession" ){
					html += template(invoiceHtml0, item);
				}else if( item.type=="normal" ){
					html += template(invoiceHtml1, item);
				}
		}
		$('#invoiceChange').append($(html));
	};

	var invoiceHtml0 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
			<ul class="list-unstyled padder-sm p-t-sm l-h-md m-b-none">\
				<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:100px;min-height:22px;"><span class="absolute-left">销售方：</span><%= shopName %></li>\
				<li class="pos-rlt" style="padding-right:40px; padding-left:100px;min-height:22px;"><span class="absolute-left">购买方：</span><%= invoiceHeader %></li>\
				<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:100px;min-height:22px;"><span class="absolute-left">纳税人识别号：</span><%= taxpayerNo %></li>\
			</ul>\
			<ul class="list-unstyled padder-sm l-h-md m-b-none" style="display:none">\
				<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">开户行：</span><%= bankName %></li>\
				<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">银行账号：</span><%= bankCardNo %></li>\
				<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">地址：</span><%= address%></li>\
				<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">电话：</span><%= telPhone %></li>\
				<li class="pos-rlt m-t-xs" style="padding-left:100px;min-height:22px;"><span class="absolute-left">开票时间：</span><%= createTime %></li>\
			</ul>\
            <div class="text-center padder-v-sm text-info el-click invoiceSlideDown"><span class="icon-icon_arrowLeft"></span></div>\
            <span class="icon-icon_invoice1 pos-abt text-danger font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';
	var invoiceHtml1 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
			<ul class="list-unstyled padder-sm p-t-sm l-h-md p-b">\
				<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">销售方：</span><%= shopName %></li>\
				<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">购买方：</span><%= invoiceHeader %></li>\
				<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">开票时间：</span><%= createTime %></li>\
			</ul>\
            <span class="icon-icon_invoice2 pos-abt text-info font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';

	$.ajax({
		type: 'get',
		//data: data,
		url: '/platform/invoic.do?weixinId='+$('#loginWeixin').val()+'&storeId='+$('#storeId').val(),
		success: function(response){
			loading.close();
			if(response&&response.list){
				//console.log(response.list);
				createDOM(response.list);
			}else{
				createDOM();
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
})







