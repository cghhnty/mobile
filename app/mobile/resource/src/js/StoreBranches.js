function StoreBranches(opts) {
	var me = this;
	me.init(opts);

	document.title = '商户门店';

	api.get('store/getBranchStores').done(function(err, branchStores) {
		me.branchStores = branchStores;
		me.render();
	});
}

StoreBranches.prototype ={
	defaults: {
		root: '.store-branches'
	}
};

Module.extend(StoreBranches);
