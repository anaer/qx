# 全量 JS 代码质量评审（2026-10-09）

**模式**: review-pipeline / review（指定路径、无变更基准）
**范围**: 仓库全部 50 个 `.js`（`rewrite/` 36、`task/` 10、`general/` 4），合计约 694 KB
**规则配置**: `sha256:2bed64cb922060527607cecd5c9b2eb5debd3c2d0727841f1e3294a6ed8604bb`（group1 `javascript-typescript.md` → 50 个文件，`excluded_files: 0`）
**覆盖率**: 深审 50/50 —— 44 个按语言清单逐文件精读（4 个批次），6 个 minified/vendored 走契约+移植完整性+崩溃面专项；机械检查全量覆盖
**问题**: 0 critical（启用状态下），9 high，11 medium，6 low；另有 3 条 high 级安全项位于未启用脚本

## 关键前置事实：启用状态决定严重等级

机械核对 `qx.conf` 的 `enabled=` 与每个 `.conf` 内规则行的注释状态后：

| 状态 | 数量 | 说明 |
|---|---|---|
| 挂在**启用**模块上的脚本 | 20 | 12306、apple、apple-tf-download、apple-wloc、baidu-no-redirect、cainiao、cainiao-header、caiyun、caiyun-header、dingdong、jd、jd.price、quark、revenuecat×2、spotify×3、taobao、wb_ad、wb_launch、wechat-url-unblock |
| 挂在**模块 enabled=false** 上的脚本 | 15 | 7mao、amap、douyin、duolingo、ical、migu、pdd、qidian、ximalaya、youtube.response.preview、zhihu 等 |
| **无任何启用挂载**（含纯注释挂载） | 14 | `task/` 除 traffic_check 外全部、`general/` 全部、adsense、apple-tf-keys、wechat.js |
| `task/` 唯一启用 | 1 | traffic_check.js（`qx.conf:239`） |

`general/*.js` 对应的三条 `geo_location_checker` 在 `qx.conf:24-26` **全部是注释状态**；`resource-parser.js` 是上游 KOP-XIAO 解析器的本地副本，`qx.conf:19` 实际引用的是上游地址，本地这份无启用挂载。

> 结论：未启用脚本的缺陷仍要修（它们随仓库发布、用户一开就生效），但不阻断当前使用；下文按此分两组。

## High —— 启用中模块

### H1 `rewrite/quark.js:30`（quark 模块启用）路径遍历不支持数组下标，11 条广告删除静默失效
`pathsToDelete` 里 `result.cms_quark_pan_scene.res_data.data[0].items[39]` 之类的路径按 `.` 切分后，用键 `"data[0]"` 去索引数组必然 `undefined` → `break`。
端到端探针实测（构造真实嵌套结构喂给脚本）：`items` 剩余键 `4,5,6,39,40,41,52` —— 期望删除的 7 项**一个都没删掉**；同一次运行里普通路径项 `cms_cloud_drive_user_banner`、`noah_search_mid_ad_enable` 正常删除，证明根因就是下标语法而非数据形状。
> 建议：遍历支持 `a[b]` 下标，或把这些路径改写成先取 `res_data.data` 再 `items[n]` 的特判。

### H2 `rewrite/cainiao.js:9`（启用）三组重复条件使后半部分支永不可达
`nbfriend.message.conversation.list`、`nbpresentation.pickup.empty.page.get`、`nbpresentation.protocol.homepage.get` 在同一个 `else if` 链里各出现两次（L9/L126、L13/L133、L28/L148），首次命中在前 → L126 之后的新版实现全部不可达；实际执行的是前面**无判空**的旧版（`obj.data.data`、`i.template.name`）。
> 建议：删除旧版分支，保留带 `?.` 判空的新版。

### H3 `rewrite/caiyun.js:69`（启用）双层结构未校验
`obj.data = obj.data.filter(e => -1 != e.category_times_text.indexOf("人查看"))` —— `data` 非数组或元素缺字段即抛；该脚本其余分支（含 VIP 相关）在同一次执行里，一处抛错全部失效。
> 建议：`Array.isArray(obj?.data)` + `e?.category_times_text ?? ""`。

### H4 `rewrite/caiyun-header.js:5`（启用）硬编码 JWT 注入真实请求
```js
const cyTK = "eyJhbGciOiJIUzI1NiIs…"; header["device-token"] = cyTK; header["Authorization"] = "Bearer " + cyTK;
```
解码 payload：`{"user_id":"5f5bfc57d2c6890014e26bb8","svip_expired_at":1705331166.416771,"vip_expired_at":0}`（2024-01-15 已过期）。这是把**他人账号凭据**写进公开仓库并在每条命中请求上冒用；`caiyun.conf:7` 确认该规则启用。
> 建议：从仓库移除并改由 `$prefs`/BoxJS 存储读取；已提交的凭据视为已泄露。

