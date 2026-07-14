# ADR-0004: 重写模块组织

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

重写规则是 Quantumult X 去广告和功能增强的核心。每个 APP 需要 URL 匹配规则（.conf）和可能的脚本逻辑（.js）。随着支持的 APP 增多，文件管理方式对可维护性影响很大。

**Decision:**

采用 **一对 APP 一对文件** 的粒度：每个 APP 或服务独立一个 `.conf` 文件（声明 URL 匹配规则），如有脚本逻辑则附带对应 `.js` 文件。

```
rewrite/
├── taobao.conf  + taobao.js     # 淘宝
├── jd.conf      + jd.js         # 京东
├── wechat.conf  + wechat.js     # 微信
├── spotify.conf + spotify-*.js  # Spotify（含多个脚本）
└── ...                          # 约30对
```

按功能区域分组引用：
1. 广告净化（adblock.conf 等）
2. APP 专项优化（淘宝、京东、抖音等）
3. 会员解锁（Spotify VIP）

**Consequences:**

- 单个文件短小专注，便于排查和单独更新
- 新增 APP 支持只需创建一对文件，不干扰已有配置
- 远程引用 URL 达到约 25+ 条，重写更新时需全部拉取
- 部分 APP 的 `.conf` 和 `.js` 之间有隐含依赖，需保持配对同步
