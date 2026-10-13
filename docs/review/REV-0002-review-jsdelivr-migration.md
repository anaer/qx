# Review Report: qx.conf 远程引用统一迁移至 jsDelivr

**ID**: `REV-0002`
**Date**: 2026-10-13
**Mode**: review
**Reviewer**: WorkBuddy AI
**Scope**: `qx.conf`（`raw.githubusercontent.com` → `cdn.jsdelivr.net` 全量迁移，46 处）、`docs/adr/ADR-0003-remote-rule-source.md`（引用通道决策扩展）
**Rule config**: `sha256:a94011598e4f`（来源：system，pattern=`default`）
**Coverage**: 2 reviewed / 2 total / 0 excluded

## Summary

将 `qx.conf` 中全部 `https://raw.githubusercontent.com/` 引用迁移至 `https://cdn.jsdelivr.net/`。涉及 `[general]` 6 处、`[rewrite_remote]` 28 处、`[task_local]` 12 处（含 img-url），共 46 个 URL、43 行。

**关键前提**：jsDelivr 的 GitHub 通道与 raw **不同构**。raw 为 `raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}`，jsDelivr 为 `cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}`。直接替换主机名会得到 404——已实测：正确格式返回 200（194,005 字节），直接前缀替换返回 404。因此本次按结构转换而非字符串替换。

审查发现 1 项由本次操作引入的缺陷（已修复）、2 项 Low 级既有问题。转换正确性已通过逐行比对验证：**行数 340→340，内容差异 43 行，全部为 URL 替换，非 URL 差异 0 行**。

## Issues

| # | Severity | File:Line | Category | Finding | Recommendation |
|---|----------|-----------|----------|---------|----------------|
| 1 | Medium | `qx.conf`（全文件） | bug | 转换脚本以 Python 文本模式写入，把文件行尾由 **CRLF 整体改写为 LF**（340 处）。仓库 `core.autocrlf=true`，工作区文件应为 CRLF（`README.md`、`CHANGELOG.md` 均为 CRLF）。虽 QX 解析与 git 提交结果均不受影响，但属无谓的全文件改写 | 以二进制模式将 `\n` 还原为 `\r\n` |
| 2 | Low | `qx.conf:333`、`qx.conf:334`、`qx.conf:6` | bug | `icon/GMedia.png`、`icon/Stack.png`、`icons/profile.png` 三个引用返回 **404**——`icon/` 与 `icons/` 目录**从未被 git 跟踪**，仓库中不存在。**既有缺陷，非本次引入**：转换前的 raw 形式同样 404 | 补齐图标文件，或移除 `img-url` 参数（三处所在任务均为 `enabled=false` 或已注释，无功能影响） |
| 3 | Low | `qx.conf:324` | maintainability | `https://github.com/chavyleung/scripts/raw/master/box/rewrite/boxjs.rewrite.quanx.conf` 未纳入本次迁移——该 URL 主机名为 `github.com`，不匹配指令中的 `raw.githubusercontent.com` 前缀，但功能上等价（302 跳转至 raw 主机）。实测可转为 jsDelivr 并返回 200 | 若需消除同类风险，改为 `https://cdn.jsdelivr.net/gh/chavyleung/scripts@master/box/rewrite/boxjs.rewrite.quanx.conf` |

## By Severity

### Critical

无。

### High

无。

### Medium

- **`qx.conf`** [bug] — 行尾符被整体改写为 LF。
  > 建议：`open(p,'wb').write(b.replace(b'\n', b'\r\n'))`。
  > **状态：已修复。** 修复后 CRLF 340 处、孤立 LF 0 处；`git diff` 仍为 137/56，与修复前一致，证明内容未受影响。

### Low

- **`qx.conf:333` / `:334` / `:6`** [bug] — 图标引用 404，属既有缺陷（`git ls-files | grep icon` 无输出；`raw` 形式实测同样 404）。未修复：超出本次范围，且三处均为停用或注释状态。
- **`qx.conf:324`** [maintainability] — BoxJS 模块 URL 未迁移。未修复：不匹配指令的 `raw.githubusercontent.com` 前缀，属范围外；转换方案已验证可行。

## Severity Distribution

- Critical: 0
- High: 0
- Medium: 1（已修复）
- Low: 2（未修复，待用户决定）

## Language-Specific Notes

| Rule group | Pattern | Rule file | Source | Files |
|------------|---------|-----------|--------|-------|
| 1 | `default` | default.md | system | 2 |

`qx.conf` 无标准扩展名，回落 `default` 规则组；`docs/adr/*.md` 同组。

**验证手段**（本次为配置文本替换，验证以可复现命令为准）：

| 检查项 | 命令 / 方式 | 结果 |
|--------|------------|------|
| 转换处数 | `grep -c 'raw\.githubusercontent\.com'` | 0 残留 |
| 格式合规 | 正则校验全部 URL 形如 `gh/{owner}/{repo}@{branch}/{path}` | 46/46 合规 |
| 可达性抽样 | 7 个 URL 逐一 curl（覆盖 general / rewrite / task / icon / 第三方仓库） | 6×200，1×404（既有缺陷） |
| 逐行比对 | 转换前备份 vs 现行，按行 zip 比对 | 340→340 行，差异 43 行全为 URL，非 URL 差异 0 |
| 行尾 | 二进制计数 CRLF / 孤立 LF | 340 / 0 |
| 注释约定 | `check_comment_conventions.py --check-refs` | 通过 |
| ADR 锚点 / 互链 | `verify_adr_anchors.py --check` / `verify_adr_links.py --check` | 硬失败 0 / 单向 0 |

## Coverage Detail

| File | Status | Note |
|------|--------|------|
| `qx.conf` | reviewed | 46 处 URL 迁移；行尾、格式、可达性、逐行比对均已校验 |
| `docs/adr/ADR-0003-remote-rule-source.md` | reviewed | 「引用通道」决策由「规则源」扩展至全部远程引用，并记录两通道 URL 不同构的事实 |

## Follow-Up

1. **`[server_remote]` 的 gist 订阅无法纳入本次统一**（`qx.conf:278`、`:280`）：`gist.githubusercontent.com` 与 raw 主机同属一类，但**实测 jsDelivr 不提供 gist 通道**（`cdn.jsdelivr.net/gist/...` 返回 404）。若该主机在你的网络下同样不可达，需改用其他方案（将订阅内容迁入仓库后经 `gh/` 通道引用，或换用其他镜像）。已登记于 ADR-0003「后果」段。
2. **jsDelivr 分支缓存与推送依赖**：jsDelivr 内容源自 GitHub，本地改动**必须先推送**才会生效，且分支引用有小时级缓存。这会影响 `update-interval` 的实际语义，已登记于 ADR-0003。
3. 两项 Low 级问题待用户决定是否处理。
4. 本次审查未执行 security 与 performance 模式：变更不含凭据、认证流或算法热点。

## 决策性内容

评审确认以下决策已落盘 `ADR-0003`：

- **全部远程引用（filter / rewrite / task / general）统一走 jsDelivr**，不限于规则源。
- **两个通道的 URL 不同构**，直接替换主机名会产出 404——这是后续任何迁移都必须遵守的格式约定。
- **jsDelivr 不支持 gist 通道**，故 `[server_remote]` 排除在统一范围外。

无新增待落盘项。
