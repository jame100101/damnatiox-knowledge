# Linux、Shell 与 Docker：运行 Java 服务的基础环境

Java 服务最终运行在操作系统进程、文件系统、网络和资源限制中。Shell 与容器只是控制这些边界的工具。

## 1. 本文覆盖范围

- Linux 文件、权限、进程、信号、网络与日志
- Shell 变量、引用、管道、退出码、流程与函数
- Docker 镜像、容器、网络、卷、Compose 与多阶段构建
- Java 进程信号、优雅停机和容器资源感知

## 2. 核心知识详解

### 1. 文件、权限与进程

Linux 一切以文件描述符和进程为核心。r/w/x 对普通文件和目录含义不同；进程具有 PID、用户、环境、工作目录、打开文件和信号处理。

- 掌握 `ls/find/grep/sed/awk/tail/less/ps/top/ss/lsof/journalctl` 的诊断用途。
- 服务使用专用低权限用户，数据、配置、日志分别授权。
- SIGTERM 触发优雅停机，SIGKILL 没有清理机会。

**正确性边界：** chmod 777 不是权限问题的通用处理；要检查所有者、组、目录执行位、ACL 和挂载选项。

### 2. Shell 安全与退出码

Shell 会经历变量展开、命令替换、通配和分词。双引号保留一个参数并展开变量，单引号禁止展开；`$?`/退出码表达命令结果。

- 脚本使用 `set -euo pipefail` 时仍需理解每个语义和例外。
- 变量引用写成 `"$value"`，文件名用 `--` 与参数分离。
- 临时文件用 mktemp，清理用 trap，密钥避免命令行和日志。

**正确性边界：** 把未经验证文本拼入 `sh -c` 会造成命令注入；参数数组和固定命令结构更可靠。

### 3. 镜像、容器、卷与网络

镜像是只读分层模板，容器是其运行实例；容器可写层不是持久数据方案。volume 管理数据，network 提供服务间连接，registry 分发镜像。

- 镜像固定 digest/版本，使用非 root 用户和只读文件系统。
- 配置与密钥通过运行时注入，不烘焙进镜像层。
- Compose 定义多容器服务、网络、卷、健康检查和依赖。

**正确性边界：** 容器不是虚拟机；其进程共享宿主内核，资源和安全隔离取决于命名空间、cgroup 与配置。

### 4. Java 多阶段镜像与优雅停机

builder 阶段编译测试，runtime 阶段只复制制品与所需运行时，可使用 jlink 缩减模块。PID 1 必须正确接收/转发信号，Spring Boot 需要配置优雅停机和探针窗口。

- 使用固定基础镜像、`.dockerignore` 和可重现构建。
- 设置 JVM 内存百分比与容器 limit，保留 native/metaspace/thread 余量。
- 停机先停止接流量，再等待在途请求，最后关闭池和连接。

**正确性边界：** 只把 `-Xmx` 设置等于容器内存上限会忽略非堆内存，容易触发容器 OOMKill。

## 3. 工程链路

```mermaid
flowchart LR
  A["源码"] --> B["Builder 镜像编译测试"]
  B --> C["Runtime 镜像"]
  C --> D["非 root 容器"]
  D --> E["健康检查 + 资源限制"]
  E --> F["SIGTERM 优雅停机"]
```

## 4. 实践与验证

1. 为 Spring Boot 服务写多阶段 Dockerfile，并以非 root、只读根文件系统运行。
2. 写 Shell 健康检查脚本，正确传播退出码并处理带空格参数。
3. 向容器发送 SIGTERM，验证停止接流量与请求排空顺序。

## 5. 掌握检查

- [ ] 能用 Linux 工具定位端口、进程、文件句柄和日志。
- [ ] 能解释 Shell 引用、管道和 pipefail。
- [ ] 能区分镜像、容器、卷和网络。
- [ ] 能计算 Java 容器的堆与非堆预算。

## 参考资料

- [Docker Overview](https://docs.docker.com/get-started/docker-overview/)
- [Docker Compose Model](https://docs.docker.com/compose/intro/compose-application-model/)
- [GNU Bash Manual](https://www.gnu.org/software/bash/manual/)
- [Spring Boot Efficient Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/efficient-images.html)
