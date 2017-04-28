function ActivityWheel(opts) {
    var me = this;
    me.init(opts);
    me.curveA = me.spinAccel;
    me.curveN = me.spinMin;
    me.curveM = Math.sqrt((me.spinStart - me.curveN) / me.curveA);
    me.spinEndX = me.getCurveX(me.spinEnd);
    me.find(".activity-wheel-btn").click(function() {
        me.draw();
    });
    me.find(".activity-wheel-stores-toggle").click(function() {
        if (me.$stores.hasClass("activity-wheel-collapse")) {
            me.$stores.removeClass("activity-wheel-collapse").addClass("activity-wheel-expand").animate({
                height: me.storesHeightExpand
            });
            me.$storesToggleIcon.removeClass("fa-angle-down").addClass("fa-angle-up");
        } else {
            me.$stores.removeClass("activity-wheel-expand").addClass("activity-wheel-collapse").animate({
                height: me.storesHeightCollapse
            });
            me.$storesToggleIcon.removeClass("fa-angle-up").addClass("fa-angle-down");
        }
    });
    api.get("activity/getLotteryActivity", {
        id: query.id
    }).done(function(err, result) {
        me.activity = result.activity;
        me.remaining = result.remaining;
        me.tried = result.tried;
        document.title = me.activity.name;
        me.render();
        wxOnMenuShare({
            desc: me.activity.intro,
            imgUrl: res("img/activity-wheel/wx-share-thumb.png")
        });
        if (me.activity.storeWhiteList.length > 1) {
            me.$stores = me.find(".activity-wheel-stores");
            me.storesHeightExpand = me.$stores.innerHeight() + "px";
            me.storesHeightCollapse = me.find(".activity-wheel-store").innerHeight() + "px";
            me.$stores.css("height", me.storesHeightCollapse);
            me.$storesToggleIcon = me.find(".activity-wheel-stores-toggle-icon");
        }
        var $blocks = me.find(".activity-wheel-block").removeClass("activity-wheel-block-active");
        var arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
        for (var i = 0; i < me.activity.prizes.length; i++) {
            var rand = Math.floor(arr.length * Math.random());
            var k = arr[rand];
            arr.splice(rand, 1);
            me.prizeLocation[i] = k;
            var $icon = $blocks.filter('[data-index="' + k + '"]').find(".activity-wheel-icon");
            var animClass = "activity-wheel-icon-prize" + i % 4 + " activity-wheel-animate activity-wheel-tada";
            $icon.addClass(animClass);
            (function($icon) {
                setTimeout(function() {
                    $icon.removeClass(animClass).addClass("activity-wheel-icon-coupon");
                }, 1e3);
            })($icon);
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            $blocks.filter('[data-index="' + arr[i] + '"]').addClass("activity-wheel-noprize").find(".activity-wheel-icon").addClass("activity-wheel-icon-upset");
        }
    });
}

ActivityWheel.prototype = {
    defaults: {
        root: ".activity-wheel",
        spinAccel: 3,
        spinStart: 200,
        spinEnd: 1e3,
        spinMin: 30,
        spinMinLast: 1e3
    },
    prizeLocation: {},
    draw: function() {
        var me = this;
        if (me.running) return;
        if (me.tried) return modal('亲~你已经抽过奖了!\n关注微信号"' + store.weixinConfig.name + '"获得更多抽奖机会');
        me.running = true;
        api.post("activity/draw", {
            id: query.id
        }).fail(function() {
            stop = false;
        }).done(function(err, ticket) {
            me.ticket = ticket;
            api.post("activity/open", {
                id: me.ticket.id
            }).fail(function() {
                stop = false;
            }).done(function() {
                me.remaining != null && me.remaining--;
                me.render();
                if (me.ticket.level == -1) {
                    var $noprize = me.find(".activity-wheel-noprize");
                    var i = Math.floor($noprize.length * Math.random());
                    stop = $noprize.eq(i).attr("data-index");
                } else {
                    stop = me.prizeLocation[me.ticket.level];
                }
            });
        });
        var i = 0;
        var step = 0;
        var stop;
        var x = 0;
        var delay = me.getCurveY(i);
        var min;
        var last = 0;
        var scale;
        var j = 0;
        var a;
        var $blocks = me.find(".activity-wheel-block").removeClass("activity-wheel-block-active");
        spin();
        function spin() {
            setTimeout(function() {
                $blocks.filter('[data-index="' + x + '"]').removeClass("activity-wheel-block-active");
                x = step++ % 12;
                var $block = $blocks.filter('[data-index="' + x + '"]').addClass("activity-wheel-block-active");
                if (stop === false) {
                    me.running = false;
                    $blocks.removeClass("activity-wheel-block-active");
                } else {
                    if (j != a) {
                        if (!min) {
                            var d = me.getCurveY(i);
                            if (d > delay) {
                                min = last = delay;
                            } else {
                                delay = d;
                                i++;
                            }
                        } else if (min && (last <= me.spinMinLast || stop == undefined)) {
                            last += min;
                        } else {
                            if (!scale) {
                                var turns = Math.round((me.spinEndX - i) / 12);
                                a = turns * 12 + (stop - x);
                                scale = (me.spinEndX - i) / a;
                            }
                            delay = me.getCurveY(i + scale * j++);
                        }
                        spin();
                    } else {
                        $block.addClass("activity-wheel-pulse");
                        setTimeout(function() {
                            $block.removeClass("activity-wheel-pulse");
                            if (me.ticket.level == -1) {
                                modal("真可惜没有中奖~~");
                            } else {
                                modal("恭喜你中了" + (me.activity.prizes[me.ticket.level].name || "") + me.activity.prizes[me.ticket.level].description + "一张");
                            }
                            me.running = false;
                        }, 1e3);
                    }
                }
            }, delay);
        }
    },
    getCurveY: function(x) {
        var me = this;
        return me.curveA * Math.pow(x - me.curveM, 2) + me.curveN;
    },
    getCurveX: function(y) {
        var me = this;
        return me.curveM + Math.sqrt((y - me.curveN) / me.curveA);
    }
};

Module.extend(ActivityWheel);
//# sourceMappingURL=ActivityWheel.js.map