# qx
自用qx规则

## 目录结构说明

1. 依据QuantumultX.conf的配置分类创建目录

## 图标仓库
https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Semporia.json

## 规则配置说明

```
HOST,aaa.com,XXX
HOST-KEYWORD,ccc,XXX
HOST-SUFFIX,bbb.com,XXX
HOST-WILDCARD,onedrive.*,Microsoft
IP-ASN,211157,Telegram
IP-CIDR,109.239.140.0/24,Telegram
IP6-CIDR,2001:67c:4e8::/48,Telegram
USER-AGENT,Spotify*,Spotify
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