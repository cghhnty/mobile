function request(url, opts, cb) {
	if (opts && opts.constructor == Function) {
		cb = opts;
		opts = null;
	}

	if (!opts)
		opts = {};

	if (!opts.method)
		opts.method = opts.body ? 'POST' : 'GET';

	var deferred = $.Deferred();
	var req = new XMLHttpRequest();

	var query = '';
	if (opts.query) {
		for (var k in opts.query) {
			if (opts.query[k] != undefined) {
				query += '&' + encodeURIComponent(k) + (opts.query[k] == '' ? '' : '=' + encodeURIComponent(opts.query[k]));				
			}
		}
		query = query.slice(1);
	}

	req.open(opts.method, (request.base ? request.base + '/' : '') + url + (url.indexOf('?') == -1 ?  '?' + query : '&' + query));

	req.onreadystatechange = function() {
		if (this.readyState != 4)
			return;

		var res;
		if (this.status >= 200 && this.status < 300 || this.status == 304) {
			res = JSON.parse(this.responseText);
		} else {
			res = {
				error: {
					code: 'HTTP-' + this.status,
					message: this.statusText
				}
			};
		}

		deferred[res.error ? 'reject' : 'resolve'](res.error, res.result);
	};

	if (opts.body) {
		req.setRequestHeader('Content-Type', 'application/json');
		req.send(JSON.stringify(opts.body));
	} else {
		req.send();
	}

	if (cb)
		deferred.always(cb);

	return deferred.promise();
}

request.base = '';

request.get = function(url, query, cb) {
	if (query && query.constructor == Function) {
		cb = query;
		query = null;
	}

	return request(url, {method: 'GET', query: query}, cb);
};

request.delete = function(url, query, cb) {
	if (query && query.constructor == Function) {
		cb = query;
		query = null;
	}

	return request(url, {method: 'DELETE', query: query}, cb);
};

request.post = function(url, body, cb) {
	if (body && body.constructor == Function) {
		cb = body;
		body = null;
	}

	return request(url, {method: 'POST', body: body}, cb);
};

request.put = function(url, body, cb) {
	if (body && body.constructor == Function) {
		cb = body;
		body = null;
	}

	return request(url, {method: 'PUT', body: body}, cb);
};
