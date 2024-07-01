/*
彩云天气@wf021325[灰灰佬]
真实VIP客户提取Token，仅用作备份，请引用原作者重写，如下链接
https://raw.githubusercontent.com/wf021325/qx/master/js/caiyun.js
*/
var res   = {};
var url   = $request.url;
var obj   = JSON.parse(typeof $response != "undefined" && $response.body || null);
let Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiNjYyNzQxMzVkYWM3MGMwMDE4YzFlNDBmIiwidXNlcl9pZCI6IjVmNWJmYzU3ZDJjNjg5MDAxNGUyNmJiOCIsInZlcnNpb24iOjIsImV4cCI6MTcyMTYyNDYyOSwidmlwX2V4cGlyZWRfYXQiOjAsImlzcyI6IndlYXRoZXIiLCJpYXQiOjE3MTM4NDg2MjksInN2aXBfZXhwaXJlZF9hdCI6MTg1NjY4NTAzMSwicHJpbWFyeSI6dHJ1ZX0.bBT3vbfATa-LF1G34j4VjPTYtwcKHfG3oHIkFlmg1dY";
let userId = "5f5bfc57d2c6890014e26bb8";

if (url.indexOf('/user') != -1) {
	obj.result.token = Token;
	obj.result.is_vip = true;
	obj.result.is_xy_vip = true;
	obj.result.svip_expired_at = 3742732800;
	obj.result.vip_type = "s";
	body = JSON.stringify(obj);
	res.body = body
}

if (url.indexOf('/vip_info') != -1) {
	obj.vip.expires_time = "3742732800";
	obj.vip.is_auto_renewal = false;

	obj.trial_svip.received_time = "1719716064";
	obj.trial_svip.expires_time = "3742732800";
	obj.trial_svip.trial_card_code = "trial_svip_1d";
	obj.trial_svip.is_recharge_vip = false;

	obj.svip.expires_time = "3742732800";
	obj.svip.is_auto_renewal = false;

	body = JSON.stringify(obj);
	res.body = body
}

if (url.indexOf('/visitors') != -1) {
	obj.result.token = Token;
	body = JSON.stringify(obj);
	res.body = body
}

if (/v1\/(satellite|nafp\/origin_images|radar)/g.test(url)) {
    res.headers = $request.headers;
    res.headers['device-token'] = Token;
    res.headers['user-id'] = userId;
}

if (/\/subseasonal/g.test(url)) {
    res.headers = $request.headers;
    res.headers['Authorization'] = "Bearer " + Token;
    res.headers['user-id'] = userId;
}

if (url.indexOf('/login_by_code') != -1) {
	let obj = {"status":"ok","result":{"is_phone_verified":true,"token":Token},"rc":0}
	body = JSON.stringify(obj);
	res.body = body;
}

if(url.includes('v1/activity')){
	let body = $response.body
	body = '{"status":"ok","activities":[{"items":[{}]}]}';
	res.body = body;
}
$done(res);
