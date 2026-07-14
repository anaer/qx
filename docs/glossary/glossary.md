# Glossary

| Term | Definition |
|------|-----------|
| **策略组 (Policy Group)** | Quantumult X 中控制流量路由的规则容器，支持 static（手动）、url-latency-benchmark（自动测速）等类型 |
| **分流规则 (Filter Rule)** | 匹配网络请求的规则（HOST、HOST-SUFFIX、IP-CIDR 等），决定请求走哪个策略组 |
| **重写 (Rewrite)** | 修改请求或响应的 URL、请求头、请求体、响应体，用于去广告、修改 API 返回值、解锁功能等 |
| **resource-parser.js** | 资源解析器脚本，用于预处理远程订阅的服务器节点和规则集 |
| **url-latency-benchmark** | 自动测速策略组类型，定时测试所有节点延迟，自动选择延迟最低的可用节点 |
| **漏网之鱼** | 未匹配任何分流规则的流量的兜底策略组，默认 DIRECT（直连） |
| **策略选择** | 顶层 static 策略组，用于手动切换全局代理模式 |
| **Blackmatrix7 规则集** | 社区维护的全面开源分流规则集，覆盖大量服务的域名和 IP 段 |
| **DoH3 (DNS-over-HTTP/3)** | 使用 HTTP/3 协议传输 DNS 查询，兼具加密传输和 QUIC 的低延迟优势 |
| **Fake-IP** | Quantumult X 的 DNS 模式，对请求域名返回虚拟 IP，由 QX 代为发起真实连接，减少 DNS 泄露 |
| **Event-Interaction** | QX 的交互式任务类型，可在 APP 内触发脚本并显示结果 |
| **GEOIP** | 基于 IP 归属地数据库的地理位置匹配规则 |
| **Shawn 资源解析器** | 社区维护的通用资源解析脚本，支持十多种代理格式与 Quantumult X 格式互转，含节点筛选/重命名/增强功能 |
| **opt-parser** | QX 远程引用参数，开启后使用 resource_parser_url 指定的解析器处理该订阅 |
| **inserted-resource** | QX 远程引用参数，将解析后的资源插入列表末尾，而非替换 |
| **geo_location_checker** | QX 配置项，通过 HTTP API + 响应脚本来检测节点所属地理位置 |
| **server-tag-regex** | url-latency-benchmark 策略组的节点筛选参数，用正则匹配节点名称来确定归属 |
| **server_check_url** | 代理延迟测试的目标 URL，用于判断节点可用性和延迟 |
