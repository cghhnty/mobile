function ActivityScratchcard(opts) {
	var me = this;
	me.init(opts);

	me.history = new ActivityHistory({
		type: 'SCRATCHCARD'
	});

	me.find('.activity-scratchcard-scratch-area').wScratchPad({
		size: 10,
		cursor: 'default',
		bg: null,
		fg: '#a9a9a7',
		scratchUp: function(e, percent) {
			if (percent > 30) {
				api.post('activity/open', {id: me.ticket.id}).done(function() {
					if (me.ticket.level != -1)
						me.history.load();
				});

				me.remaining != null && me.remaining--;
				me.render();

				me.find('.activity-scratchcard-scratch-area').wScratchPad('reset').wScratchPad('enable', false);

				me.find('.activity-scratchcard-card').hide();

				if (me.ticket.level == -1) {
					if (me.remaining == null || me.remaining > 0) {
						me.find('.activity-scratchcard-loose').show();
					} else {
						me.find('.activity-scratchcard-gameover').show();
					}
				} else {
					me.find('.activity-scratchcard-win').show();
				}
			}
		}
	}).wScratchPad('enable', false).find('img').remove();

	me.find('.activity-scratchcard-btn-rest, .activity-scratchcard-btn-again').click(function() {
		me.find('.activity-scratchcard-win, .activity-scratchcard-loose, .activity-scratchcard-gameover').hide();
		me.find('.activity-scratchcard-card').show();
		me.draw();
	});

	var ctx = me.find('canvas')[0].getContext('2d');
	ctx.font = '20px sans-serif';
	ctx.fillStyle = '#fff';
	ctx.fillText('刮奖区', 55, 30);

	// 活动/中奖记录tab切换
	me.find('.activity-scratchcard-tab-history').click(function() {
		document.title = '中奖记录';
		me.find('.activity-scratchcard-main').hide();
		me.find('.activity-scratchcard-history').show();
		me.find('.activity-scratchcard-tab-main').removeClass('active');
		me.find('.activity-scratchcard-tab-history').addClass('active');
	});

	me.find('.activity-scratchcard-tab-main').click(function() {
		document.title = me.activity.name;
		me.find('.activity-scratchcard-main').show();
		me.find('.activity-scratchcard-history').hide();
		me.find('.activity-scratchcard-tab-main').addClass('active');
		me.find('.activity-scratchcard-tab-history').removeClass('active');
	});

	// 适用门店展开toggle
	me.find('.activity-scratchcard-stores-toggle').click(function() {
		if (me.$stores.hasClass('activity-scratchcard-collapse')) {
			me.$stores.removeClass('activity-scratchcard-collapse').addClass('activity-scratchcard-expand').animate({height: me.storesHeightExpand});
			me.$storesToggleIcon.removeClass('fa-angle-down').addClass('fa-angle-up');
		} else {
			me.$stores.removeClass('activity-scratchcard-expand').addClass('activity-scratchcard-collapse').animate({height: me.storesHeightCollapse});
			me.$storesToggleIcon.removeClass('fa-angle-up').addClass('fa-angle-down');
		}
	});

	api.get('activity/getLotteryActivity', {id: query.id}).done(function(err, result) {
		me.activity = result.activity;
		me.remaining = result.remaining;
		me.tried = result.tried;

		document.title = me.activity.name;
		me.render();
		wxOnMenuShare({
			title: me.activity.name,
			desc: me.activity.intro,
			imgUrl: res('img/activity-scratchcard/wx-share-thumb.png')
		});

		if (me.activity.storeWhiteList.length > 1) {
			me.$stores = me.find('.activity-scratchcard-stores');
			me.storesHeightExpand = me.$stores.innerHeight() + 'px';
			me.storesHeightCollapse = me.find('.activity-scratchcard-store').innerHeight() + 'px';
			me.$stores.css('height', me.storesHeightCollapse);
			me.$storesToggleIcon = me.find('.activity-scratchcard-stores-toggle-icon');
		}

		if (me.tried) {
			me.find('.activity-scratchcard-card').hide();
			me.find('.activity-scratchcard-subscribe').show();
		} else {
			if (me.remaining == null || me.remaining > 0)
				me.draw();
		}
	});
}

ActivityScratchcard.prototype = {
	defaults: {
		root: '.activity-scratchcard'
	},

	draw: function() {
		var me = this;
		api.post('activity/draw', {id: query.id}).done(function(err, ticket) {
			me.ticket = ticket;
			me.render();
			me.find('.activity-scratchcard-scratch-area').wScratchPad('enable', true);
		});
	}
};

Module.extend(ActivityScratchcard);
