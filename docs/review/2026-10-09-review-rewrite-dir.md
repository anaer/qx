# rewrite 目录代码质量评审（2026-10-09）

**模式**: review-pipeline / review（无变更基准的全目录扫描，即 mode-review.md「专项」）
**范围**: `rewrite/` 全部 64 个文件（28 个 `.conf` + 36 个 `.js`）
**规则配置**: `sha256:2bed64cb922060527607cecd5c9b2eb5debd3c2d0727841f1e3294a6ed8604bb`（group1 `default.md` → 28 conf，group2 `javascript-typescript.md` → 36 js，excluded 0）
**覆盖率**: 机械检查 64/64；逐条深审 `7mao.conf` + 抽样 6 个 js（`7mao.js`、`dingdong.js`、`caiyun.js`、`wb_ad.js`、`wechat-url-unblock.js`、`spotify-proto.js`）；其余 27 个 conf、29 个 js 仅机械检查
**问题**: 0 critical，3 high，4 medium，2 low

## High（合并前应修）

### H1 `dingdong.conf:17` 正则用了 ECMAScript 不支持的原子分组
```
^https?:\/\/maicai\.api\.ddxq\.mobi\/homeApi\/(?>bottomNavi|homeFlowDetail) url script-response-body .../dingdong.js
```
`new RegExp()` 直接抛 `Invalid regular expression`（380 条规则里唯一一条编译失败，其余全部可编译）。QX 的脚本/匹配引擎同属 JavaScript 语义，`(?>` 不被支持，该条「首页推荐流 + AI 栏净化」规则永不生效。
> 建议：改 `(bottomNavi|homeFlowDetail)` 或 `(?:bottomNavi|homeFlowDetail)`，零语义损失。

### H2 `7mao.conf` 22 条启用规则里 12 条被前面的规则抢先命中
用显式样本 URL 按「自上而下首次命中即停止」实测（脚本：临时 `qx_shadow2.js`，可复现）：

| 被遮蔽规则 | 抢先命中者 | 后果 |
|---|---|---|
| L26 `book-store/reader-recommend` | L25 宽正则（同动作） | 无功能损失，重复声明 |
| L30 `v1/splash/index` 脚本改写 | L29 `v1/splash/` reject-dict | **开屏改写分支（`is_show_ad`、`vip_status`、`voice_free_chapter_count`）永不执行** |
| L33 `xiaoshuo/api/v1/user/red-point` reject-dict | L25 | 签到弹窗未阻断，改为 parse+stringify 空转 |
| L36 `xiaoshuo/api/v2/init` 脚本 | L25 | 同脚本，无损失 |
| L39 `book-shelf/operation`、L45 `api/v1/operation`、L51 `v4/search/dispose`、L57 `book-store/config`、L59 `push-book` | L25 | **5 条弹窗/运营位阻断全部退化为「不处理」**（脚本对这些路径没有分支） |
| L52 `v2/init/other-data` reject-dict | L25 / L36 | 同上 |
| L54 `v4/book/change` 脚本 | L25 | 同脚本，无损失 |
| L42 `api-cmnt` 本章说 | host 不在 `hostname`（不解密）+ L25 | 双重失效，规则是死的 |

唯一实际生效的 `red-point` 阻断是 L34（路径含 `/legacy/`，不被宽正则匹配）。
> 建议：把需要独立动作的具体规则上移到 L25 之前；或给 L25 加否定断言排除这些路径；并删除 L42 这类已确定不启用的死规则。

### H3 六个脚本的 `$done` 卫语句无效
`amap.js`、`cainiao.js`、`dingdong.js`、`jd.js`、`quark.js`、`zhihu.js` 开头均为：
```js
if (!$response.body) $done({});
let obj = JSON.parse($response.body);   // 仍然执行
```
`$done()` 不会终止后续代码，空响应照样进 `JSON.parse` 抛错。`7mao.js` 本轮已改成 IIFE 单出口（3 条互斥出口 + `return`，8 个 mock 用例实测每条路径 `$done` 恰好 1 次），其余 6 个同型未修。

