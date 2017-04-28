function TimelineItem(opts) {
	var me = this;
	me.init(opts);
	document.title = '美好时光';

	api.get('timeline/getItem', {id: query.id}).done(function(err, item) {
		me.timelineItem = item;
		me.isSelf = member && member.id == item.memberId;
		me.render();

		me.swiper = new Swiper('.swiper-container', {
			pagination: '.swiper-pagination',
			centeredSlides: true,
			slidesPerView: 'auto'
		});

		var index = location.hash.slice(1);
		if (index)
			me.swiper.swipeTo(index);

		$.when((function() {
			if (me.isSelf) {
				me.memberName = member.fullName;
				return;
			} else {
				return api.get('member/getMember', {memberId: item.memberId}).done(function(err, member) {
					me.memberName = member.fullName;
				});
			}
		})()).done(function() {
			document.title = me.memberName + '的美好时光';
			wxOnMenuShare({
				title: me.memberName + '的美好时光'
			});
		});
	});
}

TimelineItem.prototype = {
	defaults: {
		root: '.timeline-item'
	}
};

Module.extend(TimelineItem);
