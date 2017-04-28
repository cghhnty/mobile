"use strict";
;(function(){
	//alert(location.href)
	var templateDate ={};
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

	/*创建列表*/
	function createDOM(){
		/*首次点击弹出动画*/
			var firstFlag = templateDate.memberGradeFirst?templateDate.memberGradeFirst.firstFlag:'0';
			if(firstFlag=='1'){
				giftStart(templateDate.memberGrades);
			}

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
		//console.log(html);
		$('#page-gradeDetail').html(html);
		//console.log($('#page-gradeDetail').html());
		//console.log(1);
	};
	
	var templateHtml = '\
		<div class="pos-rlt text-white" style="background-color:#00ade9; height:46px; padding:0 60px;"><h4 class="text-center m-t-none m-b-none text-ellipsis" style="line-height:46px;"><%= merchantName?merchantName:"" %></p></h2><a class="absolute-right pull-right p-r-sm p-t-xs text-center" data-role="none" href="/platform/gradeStore.do?storeId='+ $("#storeId").val()+'&merchantId=<%= merchantId %>&cardId=<%= id %>"><i class="text-md icon-icon_store text-white"></i><span class="block text-2xs text-white">进店逛逛</span></a></div>\
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
		<p class="m-t text-center text-muted b-t p-t-xs" style="border-top-width:5px; border-color:#eee;">分享给更多朋友比拼吧！</p>\
		<div class="row m-l-none m-r-none">\
			<div class="col-xs-4 text-center"><img class="r-2x el-click" style="width:50px;" data-modal="#gradeDetail-modals-show" src="/mobile/dist/images/icon/btn_weixin.png"><p class="m-t-xs text-xs">微信好友</p></div>\
			<div class="col-xs-4 text-center"><img class="r-2x b el-click" style="width:50px;" data-modal="#gradeDetail-modals-show" src="/mobile/dist/images/icon/btn_pengyouquan.png"><p class="m-t-xs text-xs">微信朋友圈</p></div>\
			<div class="col-xs-4 text-center"><img class="r-2x b el-click" style="width:50px;" data-modal="#gradeDetail-modals-show" src="/mobile/dist/images/icon/btn_qq.png"><p class="m-t-xs text-xs">手机QQ</p></div>\
		</div>\
	';
	//var path ="http://postest.lakala.com.cn/lakala/center?storeId=4de4367a-c3c2-43e4-a592-053bc698ca5f";
	var path = location.href.split('#')[0];
	//var path=location.href.slice(0,location.href.lastIndexOf("/"))+'/center?storeId='+$('#storeId').val();
	$.ajax({
		type: 'get',
		//data: data,
		url: '/platform/gradeDetail.do?storeId='+ $("#storeId").val() +'&cardId='+$("#cardId").val(),
		success: function(data){
			$.mobile.loading("hide");
			if(!data.id){
				alert("没查到数据,检查数据是否存在哦！");
				return;
			}
			templateDate = data;
			createDOM();

			//分享功能
			$.ajax({
				type: 'get',
				url: '/api/weixin/jsApiSign?url='+encodeURIComponent(path)+'&storeId='+$('#storeId').val(),
				success: function(result){
					if(result){
						//alert(result.result.jsapi_ticket);
						wx.config({
							debug: false,
							appId: result.result.appId,
							timestamp: result.result.timestamp,
							nonceStr: result.result.nonceStr,
							signature: result.result.signature,
							jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage","onMenuShareQQ"],
						});

						wx.ready(function () {
							//分享到微信好友
							wx.onMenuShareAppMessage({
								title: '消费领勋章，升级升权益',// 分享标题
								desc: '我已领取'+templateDate.merchantName+templateDate.gradeName+'卡，分享给你看一看。',// 分享描述
								link: location.href.split('#')[0]+'&share=1',
								//imgUrl: templateDate.member.avatar ,
								imgUrl: location.href.slice(0,location.href.indexOf("/",10))+'/mobile/dist/images/icon/lakalapos.jpg',
								trigger: function (res) {
									// 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
									// alert('用户点击发送给朋友');
								},
								//用户成功分享后执行的回调函数
								success: function (res) {

								},
								//用户取消分享后执行的回调函数
								cancel: function (res) {
									 alert('已取消');
								},
								//用户分享失败后执行的回调函数
								fail: function (res) {
									alert(JSON.stringify(res));
								}
							});
							//分享到QQ
							wx.onMenuShareQQ({
								title: '消费领勋章，升级升权益',// 分享标题
								desc: '我已领取'+templateDate.merchantName+templateDate.gradeName+'卡，分享给你看一看。',// 分享描述
								link: location.href.split('#')[0]+'&share=1',
								//imgUrl: templateDate.member.avatar ,
								imgUrl: location.href.slice(0,location.href.indexOf("/",10))+'/mobile/dist/images/icon/lakalapos.jpg',
								success: function () {

								},
								cancel: function () {
									alert('已取消');
								}
							});
							//分享到微信朋友圈
							wx.onMenuShareTimeline({
								title: '消费领勋章，升级升权益,我已领取'+templateDate.merchantName+templateDate.gradeName+'卡，分享给你看一看。',// 分享标题
								desc: '我已领取'+templateDate.merchantName+templateDate.gradeName+'卡，分享给你看一看。',// 分享描述
								link: location.href.split('#')[0]+'&share=1',
								//imgUrl:templateDate.member.avatar ,
								imgUrl:location.href.slice(0,location.href.indexOf("/",10))+'/mobile/dist/images/icon/lakalapos.jpg',
								trigger: function (res) {

								},
								success: function (res) {

								},
								cancel: function (res) {
									alert('已取消');
								},
								fail: function (res) {
									alert(JSON.stringify(res));
								}
							});
						});

						wx.error(function(res){
							console.log(res);
							//alert("请求验证失败");
						});

					}

				},
				error: function (jqXHR) {
					$.mobile.loading("hide");
					alert(jqXHR.responseText);
				},
				/*beforeSend: function () {
				 $.mobile.loading("show");
				 }*/
			});
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
	//会员新权益
	function giftStart(level){
		var text, color;
		if(level=='GOLD'){
			level = 'gold';
			text = '黄金勋章';
			color = '#f7bf0c';
		}else if(level=='SILVER'){
			level = 'silver';
			text = '白银勋章';
			color = '#9b9ea5';
		}else if(level=='BRONZE'){
			level = 'bronze';
			text = '青铜勋章';
			color = '#ba661a';
		}
		
		var newGigtHtml = '\
			<div class="modals animated fadeIn open" id="gradeDetail-modals-gift"  style="background-color:rgba(0,0,0,0.6);">\
				<div class="m-auto m-b-sm m-t-xxl padder padder-v  p-t-none r-2x bg-white" style="width:250px;">\
					<div class="clear"><span class="modal-close el-click padder-sm close padder-v-sm text-2x m-r-n-sm">&times;</span></div>\
					<p class="text-center text-md m-t-n-sm">恭喜您获得了<span class="font-bold text-lg p-l-xs" style="color:'+color+';">'+text+'</span></p>\
					<div class="pos-rlt text-center" style="height:116px;" id="giftcardAmt">\
					</div>\
					<div class="m-auto m-t-sm" style="width:100px; padding-left:20px;">\
						<div class="pos-rlt">\
							<img class="w-full pointer-none" src="/mobile/dist/images/icon/gift_box_b.png">\
							<img id="newGiftStart" class="w-full pos-abt pointer-none" src="/mobile/dist/images/icon/gift_box_t.png" style="top:0; left:0px;">\
						</div>\
					</div>\
					<button type="button" class="btn btn-lg bg-primary w-full m-t-sm modal-close el-click" data-role="none" style="color:#fff">查看新权益</button>\
				</div>\
			</div>';
		$(newGigtHtml).insertAfter($("#gradeDetail-modals-show"));
		
		setTimeout(function(){
			$("#newGiftStart").attr('src','/mobile/dist/images/icon/gift_box_t2.png');
			setTimeout(function(){
				$("#giftcardAmt").html('\
					<div id="giftcardAmt-star"></div>\
					<img class="newGiftImg pointer-none" src="/mobile/dist/images/icon/grade_'+level+'_b.png" width="90">\
				');
				setTimeout(function(){
					$("#giftcardAmt-star").html('\
						<img class="pos-abt newGiftStar pointer-none" src="/mobile/dist/images/icon/star_'+level+'.png" width="14" style="top:110px; left:110px;">\
						<img class="pos-abt newGiftStar  pointer-none" src="/mobile/dist/images/icon/star_'+level+'.png" width="14" style="top:0px; left:10px;">\
						<img class="pos-abt newGiftStar pointer-none" src="/mobile/dist/images/icon/star_'+level+'.png" width="24" style="top:60px; left:40px;">\
						<img class="pos-abt newGiftStar pointer-none" src="/mobile/dist/images/icon/star_'+level+'.png" width="18" style="top:100px; left:64px;">\
						<img class="pos-abt newGiftStar pointer-none" src="/mobile/dist/images/icon/star_'+level+'.png" width="32" style="top:48px; left:153px;">\
					');
				},300)
			},200)
		},300)
	}
	//giftStart('BRONZE');
})();












