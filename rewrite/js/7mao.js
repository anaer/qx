var url   = $request.url;
var obj   = JSON.parse($response.body);

if (url.indexOf('/reader-copy-paragraph-all.json') != -1) {
	obj = {"data":{"vip_list":["测试2"], "list":["测试2"]}}
} else if(url.indexOf('/api/v1/extra/init') != -1) {
	if (obj?.data?.reader_floats?.length > 0) {
		obj.data.reader_floats = [];
		console.log('设置reader_floats为空');
	}

	if (obj?.data?.reader_top_banner?.length > 0) {
		obj.data.reader_top_banner = [];
		console.log('设置reader_top_banner为空');
	}
} else if (url.indexOf('/v1/splash/index') != -1) {
	if (obj?.init?.is_show_ad) {
		obj.init.is_show_ad = "0";
	}
}
body = JSON.stringify(obj);
$done({body});
