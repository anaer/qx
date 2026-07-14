# ADR-0005: DNS 配置策略

**Status:** Accepted
**Date:** 2026-07-14

**Context:**

DNS 解析影响网络延迟和分流准确性。Quantumult X 支持多种 DNS 模式和上游配置，需要选择合适的 DNS 策略来兼顾速度、安全和分流需求。

**Decision:**

采用多上游并发 + DoH3 优先的策略：

```
[dns]
no-ipv6              # 禁用 IPv6，避免双栈解析引入延迟
no-system            # 禁用系统 DNS，完全由 QX 控制

# 全球 DNS 并发
server=8.8.8.8       # Google DNS
server=1.1.1.1       # Cloudflare DNS

# 国内 DNS 并发
server=119.29.29.29  # DNSPod
server=223.5.5.5     # AliDNS

# 特定域名使用指定 DNS（减少跨域解析延迟）
server=/*.taobao.com/223.5.5.5
server=/*.jd.com/119.28.28.28
server=/*.qq.com/119.28.28.28
# ...
```

通过 `dns_exclusion_list` 排除局域网和关键检测域名（不使用 fake-ip），`circumvent-*` 用于应对 DNS 劫持。

**Consequences:**

- 多上游并发返回最快结果，兼顾国内外访问速度
- 国内大厂域名指定国内 DNS，避免 GeoDNS 将域名解析到海外 IP
- DoH3（HTTP/3 DNS-over-HTTPS）提高 DNS 安全性和抗干扰能力
- 禁用系统 DNS 和 IPv6 减少了不确定性，但也会失去 IPv6 直连的能力
