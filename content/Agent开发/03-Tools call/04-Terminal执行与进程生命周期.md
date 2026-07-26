# Terminal 执行：从命令请求到可验证的进程结果

Terminal 是 Coding Agent 最常用、也最容易被低估的工具。它不是“把一段字符串交给 shell”，而是一个受约束的 **OS 进程执行器**：接收结构化请求，创建子进程，持续消费输出，处理超时与取消，最后返回可审计结果。

## 1. Terminal Tool 的职责边界

模型负责选择“运行什么以及为什么运行”，Terminal Executor 负责“如何可靠地运行”：

```mermaid
flowchart LR
  M["模型生成 CommandRequest"] --> V["参数、路径、权限与预算校验"]
  V --> S["spawn 子进程"]
  S --> O["并发消费 stdout / stderr"]
  O --> X{"进程状态"}
  X -->|正常退出| N["归一化 ProcessResult"]
  X -->|超时或取消| K["终止进程树并 wait"]
  K --> N
  N --> A["Agent 观察、判断与验证"]
```

Terminal Tool 不负责替 Agent 判断任务是否完成。`npm test` 的退出码为 `0` 只证明这条命令按其自身约定成功结束；Agent 仍要检查测试范围、产物、工作区 diff 和用户成功标准。

## 2. 不要只传一个 `command` 字符串

一个适合 Agent 的请求契约应显式表达执行语义：

```ts
type CommandRequest = {
  executable: string
  args: string[]
  cwd: string
  env?: Record<string, string>
  stdin?: string
  timeoutMs: number
  maxOutputBytes: number
  expectedExitCodes?: number[]
  shell?: false | { executable: string }
  sideEffect: 'read' | 'write' | 'network' | 'process'
}
```

关键字段的含义：

- `executable + args`：默认使用参数数组，参数边界由进程 API 处理，不依赖手工引号拼接。
- `cwd`：本次命令的工作目录，必须在运行前解析和校验；不要继承一个未知的全局当前目录。
- `env`：以最小环境或显式增量方式构造，敏感变量只在需要时注入，也不回显到 trace。
- `stdin`：明确是一次性输入、交互流还是关闭状态。许多命令会在 stdin 未关闭时一直等待。
- `timeoutMs`：从进程创建、运行到清理的预算；超时状态要与普通非零退出分开。
- `maxOutputBytes`：限制内存中的输出；完整日志可落到 artifact，模型只接收有界摘要。
- `shell`：默认关闭。只有管道、重定向、通配符等确实需要 shell 语法时才显式开启。

“可执行文件不存在”“进程成功启动后返回 2”“被取消”“输出解码失败”是四类不同结果，不应都折叠成 `COMMAND_FAILED`。

## 3. 完整进程生命周期

### 3.1 启动前

1. 规范化 `cwd`，确认目录存在；
2. 解析可执行文件，记录最终命中的路径与版本；
3. 校验参数数量、长度和策略；
4. 构造允许继承的环境变量；
5. 分配 `process_id`、deadline、日志游标和取消信号；
6. 在真正创建进程前记录 `process.starting` 事件。

### 3.2 运行中

1. 创建子进程并立即记录 OS PID；
2. **同时**读取 stdout 与 stderr，避免任一管道写满后阻塞子进程；
3. 按字节计数，执行输出上限、分块解码和脱敏；
4. 接收用户取消或上层 deadline；
5. 对长任务周期性发出 heartbeat、增量输出和资源使用事件。

### 3.3 结束与清理

1. 获取退出码或终止信号；
2. 等待输出管道关闭并刷新解码器；
3. 超时时先发送温和终止，再在 grace period 后强制结束整个进程树；
4. 等待进程真正被回收，避免僵尸进程或后台孙进程残留；
5. 生成不可变的 `ProcessResult`；
6. 由上层选择 `read_file`、`git diff`、测试报告解析器等验证副作用。

在 Node.js 中，`exit` 表示子进程已经结束，但 stdio 仍可能有未消费数据；`close` 会在 stdio 关闭后触发。因此归一化结果通常应等待 `close`。Python 的 `subprocess.run()` 适合短命令；更复杂的流式场景使用 `Popen`。Rust 的 `Command::output()` 同样适合有界的一次性输出，长任务应使用 `spawn()` 后持续读取。

## 4. ProcessResult：不要把所有内容拼成一段文本

```json
{
  "ok": false,
  "process_id": "proc_01J...",
  "pid": 18420,
  "executable": "npm.cmd",
  "args": ["run", "test"],
  "cwd": "D:/repo",
  "exit_code": 1,
  "signal": null,
  "timed_out": false,
  "cancelled": false,
  "spawn_error": null,
  "stdout": "...",
  "stderr": "...",
  "stdout_truncated": false,
  "stderr_truncated": true,
  "duration_ms": 8421,
  "started_at": "2026-07-26T08:00:00.000Z",
  "finished_at": "2026-07-26T08:00:08.421Z",
  "artifacts": [{ "type": "log", "ref": "artifact://proc_01J/stderr" }]
}
```

推荐的 `ok` 定义是：进程成功创建、没有超时或取消、退出码属于 `expectedExitCodes`。不要用“stderr 非空”判断失败：许多工具会把进度、警告甚至正常信息写入 stderr。

