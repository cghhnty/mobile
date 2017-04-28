function MyCards(opts) {
    var me = this;
    me.init(opts);
    document.title = "会员卡";
    var cardStyles = {
        STAMP_CARD: {
            ACTIVE: "card-stamp",
            EXPIRED: "stamp-card-inactive"
        },
        PERIOD_CARD: {
            ACTIVE: "card-period",
            EXPIRED: "period-card-inactive"
        },
        DISCOUNT_CARD: {
            ACTIVE: "my-discount-card",
            EXPIRED: "my-discount-card-expired"
        },
        BALANCE_CARD: {
            ACTIVE: "my-balance-card ",
            EXPIRED: "my-balance-card-expired"
        }
    };
    api.get("report/getViewConsumeNum").done(function(err, result) {
        me.isViewConsumeNum = result;
    }), api.get("card/getStampAndPeriodCards").done(function(err, result) {
        me.cards = result.cards;
        me.cardDefs = result.cardDefs;
        var now = Date.now();
        me.cards.forEach(function(card) {
            card.isViewConsumeNum = me.isViewConsumeNum;
            if (card.status == "ACTIVE" && card.expirationTime && card.expirationTime < now) card.status = "EXPIRED";
            try {
                card.className = cardStyles[card.type][card.status] || "";
            } catch (e) {
                card.className = "";
            }
        });
        me.cards.sort(function(a, b) {
            if (a.status == "ACTIVE" && b.status != "ACTIVE") return -1; else if (a.status != "ACTIVE" && b.status == "ACTIVE") return 1; else return a.createDate - b.createDate;
        });
        me.active_cards = me.cards.filter(function(card) {
            return card.status == "ACTIVE";
        });
        me.expired_cards = me.cards.filter(function(card) {
            return card.status == "EXPIRED";
        });
        me.render();
        localStorage.lastVisitMyCards = Date.now();
    });
    me.$root.on("click", ".card-body-wrap", function() {
        $(this).toggleClass("expanded");
        if ($(this).hasClass("expanded")) {
            $(this).next().hide();
        }
        $(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(e) {
            if ($(this).hasClass("expanded")) {
                $(this).find(".card-body-footer-wrap").show();
            }
        });
        if (!$(this).hasClass("expanded")) {
            $(this).find(".card-body-footer-wrap").hide();
            $(this).next().show();
        }
    });
    me.$root.on("click", ".active-filter", function() {
        $(".tab-filter").removeClass("tab-focus");
        $(this).addClass("tab-focus");
        $(".block-expired").hide();
        $(".block-active").show();
    });
    me.$root.on("click", ".inactive-filter", function() {
        $(".tab-filter").removeClass("tab-focus");
        $(this).addClass("tab-focus");
        $(".block-active").hide();
        $(".block-expired").show();
    });
}

MyCards.prototype = {
    defaults: {
        root: ".my-cards-root"
    },
    cardType: {
        STAMP_CARD: "计次卡",
        PERIOD_CARD: "时段卡",
        BALANCE_CARD: "储值卡",
        DISCOUNT_CARD: "资格卡"
    }
};

Module.extend(MyCards);
//# sourceMappingURL=MyCards.js.map