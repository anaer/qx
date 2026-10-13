# Review Report: filter_remote 与 filter_local 去广告重构

**ID**: `REV-0001`
**Date**: 2026-10-13
**Mode**: review
**Reviewer**: WorkBuddy AI (design-manager → review-pipeline)
**Scope**: `qx.conf`、`docs/adr/ADR-0003-remote-rule-source.md`、`docs/adr/ADR-0010-local-filter-rules.md`、`docs/adr/ADR-0013-qx-runtime-assumptions.md`、`docs/adr/ADR-0015-ad-filter-effectiveness.md`（新增）、`docs/glossary/glossary.md`
**Rule config**: `sha256:a94011598e4f`（来源：system，pattern=`default`）
**Coverage**: 6 reviewed / 6 total / 0 excluded

## Summary

本次变更重构 Quantumult X 的远程分流源结构与本地规则：`[filter_remote]` 由 12 条改为 14 条并按「放行层 → 广告层 → 服务层」重排，引用通道由 `raw.githubusercontent.com` 迁至 `cdn.jsdelivr.net`，`opt-parser` 全部关闭，移除已停更 4 个月的 fmz200 广告源并把其 65 条独有高价值规则下沉 `[filter_local]`，新增 Privacy 与 Hijacking 两个源，新增 5 条上游误收录放行规则。业务目标是提升去广告有效性，同时修正上游误杀。

审查共发现 3 项真实缺陷（1 High、2 Medium），**均已在本次审查过程中修复并复验**；另有 3 项 Low 级建议留待用户决定。整体质量评估：配置语法与参数拼写无误，规则类型全部合法，下沉清单与生成脚本输出逐条一致（65/65），ADR 锚点与互链自检零硬失败。

**关键发现**：`safebrowsing.googleapis.com` 与 `safebrowsing.urlsec.qq.com` 在上游以**两种不同类型**收录——Advertising 用 `HOST-SUFFIX`，Privacy 与 Google 用 `HOST`。按 QX 类型优先级 `HOST > HOST-SUFFIX`，只放行一层会被另一层抢先命中而**静默失效**。这是本次重构中唯一会造成「用户明确要求的功能实际未生效」的缺陷，且不报错、不崩溃，只能靠类型层级推演发现。

## Issues

| # | Severity | File:Line | Category | Finding | Recommendation |
|---|----------|-----------|----------|---------|----------------|
| 1 | High | `qx.conf:238-240` | bug | 放行层中 `safebrowsing.googleapis.com` 与 `safebrowsing.urlsec.qq.com` 仅以 `host-suffix` 放行，而 Privacy 与 Google 的对应规则是 `HOST` 类型。`HOST` 层优先级高于 `HOST-SUFFIX`，远程规则会抢先命中，放行静默失效 | 两条域名各补一条 `host,` 放行规则，使本地在 `HOST` 与 `HOST-SUFFIX` 两层均领先 |
| 2 | Medium | `qx.conf:132`、`docs/adr/ADR-0015-ad-filter-effectiveness.md` | documentation | 论证数值「二者 IP 类规则合计 497 条，占比 0.17%」与实测不符。实测 Advertising IP-CIDR 486 + IP6-CIDR 3 + Privacy IP-CIDR 11 = **500 条**，占两源 326,957 条的 **0.15%** | 修正为 500 条 / 0.15% |
| 3 | Medium | `qx.conf:131-132` | maintainability | `[filter_remote]` 注释承载了完整设计论证与量化依据（含「497 条」「0.17%」），违反「注释只写是什么 / 非显然的为什么，设计论证留在 ADR」的约定 | 注释精简为一句契约描述，数值论证保留在 ADR-0015 |
| 4 | Low | `qx.conf:200` | maintainability | `host-suffix, ad.richmob.cn` 被同批的 `host-suffix, richmob.cn` 完全覆盖，属冗余规则 | 可删除；保留亦无害（QX 首次命中即停） |
| 5 | Low | `qx.conf:169-236` | style | 新增规则策略值用小写 `reject`/`direct`，而同段落既有金融规则用大写 `DIRECT` | 统一大小写；QX 对策略名大小写不敏感，不影响功能 |
| 6 | Low | `README.md` | documentation | 「规则来源」段仅指向 fmz200 的 rewrite.snippet，未反映本次源结构变更（新增 blackmatrix7 的 Privacy / Hijacking / Direct，移除 fmz200 的 filter 源） | 补充 blackmatrix7 作为分流规则来源 |

## By Severity

### Critical

无。

### High

- **`qx.conf:238-240`** [bug] — 放行层只覆盖 `HOST-SUFFIX` 层，漏掉 `HOST` 层，导致用户明确要求「剔除」的两条安全浏览域名实际仍被 Privacy 与 Google 拦截。
  > 建议：`safebrowsing.googleapis.com` 与 `safebrowsing.urlsec.qq.com` 各补一条 `host, <域名>, direct`。
  > **状态：已修复。** 放行层由 3 条扩为 5 条；复验脚本按 qx.conf 实际内容重新解析，确认 3 个放行域名在全部 12 个启用源上的命中层级均不低于本地放行层级，失效项 0 处。

