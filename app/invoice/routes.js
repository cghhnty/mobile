/*
params defaults:
{
	contentType: 'json',
	requireLogin: 1, // 0: 不用登录; 1: 必须登录; 2: 尝试微信oAuth登录
	noSession: undefined
}
*/

module.exports = [
	['*.do', 'controller', {contentType: 'json'}],
	['*', 'view', {contentType: 'html'}]
];
