/*!
 * inc.js: Load JS async but execute in order, also can load CSS, HTML, and text.
 * http://noindoin.com/
 *
 * Copyright 2014 Jiang Fengming <jfm@noindoin.com>
 * Released under the MIT license
 */

inc.queue = [];
inc.items = {};
inc.base = '';

function inc() {
	for (var i = 0; i < arguments.length; i++) {
		var item = arguments[i];

		var obj = {};
		obj.status = 0;
		if (item.constructor == Function) {
			obj.type = 'fn';
			obj.fn = item;
			inc.queue.push(obj);
			inc.resolve();
		} else {
			var urlinfo = inc._resolveUrl(item);
			var extname = urlinfo.pathname.match(/\.\w+$/)[0];
			var href = urlinfo.href;
			if (inc.items[href])
				continue;

			inc.queue.push(obj);
			inc.items[href] = obj;

			if (extname == '.js') {
				obj.type = 'js';
				var script = document.createElement('script');
				script.async = false;
				script.src = href;
				script.onload = (function(obj) {
					return function() {
						obj.status = 1;
						inc.resolve();
					};
				})(obj);
				document.head.appendChild(script);
			} else if (extname == '.css') {
				obj.type = 'css';
				var link = document.createElement('link');
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = href;
				document.head.appendChild(link);
				obj.status = 1;
				inc.resolve();
			} else {
				obj.type = 'text';
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = (function(obj) {
					return function() {
						if (this.readyState == 4) {
							obj.content = this.responseText;
							obj.status = 1;
							inc.resolve();
						}
					};
				})(obj);
				xhr.open('GET', href);
				xhr.send();
			}
		}
	}
}

inc.current = 0;
inc.resolve = function() {
	for (var i = inc.current; i < inc.queue.length; i++) {
		var obj = inc.queue[i];
		if (obj.status == 1) {
			continue;
		} else {
			if (obj.type == 'fn') {
				obj.status = 1;
				obj.fn();
			} else {
				inc.current = i;
				break;
			}
		}
	}
};

inc.get = function(url) {
	url = inc._resolveUrl(url).href;
	var obj = inc.items[url];
	if (obj && obj.type == 'text')
		return obj.content;
	else
		return null;
};

inc._resolveUrl = function(url) {
	if (!/^(https?:|\/\/)/.test(url)) {
		if (inc.base) {
			if (url.charAt(0) != '/')
				url = inc.base + '/' + url; // relative path is relative to inc.base
		} else if (inc.resolveUrl) {
			url = inc.resolveUrl(url);
		}
	}

	var a = document.createElement('a');
	a.href = url;
	return a;
};
