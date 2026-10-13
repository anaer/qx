# Review Report: 加入 anti-AD 源与开屏 SDK 本地内联

**ID**: `REV-0003`
**Date**: 2026-10-13
**Mode**: review
**Reviewer**: WorkBuddy AI
**Scope**: `qx.conf`（新增 anti-AD 远程源 1 条、新增开屏 SDK 本地规则 38 条）、`docs/adr/ADR-0003-remote-rule-source.md`、`docs/adr/ADR-0010-local-filter-rules.md`、`docs/adr/ADR-0015-ad-filter-effectiveness.md`
**Rule config**: `sha256:a94011598e4f`（来源：system，pattern=`default`）
**Coverage**: 4 reviewed / 4 total / 0 excluded

## Summary

为提升去广告覆盖面，本次新增两个来源：其一，`privacy-protection-tools/anti-AD` 作为中文区补充源（101,817 条，全为 `host-suffix` + `reject`，QX 原生格式，10,834 star / 存续 10 年）；其二，开屏 SDK 专项 38 条内联进 `[filter_local]`（取自 hwind2021 的 `Splash-Killer.list`，相对 `Advertising ∪ anti-AD` 的净增量 45 条，剔除 6 条通用基础设施域与 1 条重复项后保留 38 条）。

审查发现 1 项文档与事实不符（已修复）、2 项 Low 级不确定性（未修复）。配置层面的安全性经构造性验证：anti-AD 全部为 `HOST-SUFFIX` 类型且未启用 `inserted-resource`，因此**在任何同层冲突中本地规则恒先于它**，不可能遮蔽放行层。

**须注意的性价比问题**：anti-AD 使规则总量由约 33.8 万条升至约 44.0 万条（**+30%**），而其边际增量仅 12,291 条（12.1%），且这批独有域名中含较多长尾反查域，仅 13.3% 为 `.cn` 系后缀。这是本次改动中性价比最低的一项，已写入 ADR-0015 的「代价 / 权衡」段并标注回退优先级。

## Issues

| # | Severity | File:Line | Category | Finding | Recommendation |
|---|----------|-----------|----------|---------|----------------|
| 1 | Medium | `docs/adr/ADR-0003-remote-rule-source.md` | documentation | 决策 1 原写「**统一使用** blackmatrix7/ios_rule_script 作为远程规则源」，加入 anti-AD 后该全称表述与事实不符（且与同篇决策 4 的「新增源门槛」自相矛盾——既已设门槛，即隐含允许新增源） | 改为「以 blackmatrix7 为主力，辅以 anti-AD 作为中文区补充」 |
| 2 | Low | `qx.conf:254-264` | maintainability | 开屏 SDK 清单含 11 条 `host-keyword` 规则，其中 `.adapi` / `-adapi` 为推测性宽泛模式。已核验不误伤本地 22 个确定性域名（含 18 家银行、放行层、既有广告规则），但对全网域名的误杀面未经真实流量验证 | 观察期内如发现异常站点，优先复核这 11 条关键词规则 |
| 3 | Low | `qx.conf:229-231` | other | `sutui.aliyun.com`、`adashx.taobao.com`、`adashx2.taobao.com` 是否为纯广告域存疑（`sutui` 疑为阿里云素材服务、`adashx` 为数据上报端点），且来源为单一零信誉新仓库 | 若发现阿里系 App 功能异常，优先复核这三条 |

## By Severity

### Critical

无。

### High

无。

### Medium

- **`docs/adr/ADR-0003-remote-rule-source.md`** [documentation] — 决策 1 的全称表述与现状不符。
  > 建议：改为「以 blackmatrix7 为主力，辅以 anti-AD 作为中文区补充」。
  > **状态：已修复。** 同时把决策 4 的「新增源门槛」补上仓库信誉判据（star / fork / 存续时长），因为本次正是靠该判据排除了 hwind2021（0 star、创建 5 周、核心宣称经实测为 73% 而非 22%）。

### Low

- **`qx.conf:254-264`** [maintainability] — 11 条 `host-keyword` 的误杀面未验证。未修复：`host-keyword` 层优先级低于 `HOST` / `HOST-SUFFIX`，且已核验不影响本地确定性域名。
- **`qx.conf:229-231`** [other] — 3 条域名性质存疑。未修复：均为窄子域，影响面有限。

## Severity Distribution

- Critical: 0
- High: 0
- Medium: 1（已修复）
- Low: 2（未修复，待用户决定）

## Language-Specific Notes

| Rule group | Pattern | Rule file | Source | Files |
|------------|---------|-----------|--------|-------|
| 1 | `default` | default.md | system | 4 |

**配置驱动型仓库的挂载-启用矩阵**：

