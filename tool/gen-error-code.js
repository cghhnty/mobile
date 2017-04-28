/*
usage:
node gen-error-code
*/

var randchars = require('./lib/randchars');
console.log(randchars(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
