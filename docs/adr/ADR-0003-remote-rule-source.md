# ADR-0003: 远程规则源选择

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

分流规则需要持续更新以应对域名和 IP 变化。手动维护规则列表工作量巨大，需要选择一个可靠的远程规则源。

**Decision:**

统一使用 [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) 作为远程规则源，按服务独立引用：

```conf
# Advertising → REJECT
# Telegram → Telegram 策略组
# Twitter  → Twitter 策略组
# ...每个服务对应一条远程引用
```

配合本地 `[filter_local]` 处理中国金融类服务的直连需求，以及兜底规则。

**Consequences:**

- 规则维护工作量极低，依赖社区更新
- blackmatrix7 是开源社区广泛使用的规则集，覆盖面广、更新频繁
- 单点依赖：如果规则源不可用，分流规则会回退到本地规则+兜底（漏网之鱼）
- 更新间隔设为 7 天（604800 秒），权衡了及时性和请求频率
