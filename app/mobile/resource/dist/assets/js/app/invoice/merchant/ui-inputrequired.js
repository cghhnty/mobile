"use strict";
app.directive('inputRequired', function($timeout){
	return{
		restrict:'EA',
		require:'?ngModel',
		link: function(scope, element, attrs, ngModel){
			angular.element(element).on('input',function(){
				$timeout(function(){
					if(ngModel.$valid){
						angular.element(element).removeClass('ng-invalid').addClass('ng-valid');
					}else{
						angular.element(element).removeClass('ng-valid').addClass('ng-invalid');
					}
				})
			});
		}
	};
});

app.directive('chineseValidate', function($timeout){
	return{
		restrict:'EA',
		require:'?ngModel',
		link: function(scope, element, attrs, ngModel){
			var maxl =  parseInt(attrs.maxl);
			scope.$watch(attrs.ngModel,function(n){
				if(!n) {
					scope[attrs.len] = 0;
					ngModel.$setValidity('chinese',true);
					return;
				}
				var lengths = n.length;
				var reg=new RegExp("[^\u4E00-\u9FA5\uF900-\uFA2D]","gm");  
				var ch = n.replace(reg, "");
				var chlength = ch.length;
				var sam = lengths + chlength;
				scope[attrs.len] = Math.ceil(sam/2);
				if(sam>maxl){
					ngModel.$setValidity('chinese',false);
				}else{
					ngModel.$setValidity('chinese',true);
				};
			});
		}
	};
});
