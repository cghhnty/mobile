function ActivityVoucher(opts) {
	var me = this;
	me.init(opts);

	me.activityId = query.id;

	me.find('.activity-voucher-stores-toggle').click(function() {
		if (me.$stores.hasClass('activity-voucher-collapse')) {
			me.$stores.removeClass('activity-voucher-collapse').addClass('activity-voucher-expand').animate({height: me.storesHeightExpand});
			me.$storesToggleIcon.removeClass('fa-angle-down').addClass('fa-angle-up');
		} else {
			me.$stores.removeClass('activity-voucher-expand').addClass('activity-voucher-collapse').animate({height: me.storesHeightCollapse});
			me.$storesToggleIcon.removeClass('fa-angle-up').addClass('fa-angle-down');
		}
	});

	me.find('.activity-voucher-take').click(function() {
		if (me.voucher)
			return;

		api.post('activity/createVoucher', {id: me.activityId}).done(function(err, voucher) {
			me.voucher = voucher;
			me.render();
		});
	});

	api.get('activity/getVoucherActivity', {id: query.id}).done(function(err, result) {
		me.activity = result.activity;
		me.voucher = result.voucher;
		document.title = me.activity.voucherDef.name;
		me.render();
		wxOnMenuShare({
			desc: me.activity.intro,
			imgUrl: res('img/activity-voucher/wx-share-thumb.png')
		});

		if (me.activity.storeWhiteList.length > 1) {
			me.$stores = me.find('.activity-voucher-stores');
			me.storesHeightExpand = me.$stores.innerHeight() + 'px';
			me.storesHeightCollapse = me.find('.activity-voucher-store').innerHeight() + 'px';
			me.$stores.css('height', me.storesHeightCollapse);
			me.$storesToggleIcon = me.find('.activity-voucher-stores-toggle-icon');
		}
	});
}

ActivityVoucher.prototype = {
	defaults: {
		root: '.activity-voucher'
	}
};

Module.extend(ActivityVoucher);
