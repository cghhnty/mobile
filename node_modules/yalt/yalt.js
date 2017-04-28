function yalt(code, dict) {
	if (!yalt.dict[code]) {
		yalt.dict[code] = function(msg) {
			if (d[msg] != null)
				return d[msg].constructor == String ? vsprintf(d[msg], Array.prototype.slice.call(arguments, 1)) : d[msg].apply(d, Array.prototype.slice.call(arguments, 1));
			else if (d != yalt.fallback)
				return yalt.fallback.apply(yalt.fallback, arguments);
			else
				return msg;
		};
		if (!yalt.fallback)
			yalt.fallback = yalt.dict[code];
	}
	var d = yalt.current = yalt.dict[code];
	if (dict) {
		for (i in dict)
			d[i] = dict[i];
		dict = null;
	}
	return yalt.dict[code];
}

yalt.dict = {};

yalt.gettext = function() {
	return yalt.current.apply(yalt.current, arguments);
}

if (typeof window != 'undefined') {
	window.__ = yalt.gettext;
} else if (typeof module != 'undefined' && module.exports) { // node
	var vsprintf = require('sprintf-js').vsprintf;
	module.exports = yalt;
}
