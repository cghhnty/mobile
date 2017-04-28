'use strict';
/*
	省级联动
*/
/*
	ng-model="form.point.province" 可以为 单个字符串 ng-model="province"；
	ng-model="form.point.city" 可以为 单个字符串 ng-model="city"；
	ng-model="form.point.county" 可以为 单个字符串 ng-model="county"；
	
	
	<select class="form-control m-b" name="province" province-city-county data-fill='{"province":{"model":"form.point.province", "listName": "provinceList"},"city":{"model":"form.point.city","listName": "cityList"},"county":{"model":"form.point.county", "listName": "countyList"}}' ng-model="form.point.province" ng-options="item.id as item.text for item in provinceList" required>
		<option value="">选择省</option>
	</select>
	<select class="form-control m-b" name="city" ng-model="form.point.city" ng-options="item.id as item.text for item in cityList" required>
		<option value="">选择市</option>
	</select>

	<select class="form-control m-b" name="county" ng-model="form.point.county" ng-options="item.id as item.text for item in countyList" required>
		<option value="">选择区</option>
	</select>
*/

// 填充 省市区
/* 
	$scope.signProvinceCode = ;
	$scope.signCityCode = ;
	$scope.signCountyCode = ;
*/
 
// 异步请求 填充 
/*
	$scope.uiCity = {};
	$scope.uiCity.wait = function(){
		$scope.uiCity.defer = $q.defer();
		return $scope.uiCity.defer.promise;
	}
	//success  赋值  在执行 $scope.uiCity.defer.resolve();
*/
					 
app.directive('provinceCityCounty', function($http){
	return{
		link: function(scope, ele, attrs){
			function promise(){
				var data = $(ele).data('fill');
				var o = {};
				
				for(var a in data){
					o[a] = {};
					var text = data[a].model.split('.');
					o[a].text = text;
					o[a].listName=data[a].listName;
					
					if(text.length>1){
						if(!scope[text[0]]){
							scope[text[0]]={};
						}
						o[a].model=scope[text[0]];
						for(var i=1;i<text.length-1;i++){
							if(!o[a].model[text[i]]) o[a].model[text[i]]={};
							o[a].model = o[a].model[text[i]];
						}
					}else{
						o[a].model=scope;
					}
					
				}
				/*o['province'].model[o['province'].text[text.length-1]]='02';
				o['city'].model[o['city'].text[text.length-1]]='0402';
				o['county'].model[o['county'].text[text.length-1]]='040302';*/
				
				scope[o['province']['listName']] = [];
				scope[o['city']['listName']] = [];
				scope[o['county']['listName']] = [];
				var regionsParam =["1.0.0","1000","PROVINCE","CITY","COUNTY"];
				var provinceSign = 0;
				var comboOptionsURL ='/invoice/merchant/queryRegions.do?version='+regionsParam[0];

				//loading.open();
				$http.get(comboOptionsURL+'&id='+regionsParam[1]+'&level='+regionsParam[2])
					.success(function(response){
						//loading.close();
						if(response.length>0){
							for(var i=0;i<response.length;i++){
								response[i]['text']=response[i]['name'];
							}
							scope[o['province']['listName']] = response;
						}else{
							alert("没查到相关省级信息");
						}
						provinceSign++;
					})
					.error(
						function() {
							//loading.close();
							alert("网络异常，请求数据失败");
						}
					);
				
				/*选择省*/
				var citySign = 0;
				scope.$watch(o['province'].text.join('.'), function(n) {
					var id = o['province'].model[ o['province'].text[ o['province'].text.length-1 ] ];
					//alert(id);
					if(provinceSign!=0){
						o['city'].model[ o['city'].text[ o['city'].text.length-1 ] ] = null;
						o['county'].model[ o['county'].text[ o['county'].text.length-1 ] ]= null;
					}
					if(!id) {
						scope[o['city']['listName']] = [];
						scope[o['county']['listName']] = [];
						return false ;	
					};
					var url = comboOptionsURL + '&id='+id+'&level='+regionsParam[3];

					loading.open();
					$http.get(url)
						.success(function(response) {
							loading.close();
							if(response.length>0){
								for(var i=0;i<response.length;i++){
									response[i]['text']=response[i]['name'];
								}
								scope[o['city']['listName']] = response;
							}else{
								alert("没查到相关市级信息");
							}
							if(citySign!=0){
								scope[o['county']['listName']] = [];
							}else{
								citySign++;
							}
						})
						.error(
							function() {
								loading.close();
								alert("网络异常，请求数据失败");
							}
						);
				})
				
				/*选择市*/
				scope.$watch(o['city'].text.join('.'), function(n) {
					//console.log(scope.invoiceMerchant.contact.region.parent.parents.id);
					if(citySign!=0){
						o['county'].model[ o['county'].text[ o['county'].text.length-1 ] ]= null;
					}
					var id = o['city'].model[ o['city'].text[ o['city'].text.length-1 ] ];
					if(!id) {
						scope[o['county']['listName']] = [];
						return false ;	
					};
					var url = comboOptionsURL + '&id='+id+'&level='+regionsParam[4];


					loading.open();
					$http.get(url)
						.success(function(response) {
							loading.close();
							if(response.length>0){
								for(var i=0;i<response.length;i++){
									response[i]['text']=response[i]['name'];
								}
								scope[o['county']['listName']] = response;
							}else{
								alert("没查到相关区县信息");
							}
						})
						.error(
							function() {
								loading.close();
								alert("网络异常，请求数据失败");
							}
						);
				})
			}
		
			if(!scope.uiCity){
				promise();
			}else{
				scope.uiCity.wait().then(function() {
					promise();
				})
			}
			
		}	
	}
})