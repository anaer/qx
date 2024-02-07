var url   = $request.url;
var obj   = JSON.parse($response.body);

if (url.indexOf('/reader-copy-paragraph-all.json') != -1) {
	let obj = {"data":{"vip_list":["测试2"], "list":["测试2"]}}
	body = JSON.stringify(obj);
}
$done({body});
