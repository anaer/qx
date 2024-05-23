var url = $request.url;
var obj = JSON.parse($response.body);

if (url.indexOf("/api/caterham/v3/query/new_chat_group") != -1) {
  if (obj?.data) {
    obj.data.goods_list = [];
    obj.data.has_more = false;
  }
}

body = JSON.stringify(obj);
$done({ body });
