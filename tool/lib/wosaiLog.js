/**
 * Created by Session on 15/11/2.
 */

var log4js = require('log4js');

function wosaiLog (space, logId){
    if (!logId){
        var dateObj = new Date();
        logId = dateObj.getTime() + Math.floor(Math.random()*10000);
    }

    this._logger = log4js.getLogger(space);
    this._logId = logId;
}

['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(function(level){
    wosaiLog.prototype[level] = function(){
        this._logger[level].apply(this._logger, [this._logId].concat(Array.prototype.slice.call(arguments)));
    }
});

module.exports = wosaiLog;