### Medium

- **`qx.conf:132`、`ADR-0015`** [documentation] — 论证数值 497 条 / 0.17% 与实测 500 条 / 0.15% 不符，属「读者按它行动会踩坑的硬事实」。
  > 建议：按实测值修正。**状态：已修复**（ADR-0015 决策 2 与 qx.conf 注释同步更正）。
- **`qx.conf:131-132`** [maintainability] — 配置注释承载设计论证与数值举例。
  > 建议：注释精简为「其 HOST-SUFFIX 规则含需放行的域名，前置会使本地放行失效」，论证留在 ADR-0015。**状态：已修复。**

### Low

- **`qx.conf:200`** [maintainability] — `ad.richmob.cn` 冗余。未修复：该 65 条清单是策展脚本的可复现输出，保留可维持「清单 ↔ 脚本」一一对应。
- **`qx.conf:169-236`** [style] — 策略值大小写不统一。未修复：QX 不敏感，改动收益低于 diff 噪声成本。
- **`README.md`** [documentation] — 规则来源段未同步。未修复：README 只列 rewrite 来源，与本次 filter 改动不构成事实错误。

## Severity Distribution

- Critical: 0
- High: 1（已修复并复验）
- Medium: 2（均已修复）
- Low: 3（未修复，待用户决定）

## Language-Specific Notes

| Rule group | Pattern | Rule file | Source | Files |
|------------|---------|-----------|--------|-------|
| 1 | `default` | default.md | system | 6 |

本次变更文件全部命中系统层通用规则（无 `*.java` / `*.js` 等专属映射命中；`qx.conf` 无标准扩展名，回落 `default`）。项目内不存在 `.opencodereview/rule.json`，无项目层或用户层规则覆盖。

**配置驱动型仓库的挂载-启用矩阵**（按 `references/mode-review.md`「专项」节要求）：

| 对象 | 挂载状态 | 说明 |
|------|---------|------|
| `[filter_remote]` 的 12 条远程源 | 挂在启用能力上 | 均 `enabled=true` |
| `[filter_local]` 的 105 条规则 | 挂在启用能力上 | 本地规则无独立开关 |
| `Hijacking` 的 `inserted-resource=true` | 挂在启用能力上 | 本次唯一启用前置的源 |
| fmz200 广告源 | 已移除 | 原 `enabled=true`，本次删除 |

## Coverage Detail

| File | Status | Note |
|------|--------|------|
| `qx.conf` | reviewed | 全量 diff 审查；语法、参数拼写、规则类型、域名合法性、重复与冲突均已机械校验 |
| `docs/adr/ADR-0003-remote-rule-source.md` | reviewed | 正文按代码为准原则改写，决策与现状一致 |
| `docs/adr/ADR-0010-local-filter-rules.md` | reviewed | 本地规则层数与规模约束已同步至 105 条 |
| `docs/adr/ADR-0013-qx-runtime-assumptions.md` | reviewed | 新增决策 6 与两条证据分档，档位标注与取证方式齐备 |
| `docs/adr/ADR-0015-ad-filter-effectiveness.md` | reviewed | 新增篇；证据分档、实施位置、互链齐备 |
| `docs/glossary/glossary.md` | reviewed | `inserted-resource` 释义修正，新增两条术语 |

## Follow-Up

1. **推送后真机验证**（阻断性，来自 ADR-0015「下一步」）：① jsDelivr 在目标设备是否可达；② 农行 `www.95599.cn` 与两条 safebrowsing 是否已放行；③ Hijacking 的 `114.119.160.0/21` 等网段 REJECT 后有无正常站点被误杀。
2. **三项 Low 级建议**待用户决定是否处理。
3. **存量欠账（登记，不在本次范围）**：`ADR-0001` / `0002` / `0004` / `0005` / `0006` / `0007` / `0008` / `0009` / `0011` 仍为英文旧模板（无中文状态行与 TL;DR、正文为 `**Context:**` / `**Decision:**` / `**Consequences:**` 分节）；`ADR-0011` 为 125 行，超 120 行硬上限。上述均为既有欠账，本次未顺手改动。
4. **本次审查未执行 security 与 performance 模式**：变更不含凭据、认证流或算法热点，按「按任务类型选择」判断无需追加。

## 决策性内容

评审确认以下设计约定已构成决策性内容，其中前两项已在 `ADR-0013` / `ADR-0010` / `ADR-0015` 落盘：

- **放行规则必须覆盖上游实际使用的全部类型层级**——上游对同一域名可能同时以 `HOST` 与 `HOST-SUFFIX` 收录，只放行低层级会静默失效（已写入 `ADR-0013` 决策 6 与 `ADR-0010`「放行层的层级要求」）。
- **`inserted-resource` 与放行能力互斥**——远程源一旦前置，针对它的任何本地放行都会失效，故只在无需放行的源上启用（已写入 `ADR-0015` 决策 2）。

无新增待落盘项。
