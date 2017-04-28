/**
 * Created by Session on 15/11/2.
 */

module.exports = {
    /**
     * @param timestamp
     * @returns {string}
     */
    date: function(timestamp){
        var timeObj = new Date(timestamp);
        var dateArr = [timeObj.getFullYear(), timeObj.getMonth()+1, this.formatToSpecialLength(timeObj.getDate(), 2, '0')];

        return dateArr.join('-');
    },
    /**
    * @param timestamp
    * @returns {string}
    */
    dateFormat: function(timestamp){
        var timeObj = new Date(timestamp);
        var dateArr = [timeObj.getFullYear(), timeObj.getMonth()+1, this.formatToSpecialLength(timeObj.getDate(), 2, '0')];
        return dateArr[0] + "年" + dateArr[1] +"月" + dateArr[2] +"日";
    },
    /**
     * @param timestamp
     * @returns {string}
     */
    time: function(timestamp){
        var timeObj = new Date(timestamp);
        var timeArr = [this.formatToSpecialLength(timeObj.getHours(), 2, '0'), this.formatToSpecialLength(timeObj.getMinutes(), 2, '0'), this.formatToSpecialLength(timeObj.getSeconds(), 2, '0')];

        return timeArr.join(':');
    },
    /**
     * @param timestamp
     * @returns {string}
     * @constructor
     */
    dateTime: function (timestamp){
        return this.date(timestamp) + ' ' + this.time(timestamp);
    },
    /**
     * @param str
     * @param length
     * @param specialStr
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


