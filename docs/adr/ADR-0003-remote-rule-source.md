# ADR-0003: 远程规则源选择

**状态：** 已接受
**创建时间：** 2026-07-14

> 当前状态 / 核心结论：远程规则统一取自 blackmatrix7/ios_rule_script，**全部远程引用**（含 filter / rewrite / task / general）统一经 `cdn.jsdelivr.net` 引用；具体源清单、策略偏好与更新间隔见 ADR-0015，本篇只保留源选择原则、引用通道与新增源的门槛。

## 背景

分流规则需要持续更新以应对域名和 IP 变化。手动维护规则列表工作量巨大，需要选择一个可靠的远程规则源。

## 决策

1. 远程规则源以 [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) 为主力，辅以 [privacy-protection-tools/anti-AD](https://github.com/privacy-protection-tools/anti-AD) 作为中文区补充；两者均按服务独立引用。
2. **全部远程引用统一走 `cdn.jsdelivr.net`**，不直连 `raw.githubusercontent.com`。范围含 `[filter_remote]`、`[rewrite_remote]`、`[task_local]`，以及 `[general]` 的 `resource_parser_url` 与 `geo_location_checker` 脚本。**两个通道的 URL 不同构**——`https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}` 对应 `https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}`，直接替换主机名会得到 404（已实测）。
3. 策略偏好按用途区分：广告与隐私类源强制 REJECT，服务类源指向对应策略组，区域类源指向 DIRECT。
4. **新增源的门槛**：上游最后更新时间距今超过 6 个月的列表，不得作为新增覆盖面的依据；且须先核实仓库信誉（star / fork / 存续时长），**单一维护者且无社区验证的新仓库不得作为直接订阅源**。
5. 配合本地 `[filter_local]` 处理中国金融类服务的直连需求，以及兜底规则。

**不做什么**：不新建自建放行列表文件；不为绕过 jsDelivr 的缓存而改用 commit hash 固定版本。

## 后果

- 规则维护工作量极低，依赖社区更新。
- 单点依赖的载体由 `raw.githubusercontent.com` 换成 `cdn.jsdelivr.net`，属同类风险换载体而非消除。
- **jsDelivr 不支持 gist 通道**（实测 404），`[server_remote]` 的两条 gist 节点订阅无法纳入本次统一，仍直连 `gist.githubusercontent.com`。
- jsDelivr 对分支引用有缓存，且其内容来自 GitHub——本地改动必须先推送才生效，更新会有小时级滞后。
- 上游各列表维护活跃度差异极大——Advertising 与 Proxy 每日更新，GitHub / Spotify / Hijacking 已停更 12–16 个月——因此「依赖社区更新」对不同源的实际含义并不相同，需按源分别判断。

## 关联文档

- [ADR-0015: 广告拦截有效性与 filter_remote 重构](ADR-0015-ad-filter-effectiveness.md) —— 源清单、策略偏好与更新间隔由该 ADR 确定，本篇只保留源选择原则

## 下一步

无需后续动作。
