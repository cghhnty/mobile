var jade = require("jade");

module.exports = function(req, res, ctx, msg) {
	if(!req.params)
		req.params = {contentType: 'html'};
	var obj = {};
	if(msg){
		obj.message = msg+' Not Found';
	}else{
		obj.message = '404 Not Found';
	}
	if (req.params.contentType == 'html') {
		jade.renderFile(JADEdir + '/error/err404.jade',obj,function(err,html){
			if (err) {
				//log.log(err);
				return res.end("obj对象传入有误");
			}
			res.statusCode = 404;
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			res.end(html);
			//res.end(err.message + ' (' + err.code + ')');
		});
	} else {
		//console.log(err);
		res.statusCode = 404;
		res.setHeader('Content-Type', 'text/plain');
		res.end(obj.message);
	}
};



/*
 module.exports = function(req, res, ctx,msg) {
 res.statusCode = 404;
 res.setHeader('Content-Type', 'text/html; charset=utf-8');
 if(msg){
 res.end(msg+' Not Found');
 }else{
 res.end('404 Not Found');
 }
 }*/
