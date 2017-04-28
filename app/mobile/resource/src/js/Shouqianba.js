function Shouqianba(opts) {
    var me = this;
    me.init(opts);
    
    // $(function () {
    //     $("#slider").excoloSlider();
    // });

    document.title = '会员中心';
    

    if(member.avatar && !member.avatar.match('^http')){
        member.avatar = 'http://images.wosaimg.com/' + member.avatar;
    }
    $.when(
        api.get('shouqianba/queryPoint', {
            id: member.weixinId
        }).done(function(err, result){
            me.point = result.total;
            me.render();
        }),
        api.get('member/getMemberEx').done(function (err, memberEx) {
            me.memberEx = memberEx;
            me.voucherCardsCount = 0;
            me.cardsCount = 0;
            balanceLastModified = 0;
            cardLastModified = 0;
            voucherLastModified = 0;
            var now = Date.now();
            memberEx.cards.forEach(function (card) {
                if ((card.expirationTime && card.expirationTime < now) || card.status != 'ACTIVE') {
                    return;
                } else if (card.type in {BALANCE_ACCOUNT: 1}) {
                    if (!balanceLastModified || card.lastModified > balanceLastModified)
                        balanceLastModified = card.lastModified;
                }
                if (card.type == 'VOUCHER_CARD') {
                    me.voucherCardsCount++;
                    if (!voucherLastModified || card.lastModified > voucherLastModified)
                        voucherLastModified = card.lastModified;
                }
                if (card.type in {STAMP_CARD: 1, PERIOD_CARD: 1, BALANCE_CARD: 1, DISCOUNT_CARD: 1}) {
                    me.cardsCount++;
                    if (!cardLastModified || card.lastModified > cardLastModified)
                        cardLastModified = card.lastModified;
                }
            });

            me.noticeBalance = (balanceLastModified > 0 && !localStorage.lastVisitMyBalance || balanceLastModified > localStorage.lastVisitMyBalance);
            me.noticeVoucher = (voucherLastModified > 0 && !localStorage.lastVisitMyVouchers || voucherLastModified > localStorage.lastVisitMyVouchers);
            me.noticeCard = (cardLastModified > 0 && !localStorage.lastVisitMyCards || cardLastModified > localStorage.lastVisitMyCards);
            me.newOrdersCount = 0;
            me.newTimelineItemsCount = 0;


            me.render();
        })
    ).done(function () {
            me.render();
        });

}

Shouqianba.prototype = {
    defaults: {
        root: '.my-center'
    }
};

Module.extend(Shouqianba);
