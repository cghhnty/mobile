/**
 * Created by Session on 15/10/29.
 */

function LakalaCenter (opts){
    var me = this;
    me.init(opts);

    document.title = '会员中心';

    if(member.avatar && !member.avatar.match('^http')){
        member.avatar = 'http://images.wosaimg.com/' + member.avatar;
        member.avatar += '@114h_114w_1e_1c_73ci.png';
    }

    api.get('member/getMerchantMemberEx', {merchantId: query.merchantId}).done(function(err, memberEx){
        var now = new Date;
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
        memberEx.point = memberEx.point?memberEx.point/100:0;
        memberEx.countVoucherCards = 0;
        memberEx.voucherCards = [];
        memberEx.cards.forEach(function(card){
            card.disabled = false;
            var lastWeek = today-(7*24*60*60*1000);
            if (card.type == 'VOUCHER_CARD' && card.status == 'ACTIVE' && !(card.expirationTime && card.expirationTime < lastWeek)){
                if (card.expirationTime && card.expirationTime < today) {
                    card.disabled = true;
                }else{
                    memberEx.countVoucherCards++;
                }
                memberEx.voucherCards.push(card);
            }
        });

        memberEx.voucherCards.sort(function(a, b){
            var firstExpirationTime = a.expirationTime;
            var secondExpirationTime = b.expirationTime;
            if (!firstExpirationTime && !secondExpirationTime) {
                return 0;
            } else if (!firstExpirationTime && secondExpirationTime) {
                return -1;
            } else if (firstExpirationTime && !secondExpirationTime) {
                return 1;
            } else {
                return secondExpirationTime - firstExpirationTime;
            }
        });
        me.memberEx = memberEx;
        me.render();
    });


}

LakalaCenter.prototype = {
    defaults: {
        root: '.lakala-merchant'
    }
};
Module.extend(LakalaCenter);
