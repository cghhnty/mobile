module.exports = {
	port: 8111,
	protocol: 'http',



	keys: ['J%9Mt7Cg_1N_Q#Qk]:j~N9<{`CWt0Xse', 'op`dZK@0L1|N(oe1nMP9F-6}"Y+4ysR}'], // ['current Key', 'old Key', ...]

	sessionExpire: 30 * 24 * 60 * 60,

	redis: {
		port: 6379,
		host: '10.7.111.45',
        	dbIndex: 2
	},
	domain:{
		domainName:"http://postest.lakala.com.cn",
		api: "http://postest.lakala.com.cn/api",
		resource: "http://postest.lakala.com.cn/mobile/"
	},


	taiji: {
		//url: 'http://postest.lakala.com.cn/taiji/rpc',
		url: 'http://10.7.111.46:8080/taiji/rpc',
		//url: 'http://10.7.40.139:9966/taiji-backend/rpc',
		//url: 'http://10.7.40.97:9966/taiji-backend/rpc',
		accountUsername: 'wosai-web',
		accountPassword: 'wosai1234'
	},

	/*sms: {
		url: 'http://localhost:8200/sms',
		key: 'J%9Mt7Cg_1N_Q#Qk]:j~N9<{`CWt0Xse'
	},*/

	file: {
		url: 'http://postest.lakala.com.cn/taiji/rpc',
		base: 'http://images.wosaimg.com'
		//spdb:'https://ecentre.spdbccc.com.cn/creditcard/netLoanYoung.htm?channel=ABJLKL2'
	},

	weixin: {
		appId: 'wx7a12dee6be5335ba', // yuanxiang@lakala.com
		appSecret: '4b4b9e2ee07e7a927a93458a2cf8a550',
		mp_verify: 'MP_verify_hIceTlNyFU0gOtDa.txt',
		platformName:'生活小惠',
		platformImg:'wechatTest.jpg'
	},
	
    queue: {
        address: 'amqp://admin:admin123@postest.lakala.com.cn:5672',
		queue: 'saas.backend.weixin.notification',
		wechatEvent: {
			exchange: 'weixin.event'
		}
    },

    channelStore: {
        // 拉卡拉
        '4de4367a-c3c2-43e4-a592-053bc698ca5f': {
            'myCenter': 'lakala/center',
            'order': {
                'first': '',
                'remark': '{{order.gift.pointGift ? "恭喜您获得"+store.details.name+(order.gift.pointGift/100)+"个积分":""}}'
            }
        }
    },

	sqbStoreId: '8c217cd7-a36d-41e5-a872-c625825f0065'
};
