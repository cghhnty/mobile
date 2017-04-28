/*
params defaults:
{
	contentType: 'json',
	requireLogin: 1, // 0: 不用登录; 1: 必须登录; 2: 尝试微信oAuth登录
	noSession: undefined
}
*/

module.exports = [
	['api/qrcode', '$&', {contentType: 'png', requireLogin: 0, noSession: true}],
	['article/*', 'view', {contentType: 'html', requireLogin: 0}],
	['api/article/:method', 'api/article', {requireLogin: 0}],
	['timeline/*', 'view', {contentType: 'html', requireLogin: 0}],
	['shouqianba/query-order', 'view', {contentType: 'html', requireLogin: 0}],
	['shouqianba/order-detail', 'view', {contentType: 'html', requireLogin: 0}],
	['api/shouqianba/getPosOrder', 'api/shouqianba', {method: 'getPosOrder', requireLogin: 0}],
	['api/weixin/jsApiSign', 'api/weixin', {method: 'jsApiSign', requireLogin: 0}],
	['api/timeline/:method', 'api/timeline', {requireLogin: 0}],
	['api/weixin/:method', 'api/weixin', {requireLogin: 0, noSession: false}],
	['api/member/getMember', 'api/member', {method: 'getMember', requireLogin: 0}],
	['marketing-template/*', 'view', {contentType: 'html', requireLogin: 0, standalone: true}],
	['api/marketingTemplate/:method', 'api/marketingTemplate', {requireLogin: 0}],
    ['duiba/:method', 'api/duiba', {requireLogin: 0, noSession: true}],
	['api/:controller', '$&'],
	['api/:controller/:method', 'api/$1'],
    ['creditShop', 'view/creditShop', {contentType: 'html'}],
    ['activities/oneYuanDuobao', 'view/oneYuanDuobao', {contentType: 'html'}],
	['*.do', 'controller', {contentType: 'json'}],
	['*', 'view', {contentType: 'html'}]
];
