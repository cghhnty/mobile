function MyBindExistedAccount(opts) {
	var me = this;
	me.init(opts);

	document.title = '账号绑定';

	me.find('.my-bind-existed-account-send-authcode').click(function() {
		if(!/\d{11}/.test(me.phone))
			return modal('请输入正确的手机号码');

		me.countdownStart();
		api.post('member/sendAuthcode', {phone: me.phone}, function(err, result) {
			if (err) {
				me.countdownStop();
				return handleError(err, {
					'SHRT60Y9': function() {
						modal('您已经绑定过该手机号码了, 现在带您前往个人中心', function() {
							location.replace(link('my/center'));
						});
					}
				});
			}

			modal('验证码已发送至您的手机');
		});
	});

	me.find('form').submit(function(e) {
		e.preventDefault();

		if (me.submiting)
			return;

		if (!me.authcode)
			return modal('请输入验证码');

		me.submiting = true;
		api.post('member/verifyAuthcode', {authcode: me.authcode}).done(function() {
			modal('绑定成功! 现在带您前往个人中心.', function() {
				location.replace(link('my/center'));
			});
		}).always(function() {
			me.submiting = false;
			me.render();
		});
		me.render();
	});

	me.render();
}

MyBindExistedAccount.prototype = {
	defaults: {
		root: '.my-bind-existed-account'
	},

	submiting: false,

	countdownStart: function() {
		var me = this;
		me.countdown = 60;
		me.render();
		me.timer = setInterval(function() {
			if (--me.countdown == 0) {
				me.countdownStop();
			} else {
				me.render();				
			}
		}, 1000);
	},

	countdownStop: function() {
		var me = this;
		clearInterval(me.timer);
		me.countdown = 0;
		me.render();
	}
};

Module.extend(MyBindExistedAccount);
