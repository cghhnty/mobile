var Getopt = require('node-getopt');
var cluster = require('cluster');

// Connections closed by node stay permanently in FIN_WAIT2
// https://github.com/joyent/node/issues/3613
require('node-ka-patch');
BASE = __dirname;
JADEdir = __dirname+'/app/mobile/resource/dist/jade';

opt = new Getopt([
	['c', 'config=CONFIG', 'choose which config to use'],
	['h', 'help', 'display this help']
]).bindHelp().parseSystem();

execOpt = new Getopt([
	['', 'debug[=]'],
	['', 'debug-brk[=]']
]).parse(process.execArgv);

DEBUG = 'debug' in execOpt.options || 'debug-brk' in execOpt.options;

conf = require(BASE + '/conf');

if (cluster.isMaster) {
	require(BASE + '/master');
} else {
	require(BASE + '/worker');
}
