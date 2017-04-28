function ActivityHistory(opts) {
	var me = this;
	me.init(opts);

	if (!me.type && query.type)
		me.type = query.type;

	document.title = '中奖记录';

	me.$root.on('click', '.activity-history-item', function() {
		$(this).find('.activity-history-details').animate({height: 'toggle'});
		$(this).find('.activity-history-toggle-icon').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
	});

	api.get('store/getBranchStores').done(function(err, branchStoreArray) {
		me.branchStoreArray = branchStoreArray;
		me.branchStores = {};
		for (var i = 0; i < me.branchStoreArray.length; i++) {
			var branch = me.branchStoreArray[i];
			me.branchStores[branch.id] = branch;
		}
		me.load();
	});
}

ActivityHistory.prototype = {
	defaults: {
		root: '.activity-history'
	},

	load: function() {
		var me = this;
		return api.get('activity/getHistories', {type: me.type}).done(function(err, histories) {
			me.histories = histories;

			me.activeTickets = [];
			me.unavailableTickets = [];

			var now = Date.now();
			for (var i = 0; i < me.histories.length; i++) {
				var history = me.histories[i];

				if (history.card.status == 'ACTIVE' && (!history.card.expirationTime || now < history.card.expirationTime))
					me.activeTickets.push(history);
				else
					me.unavailableTickets.push(history);

				if (history.card.storeWhiteList) {
					history.card.storeWhiteList = history.card.storeWhiteList.map(function(storeId) {
						return me.branchStores[storeId];
					});
				} else {
					history.card.storeWhiteList = me.branchStoreArray;
				}
			}

			me.render();
		});
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

Module.extend(ActivityHistory);
