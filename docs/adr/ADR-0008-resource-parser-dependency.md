# ADR-0008: 资源解析器依赖

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

服务器订阅来自多种来源，格式可能是 Clash、Surge、SS/SSR、V2Ray、Trojan 等非 Quantumult X 原生格式。需要一个资源解析器将各种格式统一转换为 QX 格式。

**Decision:**

使用社区维护的 **[Shawn 资源解析器](https://t.me/QuanX_API)**（`general/resource-parser.js`），主要功能：

1. **格式转换** — V2RayN/SS( R/D )/HTTP(S)/Trojan/VLess/Clash/Surge 等多格式转 QX
2. **节点筛选** — 通过 `in/out/regex/regout` 参数保留/删除节点
3. **节点增强** — 地区 emoji 标识、强制 TFO/UDP、证书控制 等
4. **规则处理** — rewrite/filter 的转换与筛选

在 `qx.conf` 中全局声明：
```conf
resource_parser_url=https://raw.githubusercontent.com/anaer/qx/main/general/resource-parser.js
```

并确保所有 `[server_remote]` 条目都设置 `opt-parser=true`。

**Consequences:**

- 支持几乎所有主流代理格式的自动转换，订阅源兼容性极强
- 社区持续更新维护，无需自行跟进格式变化
- 节点参数（emoji/udp/tfo/cert）通过 URL 参数灵活配置
- 远程引用依赖脚本托管在 raw.githubusercontent.com，源站不可用时影响订阅导入