### H5 `rewrite/spotify-proto.js:19,26,35`（启用）脚本逻辑零异常保护
protobufjs 库体自带 7 处 `try`，但脚本自身那段（深链 `bootstrapResponseObj.ucsResponseV0.success.customization.success.accountAttributesSuccess`、`ucsResponseWrapperMessage.success.accountAttributesSuccess`，以及 `body.buffer` 的使用）没有任何 try/判空，异常逃出 → `$done` 永不调用 → 请求挂起。
> 建议：脚本段套 try 并兜底 `$done({})`。

### H6 `rewrite/wechat-url-unblock.js:74`（启用）`$done` 双出口 + async 逃逸
`$done(redirect)` 之后没有终止，继续执行到后面的 `$done({})`；本会话给文件加的顶层 `try` 只覆盖同步路径，`await get(url).then(...)` 回调内的 `JSON.parse(resp.body)`、`.exec(...)[1]`、`Base64.decode` 异常仍会逃逸（无 `.catch`）。
> 建议：改为互斥出口（else / 单一出口函数），异步链补 `.catch` 兜底 `$done({})`。

### H7 `rewrite/jd.price.js:108`（启用）外部输入进入 `eval`
`eval(result[1])` —— 被 `jd.conf:4` 命中的京东响应内容直接进入 `eval`；同一脚本 `$task.fetch().then` 回调内的 `JSON.parse(data)`、`data.PriceRemark.Tip` 亦无保护。
> 建议：`eval` 改 `JSON.parse` + 判空（这是安全项，`security` 专项会单独评级）。

### H8 `rewrite/wb_ad.js:124-140`（adblock 启用）规则匹配面小于脚本假设
`path24`~`path30`（`container_timeline`、`finder`、`messageflow` 等）在 `adblock.conf:95` 的正则里找不到（已 grep 验证无命中）→ 这些分支是死代码，微博搜索/通知/容器时间线广告并未被过滤。
> 建议：把这些接口补进规则正则，或删除死分支以免误以为已生效。

### H9 `rewrite/7mao.js:31-175`（模块 enabled=false）分支链在本会话的重写中落在 try 之外
本会话给 `7mao.js` 加的保护只覆盖 `JSON.parse`（L23-25）与 `JSON.stringify`（L177-179），中间 145 行分支链裸奔；L116 `func.list.filter(...)` 在 `list` 缺失时抛错会逃出 IIFE，`$done` 一次都不调 → 请求挂起。**这是我本轮改动遗留的缺陷，违反本次写下的 ADR-0012 决策 4。**
> 建议：分支链并入同一 try 兜底（与其它 21 个脚本一致）。

## High（未启用脚本内，随发布仍会被他人触发）
- `task/NodeLinkCheck.js:2`：`url = 'http://ip-api.com/json/' + (节点server) + '?lang=zh-CN'` —— 明文 HTTP 把**节点真实服务器地址**发给第三方。已核代码属实；`qx.conf:246` 该任务为注释状态。
- `task/streaming-ui-check.js:211,524`：硬编码 Disney `Authorization` token 与含 `st=` 的第三方 cookie；`:516,:535` 两处 `verify: false` 禁用 TLS 校验。*(代理报告，我未逐行复核)*
- `rewrite/migu.js:4,13`：`headers.uid = "914537623…"` 硬编码账号 ID（migu 模块 disabled，且对应 request-header 规则 `migu.conf:21` 已注释）。

## Medium（启用中）
- `rewrite/baidu-no-redirect.js:9,15`：`console.log` 打印含 `tokenData` 的完整 URL 到 QX 日志（已复核）。
- `rewrite/revenuecat.js:200`：UA 用 `ua.includes(e)` 取首个命中，匹配过宽易把无关 App 判成目标；`:181` `ua` 可能 undefined 直接 `.includes`；`:203` 写 `obj.subscriber.subscriptions[s]` 前未判 `obj.subscriber`。*(未逐行复核)*
- `rewrite/taobao.js`、`rewrite/apple-wloc.js`：契约核对未发现运行期缺陷；`apple-wloc.js:1-4` 头注释称 `$response.body` 是 base64，实现读 `$response.bodyBytes` 并注明 ArrayBuffer，`base64ToBytes/bytesToBase64` 在运行路径零调用 —— 注释自相矛盾且 base64 段是死代码。
- `general/resource-parser.js:342+347`：双 `$done`（该文件无启用挂载，实际生效的是上游副本）。