## Medium

- **M1** 21 个 js 无 `try/catch`（`wb_ad.js` 15 处 `JSON.parse` 最密、`jd.price.js`/`wechat-url-unblock.js` 各 4 处）。实际暴露面取决于驱动正则的具体度——`adblock.conf:95` 虽长但高度具体，短期可接受；建议按 H3 的统一模板收敛。
- **M2** `7mao.conf:14`（`api-cfg.wtzw.com/v1/(adv|reward|operation|offline-adv)`）用硬 `reject`，与已改的 L17/L18 同类：广告 SDK 的 JSON 接口硬阻断易空指针，建议 `reject-dict`。
- **M3** `7mao.conf` 注释含变更史措辞「原先…从未生效」，被 `check_comment_conventions.py` 判 C2 违规（1 处）→ 改为现状陈述。
- **M4** `ximalaya.conf` 的 `hostname = *.xima*.*`、`*.xmcdn.*` 为跨级通配，QX 语义无文档依据；`spotify.conf` 规则正则覆盖 `*-spclient.spotify.com` 而 `hostname` 只列 `spclient.wg.spotify.com`，3 条脚本规则静默失效（与 H2 同型）。

## Low

- `apple-wloc.js` 71 处 `var`、`quark.js`/`wb_launch.js`/`pdd.js` 等仍用 `var`（规则清单「`var` 声明应用 const/let」）；纯风格，不阻塞。
- `wechat-url-unblock.js` 9 个 `$done` 分散在多层嵌套里，未逐个证明互斥性；低频解封脚本，建议人工过一遍。

## 误报甄别表（不计入 Issues）

| 命中 | 甄别依据 | 结论 |
|---|---|---|
| 手机号/身份证正则命中 `7mao.js` ×5、`apple.js` ×1 | 命中的是头像 URL `17085791857966659.png` 与 `purchase_date_ms` 毫秒时间戳 | 误报 |
| 「凭证赋值」命中 `spotify-proto.js:1` | 压缩 protobuf 库体内的 `function(...){...}` 片段 | 误报 |
| 通用遮蔽扫描器报 `adblock.conf:22/23`、`youtube.conf:6` | 合成样本时丢掉了 `(?!)` 否定前视与路径细节，导致规则连自己的样本都不匹配；实际 L22/23 在 L24 之前、L6 在 L7 之前 | 误报，改用显式样本后不成立 |
| `migu.js`、`taobao.js`、`ximalaya.js`、`douyin.js`、`spotify-proto.js`、`youtube.response.preview.js` | 已带 `try/catch` 或 `parse` 数与 `try` 数匹配 | 无需整改 |

## 未覆盖项（明确声明）

1. 未上机验证两条依赖假设：「QX 重写自上而下首次命中即停止」「`$done()` 不终止后续脚本」。H2/H3 的结论建立在这两点上，需在 QX 抓包实测（看 `book-store/config` 请求是收到空对象还是被脚本改写）。
2. `hostname` 与规则的实际解密覆盖，只手工核对了 `7mao.conf`；其余 27 个 conf 的 dead-MITM 面未逐条核对。
3. 未跑外部 linter（ESLint 等），未做 security / performance 专项。
4. `apple-wloc.js`、`amap.js`、`jd.js`、`jd.price.js`、`revenuecat.js` 等大文件未逐行深审。

## 决策性内容

评审确认了以下设计/决策，建议是否落 ADR？

- 同一模块内**规则顺序即优先级**：泛匹配/宽正则必须排在使用不同动作的具体规则之后，否则具体动作静默失效（H2 的根因）。
- 响应脚本的**单出口约定**：一次执行只调用一次 `$done`，卫语句必须伴随 `return` 或 else 分支（H3）。

是否要通过 `design-manager`（adr 模式）沉淀进 ADR 文档？[是 / 仅对话讨论不落盘 / 跳过]
