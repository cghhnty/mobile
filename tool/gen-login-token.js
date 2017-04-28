/*
usage:
node gen-login-token -c fengming -i c81ffcb2-a90c-4ea9-bf79-a33e20ac37e8
node gen-login-token -c fengming -i oyBevt6_fxneWG5VcL0YJ0bcTteI
*/

require('./init')([
	['i', 'id=id', 'memberId or weixinId']
]);

var crypto = require('crypto');
var id = opt.options.id;
//var id ="oF5THwX5zSK00gY5Z62wPzpnzYgg";
var expire = Date.now() + conf.sessionExpire * 1000;
var token = crypto.createHmac('md5', conf.keys[0]).update(id + expire).digest('hex');
console.log('&loginExpire=' + expire + '&loginToken=' + token);
