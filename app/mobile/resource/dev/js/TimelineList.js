function TimelineList(opts) {
    var me = this;
    me.init(opts);
    document.title = "美好时光";
    me.isSelf = member && member.id == query.memberId;
    $.when(function() {
        if (me.isSelf) {
            me.memberName = member.fullName;
            return;
        } else {
            return api.get("member/getMember", {
                memberId: query.memberId
            }).done(function(err, member) {
                me.memberName = member.fullName;
            });
        }
    }(), api.get("timeline/getList", {
        memberId: query.memberId
    }).done(function(err, result) {
        me.items = result.value.filter(function(a) {
            return a.imageUrls && a.imageUrls.length;
        });
        me.render();
        localStorage.lastVisitMyTimeline = Date.now();
    })).done(function() {
        document.title = me.memberName + "的美好时光";
        wxOnMenuShare({
            title: me.memberName + "的美好时光"
        });
    });
}

TimelineList.prototype = {
    defaults: {
        root: ".timeline-list"
    }
};

Module.extend(TimelineList);
//# sourceMappingURL=TimelineList.js.map