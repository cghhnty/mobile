/**
 * Created by Session on 15/10/9.
 */

var duiba = require(BASE + '/module/duiba')('MSG7hbkGqTpjndhxJgh84QDpY3B', 'LtSmZA9kH3bM1UT8H3ng17JDYBt');
var sqbApiCaller = require(BASE + '/module/sqb');

module.exports = function(req, res, ctx){
    sqbApiCaller.http.get('query/' + ctx.member.weixinId, null, function(err, result){
        if (err || result.status != 'ok') {
            res.statusCode = 500;
            res.end()
        }

        var url = duiba.generateAutoLoginUrl(ctx.member.id, result.data.total, req.query.redirect);

        res.statusCode = 302;
        res.setHeader('Location', url);
        res.end()
    });
};
