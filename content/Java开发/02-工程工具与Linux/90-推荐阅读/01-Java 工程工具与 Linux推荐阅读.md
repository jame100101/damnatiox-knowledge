# Java 工程工具与 Linux推荐阅读

从开发机到 CI 和生产环境，工具链必须可复现、可诊断、可回滚。

## 官方资料优先顺序

- [IntelliJ IDEA Documentation](https://www.jetbrains.com/help/idea/getting-started.html)
- [Apache Maven Guides](https://maven.apache.org/guides/)
- [Gradle User Manual](https://docs.gradle.org/current/userguide/userguide.html)
- [Pro Git](https://git-scm.com/book/zh/v2)
- [Docker Documentation](https://docs.docker.com/)
- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/)

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
