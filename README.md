# qx
自用qx规则

## 目录结构说明

1. 依据QuantumultX.conf的配置分类创建目录

## 规则配置说明

```conf
HOST,aaa.com,XXX                     # 域名匹配
HOST-KEYWORD,ccc,XXX                 # 域名关键字匹配
HOST-SUFFIX,bbb.com,XXX              # 域名后缀匹配
HOST-WILDCARD,onedrive.*,Microsoft
IP-ASN,211157,Telegram
IP-CIDR,109.239.140.0/24,Telegram    # IP匹配
IP6-CIDR,2001:67c:4e8::/48,Telegram  # IPV6匹配
USER-AGENT,Spotify*,Spotify          # 用户代理匹配
GEOIP,China,Telegram                 # IP数据库匹配
```

### 域名类型规则

HOST规则: 当请求的域名完全匹配时, 则执行该规则
HOST-SUFFIX规则: 当请求的域名的后缀匹配时, 则执行该规则
HOST-KEYWORD规则: 当请求的域名包含关键词时, 执行该规则
HOST-WILDCARD规则: 当请求的域名匹配通配符时, 执行该规则, 支持通配符`*`和`?`

### IP类型规则

IPv4规则
IPv6规则
GEOIP规则: 当IP归属地地区符合时, 执行该规则
IP-ASN规则: 当IP属于ASN号时, 执行该规则

### 其他类型规则

USER-AGENT规则: 当请求的User Agent匹配时, 执行该规则, 可使用通配符`*`与`?`
  在 iOS 15 系统后，系统出于隐私保护考虑，不再于 CONNECT 请求中提供 User-Agent，这意味着对于所有 HTTPS 请求，在未开启 MITM 时，User-Agent 均不可见且规则无法生效。
FINAL规则: 在规则的末尾始终有一个FINAL类型规则兜底


## 重写规则

request-header
request-body
response-header
response-body
echo-response
script-request-header
script-request-body
script-response-header
script-response-body
script-echo-response
script-analyze-echo-response

"reject"        策略返回 HTTP 状态码 404,不附带任何额外内容
"reject-200"    策略返回 HTTP 状态码 200,不附带任何额外内容
"reject-img"    策略返回 HTTP 状态码 200,同时附带 1px gif
"reject-dict"   策略返回 HTTP 状态码 200,同时附带一个空的 JSON 对象
"reject-array"  策略返回 HTTP 状态码 200,同时附带一个空的 JSON 数组

```sh
^http://example\.com/resource1/1/ url reject
^http://example\.com/resource1/2/ url reject-img
^http://example\.com/resource1/3/ url reject-200
^http://example\.com/resource1/4/ url reject-dict
^http://example\.com/resource1/5/ url reject-array
^http://example\.com/resource2/ url 302 http://example.com/new-resource2/
^http://example\.com/resource3/ url 307 http://example.com/new-resource3/
^http://example\.com/resource4/ url request-header ^GET /resource4/ HTTP/1\.1(\r\n) request-header GET /api/ HTTP/1.1$1
^http://example\.com/resource4/ url request-header (\r\n)User-Agent:.+(\r\n) request-header $1User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36$2
^http://example\.com/resource5/ url request-body "info":\[.+\],"others" request-body "info":[],"others"
^http://example\.com/resource5/ url response-body "info":\[.+\],"others" response-body "info":[],"others"

^http://example\.com/resource9/ url script-request-header request-header.js
^http://example\.com/resource10/ url script-request-body request-body.js

^http://example\.com/resource7/ url script-echo-response script-echo.js
^http://example\.com/resource8/ url script-response-header response-header.js
^http://example\.com/resource6/ url script-response-body response-body.js
```

## QX自带3种策略

PROXY 代理
DIRECT 直连
REJECT 拒绝

## 相关链接
https://github.com/crossutility/Quantumult-X

[非官方Quantumult X Wiki Book](https://qx.atlucky.me/)