"use strict";
app.directive('validateText',function(){
	return {
		scope: {
            conf: '='
        },
		link: function(scope, ele, attrs){
			$(ele).click(function(){
				scope.conf.authFlag = false;
				scope.conf.codeFlag = true;
				scope.conf.time = 60;
				scope.conf.codeText = scope.conf.time+' 秒';
				scope.$apply();
				//var timer
				scope.conf.timer = setInterval(function(){
					scope.conf.time--;
					scope.conf.codeText = scope.conf.time+' 秒';
					
					if(scope.conf.time == 0){
						scope.conf.codeFlag = false;
						scope.conf.codeText = '获取验证码';
						scope.conf.time = 60;
						clearInterval(scope.conf.timer);
					}
					scope.$apply();
				},1000)
				
			})
		}	
	}
})


