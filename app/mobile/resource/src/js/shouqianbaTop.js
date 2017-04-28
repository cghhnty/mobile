function shouqianbaTop(opts) {
    var me = this;
    me.init(opts);
    me.sevenDaysLeaderBoard = [];
    me.totalLeaderBoard = [];
    me.personalRanking = {};

    // Count closure to monitor number of finished requests
    var count = (function() {
        var num = 0;

        return function() {
            if (num == 2) {
                return true;
            } else {
                num++;
                return false;
            }
        }
    })();

    document.title = '英雄榜';

    if (member.avatar && !member.avatar.match('^http')){
        member.avatar = 'http://images.wosaimg.com/' + member.avatar;
    }

    // Request ranking list within 7 days
    api.get('shouqianba/getSevenDaysRanking').done(function(err, result) {
        console.log(result);
        if (result) {
            me.sevenDaysLeaderBoard = result.seven_days_ranking;
        }
        var done = count();
        if (done) {
            me.render();
        }
    });

    // Request ranking list of all times
    api.get('shouqianba/getTotalRanking').done(function(err, result) {
        console.log(result);
        if (result) {
            me.totalLeaderBoard = result.total_ranking;
        }

        var done = count();
        if (done) {
            me.render();
        }
    });

    // Get personal ranking information
    api.get('shouqianba/getPersonalRanking', {
        id: member.weixinId // 'okSzXt81C0sUWm9BFPJ9xwpslHzo'
    }).done(function(err, result) {
        console.log(member.weixinId);
        if (!result) {
            result = {
                top: '%%100',
                points: '0.0'
            }
        }
        if (result.top.indexOf('%%') >= 0) {
            result.top = result.top.slice(2);
            result.bottom = true;
        } else {
            result.top = result.top.slice(1);
            result.bottom = false;
        }
        result.points = parseInt(result.points);
        if (result.points == 0) {
            result.noPoint = true;
        } else {
            result.noPoint = false;
        }
        me.personalRanking = result;

        console.log(result);
        var done = count();
        if (done) {
            me.render();
        }
    });

    $('.tab-item').on('click', function(){
        $('.tab-item').removeClass('active');
        $('.tab-content').removeClass('active');
        $(this).addClass('active');
        $('#'+ $(this).data('target')).addClass('active');
    });
}

shouqianbaTop.prototype = {
    defaults: {
        root: '#top'
    }
};

Module.extend(shouqianbaTop);
