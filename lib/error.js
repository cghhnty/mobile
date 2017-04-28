var yalt = require('yalt');
var __ = yalt.gettext;

function error() {
	var args = Array.prototype.slice.call(arguments, 0);

	var code = args[0];

	var errorLog = yalt.dict['error-log'];
	if (errorLog[code]) {
		var log = errorLog.apply(errorLog, args);
		error.log(log);
	}

	return {code: code, message: __.apply(__, args)};
}

error.log = function(log) {
	var date = new Date();
	console.error('[' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2) + '] ' + log);
};

module.exports = error;
