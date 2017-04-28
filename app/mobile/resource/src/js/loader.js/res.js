function res(path) {
	if (/^(https?:|\/\/)/.test(path))
		return path;

	var base = res.base ? res.base + '/' : '';

	if (res.data.hash[path])
		return base + path + '?' + res.data.hash[path];

	for (var dir in res.data.version) {
		if (path.indexOf(dir + '/') == 0) {
			return path.replace(new RegExp(dir + '/' + '([^\/]+)(.+)'), function($0, $1, $2) {
				return base + dir + '/' + $1 + '-' + res.data.version[dir][$1] + $2;
			});
		}
	}

	return base + path;
}

res.base = '';
res.data = {hash: {}, version: {}};
