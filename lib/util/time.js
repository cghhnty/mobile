module.exports = {
    /**
     * @param timestamp
     * @returns { yyyy-mm-dd}
     */
    date: function(timestamp){
        var timeObj = new Date(timestamp);
        var dateArr = [timeObj.getFullYear(), this.formatToSpecialLength(timeObj.getMonth()+1,2,'0'), this.formatToSpecialLength(timeObj.getDate(), 2, '0')];
        return dateArr.join('-');
    },
    /**
     * @param timestamp
     * @returns {hh:mi:ss}
     */
    time: function(timestamp){
        var timeObj = new Date(timestamp);
        var timeArr = [this.formatToSpecialLength(timeObj.getHours(), 2, '0'), this.formatToSpecialLength(timeObj.getMinutes(), 2, '0'), this.formatToSpecialLength(timeObj.getSeconds(), 2, '0')];
        return timeArr.join(':');
    },
    /**
     * @param timestamp
     * @returns {hh:mi}
     */
    time2: function(timestamp){
        var timeObj = new Date(timestamp);
        var timeArr = [this.formatToSpecialLength(timeObj.getHours(), 2, '0'), this.formatToSpecialLength(timeObj.getMinutes(), 2, '0')];
        return timeArr.join(':');
    },
    /**
     * @param timestamp
     * @returns {yyyy-mm-dd hh:mi:ss}
     * @constructor
     */
    dateTime: function (timestamp){
        return this.date(timestamp) + ' ' + this.time(timestamp);
    },
    /**
     * @param str
     * @param length
     * @param specialStr 补位字符如 '0'
     * @returns {string}
     */
    formatToSpecialLength: function (str, length, specialStr) {
        str += '';
        if (str.length >= length) return str;

        var originLength = str.length;
        for (var i = 0; i < length - originLength; i++) {
            str = specialStr + str;
        }
        return str;
    }
};


