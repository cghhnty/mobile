function ShouqianbaPointRule(opts) {
    var me = this;
    me.init(opts);

    document.title = '积分赚取';

    me.render();
}

ShouqianbaPointRule.prototype = {
    defaults: {
        root: '#obtainPointRule'
    }
};

Module.extend(ShouqianbaPointRule);
