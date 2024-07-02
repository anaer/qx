/*
彩云天气@wf021325[灰灰佬]
真实VIP客户提取Token，仅用作备份，请引用原作者重写，如下链接
https://raw.githubusercontent.com/wf021325/qx/master/js/caiyun.js
*/
var url   = $request.url;
var obj   = JSON.parse(typeof $response != "undefined" && $response.body || null);

if (url.indexOf('/user') != -1) {
	obj.result.is_vip = true;
	obj.result.vip_type = "s";
	body = JSON.stringify(obj);
}

if (url.indexOf('/vip_info') != -1) {
	body = JSON.stringify(obj);
}

if(url.includes('v1/activity') != -1) {
	body = '{"status":"ok","activities":[{"items":[{}]}]}';
}

$done({body});
