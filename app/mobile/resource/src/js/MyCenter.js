function MyCenter(opts) {
    var me = this;
    me.init(opts);
    
    // $(function () {
    //     $("#slider").excoloSlider();
    // });

    document.title = '会员中心';

    me.store = store;

    if(member.avatar && !member.avatar.match('^http')){
        member.avatar = 'http://images.wosaimg.com/' + member.avatar;
    }
    $.when(
        api.get('report/getViewConsumeNum').done(function (err, result) {
            console.log(result); 
            me.isViewConsumeNum = result;
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
        }),


        api.get('order/getOrders', {
            page: 1,
            pageSize: 1,
            startDate: localStorage.lastVisitMyOrders
        }).done(function (err, result) {
            me.newOrdersCount = result.totalCount;
        }),

        api.get('store/getStore').done(function (err, result) {
            me.store = result;
        }),

        api.get('timeline/getList', {
            memberId: member.id,
            page: 1,
            pageSize: 1,
            startDate: localStorage.lastVisitMyTimeline
        }).done(function (err, result) {
            me.newTimelineItemsCount = result.totalCount;
        }),
        api.get('promotion/getNumOfGroup').done(function(err, result){
            me.numOfGroup = result;
            me.render();
        }),
        api.get('promotion/getActivePromotions').done(function(err, result){
            var list = [];
            var promtoionTemplate = $('#promotionItemTemplate');
            result.forEach(function(promotion){
                var originPrice = 0;
                for (var i = 0; i < promotion.items.length; i++) {
                    originPrice += promotion.items[i].originPrice;
                    promotion.items[i].unitDealPrice /= 100;
                    promotion.items[i].originPrice /= 100;
                }
                originPrice /= 100;
                promotion.costPerPerson /= 100;
                var cutOff = promotion.costPerPerson*100 / (originPrice * 100) * 10;
                cutOff = cutOff.toFixed(1)+ '';

                if (parseInt(cutOff.split('.')[1]) == 0) cutOff = cutOff.split('.')[0];

                var promotionDom = promtoionTemplate.clone().show();
                promotionDom.find('.activity-banner').attr('href', app.promotion + '#/' + store.id + '/promotion/' + promotion.id).find('img:eq(0)').attr('src', imgServer + '/' + promotion.image);
                promotionDom.find('.min-participants-number').html(promotion.minParticipants);
                promotionDom.find('.activity-cutoff-number').html(cutOff);
                promotionDom.find('.intro-list').html(promotion.title);
                promotionDom.find('.origin-price').append(originPrice);
                promotionDom.find('.promotion-price-number').html(promotion.costPerPerson);

                list.push({content: promotionDom.get(0).outerHTML})
            });
            if (list.length) {
                var islider = new iSlider({
                    data: list,
                    type: 'dom',
                    dom: $('#myCenterPromotionsContainer').get(0),
                    duration: 3000,
                    animateType: 'default',
                    isLooping: true,
                    isAutoplay: true,
                    fixPage: true
                });
                islider.addDot();
            }
        })
    ).done(function () {
            me.render();
        });
}

MyCenter.prototype = {
    defaults: {
        root: '.my-center'
    }
};

Module.extend(MyCenter);
