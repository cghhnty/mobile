var path = require('path');
var Getopt = require('node-getopt');

BASE = path.resolve(__dirname, '..');

execOpt = new Getopt([
	['', 'debug[='],
	['', 'debug-brk[=']
]).parse(process.execArgv);

DEBUG = 'debug' in execOpt.options || 'debug-brk' in execOpt.options;

module.exports = function(opts) {
	if (!opts)
		opts = [];

	opts = opts.concat([
		['c', 'config=CONFIG', 'choose which config to use'],
		['h', 'help', 'display this help']
	]);

	global.opt = new Getopt(opts).bindHelp().parseSystem();
	global.conf = require(BASE + '/conf');
	global.error = require(BASE + '/lib/error');
};