| 对象 | 挂载状态 | 说明 |
|------|---------|------|
| `[filter_remote]` 15 条远程源 | 挂在启用能力上 | 均 `enabled=true` |
| `[filter_local]` 143 条规则 | 挂在启用能力上 | 本地规则无独立开关 |
| 新增 anti-AD | 挂在启用能力上 | `inserted-resource` 未启用 |
| 新增开屏 SDK 38 条 | 挂在启用能力上 | 本地 REJECT |

**验证手段**：

| 检查项 | 方式 | 结果 |
|--------|------|------|
| 净增量核算 | `Splash-Killer ∩ (Advertising ∪ anti-AD)` 补集 | 45 条 → 剔除 6 → 去重 1 → **38 条** |
| 通用基础设施误纳入 | 逐条人工判定 | 剔除 `api.snssdk.com`、`bytecdn.cn`、`sf{1,3,6}-ttcdn-tos.pstatp.com`、`buy.toutiao.com` |
| 本地重复项 | 与 `[filter_local]` 既有 105 条比对 | 命中 `ad.hicloud.com`，已去重 |
| 关键词误伤 | 11 条 keyword × 22 个本地确定性域名 | 误伤 **0** 处 |
| 放行层安全性 | anti-AD 类型/策略分布 + 与本地放行交集 | anti-AD 100% 为 `host-suffix`+`reject` 且未前置；交集仅 `safebrowsing.urlsec.qq.com`，同层本地在前 + 本地另有更高 `HOST` 层规则 → **双重安全** |
| 规则类型合法性 | 全量扫描 | `host` / `host-suffix` / `host-keyword` / `ip-cidr` / `geoip` / `final`，全部为 QX 原生类型 |
| 重复项与动作冲突 | 全量扫描 | 仅 `safebrowsing` 两域的 `DIRECT` 各出现 2 次，属**有意**的双层放行 |
| 行尾与编码 | 二进制计数 | CRLF 381 / 孤立 LF 0，无 BOM |
| 新源可达性 | curl | `http=200`，`text/plain`（3.88 MB） |
| ADR 锚点 / 互链 | `verify_adr_anchors.py` / `verify_adr_links.py` | 硬失败 0 / 未校验 0；单向 0 / 坏链 0 |
| 注释约定 | `check_comment_conventions.py --check-refs` | 通过 |

## Coverage Detail

| File | Status | Note |
|------|--------|------|
| `qx.conf` | reviewed | 1 条远程源 + 38 条本地规则；类型、重复、冲突、行尾均已校验 |
| `docs/adr/ADR-0003-remote-rule-source.md` | reviewed | 决策 1 修正；决策 4 补仓库信誉判据 |
| `docs/adr/ADR-0010-local-filter-rules.md` | reviewed | 层数 5→6，规模 105→143 |
| `docs/adr/ADR-0015-ad-filter-effectiveness.md` | reviewed | 新增决策 8/9；后果段补性价比数据与 HTTPDNS 未解决风险 |

## Follow-Up

1. **HTTPDNS 未阻断（本报告最需注意的一项）**：国内 App 通过 HTTPDNS 取回广告域名 IP 后直接以 IP 建连，QX 只看到 IP、看不到域名，全部 `HOST` / `HOST-SUFFIX` 规则无从匹配。这是「域名规则已达 44 万条而效果仍不理想」的**可能根因**，且它解释了为何单纯增加规则数量收益递减。未采纳的原因是阻断后 App 的 DNS 路径会改变，兼容性风险未评估。建议在 QX 内手动试加 `BlockHttpDNS` 类规则观察一段时间，再决定是否写入配置。
2. **规则规模观察**：总量升至 44 万条后，需实测 QX 的内存占用与启动耗时；若明显劣化，**优先回退 anti-AD**（ADR-0015 已标注其性价比最低）。
3. **anti-AD 的更新间隔**设为 7 天，与其自身更新频率一致；若发现其更新变频繁可下调。
4. 两项 Low 级问题待用户决定是否处理。
5. 本次审查未执行 security 与 performance 模式：变更不含凭据、认证流或算法热点。

## 决策性内容

评审确认以下决策已落盘：

- **新增源的门槛除「停更不超 6 个月」外，还须核实仓库信誉**（star / fork / 存续时长）；单一维护者且无社区验证的新仓库不得作为直接订阅源。该判据来自本次对 hwind2021 的实证（0 star、创建 5 周、核心宣称无法复现）——已写入 `ADR-0003` 决策 4。
- **零信誉新源的内容若确有价值，应内联进本地而非订阅**——开屏 SDK 38 条即按此处置。已写入 `ADR-0010` 的开屏 SDK 层。

无新增待落盘项。
