function MyStampcards(opts) {
    var me = this;
    me.init(opts);
    document.title = "计次卡";
    api.get("card/getStampcards").done(function(err, cards) {
        me.cards = cards;
        var now = Date.now();
        me.cardsActive = me.cards.filter(function(card) {
            return card.status == "ACTIVE" && (!card.expirationTime || card.expirationTime > now);
        });
        me.cardsFrozen = me.cards.filter(function(card) {
            return card.status == "FROZEN";
        });
        me.cardsExpired = me.cards.filter(function(card) {
            return card.status in {
                EXPIRED: 1,
                REDEEMED: 1
            } || card.expirationTime && card.expirationTime < now;
        });
        me.render();
    });
}

MyStampcards.prototype = {
    defaults: {
        root: ".my-stampcards"
    }
};

Module.extend(MyStampcards);
//# sourceMappingURL=MyStampcards.js.map