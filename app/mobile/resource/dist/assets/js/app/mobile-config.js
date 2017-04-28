try{
	$.mobile.defaultPageTransition = "none";
}catch(ex){

}

//设置浏览器的title
document.setTitle = function(t) {
	document.title = t;
	var i = document.createElement('iframe');
	i.src = '//m.baidu.com/favicon.ico';
	i.style.display = 'none';
	i.onload = function() {
		setTimeout(function(){
			i.remove();
		}, 8)
	}
	document.body.appendChild(i);
}
//监听页面跳转
$(document).on("pagebeforeshow",function(e){
	document.setTitle(e.delegateTarget.title);
});


var Tools = {};
;(function(){
	Tools.chkstrlen = function (str){
		var strlen = 0;
		for(var i = 0;i < str.length; i++) {
			if(str.charCodeAt(i) > 255) 
				strlen += 2;
			else  
				strlen++;
		}
		return strlen;
	}
})();

$(function(){
	$("body").children().click(function () {});
	var $loadimg = $('<img src="/mobile/dist/images/icon/loading_blue.gif" style="height:0px;width:0px; display:none;" />');
	$("body").append($loadimg);
	//loading------------------------------------------------------------------------------------------
	var $loading = $('<div class="modals open" style="position: fixed" id="loading">\
   		<div class="absolute bg-white text-center r-2x" style="height:50px; width:50px;">\
    		<img class="pointer-none" style="margin-top:13px;" src="/mobile/dist/images/icon/loading_blue.gif" width="24" />\
        </div>\
    </div>');
	window.loading = {
		open: function(){
			if( $('#loading').length > 0 ){
				$('#loading').remove();
			}
			$('body').append($loading);
		},
		close: function(){
			$loading.remove();
		}
	}
	 //  setTimeout(function(){ loading.open() },3000)
	//alert------------------------------------------------------------------------------------------
	window.alert = function(msg){
		if( $('#alert').length > 0 ){
			$('#alert').remove();
		}
 		var $alert = $('<div class="alert-modal absolute fade in" id="alert"><div class="alert-content absolute"></div></div>');
		var $close = $('<div class="text-center b-t text-info padder-v-sm text-md el-click">确 定</div>');
		var $content = $('<p class="text-center l-h-md m-b-none p-t-md p-b-md padder">'+msg+'</p>');

		$alert.find(".alert-content").append($content);
		$alert.find(".alert-content").append($close);
		$alert[0].addEventListener('touchmove',function(e){
			e.preventDefault();
		},false);
		$('body').append($alert);
		var h = $content.outerHeight()+$close.outerHeight();
		$alert.find(".alert-content").height(h);
		$close.click(function(){
			$alert.remove();
		});
	};
	// confirm-----------------------------------------------------------------------------------------------------------
	var wait = function(obj){
		if( !obj.type )  obj.type = 1;
			
		if( $('#modal-confirm').length > 0 ){
			$('#modal-confirm').remove();
		}
		var dtd = $.Deferred(),
		a = $('<span data-dismiss="confirm" class="el-click padder-v-sm inline text-info" style="width:50%">'+ (obj.doneText?obj.doneText:"确定") +'</span>'),
		b = $('<span data-dismiss="confirm" class="el-click padder-v-sm inline text-muted b-r" style="width:'+ (obj.type ==1 ? '50':'100') +'%">'+ (obj.fallText?obj.fallText:"取消") +'</span>');
		
		var $confirm = $('<div class="alert-modal absolute fade in" style="position: fixed" id="modal-confirm">\
			<div class="alert-content absolute">\
				<div class="alert-header no-border p-t padder"><p class="text-center text-md l-h-3x m-b-none padder-v-sm">' + obj.text + '</p></div>\
				<div class="alert-body p-b"></div>\
				<div class="alert-footer b-t text-center text-md"></div>\
			</div>\
		</div>');
		
		var $body = $('<div class="padder-md p-b-xs"></div>'), bodyflag = false ;
		if( obj.note ){
			var note = $('<div class="text-sm text-left break-all m-b-sm">' + obj.note + '</div>');
			$body.append(note);
			bodyflag = true;
		}
		if( obj.textarea ){
			var textarea = $('<textarea class="textarea form-control m-t-xs" placeholder=" ' + ( typeof obj.textarea == 'boolean' ? '' : obj.textarea ) + ' " rows="4"></textarea>');
			$body.append(textarea);
			bodyflag = true;
		}
		if( bodyflag ){
			$confirm.find('.alert-body').append($body);
		};
		
		if( !obj.type || obj.type == 1){
			$confirm.find('.alert-footer').append(b,a);
		}else if( obj.type == 2 ){
			$confirm.find('.alert-footer').append(a);
		}
		
		$('body').append($confirm);
		$confirm.find('.alert-content').height( $confirm.find('.alert-header').outerHeight() + $confirm.find('.alert-body').outerHeight() + $confirm.find('.alert-footer').outerHeight() );
		
		var data ={};
		a.click(function(){
			$confirm.remove();
			if( $confirm.find('.textarea').length > 0 ){
				data.reason = $confirm.find('.textarea').val();
			};
			dtd.resolve(data);
		});
		b.click(function(){
			$confirm.remove();
			dtd.reject(data);
		});
		
		return dtd.promise();
	};
	
	window.confirm = function(obj){
		$.when( wait(obj) )
	　　.done(function( data ){
			if(obj.done) obj.done( data );
		})
	　　.fail(function(data){
			if(obj.fall) obj.fall( data );
		})
	};
	
	/*confirm({
		text: '您确定要删除改信息吗？',
		done: function(data){
			console.log(data);
		},
		fall: function(data){
			console.log(data);
		},
		note:"啊手动阀手动阀啊阿斯顿",
		trextaea:true,// textarea:"placeholder", 为字符串时会被 赋值 placeholder属性
		type:2, //可以没有type; 默认值为1 添加俩个按钮， 为2 时 一个按钮
		doneText:''// buttonText 默认‘确定’
		fallText:''//buttonText 默认‘取消’
	})*/
	//modal------------------------------------------------------------------------------------------
	$(document).on('click','.modal-close',function(e){
		$(this).parents('.modals').removeClass('open');
	});

	$(document).on('click','[data-modal]',function(e){
		var el= $(this).attr('data-modal');
		$(el).addClass('open');
	});

	//goback------------------------------------------------------------------------------------------
	var goBack = function(e){
		var el = $(e.target),
			h = 50,
			wh = $(window).height(),
			ww = $(window).width()
		el.addClass('active');
		//console.log(e.originalEvent.touches[0].pageX);
		var coordinate = {
			x: e.originalEvent.touches[0].pageX,
			y: e.originalEvent.touches[0].pageY
		}
		var target = {
			x: e.currentTarget.getBoundingClientRect().left,
			y: e.currentTarget.getBoundingClientRect().top
		}
		var shifting = {
			x: coordinate.x - target.x ,
			y: coordinate.y - target.y
		}
		return function(e,t){
			if(t=='touchmove'){
				coordinate.x = e.originalEvent.touches[0].pageX;
				coordinate.y = e.originalEvent.touches[0].pageY;
				target.x = e.currentTarget.getBoundingClientRect().left;
				target.y = e.currentTarget.getBoundingClientRect().top;

				if(coordinate.x + (50-shifting.x) < ww && coordinate.x - shifting.x >0 ) {
					el.css({'right': ww-coordinate.x-h+shifting.x});
				};
				if(coordinate.y + (50-shifting.y) < wh && coordinate.y - shifting.y >0 ) {
					el.css({'bottom': wh-coordinate.y-h+shifting.y})
				};

			}else if(t=='touchend'){
				coordinate.x = e.originalEvent.changedTouches[0].pageX;
				coordinate.y = e.originalEvent.changedTouches[0].pageY;

				if( (ww-coordinate.x) > ww/2 ){
					el.animate({'right': ww-h-5},200);
				}else{
					el.animate({'right':'5px'},200);
				}
				el.removeClass('active');
				goBackCtrl = null;
			}
		}
	}
	var goBackCtrl;
	$(document).on('touchstart','.goback',function(e){
		goBackCtrl = goBack(e);
	});
	$(document).on('touchmove','.goback',function(e){
		goBackCtrl(e,'touchmove');
		e.preventDefault();
	});
	$(document).on('touchend','.goback',function(e){
		goBackCtrl(e,'touchend');
	});

})