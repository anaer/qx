# ADR-0006: 任务脚本架构

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

Quantumult X 支持本地和远程任务脚本，用于策略流量查询、网络检测、流媒体解锁检查等运维功能。需要决定任务的组织方式和来源。

**Decision:**

采用 event-interaction（交互式）和 cron（定时）两种模式，脚本来源以社区现成脚本为主：

```
event-interaction → 流量查询、网速检测、流媒体解锁、链路检测、节点送中检测
cron             → TestFlight 自动加入
```

所有任务脚本放在 `task/` 目录：
- 多数来自 [KOP-XIAO/QuantumultX](https://github.com/KOP-XIAO/QuantumultX) 社区脚本
- 默认启用 `traffic_check.js`（流量查询），其余默认禁用
- 地理位置查询提供三种后端（realip.cc / ip.sb / IP33），按需启用

**Consequences:**

- 以社区脚本为主，开发维护成本低
- 默认只启用最常用的流量查询，减少误触和不必要的网络请求
- 多后端 GeoIP 方案提供冗余，一个 API 不可用时可切换
