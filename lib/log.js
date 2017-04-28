/**
 * 记录 log 到输出日志
 * Created by Session on 15/10/10.
 */

function log(){
    var now = new Date();
    this.logId = now.getFullYear()+'-'+('0'+(now.getMonth()+1)).slice(-2)+'-'+('0'+ now.getDate()).slice(-2)+' '+('0'+ now.getHours()).slice(-2)+':'+('0'+ now.getMinutes()).slice(-2)+':'+('0'+now.getSeconds()).slice(-2)+' '+('00'+now.getMilliseconds()).slice(-3);
    return this.logId;
}

log.prototype.log = function(){
    var logContent = Array.prototype.slice.call(arguments);
    logContent = logContent.map(function(content){
        if(content.constructor==String)
            return content;
        return JSON.stringify(content);
    });
    this.logId = log();
    logContent.unshift(this.logId);
    console.log.apply(null, logContent);
};

module.exports = function(){
    return new log();
};

