var types = require('./types');

var mime = {
	types: {},
	extensions: {},
	defaultType: 'application/octet-stream',

	lookup: function(ext) {
		return mime.extensions[ext] || mime.defaultType;
	},

	extension: function(type) {
		var ext = mime.types[type];
		return ext ? ext[0] : null;
	},

	define: function(types) {
		for (var p in types) {
			var exts = [].concat(types[p]);
			mime.types[p] = exts;
			exts.forEach(function(ext) {
				mime.extensions[ext] = p;
			});
		}
	}
};

mime.define(types);
module.exports = mime;
