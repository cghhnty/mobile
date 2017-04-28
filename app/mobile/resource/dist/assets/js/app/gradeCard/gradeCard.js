"use strict";
;(function(){
	var templateDate =[];
	
	/*创建列表*/
	function createDOM(d){
		var html='';
		for( var i=0; i<d.length; i++ ){
			var $a = d[i]
			$a.merchantName =$a.merchantName?$a.merchantName:'';
			$a.createTime =$a.createTime?($a.createTime.slice(0,10)):'';
			$a.memberGrades =$a.memberGrades?$a.memberGrades:'';
			$a.discount =$a.discount?((100-$a.discount)/10).toFixed(1):0;
			$a.remark =$a.remark?$a.remark:'';
			for (var p in $a){
				if(p=='@class'){
					delete $a[p] ;
				}
			}
			html += template(templateHtml,$a)
		};
		$('#page-gradeCard-list').html(html);

	};

	/*设置变量*/
	var data = {
		memberId: $("#memberId").val(),
		weixinId: $("#loginWeixin").val(),
		storeId: $("#storeId").val(),
};


	var templateHtml = '\
		<li class="m-t-md m-l m-r">\
			<a class="pos-rlt block m-l-xs m-r-xs" href="/lakala/gradeDetail?storeId='+ $("#storeId").val()+'&cardId=<%= id %>" data-ajax="false">\
				<img class="w-full pos-rlt pointer-none" src="/mobile/dist/images/pattern/<% if(memberGrades=="GOLD"){ %>card_gold<% } else if(memberGrades=="SILVER") {%>card_silver<%}else if(memberGrades=="BRONZE"){ %>card_bronze<% } %>.png"  >\
				<div class="absolute-top m-sm">\
					<div class="pull-left p-l-sm" style="width:60%;"><p class="m-b-none font-bold m-t-xs text-ellipsis"><%= merchantName %></p><p class="m-b-none text-xs" style="color:<% if (memberGrades=="GOLD"){ %>#a87a15<% } else if(memberGrades=="SILVER") {%>#595757<%}else if(memberGrades=="BRONZE"){ %>#805743<% } %>; margin-top:-2px;"><% if(memberGrades=="GOLD"){ %>黄金会员<% } else if(memberGrades=="SILVER") {%>白银会员<%}else if(memberGrades=="BRONZE"){ %>青铜会员<% } %> </p></div>\
					<div class="pull-right text-white text-right p-r-sm m-t-sm" style="width:40%; height:35px; overflow:hidden">\
						<%= discount==0?"":discount+"折"%>\
						<p class="text-xs m-b-none text-right  text-ellipsis"><%:= remark.length>10?remark.slice(0,10):remark %></p>\
					</div>\
				</div>\
				<div class="absolute-bottom text-2xs text-white">\
					<div class="pull-left p-l-sm text-ellipsis" style="width:50%;">生效日期:<%= createTime %></div>\
					<div class="pull-right text-right p-r-sm text-ellipsis" style="width:50%;">最终解释权归商家所有</div>\
				</div>\
			</a>\
			<img class="w-full block pointer-none" src="/mobile/dist/images/pattern/card_shadow.png" >\
		</li>\
	';

	$.ajax({
		type: 'get',
		url: '/platform/grade.do?storeId='+data.storeId+'&weixinId='+data.weixinId,
		success: function(response){
			$.mobile.loading("hide");
		if (!response.pList) {
				alert("没查到数据,检查数据是否存在哦");
				return;
			}
				templateDate = response.pList;
				createDOM(templateDate);
		},
		error: function(){
			$.mobile.loading("hide");
			alert('网络异常，请求数据失败！')
		},
		beforeSend :function(){
			$.mobile.loading("show");
		}
	});
	
})();











