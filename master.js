var cluster = require('cluster');
var sleep = require('sleep');

console.log('==============================');
console.log(new Date());
console.log('server listening on port ' + conf.port);

sleep.sleep(5);
if (DEBUG) {
	// use one worker in debug mode
	var forknum = 1;

	// new debug port for child process (see issue #5138)
	// this issue has been fixed in commit @43ec1b1
	// keep it until v0.11 goes stable
	var execArgv = process.execArgv.filter(function(s) {
		return !/^--debug(-brk)?(=|$)/.test(s);
	});

	execArgv.push(('debug' in execOpt.options ? '--debug=' : '--debug-brk=') + (process.debugPort + 1));

	cluster.setupMaster({
		execArgv: execArgv
	});		
} else {
	var forknum = require('os').cpus().length;
}

for (var i = 0; i < forknum; i++)
	cluster.fork();

cluster.on('disconnect', function(worker) {
	cluster.fork();
});
