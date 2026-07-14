# ADR-0002: 策略组拓扑设计

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

Quantumult X 的策略组决定了流量如何路由。需要一套既可灵活选择节点、又能在自动模式下保证低延迟的策略体系。常见方案有纯 static 手动选择、纯 url-latency-benchmark 自动测速，或两者结合。

**Decision:**

采用三级策略拓扑：

```
策略选择 (static)
  ├── Telegram (static → 地域组)
  ├── Twitter  (static → 地域组)
  ├── Google   (static → 地域组)
  ├── YouTube  (static → 地域组)
  ├── Spotify  (static → 地域组)
  ├── GitHub   (static → 地域组 / DIRECT)
  ├── Apple    (static → 地域组 / DIRECT)
  │
  ├── 美国节点 (url-latency-benchmark)
  ├── 香港节点 (url-latency-benchmark)
  ├── 日本节点 (url-latency-benchmark)
  └── 韩国节点 (url-latency-benchmark)

漏网之鱼 (static → DIRECT / 策略选择)
```

- **第一层**: `策略选择` 作为入口，手动控制全局走向
- **第二层**: 服务维度分组（Telegram、Twitter 等），可独立选择地域组或直连
- **第三层**: 地域维度自动测速组（美/港/日/韩），由 `url-latency-benchmark` 自动选取最低延迟节点
- **兜底**: `漏网之鱼` 未匹配规则的流量默认 DIRECT，也可切到策略选择

**Consequences:**

- 兼顾手动控制（策略选择）和自动优化（地域组测速）
- 服务级策略组允许按 APP 精细化分流（如 Telegram 走美/港/日，GitHub 直连+代理）
- 三级结构带来一定的配置复杂度，但对于多节点多服务的场景工程上是合理的
