function ShouqianbaConsumeRecode(opts) {
    var me = this;
    me.init(opts);
    me.orderParse.parent = me;

    document.title = '消费记录';

    me.records = [];
    var page = 0;

    var eventMap = {
        checkout: {
            isIncreaseAction: true,
            template: '<span class="location">{{order.store_name}}</span><span class="pay-number checkout">消费</span>',
            orderType: 'sqb'
        },
        revoke: {
            isIncreaseAction: false,
            template: '<span class="location">{{order.store_name}}</span><span class="pay-number revoke">退款</span>',
            orderType: 'sqb'
        },
        'duiba-convert': {
            isIncreaseAction: false,
            template: '消费积分',
            orderType: 'db'
        }
    };
    var orderApiMapping = {
        sqb: 'shouqianba/getOrderBatch',
        db: 'shouqianba/getDuibaOrderBatch'
    };

    var stop = false;
    requestHistory();

    $(window).scroll(function () {
        var totalHeight = parseInt($(window).height()) + parseInt($(window).scrollTop());

        if ($(document).height() - totalHeight < 50 && stop) {
            stop = false;
            page++;
            $('#loading').show();
            requestHistory();
        }
    });

    function requestHistory() {
        api.get('shouqianba/recodeHistory', {
            id: member.weixinId,
            page: page
        }).done(function (err, result) {
            if (err) {
                me.render();
                return;
            }

            var pointHistories = [];
            var orderCodes = {};
            result.Detail.forEach(function (item) {
                if (!(item.event in eventMap)) return;
                if (item.amount != 0) {
                    pointHistories.push(item);
                    if (item.remark) {
                        var orderType = eventMap[item.event]['orderType'];
                        if (!orderCodes[orderType]) orderCodes[orderType] = [];
                        orderCodes[orderType].push(item.remark);
                    }
                }
            });

            var deferreds = [];
            var keys = [];
            $.each(orderCodes, function (key, value) {
                keys.push(key);
                var deferred = $.Deferred();
                deferreds.push(deferred);
                api.post(orderApiMapping[key], {TxSns: value}).done(function (err, orders) {
                    if (err) {
                        return deferred.reject(err);
                    }

                    deferred.resolve(me.orderParse[key](orders));
                });
            });

            $.when.apply($, deferreds).done(function () {
                var orders = {};
                var args = Array.prototype.slice.call(arguments);
                keys.forEach(function (key, i) {
                    orders[key] = args[i];
                });
                pointHistories.forEach(function (pointHistory, i) {
                    var event = eventMap[pointHistory.event];
                    var order = orders[event.orderType][pointHistory.remark];
                    if (!event) {
                        console.error(i, 'unKnow Event: ', pointHistory);
                        return;
                    }

                    if (pointHistory.remark && !order) {
                        console.error(i, 'unKnow order, order code: ', orderCodes[i]);
                        return;
                    }

                    if (!order) order = {};

                    if (event.isIncreaseAction && pointHistory.amount < 0)
                        console.warn(i, 'Exception amount. the event is increase action, but amount less than 0');

                    var data = {
                        expiration: pointHistory.expiration && pointHistory.expiration.split(' ')[0] || '',
                        amount: pointHistory.amount < 0 ? pointHistory.amount * -1 : pointHistory.amount,
                        isIncrease: event.isIncreaseAction,
                        ctime: order.ctime
                    };

                    var vars = {
                        order: order,
                        pointHistory: pointHistory
                    };
                    var template = event.template;
                    if (template) {
                        var eventStr = template.replace(/{{[\w.]+}}/g, function (replacement) {
                            var value = $.extend({}, vars);
                            var replacements = replacement.slice(2, replacement.length - 2).split('.');
                            replacements.forEach(function (segment, index) {
                                if (typeof value[segment] === 'undefined') {
                                    value = '';
                                    return false;
                                }

                                if (index == replacements.length - 1) {
                                    switch (typeof value[segment]) {
                                        case 'string':
                                        case 'number':
                                        case 'boolean':
                                            value = value[segment] + '';
                                            break;
                                        default :
                                            value = '';
                                            break;
                                    }
                                } else {
                                    value = value[segment];
                                }
                            });
                            return value;
                        });
                        data.eventStr = eventStr || template;
                    } else {
                        data.eventStr = '';
                    }
                    me.records.push(data);
                });
                me.render();
                $('#loading').hide();
                stop = true;
            }).fail(function (errs) {
                console.log(errs);
                me.render();
            });
        });
    }

}

ShouqianbaConsumeRecode.prototype = {
    defaults: {
        root: '#recordHistory'
    },
    orderParse: {
        sqb: function (orders) {
            for (var orderCode in orders) {
                var order = orders[orderCode];
                if (!order) continue;

                if (order.order_pay_time || order.ctime) {
                    order.ctime = this.parent.formatTimeToDateTime(order.order_pay_time || order.ctime);
                } else {
                    order.ctime = null;
                }
            }

            return orders;
        },
        db: function (orders) {
            return orders;
        }
    },
    formatTimeToDateTime: function (time) {
        var timeObj = new Date(time);
        var dateArr = [timeObj.getFullYear(), timeObj.getMonth() + 1, this.formatToSpecialLength(timeObj.getDate(), 2, '0')];
        var timeArr = [this.formatToSpecialLength(timeObj.getHours(), 2, '0'), this.formatToSpecialLength(timeObj.getMinutes(), 2, '0'), this.formatToSpecialLength(timeObj.getSeconds(), 2, '0')];

        return dateArr.join('-') + ' ' + timeArr.join(':');
    },
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

Module.extend(ShouqianbaConsumeRecode);

