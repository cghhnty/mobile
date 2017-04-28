function TimelinePhoto(opts) {
    var me = this;
    me.init(opts);
    document.title = "美好时光";
    api.get("timeline/getItem", {
        id: query.id
    }).done(function(err, item) {
        me.imgUrl = item.imageUrls[query.index];
        me.isSelf = member && member.id == item.memberId;
        me.render();
        $.when(function() {
            if (me.isSelf) {
                me.memberName = member.fullName;
                return;
            } else {
                return api.get("member/getMember", {
                    memberId: item.memberId
                }).done(function(err, member) {
                    me.memberName = member.fullName;
                });
            }
        }()).done(function() {
            document.title = me.memberName + "的美好时光";
            wxOnMenuShare({
                title: me.memberName + "的美好时光"
            });
        });
    });
}

TimelinePhoto.prototype = {
    defaults: {
        root: ".timeline-photo"
    }
};

Module.extend(TimelinePhoto);
//# sourceMappingURL=TimelinePhoto.js.map