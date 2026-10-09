# ADR-0012: 重写模块的 MITM 面与阻断动作分级

**状态：** 已接受
**创建时间：** 2026-10-08

> 当前状态 / 核心结论：五条写法约定已在 `rewrite/` 全量落地（七猫/叮咚/高德/菜鸟/夸克/spotify/喜马拉雅等模块），待对齐项已清空；剩余动作只有推送后在 QX 内更新资源做真机验证，语义层面的未证实项由 ADR-0013 承载。

## 背景

`[rewrite_remote]` 模块只要启用，`hostname` 列出的域名就全部进入 MITM 解密，与规则是否注释无关。七猫案例中，正文接口域被宽正则送进无保护的响应脚本，是「全部启用规则就闪退」的成因；横向核对 lodepuly、deezertidal、blackmatrix7 等外部源后确认：别家一律不碰正文与账号域。

## 决策

1. **MITM 面独立收敛**：`hostname` 只列规则真正需要的域名；正文、账号、支付类域名不得进入 `hostname`，也不得被任何改写规则命中。
2. **宽正则靠 `hostname` 收口，且顺序即优先级**：形如 `(api-\w+|xiaoshuo)\.wtzw\.com\/api\/v\d\/` 的正则要保留（用于覆盖未穷举的 `api-*` 主机），其实际生效范围由同模块 `hostname` 限定；收窄 `hostname` 时必须逐一核对脚本分支是否随之不可达。重写规则自上而下首次命中即停止，因此**泛匹配规则必须排在需要不同动作的具体规则之后**，否则后者的动作静默失效。
3. **阻断动作分级**：**已在该模块观察到闪退/SDK 异常时**，JSON 接口用 `reject-dict`（空对象）、静态资源用 `reject`；不给内容类接口配任何阻断。未观察到问题的模块维持原动作，不为统一风格批量改写——`reject-dict` 对二进制/视频接口反而更危险。
4. **响应脚本单出口 + 异常兜底**：脚本整体套 `try { … } catch (e) { $done({}); }`，任何异常一律透传原响应；一次执行只允许到达一次 `$done`，判空守卫必须与主逻辑互斥（`if (…) { $done({}); } else { … }`），不能只写 `$done()` 后继续往下跑。
5. **来源链接进头部**：模块与脚本的 raw 链接、以及借鉴的外部规则源链接写在 `.conf` 顶部注释，且须实测可达（失效链接改指向上游仍然可用的地址）。

**不做什么**：不改 `[filter_*]` 分流；不引入资源解析器；本次不批量改造其余无 `try/catch` 的脚本。

## 后果

- 收益：闪退面从「全站解密 + 全接口改写」缩到显式域名清单；广告 SDK 不再因硬阻断空指针。
- 代价：收窄 `hostname` 会静默丢掉改写分支——本例 `rewrite/7mao.js` 的 `chapter-list → auto_download` 分支因 `api-ks.wtzw.com` 出局而失效，属已知取舍。
- 顺序遮蔽的影响面：重写模块若存在泛匹配规则，排在它之后的同类具体规则一律不生效。`rewrite/7mao.conf` 曾出现 22 条启用规则中 12 条被宽正则或前序 `reject-dict` 抢先命中（弹窗阻断退化为「不改写」、开屏参数改写被空对象吞掉），现按「具体在前、宽正则兜底在后」重排消除。
- 未解决风险：`$done()` 不终止后续代码已由反证确认（改造前的脚本在空响应路径上先调用了 `$done({})`，仍继续执行 `JSON.parse` 并抛错）；异常对 QX 最终响应体的影响仍未真机验证。`reject-200`、`reject-img` 的官方语义未从文档确认。

## 实施位置

- 已落地：`rewrite/7mao.conf#hostname`、`rewrite/7mao.conf#api-ks.wtzw.com`、`rewrite/7mao.conf` 的规则顺序（阻断组 → 具体改写组 → 宽正则兜底）、`rewrite/7mao.js`（IIFE 单出口 + 非 JSON 放行）、`rewrite/dingdong.conf` 的 `(?>...)` 原子分组改为普通捕获分组、`rewrite/spotify.conf#hostname`（补 `*spclient.spotify.com`，使正则面与 MITM 面对齐，头部失效引用改指向上游可达地址）、`rewrite/` 下 21 个含 `JSON.parse` 的响应脚本整体加 try 兜底，其中 8 个的判空守卫改为互斥分支
、`rewrite/spotify-proto.js`（脚本段整体 try，深链缺失与方法不匹配分支改为透传原响应体）、`rewrite/quark.js`（路径遍历支持 `a[b]` 下标，数组用 splice 避免 null 空洞）、`rewrite/ximalaya.conf#hostname`（`*.xima*.*` 跨级通配换成 `*.ximalaya.com, *.xmcdn.com`，24 条规则逐条复测仍可命中；旧写法会额外解密 `ximaplay.org`、`ximalaya.com.evil.net` 这类仿冒域）
- 待对齐：无

## 关联文档

- [ADR-0004: 重写模块组织](ADR-0004-rewrite-module-organization.md) —— 本 ADR 约束同一批模块文件内部的启用边界
- [ADR-0013: QX 运行时语义假设与保守落地](ADR-0013-qx-runtime-assumptions.md) —— 本 ADR 的单出口与顺序约定建立在该 ADR 记录的语义假设之上

## 下一步

推送后在 QX 内更新资源做真机验证：七猫看开屏 `is_show_ad` 与必读榜弹窗是否不再出现；高德/菜鸟/叮咚/京东/夸克/知乎各触发一次空响应，确认不再闪退或白屏。
