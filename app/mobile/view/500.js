var jade = require("jade");

module.exports = function(req, res, ctx, err) {
	if(!req.params)
		req.params = {contentType: 'html'};
	if (req.params.contentType == 'html') {
		jade.renderFile(JADEdir + '/error/err500.jade',err,function(err,html){
			if (err) {
				//log.log(err);
				return res.end("err对象传入有误");
			}
			res.statusCode = 500;
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.end(html);
			//res.end(err.message + ' (' + err.code + ')');
		});
	} else {
		//console.log(err);
		res.statusCode = 500;
		res.setHeader('Content-Type', 'text/plain');
		res.end(err.message);
	}
};
