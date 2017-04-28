function LakalaCenter(opts) {
    var me = this;
    me.init(opts);
    document.title = "会员中心";
    if (member.avatar && !member.avatar.match("^http")) {
        member.avatar = "http://images.wosaimg.com/" + member.avatar;
        member.avatar += "@146h_146w_1e_1c_73ci.png";
    }
    api.get("member/getAllMemberExByChannelMemberId").done(function(err, memberExs) {
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
        if (!memberExs || memberExs.length === 0) {
            api.get("member/getMemberEx").done(function(err, member) {
                memberExs = [ member ];
                memberExs.forEach(function(memberEx) {
                    memberEx.point = memberEx.point ? memberEx.point / 100 : 0;
                    memberEx.countVoucher = 0;
                    memberEx.cards.forEach(function(card) {
                        if (card.type == "VOUCHER_CARD" && card.status == "ACTIVE" && !(card.expirationTime && card.expirationTime < today)) {
                            memberEx.countVoucher++;
                        }
                    });
                });
                me.memberExs = memberExs;
                console.log("getMemberEx Result:");
                console.log(me.memberExs);
                var tmp = me.memberExs ? me.memberExs[0] : null;
                if (tmp && tmp.member && tmp.member.storeId) {
                    api.get("store/getStoreByStoreId?memberStoreId=" + tmp.member.storeId).done(function(e, memberStore) {
                        if (!e) {
                            me.memberExs.forEach(function(memberEx) {
                                memberEx.store = memberStore;
                            });
                            me.render();
                        }
                    });
                } else {
                    me.render();
                }
            });
        } else {
            memberExs.forEach(function(memberEx) {
                memberEx.point = memberEx.point ? memberEx.point / 100 : 0;
                memberEx.countVoucher = 0;
                memberEx.cards.forEach(function(card) {
                    if (card.type == "VOUCHER_CARD" && card.status == "ACTIVE" && !(card.expirationTime && card.expirationTime < today)) {
                        memberEx.countVoucher++;
                    }
                });
            });
            me.memberExs = memberExs;
            console.log("getAllMemberExByChannelMemberId Result:");
            console.log(me.memberExs);
            me.render();
        }
    });
    $(document).on("click", ".merchant", function(event) {
        if (!$(this).data("canEnter")) return;
        var merchantId = $(this).data("merchantId");
        window.location.href = link("lakala/merchant", {
            merchantId: merchantId
        });
    });
}

LakalaCenter.prototype = {
    defaults: {
        root: ".lakala-center"
    }
};

Module.extend(LakalaCenter);
//# sourceMappingURL=center.js.map