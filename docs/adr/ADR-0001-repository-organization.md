# ADR-0001: 仓库结构与文件组织

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

Quantumult X 配置文件种类多、来源杂，需要一个清晰的组织结构来管理主配置、分流规则、重写规则、脚本和任务。早期可能将所有文件堆在根目录，但随着规则增多必须分类。

**Decision:**

按 `qx.conf` 配置段创建子目录，每个子目录存放对应功能的文件：

```
qx/
├── qx.conf              # 主配置文件
├── general/              # 通用脚本（资源解析器、IP 地理位置）
├── rewrite/              # 重写规则（.conf + .js 配对）
└── task/                 # 交互式与定时任务脚本
```

- `general/` — 配置引用的基础设施脚本（`[general]` 段相关）
- `rewrite/` — `[rewrite_remote]` 和 `[rewrite_local]` 引用的所有重写模块
- `task/` — `[task_local]` 配置的任务脚本

**Consequences:**

- 文件定位直观，新加入的规则可以快速放到对应目录
- 各目录职责单一，不混放不同用途的文件
- 远程引用的 URL 路径与本地目录结构一致（`main/rewrite/xxx.conf`），降低了心智负担
