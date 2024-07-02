/*
彩云天气@wf021325[灰灰佬]
真实VIP客户提取Token，仅用作备份，请引用原作者重写，如下链接
https://raw.githubusercontent.com/wf021325/qx/master/js/caiyun.js
*/
var url   = $request.url;
var obj   = JSON.parse(typeof $response != "undefined" && $response.body || null);
let Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiNjYyNzQxMzVkYWM3MGMwMDE4YzFlNDBmIiwidXNlcl9pZCI6IjVmNWJmYzU3ZDJjNjg5MDAxNGUyNmJiOCIsInZlcnNpb24iOjIsImV4cCI6MTcyMTYyNDYyOSwidmlwX2V4cGlyZWRfYXQiOjAsImlzcyI6IndlYXRoZXIiLCJpYXQiOjE3MTM4NDg2MjksInN2aXBfZXhwaXJlZF9hdCI6MTg1NjY4NTAzMSwicHJpbWFyeSI6dHJ1ZX0.bBT3vbfATa-LF1G34j4VjPTYtwcKHfG3oHIkFlmg1dY";

if (url.indexOf('/user') != -1 || url.indexOf('/login_by_code') != -1) {
	obj.result.token = Token;
	obj.result.is_vip = true;
	obj.result.vip_expired_at = 3742732800;
	obj.result.vip_type = "s";
	obj.result.svip_expired_at = 3742732800;
	body = JSON.stringify(obj);
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
}

if (url.indexOf('/visitors') != -1) {
	obj.result.token = Token;
	body = JSON.stringify(obj);
}


if(url.includes('v1/activity') != -1) {
	body = '{"status":"ok","activities":[{"items":[{}]}]}';
}

$done({body});
