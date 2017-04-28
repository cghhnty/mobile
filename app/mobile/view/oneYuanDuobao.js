/**
 * Created by Session on 15/11/16.
 */

var APP = appdir(__dirname);
var jate = require('jate');
var duobaoUrl = 'http://1.87.cn/mobile/union/index/?aid=8002';

module.exports = function(req, res, ctx){
    var html = jate.file(APP + '/view/oneYuanDuobao.jate')({
        url: duobaoUrl + '&caseid=' + ctx.member.weixinId
    });
    return res.end(html);
};
