"use strict";
;(function(){
	var templateDate =[];
	
	/*创建列表*/
	function createDOM(){
		var html='';
		for( var i=0; i<templateDate.length; i++ ){
			var $a = templateDate[i];

			for(var p in $a){
				if(p=='@class'){
					delete $a[p];
				}
			}
			var date1 = new Date(parseInt($a.ctime));
			var M1 = (date1.getMonth()+1 < 10 ? '0'+(date1.getMonth()+1) : date1.getMonth()+1);
			var day = (date1.getDate() < 10 ? '0'+(date1.getDate()) : date1.getDate());
			var hour = (date1.getHours() < 10 ? '0'+(date1.getHours()) : date1.getHours());
			var min = (date1.getMinutes() < 10 ? '0'+(date1.getMinutes()) : date1.getMinutes());
			var second = (date1.getSeconds() < 10 ? '0'+(date1.getSeconds()) : date1.getSeconds());
			$a.ctime =$a.ctime?(date1.getFullYear()+'-'+M1+'-'+day+' '+hour+':'+min+':'+second):'';
			$a.amountMoney=$a.amountMoney?(($a.amountMoney/100).toFixed(2)):'0.00';
			$a.discountAmount=$a.discountAmount?(($a.discountAmount/100).toFixed(2)):'0.00';
			//添加订单金额
			$a.orderAmount = (parseFloat($a.amountMoney)+parseFloat($a.discountAmount)).toFixed(2);
			$a.address = $a.address?$a.address:'消费地址不详';
			html += template(templateHtml,$a);
		};
		$('#consume-list').html(html);
	};
	
	var templateHtml = '\
		<div class="m-t bg-white">\
			<div class="m-l-md">\
				<p class="p-t-md m-b-xs">消费时间：<%= ctime  %></p>\
				<p class="text-muted p-l-xs p-b-sm text-sm b-b b-b-dashed"><span class="icon-icon_store p-r-xs"></span><%= address %></p>\
				<div class="display-table m-b-sm text-xs text-muted" style="line-height:20px;">\
					<span style="text-align:left; width:33.3%;">订单：<%= orderAmount %> 元</span>\
					<span style="text-align:center; width:33.3%;">实付：<%= amountMoney %> 元</span>\
					<span class="p-r" style="text-align:right;">优惠：<span class="font-bold text-sm" style="color:#ffb608"><%= discountAmount %></span></span> 元</span>\
				</div>\
			</div>\
			<div style="height:3px; background:url(/mobile/dist/images/icon/circle-bottom.jpg) repeat-x center center; background-size:auto 100%;"></div>\
		</div>\
	';

	$.ajax({
		type: 'get',
		url: '/platform/consumeList.do?storeId='+$('#storeId').val()+'&weixinId='+$('#loginWeixin').val(),
		//async: false,
		success: function(data){
			$.mobile.loading("hide");
			if(!data.pList){
				$('#consume-empty-note').removeClass('hide');
				$('#consume-list').addClass('hide').html('');
				return;
			}
			$('#consume-empty-note').addClass('hide');
			$('#consume-list').removeClass('hide');
			templateDate = data.pList;
			createDOM();
		},
		error: function(){
			$.mobile.loading("hide");
			alert('网络异常，请求数据失败！');
		},
		beforeSend :function(){
			$.mobile.loading("show");
		}
	});
})();











