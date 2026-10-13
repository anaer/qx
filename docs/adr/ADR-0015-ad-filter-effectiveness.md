# ADR-0015: 广告拦截有效性与 filter_remote 重构

**状态：** 已接受
**创建时间：** 2026-10-13

> 当前状态 / 核心结论：`[filter_remote]` 已按「放行层 → 广告层 → 服务层」重排为 15 条（含 anti-AD 中文区补充源），fmz200 源移除、其 65 条高价值规则与开屏 SDK 38 条一并下沉本地，仅 Hijacking 一条开启 `inserted-resource`，全部改走 jsDelivr；剩余动作是推送后在 QX 内更新资源做真机验证。

## 背景

实测 `[filter_remote]` 的去广告效果受三重限制：其一，广告源之一的 fmz200 合集自 2026-06-04 未更新，且相对 Advertising 仅 143 条独有规则（其中含整站误封）；其二，12 条远程条目均未声明 `inserted-resource`，Advertising 的 486 条 IP-CIDR 与 Hijacking 的 42 条 IP-CIDR 被本地 `geoip, cn, DIRECT` 抢先命中而永不生效；其三，Advertising 以 287,031 行 / 11.7 MB 的规模开启 `opt-parser`，解析收益为零而增加更新耗时。

## 决策

1. **源结构按「放行 → 广告 → 服务」三段重排**：Direct（放行层）→ Advertising / Privacy / Hijacking（广告层）→ 服务类 7 条 → Proxy。顺序即优先级，放行层必须前置于广告层，否则其放行规则被广告规则抢先命中而失效。
2. **`inserted-resource` 只授予 Hijacking 一条源**。该源 42 条 IP-CIDR 全为大陆劫持站地址，不前置会被本地 `geoip, cn, DIRECT` 遮蔽，且它无需放行的域名，与本地规则零冲突。Advertising 与 Privacy **不授予**——实测二者的 `HOST-SUFFIX` 规则中含 `safebrowsing.googleapis.com`、`safebrowsing.urlsec.qq.com` 等必须放行的域名，一旦前置，本地放行规则即被抢先命中而静默失效；而二者 IP 类规则合计 500 条（占其 326,957 条的 0.15%），不足以抵偿放行能力的丧失与 `114.119.160.0/21` 这类网段的误杀风险。Direct 作为放行层同样不前置，其放行效力靠 `[filter_local]` 优先与 `[filter_remote]` 内出现顺序共同保证。
3. **fmz200 源移除，65 条高价值规则下沉 `[filter_local]`**。保留判据为「明确的广告子域」；排除整站误封（`iciba.com`、`docer.com`、`temu.com`、`rumble.com`）、Apple 与知乎的功能域、安全浏览域名、含下划线的畸形域名、Yahoo 等大陆不可达域，以及全部 IP 类条目。
4. **`opt-parser` 全部改为 `false`**：各源均为 QX 原生格式，资源解析器无收益。
5. **全部远程源改走 `cdn.jsdelivr.net`**；Advertising 更新间隔由 3 天缩短为 1 天。
6. **引入 Privacy 与 Hijacking，并在 `[filter_local]` 放行安全浏览域名**（`safebrowsing.googleapis.com`、`safebrowsing.urlsec.qq.com`）——拦截安全浏览 API 会削弱浏览器钓鱼防护。实测这两条在 Advertising 中为 `HOST-SUFFIX`、在 Privacy 与 Google 中为 `HOST`，因此放行必须同时覆盖 `HOST` 与 `HOST-SUFFIX` 两层，缺一层即被另一层抢先命中；同时这两个源不得前置。
7. **修复上游误收录**：`HOST,www.95599.cn` 被 Advertising 判为广告，在 `[filter_local]` 加同类型（`HOST`）的放行规则修正。放行层共 5 条规则、覆盖 3 个域名。
8. **加入 anti-AD（`anti-ad-quanx.txt`）作为中文区补充源**：101,817 条全为 `host-suffix` + `reject`，QX 原生格式、无需解析器，相对 Advertising 独有 12,291 条（12.1%）；其类型层级低于本地 `HOST` 规则，不会遮蔽放行层。上游 10,834 star、存续 10 年，满足 ADR-0003 的源门槛。
9. **开屏 SDK 专项 38 条内联进 `[filter_local]`**：取自 hwind2021 的 `Splash-Killer.list`（473 条），相对 `Advertising ∪ anti-AD` 的净增量为 45 条；剔除 6 条通用基础设施域后保留 39 条，再去除与既有下沉规则重复的 `ad.hicloud.com`，实际新增 38 条。

**不做什么**：不改 `[rewrite_remote]` 与 `[rewrite_local]`；不改 `[policy]` 策略组拓扑；不引入 `AdvertisingLite`（实测其已停更 10 个月）；不新建自建放行列表文件（放行由本地规则承担，避免引入自维护的远程依赖）；**不订阅 hwind2021 的列表**（该仓库 0 star / 0 fork / 创建仅 5 周，其「上游覆盖率 22%」的核心宣称经实测为 73%，无法复现）；**不阻断 HTTPDNS**（见「未解决风险」）。

## 后果

