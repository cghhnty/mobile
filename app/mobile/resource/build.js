/*
usage:
node build

arguments:
	-w: watching
	--dist: build distribution version
*/

var resbuild = require('resbuild');
var resdataConf = require('./resdata');
var watch = process.argv.indexOf('-w') != -1;
var target = process.argv.indexOf('--dist') == -1 ? 'dev' : 'dist';
var compress = target == 'dist';

process.chdir(__dirname);

resbuild('src', target, {
	compileOpts: {
		compress: compress
	},
	makeChecksumsConf: resdataConf,
	makeChecksumsOpts: {
		base: target,
		output: target + '/resdata.js',
		type: 'js',
		typeParam: 'resdata'
	},
	watch: watch
});
