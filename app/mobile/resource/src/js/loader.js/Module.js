function Module(opts) {}

Module.extend = function(SubClass) {
	extendClass(SubClass, Module);
};

Module.prototype = {
	defaults: {
		root: 'html'
	},

	init: function(opts) {
		$.extend(true, this, this.defaults, opts);
		this.$root = $(this.root);
	},

	find: function(selector, context) {
		if(!context)
			context = this.$root;
		return $(selector, context);
	},

	render: function() {
		this.$root.render(this);
		$('.common-preloader').hide();
	}
};
