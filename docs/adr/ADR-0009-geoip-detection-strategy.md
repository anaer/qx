# ADR-0009: GeoIP 地理位置检测方案

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

节点地理位置的准确展示对策略组分流（美/港/日/韩）至关重要。Quantumult X 的 `geo_location_checker` 需要定时查询节点 IP 所在地并更新显示。

**Decision:**

使用 **Bilibili IP API** 作为主要地理位置检测后端，配合自定义响应处理脚本：

```conf
geo_location_checker=http://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr?, 
    https://raw.githubusercontent.com/anaer/qx/main/general/IP_bili_cn.js
```

同时提供了三个备选方案（已注释，按需切换）：

| 后端 | 脚本 | 特点 |
|------|------|------|
| Bilibili (主用) | IP_bili_cn.js | 国内访问快，B站内部 API |
| ip-api.com | IP_API.js | 国际通用，返回信息全面 |
| IP33 | IP33.js | 国内 IP 查询服务 |
| realip.cc | realip.js | 轻量级 IP 查询 |

**Consequences:**

- Bilibili API 在中国大陆访问速度快、稳定性高
- 多个备选方案提供冗余，任一后端不可用时可通过注释快速切换
- 需要脚本格式化 API 返回值以匹配 QX 的地理位置显示格式
- Bilibili API 无官方 SLA，长期可用性依赖社区观察
