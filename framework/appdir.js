module.exports = function(path) {
	return BASE + path.replace(BASE, '').replace(/\\/g, '/').match(/\/[^\/]+\/[^\/]+/)[0];
};
