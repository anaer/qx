var url = $request.url;
var obj = JSON.parse($response.body);

if (url.indexOf("/app/ical/honored") != -1) {
  obj = { apps: [], grids: [], badge: {num: 1, timestamp: 1703907000} };
}

body = JSON.stringify(obj);
$done({ body });