- **收益**：放行层修正上游误收录与误杀（`www.95599.cn` 与两条 `safebrowsing`）；Hijacking 的 42 条大陆劫持站 IP 规则恢复生效；规则更新链路脱离 `raw.githubusercontent.com` 单点；anti-AD 带来 12,291 条中文区独有域名，开屏 SDK 专项补 38 条主流 SDK 投放端点。
- **代价 / 权衡**：Advertising 的 486 条 IP-CIDR 与 3 条 IP6-CIDR 继续被本地 `geoip, cn, DIRECT` 遮蔽——这是为保住放行能力而支付的代价，两者互斥；规则总量由约 33.8 万条升至约 **44.0 万条（+30%）**，其中 anti-AD 贡献 101,817 条，而它相对 Advertising 的边际增量仅 12,291 条（**12.1%**），且这批独有域名中含较多长尾反查域（如 `1234.jjxgly.com`、`132.red-81-42-249.staticip.rima-tde.net` 这类动态子域），仅 13.3% 为 `.cn` 系后缀——这是本次改动中**性价比最低的一项**，若后续发现内存或启动耗时上升，应优先回退该源；`[filter_local]` 由 35 条增至 **143 条**，ADR-0010 的本地规则规模约束相应放宽。
- **未解决风险**：**HTTPDNS 未被阻断**——官方 `sample.conf` 证实域名级 REJECT 在 DNS 应答层实现（`dns_reject_domain_behavior` 的 `none` 取值被描述为「disable the DNS level rejection feature」），而该层的前提是 App 向 QX 发起 DNS 查询；国内 App 通过 HTTPDNS 取回广告域名 IP 后直接以 IP 建连，QX 无从应答，域名规则遂不生效。这是「域名规则已达 44 万条而效果仍不理想」的可能根因，未采纳的原因是阻断后 App 的 DNS 路径会改变，兼容性风险未经评估。**该论断的边界**：文档只证明了 DNS 层拦截会被绕过，未证明域名规则整体失效——若 QX 对 TCP 连接另有 SNI 嗅探兜底（文档未说明），则 App 只要发送 SNI 域名规则仍可匹配，HTTPDNS 的影响将显著小于上述推断，需真机抓包确认。其次是 Hijacking 的 42 条 IP-CIDR 含 `114.119.160.0/21`（2,048 个地址）等大陆网段，前置后将对整个网段 REJECT，误杀面未实测；jsDelivr 对本机可达但未在目标设备验证；放行层将 `safebrowsing.googleapis.com` 指向 DIRECT，若该域在用户网络下直连不可达，安全浏览仍是降级状态（此时应改指向 Google 策略组，而非退回 REJECT）。

## 证据分档

| 假设 | 档位 | 取证方式 |
|------|------|----------|
| `inserted-resource` 使远程规则排到本地规则之前 | **已证实** | QX 官方入门文档「注意本地与远程规则先后顺序问题」节，示例为本地 `geoip, cn, direct` 吞掉远程 `ip-cidr` |
| 规则类型优先级 HOST > HOST-SUFFIX > HOST-WILDCARD > HOST-KEYWORD > USER-AGENT > IP 类 | **已证实** | 同上文档「注意规则类型优先级问题」节 |
| `www.95599.cn` 当前已被 Advertising 的 HOST 规则拦截 | 未证实 | 依据规则类型优先级与上游规则文本（`HOST,www.95599.cn,Advertising` 存在）推断，未抓包确认 |
| 域名级 REJECT 在 DNS 应答层实现 | **已证实** | 官方 `sample.conf` 第 24 行：`dns_reject_domain_behavior` 取 `none` 时被描述为「disable the DNS level rejection feature」；同文件第 14 行载明 placeholder IP（198.18.0.0/15）映射机制，第 56 行载明「DNS 查询结果仅用于评估 filter」 |
| QX 对 TCP 连接做 SNI 嗅探以兜底域名匹配 | 未证实 | 官方文档未说明。`sample.conf` 第 363–364 行「命中 `skip_src_ip`/`skip_dst_ip` 则 hostname 不被评估」反向暗示默认会评估 hostname，但该表述位于 `[mitm]` 章节，**不能外推至 filter 层** |

## 实施位置

- 已落地：`qx.conf#filter_remote`（15 条源与参数，含 anti-AD）、`qx.conf#filter_local`（143 条：误收录放行层 5 条、fmz200 广告下沉 65 条、开屏 SDK 38 条、既有 35 条）
- 待对齐：无

## 关联文档

- [ADR-0003: 远程规则源选择](ADR-0003-remote-rule-source.md) —— 本 ADR 直接修订其源清单、引用通道、更新间隔与新增源门槛
- [ADR-0010: 本地分流规则设计](ADR-0010-local-filter-rules.md) —— 本 ADR 直接修订其本地规则的层数与规模约束
- [ADR-0013: QX 运行时语义假设与保守落地](ADR-0013-qx-runtime-assumptions.md) —— 本 ADR 的 `inserted-resource` 顺序依赖该 ADR 记录的运行时假设

## 下一步

推送后在 QX 内更新全部资源，验证四件事：① 更新是否成功（判断 jsDelivr 在目标设备是否可达，anti-AD 单文件 3.88 MB）；② 农行等被误收录域名是否已放行；③ Hijacking 的 IP-CIDR 生效后有无正常站点被误杀；④ 规则总量升至 44 万条后 QX 的内存占用与启动耗时是否可接受——若明显劣化，优先回退 anti-AD。
