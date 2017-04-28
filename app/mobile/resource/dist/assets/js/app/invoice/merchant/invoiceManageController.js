// JavaScript Document
app.controller("InvoiceManageController", ['$scope', '$http', function ($scope, $http) {
    $scope.contract = function ($scope, array) {
        if (array.length > 1) {
            if (!$scope[array[0]]) {
                $scope[array[0]] = {};
            }
            ;
            form = $scope[array[0]];
            for (var i = 1; i < array.length - 1; i++) {
                if (!form[array[i]]) form[array[i]] = {};
                form = form[array[i]];
            }
        } else {
            form = $scope;
        }
        return form;
    };

    $scope.nextStep = function (n) {
        $('.invoice-tabs-nav>li, .invoice-tab-content>div').removeClass('active');
        $('.invoice-tabs-nav>li:lt(' + (n + 1) + '), .invoice-tab-content>div:eq(' + n + ')').addClass('active');
        if (n === 0) {
            //$scope.invoiceMerchant = {};
            //$scope.repassword = '';
            //$scope.sign.authFlag = false;
            //clearInterval($scope.sign.timer);
            //$scope.sign.time=0;
            //$scope.sign.codeText = '获取验证码';
            //$scope.sign.codeFlag = false;
        }

    };

    var input = null;
    var timer;
    var interval = function () {
        if (!$(':focus').length) {
            $('.clearInput').remove();
            input = null;
            clearInterval(timer);
        }
    }
    var clearflag = false;

    $(document).on('click', function (e) {
        var target = e.target;
        var targetName = target.tagName.toUpperCase();

        if (targetName == 'INPUT') {
            if (input != target && !$(target).is(":radio")) {
                $('.clearInput').remove();
                input = target;
                var clearInput = $('<span class="pos-abt icon-icon_005 text-muted absolute-right text-md el-click clearInput" style="padding:15px 8px;"></span>');
                if ($(input).attr('name') == 'username') {
                    clearInput.css('right', 100)

                }

                clearInput.insertAfter($(target));

                timer = setInterval(interval, 300);
            }

        } else if ($(target).hasClass('clearInput')) {
            input.focus();
            //$(input).val('');
            var array = $(input).attr('ng-model').split('.');
            $scope.contract($scope, array)[array[array.length - 1]] = '';
            $scope.$apply();

            clearflag = true;
        } else {
            $('.clearInput').remove();
            input = null;
            clearInterval(timer);
        }

    })

    $(document).on('blur', 'input,textarea', function (e) {
        var $this = this;
        setTimeout(function () {
            if (clearflag) {
                clearflag = false;
                return false;
            }
            ;
            var val = $($this).val();
            var infoempty = null, infoerror = null

            if ($($this).data('infoempty'))
                infoempty = $($this).data('infoempty')
            else
                return false;

            if ($($this).data('infoerror'))
                infoerror = $($this).data('infoerror')
            else
                return false;

            if (val == '') {
                alert(infoempty);
            } else if ($($this).hasClass('ng-invalid')) {
                alert(infoerror);
            }
        }, 20)

    })


    $scope.sign = {
        codeText: '获取验证码',
    };
    $scope.activationCode = '';
    $scope.sampleQRCode = '';

    //获取短信验证码
    $scope.getAuthCode = function () {
            var auth = {
                mobile: $scope.invoiceMerchant.username,
            };
            $.ajax({
                type: 'get',
                url: '/invoice/merchant/getSMSVerifyCode.do?mobile='+auth.mobile+'&weixinId='+$('#weixinId').val(),
                success: function (response) {
                   // alert(response.returnCode);
                   // loading.close();

                },
                error: function (jqXHR) {
                    clearInterval($scope.sign.timer);
                    $scope.sign.time=0;
                    $scope.sign.codeText = '获取验证码';
                    $scope.sign.codeFlag = false;
                    $scope.$apply();
                    alert(jqXHR.responseText ? jqXHR.responseText : "网络异常，请求数据失败！");
                },
                beforeSend: function () {
                   // loading.open();
                }
            });
            // $scope.authFlag (boolean) success true /flase false
            //$scope.authFlag = true;

    }

    //验证短信验证码
    $scope.authCode = function () {
        console.log($scope.invoiceMerchant.verifyCode);

        if ($scope.invoiceMerchant.verifyCode.length == 6) {
            var auth = {
                mobile: $scope.invoiceMerchant.username,
                code: $scope.invoiceMerchant.verifyCode
            };
            $.ajax({
                type: 'get',
                url: '/invoice/merchant/verifyCode.do?mobile='+auth.mobile+'&verifyCode='+auth.code,
                success: function (response) {
                    loading.close();
                    console.log(response.value);
                    $scope.sign.authFlag = response.value;

                    if($scope.sign.authFlag){
                        clearInterval($scope.sign.timer);
                        $scope.sign.time=0;
                        $scope.sign.codeText = '获取验证码';
                        $scope.sign.codeFlag = false;
                        $scope.$apply();
                    }

					
                    //clearInterval(timer);
                },
                error: function (jqXHR) {
                    loading.close();
                    alert(jqXHR.responseText ? jqXHR.responseText : "网络异常，请求数据失败！");
                },
                beforeSend: function () {
                    loading.open();
                }
            });
        }
    }

        $scope.toStep2 = function () {

            $scope.nextStep(2);
        }

        $scope.toStep3 = function (p) {
            $scope.invoiceMerchant.shopNo = $('#merchantId').val();
            $scope.invoiceMerchant.weixinId = $('#weixinId').val();

            if (p == 1) {
                var obj ={}
                obj.shopNo =$('#merchantId').val();
                obj.weixinId =$('#weixinId').val();
                obj.kind ="BMCP";
                obj.username =$scope.invoiceMerchant.username;
                obj.password =$scope.invoiceMerchant.password;
                obj.referee =$scope.invoiceMerchant.referee;
                obj.exShopNo =$scope.invoiceMerchant.exShopNo;
                obj.exTermNo =$scope.invoiceMerchant.exTermNo;
                $scope.invoiceMerchant =obj;
                console.log($scope.invoiceMerchant);
            } else {
                if($scope.invoiceMerchant.exShopNo)
                    delete $scope.invoiceMerchant.exShopNo;
                if($scope.invoiceMerchant.exTermNo)
                    delete $scope.invoiceMerchant.exTermNo;
                $scope.invoiceMerchant.kind = "ADDNEW";
                console.log($scope.invoiceMerchant);
            }

            $.ajax({
                type: 'post',
                data: $scope.invoiceMerchant,
                url: '/invoice/merchant/regMerchant.do',
                success: function (response) {
                    loading.close();
                    //alert("请求成功");
                    if(response&&response.value){
                        $scope.rentName=response.value.tenant?response.value.tenant:'0000';
                        $scope.extNo=response.value.number?response.value.number:'0000';
                       // console.log(response.value);
                       // console.log($scope.rentName);
                       // console.log($scope.extNo);
                        $scope.$apply();
                    }
                    $scope.nextStep(3);
                },
                error: function (jqXHR) {
                    loading.close();
                    alert(jqXHR.responseText ? jqXHR.responseText : "网络异常，请求数据失败！");
                },
                beforeSend: function () {
                    loading.open();
                }
            });

        }


    }
    ])

