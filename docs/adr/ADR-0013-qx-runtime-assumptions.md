# ADR-0013: QX 运行时语义假设与保守落地

**状态：** 已接受
**创建时间：** 2026-10-09

> 当前状态 / 核心结论：重写脚本与规则写法依赖 5 条 QX 运行时语义，其中只有 2 条有可复现证据；本 ADR 记录每条的证实方式与「按最坏情况写」的落地形态，未证实项统一列入真机验证清单。

## 背景

QX 官方文档站本次不可达，社区资料多为转述。本仓库脚本大量依赖这些语义，若不区分「已证实」与「假设」，就会把假设写成事实（本会话已因此产出过一句不实的「已落地」声明）。

## 决策

1. **`$done()` 不终止后续代码**——按「不终止」写：出口必须互斥（`if (…) { $done({}); } else { … }`），禁止守卫后继续执行。禁止用顶层 `return` 作为终止手段（其在 QX 脚本包裹方式下的行为未证实）。
2. **重写规则自上而下首次命中即停止**——按「成立」写：需要不同动作的具体规则一律排在泛匹配规则之前；不依赖「后面还能兜底」的写法。
3. **正则只允许 ECMAScript 语法**——禁用 `(?>…)`、`(?\+…)` 等非 ECMAScript 构造；新增规则须过一遍 `new RegExp(pattern)` 编译。
4. **响应体一律先判类型再解析**：`JSON.parse` 与 protobuf `decode` 必须在 `try` 内，异常与非法输入统一 `$done({})` 透传，不猜服务端一定返回 JSON。
5. **未证实项不写成事实**：涉及 `$response.body` 与 `$response.bodyBytes` 的编码形态、`reject-200`/`reject-img` 的确切响应、QX 对脚本抛异常的最终处置，文档里标注「未验证」，实现按最坏情况取保守分支。

**不做什么**：不为验证假设去改现有分流/MITM 配置；不在本 ADR 重复 ADR-0012 的模块级写法约定。

## 证据分档

| 假设 | 档位 | 取证方式 |
|---|---|---|
| `$done` 不终止后续执行 | **已证实（JS 语义）** | 对改造前脚本跑空响应探针：`$done` 计数为 1 之后仍继续执行并抛 `SyntaxError`（`JSON.parse("")`）。JS 层确定，QX 引擎是否完全同构未实测 |
| 正则须为 ECMAScript | **已证实** | `rewrite/dingdong.conf#bottomNavi` 的原子分组经 `new RegExp` 实测抛 `Invalid regular expression`，为全仓 376 条中唯一一条 |
| 首次命中即停止 | 未证实（通行理解） | 用显式样本 URL 在本地按顺序匹配复现了「后序规则被吞」，但 QX 实际引擎未抓包验证 |
| `$response.body` 编码形态 | 未证实 | `rewrite/apple-wloc.js#base64ToBytes` 所在的头部注释称 `$response.body` 是 base64，实现却读 `$response.bodyBytes`，两者矛盾且 base64 分支在运行路径上零调用 |
| `reject-dict`/`reject-img`/`reject-200` 响应体 | 未证实 | 官方文档站本次不可达，仅从别家模块用法反推 |

## 后果

- 收益：脚本不再依赖「`$done` 会中断执行」这一常见误解，异常路径统一透传，最差情况退化为「不改写」而非「请求挂起」。
- 代价：互斥出口与 try 包裹会让部分文件缩进层级 +1，diff 变大（本会话 21 个脚本的改动忽略空白后仅 +91/−6 行）。
- 未解决风险：真机行为未验证；若 QX 实际会终止于 `$done`，当前写法只是冗余而非错误。

## 实施位置

- 已按本 ADR 落地：`rewrite/7mao.js`、`rewrite/spotify-proto.js`（脚本段 try + 缺失时透传）、`rewrite/quark.js`、`rewrite/cainiao.js`、`rewrite/caiyun.js`、`rewrite/dingdong.conf`
- 测试台（一次性，不落仓库）：空体 / 伪 JSON / 空 JSON 三态探针，断言每次执行 `$done` 恰好 1 次且无异常逃逸

## 关联文档

- [ADR-0012: 重写模块的 MITM 面与阻断动作分级](ADR-0012-rewrite-mitm-scope-and-reject-tiering.md) —— 该 ADR 的写法约定以本 ADR 的语义假设为前提

## 下一步

真机验证三件事（按优先级）：① 脚本抛异常时 QX 是透传还是使请求失败；② 规则是否真的首次命中即停止（用 `7mao.conf` 里两条同域不同动作的规则对比抓包）；③ `$response.bodyBytes` 与 `$response.body` 在 QX 各阶段的实际形态。
