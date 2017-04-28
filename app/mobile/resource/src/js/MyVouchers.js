function MyVouchers(opts) {
	var me = this;
	me.init(opts);

	document.title = '我的券包';
    me.currentTab = 'ACTIVE';

	//me.$root.on('click', '.my-vouchers-card', function(e) {
	//	if (e.target.nodeName == 'A')
	//		return;
    //
	//	$(this).find('.my-vouchers-details').animate({height: 'toggle'});
	//	$(this).find('.my-vouchers-expand i').toggleClass('fa-caret-down').toggleClass('fa-caret-up');
	//});
    me.currentCard = null;
    if(location.search.indexOf('grouponId') !== -1) {
        me.currentCard = location.search.slice(1).split('&')[1].split('=')[1];
    }

	api.get('store/getBranchStores').done(function(err, branchStoreArray) {
		me.branchStoreArray = branchStoreArray;
		me.branchStores = {};
		for (var i = 0; i < me.branchStoreArray.length; i++) {
			var branch = me.branchStoreArray[i];
			me.branchStores[branch.id] = branch;
		}
		api.get('card/getVouchers').done(function(err, result) {
			me.cards = result;
			var now = Date.now();
			me.cards.forEach(function(card) {
				if (card.status == 'ACTIVE' && card.expirationTime && card.expirationTime < now)
					card.status = 'EXPIRED';

				if (card.storeWhiteList) {
					card.branchStores = card.storeWhiteList.map(function(storeId) {
						return me.branchStores[storeId];
					});
				} else {
					card.branchStores = me.branchStoreArray;
				}

                if (card.id == me.currentCard) {
                    me.currentTab = card.status;
                }
			});

			me.cards.sort(function(a, b) {
				if (a.status == 'ACTIVE' && b.status != 'ACTIVE')
					return -1;
				else if (a.status != 'ACTIVE' && b.status == 'ACTIVE')
					return 1;
				else
					return a.createDate - b.createDate;

			});

			me.active_vouchers = me.cards.filter(function(card){
				return card.status == 'ACTIVE';
			})
			me.redeemed_vouchers = me.cards.filter(function(card){
				return card.status == 'REDEEMED';
			})
			me.expired_vouchers = me.cards.filter(function(card){
				return card.status == 'EXPIRED';
			})
			me.render();
			localStorage.lastVisitMyVouchers = Date.now();

            $('[data-target="#qrcodeModal'+me.currentCard+'"]').click();
		});
	});

	me.$root.on('click', '.active-filter', function() {
		$(".tab-filter").removeClass('tab-focus');
		$(this).addClass('tab-focus');
		$('.block').hide();
		$('.block-active').show();
	});

	me.$root.on('click', '.expired-filter', function() {
		$(".tab-filter").removeClass('tab-focus');
		$(this).addClass('tab-focus');
		$('.block').hide();
		$('.block-expired').show();
	});

	me.$root.on('click', '.used-filter', function() {
		$(".tab-filter").removeClass('tab-focus');
		$(this).addClass('tab-focus');
		$('.block').hide();
		$('.block-redeemed').show();
	});

	me.$root.on('click', '.branches-wrap', function() {
		$(this).find('.branches-extend').animate({height: 'toggle'}, 200);
		$(this).find('.dropdown-arrow').toggleClass('rotate');
	});

	//me.$root.on('click', '.my-vouchers-img', function () {
	//	var my_modal_dialog = $(this).next().find('.my-modal-dialog');
	//	my_modal_dialog.css({'top': '', 'left': '', transform:'scale(0,0)'});
	//	my_modal_dialog.offset($(this).offset());
	//	my_modal_dialog.addClass('my-modal-dialog-zoom-in');
	//	my_modal_dialog.animate({ top: '65px', left:"25px", marginRight: '55px', transform:'scale(1,1)'});
	//	my_modal_dialog.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
	//		function(e) {
	//			my_modal_dialog.removeClass('my-modal-dialog-zoom-in');
	//		}
	//	);
    //
	//});
}

MyVouchers.prototype = {
	defaults: {
		root: '.my-vouchers'
	},

	status: function(card) {
		var text = {
			INACTIVE: '未激活',
			ACTIVE: '未使用',
			REDEEMED: '已使用',
			EXPIRED: '已过期',
			FROZEN: '已冻结'
		};

		if (card.status == 'ACTIVE' && card.expirationTime && Date.now() > card.expirationTime)
			return '已过期';

		return text[card.status];
	}
};

Module.extend(MyVouchers);
