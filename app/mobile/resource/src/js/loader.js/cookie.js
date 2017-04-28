/*!
 * Javascript cookie utility
 * http://www.noindoin.com/
 *
 * Copyright 2010 Jiang Fengming
 * Released under the MIT license
 */

var cookie = {
	set: function(name, value, expires, path, domain, isSecure) {
		var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';
		if (expires)
			cookie += 'expires=' + expires + ';';
		if (path)
			cookie += 'path=' + path + ';';
		if (domain)
			cookie += 'domain=' + domain + ';';
		if (isSecure)
			cookie += 'secure;';
		document.cookie = cookie;
	},

	get: function(name) {
		var result = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name).replace(/[.*()]/g, '\\$&') + '=([^;]*)'));
		return result ? decodeURIComponent(result[1]) : null;
	},

	remove: function(name, path, domain, isSecure) {
		cookie.set(name, '', 'Thu, 01 Jan 1970 00:00:00 GMT', path, domain, isSecure);
	}
};
