"use strict";
;(function(){
	function onBodyDown(){
		if ( !( $(event.target).parents("#filter-content").length > 0 || $(event.target).parents("#filter-control").length > 0 ) ) {
			clearFilter();
			$("body").unbind("mousedown", onBodyDown);
		}
	};
	//请求等级卡详情
	$(document).on('click', '#grade', function (){
		var gradeNum = parseInt($('#gCard').text());
		if(gradeNum<=0){
			return;
		}
		//会员渠道id
		var  storeId = $('#storeId').val();
		this.href='/lakala/memberGrade?storeId='+storeId;
	});


	$(document).on('click','#filter-control>div',function(){
		if( $(this).hasClass('active') ){
			$(this).removeClass('active');
			$($(this).data('target')).removeClass('active');
			return ;
		}
		$("body").bind("mousedown", onBodyDown);
		$(this).addClass('active').siblings().removeClass('active');
		$($(this).data('target')).addClass('active').siblings().removeClass('active');
	});
	
	function clearFilter(){
		$('#filter-control>.active' ).removeClass('active');
		$('#filter-content>.active' ).removeClass('active');
	};

	
	/*/!*重置*!/
	$(document).on('click','.filter-reset',function(event){
		$(this).siblings().find('.filter-list').find('.active').removeClass('active');
	});*/
	
	/*设置变量*/
	var data = {
		memberId: $("#memberId").val(),
		weixinId: $("#loginWeixin").val(),
		storeId: $("#storeId").val(),
		pageSize:20,
		currentPage:1
	};

	var templateDate  = [];

	/*默认查询对象*/
	function defaultData(){
		var $list = $('.filter-list');
		
		for(var i=0; i<$list.length; i++){
			if( $($list[i]).find('.active').length>0 ){
				var $this = $($list[i]).find('.active');
				
				var $el = $this.parent('.filter-list');
				var index = $el.index();
				var $p = $el.parent().parent();
				var pIndex = $p.index();
				var pKey = $p.data('key');
				
				data[pKey] =  data[pKey] || {}
				
				var key =  $el.data('key');
				var name =  $el.find('.active').data('name');
				data[pKey][key] = name;
			}
		}
		filterData();
		
	};
	defaultData();
	
	/*条件选择*/
	$(document).on('click','.filter-list>span',function(event){
		if( $(this).hasClass('active') ) return ;
		$(this).addClass('active').siblings().removeClass('active');
		
		var $el = $(this).parent('.filter-list');
		var index = $el.index();
		
		var $p = $el.parent().parent();
		var pIndex = $p.index();
		var pKey = $p.data('key');
		
		data[pKey] =  data[pKey] || {}
		
		var key =  $el.data('key');
		var name =  $el.find('.active').data('name');
		data[pKey][key] = name;
		
		filterData();
		clearFilter();
	});
	
	
	//查看券详情
	/*$(document).on('click','#ticket-list>div',function(event){
		var index = $(this).index();
		var item = templateDate[index];
		var cardId = item.id;
		window.location.href='/platform/couponDetail.do?storeId='+$("#storeId").val()+'&cardId='+cardId;
	});*/
	
	/*券*/
	var ticketHtml = '\
		<div class="el-click">\
			<a class="block p-t-sm pos-rlt" href="/platform/couponDetail.do?storeId='+ $("#storeId").val() +'&cardId=<%= id %>">\
				<img class="no-select" src="/mobile/dist/images/icon/<% if(isEffective==\'1\') { %>ic_blue_seal.png<%}%><% if(isEffective!=\'1\') { if(status==\'REDEEMED\'){%>ic_blue_used.png<%}else{%>ic_gray_seal.png<%}}%>" style="position:absolute; top:6px; right:6px; width:36px">\
				<div class="no-select" style="position:absolute; top:-1px; left:10px; right:10px; height:4px; background:url(/mobile/dist/images/icon/circle-top.jpg) center center repeat-x; background-size:auto 100%;"></div>\
				<div class="text-center b-r b-r-dashed pull-left" style="width:100px;">\
					<div class="pos-rlt m-t-sm" style=" color: <% if(isEffective!=\'1\') { %> #737373 <% } %> " ><span><% if(type=="代金券"){ %> ￥ <%}%></span><span class="text-2x" style="font-size: <% if( faceValue.length>4 ){ %>  16px <% } %>"><%= faceValue %></span><% if(type=="折扣券"){ %> 折 <%}%></span></div>\
					<p class="text-xs m-b-xs text-muted"><%= type %></p>\
				</div>\
				<div class="scroll-touch">\
					<p class="pos-rlt text-lg font-bold m-b-xs p-l-sm p-t-xs text-ellipsis" style=" color: <% if(isEffective!=\'1\') { %> #737373 <% } %> "><%= name %></p>\
					<p class="point <% if(isEffective!=\'1\') { %> lose <%}%> text-xs text-muted m-b-none m-l-sm text-ellipsis"><%= flag %></p>\
					<p class="point <% if(isEffective!=\'1\') { %> lose <%}%> text-xs text-muted m-b-none m-l-sm text-ellipsis"><%= effectiveTime %><span class="padder-xs">至</span><%= expirationTime %></p>\
				</div>\
				<div class="pos-rlt clear-both m-t-sm m-r-md m-l-md padder-v-xs b-t b-t-dashed">\
					<img class="no-select" width="10" src="/mobile/dist/images/icon/circle-left.jpg" style="position:absolute; top:-10px; left:-22px;">\
					<img class="no-select" width="10" src="/mobile/dist/images/icon/circle-right.jpg" style="position:absolute; top:-10px; right:-22px;">\
					<p class="point <% if(isEffective!=\'1\') { %> lose <%}%> text-xs text-muted m-b-none p-l-md text-ellipsis"><%=storeLimit  %></p>\
				</div>\
			</a>\
		</div>\
	';
	

	/*创建列表*/
	function createDOM(d,s){
		var html='';
		for( var i=0; i<d.length; i++ ){
			var $a = d[i];
			$a.faceValue = $a.faceValue ? Math.round($a.faceValue / 100):0;
			$a.type = $a.type == 'VOUCHER_CARD' ? '代金券' : '';
			$a.flag = $a.flag ? ($a.limitAmount ? '满' + (Math.round($a.limitAmount / 100)) + '元可用' : '无门槛') : '无门槛';
			var date1 = new Date($a.effectiveTime), date2 = new Date($a.expirationTime);
			var M1 = (date1.getMonth() + 1 < 10 ? '0' + (date1.getMonth() + 1) : date1.getMonth() + 1);
			var M2 = (date2.getMonth() + 1 < 10 ? '0' + (date2.getMonth() + 1) : date2.getMonth() + 1);
			var day1 = (date1.getDate() < 10 ? '0' + (date1.getDate()) : date1.getDate());
			var day2 = (date2.getDate() < 10 ? '0' + (date2.getDate()) : date2.getDate());
			$a.effectiveTime = $a.effectiveTime ? (date1.getFullYear() + '-' + M1+'-'+day1 ) : '';
			$a.expirationTime = $a.expirationTime ? (date2.getFullYear() + '-' + M2 +'-'+day2 ) : '永久有效';
			$a.name = $a.name ? $a.name : '';
			//$a.description = $a.description ? $a.description : '无';
			$a.storeName =$a.storeName?$a.storeName:'';
			var arr = $a.stores;
			var length = arr.length;
			if(length==0){
				$a.storeLimit=$a.storeName+'商户可用';
			}else{
				var v =arr[0];
				var sName = v.details.aliasName?v.details.aliasName:(v.details.name?v.details.name:'');
				if(length==1){
					$a.storeLimit = sName+'门店可用';
				}else{
					$a.storeLimit = sName+'等'+length+'家门店可用';
				}
			}
			$a.isEffective = $a.isEffective?$a.isEffective:'';
			for (var p in $a){
				if(p=='@class'){
					delete $a[p] ;
				}
			}
			html += template(ticketHtml,$a);
		};
		if(s=='0'){
			$('#ticket-list').html($(html));
		}else{
			$('#ticket-list').append($(html));
		}

	};
	
	/*全部分类 排序 筛选*/
	function filterData(){
		data.currentPage=1;
		$.ajax({
			type: 'post',
			data: data,
			url: '/platform/coupon.do?storeId='+data.storeId,
			success: function (response) {
				$.mobile.loading("hide");
				loadrecover();
				//$('#yhq1').text(response.countSum?response.countSum:0+'');
				$('#coupon').text(response.cardUnused?response.cardUnused:0+'');
				$('#gCard').text(response.gradeNum?response.gradeNum:0+'');
				if (!response.pList) {
					$('#index-empty-ticket').removeClass('hide');
					$('#ticket-list').addClass('hide').html('');
					return;
				}
				$('#index-empty-ticket').addClass('hide');
				$('#ticket-list').removeClass('hide');
				templateDate = response.pList;
				createDOM(templateDate,'0');
				
				if( templateDate.length == response.total || templateDate.length >= response.total ){
					loadedstroy();
				}
			},
			error: function () {
				$.mobile.loading("hide");
				alert('网络异常，请求数据失败！');
			},
			beforeSend: function () {
				$.mobile.loading("show");
			}
		});
	}
	
	//监听加载更多
	//loadMore( $('#page1-index-scroll-touch') , $('#page-index-listening') );
	
	//function loadMore( $touchel, $listening){
		var listeninghtml= $('#page-index-listening').html();
		var $touchel = $('#page1-index-scroll-touch'),
			$listening =  $touchel.siblings("[data-loadshow='loadshow']"),
			$loadmore = $listening.find('.icon-icon_loadmore').eq(0),
			$imgload = $listening.find('.img-icon_loadmore').eq(0)
		
		var loadflag = true,
			loadedflag = true
		
		var scrollTop,
			height,
			outerHeight,
			rotate,
			startMouseY = null,
			touchendFlag = false
		
		function loadrecover(){
			loadedflag = true;
			$listening.addClass('hide');
			$listening.html(listeninghtml);
			$loadmore = $listening.find('.icon-icon_loadmore').eq(0),
			$imgload = $listening.find('.img-icon_loadmore').eq(0)
		}
		
		function loadreset(){
			$listening.addClass('hide');
			$loadmore.removeClass('hide');
			$imgload.addClass('hide');
			$loadmore.css({'-webkit-transform':'rotate(0deg)','-moz-transform':'rotate(0deg)','-ms-transform':'rotate(0deg)'});
		};
		
		function loadedstroy(){
			$listening.html('<span class="inline b-t m-r-xs" style="width:60px;"></span><span class="inline">亲都在这里了哦！</span><span class="inline b-t m-r-xs" style="width:60px;"></span>');
			loadedflag = false;
		};
		
		function scrollTouch(evt){
			if( !startMouseY ){
				startMouseY = evt.touches[0].pageY;
			}
			var mouseY = startMouseY - evt.touches[0].pageY;
			if( mouseY <= 0 || !loadflag) return;
			
			$(this).addClass('overflow-hidden');
			$listening.removeClass('hide');
			$touchel.find('.scroll-touch-body').eq(0).css('height', outerHeight + mouseY+'px');
			$touchel.scrollTop(outerHeight - height + mouseY );
			
			rotate = -mouseY*4;
			if( rotate >= -180 ) {
				$listening.removeClass('hide');
				$loadmore.css({'-webkit-transform':'rotate('+ -rotate +'deg)','-moz-transform':'rotate('+ -rotate +'deg)','-ms-transform':'rotate('+ -rotate +'deg)'});
			}else{
				$touchel[0].removeEventListener('touchmove', scrollTouch, false);
				startMouseY = null;
				loadflag = false;
				$loadmore.addClass('hide');
				$imgload.removeClass('hide');

				data.currentPage = data.currentPage+1;
				//加载更多
				$.ajax({
					type: 'post',
					data: data,
					url: '/platform/coupon.do?storeId='+data.storeId,
					success: function(response){
						$.mobile.loading("hide");
						loadflag = true;
						loadreset();
						$('#yhq1').text(response.countSum?response.countSum:0+'');
						$('#yhq2').text(response.cardUnused?response.cardUnused:0+'');
						templateDate = templateDate.concat(response.pList);
						if( templateDate.length == response.total || templateDate.length >= response.total ){
							loadedstroy();
						}
						
						$touchel.removeClass('overflow-hidden');
						$touchel.find('.scroll-touch-body').eq(0).css('height', 'auto');
						
						if(!response.pList) return;
						createDOM(response.pList,'1');
					},
					error: function(){
						loadflag = true;
						$.mobile.loading("hide");
						alert('网络异常，请求数据失败！')
					},
					beforeSend :function(){
						$.mobile.loading("show");
					}
				});
			}
		}
		$touchel.scroll(function(evt){
			if( startMouseY || touchendFlag ) {
				touchendFlag = false;
				return;
			};
			
			scrollTop = $(this).scrollTop();
			height = $(this).height();
			outerHeight = $(this).find('.scroll-touch-body').eq(0).outerHeight();
			rotate = outerHeight-(height+scrollTop);
			//if( !loadedflag ){
				if( rotate >0 ){
					$listening.addClass('hide');
				}else{
					$listening.removeClass('hide');
				}
			//}
			if( !loadflag || !loadedflag ) return;
			if( rotate<=0 && !startMouseY ){
				$touchel[0].addEventListener('touchmove', scrollTouch, false);
			}
		})
		
		$touchel[0].addEventListener('touchend',function(){
			$touchel[0].removeEventListener('touchmove', scrollTouch, false);
			touchendFlag = true;
			if( !startMouseY ) return ;
			startMouseY = null;
			
			$touchel.removeClass('overflow-hidden');
			$touchel.find('.scroll-touch-body').eq(0).css('height', outerHeight);
			$touchel.scrollTop(outerHeight-height);
			
			loadreset();
		},false);
	//}
	
})();







