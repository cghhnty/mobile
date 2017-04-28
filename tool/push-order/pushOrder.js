var domain = require('domain');
var log4js = require('log4js');
var dm = domain.create();
commonLogger = log4js.getLogger('common');

if (process.env.LOG_LEVEL) {
    commonLogger.setLevel(process.env.LOG_LEVEL);
} else {
    commonLogger.setLevel(log4js.levels.INFO);
}
require('../init')();

var redis = require('redis');
red = redis.createClient(conf.redis.port, conf.redis.host, conf.redis.options);
if (typeof conf.redis.dbIndex != 'undefined') {
    red.select(conf.redis.dbIndex);
}

dm.run(main);

dm.on('error', function(e){
    commonLogger.fatal(e.stack);
    commonLogger.fatal(e.message);

    commonLogger.info('restart script');
    dm.run(main);
});


function main(){
    commonLogger.info('process memory usage: ', process.memoryUsage());
    var amqp = require('amqplib/callback_api');
    var wosaiLog = require('../lib/wosaiLog');
    commonLogger.info('script start');
    amqp.connect(conf.queue.address, function(err, conn){
        if (err){
            commonLogger.fatal(err);
            return;
        }
        commonLogger.info('connect to queue');

        conn.createChannel(function(err, ch){
            if (err){
                commonLogger.fatal(err);
                return;
            }
            commonLogger.info('create channel');
            ch.assertQueue(conf.queue.queue, {}, function(err, q){
                ch.consume(q.queue, function(msg){
                    var ctx = {};
                    var logger = new wosaiLog('push-order');
                    // set logger level
                    if (process.env.LOG_LEVEL) {
                        logger._logger.setLevel(process.env.LOG_LEVEL);
                    } else {
                        logger._logger.setLevel(log4js.levels.INFO);
                    }
                    ctx.logger = logger;


                    commonLogger.trace('received message from queue');

                    if (!msg.content) return;
                    commonLogger.info('message data: ', msg.content.toString());
                    var data = JSON.parse(msg.content.toString());
                    commonLogger.info('message data after parse: ', data);

                    if (!(data.event in {'order':1, 'voucherCard':1,'memberGradeUpdate':1, 'usageRecord':1,'memberGradeChange':1}))
                        return;

                    var handle = require('./handles/'+data.event);
                    handle(ctx, data);

                    commonLogger.info('process memory usage: ', process.memoryUsage());
                }, {noAck: true});
            });
        });
    });

}