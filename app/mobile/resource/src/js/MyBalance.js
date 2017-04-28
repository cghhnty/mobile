function MyBalance(opts) {
	var me = this;
	me.init(opts);

	document.title = '储值账户';

	api.get('card/getBalance').done(function(err, result) {
		me.account = result.account;
		me.cards = result.cards;
		var now = Date.now();
		me.cardsActive = me.cards.filter(function(card) {
			return card.status == 'ACTIVE' && (!card.expirationTime || card.expirationTime > now);
		});
		me.cardsFrozen = me.cards.filter(function(card) {
			return card.status == 'FROZEN';
		});
		me.cardsExpired = me.cards.filter(function(card) {
			return card.status in {EXPIRED: 1, REDEEMED: 1} || (card.expirationTime && card.expirationTime < now);
		});

		me.render();
		localStorage.lastVisitMyBalance = Date.now();
	});
}

MyBalance.prototype = {
	defaults: {
		root: '.my-balance'
	}
};

Module.extend(MyBalance);
