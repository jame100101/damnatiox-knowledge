# Java 基础推荐阅读

基础部分按“语言规范与教程 → API → JVM/工具 → 课件实践”的顺序学习。JDK 25 LTS 用作主线，JDK 26 用于核验最新标准 API 与功能版本差异。

## 官方资料优先顺序

- [Dev.java Learn](https://dev.java/learn/)
- [Java SE 26 API](https://docs.oracle.com/en/java/javase/26/docs/api/)
- [Java Language Specification 26](https://docs.oracle.com/javase/specs/jls/se26/html/)
- [Java Virtual Machine Specification 26](https://docs.oracle.com/javase/specs/jvms/se26/html/)
- [Java SE 26 Core Libraries Guide](https://docs.oracle.com/en/java/javase/26/core/java-core-libraries1.html)
- [OpenJDK JDK 25](https://openjdk.org/projects/jdk/25/)

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