## 5. 一次性命令的多语言实现

下面示例都采用参数数组、显式工作目录、分离 stdout/stderr 和超时。真实 Harness 还应补充输出上限、取消、进程树清理和敏感字段脱敏。

```python group=terminal-run label=Python
from pathlib import Path
import subprocess

def run_checked(executable: str, args: list[str], cwd: Path) -> dict:
    completed = subprocess.run(
        [executable, *args],
        cwd=cwd,
        shell=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
        check=False,
    )
    return {
        "ok": completed.returncode == 0,
        "exit_code": completed.returncode,
        "stdout": completed.stdout,
        "stderr": completed.stderr,
    }
```

```rust group=terminal-run label=Rust
use std::{io, path::Path, process::Command};

fn run_checked(executable: &str, args: &[&str], cwd: &Path) -> io::Result<()> {
    let output = Command::new(executable)
        .args(args)
        .current_dir(cwd)
        .output()?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    println!("ok={} code={:?}", output.status.success(), output.status.code());
    println!("stdout={stdout}\nstderr={stderr}");
    Ok(())
}
```

```javascript group=terminal-run label=JavaScript
import { spawn } from 'node:child_process'

export function runChecked(executable, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const stdout = []
    const stderr = []
    child.stdout.on('data', (chunk) => stdout.push(chunk))
    child.stderr.on('data', (chunk) => stderr.push(chunk))
    child.once('error', reject)
    child.once('close', (code, signal) =>
      resolve({
        ok: code === 0,
        exitCode: code,
        signal,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      }),
    )
  })
}
```

```typescript group=terminal-run label=TypeScript
import { spawn } from 'node:child_process'

type ProcessResult = {
  ok: boolean
  exitCode: number | null
  signal: NodeJS.Signals | null
  stdout: string
  stderr: string
}

export function runChecked(
  executable: string,
  args: string[],
  cwd: string,
  signal: AbortSignal,
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      signal,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk))
    child.once('error', reject)
    child.once('close', (exitCode, processSignal) =>
      resolve({
        ok: exitCode === 0,
        exitCode,
        signal: processSignal,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      }),
    )
  })
}
```

## 6. 长运行命令：启动与读取要拆开

开发服务器、训练任务和大型测试不适合让一次 tool call 等到进程自然结束。可以拆成：

```text
start_process(request) -> { process_id, status: "running", cursor: 0 }
read_process(process_id, cursor, wait_ms, max_bytes) -> OutputPage
write_process(process_id, stdin)
cancel_process(process_id, grace_ms) -> ProcessResult
```

`process_id` 是 Harness 的稳定句柄，PID 只是元数据。进程可能位于容器、远程 worker 或 Windows Job Object 中，直接把 PID 当全局身份会让恢复和调度变得脆弱。

## 7. Shell、管道与平台差异

- 普通调用优先 `executable + args`；这样参数边界明确，也更容易记录、审批和重放。
- 管道最好由运行时连接两个子进程，而不是自动拼成 `sh -c` 或 `powershell -Command`。
- Windows 的 `.cmd`、PowerShell cmdlet、POSIX shell builtin 属于不同执行模型；ToolSpec 应声明支持的平台和 shell。
- 超时终止一个 PID 未必会结束它启动的子进程。POSIX 可使用独立 process group；Windows 可使用 Job Object 或可靠的进程树管理器。
- 编码不应假设永远是 UTF-8。结果要记录实际编码、替换字符数量和原始日志 artifact。

## 8. 重试与幂等

读取版本、运行只读检查等命令通常可重试；安装依赖、迁移数据库、发布包等命令可能已产生部分副作用。重试前应检查：

1. 进程是否仍在运行；
2. 文件、锁、数据库或部署状态是否已经改变；
3. 命令是否支持幂等键或 dry-run；
4. 上次失败是启动失败、超时、非零退出还是输出协议错误；
5. 是否应从检查点继续，而不是整条命令重跑。

## 9. 最小测试矩阵

| 场景                | 应验证的结果                                           |
| ------------------- | ------------------------------------------------------ |
| 可执行文件不存在    | `spawn_error` 有类型，`exit_code` 为 `null`            |
| 正常退出            | stdout/stderr 完整，`exit_code=0`                      |
| 非零退出            | 保留两条输出流与真实退出码                             |
| 输出超过上限        | 进程仍被持续 drain，结果标注 truncated 并给出 artifact |
| deadline 到期       | 进程树结束、状态为 timed_out、清理已完成               |
| 用户取消            | cancelled 与 timed_out 分开                            |
| 子进程持续写 stderr | 两条管道并发读取，不发生死锁                           |
| 命令修改文件        | 后续 read/diff/test 形成独立 ValidationResult          |

## 参考资料

- [Python `subprocess` 官方文档](https://docs.python.org/3/library/subprocess.html)
- [Node.js `child_process` 官方文档](https://nodejs.org/api/child_process.html)
- [Rust `std::process::Command` 官方文档](https://doc.rust-lang.org/std/process/struct.Command.html)
- [SWE-agent：Agent-Computer Interface 的命令设计](https://swe-agent.com/0.7/config/commands/)
