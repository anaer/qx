# ADR-0014: 咪咕音乐开屏阻断与 listen-url 降级集成

**状态：** 已接受
**创建时间：** 2026-10-09

> 当前状态 / 核心结论：开屏改为「conf 直接 reject + 脚本兜底」双层阻断，并集成 Mikephie 脚本的 listen-url v2.4 降级；播放链路待真机验证。

## 背景

咪咕音乐开屏广告仍在出现。横向对比同源脚本 `Mikephie/Script/qx/migumusic.js`（来源链接已记入 `rewrite/migu.conf` 头部）：与本仓分支约九成相同，真正增量仅两处；GitHub 全网均无 `column/marketing/advertising` 的处理规则，开屏接口真身待抓包确认。

## 决策

1. `rewrite/migu.conf` 新增 listen-url `v2.5 → v2.4` 的 302 降级：与已注释的请求头改写止血机制不同，播放链路须真机验证一次，异常即删行回退。
2. 开屏双层阻断：conf 对 `column/start(-)?up-pic` 直接 reject（与本文件 `watch-ad reject-200` 同为广告素材下发，非内容型接口，符合 ADR-0012 分级精神），脚本路由与 `migu.js` 分支同步放宽为 `start(-)?up` 族，覆盖连字符变体与非 pic 开屏路径；仅放宽路由不放宽脚本分支等于空转，故两处同步改。
3. 不集成 Mikephie 的 TG 频道注入与推广通知；不复制其 request-header 启用（维持本仓止血注释）。
4. conf URL 正则字面点统一转义（域名/路径/版本号点，含注释态规则）：ICU 语义下 `\/` 与 `/` 等价、转不转义均可，影响匹配的只有字面点；斜杠转义维持现状不重排。`migu.conf` 先行，同类问题已按同一约定扫清其余 7 个 conf 共 22 处。

**不做什么**：`marketing/advertising` 仍无处理（全网盲区，待抓包 HAR）；`qx.conf` 咪咕模块 `enabled=false` 状态不在本次范围。

## 实施位置

- 已落地：`rewrite/migu.conf#listen-url`（302 行）、`rewrite/migu.conf#start`（开屏 reject 与 script 正则）、`rewrite/migu.js#/column/start`（分支条件）

## 关联文档

- [ADR-0012: rewrite MITM 收口与 reject 分级](ADR-0012-rewrite-mitm-scope-and-reject-tiering.md) —— 规则顺序即优先级、reject 分级的约束来源

## 下一步

真机验证：听歌一次（v2.4 降级）+ 冷启动看开屏；播放异常删 302 行，开屏仍出现则抓包定位真实接口。
