var fs = require('fs');
var path = require('path');
var mime = require(BASE + '/lib/mime');

module.exports = function (req, res, ctx) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 用于微信配置js域名验证
    if (req.url == '/'+conf.weixin.mp_verify) {
        ctx.pathInfo ='mobile/dist/assets/' + conf.weixin.mp_verify;
    }
    //   mobile/dist/resdata.js
    var parts = ctx.pathInfo.match(/^([^\/]+)\/([^\/]+)\/(.+)$/);
    /*console.log(parts);
     [ 'mobile/dist/resdata.js',
     'mobile',
     'dist',
     'resdata.js',
     index: 0,
     input: 'mobile/dist/resdata.js' ]*/
    if (!parts) {
        res.statusCode = 404;
        res.end();
        return;
    }

    var appname = parts[1];
    var dir = parts[2];
    var relativePath = parts[3];
    var filename = path.join(BASE, 'app', appname, 'resource', dir, relativePath);
    var extname = path.extname(filename).slice(1);

    // console.log(filename);
    res.setHeader('Content-Type', mime.lookup(extname));
    res.setHeader('Cache-Control', 'max-age=2592000'); // 30 days

    var stream = fs.createReadStream(filename + '.gz');
    stream.on('open', function () {
        res.setHeader('Content-Encoding', 'gzip');
        stream.pipe(res);
    });

    stream.on('error', function (err) {
        stream = fs.createReadStream(filename);

        stream.on('open', function () {
            stream.pipe(res);
        });

        stream.on('error', function () {
            res.statusCode = 404;
            res.end();
        });
    });
};
