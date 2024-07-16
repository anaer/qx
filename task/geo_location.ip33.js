var url = "http://api.ip33.com/ip/search"
var opts = {
    policy: $environment.params
};
var myRequest = {
    url: url,
    opts: opts,
    timeout: 4000
};

var message = ""
const paras = ["ip","area"]
const paran = ["IP","地区"]
$task.fetch(myRequest).then(response => {
  message = response? json2info(response.body,paras) : ""
    $done({"title": "    🔎 IP33 查询结果", "htmlMessage": message});
}, reason => {
  message = "</br></br>🛑 查询超时"
  message = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;">` + message + `</p>`
    $done({"title": "🔎 IP33 查询结果", "htmlMessage": message});
})


function json2info(cnt,paras) {
var res = "------------------------------"
cnt =JSON.parse(cnt)
for (i=0;i<paras.length;i++) {
  res = cnt[paras[i]]?   res +"</br><b>"+ "<font  color=>" +paran[i] + "</font> : " + "</b>"+ "<font  color=>"+cnt[paras[i]] +"</font></br>" : res
}
res =res+ "------------------------------"+"</br>"+"<font color=#6959CD>"+"<b>节点</b> ➟ " + $environment.params+ "</font>"
res =  `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + res + `</p>`
return res
}