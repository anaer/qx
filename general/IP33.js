if ($response.statusCode != 200) {
  $done(null);
}

var body = $response.body;
var obj = JSON.parse(body);
var title = obj["area"];
var subtitle = "";
var ip = obj["ip"];
var description =
  "IP:" +
  obj["ip"] +
  "\n" +
  "地区:" +
  obj["area"];
$done({ title, subtitle, ip, description });