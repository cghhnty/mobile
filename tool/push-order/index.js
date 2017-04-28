/*
usage:
node index -c fengming
*/

require('../init')();
var push = require(BASE + '/tool/push-order/push');

var lastTime = Date.now();

var redis = require('redis');
red = redis.createClient(conf.redis.port, conf.redis.host, conf.redis.options);

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(conf.mongodb.url, conf.mongodb.options, function(err, db) {
	if (err)
		return console.error(err);
	mongo = db;
	main();
});

function main() {
	setInterval(function() {
        mongo.collection('order').find({'statusChangeDate.FINISHED': {$gt: lastTime}, status: 'FINISHED'}).toArray(function(err, orders) {
		//mongo.collection('order').find({lastModified: {$gt: lastTime}, status: 'FINISHED'}).toArray(function(err, orders) {
			if (err)
				return console.error(err);

            console.log('before forEash:' + (new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()) + ', lastTime:' + lastTime + ', orders number:' + orders.length);
            orders.forEach(function(order){
                if(lastTime < order.statusChangeDate.FINISHED){
                    lastTime = order.statusChangeDate.FINISHED;
                }
            });
			orders.forEach(push);
            console.log('after forEash:' + (new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()) + ', lastTime:' + lastTime);
		});

		//lastTime = Date.now();
	}, 5000);
}
