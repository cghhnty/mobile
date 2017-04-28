"use strict";
;(function(){
	function ntoCh(num){
		if(typeof num !='number') return;
		var str =num+'',
			arr =["零","一","二","三","四","五","六","七","八","九"],
			result ='';
		for(var j=0;j<str.length;j++){
			if(str.charAt(j)=='.'){
				continue;
			}else{
				result+=arr[parseInt(str.charAt(j))];
			}
		}
		return result;
	}
	var templateDate ={};
    var share =$('#share').val();
	/*创建列表*/
	function createDOM(){
		templateDate.nextGrade = templateDate.nextGrade?templateDate.nextGrade:'';
		if(templateDate.memberGrades == "GOLD"){
			templateDate.gradeName = "黄金会员";
			templateDate.textColor = "#593f12";
			templateDate.cardBg = "card_d_gold.png";
			templateDate.cardIcon = "grade_gold.png";
			
		}else if(templateDate.memberGrades == "SILVER") {
			
			templateDate.gradeName ="白银会员";	
			templateDate.textColor = "#464545";
			templateDate.cardBg = "card_d_silver.png";
			templateDate.cardIcon = "grade_silver.png";
			
		}else if(templateDate.memberGrades == "BRONZE") {
			templateDate.gradeName ="青铜会员";
			templateDate.textColor = "#472f25";
			templateDate.cardBg = "card_d_bronze.png";
			templateDate.cardIcon = "grade_bronze.png";
		};
		
		if(templateDate.nextGrade == "黄金会员" ) {
			templateDate.cardNextIcon = "grade_gold.png";
			templateDate.gradeNextName = "黄金会员";
			
		}else if(templateDate.nextGrade == "白银会员") {
			templateDate.cardNextIcon = "grade_silver.png";
			templateDate.gradeNextName = "白银会员";
		}
		else if(templateDate.nextGrade == "青铜会员") {
			templateDate.cardNextIcon = "grade_bronze.png";
			templateDate.gradeNextName = "青铜会员";
		}else{
			templateDate.cardNextIcon = "grade_follow.png";
			templateDate.gradeNextName = "敬请期待";
		}
		templateDate.createTime = templateDate.createTime?templateDate.createTime.split(/\s+/)[0]:'';
		templateDate.remark = templateDate.remark?templateDate.remark:'';
		templateDate.discount = templateDate.discount?(100-templateDate.discount)/10:0;
		templateDate.discountCH =ntoCh(templateDate.discount);
		var nextMerchantGrade = templateDate.nextMerchantGrade?templateDate.nextMerchantGrade:{};
		templateDate.member = templateDate.member?templateDate.member:{};
		//等级条件 0金额，1次数 2 商户只有青铜等级，默认根据金额累计
		if(templateDate.satisfyFlags=="0"){
			templateDate.amountStart = templateDate.actualCountMoney?(templateDate.actualCountMoney/100).toFixed(2):'0.00';
			templateDate.amountEnd = templateDate.nextGrade?nextMerchantGrade.satisfyMoney?(nextMerchantGrade.satisfyMoney/100).toFixed(2):'0.00':'0.00';
			templateDate.upDistance = (templateDate.amountEnd - templateDate.amountStart).toFixed(2)+'元';
			templateDate.upDistanceFlag = (templateDate.amountEnd - templateDate.amountStart);
		}else if(templateDate.satisfyFlags=="1"){
			templateDate.amountStart = templateDate.actualTransactionCount?templateDate.actualTransactionCount:0;
			templateDate.amountEnd = templateDate.nextGrade?nextMerchantGrade.satisfyCount?nextMerchantGrade.satisfyCount:0:0;
			templateDate.upDistance = (templateDate.amountEnd- templateDate.amountStart)+'次';
			templateDate.upDistanceFlag = (templateDate.amountEnd - templateDate.amountStart);
		}else{
			templateDate.amountStart = templateDate.actualCountMoney?(templateDate.actualCountMoney/100).toFixed(2):'0.00';
			templateDate.amountEnd = templateDate.nextGrade?nextMerchantGrade.satisfyMoney?(nextMerchantGrade.satisfyMoney/100).toFixed(2):'0.00':'0.00';
			templateDate.upDistance = (templateDate.amountEnd - templateDate.amountStart).toFixed(2)+'元';
			templateDate.upDistanceFlag = (templateDate.amountEnd - templateDate.amountStart);
		}
		templateDate.nextDiscount = nextMerchantGrade.discount?(100-nextMerchantGrade.discount)/10:0;
		templateDate.nextDiscountCH =ntoCh(templateDate.nextDiscount);
		templateDate.nextRemark = nextMerchantGrade.remark?nextMerchantGrade.remark:'';
		var html='';
		html += template(templateHtml,templateDate);
		$('#page-gradeDetailShare').html(html);


	};
	
	var templateHtml = '\
		<div class="container-fluid" style="background-color:#ffffff;">\
			<div class="row padder-v-sm">\
				<div class="col-xs-6 b-r">\
					<div class="w-full rounded m-auto" style="width:70px; height:70px; border: 1px #999 solid;"><div class="h-full w-full rounded clear" style=" border:1px #fff solid; "> <img class="w-full h-full pointer-none" src="<%= member.avatar?member.avatar:"" %>"></div></div>\
					<p class="text-ellipsis text-center m-b-none text-sm"><%= member.fullName?member.fullName:"" %></p>\
				</div>\
				<div class="col-xs-6 text-center">\
					<img class="p-t-xs pointer-none" width="30" src="/mobile/dist/images/icon/<%= cardIcon %>">\
					<p class="text-ellipsis text-center m-b-none text-md font-bold text-ellipsis" style="padding-top:3px;"><%= gradeName %></p>\
					<p class="text-ellipsis text-center m-b-none text-xs text-ellipsis" style="padding-top:3px;">生效日期:<%= createTime %></p>\
				</div>\
			</div>\
		</div>\
		<p class="p-t-xs text-center text-muted b-t <% if(nextGrade){ %>hide<% } %>" style="border-top-width:5px; border-color:#eee;">联系商户，了解更多会员升级条件！</p>\
		<p class="p-t-xs text-center text-muted b-t <% if(!nextGrade){ %>hide<% } %> " style="border-top-width:5px; border-color:#eee;" >\
		<% if(upDistanceFlag>0){%>还差<%= upDistance %>消费升级为<%= gradeNextName %> <%}else{%>请联系商户，消费升级等级卡<%}%></p>\
		<div class="pos-rlt m-l m-r m-t-n-sm text-xs text-center p-t-sm" style="padding-left:52px; padding-right:52px;">\
			<div class="absolute-left" style="width:52px;"><img class="pointer-none" style="width:26px;" src="/mobile/dist/images/icon/<%= cardIcon %>">\
				<p class="m-b-none"><%= gradeName %></p>\
			</div>\
			<div class="absolute-right" style="width:52px;"><img class="pointer-none" style="width:26px;" src="/mobile/dist/images/icon/<%= cardNextIcon %>">\
				<p class="m-b-none"><%= gradeNextName %></p>\
			</div>\
			<div class="pos-rlt progress gradeProgress">\
				<div class="progress-bar" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:<%= nextGrade ? (amountStart / amountEnd)*100:100%>% "></div>\
				<div class="progress-note absolute-top text-center text-white"><%= amountStart %><% if(nextGrade){%>/<%= amountEnd %> <%}%></div>\
			</div>\
		</div>\
		<p class="m-t-lg text-center text-muteder b-t p-t-xs" style="border-top-width:5px; border-color:#eee;">最终解释权归商家所有！</p>\
		<div class="row m-l-none m-r-none p-r">\
			<div class="col-xs-6">\
				<p>当前会员权益</p>\
				<p class="m-b-none m-l-xs"><%:= discount!=0?"全场"+discountCH+"折<br/>":""%><%:=remark%></p>\
			</div>\
			<div class="col-xs-6 p-l-sm p-r-sm p-b-sm m-t-sm b" style="min-height:100px;"> <span class="bg-white block m-t-n-sm m-b-sm p-r-xs pull-left">下一级会员权益</span>\
				<p class="m-b-none m-l-xs text-muted clear-both"><% if(nextGrade){%><%:= nextDiscount!=0?"全场"+nextDiscountCH+"折<br/>":""%><%=nextRemark %> <%}else{%>敬请期待!<%}%></p>\
			</div>\
		</div>\
		<a href="/platform/gradeStore.do?storeId='+ $("#storeId").val()+'&merchantId=<%= merchantId %>&share=<%= share %>" class="el-click block w-full btn btn-lg  bg-primary no-radius no-border m-t-md" style="color:#fff">进店逛逛</a>\
	';
	//var path ="http://postest.lakala.com.cn/lakala/center?storeId=4de4367a-c3c2-43e4-a592-053bc698ca5f";
	//var path = location.href.split('#')[0];
	var path=location.href.slice(0,location.href.lastIndexOf("/"))+'/center?storeId='+$('#storeId').val();
	$.ajax({
		type: 'get',
		//data: data,
		url: '/platform/gradeDetail.do?storeId='+ $("#storeId").val() +'&cardId='+$("#cardId").val()+'&share='+share,
		success: function(data){
			$.mobile.loading("hide");
			if(!data.id){
				alert("没查到数据,检查数据是否存在哦！");
				return;
			}
			templateDate = data;
			templateDate.share=share;
			createDOM();
		},
		error: function(jqXHR){
			$.mobile.loading("hide");
			alert(jqXHR.responseText?jqXHR.responseText:"网络异常，请求数据失败！");
			//alert('网络异常，请求数据失败！')
		},
		beforeSend :function(){
			$.mobile.loading("show");
		}
	});
})();












