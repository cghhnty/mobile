function randchars(n, chartable) {
	if (!chartable)
		chartable = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

	var c = '';
	var l = chartable.length;

	for (var i = 0; i < n; i++) {
		c += chartable.charAt(Math.floor(l * Math.random()));
	}

	return c;
}

if (typeof module != 'undefined' && module.exports)
	module.exports = randchars;
