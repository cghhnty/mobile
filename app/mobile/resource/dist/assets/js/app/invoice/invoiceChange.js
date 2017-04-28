$(function(){
	$(document).on('click','.invoiceSlideDown',function(){
		var amt = $(this).prev().children('ul').last();
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
		//alert($('#loginWeixin').val()+"fff");
		//alert("aa"+$('#merchantId').val());
		var html='';
		for( var i=0; i< d.length; i++ ){
			var item = d[i];
			item.merchantId = $('#merchantId').val();
			item.weixinId = item.weixinId?item.weixinId:"";
			item.invoiceHeader = item.invoiceHeader?item.invoiceHeader:"";
			item.phoneNo = item.phoneNo?item.phoneNo:"";
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
		};
		$('#invoiceChange').append($(html));
	};
	
	var invoiceHtml0 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
			<a class="block" href="/invoice/applyInvoice.do?headerId=<%= id %>&merchantId=<%= merchantId %>">\
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
			</a>\
            <div class="text-center padder-v-sm text-info el-click invoiceSlideDown"><span class="icon-icon_arrowLeft"></span></div>\
            <div class="clear b-t">\
				<% if(defaultFlag==true){ %> <div class="pull-left padder-v-sm m-l-sm text-info"><span class="icon-icon_currentslt m-r-xs v-a-middle"></span>默认</div> <%}%>\
                <a href="/invoice/editHeader?id=<%= id %>&merchantId=<%= merchantId %>" class="pull-right padder-v-sm m-r-sm block"><span class="icon-icon_edit text-info m-r-xs"></span>编辑</a>\
            </div>\
            <span class="icon-icon_invoice1 pos-abt text-danger font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';
	var invoiceHtml1 = '\
		<div class="pos-rlt bg-white m-t-sm b-t">\
			<a class="block" href="/invoice/applyInvoice.do?headerId=<%= id %>&merchantId=<%= merchantId %>">\
				<ul class="list-unstyled padder-sm p-t-sm l-h-md m-b-none">\
					<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">名称：</span><%= invoiceHeader %></li>\
					<li class="pos-rlt m-t-xs" style="padding-right:40px; padding-left:72px;min-height:22px;"><span class="absolute-left">手机号码：</span><%= phoneNo %></li>\
				</ul>\
			</a>\
            <div class="clear b-t m-t-sm">\
				<% if(defaultFlag==true){ %> <div class="pull-left padder-v-sm m-l-sm text-info"><span class="icon-icon_currentslt m-r-xs v-a-middle"></span>默认</div> <%}%>\
                <a href="/invoice/editHeader?id=<%= id %>&merchantId=<%= merchantId %>" class="pull-right padder-v-sm m-r-sm block"><span class="icon-icon_edit text-info m-r-xs"></span>编辑</a>\
            </div>\
            <span class="icon-icon_invoice2 pos-abt text-info font-bold" style="top:12px; right:12px; font-size:32px"></span>\
        </div>\
	';
	
	/*<% if(selected=="true"){ %> <div class="pull-left padder-v-sm m-l-sm text-success"><span class="icon-icon_right text-lg m-r-xs v-a-middle"></span>当前选中</div> <%}%>\*/

	//console.log("新增抬头");
	$.ajax({
		type: 'get',
		//data: data,
		url: '/invoice/invoiceHeader.do?weixinId='+$('#loginWeixin').val(),
		success: function(response){
			loading.close();
			if(response&&response.list){
				//console.log(response.list);
				createDOM(response.list);
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