## Medium（未启用脚本内）
- `general/IP33.js:1-6`、`IP_API.js:1-3`、`IP_bili_cn.js:1-3`、`realip.js:1-3`：`$done(null)` 后无终止，非 200 时继续 `JSON.parse($response.body)` → 双 `$done` + 崩溃。
- `task/traffic_check.js:145-147`（**唯一启用的任务**）：`$done({…, htmlMessage})` 后无条件再 `$done()`。*(未逐行复核，启用状态下值得优先确认)*
- `task/geo_location.ip.sb.js:36-38`：`JSON.parse(cnt)` 无 try、`cnt['country_code']` 未判空，then 内无 catch → `$done` 不执行。
- `task/streaming-ui-check.js:557`：`console.log("GetToken-Error"+reason)` 中 `reason` 在该分支未定义 → ReferenceError；`:151` finally 引用仅存在于回调闭包的 `output`，且 `:118/:142` 已各自 `$done`。*(未逐行复核)*
- `task/switch-check-google.js:200`：`//timeout: 3000` 被注释，无超时；`:222-226` `reject("Error")` 无人 catch。
- `rewrite/duolingo.js:5-6`：`$response.body` 未判空未 try 直接 `.replace`。
- `rewrite/zhihu.js:74`：`delete obj;` 删的是绑定本身（非严格模式下是空操作），悬浮蛋未移除；`:147` 回调参数是 `i` 却写 `item.fields.header.url` → ReferenceError。
- `rewrite/qidian.js:108`：`body.Data.ActivityIcon.Actionurl` 与同文件 `:43` 的 `ActionUrl` 大小写不一致，`delete` 空操作。
- `rewrite/ximalaya.js:32`：`data.header?.length <= 1` 把空数组也放进分支，随后 `header[0].item…` 抛错。

## Low
- `rewrite/ximalaya.js:41`：`delete data.header[0]` 在数组上留空洞，序列化出 `[null,…]`，应 `splice`。
- `rewrite/adsense.js:20,48` 等：打印完整响应体；`qidian.js` 同型 7 处。
- `rewrite/revenuecat.rmheaders.js:1`：名为 `setHeaderValue` 实为置空而非删除。
- `rewrite/caiyun.js:43`：`&type_id=A03&` 尾锚定导致参数在末位时不命中，落入 else 清空全部 activities，与注释意图不符；`:79-87` 硬编码 2024-07 暴雨文章覆盖 banners（内容已过期）。
- `task/Net_Speed.js:48-59`：`shifts[b]` 索引与颜色/图标映射错位。

## 误报甄别与自我修正（不计入 Issues）
| 命中 | 甄别依据 | 结论 |
|---|---|---|
| 「spotify-proto.js 全文件无 try」 | 机械统计 try=7，但全部位于 protobufjs 库体（前 87 行单行压缩体），脚本段确实无保护 | 表述修正，不影响结论 |
| 「50 个 js 全部被引用，无孤儿」 | 首轮脚本用整文件文本匹配，把**注释行**也算成引用 | 误报，已用挂载状态表重算：14 个无启用挂载 |
| 「wechat.js 是死代码」 | `wechat.conf:5` 规则确为注释，但同模块 `wechat.conf:8` 启用并挂载 `wechat-url-unblock.js` | 仅 `wechat.js` 本体无挂载，成立 |
| 「明文 http 属高危」 | `qx.conf:24-26` 三条 `geo_location_checker` 全为注释 | 当前不生效，降为脚本内硬编码问题 |
| 压缩脚本的 `runScript` 明文 `http://${host}/v1/scripting/evaluate` | 出自 BoxJS 兼容层 `Env`，目标是本机服务且仅在配置了 BoxJS 时触发 | 信息项，不计缺陷 |

## 未覆盖项（明确声明）
1. **未跑外部 linter**（ESLint 等），未执行 `security`/`performance` 专项；H7 的 `eval`、H4 的凭据入库按 `security` 口径应单独定级。
2. 标注「未逐行复核」的 9 条（集中在 `task/streaming-ui-check.js`、`task/switch-check-google.js`、`revenuecat.js`、`traffic_check.js`）来自批次代理，我未独立取证，采信度低于其余条目。
3. QX 真机语义仍未验证：`$done` 是否终止执行（沙箱已反证「不终止」）、异常/挂起在 App 内的实际表现。
4. `general/resource-parser.js` 与上游只比对了体量（本地 3940 行 / 197 KB vs 上游 5657 行 / 265 KB，上游 URL 实测 200），未 diff 内容，落后程度未知。
5. 未审查 `.conf` 规则与脚本之间的**响应类型**契约（如脚本按 JSON 解析、服务端实际返回 protobuf 的接口），需抓包样本。

## 决策性内容

评审确认/触发了以下设计级事项，建议是否落 ADR？

- **启用状态是严重度的一部分**：本仓库脚本随 `enabled=false` 的模块发布，缺陷分级必须注明挂载状态，否则「高危」会被误读为「当前正在坏」。
- **跨端兼容层（BoxJS/Env）与 vendored 解析器的处置边界**：`general/resource-parser.js` 本地副本无引用、`spotify-proto.js` 库体与脚本段混排，需要一条「第三方副本是否跟随上游」的决策。
- **凭据不得入库**：`caiyun-header.js` 的 JWT、`migu.js` 的 uid 属既有违规，需要明确「改由 prefs 读取」的约定与清理动作。

是否通过 `design-manager`（adr 模式）沉淀？[是 / 仅对话讨论不落盘 / 跳过]
