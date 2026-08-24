# Spring Cloud Compatibility Matrix 与升级检查

> **Freshness metadata**
> - `last_verified`: `2026-08-24`
> - `version_scope`: `verified 2026-08-24`
> - `source_type`: `official-compatibility-table`
> - `stability`: `fast-moving`

| Spring Cloud train | Spring Boot line | Java | 状态/说明 |
|---|---|---|---|
| 2025.1 Oakwood | 4.0.x | 17+（Boot 实际项目可选 25） | 官方 Supported Versions 当前支持列 |
| 2025.0 Northfields | 3.5.x | 17+ | 仍需逐次检查 OSS support 页面 |
| Spring Cloud Alibaba 2025.1.x | Cloud 2025.1.x / Boot 4.0.x | 17+ | 官方仓库分支说明；不是所有项目默认依赖 |

Spring Boot 4.1.x 已 GA，但截至本次验证，Spring Cloud 官方 matrix 的 Oakwood 列仍对应 Boot 4.0.x。因此 Cloud 项目不要只升级 Boot 到 4.1 后假设兼容。

## Upgrade gate

1. 读取 Boot/Cloud/Alibaba release notes 与 support/EOL；
2. 检查 CVE、deprecated/removed module、Jakarta/Servlet/Jackson 等基础变化；
3. 用 BOM，不逐个覆盖 Cloud 组件版本；
4. 核对 Nacos/Sentinel/Seata/SkyWalking/OpenFeign/Gateway 的自身支持矩阵；
5. contract/integration/load/failure tests；
6. canary、observability、rollback 与数据库兼容。

Nacos、Sentinel、Seata 和 SkyWalking 是可选生态组件，不是 Spring Cloud 或所有微服务的默认组成。

## 官方来源

- [Spring Cloud Supported Versions](https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions)
- [Spring Cloud Alibaba repository](https://github.com/alibaba/spring-cloud-alibaba)
