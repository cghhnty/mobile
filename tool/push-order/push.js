var simpleWechat = require('simple-wechat');
var WechatTokenStore = require(BASE + '/module/WechatTokenStore');
var crypto = require('crypto');

var fengShouPayments = {
	UNIONPAY: 'POS刷卡',
	UPAY_ALIPAY: '支付宝',
	UPAY_WEIXIN: '微信'
};

module.exports = function(order, forIndex) {
    if (order.types && order.types.indexOf('GROUPON') != -1){
        return console.log(new Date, 'groupon order, will not push order');
    }

    var pushId = new Date().getTime().toString() + '_' + (forIndex + 1);
    mongo.collection('weixinPushorder').insert({_id: pushId, orderId: order._id, orderCode: order.orderCode, memberId: (typeof(order.memberId) == "undefined" ? '' : order.memberId), ctime: new Date().getTime()},
        function(err, weixinPushorder) {
            if (err)
                return console.error(err);
        });

	if (!order.memberId)
		return;

    console.log('orderCode:' + order.orderCode);
	mongo.collection('member').findOne({_id: order.memberId}, function(err, member) {
		if (err)
			return console.error(err);

		if (!member.weixinId) {
            console.log('orderCode:' + order.orderCode + ', member has no weixinId');
			return;
        }

		var memberName = member.fullName;//会员名
		var memberCode = member.memberCode;//会员号

		mongo.collection('store').findOne({_id: member.storeId}, function(err, store) {
			if (err)
				return console.error(err);

            // 会员所属storeId
            mongo.collection('weixinPushorder').update({_id: pushId},{$set:{memberStoreId: store._id, weixinId:member.weixinId, hasWeixinConfig: !!store.weixinConfig, hasTemplateIds: ((!!store.weixinConfig) ? !!store.weixinConfig.paymentMessageTemplateIds : false)}},
                function(err, weixinPushorder) {
                    if (err)
                        return console.error(err);
                });

			if (!store.weixinConfig || !store.weixinConfig.paymentMessageTemplateIds) {
            	console.log('orderCode:' + order.orderCode + ', store has no weixinConfig or weixinConfig.paymentMessageTemplateIds');
				return;
            }

			var expire = Date.now() + conf.sessionExpire * 1000;
			var token = crypto.createHmac('md5', conf.keys[0]).update(member.weixinId + expire).digest('hex');
			var login = '&loginWeixin=' +  member.weixinId + '&loginExpire=' + expire + '&loginToken=' + token;
			var api = new simpleWechat.Api(store.weixinConfig.appId, store.weixinConfig.appSecret, new WechatTokenStore(store.weixinConfig.appId));

			var orderTime = new Date(order.statusChangeDate.FINISHED);

			var subtotal = 0;
			var _payment = {};

			var stampPeriodCardNumber = 0;
			var ifOnlyStampPeriodCard = true;//是否只有记次和时段卡
			var cardId;//卡Id
			var cardName;//卡名称
			var cardUseNow;//本次使用
			var cardUseAll;//累计使用

			order.itemList.forEach(function(item) {
				//有其它支付方式
				if (!item.payment) {
					ifOnlyStampPeriodCard = false;
				};
				if (item.payment) {
					if ('stampRedeem' in item.payment){
						stampPeriodCardNumber ++;
					} else {
						ifOnlyStampPeriodCard = false;
					}
				}
				if(ifOnlyStampPeriodCard && stampPeriodCardNumber==1){
					for (var key in item.payment.stampRedeem){
						cardId = key;
						cardUseNow = item.payment.stampRedeem[key];
					}
				}

				if (item.unitDealPrice){
					if(item.type == "DISCOUNT"){
						if(item.unitDealPrice < 0 ){
						    subtotal += item.unitDealPrice;
						}else{
						    subtotal -= item.unitDealPrice;
						}
					}
					else subtotal += item.unitDealPrice * item.count;
				}

				if (item.type == 'HONEBAO')
					_payment['红包'] = 1;

				if (item.payment && item.payment.balancePayment)
					_payment['储值卡'] = 1;
			});

			//使用计次卡时段卡模板
			if(ifOnlyStampPeriodCard){

				if(!store.weixinConfig.paymentMessageTemplateIds.redeem){//没有设置模板id
					return;
				}

                console.log('card:' + cardId);
				mongo.collection('card').findOne({_id: cardId}, function(err, card) {
					if (err)
					return console.error(err);

					cardName = card.name;
					if(card.type == "PERIOD_CARD"){
						cardUseAll = 1;
					}else{
						cardUseAll = card.numberOfStamps - card.remainingStamps;
					}

					api.post('message/template/send', {
						touser: member.weixinId,
						template_id: store.weixinConfig.paymentMessageTemplateIds.redeem,
						url: 'http://postest.lakala.com.cn/my/order?storeId=' + store._id + '&orderId=' + order._id + login,
						topcolor: '#3f67ab',
						data: {
							first: {
								value: '',
								color: '#173177'
							},

							keyword1: {
								value: memberName + '\n',
								color: '#173177'
							},

							keyword2: {
								value: memberCode + '\n',
								color: '#173177'
							},

							keyword3: {
								value: cardName + '\n',
								color: '#173177'
							},

							keyword4: {
								value: cardUseNow + '\n',
								color: '#173177'
							},

							keyword5: {
								value: cardUseAll + '\n',
								color: '#173177'
							},

							remark: {
								value: '',
								color: '#a94442'
							}
						}
					}, function(err, result) {
						if (err)
							return console.error(err);
					});

                    mongo.collection('weixinPushorder').update({_id: pushId},{$set:{cardId: cardId, cardType: card.type, template: 'reedem', template_id: store.weixinConfig.paymentMessageTemplateIds.redeem, sent: true}},
                        function(err, weixinPushorder) {
                            if (err)
                                return console.error(err);
                        });
				});
			}

			else{

                console.log('!store.weixinConfig.paymentMessageTemplateIds.normal=' + !store.weixinConfig.paymentMessageTemplateIds.normal);
				if(!store.weixinConfig.paymentMessageTemplateIds.normal){//没有设置模板id
					return;
				}

				if (subtotal < 0)
				subtotal = 0;

				if (order.payment) {
					if (order.payment.cashAmount)
						_payment['现金'] = 1;
					if (order.payment.pointAmount)
						_payment['积分'] = 1;
					if (order.payment.bankAmount)
						_payment['银行卡'] = 1;
					if (order.payment.balanceAmount)
						_payment['储值账户'] = 1;
                    if (order.payment.weixinOnline)
                        _payment['微信支付'] = 1;
					if (order.payment.fengShouPayments) {
						order.payment.fengShouPayments.forEach(function(p) {
							_payment[fengShouPayments[p.payMethod]] = 1;
						});
					}
				}

				var payment = '';

				for (var k in _payment)
					payment += '/' + k;

				if (payment)
					payment = payment.slice(1);
				else
					payment = '无';
                                console.log("before send,weixinId:" + member.weixinId + ",orderCode:" + order.orderCode);
				api.post('message/template/send', {
					touser: member.weixinId,
					template_id: store.weixinConfig.paymentMessageTemplateIds.normal,
					url: 'http://postest.lakala.com.cn/my/order?storeId=' + store._id + '&orderId=' + order._id + login,
					topcolor: '#3f67ab',
					data: {
						first: {
							value: '',
							color: '#173177'
						},

						keyword1: {
							value: order.orderCode + '\n',
							color: '#173177'
						},

						keyword2: {
							value: orderTime.getFullYear() + '-' + ('0' + (orderTime.getMonth() + 1)).slice(-2) + '-' + ('0' + orderTime.getDate()).slice(-2) + ' ' + ('0' + orderTime.getHours()).slice(-2) + ':' + ('0' + orderTime.getMinutes()).slice(-2) + ':' + ('0' + orderTime.getSeconds()).slice(-2) + '\n',
							color: '#173177'
						},

						keyword3: {
							value: (subtotal / 100).toFixed(2) + '\n',
							color: '#173177'
						},

						keyword4: {
							value: payment + '\n',
							color: '#173177'
						},

						remark: {
							value: '',
							color: '#a94442'
						}
					}
				}, function(err, result) {
					if (err)
						return console.error(err);
                                        console.log(new Date() + " :");
                                        consolere.log(result);
				});

                mongo.collection('weixinPushorder').update({_id: pushId},{$set:{template: 'normal', template_id: store.weixinConfig.paymentMessageTemplateIds.normal, sent: true}},
                    function(err, weixinPushorder) {
                        if (err)
                            return console.error(err);
                    });
			}

		});
	});
};
