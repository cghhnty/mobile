module.exports = function(req, res, ctx) {
	res.statusCode = 404;
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.end('404 Not Found');
};
