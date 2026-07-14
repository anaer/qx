# ADR-0007: 服务器订阅管理

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

Quantumult X 的节点通过服务器订阅（远程）和本地节点（备用）提供。需要管理多个订阅源、解析格式转换和节点生产/测试环境的隔离。

**Decision:**

采用双订阅方案：

| 订阅 | 状态 | 用途 |
|------|------|------|
| Work | 启用 | 日常使用的节点，资源解析器开启 |
| Home | 禁用 | 备用/家庭环境订阅，按需启用 |

订阅链接为 Gist 托管，配合 `resource-parser.js` 解析：
```conf
https://gist.githubusercontent.com/.../Work.yaml, tag=Work, opt-parser=true, inserted-resource=true, enabled=true
https://gist.githubusercontent.com/.../Home.yaml, tag=Home, opt-parser=true, inserted-resource=true, enabled=false
```

- `inserted-resource=true` — 节点插入到资源列表末尾，不影响已有排序
- 无本地服务器节点（`[server_local]` 留空）

**Consequences:**

- Work/Home 分离允许在不同网络环境下切换订阅
- 依赖 Gist 可用性和 Gist 更新机制
- 关闭的 Home 订阅减少了启动时的解析负担
- 所有节点经由 resource-parser.js 处理，保证格式统一和筛选能力
