import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  extraBackendSections,
  foundationReading,
  overviewMarkdown,
} from './java-learning-extra.mjs'
import { codeExampleForTitle } from './java-learning-code-examples.mjs'
import { stageGuides, supplementaryDocuments } from './java-learning-expansion.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(projectRoot, 'content', 'Java开发')

async function writeDoc(relativePath, content) {
  const filename = path.join(contentRoot, relativePath)
  await fs.mkdir(path.dirname(filename), { recursive: true })
  await fs.writeFile(filename, `${content.trim()}\n`, 'utf8')
}

function references(items) {
  return items.map(([label, url]) => `- [${label}](${url})`).join('\n')
}

function lesson({
  title,
  source,
  summary,
  objectives,
  concepts,
  modern,
  practice,
  checklist,
  refs,
  diagram = '',
  example = '',
}) {
  const lessonExample =
    example ||
    `## 3.9 最小可运行示例

${codeExampleForTitle(title)}`
  const conceptBody = concepts
    .map(
      ({ name, detail, engineering, pitfall }, index) => `### ${index + 1}. ${name}

${detail}

**工程理解：** ${engineering}

**常见误区：** ${pitfall}`,
    )
    .join('\n\n')

  return `# ${title}

> 课件来源：${source}。本文逐项覆盖课件目录，并依据 Java SE 26、JDK 25 LTS 及相关官方文档补充现代工程实践。

${summary}

## 1. 学习目标

${objectives.map((item) => `- ${item}`).join('\n')}

## 2. 知识结构

${diagram}

## 3. 逐项详解

${conceptBody}

${lessonExample}

## 4. 现代 Java 校准

${modern.map((item) => `- ${item}`).join('\n')}

## 5. 实践任务

${practice.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## 6. 掌握检查

${checklist.map((item) => `- [ ] ${item}`).join('\n')}

## 参考资料

${references(refs)}
`
}

function topicDoc({ title, summary, scope, topics, process, practice, checks, refs }) {
  const codeExample = codeExampleForTitle(title)
  return `# ${title}

${summary}

## 1. 本文覆盖范围

${scope.map((item) => `- ${item}`).join('\n')}

## 2. 核心知识详解

${topics
  .map(
    ({ name, explanation, points, correctness }, index) => `### ${index + 1}. ${name}

${explanation}

${points.map((item) => `- ${item}`).join('\n')}

**正确性边界：** ${correctness}`,
  )
  .join('\n\n')}

## 3. 工程链路

${process}

## 4. 最小可运行示例

下面的示例只保留关键路径。把它放入对应版本的最小工程，先运行测试或命令确认行为，再逐步加入重试、超时、监控和异常分支。

${codeExample}

## 5. 实践与验证

${practice.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## 6. 掌握检查

${checks.map((item) => `- [ ] ${item}`).join('\n')}

## 参考资料

${references(refs)}
`
}

function recommendationDoc(title, intro, refs) {
  return `# ${title}

${intro}

## 官方资料优先顺序

${references(refs)}

## 阅读方法

1. 先阅读概念与快速开始，建立最小可运行闭环。
2. 再阅读 reference 中与当前项目直接相关的章节，记录默认值、异常语义和版本要求。
3. 每个关键结论都用最小 Demo、自动化测试或执行计划验证。
4. 升级时重新阅读 migration/release notes，避免把某个版本的默认行为当作永久契约。
5. 博客和视频用于补充视角，最终以规范、官方文档和可重复实验校准。
`
}

const javaApi = [
  'Java SE 26 API',
  'https://docs.oracle.com/en/java/javase/26/docs/api/',
]
const devJava = ['Dev.java Learn', 'https://dev.java/learn/']
const jls = [
  'Java Language Specification 26',
  'https://docs.oracle.com/javase/specs/jls/se26/html/',
]
const coreLibraries = [
  'Java SE 26 Core Libraries Guide',
  'https://docs.oracle.com/en/java/javase/26/core/java-core-libraries1.html',
]

const foundationLessons = [
  {
    file: '01-Java开发入门.md',
    title: 'Java 开发入门：平台、JDK、编译运行与开发环境',
    source: '《第1章 Java开发入门.pptx》',
    summary:
      '这一章回答“Java 程序从源文件到运行结果经历了什么”。理解 JDK、JVM、字节码、类路径和工具链，比记住 IDE 菜单更重要。',
    objectives: [
      '区分 Java 语言、Java SE 平台、JDK、JVM 与具体发行版。',
      '能从命令行完成编译、运行、打包、查看字节码和诊断版本。',
      '理解 PATH、类路径和模块路径的边界。',
      '建立可复现的 JDK 版本与项目目录约定。',
    ],
    concepts: [
      {
        name: 'Java 平台与“一次编译，到处运行”',
        detail:
          'Java 源码由 `javac` 编译为 class 文件中的 JVM 字节码，再由目标机器上的 JVM 验证、链接并执行。可移植性来自统一的 class 文件格式和 Java SE API，而不是同一个本地机器码文件直接跨系统运行。',
        engineering:
          '兼容性仍受 JDK 版本、第三方本地库、默认字符集、文件系统和时区影响；生产环境应固定运行时版本并在目标镜像中测试。',
        pitfall:
          '把 Java 语言、Oracle JDK、OpenJDK 和 JVM 当成同一个概念，或者认为字节码完全消除了平台差异。',
      },
      {
        name: 'JDK、JRE、JVM 与发行版',
        detail:
          'JVM 执行字节码；Java SE 定义语言和标准 API；JDK 在运行时之外提供 `javac`、`jar`、`javadoc`、`jcmd`、`jfr` 等开发诊断工具。现代 JDK 发行版通常已经包含完整运行时，不再以旧式独立 JRE 作为学习中心。',
        engineering:
          '团队选择一个经过支持的发行版并固定大版本、补丁版本和 CPU 架构；构建机与生产镜像至少保证目标字节码和运行时兼容。',
        pitfall:
          '只记“JDK 包含 JRE”这句旧教材表述，却不了解模块化运行时、供应商支持周期和 `--release` 的作用。',
      },
      {
        name: '版本选择：JDK 25 LTS 与 JDK 26',
        detail:
          '截至 2026 年 7 月，JDK 26 是最新功能版本，JDK 25 是最新 LTS。学习和长期项目可优先使用 JDK 25 LTS；需要验证 HTTP/3 Client 等 JDK 26 特性时再建立独立实验分支。',
        engineering:
          '生产升级要阅读 migration guide、扫描废弃 API、运行完整测试并观察 GC、启动时间和依赖兼容性。',
        pitfall:
          '把“最新版本”与“最适合长期生产维护的版本”混为一谈，或直接在核心项目启用 preview 特性。',
      },
      {
        name: '安装与目录',
        detail:
          'JDK 目录包含 `bin` 工具、`lib` 实现资源、`jmods` 模块文件和法律信息。`JAVA_HOME` 通常指向 JDK 根目录，PATH 追加其 `bin`；具体项目应由 Maven Toolchains、Gradle Toolchains 或 CI 镜像锁定版本。',
        engineering:
          '执行 `java -version`、`javac -version` 和 `where java`/`which java`，确认终端实际使用的工具链。',
        pitfall:
          'IDE 使用一个 JDK，终端和 CI 使用另一个 JDK，最终出现“本机通过、流水线失败”。',
      },
      {
        name: '第一个程序与入口方法',
        detail:
          '`public static void main(String[] args)` 是传统应用入口；类名、文件名和包结构必须符合规则。JDK 25 还正式提供紧凑源文件与实例 main 方法用于入门和脚本式程序，但大型项目仍应保持清晰包结构。',
        engineering:
          '理解编译单元、全限定类名与包目录后，再让 IDE 自动生成项目，才能定位类加载和打包错误。',
        pitfall:
          '只会点 IDE 的运行按钮，不知道它背后传入的 classpath、主类和 JVM 参数。',
      },
      {
        name: '编译、运行和 class 文件',
        detail:
          '`javac -d out src/.../Main.java` 产生 class 文件，`java -cp out package.Main` 启动 JVM。`javap -c -p` 可查看字段、方法和字节码，帮助理解重载、装箱、字符串拼接与编译器生成代码。',
        engineering:
          '构建系统负责增量编译、依赖解析、测试和打包；命令行练习用于建立正确心智模型。',
        pitfall:
          '把 classpath 当作源码目录，或把 jar 文件复制到任意位置后期待 JVM 自动发现。',
      },
      {
        name: 'PATH、CLASSPATH 与模块路径',
        detail:
          'PATH 用于让操作系统找到 `java` 等可执行文件；classpath 用于让类加载器找到类和资源；module-path 服务于 JPMS 模块。现代项目一般由构建工具生成 classpath，少用全局 `CLASSPATH` 环境变量。',
        engineering:
          '依赖应声明在 `pom.xml` 或 `build.gradle(.kts)`，避免机器级隐式配置。',
        pitfall: '把 PATH 和 classpath 互换，或者把依赖冲突归因于“JDK 没装好”。',
      },
      {
        name: 'IDEA 项目与调试',
        detail:
          'IDEA 的 Project SDK、语言级别、模块依赖和运行配置分别控制不同层面。断点调试应掌握 step over、step into、条件断点、异常断点、变量求值和线程视图。',
        engineering:
          '项目配置以构建文件为真实来源，IDE 负责导入；不要只在 IDE 模块设置中手工添加依赖。',
        pitfall:
          '提交 `.idea` 中的个人路径和临时运行配置，或用“Invalidate Caches”代替理解依赖问题。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["Main.java 源码"] --> B["javac 编译"]
  B --> C["Main.class 字节码"]
  C --> D["类加载、验证与链接"]
  D --> E["解释执行 / JIT 编译"]
  E --> F["操作系统与硬件"]
\`\`\``,
    example: `## 3.9 最小命令行闭环

\`\`\`bash
javac --release 25 -d out src/com/example/Main.java
java -cp out com.example.Main
javap -classpath out -c -p com.example.Main
jar --create --file app.jar --main-class com.example.Main -C out .
java -jar app.jar
\`\`\`
`,
    modern: [
      'JDK 26 已在 2026-03-17 发布；JDK 25 是当前最新 LTS。',
      'Applet API 已在 JDK 26 移除；JSP/Applet 不属于现代 Java 后端学习主线。',
      '全局 `CLASSPATH` 不适合作为项目依赖管理方案。',
      '实验 preview 特性时必须同时在编译和运行阶段使用 `--enable-preview`，并隔离于长期维护代码。',
    ],
    practice: [
      '不用 IDE 编译一个带 package 的两类程序，并打成可执行 jar。',
      '故意配置错误 PATH、classpath 和主类名，记录三种错误消息的差异。',
      '使用 `javap` 对比普通字符串拼接和循环中的 `StringBuilder` 字节码。',
    ],
    checklist: [
      '能解释源码、字节码、JVM 与本地机器码的关系。',
      '能说明 JDK 25 LTS 和 JDK 26 的选择依据。',
      '能独立定位 IDE、终端和 CI 使用不同 JDK 的问题。',
      '能从命令行完成 compile → run → package → inspect。',
    ],
    refs: [
      javaApi,
      ['Oracle Java Downloads', 'https://www.oracle.com/java/technologies/downloads/'],
      ['OpenJDK JDK 25', 'https://openjdk.org/projects/jdk/25/'],
      [
        'JDK 26 Release Notes',
        'https://www.oracle.com/java/technologies/javase/26-relnotes.html',
      ],
      devJava,
    ],
  },
  {
    file: '02-Java编程基础.md',
    title: 'Java 编程基础：语法、类型、运算、控制流、方法与数组',
    source: '《第2章 Java编程基础(1).pptx》',
    summary:
      '本章覆盖课件的程序结构、注释、标识符、关键字、常量变量、类型转换、运算符、分支循环、方法和一维/二维数组，并补充数值边界与可维护性规则。',
    objectives: [
      '理解 Java 的静态类型、值类型语义和数值提升规则。',
      '能正确选择分支、循环、方法参数和数组结构。',
      '能识别溢出、精度丢失、短路求值和数组越界。',
      '建立命名、作用域和小函数习惯。',
    ],
    concepts: [
      {
        name: '程序结构、注释与标识符',
        detail:
          '一个编译单元可包含 package、import 和类型声明。标识符区分大小写，可使用 Unicode 字符，但工程中通常采用 ASCII 英文命名。`//`、`/* */` 和 `/** */` 分别服务于行注释、块注释和 Javadoc。',
        engineering:
          '注释解释约束和决策，不重复代码表面动作；公开 API 使用 Javadoc 描述契约、参数、返回值和异常。',
        pitfall:
          '用注释掩盖过长方法，或把中文、全角字符和相似 Unicode 字符混入关键标识符。',
      },
      {
        name: '关键字、字面量、常量与变量',
        detail:
          '变量拥有声明类型、名称、作用域和生命周期。`final` 表示变量只能赋值一次；对引用变量而言，引用本身固定，并不自动让对象不可变。整型、浮点、字符、字符串、布尔和 `null` 均有各自字面量规则。',
        engineering:
          '常量使用有含义的名字；尽量缩小可变状态作用域，局部变量靠近首次使用处声明。',
        pitfall: '把 `final List` 误解为不可修改集合，或依赖未初始化局部变量。',
      },
      {
        name: '八种基本类型',
        detail:
          '`byte/short/int/long` 为有符号整数，`char` 是 UTF-16 code unit，`float/double` 遵循 IEEE 754，`boolean` 表示逻辑值。整数除法截断小数；浮点数存在 NaN、无穷和舍入误差。',
        engineering:
          '金额使用整数最小货币单位或 `BigDecimal`；文本处理区分 code unit、Unicode code point 和 grapheme cluster。',
        pitfall: '用 `double` 保存精确金额，或认为一个 `char` 必然对应一个完整字符。',
      },
      {
        name: '类型转换与数值提升',
        detail:
          '窄类型参与算术运算通常先提升为 `int`；宽化转换一般安全但 `long` 到 `float/double` 仍可能丢精度；窄化转换需显式强制并可能截断高位。复合赋值隐含一次转换。',
        engineering:
          '边界处使用 `Math.addExact` 等精确运算检测溢出，解析外部输入时校验范围。',
        pitfall:
          '认为强制转换等于四舍五入，或忽略 `int * int` 在赋给 long 之前已经溢出。',
      },
      {
        name: '算术、赋值、比较、逻辑与位运算',
        detail:
          '`&&`、`||` 短路求值；`&`、`|` 对布尔值不短路，对整数执行位运算。对象引用的 `==` 比较是否同一对象，内容相等通常使用 `equals`。运算符优先级可由括号明确表达。',
        engineering:
          '复杂条件提取为命名良好的布尔方法；位标志仅在协议、性能或底层模型确实需要时使用。',
        pitfall: '用 `==` 比较字符串内容，或依赖读者记住长表达式的所有优先级。',
      },
      {
        name: 'if、条件表达式与 switch',
        detail:
          '`if/else` 适合范围和复杂谓词；三元表达式适合短小的值选择；`switch` 适合离散值。现代 switch 表达式用 `case ... ->` 避免意外贯穿，并可通过 `yield` 返回块结果。',
        engineering:
          '把业务规则写成穷尽分支并配测试；枚举 switch 在增加新枚举值时应触发编译或测试反馈。',
        pitfall: '传统 switch 忘记 `break`，或把多层业务判断堆成难以验证的嵌套 if。',
      },
      {
        name: 'while、do-while、for 与增强 for',
        detail:
          '`while` 先判断，`do-while` 至少执行一次，`for` 适合明确初始化/条件/更新，增强 for 适合只读遍历。`break` 结束循环，`continue` 跳过本轮；标签只用于少量嵌套控制。',
        engineering:
          '循环必须明确不变量、终止条件和每次迭代的进展；集合变更优先使用迭代器 API 或函数式变换。',
        pitfall: '边遍历边用集合自身 remove 破坏迭代器，或写出更新变量不前进的死循环。',
      },
      {
        name: '方法、参数、返回值、重载与可变参数',
        detail:
          'Java 始终按值传递：基本类型复制值，对象参数复制引用值。方法签名由名称和参数类型组成，返回类型不参与重载。可变参数编译为数组且每个方法最多一个、必须放末尾。',
        engineering:
          '方法只承担一个清晰职责；用返回值表达结果，避免通过共享可变字段传递隐式状态。',
        pitfall: '把“传递引用值”说成“按引用传递”，或设计只有返回类型不同的重载。',
      },
      {
        name: '一维数组',
        detail:
          '数组是固定长度、同一元素类型的对象，索引范围为 `0..length-1`。创建后元素获得默认值；引用数组存放对象引用。复制需区分共享引用、浅拷贝与元素级深拷贝。',
        engineering:
          '长度固定且按索引访问时用数组；动态增删优先集合。使用 `Arrays` 的排序、比较和复制工具。',
        pitfall: '访问 `length` 位置，或以为 `b = a` 创建了新数组。',
      },
      {
        name: '二维数组与不规则数组',
        detail:
          'Java 的二维数组本质是“数组的数组”，每一行可有不同长度。`new int[rows][cols]` 创建规则矩阵，也可逐行初始化不规则结构。',
        engineering:
          '遍历每行时读取 `matrix[row].length`；矩阵算法要明确维度、空行和内存布局成本。',
        pitfall: '假设所有行与第一行同长，或混淆行列索引导致越界。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart TD
  A["输入与状态"] --> B{"离散分支?"}
  B -->|是| C["switch / if"]
  B -->|否| D{"需要重复?"}
  D -->|次数明确| E["for"]
  D -->|条件驱动| F["while / do-while"]
  C --> G["方法返回值"]
  E --> G
  F --> G
\`\`\``,
    example: `## 3.11 数值边界示例

\`\`\`java
long wrong = 2_000_000_000 * 2;      // 先按 int 计算，已经溢出
long right = 2_000_000_000L * 2;     // long 运算
int checked = Math.addExact(2_000_000_000, 100_000_000);
\`\`\`
`,
    modern: [
      '现代 switch 表达式应优先于依赖贯穿行为的传统 switch。',
      'Java 参数传递统一为按值传递。',
      '金额和精确十进制计算使用 `BigDecimal` 时要同时明确 scale 与 rounding mode。',
      '字符处理涉及 emoji 或扩展字符时按 code point 处理，而不是假设 `char` 足够。',
    ],
    practice: [
      '实现一个命令行成绩统计器，覆盖空输入、非法数字、排序和分组。',
      '写测试证明 Java 的参数传递语义以及数组浅拷贝行为。',
      '用普通循环与 Stream 分别实现去重、筛选和汇总，并比较可读性。',
    ],
    checklist: [
      '能列出八种基本类型及其关键边界。',
      '能解释 `==`、`equals`、短路求值和数值提升。',
      '能为控制流写出终止条件与边界测试。',
      '能解释一维数组、二维数组和对象引用复制。',
    ],
    refs: [jls, javaApi, devJava],
  },
  {
    file: '03-面向对象上.md',
    title: '面向对象（上）：类、对象、封装、构造器、this、代码块与 static',
    source: '《第3章 面向对象(上).pptx》',
    summary:
      '面向对象的核心不是“所有东西都写成类”，而是用状态、行为、边界和不变量表达领域概念。本章完整覆盖课件上半部分。',
    objectives: [
      '区分类、对象、引用、实例字段和局部变量。',
      '使用封装和构造器维护对象不变量。',
      '理解 `this`、初始化顺序、静态成员与实例成员。',
      '避免贫血对象、全局静态状态和无约束 setter。',
    ],
    concepts: [
      {
        name: '面向对象思想',
        detail:
          '对象把相关状态与行为组织在一个边界内；类描述对象结构和可执行契约。好的模型让非法状态难以表示，并让行为靠近它所依赖的数据。',
        engineering:
          '从业务不变量和用例出发划分职责，而不是机械地为每张数据库表生成只有 getter/setter 的类。',
        pitfall: '把面向对象等同于“封装、继承、多态”三个术语，忽略职责、协作和不变量。',
      },
      {
        name: '类、对象与引用',
        detail:
          '`new` 创建对象并返回引用；多个变量可指向同一对象。引用可为 `null`，字段具有默认值，局部变量必须在使用前明确赋值。',
        engineering:
          '尽量在构造阶段创建完整对象；对可能缺失的结果使用明确契约，而不是到处传播 null。',
        pitfall: '把引用变量本身当作对象，或以为赋值会复制整个对象。',
      },
      {
        name: '字段、方法与访问控制',
        detail:
          '`private`、包可见、`protected`、`public` 决定源代码访问边界。公开方法形成 API；字段通常私有，通过有意义的行为更新。',
        engineering:
          '优先最小可见性；包按高内聚职责组织，而不是简单按 controller/service/util 技术名拆散领域。',
        pitfall: '把所有字段和方法都声明为 public，导致任何调用者都能破坏状态。',
      },
      {
        name: '封装与对象不变量',
        detail:
          '封装不仅是“private + getter/setter”，而是隐藏表示方式并控制状态变化。例如余额不得为负、订单状态只能按允许路径迁移，都应在对象边界内验证。',
        engineering:
          '暴露 `withdraw`、`changeAddress` 等业务方法，并在一个地方维护校验。',
        pitfall: '自动为所有字段生成可写 setter，使对象在任意时刻都可能处于非法状态。',
      },
      {
        name: '构造器与重载',
        detail:
          '构造器没有返回类型，名称与类名一致，用于建立初始状态。未声明构造器时编译器才提供默认无参构造器；一旦声明任意构造器，默认构造器便不再生成。',
        engineering:
          '参数较多或存在可选项时使用静态工厂、builder 或值对象，避免长参数列表和布尔陷阱。',
        pitfall: '给构造器写 `void` 使其变成普通方法，或依赖已经不存在的默认构造器。',
      },
      {
        name: 'this 的三种用途',
        detail:
          '`this.field` 消除字段与参数歧义，`this.method()` 调用当前对象行为，`this(...)` 在构造器首条语句委托同类其他构造器。实例方法中的 this 指当前接收者。',
        engineering: '用构造器委托集中默认值与验证，避免多个构造器复制初始化逻辑。',
        pitfall: '在 static 上下文使用 this，或形成构造器互相调用环。',
      },
      {
        name: '局部代码块、实例初始化块与静态初始化块',
        detail:
          '普通块限制局部变量作用域；实例初始化块在每次构造对象时执行，并被插入到构造器流程；静态初始化块在类初始化时执行一次。初始化顺序还受到父类和字段声明顺序影响。',
        engineering:
          '复杂初始化优先具名私有方法或工厂；静态初始化避免网络、文件等不稳定 I/O。',
        pitfall: '依赖难以看出的初始化顺序，或在静态块抛出异常导致类无法初始化。',
      },
      {
        name: 'static 字段、方法与嵌套类',
        detail:
          'static 成员属于类，不依赖具体实例。静态方法只能直接访问静态成员；静态嵌套类不持有外部类实例。常量常写为 `public static final`，但可变静态字段会成为进程级共享状态。',
        engineering:
          '纯函数工具和无状态工厂可使用 static；可替换依赖和有生命周期资源交给对象或依赖注入容器。',
        pitfall: '用 static 解决所有访问问题，造成测试污染、并发竞争和隐藏依赖。',
      },
      {
        name: '对象生命周期与垃圾回收边界',
        detail:
          '对象在没有可达引用后才有资格被 GC 回收，具体时机不确定。GC 管理 Java 堆内存，不自动关闭文件、Socket 和数据库连接。',
        engineering:
          '外部资源使用 `AutoCloseable` 与 try-with-resources；内存泄漏往往来自仍被集合、监听器、ThreadLocal 或缓存引用的对象。',
        pitfall: '把变量设为 null 当作可靠的即时回收，或依赖 `finalize()` 清理资源。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["构造参数"] --> B["校验不变量"]
  B --> C["创建完整对象"]
  C --> D["公开行为方法"]
  D --> E["受控状态迁移"]
  E --> F["新的合法状态"]
\`\`\``,
    modern: [
      '`finalize()` 已废弃并不适合资源释放；使用 try-with-resources、Cleaner 的受控场景或显式生命周期。',
      '不可变值对象可使用 record，但仍需在紧凑构造器中校验。',
      '依赖注入服务应避免可变 static 单例状态。',
      '访问器不是封装的充分条件；关键是对象是否控制自己的有效状态。',
    ],
    practice: [
      '设计 Money、Order 与 OrderLine，使金额和订单状态始终合法。',
      '画出父类静态字段、实例字段、初始化块和构造器的执行顺序并用日志验证。',
      '重构一个只有 getter/setter 的类，把业务状态迁移收回对象方法。',
    ],
    checklist: [
      '能解释对象、引用和赋值别名。',
      '能设计保证不变量的构造器和行为方法。',
      '能说明 this、static 和初始化块的执行边界。',
      '能区分堆内存回收与外部资源关闭。',
    ],
    refs: [jls, javaApi, devJava],
  },
  {
    file: '04-面向对象下.md',
    title: '面向对象（下）：继承、super、final、抽象、接口、多态、Object 与内部类',
    source: '《第4章 面向对象(下).pptx》',
    summary:
      '本章覆盖课件中的继承与重写、super、final、抽象类、接口、多态、类型转换、Object 和四类内部类，并从组合优先和契约设计角度校准。',
    objectives: [
      '理解继承的 is-a 约束与组合的 has-a 关系。',
      '掌握重写、动态分派、向上/向下转型和模式匹配。',
      '正确实现 equals/hashCode/toString。',
      '选择抽象类、接口、sealed hierarchy 和内部类。',
    ],
    concepts: [
      {
        name: '继承与 is-a 关系',
        detail:
          '`extends` 建立子类型关系，子类继承可访问成员并可增加行为。Java 类只支持单继承，但接口可多实现。继承必须满足里氏替换：使用父类型的代码不应因替换为子类而破坏契约。',
        engineering:
          '共享实现并不是采用继承的充分理由；优先组合与委托，把变化点放在小接口后。',
        pitfall: '为了复用几行代码建立脆弱继承树，或子类加强前置条件、削弱后置条件。',
      },
      {
        name: '方法重写与动态分派',
        detail:
          '重写要求实例方法签名兼容，返回类型可协变，访问级别不可更严格，受检异常不可更宽。运行时根据实际对象类型选择重写方法；字段和 static 方法不参与这种动态分派。',
        engineering: '始终使用 `@Override` 让编译器检查；父类契约应写清副作用和异常。',
        pitfall: '把重载与重写混淆，或以为 static 方法会多态。',
      },
      {
        name: 'super 与父类构造',
        detail:
          '`super.member` 访问父类实现，`super(...)` 必须位于子类构造器首条语句。构造对象时先初始化父类部分，再初始化子类部分。',
        engineering: '父类构造期间避免调用可重写方法，否则子类字段尚未初始化。',
        pitfall: '认为子类继承了父类构造器，或在构造器中访问未完成初始化的多态状态。',
      },
      {
        name: 'final 的三种语义',
        detail:
          'final 类不可继承，final 实例方法不可重写，final 变量只能赋值一次。final 引用仍可能指向可变对象；真正不可变还要求状态私有、无可变泄漏和线程安全发布。',
        engineering:
          '值对象和不可变配置优先 final 字段；设计扩展点时只开放有稳定契约的方法。',
        pitfall: '把 final 引用与深度不可变对象等同。',
      },
      {
        name: '抽象类',
        detail:
          '抽象类可包含状态、构造器、具体方法和抽象方法，适合同一族对象共享不变量与部分实现。抽象类不能直接实例化，但其构造器会在子类构造过程中执行。',
        engineering: '模板方法适用于骨架稳定、个别步骤变化的算法；扩展点要小而明确。',
        pitfall: '用巨型抽象基类承载所有公共代码，迫使无关子类继承无用能力。',
      },
      {
        name: '接口与默认方法',
        detail:
          '接口描述调用者可依赖的能力契约，可包含抽象方法、default、static 和 private 方法以及常量。类可实现多个接口；冲突 default 方法需显式解决。',
        engineering:
          '接口按使用者需要划分，避免“万能 Service”；default 方法主要用于兼容演进。',
        pitfall: '把接口当作只有常量的容器，或让所有实现依赖庞大的接口。',
      },
      {
        name: '多态、向上转型与向下转型',
        detail:
          '子类引用赋给父类型是安全的向上转型；向下转型需保证实际对象兼容，否则抛出 `ClassCastException`。现代 `instanceof Type variable` 可同时判断并绑定变量。',
        engineering:
          '大量类型判断通常说明多态边界或领域建模需要重构；sealed 类型配合 switch 可表达封闭状态集合。',
        pitfall: '只根据变量声明类型判断实际对象，或无检查地强制向下转型。',
      },
      {
        name: 'Object 契约',
        detail:
          '所有类最终继承 Object。`equals` 应满足自反、对称、传递、一致和非空；相等对象必须有相同 hashCode。`toString` 用于可读诊断，但不得泄露密码和令牌。',
        engineering:
          '值对象同时实现 equals/hashCode；实体通常按稳定身份比较；可用 record 自动生成基于组件的实现。',
        pitfall: '只重写 equals 不重写 hashCode，导致 HashMap/HashSet 行为异常。',
      },
      {
        name: '成员、局部、静态与匿名内部类',
        detail:
          '非静态成员内部类持有外部实例；静态嵌套类不持有；局部类作用域限于块；匿名类创建一次性子类/接口实现。局部捕获变量必须是 final 或 effectively final。',
        engineering:
          '无外部实例需求时优先 static 嵌套类；单方法接口的短行为优先 lambda。',
        pitfall: '非静态内部类意外延长外部对象生命周期，或用匿名类替代清晰可复用类型。',
      },
    ],
    diagram: `\`\`\`mermaid
classDiagram
  class PaymentMethod {
    <<interface>>
    +pay(Money)
  }
  class CardPayment
  class WalletPayment
  class CheckoutService {
    -PaymentMethod method
  }
  PaymentMethod <|.. CardPayment
  PaymentMethod <|.. WalletPayment
  CheckoutService o--> PaymentMethod
\`\`\``,
    modern: [
      '使用 `@Override`、模式匹配 `instanceof`、record 和 sealed class/interface 可以降低经典 OOP 样板。',
      '接口的 default 方法不是多继承状态；它仍然不提供实例字段。',
      '组合优先并非排斥继承，而是要求继承确实表达稳定子类型。',
      'HashMap/HashSet 中对象的相等字段在作为 key 期间应保持稳定。',
    ],
    practice: [
      '为多种支付方式设计小接口，用组合替代 if/else 类型判断。',
      '实现不可变 Money record，并测试 equals/hashCode。',
      '制造一次错误的向下转型，再用模式匹配和 sealed hierarchy 消除。',
    ],
    checklist: [
      '能区分重载、重写、隐藏和动态分派。',
      '能说明接口与抽象类的选择条件。',
      '能正确实现 equals/hashCode 契约。',
      '能解释四类内部类对外部实例和局部变量的捕获。',
    ],
    refs: [jls, javaApi, devJava],
  },
  {
    file: '05-异常处理.md',
    title: '异常处理：异常体系、try/catch/finally、throw/throws 与自定义异常',
    source: '《第5章 异常.pptx》',
    summary:
      '异常用于沿调用栈传播“当前操作没有按契约完成”的信息。正确的异常设计要保留原因、区分可恢复性并保证资源释放。',
    objectives: [
      '区分 Error、受检异常与运行时异常。',
      '正确使用捕获、重新抛出、异常链和 try-with-resources。',
      '设计有业务语义的自定义异常和稳定错误边界。',
      '避免吞异常、过度捕获和 finally 覆盖异常。',
    ],
    concepts: [
      {
        name: 'Throwable 体系',
        detail:
          '`Throwable` 分为 `Error` 与 `Exception`。Error 通常表示 JVM 或环境级严重问题；RuntimeException 及其子类为非受检异常；其他 Exception 多为受检异常，编译器要求捕获或声明。',
        engineering:
          '是否受检不能简单等同于是否可恢复；API 应根据调用者能否采取有意义行动决定异常契约。',
        pitfall: '捕获 `Throwable` 或 `Error` 后继续运行，隐藏内存耗尽等严重状态。',
      },
      {
        name: '运行时异常与受检异常',
        detail:
          '空引用、非法参数、越界和非法状态常用 RuntimeException 表示编程或契约错误；文件、网络等外部失败常以受检异常提示调用者处理。',
        engineering:
          '在系统边界把底层异常转换为领域异常或稳定错误响应，同时保留 cause。',
        pitfall: '所有异常一律包装为 RuntimeException，导致调用者失去语义和恢复策略。',
      },
      {
        name: 'try/catch 与匹配顺序',
        detail:
          'catch 按从上到下匹配第一个兼容类型；子类必须放在父类之前。multi-catch 可用 `catch (A | B e)` 合并相同处理。',
        engineering:
          '只捕获当前层真正能处理、补充上下文或转换的异常；否则让其继续传播。',
        pitfall: '写空 catch，或只打印堆栈后把失败当成功返回。',
      },
      {
        name: 'finally 的保证与限制',
        detail:
          'finally 通常在 try/catch 退出前执行，但进程被强制终止等情况例外。finally 中 return 或再次抛出会覆盖原始返回值/异常。',
        engineering:
          '资源释放优先 try-with-resources，finally 只处理无法实现 AutoCloseable 的局部清理。',
        pitfall: '在 finally 中 return，导致真正异常丢失。',
      },
      {
        name: 'throw 与 throws',
        detail:
          '`throw` 抛出具体 Throwable 对象；`throws` 声明方法可能传播的受检异常。重写方法不能扩大父方法声明的受检异常范围。',
        engineering:
          '异常消息包含操作、关键标识和边界上下文，但去除密码、令牌和个人敏感数据。',
        pitfall: '抛出过于宽泛的 Exception，迫使每个调用者做无意义捕获。',
      },
      {
        name: '异常链与 suppressed exceptions',
        detail:
          '包装异常时使用构造器传入 cause。try-with-resources 若主体和 close 同时失败，主体异常为主，close 异常记录在 `getSuppressed()`。',
        engineering: '日志记录一次完整异常链；上层增加业务上下文，下层保留技术原因。',
        pitfall: '只保留 `e.getMessage()` 而丢失堆栈和 cause。',
      },
      {
        name: '自定义异常',
        detail:
          '自定义异常应表达稳定业务类别，例如 `InsufficientBalanceException`，并携带可诊断但安全的数据。需要强制调用者处理时继承 Exception，否则继承 RuntimeException。',
        engineering:
          '异常类型与 API 错误码分层：内部异常不直接暴露实现细节，外部响应保持可版本化。',
        pitfall: '为每个微小失败创建层层异常类型，或把 HTTP 状态码硬编码进领域异常。',
      },
      {
        name: '资源管理',
        detail:
          '实现 `AutoCloseable` 的资源可在 try-with-resources 中声明，并按声明逆序关闭。Java 9 起可引用已经 effectively final 的外部资源变量。',
        engineering:
          '数据库连接、流、Socket、压缩包和文件系统句柄都必须有明确所有权和关闭点。',
        pitfall: '依赖 GC 关闭文件或连接，最终导致句柄和连接池耗尽。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart TD
  A["调用操作"] --> B{"成功?"}
  B -->|是| C["返回结果"]
  B -->|否| D["抛出异常"]
  D --> E{"当前层能处理?"}
  E -->|是| F["恢复 / 转换 / 补充上下文"]
  E -->|否| G["沿调用栈传播"]
  F --> H["统一错误边界"]
  G --> H
\`\`\``,
    example: `## 3.9 try-with-resources 与异常链

\`\`\`java
try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    return reader.readLine();
} catch (IOException e) {
    throw new ConfigurationLoadException("读取配置失败: " + path, e);
}
\`\`\`
`,
    modern: [
      '资源关闭首选 try-with-resources。',
      '不要使用 `finalize()` 作为异常兜底或资源清理机制。',
      '虚拟线程中的异常仍遵循普通调用栈规则；并发任务需要显式汇总失败。',
      '日志、HTTP 响应和领域异常属于三个不同层次，避免直接透传实现细节。',
    ],
    practice: [
      '实现一个配置加载器，区分文件不存在、格式错误和业务校验失败。',
      '构造主体异常与 close 异常同时发生的 AutoCloseable，观察 suppressed exception。',
      '为 REST 接口设计统一错误响应并映射领域异常。',
    ],
    checklist: [
      '能解释受检与非受检异常的设计取舍。',
      '能保证异常链和原始堆栈得到保留。',
      '能使用 try-with-resources 管理多个资源。',
      '能指出吞异常和 finally-return 的后果。',
    ],
    refs: [
      javaApi,
      ['Java Tutorials: Exceptions', 'https://dev.java/learn/exceptions/'],
      jls,
    ],
  },
  {
    file: '06-Java核心API.md',
    title: 'Java 核心 API：字符串、系统、数学、时间、包装类与正则表达式',
    source: '《第6章 Java API.pptx》',
    summary:
      '本章逐项覆盖 String/StringBuffer、System/Runtime、Math/Random、BigInteger/BigDecimal、日期时间、格式化、包装类和正则表达式，并明确旧 API 与现代 API 的选择。',
    objectives: [
      '理解字符串不可变性、池化与构建策略。',
      '正确处理精确数值、随机数、日期时间与时区。',
      '掌握包装类、装箱拆箱和正则 API。',
      '识别 `finalize`、Date/Calendar/SimpleDateFormat 等旧用法风险。',
    ],
    concepts: [
      {
        name: 'String 不可变性与字符串池',
        detail:
          'String 对象内容创建后不变，便于共享、缓存 hash 和安全使用。字符串字面量通常驻留池中，`new String(...)` 会创建额外对象；内容比较使用 equals。',
        engineering:
          'API 参数和返回值优先 String；敏感口令若需要擦除可考虑受控 char[]，但仍需完整威胁模型。',
        pitfall: '用 `==` 比较内容，或在热循环中反复拼接产生大量临时对象。',
      },
      {
        name: 'StringBuilder 与 StringBuffer',
        detail:
          'StringBuilder 为可变字符序列、非线程安全；StringBuffer 方法同步、开销更高。编译器会优化简单单表达式拼接，但循环或复杂构建应显式使用 builder。',
        engineering:
          'builder 通常局部使用，无需同步；跨线程共享可变字符串本身通常是设计问题。',
        pitfall:
          '因为“线程安全”默认选择 StringBuffer，或错误共享同一个 StringBuilder。',
      },
      {
        name: 'System 与 Runtime',
        detail:
          'System 提供标准流、系统属性、环境访问、数组复制和时间源；Runtime 表示当前 JVM 与宿主环境交互，可注册 shutdown hook。`currentTimeMillis` 是墙上时间，测耗时优先 `nanoTime`。',
        engineering:
          '启动子进程优先 ProcessBuilder；系统退出和 shutdown hook 要考虑并发、超时和幂等。',
        pitfall: '用 Runtime.exec 拼接用户输入，或认为 shutdown hook 一定完成。',
      },
      {
        name: 'Math、Random 与安全随机',
        detail:
          'Math 提供纯数学函数和精确整数运算。`Random`/`ThreadLocalRandom` 适合普通模拟，`SplittableRandom` 适合可拆分并行算法；密码学令牌使用 SecureRandom。',
        engineering: '测试中注入确定种子，生产安全标识使用足够熵的 SecureRandom。',
        pitfall: '用 `Math.random()` 生成验证码、重置令牌或会话密钥。',
      },
      {
        name: 'BigInteger 与 BigDecimal',
        detail:
          'BigInteger 支持任意精度整数；BigDecimal 支持任意精度十进制并保留 scale。字符串构造最可预测，除法等非终止结果必须指定舍入模式。',
        engineering:
          '金额统一货币、scale 和 rounding policy；比较数值常用 compareTo，equals 同时比较 scale。',
        pitfall: '使用 `new BigDecimal(0.1)` 引入二进制浮点误差，或忽略除法舍入。',
      },
      {
        name: '旧 Date/Calendar 与现代 java.time',
        detail:
          'Date 表示时间线瞬时但旧 API 设计有限；Calendar 可变且月份等规则易错。现代代码使用 Instant、LocalDate、LocalTime、LocalDateTime、ZonedDateTime、OffsetDateTime 和 ZoneId。',
        engineering:
          '数据库/事件存绝对时间用 Instant，业务“某地某天某时”保留时区语义；跨边界明确 UTC 和格式。',
        pitfall: '把 LocalDateTime 当作全球唯一时间点，或用系统默认时区解析外部数据。',
      },
      {
        name: 'Duration、Period 与时间运算',
        detail:
          'Duration 表示基于秒/纳秒的时间量，适合耗时；Period 表示年月日，适合日历周期。夏令时切换使“一天”等于 24 小时的假设在 ZonedDateTime 上并不总成立。',
        engineering: '超时用 Duration，账期用 Period；测试注入 Clock 以控制当前时间。',
        pitfall: '用毫秒 long 传播所有时间语义，导致单位和日历规则混乱。',
      },
      {
        name: 'DateTimeFormatter 与数字格式化',
        detail:
          'DateTimeFormatter 不可变且线程安全；SimpleDateFormat 可变且非线程安全。NumberFormat 用于本地化显示，机器接口应使用明确、稳定格式。',
        engineering:
          'ISO-8601 用于跨系统时间文本；用户界面格式随 Locale；解析采用严格 ResolverStyle。',
        pitfall: '把一个 SimpleDateFormat 放进 static 字段供多线程共享。',
      },
      {
        name: '包装类与自动装箱',
        detail:
          'Integer 等包装类让基本值进入泛型和集合。装箱可能分配对象，拆箱 null 会抛 NPE；部分小整数缓存使 `==` 表现不一致。',
        engineering:
          '计算密集路径使用基本类型；可空语义显式处理；包装类型内容比较用 equals。',
        pitfall: '依赖 Integer 缓存范围用 `==` 比较，或忽略拆箱 null。',
      },
      {
        name: '正则 Pattern 与 Matcher',
        detail:
          'Pattern 是编译后的正则，可复用；Matcher 保存一次匹配状态。`matches` 匹配整个输入，`find` 查找子串。复杂回溯表达式可能导致灾难性性能。',
        engineering:
          '固定表达式预编译；对不受信输入限制长度和复杂度；结构化协议优先专用解析器。',
        pitfall: '用正则解析完整 HTML/JSON，或在循环中重复编译同一表达式。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["外部文本/数值/时间"] --> B["显式解析"]
  B --> C["强类型值对象"]
  C --> D["业务运算"]
  D --> E["显式格式化"]
  E --> F["日志/API/UI"]
\`\`\``,
    modern: [
      '日期时间首选 `java.time`；Date/Calendar/SimpleDateFormat 仅用于遗留接口适配。',
      '`System.runFinalizersOnExit` 与对象 `finalize` 路线已经退出现代实践。',
      'JDK 17 起增强的随机数生成器 API 可按算法需求选择，安全用途仍用 SecureRandom。',
      '格式化与解析必须明确 Locale、ZoneId、Charset 和舍入模式。',
    ],
    practice: [
      '实现跨时区会议时间转换，覆盖夏令时边界。',
      '实现 Money 值对象，统一 BigDecimal scale、舍入和货币。',
      '基准比较循环字符串 `+` 与 StringBuilder，并用 JFR 观察分配。',
    ],
    checklist: [
      '能说明 String 不可变与 StringBuilder 的使用边界。',
      '能选择正确随机数 API。',
      '能区分 Instant、LocalDateTime 与 ZonedDateTime。',
      '能指出包装类拆箱和正则回溯风险。',
    ],
    refs: [
      javaApi,
      coreLibraries,
      [
        'Date-Time API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/time/package-summary.html',
      ],
      [
        'Random Generator API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/random/package-summary.html',
      ],
    ],
  },
  {
    file: '07-Java集合框架.md',
    title: 'Java 集合框架：Collection、List、Set、Map、遍历、工具类与 Lambda',
    source: '《第7章 集合.pptx》',
    summary:
      '集合选择的本质是数据语义与复杂度选择。本章覆盖 Collection、List、Set、Map、Iterator、foreach、Collections、Arrays 和 Lambda，并补充不可变集合与并发集合。',
    objectives: [
      '按顺序、唯一性、键值关系和并发需求选择集合。',
      '理解 ArrayList、LinkedList、HashSet、TreeSet、HashMap 和 TreeMap 的核心约束。',
      '正确遍历、删除、排序和构造不可变视图。',
      '理解 equals/hashCode/Comparator 对集合行为的影响。',
    ],
    concepts: [
      {
        name: '集合层次与语义',
        detail:
          'Collection 是元素容器根接口，List 有序可重复，Set 表达唯一性，Queue/Deque 表达队列和双端操作；Map 是键值映射并不继承 Collection。接口类型用于声明需求，具体实现负责性能与附加顺序语义。',
        engineering:
          '方法参数和返回值优先最小接口；需要稳定迭代顺序时明确选 LinkedHash 系列或排序集合。',
        pitfall: '只凭“速度快”默认 HashMap/HashSet，忽略顺序、并发、空值和键可变性。',
      },
      {
        name: 'ArrayList 与 LinkedList',
        detail:
          'ArrayList 基于动态数组，随机访问快、尾部追加摊销 O(1)、中间插入删除需移动元素。LinkedList 是双向链表，同时实现 Deque；按索引访问 O(n)，节点对象和缓存局部性开销较大。',
        engineering:
          '大多数通用列表优先 ArrayList；真正的队首尾队列操作使用 ArrayDeque，少把 LinkedList 当性能默认项。',
        pitfall: '看到“中间插入 O(1)”就选 LinkedList，却忽略先找到节点需要 O(n)。',
      },
      {
        name: 'Iterator、增强 for 与结构修改',
        detail:
          '增强 for 对 Iterable 使用 Iterator。迭代期间直接调用集合结构修改方法可能触发 fail-fast `ConcurrentModificationException`；使用 Iterator.remove、removeIf 或创建新集合。',
        engineering:
          'fail-fast 是错误探测，不是线程安全保证；并发读写选择同步边界或并发集合。',
        pitfall: '把 ConcurrentModificationException 当成确定的并发控制机制。',
      },
      {
        name: 'HashSet、LinkedHashSet 与 TreeSet',
        detail:
          'HashSet 依赖 hashCode/equals 判重；LinkedHashSet 额外维护插入顺序；TreeSet 依赖自然顺序或 Comparator，操作通常 O(log n)。比较器返回 0 时 TreeSet 视元素等价。',
        engineering:
          '放入哈希集合后不要改变参与 equals/hashCode 的字段；排序规则与业务相等语义要一致或明确区别。',
        pitfall:
          '只重写 equals 不重写 hashCode，或比较器只比较一个非唯一字段造成元素“消失”。',
      },
      {
        name: 'HashMap 与 LinkedHashMap',
        detail:
          'HashMap 使用哈希桶，平均 get/put O(1)，冲突严重时桶可树化；允许一个 null key 和多个 null value。LinkedHashMap 可维护插入顺序或访问顺序，适合构造受控 LRU 结构。',
        engineering:
          '键应稳定且相等契约正确；容量估算要基于元素规模和负载因子，避免反复扩容。',
        pitfall: '在多线程中无保护共享 HashMap，或用可变对象做 key 后修改关键字段。',
      },
      {
        name: 'TreeMap、Properties 与枚举集合',
        detail:
          'TreeMap 按 key 排序并提供范围查询；Properties 是遗留字符串配置容器，现代配置通常有更强类型映射；EnumSet/EnumMap 对枚举键做紧凑高效表示。',
        engineering:
          '范围检索用 NavigableMap API；枚举状态集合优先 EnumSet 而非 HashSet。',
        pitfall: '把 Properties 当任意对象 Map，或忘记 TreeMap 比较器必须满足一致性。',
      },
      {
        name: 'Collections、Arrays 与不可修改集合',
        detail:
          'Collections 提供排序、查找、反转、包装视图；Arrays 提供数组排序、比较、复制和转 List。`List.of` 等工厂创建不可修改集合且拒绝 null；`unmodifiableList` 只是底层集合的只读视图。',
        engineering: '跨边界返回不可修改副本，使用 `List.copyOf` 隔离后续变化。',
        pitfall:
          '把 `Arrays.asList` 当可增删 ArrayList，或把只读视图误解为深度不可变快照。',
      },
      {
        name: 'Lambda、方法引用与 Stream 边界',
        detail:
          'Lambda 是函数式接口实例，捕获的局部变量必须 effectively final。Stream 描述惰性流水线，不是集合；中间操作直到终止操作才执行，并行流需要无共享可变状态。',
        engineering:
          '简单转换、过滤、汇总适合 Stream；复杂控制流和有副作用逻辑使用清晰循环。',
        pitfall: '在 forEach 中堆积业务副作用，或默认 parallelStream 一定更快。',
      },
      {
        name: '并发集合',
        detail:
          'ConcurrentHashMap、CopyOnWriteArrayList、BlockingQueue 等提供特定并发语义。复合操作仍需使用 `compute`、`merge`、`putIfAbsent` 等原子 API。',
        engineering: '根据读写比例、阻塞需求和一致性选择；先定义线程所有权再选容器。',
        pitfall: '使用线程安全集合后，把“先检查再执行”的多步逻辑误认为整体原子。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart TD
  A{"需要键值映射?"} -->|是| B{"需要排序/范围?"}
  B -->|是| C["TreeMap"]
  B -->|否| D["HashMap / LinkedHashMap"]
  A -->|否| E{"允许重复且有序?"}
  E -->|是| F["ArrayList / ArrayDeque"]
  E -->|否| G{"需要排序?"}
  G -->|是| H["TreeSet"]
  G -->|否| I["HashSet / LinkedHashSet"]
\`\`\``,
    modern: [
      '大多数通用 List 选择 ArrayList，队列选择 ArrayDeque，而不是机械使用 LinkedList。',
      '不可修改集合与深度不可变对象是两层概念。',
      '集合接口默认方法和 Stream 不能替代并发设计。',
      'JDK 21 起 SequencedCollection/Set/Map 为有序集合提供统一首尾访问模型。',
    ],
    practice: [
      '实现一个保留最近访问顺序的有界缓存，并测试淘汰顺序。',
      '构造可变 key 导致 HashMap 查找失败的案例，再改成 record key。',
      '分别用循环和 Stream 统计订单，比较可读性、异常处理和性能。',
    ],
    checklist: [
      '能基于语义和复杂度选择集合。',
      '能说明 equals/hashCode/Comparator 如何影响集合。',
      '能安全地在遍历期间删除元素。',
      '能区分不可修改视图、不可修改副本和并发集合。',
    ],
    refs: [
      [
        'Java Collections Framework',
        'https://docs.oracle.com/en/java/javase/26/core/java-collections-framework.html',
      ],
      javaApi,
      devJava,
    ],
  },
  {
    file: '08-Java泛型.md',
    title: 'Java 泛型：泛型类、接口、方法、通配符、边界与类型擦除',
    source: '《第8章 泛型.pptx》',
    summary:
      '泛型把类型错误提前到编译期，并减少强制转换。真正的难点是型变、通配符、边界和擦除后的限制。',
    objectives: [
      '定义并使用泛型类、接口和泛型方法。',
      '理解不变性与 `? extends`/`? super`。',
      '掌握类型推断、边界、擦除和桥接方法。',
      '避免 raw type、heap pollution 和不安全可变参数。',
    ],
    concepts: [
      {
        name: '泛型动机与参数化类型',
        detail:
          '`List<String>` 把元素类型写入静态契约，使编译器检查插入和读取。Java 泛型是不变的：即使 Integer 是 Number 子类，List<Integer> 也不是 List<Number> 子类。',
        engineering: '公共 API 尽量完整声明类型参数，禁止无理由 raw type。',
        pitfall: '把泛型当作运行时自动类型转换，或假设容器类型协变。',
      },
      {
        name: '泛型类与接口',
        detail:
          '类型参数写在类/接口名后，可在字段、方法参数和返回值中使用。static 成员不能直接使用类的类型参数，因为它属于类本身而非某个参数化实例。',
        engineering:
          '类型参数名遵循 T、E、K、V 或有语义的全名；避免一个类型上堆积过多相互依赖参数。',
        pitfall: '在 static 字段中使用 T，或创建职责不清的“万能泛型容器”。',
      },
      {
        name: '泛型方法与类型推断',
        detail:
          '泛型方法在返回类型前单独声明 `<T>`，与类是否泛型无关。编译器根据实参、目标类型和边界推断 T，必要时可显式写类型见证。',
        engineering:
          '泛型方法让输入与输出关系可检查；若 T 只出现一次且不建立关系，通配符或普通基类可能更合适。',
        pitfall: '误把返回类型前的 `<T>` 省略，或让无意义 T 增加 API 复杂度。',
      },
      {
        name: '上界、下界与 PECS',
        detail:
          '`T extends Bound` 限制类型参数；`? extends T` 适合生产 T 的来源，安全读取但不能添加具体 T；`? super T` 适合消费 T 的目标，可写入 T，读取只保证 Object。PECS 是 Producer Extends, Consumer Super。',
        engineering:
          '集合复制、比较器和回调 API 使用通配符提高可组合性，例如 `Comparator<? super T>`。',
        pitfall: '认为 extends 通配符集合完全只读，或试图从 super 通配符直接读出 T。',
      },
      {
        name: '无界通配符与捕获',
        detail:
          '`List<?>` 表示某个未知但一致的元素类型，比 raw `List` 安全。编译器可通过 wildcard capture 在私有辅助泛型方法中捕获这个未知类型。',
        engineering:
          '只需读取 Object 或与元素类型无关的操作时用 `?`，而不是 raw type。',
        pitfall: '把 `List<?>` 与 `List<Object>` 等同；后者允许添加任意 Object。',
      },
      {
        name: '类型擦除与 reifiable 类型',
        detail:
          '多数泛型信息在编译后擦除为上界，并可能生成 bridge method 保持多态。运行时不能直接检查 `instanceof List<String>`，也不能 `new T()` 或创建 `new T[]`。',
        engineering: '需要运行时类型时显式传入 `Class<T>`、TypeToken 或工厂函数。',
        pitfall: '以为每个参数化类型在 JVM 中都有独立类，或依赖被擦除的元素类型反射。',
      },
      {
        name: '泛型数组、可变参数与堆污染',
        detail:
          '数组协变且运行时检查元素类型，泛型不变且擦除，两者组合会破坏类型安全，因此禁止直接创建泛型数组。泛型 varargs 可能产生 heap pollution，`@SafeVarargs` 只用于实现确实不泄漏/写坏数组时。',
        engineering: '优先 List 替代泛型数组；对外 API 减少泛型 varargs。',
        pitfall: '为了消除警告随意添加 `@SuppressWarnings` 或 `@SafeVarargs`。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["List<Integer>"] --> B["? extends Number：读取 Number"]
  C["List<Object>"] --> D["? super Integer：写入 Integer"]
  B --> E["PECS"]
  D --> E
\`\`\``,
    example: `## 3.8 PECS 示例

\`\`\`java
static <T> void copy(List<? extends T> source, List<? super T> target) {
    for (T value : source) {
        target.add(value);
    }
}
\`\`\`
`,
    modern: [
      '模式匹配并未改变泛型擦除；仍不能检查 `List<String>` 的运行时元素类型。',
      '优先修复 unchecked warning 的根因，而不是全局 suppress。',
      'record 可作为稳定泛型值容器，但其类型参数同样擦除。',
      'API 返回具体 T 关系时用类型参数，只读未知集合时用通配符。',
    ],
    practice: [
      '实现泛型 Result<T,E> 或 Page<T>，并设计映射方法。',
      '用 Class<T> 工厂安全创建实例，比较反射工厂与 Supplier<T>。',
      '制造一个 heap pollution 案例并解释为何运行时才失败。',
    ],
    checklist: [
      '能解释 Java 泛型不变性。',
      '能正确应用 PECS。',
      '能说明擦除带来的四类限制。',
      '能区分 raw type、List<?> 和 List<Object>。',
    ],
    refs: [
      ['Java Generics Tutorial', 'https://dev.java/learn/generics/'],
      jls,
      javaApi,
    ],
  },
  {
    file: '09-反射机制.md',
    title: 'Java 反射机制：Class、构造器、字段、方法、注解与动态代理',
    source: '《第9章 反射机制.pptx》',
    summary:
      '反射让程序在运行时检查和操作类型结构，是框架、序列化、依赖注入和测试工具的重要基础，也受到封装、模块和性能边界约束。',
    objectives: [
      '获得 Class 对象并检查类型结构。',
      '通过 Constructor、Method、Field 安全调用成员。',
      '理解注解、动态代理、MethodHandle 与模块访问。',
      '替换课件中的过时 `Class.newInstance()` 用法。',
    ],
    concepts: [
      {
        name: 'Class 对象与类元数据',
        detail:
          '每个已加载类型由一个 Class 对象表示，可通过类字面量、对象 getClass 或 Class.forName 获得。Class 同时携带名称、修饰符、父类、接口、组件类型、record/sealed 等结构信息。',
        engineering:
          '类字面量类型安全且不触发字符串拼写错误；按名称加载适合插件和配置驱动场景。',
        pitfall:
          '认为同名类一定有同一个 Class；不同 ClassLoader 加载的同名类仍是不同类型。',
      },
      {
        name: '构造器实例化',
        detail:
          '使用 `getDeclaredConstructor(parameterTypes...).newInstance(args...)` 获取并调用构造器。调用会包装目标异常，需要处理 ReflectiveOperationException 与 InvocationTargetException。',
        engineering: '优先显式工厂或 Supplier；反射实例化集中封装并验证允许类型。',
        pitfall:
          '继续使用已废弃的 `Class.newInstance()`，它要求无参构造且异常语义较差。',
      },
      {
        name: '获取接口、父类、构造器、方法与字段',
        detail:
          '`getXxx` 通常面向 public 且可含继承成员，`getDeclaredXxx` 面向当前类声明的全部可见性成员。反射数组返回顺序通常不应当作业务契约。',
        engineering: '按名称与签名精确定位并缓存元数据；对框架扫描建立明确包边界。',
        pitfall: '依赖反射返回数组顺序，或把 inherited 与 declared 语义混淆。',
      },
      {
        name: 'Method 调用与参数',
        detail:
          'Method.invoke 的首参为接收者，static 方法可传 null；后续实参需兼容参数类型。目标方法抛出的异常封装在 InvocationTargetException cause 中。',
        engineering: '框架边界做参数转换和异常解包，业务代码不应到处散落反射调用。',
        pitfall: '只记录 InvocationTargetException 而不查看 cause。',
      },
      {
        name: 'Field 访问与封装',
        detail:
          'Field 可读写实例或静态字段，但深反射受 Java 语言访问检查和 JPMS 模块开放规则约束。`setAccessible(true)` 不是跨模块无限通行证。',
        engineering:
          '优先构造器、方法和标准序列化扩展点；需要模块反射时在 module-info 或启动参数中最小化 opens。',
        pitfall: '把突破 private 当正常业务 API，导致升级与安全边界脆弱。',
      },
      {
        name: '注解与保留策略',
        detail:
          '注解由 Target 限定位置、Retention 决定 SOURCE/CLASS/RUNTIME 可见性。运行时框架读取 RUNTIME 注解；编译期处理器读取源码/模型生成代码。',
        engineering:
          '可在编译期解决的问题优先 annotation processor，减少运行时扫描和反射。',
        pitfall: '忘记 RUNTIME retention 后期待运行时反射读到注解。',
      },
      {
        name: '动态代理、MethodHandle 与性能',
        detail:
          'JDK Proxy 为接口生成代理，InvocationHandler 拦截调用；类代理通常借助字节码生成。MethodHandle 是更底层、可组合的调用能力，JIT 更容易优化，但 API 复杂。',
        engineering:
          'AOP、事务和 RPC 客户端可用代理实现，但必须理解 self-invocation、final 方法和异常传播限制。',
        pitfall:
          '认为代理等同于真实对象全部语义，或忽略 equals/hashCode/default method。',
      },
      {
        name: 'ClassLoader 与插件边界',
        detail:
          '类由“全限定名 + 定义它的 ClassLoader”共同标识。父级委派减少核心类重复，插件系统常建立隔离加载器并通过共享接口通信。',
        engineering:
          '插件卸载要同时释放线程、ThreadLocal、缓存和对加载器的引用，否则产生 metaspace 泄漏。',
        pitfall: '只删除插件对象引用，却让全局缓存继续引用 Class 或 Method。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["ClassLoader"] --> B["Class<?> 元数据"]
  B --> C["Constructor"]
  B --> D["Method"]
  B --> E["Field"]
  B --> F["Annotation"]
  C --> G["受控实例化"]
  D --> H["受控调用"]
\`\`\``,
    example: `## 3.9 现代构造器调用

\`\`\`java
Class<? extends Task> type = Class.forName(className).asSubclass(Task.class);
Task task = type.getDeclaredConstructor().newInstance();
\`\`\`
`,
    modern: [
      '`Class.newInstance()` 已废弃，使用 `getDeclaredConstructor().newInstance()`。',
      'JPMS 强封装会限制深反射；框架升级要检查 `opens` 而不是长期堆叠 `--add-opens`。',
      '高频路径可缓存反射元数据，但缓存要考虑 ClassLoader 生命周期。',
      '代码生成、方法句柄或明确接口常比深反射更稳定。',
    ],
    practice: [
      '实现一个只允许白名单类型的注解驱动命令注册器。',
      '比较 getMethods 与 getDeclaredMethods 的返回差异。',
      '构造插件 ClassLoader 泄漏案例并用类卸载日志观察。',
    ],
    checklist: [
      '能区分三种获得 Class 的方式及初始化副作用。',
      '能正确解包反射调用异常。',
      '能解释 public/declared、访问控制和 JPMS opens。',
      '能说明 ClassLoader 身份和卸载条件。',
    ],
    refs: [
      [
        'Core Reflection API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/lang/reflect/package-summary.html',
      ],
      [
        'Class API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/lang/Class.html',
      ],
      jls,
    ],
  },
  {
    file: '10-IO与NIO.md',
    title: 'Java I/O 与 NIO.2：文件、字节流、字符流、转换流与序列化',
    source: '《第10章 IO.pptx》',
    summary:
      '本章覆盖 File、目录遍历删除、字节/字符流、转换流、复制和对象序列化，并补充 Path/Files、缓冲、字符集、原子写入与反序列化防护。',
    objectives: [
      '区分路径模型、字节流与字符流。',
      '正确使用缓冲、Charset 和 try-with-resources。',
      '实现安全遍历、复制、原子替换与大文件处理。',
      '理解 Java 原生序列化的兼容与安全风险。',
    ],
    concepts: [
      {
        name: 'File 与 Path/Files',
        detail:
          'File 是旧式路径抽象；现代 NIO.2 使用 Path 表示路径、Files 执行检查和 I/O。路径可为相对或绝对，normalize 只做语法化简，toRealPath 才解析实际文件系统和符号链接。',
        engineering:
          '安全边界先解析允许根目录，再检查最终路径仍位于根内；对符号链接策略做明确选择。',
        pitfall: '只做字符串前缀检查防目录穿越，或认为 normalize 等同于真实路径。',
      },
      {
        name: '文件属性、创建、删除与目录遍历',
        detail:
          'Files 可读取 BasicFileAttributes、创建目录/临时文件、删除与移动。目录非空时不能直接删除；walkFileTree 支持访问前后回调和失败处理。',
        engineering:
          '递归操作处理权限错误、符号链接循环、并发变化和部分完成，记录可恢复进度。',
        pitfall: '把 `listFiles()` 的 null 或遍历中途异常当作空目录。',
      },
      {
        name: '字节流',
        detail:
          'InputStream/OutputStream 处理原始字节；read 返回实际读取数，-1 表示 EOF。单次 read 不保证填满缓冲区，write 后还要按所有权 flush/close。',
        engineering:
          '图片、压缩包和协议帧按字节处理；使用缓冲或 transferTo/copy 提升吞吐。',
        pitfall: '忽略 read 返回值或用 available 判断文件剩余总长度。',
      },
      {
        name: '字符流与字符集',
        detail:
          'Reader/Writer 处理字符；InputStreamReader/OutputStreamWriter 在字节和字符间按 Charset 转换。UTF-8 应显式指定，解码错误策略需依据数据契约设置。',
        engineering:
          '文本边界统一 UTF-8；内部使用 String/char/code point；协议必须声明编码。',
        pitfall: '依赖平台默认编码，导致 Windows、Linux 或容器结果不同。',
      },
      {
        name: '缓冲、复制与大文件',
        detail:
          'BufferedInputStream/Reader 减少系统调用；Files.copy、InputStream.transferTo 可表达常见复制。`readAllBytes`/`readString` 会一次载入内存，不适合不受控大文件。',
        engineering:
          '根据文件上限选择流式处理；计算摘要、压缩、上传时保持 backpressure 和大小限制。',
        pitfall: '对用户上传直接 readAllBytes，造成内存峰值或 OOM。',
      },
      {
        name: '原子写入与文件一致性',
        detail:
          '可靠更新通常先在同目录写临时文件、flush/必要时 fsync，再使用 ATOMIC_MOVE 替换；是否支持原子移动取决于文件系统。',
        engineering:
          '设计崩溃恢复与旧版本保留，捕获 AtomicMoveNotSupportedException 并明确降级语义。',
        pitfall: '直接覆盖唯一配置文件，进程中断后留下半写内容。',
      },
      {
        name: '对象序列化与 serialVersionUID',
        detail:
          'ObjectOutputStream/ObjectInputStream 把 Serializable 对象图编码为 Java 专用格式；serialVersionUID 参与版本兼容判断，transient 排除字段。构造器和不变量恢复语义复杂。',
        engineering:
          '跨服务和长期存储优先 JSON/CBOR/Protobuf 等显式 schema；原生序列化仅限受控内部场景。',
        pitfall: '反序列化不可信字节，可能触发 gadget 链和资源消耗攻击。',
      },
      {
        name: '序列化过滤与边界防护',
        detail:
          'ObjectInputFilter 可限制允许类、对象深度、数组长度和引用数量，但并不能把任意不可信序列化自动变安全。',
        engineering:
          '若遗留协议必须使用，配置严格白名单、大小/深度限制和隔离层，并计划迁移。',
        pitfall: '仅依赖 serialVersionUID 或签名字段判断输入安全。',
      },
    ],
    diagram: `\`\`\`mermaid
flowchart LR
  A["Path"] --> B["Files.newInputStream"]
  B --> C["字节流"]
  C --> D["InputStreamReader + UTF-8"]
  D --> E["字符流"]
  E --> F["解析后的领域对象"]
\`\`\``,
    example: `## 3.9 UTF-8 流式读取

\`\`\`java
try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    for (String line; (line = reader.readLine()) != null; ) {
        process(line);
    }
}
\`\`\`
`,
    modern: [
      '新代码优先 Path/Files，File 用于兼容旧 API。',
      '文本始终显式 Charset，避免平台默认编码。',
      '原生 Java 序列化不是通用跨服务格式；不可信数据边界避免使用。',
      '递归删除和移动必须定义符号链接、失败恢复和根目录约束。',
    ],
    practice: [
      '实现限定根目录的文件浏览、复制和删除工具并测试目录穿越。',
      '用流式方式处理大日志，比较 readAllLines 的内存行为。',
      '实现临时文件 + 原子替换的配置保存流程。',
    ],
    checklist: [
      '能区分字节流、字符流和转换流。',
      '能解释一次 read 为什么可能少于缓冲区长度。',
      '能设计安全的路径解析和原子写入。',
      '能说明 Java 原生序列化的兼容与安全限制。',
    ],
    refs: [
      [
        'Java NIO File API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/nio/file/package-summary.html',
      ],
      [
        'Java I/O API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/io/package-summary.html',
      ],
      [
        'Serialization Filtering',
        'https://docs.oracle.com/en/java/javase/26/core/serialization-filtering1.html',
      ],
    ],
  },
  {
    file: '11-JDBC数据库访问.md',
    title: 'JDBC 数据库访问：驱动、连接、Statement、事务、批处理与连接池',
    source: '《第11章 JDBC.pptx》',
    summary:
      'JDBC 是 Java 关系数据库访问的标准 API。课件的“加载驱动—连接—执行—处理结果—关闭”流程需要用 PreparedStatement、事务、连接池和异常边界现代化。',
    objectives: [
      '理解 JDBC 驱动、URL、Connection、Statement 与 ResultSet。',
      '使用 PreparedStatement 防注入并正确绑定类型。',
      '控制事务、隔离、批处理和资源释放。',
      '理解连接池、超时、fetch size 与可观测性。',
    ],
    concepts: [
      {
        name: 'JDBC 架构与驱动',
        detail:
          '`java.sql` 定义统一接口，数据库厂商驱动实现协议。现代 JDBC 4 驱动通过 service provider 自动注册，通常无需手写 `Class.forName`；连接 URL、属性和驱动版本必须匹配服务端。',
        engineering: '驱动作为构建依赖锁版本，凭据来自安全配置，不写入源码。',
        pitfall: '复制 jar 到任意目录，或把 Class.forName 当成每次查询都要做的动作。',
      },
      {
        name: 'Connection 与资源所有权',
        detail:
          'Connection 表示数据库会话和事务上下文；Statement/ResultSet 隶属于连接。所有对象按逆序关闭，连接池场景的 close 通常是归还池而非物理断开。',
        engineering:
          'try-with-resources 明确作用域；事务方法内不要把 ResultSet 暴露到连接关闭后。',
        pitfall: '把单个 Connection 放进 static 跨线程共享。',
      },
      {
        name: 'Statement、PreparedStatement 与 SQL 注入',
        detail:
          'PreparedStatement 将 SQL 结构与值参数分离，驱动按类型绑定，避免值位置的 SQL 注入并利于复用。表名、列名和排序方向不能用 `?` 参数化，必须来自白名单。',
        engineering: '所有外部值使用绑定参数；动态标识符映射到代码内枚举。',
        pitfall: '字符串拼接用户输入，或错误认为对单引号转义就覆盖全部注入风险。',
      },
      {
        name: 'ResultSet 与类型映射',
        detail:
          'ResultSet 游标初始位于第一行之前，调用 next 前进；按列名读取更可维护。SQL NULL 与 Java 基本类型默认值需通过包装类型、wasNull 或 getObject(Class) 区分。',
        engineering: '集中 row mapper，显式处理时区、Decimal、枚举和 null。',
        pitfall: '读取 int 得到 0 后无法区分数据库 NULL 与真实 0。',
      },
      {
        name: '事务与隔离级别',
        detail:
          '关闭 autoCommit 后，同一 Connection 上的操作直到 commit/rollback 形成事务。隔离级别处理脏读、不可重复读和幻读，但数据库实现和 MVCC 细节不同。',
        engineering:
          '事务围绕业务不变量保持短小；异常时 rollback，finally 恢复池所需连接状态。',
        pitfall:
          '跨远程调用长时间持有数据库事务，或忘记 rollback 让连接回池时状态污染。',
      },
      {
        name: '批处理、生成键与大结果集',
        detail:
          '`addBatch/executeBatch` 减少往返；`RETURN_GENERATED_KEYS` 读取生成主键。大结果集需要驱动相关 fetch size、流式游标和事务设置。',
        engineering:
          '批量大小通过压测确定，处理部分失败和重复执行；分页优先稳定 keyset。',
        pitfall: '把百万行全部读入 List，或忽略批处理部分成功语义。',
      },
      {
        name: '连接池、超时与泄漏检测',
        detail:
          '连接建立昂贵，生产使用 HikariCP 等连接池。连接超时、查询超时、socket 超时和事务超时是不同层次；池大小受数据库容量和请求模型约束。',
        engineering:
          '监控 active/idle/pending、获取等待、查询耗时和泄漏；池越大不一定吞吐越高。',
        pitfall: '只调大连接池掩盖慢 SQL，最终让数据库上下文切换更严重。',
      },
      {
        name: 'DAO 边界与 ORM 关系',
        detail:
          'JDBC 提供最底层可控能力，MyBatis/JPA 在其上减少映射样板，但事务、连接池和 SQL 性能仍回到 JDBC/数据库语义。',
        engineering:
          '关键 SQL 保持可见、可测试、可解释；框架抽象不能替代 EXPLAIN 和事务设计。',
        pitfall: '使用 ORM 后不再理解数据库连接、事务和 N+1。',
      },
    ],
    diagram: `\`\`\`mermaid
sequenceDiagram
  participant App
  participant Pool
  participant DB
  App->>Pool: getConnection()
  App->>DB: BEGIN / prepared statement
  DB-->>App: ResultSet / update count
  App->>DB: COMMIT 或 ROLLBACK
  App->>Pool: close() 归还连接
\`\`\``,
    example: `## 3.9 安全查询与事务

\`\`\`java
try (Connection c = dataSource.getConnection()) {
    c.setAutoCommit(false);
    try (PreparedStatement ps = c.prepareStatement(
            "update account set balance = balance - ? where id = ?")) {
        ps.setBigDecimal(1, amount);
        ps.setLong(2, accountId);
        if (ps.executeUpdate() != 1) throw new SQLException("账户不存在");
        c.commit();
    } catch (Exception e) {
        c.rollback();
        throw e;
    }
}
\`\`\`
`,
    modern: [
      'JDBC 4 驱动通常自动注册，Class.forName 主要用于遗留兼容。',
      '值参数用 PreparedStatement；动态表/列名使用代码白名单。',
      '生产连接来自 DataSource/连接池，事务连接不可跨线程共享。',
      'H2 与目标数据库行为有差异，关键集成测试使用 Testcontainers 运行真实数据库。',
    ],
    practice: [
      '实现转账事务，测试余额不足、并发更新和中途异常回滚。',
      '比较 offset 分页与 keyset 分页的执行计划。',
      '用 Testcontainers 运行 MySQL/PostgreSQL 集成测试并检查连接泄漏。',
    ],
    checklist: [
      '能完整解释 JDBC 调用链和资源关闭顺序。',
      '能防止值注入和动态标识符注入。',
      '能设计事务与隔离级别测试。',
      '能解释连接池大小和四类超时。',
    ],
    refs: [
      [
        'JDBC API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.sql/module-summary.html',
      ],
      ['JDBC Basics', 'https://docs.oracle.com/javase/tutorial/jdbc/basics/'],
      ['HikariCP', 'https://github.com/brettwooldridge/HikariCP'],
      [
        'Testcontainers JDBC',
        'https://java.testcontainers.org/modules/databases/jdbc/',
      ],
    ],
  },
  {
    file: '12-Java并发与多线程.md',
    title: 'Java 并发与多线程：生命周期、同步、锁、线程池、虚拟线程与取消',
    source: '《第12章 多线程.pptx》',
    summary:
      '本章覆盖进程/线程、Thread/Runnable/Callable、FutureTask、后台线程、状态、优先级、sleep/join/yield/interrupt、同步、死锁和 ReentrantLock，并扩展到 JMM、Executor、CompletableFuture 与虚拟线程。',
    objectives: [
      '理解线程状态、调度不确定性和 Java Memory Model。',
      '使用正确的任务抽象、同步原语与取消协议。',
      '识别竞态、可见性、原子性、死锁和资源耗尽。',
      '选择平台线程池、虚拟线程或异步 API。',
    ],
    concepts: [
      {
        name: '进程、平台线程与虚拟线程',
        detail:
          '进程拥有独立地址空间；线程共享进程资源但有各自栈。平台线程通常映射 OS 线程，虚拟线程由 JVM 调度，适合大量阻塞 I/O 任务，不会让 CPU 密集计算自动变快。',
        engineering:
          '先识别 CPU-bound 与 blocking I/O；虚拟线程仍需限制下游连接、速率和内存资源。',
        pitfall: '把“百万虚拟线程”理解为数据库也能承受百万并发请求。',
      },
      {
        name: 'Thread、Runnable、Callable 与 Future',
        detail:
          'Thread 是执行载体；Runnable 无返回值；Callable 可返回值并抛受检异常；Future 表示异步结果与取消。继承 Thread 会把任务与线程机制耦合。',
        engineering:
          '业务任务实现 Callable/Runnable，由 Executor 管理执行；直接 new Thread 仅用于小型受控场景。',
        pitfall: '在线上请求中无限创建平台线程，或调用 run 误以为启动了新线程。',
      },
      {
        name: '线程状态与调度方法',
        detail:
          'Thread.State 包含 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING、TERMINATED。sleep 进入定时等待但不释放锁，join 等待目标结束，yield 只是调度提示，优先级不提供可靠业务顺序。',
        engineering: '用同步原语表达先后关系，不靠 sleep、yield 或 priority“碰运气”。',
        pitfall: '把 Java RUNNABLE 等同于正在占用 CPU，或用 sleep 修复竞态。',
      },
      {
        name: '中断与协作式取消',
        detail:
          'interrupt 设置中断状态，阻塞方法可能抛 InterruptedException 并清除状态。任务应尽快响应取消；无法处理时恢复中断 `Thread.currentThread().interrupt()` 并退出。',
        engineering: '循环检查 interrupted，关闭/取消下游资源，定义幂等停止流程。',
        pitfall: '捕获 InterruptedException 后吞掉，导致线程池无法及时关闭。',
      },
      {
        name: '竞态、可见性、原子性与 happens-before',
        detail:
          '多个线程无同步访问共享可变状态会产生数据竞争。volatile 提供可见性和特定顺序保证，但 `count++` 仍不是原子。锁、volatile、线程启动/结束和并发容器建立 happens-before 关系。',
        engineering: '优先不可变数据、线程封闭和消息传递；共享状态使用锁或原子 API。',
        pitfall: '认为 volatile 等同于锁，或以单次测试没有失败证明线程安全。',
      },
      {
        name: 'synchronized、wait/notify 与条件队列',
        detail:
          'synchronized 同时提供互斥与内存可见性；实例同步锁 this，static 同步锁 Class。wait 必须在持锁时调用、会释放锁，并应在 while 条件循环中等待；notify 只唤醒一个等待者。',
        engineering:
          '高层 BlockingQueue、CountDownLatch 等通常比手写 wait/notify 更安全。',
        pitfall: '用 if 代替 while 等待条件，忽略虚假唤醒和条件被其他线程再次改变。',
      },
      {
        name: 'ReentrantLock 与并发原语',
        detail:
          'ReentrantLock 支持可中断获取、超时尝试、公平策略和多个 Condition；必须在 finally unlock。Semaphore 控制并发许可，CountDownLatch 等待一次性事件，CyclicBarrier/Phaser 协调阶段。',
        engineering: '只在需要额外能力时从 synchronized 升级到显式锁，并文档化锁顺序。',
        pitfall: '漏 unlock，或把公平锁当作免费且绝对公平。',
      },
      {
        name: '死锁、活锁与饥饿',
        detail:
          '死锁常满足互斥、持有并等待、不可剥夺和循环等待。固定锁顺序、减少嵌套、tryLock 超时可降低风险。活锁是线程不断响应却无进展，饥饿是长期得不到资源。',
        engineering: '线程转储、JFR 和 jcmd 用于定位锁拥有者和等待链。',
        pitfall: '把所有“程序卡住”都叫死锁，忽略阻塞 I/O、线程池饥饿和外部依赖。',
      },
      {
        name: 'Executor、线程池与背压',
        detail:
          'ThreadPoolExecutor 由 core/max、队列、keepAlive、ThreadFactory 和拒绝策略组成。无界队列可能积压内存，有界队列配合拒绝/降级形成背压。',
        engineering:
          'CPU 池大小接近核数；阻塞池依据等待/计算比例但受下游容量约束；任务记录 trace 和等待时间。',
        pitfall: '使用 Executors.newFixedThreadPool 默认无界队列后忽略积压。',
      },
      {
        name: 'CompletableFuture 与结构化并发',
        detail:
          'CompletableFuture 组合异步阶段，但默认 commonPool 与异常链需谨慎。Structured Concurrency 在 JDK 26 仍为 preview，用词法作用域管理子任务生命周期、失败传播和取消。',
        engineering: '生产默认依赖稳定 API；试用 preview 时隔离模块并准备迁移。',
        pitfall:
          '只组合成功路径，忽略 exceptionally/handle、超时和取消；把 preview 当稳定长期 API。',
      },
    ],
    diagram: `\`\`\`mermaid
stateDiagram-v2
  [*] --> NEW
  NEW --> RUNNABLE: start()
  RUNNABLE --> BLOCKED: 等待监视器锁
  RUNNABLE --> WAITING: wait/join/park
  RUNNABLE --> TIMED_WAITING: sleep/timeout
  BLOCKED --> RUNNABLE
  WAITING --> RUNNABLE
  TIMED_WAITING --> RUNNABLE
  RUNNABLE --> TERMINATED
\`\`\``,
    modern: [
      '优先任务 + Executor，而不是业务类继承 Thread。',
      '虚拟线程适合高并发阻塞 I/O，仍要对数据库、文件和远端服务做限流。',
      'Structured Concurrency 在 JDK 26 是第六次 preview，学习时必须标注实验状态。',
      '`Thread.stop/suspend/resume` 不属于可靠取消方案；使用 interrupt 和协作式清理。',
    ],
    practice: [
      '实现有界生产者消费者并验证背压、取消和关闭。',
      '分别用平台线程池和虚拟线程执行阻塞 HTTP 任务，测量吞吐与资源。',
      '制造锁顺序死锁，用 `jcmd Thread.print` 或 JFR 定位。',
    ],
    checklist: [
      '能解释六种 Thread.State 和 RUNNABLE 的含义。',
      '能区分 volatile、锁和原子类。',
      '能设计中断、超时和线程池关闭流程。',
      '能说明虚拟线程的优势与非目标。',
    ],
    refs: [
      [
        'Thread API Java 26',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/lang/Thread.html',
      ],
      [
        'Java Concurrency Utilities',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/concurrent/package-summary.html',
      ],
      [
        'Java Virtual Threads Guide',
        'https://docs.oracle.com/en/java/javase/26/core/virtual-threads.html',
      ],
      ['JEP 525 Structured Concurrency', 'https://openjdk.org/jeps/525'],
    ],
  },
  {
    file: '13-Java网络编程.md',
    title: 'Java 网络编程：TCP、UDP、IP、端口、Socket、URL 与 HTTP Client',
    source: '《第13章 网络编程.pptx》',
    summary:
      '本章覆盖网络协议、TCP/UDP、IP/端口、InetAddress、URL、ServerSocket/Socket、DatagramPacket/DatagramSocket 和多线程服务端，并补充协议分帧、超时、TLS 与 HTTP Client。',
    objectives: [
      '理解 DNS、IP、端口、TCP、UDP 和应用协议分层。',
      '实现有超时、分帧和资源上限的 TCP/UDP 程序。',
      '使用 URI/URL 与现代 HttpClient。',
      '识别半包粘包、阻塞、重试和安全边界。',
    ],
    concepts: [
      {
        name: '网络分层、地址与端口',
        detail:
          'IP 提供主机间寻址与分组传输，TCP/UDP 用端口区分主机上的通信端点，应用协议定义字节含义。DNS 将域名解析为地址，解析结果可能随时间和网络视图变化。',
        engineering:
          '配置使用主机名和服务发现，日志同时记录逻辑服务、解析地址和 trace id。',
        pitfall: '把端口当进程永久身份，或缓存 DNS 结果而不考虑 TTL 与故障切换。',
      },
      {
        name: 'TCP 与 UDP',
        detail:
          'TCP 提供有序可靠字节流、拥塞控制和连接语义，但不保留消息边界；UDP 提供数据报，无连接、可能丢失/乱序/重复且有大小限制。',
        engineering:
          '可靠性、顺序和重传由协议层决定；UDP 应用需自行定义消息 ID、重试或容错。',
        pitfall: '认为一次 TCP write 对应对端一次 read，导致半包/粘包错误。',
      },
      {
        name: 'InetAddress、URI 与 URL',
        detail:
          'InetAddress 表示 IP 地址和解析操作；URI 是标识符语法，URL 还能打开资源连接。构造 URI 时应按组件编码，不能简单字符串拼接用户输入。',
        engineering:
          '服务端请求外部 URL 要防 SSRF，解析后限制 scheme、主机、最终地址和重定向。',
        pitfall: '只检查原始 URL 文本，忽略 DNS 重绑定、IPv6 和重定向。',
      },
      {
        name: 'ServerSocket 与 Socket',
        detail:
          'ServerSocket bind/listen/accept 返回连接 Socket；Socket 的 InputStream/OutputStream 表示双向字节流。读超时、连接超时、半关闭和 close 都有不同语义。',
        engineering:
          '连接数、消息大小、空闲时间和处理并发都要有上限；每连接资源在 finally/try-with-resources 中释放。',
        pitfall: 'accept 后无限创建平台线程，或永远阻塞读取无终止协议的数据。',
      },
      {
        name: '应用层分帧',
        detail:
          'TCP 字节流需要长度前缀、分隔符、固定长度或自描述协议确定消息边界。长度字段必须校验非负与最大值，读取应循环直到满帧或 EOF。',
        engineering:
          '协议定义版本、编码、长度、校验、错误码和幂等语义；先写解析器模糊测试。',
        pitfall: '信任远端声明的巨大长度并直接分配数组。',
      },
      {
        name: 'DatagramPacket 与 DatagramSocket',
        detail:
          'DatagramPacket 封装缓冲区、长度和地址；DatagramSocket 发送/接收数据报。接收缓冲区小于报文时数据可能截断。',
        engineering:
          '限制报文大小，验证来源，加入请求 ID、防重和超时；需要可靠流时选择 TCP/QUIC 等。',
        pitfall: '假设 UDP send 成功等同于对端业务已处理。',
      },
      {
        name: '并发服务端与 NIO',
        detail:
          '传统阻塞模型可使用有界线程池或虚拟线程；NIO Selector 适合大量连接事件复用，但状态机和缓冲管理更复杂。Netty 在 NIO 之上提供事件循环与 pipeline。',
        engineering:
          '根据连接量、处理模型和团队能力选择；先保证协议正确和背压，再追求事件驱动性能。',
        pitfall: '为普通业务过早手写 Selector，产生难测状态机和缓冲 bug。',
      },
      {
        name: 'HttpClient、TLS、超时与重试',
        detail:
          'JDK HttpClient 支持同步/异步、HTTP/1.1、HTTP/2，JDK 26 加入 HTTP/3。连接超时与请求超时需分别配置；TLS 必须验证证书和主机名。重试仅对幂等或带幂等键操作安全。',
        engineering: '统一客户端封装连接池、超时、重试预算、限流、trace 与指标。',
        pitfall: '关闭证书校验解决环境问题，或对支付 POST 无条件重试。',
      },
    ],
    diagram: `\`\`\`mermaid
sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: TCP 连接
  C->>S: 长度前缀 + payload
  S->>S: 校验长度/协议/权限
  S-->>C: 状态码 + 长度 + payload
  C->>S: FIN / close
\`\`\``,
    modern: [
      'TCP 是字节流，不携带消息边界。',
      '高并发阻塞 I/O 可先评估虚拟线程，事件循环适用于需要精细连接控制的场景。',
      'JDK 26 HttpClient 已支持 HTTP/3；生产采用前先验证代理、网关和观测链兼容。',
      '网络边界必须设置连接、读取、总体截止时间和资源上限。',
    ],
    practice: [
      '实现长度前缀 TCP echo 协议，覆盖半包、超长、EOF 和超时。',
      '实现带请求 ID 与超时的 UDP 客户端，观察丢包/重复处理。',
      '用 HttpClient 调用测试服务，记录 DNS、连接、首字节和总耗时。',
    ],
    checklist: [
      '能解释 TCP 与 UDP 的保证和非保证。',
      '能设计可靠应用层分帧。',
      '能区分连接超时、读取超时和总体截止时间。',
      '能说明阻塞线程、虚拟线程与 NIO 事件循环的取舍。',
    ],
    refs: [
      [
        'Java Networking Guide',
        'https://docs.oracle.com/en/java/javase/26/core/java-networking.html',
      ],
      [
        'HTTP Client API',
        'https://docs.oracle.com/en/java/javase/26/docs/api/java.net.http/java/net/http/HttpClient.html',
      ],
      ['JEP 517 HTTP/3', 'https://openjdk.org/jeps/517'],
      javaApi,
    ],
  },
  {
    file: '14-泛型与集合框架综合.md',
    title: '泛型与集合框架综合：类型安全容器、迭代、排序与集合选型',
    source: '《泛型与集合框架.pptx》（原文件为旧版 OLE 演示文稿）',
    summary:
      '该课件以类集框架结构为主。本综合章把 Collection、List、Set、Map、泛型、迭代器与排序连成一条可用于真实 API 设计的知识链，并作为第7、8章的复习与提升。',
    objectives: [
      '从集合语义反推接口和实现。',
      '用泛型表达容器输入输出关系。',
      '正确设计排序、相等与不可变边界。',
      '完成一套类型安全的小型仓储 API。',
    ],
    concepts: [
      {
        name: '类集框架整体结构',
        detail:
          'Iterable 提供迭代入口，Collection 下分 List/Set/Queue，Map 独立表达键值。AbstractXxx 骨架类帮助自定义实现，但业务通常组合标准集合而非继承具体集合。',
        engineering: '声明接口、构造具体实现、边界返回不可修改副本，是最常用的三步。',
        pitfall: '继承 ArrayList 加业务字段，导致 equals、序列化和替换原则混乱。',
      },
      {
        name: '泛型容器 API',
        detail:
          '容器的类型参数应贯穿插入、查询和返回值；查询条件可用 Predicate<? super T>，转换可用 Function<? super T, ? extends R>。',
        engineering: '用通配符增加输入灵活性，用明确 T/R 保留输出关系。',
        pitfall: '返回原始 List 或 Object，让调用者自行强转。',
      },
      {
        name: '唯一性、身份与相等',
        detail:
          'Set 和 Map key 的行为取决于 equals/hashCode 或 Comparator。领域实体的身份、值对象的属性相等和数据库主键不是所有生命周期阶段都相同。',
        engineering:
          '在对象进入哈希容器前确定稳定相等策略；未持久化实体不要依赖后生成 ID 造成 hash 变化。',
        pitfall: '把可变数据库实体直接作为长期 Map key。',
      },
      {
        name: '排序与稳定性',
        detail:
          'Comparable 定义自然顺序，Comparator 定义外部可组合顺序；`thenComparing` 建立确定性 tie-breaker。排序集合的比较零值决定唯一性。',
        engineering: '分页和持久结果必须有唯一稳定的最后排序键。',
        pitfall: '只按时间排序，时间相同导致翻页遗漏或重复。',
      },
      {
        name: '迭代、Stream 与惰性',
        detail:
          'Iterator 是有状态游标，Stream 是一次性惰性计算描述。两者都不自动复制底层数据；修改源集合可能破坏操作。',
        engineering:
          '返回 Stream 时文档化资源和生命周期；数据库流必须在事务/连接有效期内关闭。',
        pitfall: '复用已经终止的 Stream，或返回依赖已关闭资源的 Stream。',
      },
      {
        name: '不可变边界与防御性复制',
        detail:
          'List.copyOf 产生不可修改副本，但元素对象仍可能可变。深度不可变需要元素本身不可变或逐层复制。',
        engineering: '配置、事件和跨线程消息优先不可变值对象与不可修改集合。',
        pitfall: '只包一层 unmodifiableList 就宣称整个对象图线程安全。',
      },
      {
        name: '复杂度与实际性能',
        detail:
          'Big-O 描述规模趋势，不包含常数、缓存局部性、分配和 GC。ArrayList 顺序遍历常优于链表；哈希结构性能依赖良好散列和容量。',
        engineering: '先依据语义选择，再用 JMH 在真实数据分布下测量热点。',
        pitfall: '只背复杂度表，不验证实际访问模式和内存成本。',
      },
    ],
    diagram: `\`\`\`mermaid
classDiagram
  Iterable <|-- Collection
  Collection <|-- List
  Collection <|-- Set
  Collection <|-- Queue
  Map --> Set : keySet
  Map --> Collection : values
\`\`\``,
    example: `## 3.8 类型安全仓储接口

\`\`\`java
interface Repository<ID, T> {
    Optional<T> findById(ID id);
    List<T> findAll(Predicate<? super T> filter);
    T save(T entity);
}
\`\`\`
`,
    modern: [
      '集合公开 API 使用参数化类型，raw type 仅出现在必要的遗留适配层。',
      'JDK 21 的 Sequenced 系列统一了首尾与反向视图，但具体性能仍取决于实现。',
      '返回集合时明确快照、视图、可变性和线程安全语义。',
      '性能结论通过 JMH、分配分析和真实数据验证。',
    ],
    practice: [
      '实现内存 Repository<ID,T>，并为重复 ID、排序和并发访问写测试。',
      '用 Comparator 组合实现稳定多字段分页排序。',
      '比较视图、浅副本、深副本对后续修改的响应。',
    ],
    checklist: [
      '能画出 Collection 与 Map 的核心结构。',
      '能用泛型与通配符设计容器 API。',
      '能保证相等、排序和分页稳定性。',
      '能说明集合不可修改与对象图不可变的差异。',
    ],
    refs: [
      [
        'Java Collections Framework',
        'https://docs.oracle.com/en/java/javase/26/core/java-collections-framework.html',
      ],
      ['Java Generics', 'https://dev.java/learn/generics/'],
      javaApi,
    ],
  },
]

for (const spec of foundationLessons) {
  await writeDoc(`01-Java基础/${spec.file}`, lesson(spec))
}

await writeDoc('00-Java后端学习路线总览.md', overviewMarkdown)
await writeDoc(
  '01-Java基础/90-推荐阅读/01-Java基础推荐阅读.md',
  recommendationDoc(
    foundationReading.title,
    foundationReading.intro,
    foundationReading.refs,
  ),
)

const backendSections = [
  {
    folder: '02-工程工具与Linux',
    title: 'Java 工程工具与 Linux',
    intro: '从开发机到 CI 和生产环境，工具链必须可复现、可诊断、可回滚。',
    refs: [
      [
        'IntelliJ IDEA Documentation',
        'https://www.jetbrains.com/help/idea/getting-started.html',
      ],
      ['Apache Maven Guides', 'https://maven.apache.org/guides/'],
      [
        'Gradle User Manual',
        'https://docs.gradle.org/current/userguide/userguide.html',
      ],
      ['Pro Git', 'https://git-scm.com/book/zh/v2'],
      ['Docker Documentation', 'https://docs.docker.com/'],
      ['GNU Bash Manual', 'https://www.gnu.org/software/bash/manual/'],
    ],
    docs: [
      {
        file: '01-JDK-IDE-Maven与Gradle.md',
        title: 'JDK、IDE、Maven 与 Gradle：可复现 Java 构建',
        summary:
          '本章把 JDK toolchain、IDE 导入、Maven 生命周期/依赖机制和 Gradle 任务图连成一条可复现构建链。',
        scope: [
          'JDK 25 LTS 与 JDK 26 的版本策略',
          'IDEA Project SDK、language level、模块和运行配置',
          'Maven POM、生命周期、scope、BOM、多模块与私服',
          'Gradle task、configuration、toolchain、version catalog 与多项目',
        ],
        topics: [
          {
            name: '工具链与目标字节码',
            explanation:
              '项目必须同时定义用于编译的 JDK、语言级别和目标 class 文件版本。Maven Compiler Plugin 的 `release` 与 Gradle Java Toolchains 能避免“编译机 API 太新、生产运行时太旧”。',
            points: [
              '构建记录 `java -version`、操作系统、架构和依赖锁定信息。',
              'preview 特性需要编译、测试、运行阶段一致启用，并与长期维护模块隔离。',
              'IDE 只导入构建模型，不作为依赖版本的唯一真实来源。',
            ],
            correctness:
              '`source/target` 只限制语法和字节码时可能仍错误引用新 API，`--release` 同时约束标准 API 视图。',
          },
          {
            name: 'Maven 生命周期与坐标',
            explanation:
              'Maven 按 validate、compile、test、package、verify、install、deploy 生命周期阶段执行绑定插件。依赖坐标由 groupId/artifactId/version/classifier/type 识别，scope 决定编译、测试和运行可见性。',
            points: [
              '使用 dependencyManagement/BOM 统一版本，真正使用仍需 dependencies 声明。',
              '多模块 reactor 按模块依赖拓扑构建，parent POM 与 aggregator 可以重合也可以分离。',
              '用 dependency:tree、dependency:analyze 和 Enforcer 定位冲突与未声明依赖。',
            ],
            correctness:
              'Maven 的“nearest definition”版本仲裁不等于选择最新版本；关键依赖应显式受 BOM/management 控制。',
          },
          {
            name: 'Gradle 任务图与依赖管理',
            explanation:
              'Gradle 配置阶段构造 task graph，执行阶段运行需要的任务。Java 插件建立标准 source set；configuration 决定依赖暴露边界，`implementation` 不向消费者泄漏。',
            points: [
              '版本目录和 platform 集中版本，dependency locking 提高重现性。',
              '多项目通过声明 project dependency 建立构建顺序，避免跨项目直接读写任务内部状态。',
              '配置缓存、构建缓存和增量任务要求准确声明 inputs/outputs。',
            ],
            correctness:
              'Gradle 动态版本和 SNAPSHOT 会削弱可复现性；生产构建锁定版本和校验依赖来源。',
          },
          {
            name: '依赖供应链与私服',
            explanation:
              '依赖解析不仅是“下载 jar”，还涉及仓库优先级、校验和、签名、许可证、漏洞和传递依赖。企业私服可代理公共仓库并托管内部构件。',
            points: [
              '减少仓库数量，避免把不可信仓库放在公共坐标前。',
              '生成 SBOM，运行 SCA，设定升级和 CVE 响应流程。',
              '构建产物带 commit、版本和 provenance，可从制品回溯源码。',
            ],
            correctness:
              '锁版本只解决漂移，不证明依赖可信；仍需来源、哈希、审计和发布权限控制。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["源码 + 构建声明"] --> B["固定 JDK Toolchain"]
  B --> C["解析并校验依赖"]
  C --> D["compile / test / verify"]
  D --> E["可重复制品 + SBOM"]
  E --> F["制品仓库"]
\`\`\``,
        practice: [
          '创建 Maven 多模块项目，使用 BOM 和 Enforcer 阻止依赖版本漂移。',
          '用 Gradle Toolchains 在本机缺少目标 JDK 时完成编译与测试。',
          '故意引入两个不同版本的日志依赖，分别用 Maven 和 Gradle 解释最终解析结果。',
        ],
        checks: [
          '能解释 Maven 生命周期与插件 goal 的关系。',
          '能区分 dependencyManagement 与 dependencies。',
          '能说明 Gradle configuration、task 和 source set。',
          '能从干净机器复现同一构建。',
        ],
        refs: [
          [
            'Maven Dependency Mechanism',
            'https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html',
          ],
          [
            'Maven Lifecycle',
            'https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html',
          ],
          [
            'Gradle Java Projects',
            'https://docs.gradle.org/current/userguide/building_java_projects.html',
          ],
          [
            'Gradle Dependency Management',
            'https://docs.gradle.org/current/userguide/core_dependency_management.html',
          ],
          [
            'Oracle Java Downloads',
            'https://www.oracle.com/java/technologies/downloads/',
          ],
        ],
      },
      {
        file: '02-Git协作与版本治理.md',
        title: 'Git 协作与版本治理：提交、分支、合并、变基、标签与发布',
        summary:
          'Git 的对象模型决定了提交、分支和回滚的真实语义；团队流程再在此基础上定义评审、CI 和发布。',
        scope: [
          '工作区、暂存区、提交、树与引用',
          'branch、merge、rebase、cherry-pick 与 revert',
          '远程跟踪、PR、代码评审与保护规则',
          '版本号、tag、release 与紧急修复',
        ],
        topics: [
          {
            name: '对象模型与三棵树',
            explanation:
              'Git 提交指向目录树和父提交，分支只是可移动引用。工作区、index 和 HEAD 分别表示当前文件、下次提交快照和当前提交。',
            points: [
              '`git status` 先判断状态，再选择 add/restore/reset/commit。',
              '提交应是可构建、意图单一的逻辑变更，消息解释为什么。',
              '大文件和密钥不进入历史；敏感泄露需要轮换凭据并清理历史。',
            ],
            correctness:
              '`reset` 移动引用并可能改 index/工作区；`revert` 创建反向提交，更适合共享历史。',
          },
          {
            name: '合并与变基',
            explanation:
              'merge 保留分叉并产生合并关系；rebase 重放提交形成线性历史，会改变提交 ID。二者都需要对冲突后的语义重新测试。',
            points: [
              '个人未共享分支可交互式 rebase 整理；公共稳定分支避免重写历史。',
              '冲突解决不是“保留两边文本”，而是重建符合当前契约的代码。',
              '合并后运行测试、静态检查和迁移验证。',
            ],
            correctness:
              'rebase 后内容可能相同但提交身份不同；已被他人基于的历史需谨慎重写。',
          },
          {
            name: '分支与评审策略',
            explanation:
              'Trunk-based 强调短分支和频繁集成；Git Flow 强调 release/hotfix 分支。选择取决于发布节奏、自动化和合规要求。',
            points: [
              '主分支保护、必需检查、至少一名评审者和禁止直接推送。',
              'PR 保持小而可理解，描述验证证据和风险。',
              '功能未完成用 feature flag 隔离，而非长期分支。',
            ],
            correctness:
              '分支模型本身不产生质量；自动化测试、评审和可回滚发布才构成控制闭环。',
          },
          {
            name: '标签、语义版本与发布',
            explanation:
              'annotated tag 可签名并携带发布信息。语义版本用 MAJOR/MINOR/PATCH 表达兼容承诺，但内部服务仍需明确 API、数据库和事件 schema 的兼容策略。',
            points: [
              '制品只构建一次，多环境提升同一个制品。',
              '发布记录 commit/tag、依赖、迁移、配置和回滚步骤。',
              'hotfix 从生产基线修复，并回合主线避免分叉。',
            ],
            correctness: '删除或移动发布 tag 会破坏可追溯性；正式 tag 应视为不可变。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["短分支提交"] --> B["Pull Request"]
  B --> C["评审 + CI"]
  C --> D["合并主线"]
  D --> E["签名 Tag / 制品"]
  E --> F["渐进发布"]
  F --> G["验证或回滚"]
\`\`\``,
        practice: [
          '在临时仓库制造 merge/rebase 冲突，比较提交图。',
          '设计主分支保护和 Conventional Commits/版本发布规则。',
          '演练一次数据库迁移发布失败后的代码与数据回滚。',
        ],
        checks: [
          '能解释 HEAD、index、branch 与 commit。',
          '能选择 revert、reset、rebase 和 merge。',
          '能设计短分支、必需检查和可追溯发布。',
          '能证明线上制品对应哪个 commit。',
        ],
        refs: [
          ['Pro Git', 'https://git-scm.com/book/zh/v2'],
          ['Git Reference', 'https://git-scm.com/docs'],
          ['Semantic Versioning', 'https://semver.org/'],
        ],
      },
      {
        file: '03-Linux-Shell与Docker.md',
        title: 'Linux、Shell 与 Docker：运行 Java 服务的基础环境',
        summary:
          'Java 服务最终运行在操作系统进程、文件系统、网络和资源限制中。Shell 与容器只是控制这些边界的工具。',
        scope: [
          'Linux 文件、权限、进程、信号、网络与日志',
          'Shell 变量、引用、管道、退出码、流程与函数',
          'Docker 镜像、容器、网络、卷、Compose 与多阶段构建',
          'Java 进程信号、优雅停机和容器资源感知',
        ],
        topics: [
          {
            name: '文件、权限与进程',
            explanation:
              'Linux 一切以文件描述符和进程为核心。r/w/x 对普通文件和目录含义不同；进程具有 PID、用户、环境、工作目录、打开文件和信号处理。',
            points: [
              '掌握 `ls/find/grep/sed/awk/tail/less/ps/top/ss/lsof/journalctl` 的诊断用途。',
              '服务使用专用低权限用户，数据、配置、日志分别授权。',
              'SIGTERM 触发优雅停机，SIGKILL 没有清理机会。',
            ],
            correctness:
              'chmod 777 不是权限问题的通用处理；要检查所有者、组、目录执行位、ACL 和挂载选项。',
          },
          {
            name: 'Shell 安全与退出码',
            explanation:
              'Shell 会经历变量展开、命令替换、通配和分词。双引号保留一个参数并展开变量，单引号禁止展开；`$?`/退出码表达命令结果。',
            points: [
              '脚本使用 `set -euo pipefail` 时仍需理解每个语义和例外。',
              '变量引用写成 `"$value"`，文件名用 `--` 与参数分离。',
              '临时文件用 mktemp，清理用 trap，密钥避免命令行和日志。',
            ],
            correctness:
              '把未经验证文本拼入 `sh -c` 会造成命令注入；参数数组和固定命令结构更可靠。',
          },
          {
            name: '镜像、容器、卷与网络',
            explanation:
              '镜像是只读分层模板，容器是其运行实例；容器可写层不是持久数据方案。volume 管理数据，network 提供服务间连接，registry 分发镜像。',
            points: [
              '镜像固定 digest/版本，使用非 root 用户和只读文件系统。',
              '配置与密钥通过运行时注入，不烘焙进镜像层。',
              'Compose 定义多容器服务、网络、卷、健康检查和依赖。',
            ],
            correctness:
              '容器不是虚拟机；其进程共享宿主内核，资源和安全隔离取决于命名空间、cgroup 与配置。',
          },
          {
            name: 'Java 多阶段镜像与优雅停机',
            explanation:
              'builder 阶段编译测试，runtime 阶段只复制制品与所需运行时，可使用 jlink 缩减模块。PID 1 必须正确接收/转发信号，Spring Boot 需要配置优雅停机和探针窗口。',
            points: [
              '使用固定基础镜像、`.dockerignore` 和可重现构建。',
              '设置 JVM 内存百分比与容器 limit，保留 native/metaspace/thread 余量。',
              '停机先停止接流量，再等待在途请求，最后关闭池和连接。',
            ],
            correctness:
              '只把 `-Xmx` 设置等于容器内存上限会忽略非堆内存，容易触发容器 OOMKill。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["源码"] --> B["Builder 镜像编译测试"]
  B --> C["Runtime 镜像"]
  C --> D["非 root 容器"]
  D --> E["健康检查 + 资源限制"]
  E --> F["SIGTERM 优雅停机"]
\`\`\``,
        practice: [
          '为 Spring Boot 服务写多阶段 Dockerfile，并以非 root、只读根文件系统运行。',
          '写 Shell 健康检查脚本，正确传播退出码并处理带空格参数。',
          '向容器发送 SIGTERM，验证停止接流量与请求排空顺序。',
        ],
        checks: [
          '能用 Linux 工具定位端口、进程、文件句柄和日志。',
          '能解释 Shell 引用、管道和 pipefail。',
          '能区分镜像、容器、卷和网络。',
          '能计算 Java 容器的堆与非堆预算。',
        ],
        refs: [
          ['Docker Overview', 'https://docs.docker.com/get-started/docker-overview/'],
          [
            'Docker Compose Model',
            'https://docs.docker.com/compose/intro/compose-application-model/',
          ],
          ['GNU Bash Manual', 'https://www.gnu.org/software/bash/manual/'],
          [
            'Spring Boot Efficient Container Images',
            'https://docs.spring.io/spring-boot/reference/packaging/container-images/efficient-images.html',
          ],
        ],
      },
    ],
  },
  {
    folder: '03-数据库缓存与搜索',
    title: '数据库、缓存与搜索',
    intro:
      '数据系统的选型从一致性、查询模式、容量、延迟和运维约束出发，而不是从流行度出发。',
    refs: [
      ['MySQL 8.4 Reference', 'https://dev.mysql.com/doc/refman/8.4/en/'],
      ['PostgreSQL Documentation', 'https://www.postgresql.org/docs/current/'],
      ['Redis Documentation', 'https://redis.io/docs/latest/'],
      ['MongoDB Documentation', 'https://www.mongodb.com/docs/'],
      [
        'Elasticsearch Reference',
        'https://www.elastic.co/guide/en/elasticsearch/reference/current/',
      ],
    ],
    docs: [
      {
        file: '01-数据库原理与SQL.md',
        title: '数据库原理与 SQL：模型、约束、查询、事务与执行计划',
        summary:
          '先掌握关系模型、约束、范式、SQL 和事务，再学习具体数据库或 ORM，才能判断数据是否正确而不仅是“接口返回了 200”。',
        scope: [
          '关系、键、约束、范式与反范式',
          'DDL/DML、JOIN、聚合、窗口函数和子查询',
          'ACID、隔离异常、锁与 MVCC',
          '索引、统计信息、执行计划与迁移',
        ],
        topics: [
          {
            name: '关系模型与约束',
            explanation:
              '表表示关系，行是元组，列有域；主键标识行，唯一、非空、检查、外键把业务不变量下沉到数据库。规范化减少更新异常，受控反范式用额外维护成本换读取效率。',
            points: [
              '先定义业务键、生命周期和删除语义，再选代理主键。',
              '数据库约束与应用校验互补：前者保护所有写入路径，后者提供友好错误。',
              '时区、金额、枚举和 JSON 字段都要有明确数据契约。',
            ],
            correctness:
              '外键不是天然性能灾难；是否使用取决于一致性要求、写入模式、分片边界与运维能力。',
          },
          {
            name: 'SQL 查询与三值逻辑',
            explanation:
              'SQL 是声明式语言，优化器决定执行方式。NULL 引入 TRUE/FALSE/UNKNOWN 三值逻辑；JOIN、WHERE、GROUP BY、HAVING、ORDER BY 和 LIMIT 的语义阶段不同。',
            points: [
              '外连接条件放 ON 或 WHERE 可能改变结果集。',
              '聚合结果使用 HAVING 过滤，窗口函数不折叠明细行。',
              '分页排序必须稳定且最终包含唯一 tie-breaker。',
            ],
            correctness:
              '`= NULL` 不返回真，应使用 `IS NULL`；`NOT IN` 遇到 NULL 也可能产生 UNKNOWN。',
          },
          {
            name: '事务、隔离与并发异常',
            explanation:
              'ACID 描述事务属性；隔离级别规定并发可观察行为。MVCC 通过版本让读写少阻塞，但仍可能出现写偏差、丢失更新或范围竞争。',
            points: [
              '事务按业务不变量设计，并通过并发测试验证。',
              '悲观锁、乐观版本和唯一约束解决不同竞争模式。',
              '死锁是可预期并发结果，应用应缩短事务并对安全操作重试。',
            ],
            correctness:
              '同名隔离级别在不同数据库的实现细节并非完全相同，结论以目标数据库文档和实验为准。',
          },
          {
            name: '索引与执行计划',
            explanation:
              'B+Tree 索引减少扫描范围，但增加写放大和空间。联合索引列顺序影响可用前缀、排序和覆盖；统计信息帮助优化器估算基数。',
            points: [
              '使用 EXPLAIN/EXPLAIN ANALYZE 观察实际扫描、行数估计、连接算法和排序。',
              '索引服务查询模式，不是每列各建一个。',
              '慢查询结合数据库、连接池、锁等待和应用 trace 定位。',
            ],
            correctness:
              '“使用索引”不等于更快；低选择性、回表、随机 I/O 或错误估算可能让全表扫描更合适。',
          },
          {
            name: 'Schema 迁移与数据演进',
            explanation:
              '生产变更按 expand-migrate-contract：先增加兼容结构，双读/双写或回填，再切流，最后移除旧结构。DDL 锁表与回填压力需要评估。',
            points: [
              'Flyway/Liquibase 版本脚本只追加，已执行迁移不原地修改。',
              '迁移前备份与容量评估，迁移后校验行数、约束和业务抽样。',
              '应用和 schema 在滚动发布窗口内双向兼容。',
            ],
            correctness:
              '代码回滚并不会自动回滚数据；不可逆迁移必须有前滚修复和数据恢复方案。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["业务不变量"] --> B["表与约束"]
  B --> C["查询模式"]
  C --> D["索引与计划"]
  D --> E["事务并发验证"]
  E --> F["迁移与监控"]
\`\`\``,
        practice: [
          '为订单与库存建模，用约束表达合法状态。',
          '构造脏读、不可重复读、幻读/写偏差实验并记录目标数据库行为。',
          '为三条真实查询设计联合索引并比较 EXPLAIN ANALYZE。',
        ],
        checks: [
          '能解释主键、业务键、外键和唯一约束。',
          '能正确处理 NULL 和外连接。',
          '能用执行计划而非猜测定位 SQL。',
          '能设计可滚动发布的 schema 迁移。',
        ],
        refs: [
          [
            'PostgreSQL SQL Language',
            'https://www.postgresql.org/docs/current/sql.html',
          ],
          [
            'MySQL Optimization',
            'https://dev.mysql.com/doc/refman/8.4/en/optimization.html',
          ],
          [
            'MySQL InnoDB Transactions',
            'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html',
          ],
        ],
      },
      {
        file: '02-MySQL-InnoDB索引事务与调优.md',
        title: 'MySQL：InnoDB、索引、事务、MVCC、日志与性能调优',
        summary:
          'MySQL 学习重点是 InnoDB 存储、聚簇索引、事务隔离、锁、redo/undo/binlog 和可证据化调优。',
        scope: [
          '数据类型、字符集、用户权限、备份恢复',
          'InnoDB 聚簇/二级索引与页结构',
          '隔离、MVCC、记录锁/间隙锁/next-key lock',
          'redo、undo、binlog、复制与 EXPLAIN',
        ],
        topics: [
          {
            name: '类型、字符集与 schema',
            explanation:
              '选择最贴合语义的类型，金额用 DECIMAL，时间区分 TIMESTAMP/DATETIME，文本统一 utf8mb4 与明确 collation。字段宽度、NULL 和默认值影响存储和业务语义。',
            points: [
              '账号使用最小权限，备份需要定期恢复演练。',
              '大字段与高频访问列分离，避免无边界 JSON 替代结构建模。',
              '字符集要在库、表、连接和客户端一致。',
            ],
            correctness:
              'VARCHAR(n) 的 n 是字符数语义但字节占用受字符集影响；索引长度仍有字节限制。',
          },
          {
            name: '聚簇索引与二级索引',
            explanation:
              'InnoDB 表数据按主键聚簇，二级索引叶节点存主键值，因此宽或随机主键会放大所有二级索引。覆盖索引可直接提供查询列，减少回表。',
            points: [
              '主键短、稳定、递增趋势通常更友好，但分布式 ID 还需权衡热点与全局性。',
              '联合索引遵循查询谓词、选择性、排序与覆盖综合设计。',
              '前缀索引节省空间但降低区分度且不总能覆盖。',
            ],
            correctness:
              '“最左前缀”不是机械口诀；范围条件后的列能否用于过滤/排序要结合优化器和执行计划。',
          },
          {
            name: '事务、MVCC 与锁',
            explanation:
              'InnoDB 使用 undo 版本和 read view 支持一致性读，当前读通过锁读取最新可见版本。Repeatable Read 下 next-key lock 可保护索引范围，但锁行为受查询、索引和执行计划影响。',
            points: [
              '更新条件必须命中合适索引，避免扩大扫描和锁范围。',
              '用版本号实现乐观锁；唯一约束解决“先查后插”竞争。',
              '死锁查看日志并统一访问顺序，应用对整个事务做有界重试。',
            ],
            correctness: 'MVCC 不等于“完全没有锁”；写入、当前读、约束检查仍会加锁。',
          },
          {
            name: 'redo、undo 与 binlog',
            explanation:
              'redo log 支持崩溃恢复，undo 支持回滚和 MVCC，binlog 是 Server 层逻辑变更日志用于复制与时间点恢复。提交过程协调 redo 与 binlog 以保持一致。',
            points: [
              '备份 + binlog 才能做时间点恢复，必须演练。',
              '刷盘策略在持久性和吞吐之间权衡。',
              '复制延迟下读写分离要处理 read-your-writes。',
            ],
            correctness: '三种日志服务不同目标，不能互相替代。',
          },
          {
            name: '查询与运维调优',
            explanation:
              '调优从慢查询和业务 SLO 出发，使用 EXPLAIN ANALYZE、performance_schema、锁等待、buffer pool 和 I/O 指标建立证据。',
            points: [
              '修正查询/索引优先于盲目调参数。',
              '连接数由并发模型和数据库 CPU/I/O 决定，避免连接风暴。',
              '在线 DDL、统计信息更新和索引构建安排容量窗口。',
            ],
            correctness: '平均延迟会掩盖长尾，至少观察 P95/P99、扫描行数和锁等待。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["慢请求 Trace"] --> B["定位 SQL"]
  B --> C["EXPLAIN ANALYZE"]
  C --> D["索引/锁/统计/I-O"]
  D --> E["小范围修改"]
  E --> F["回归与压测"]
\`\`\``,
        practice: [
          '验证覆盖索引、回表和联合索引列顺序。',
          '制造死锁并从 InnoDB 状态中还原等待图。',
          '完成全量备份 + binlog 时间点恢复演练。',
        ],
        checks: [
          '能解释 InnoDB 聚簇索引。',
          '能区分一致性读与当前读。',
          '能说明 redo/undo/binlog 各自职责。',
          '能用实际执行计划验证优化。',
        ],
        refs: [
          ['MySQL 8.4 Reference', 'https://dev.mysql.com/doc/refman/8.4/en/'],
          [
            'InnoDB Transaction Model',
            'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html',
          ],
          [
            'Optimizing InnoDB',
            'https://dev.mysql.com/doc/refman/8.4/en/optimizing-innodb.html',
          ],
        ],
      },
      {
        file: '03-PostgreSQL与MongoDB选修.md',
        title: 'PostgreSQL 与 MongoDB：选修数据库的模型与选型',
        summary:
          'PostgreSQL 仍是关系数据库，MongoDB 是文档数据库；选型应从事务边界、查询和数据演进出发，而不是用“SQL/NoSQL”二分法。',
        scope: [
          'PostgreSQL MVCC、类型、索引、JSONB 与扩展',
          'MongoDB 文档、集合、索引、聚合与事务',
          '嵌入/引用、范式/反范式和一致性',
          'Java 驱动与 Spring Data 边界',
        ],
        topics: [
          {
            name: 'PostgreSQL 能力模型',
            explanation:
              'PostgreSQL 提供强类型、事务、丰富索引、窗口函数、CTE、JSONB、全文检索和扩展。其 MVCC 与 vacuum 机制决定长事务和表膨胀运维特点。',
            points: [
              'EXPLAIN (ANALYZE, BUFFERS) 观察实际执行与缓存命中。',
              'GIN/GiST/BRIN 等索引服务不同数据和查询模式。',
              '连接仍是有限资源，使用连接池并避免长事务。',
            ],
            correctness:
              'JSONB 提供灵活性但不会自动替代关系约束；高频查询字段仍需稳定 schema 和索引。',
          },
          {
            name: 'MongoDB 文档模型',
            explanation:
              'MongoDB 以 BSON 文档存储，单文档更新天然原子；嵌入适合一起读取和更新的有界聚合，引用适合独立生命周期或无界多对多。',
            points: [
              'schema validation、唯一索引和应用校验共同保护数据。',
              '聚合 pipeline 做变换与汇总，索引依据过滤和排序设计。',
              '副本集写关注和读关注决定持久性与一致性。',
            ],
            correctness:
              '“无 schema”实际是 schema-on-read/应用维护 schema，并不等于没有数据契约。',
          },
          {
            name: '事务与分布',
            explanation:
              'PostgreSQL 和 MongoDB 都支持事务，但跨文档/分片事务成本更高。数据模型应尽量让强一致更新落在自然事务边界内。',
            points: [
              '识别 read-your-writes、单调读和最终一致需求。',
              '跨服务不使用数据库事务假装本地调用，采用事件/补偿等模式。',
              '故障切换时测试客户端重试与幂等。',
            ],
            correctness: '支持事务不代表应该把任意跨聚合流程塞进长事务。',
          },
          {
            name: '选型矩阵',
            explanation:
              '关系完整性、复杂 JOIN 和强 SQL 分析通常偏 PostgreSQL；聚合文档、字段演进与按文档访问可考虑 MongoDB。团队运维、备份恢复和监控能力同样是约束。',
            points: [
              '用真实数据规模、查询和故障场景做原型。',
              '评估二级索引、分片键、热点、恢复目标和成本。',
              '避免一个系统同时引入过多数据产品。',
            ],
            correctness: '数据库选择是整体工作负载决策，不应根据单个功能或宣传标签。',
          },
        ],
        process: `\`\`\`mermaid
flowchart TD
  A["访问模式与不变量"] --> B{"复杂关系/约束?"}
  B -->|强| C["PostgreSQL"]
  B -->|弱且文档聚合清晰| D["MongoDB 候选"]
  C --> E["真实压测与恢复演练"]
  D --> E
\`\`\``,
        practice: [
          '用同一订单域分别做关系模型和文档模型，比较更新原子性。',
          '在 PostgreSQL JSONB 和 MongoDB 上实现同一查询并比较索引。',
          '演练副本故障下的客户端重试与重复写防护。',
        ],
        checks: [
          '能解释 PostgreSQL MVCC/vacuum。',
          '能选择 MongoDB 嵌入或引用。',
          '能基于事务和查询模式选型。',
          '能给出备份恢复和故障切换证据。',
        ],
        refs: [
          ['PostgreSQL Documentation', 'https://www.postgresql.org/docs/current/'],
          [
            'MongoDB Data Modeling',
            'https://www.mongodb.com/docs/manual/data-modeling/',
          ],
          [
            'MongoDB Transactions',
            'https://www.mongodb.com/docs/manual/core/transactions/',
          ],
        ],
      },
      {
        file: '04-Redis与缓存工程.md',
        title: 'Redis 与缓存工程：数据类型、持久化、高可用、集群与一致性',
        summary:
          'Redis 不只是缓存；正确使用要理解数据类型、过期/淘汰、RDB/AOF、复制、Sentinel、Cluster 和缓存一致性。',
        scope: [
          'String/Hash/List/Set/ZSet/Stream/Bitmap/HyperLogLog/Geo',
          'TTL、内存淘汰、RDB、AOF 与恢复',
          '主从复制、Sentinel、Cluster 与热 key',
          '缓存穿透、击穿、雪崩、双写一致性和分布式锁',
        ],
        topics: [
          {
            name: '数据类型与命令复杂度',
            explanation:
              'Redis 是数据结构服务器。String 可做计数和二进制值，Hash 表示小对象，List/Stream 服务队列语义，Set/ZSet 服务唯一集合和排序，概率结构换空间。',
            points: [
              '每个 key 设计命名、类型、最大基数、TTL 和所有者。',
              '避免 O(n) 大命令阻塞事件循环，使用 SCAN 和分批操作。',
              '大 key、热 key 和高基数指标都需监控。',
            ],
            correctness: '单条命令原子不等于由多条命令组成的业务流程原子。',
          },
          {
            name: '过期、淘汰与内存',
            explanation:
              'TTL 是逻辑过期，删除由惰性与定期策略执行；maxmemory-policy 决定内存满时淘汰。内存还包含对象、字典、复制缓冲和碎片。',
            points: [
              'TTL 加随机抖动避免同一时刻大量失效。',
              '缓存 value 设大小上限，压缩需权衡 CPU。',
              '观察 used_memory、RSS、fragmentation、evicted_keys。',
            ],
            correctness: '设置 TTL 不保证到点立即释放内存；业务不得依赖物理删除时间。',
          },
          {
            name: 'RDB、AOF 与高可用',
            explanation:
              'RDB 是时间点快照，恢复快但可能丢快照间数据；AOF 记录写命令并按刷盘策略权衡持久性。复制异步，Sentinel 负责监控/选主，Cluster 按 slot 分片。',
            points: [
              '缓存与数据源明确谁是事实来源。',
              '持久 Redis 也要备份、恢复演练和容量规划。',
              '故障切换窗口可能出现已确认写丢失，按业务接受度设计。',
            ],
            correctness: 'Redis 复制默认异步，高可用不等同于零数据丢失。',
          },
          {
            name: '缓存模式与一致性',
            explanation:
              'Cache-aside 由应用读缓存、miss 查库回填，写库后失效缓存。并发下存在旧值回填和双写窗口，需要版本、延迟双删、消息失效或 CDC 等策略。',
            points: [
              '缓存穿透用校验/空值/Bloom，击穿用互斥或逻辑过期，雪崩用抖动和降级。',
              '回填前后检查版本，防慢请求覆盖新值。',
              '缓存失败时定义 fail-open/fail-closed 和数据库保护。',
            ],
            correctness:
              '任何“先库后缓存/先缓存后库”的简单顺序都存在并发窗口，需按一致性要求量化。',
          },
          {
            name: '分布式锁与队列边界',
            explanation:
              '单实例 `SET key value NX PX ttl` 配合唯一 token 和 Lua 校验删除可做租约，但进程暂停和 TTL 到期可能导致多个持有者。严格互斥需要 fencing token 和受保护资源校验。',
            points: [
              '锁必须有超时、唯一 owner、原子释放和业务幂等。',
              '延迟队列/消息队列需求优先评估专用系统与 Redis Streams。',
              '不要用 KEYS 扫全库实现业务调度。',
            ],
            correctness:
              '锁客户端认为“仍持有”并不证明租约未过期；最终资源必须拒绝旧 fencing token。',
          },
        ],
        process: `\`\`\`mermaid
sequenceDiagram
  participant A as App
  participant R as Redis
  participant D as Database
  A->>R: GET key
  alt hit
    R-->>A: cached value
  else miss
    A->>D: query
    D-->>A: value + version
    A->>R: SET key value EX ttl
  end
\`\`\``,
        practice: [
          '实现带版本的 cache-aside，制造慢回填覆盖新值并修复。',
          '压测热 key、大 key 和批量删除，观察延迟长尾。',
          '演练 Redis 主节点故障与缓存全失效时的数据库保护。',
        ],
        checks: [
          '能按业务语义选择 Redis 数据类型。',
          '能区分 TTL、淘汰和持久化。',
          '能解释复制故障切换的数据窗口。',
          '能设计穿透、击穿、雪崩和双写一致性方案。',
        ],
        refs: [
          ['Redis Data Types', 'https://redis.io/docs/latest/develop/data-types/'],
          [
            'Redis Persistence',
            'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/',
          ],
          [
            'Redis Replication',
            'https://redis.io/docs/latest/operate/oss_and_stack/management/replication/',
          ],
          [
            'Redis Cluster',
            'https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/',
          ],
        ],
      },
      {
        file: '05-Elasticsearch搜索工程.md',
        title: 'Elasticsearch 搜索工程：Mapping、分析器、Query DSL、分片与聚合',
        summary:
          'Elasticsearch 是搜索与分析引擎，不是关系数据库的透明替代。核心是 mapping、倒排索引、查询/过滤上下文、分片和生命周期管理。',
        scope: [
          'document/index/mapping 与 text/keyword',
          'analyzer、tokenizer、filter 与相关性',
          'Query DSL、filter、bool、聚合与分页',
          'primary/replica shard、routing、alias、reindex 与 ILM',
        ],
        topics: [
          {
            name: 'Mapping 与字段类型',
            explanation:
              'mapping 决定字段如何索引。text 经分析用于全文检索，keyword 保存精确值用于过滤、排序和聚合；日期、数值、nested、object 与向量各有语义。',
            points: [
              '生产禁用无边界动态字段或使用严格模板，避免 mapping explosion。',
              '同一字符串常用 multi-field 同时提供 text 与 keyword。',
              'mapping 不兼容修改通常需新索引 + reindex + alias 切换。',
            ],
            correctness:
              '把所有字符串设为 text 会让精确聚合/排序困难；把全文设 keyword 又失去分析检索。',
          },
          {
            name: '分析器与相关性',
            explanation:
              '分析器由字符过滤、tokenizer 和 token filter 组成，索引与查询分析需匹配。BM25 等相关性基于词频、文档频率和长度规范。',
            points: [
              '使用 `_analyze` 验证中英文分词、同义词、大小写和停用词。',
              '同义词更新和搜索规则要版本化并离线评测。',
              '结构化约束放 filter，全文相关放 query。',
            ],
            correctness:
              '相关性分数只在当前查询与索引统计下有意义，不能直接当跨查询业务概率。',
          },
          {
            name: 'Query DSL、聚合与分页',
            explanation:
              'Query DSL 是 JSON AST，bool 组合 must/should/filter/must_not。聚合在匹配文档上做 bucket/metric/pipeline 分析。深分页 from/size 成本高，使用 search_after + PIT。',
            points: [
              'filter context 可缓存且不计算 score。',
              '排序包含唯一 tie-breaker，PIT 保持分页视图。',
              '高基数 terms 聚合、脚本和通配前缀需要资源预算。',
            ],
            correctness:
              'terms 聚合在分片采样下的 doc_count 可能有误差；精确需求检查 size/shard_size 与方案。',
          },
          {
            name: '分片、副本与路由',
            explanation:
              'primary shard 决定索引分区，replica 提供冗余和搜索容量。协调节点把请求分发到相关分片并合并结果；分片太多会增加堆、集群状态和协调开销。',
            points: [
              '按数据增长、节点、恢复时间和查询并发规划 shard。',
              'allocation awareness 跨故障域分布副本。',
              'routing 可减少扇出但会带来热点和数据倾斜风险。',
            ],
            correctness: '增加副本提高读取容量与容错，但会增加写入和存储成本。',
          },
          {
            name: '同步、别名与生命周期',
            explanation:
              '数据库到 ES 常通过 outbox/CDC 异步同步，ES 是派生读模型。alias 支持无停机切换，ILM/data stream 管理时间序列 rollover 和保留。',
            points: [
              '事件带版本，消费者幂等，监控延迟和失败队列。',
              '查询结果需要强一致回源时，按 ID 回数据库验证。',
              '快照到独立仓库并演练恢复。',
            ],
            correctness:
              '双写数据库与 ES 无分布式原子性，直接在请求中两边写会产生不一致。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["数据库事务 + Outbox"] --> B["CDC/消息"]
  B --> C["幂等索引器"]
  C --> D["Elasticsearch 新索引"]
  D --> E["Alias 原子切换"]
  E --> F["搜索 API"]
\`\`\``,
        practice: [
          '为商品搜索设计 mapping，并用 `_analyze` 验证中英文分析。',
          '实现 PIT + search_after 稳定翻页。',
          '模拟数据库到 ES 事件乱序，用版本控制拒绝旧更新。',
        ],
        checks: [
          '能区分 text 与 keyword。',
          '能说明 query 与 filter context。',
          '能规划分片而不是默认多分片。',
          '能设计数据库到搜索索引的一致性链路。',
        ],
        refs: [
          [
            'Elasticsearch Reference',
            'https://www.elastic.co/guide/en/elasticsearch/reference/current/',
          ],
          [
            'Query DSL',
            'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html',
          ],
          [
            'Mapping',
            'https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html',
          ],
          [
            'Search Shard Routing',
            'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-shard-routing.html',
          ],
        ],
      },
    ],
  },
  {
    folder: '04-Spring Framework',
    title: 'Spring Framework',
    intro:
      'Spring 的核心是 IoC 容器、代理式 AOP、一致的数据访问/事务抽象和 Web 编程模型。',
    refs: [
      [
        'Spring Framework Reference',
        'https://docs.spring.io/spring-framework/reference/',
      ],
      [
        'Spring Core Technologies',
        'https://docs.spring.io/spring-framework/reference/core.html',
      ],
      [
        'Spring Transaction Management',
        'https://docs.spring.io/spring-framework/reference/data-access/transaction.html',
      ],
      [
        'Spring Testing',
        'https://docs.spring.io/spring-framework/reference/testing.html',
      ],
    ],
    docs: [
      {
        file: '01-IoC依赖注入与Bean生命周期.md',
        title: 'Spring IoC、依赖注入与 Bean 生命周期',
        summary:
          'IoC 容器创建对象图、解析依赖并管理生命周期。依赖注入的目的不是减少 `new`，而是让依赖显式、可替换和可测试。',
        scope: [
          'ApplicationContext、BeanDefinition 与组件扫描',
          '构造器/setter/字段注入、Qualifier/Primary',
          'Bean scope、生命周期、代理与循环依赖',
          '配置属性、资源、事件与验证',
        ],
        topics: [
          {
            name: '容器与 BeanDefinition',
            explanation:
              'ApplicationContext 读取 Java 配置、组件扫描或 XML，形成 BeanDefinition，实例化单例并处理后置器。容器还提供事件、资源、国际化和类型转换。',
            points: [
              '组件扫描限定业务包，避免扫描整个 classpath。',
              '@Configuration/@Bean 适合第三方类型和显式装配。',
              '启动失败应定位 Bean 创建链和根 cause，而非盲目加注解。',
            ],
            correctness:
              'Spring Bean 默认 singleton 是“每个 ApplicationContext 一个实例”，不等于 JVM 全局单例，也不自动线程安全。',
          },
          {
            name: '依赖注入选择',
            explanation:
              '构造器注入保证必需依赖在创建时完整，字段可 final，并便于普通单元测试。setter 适合真正可选或可重配置依赖；字段注入隐藏依赖且难以脱离容器。',
            points: [
              '单构造器通常无需 @Autowired。',
              '多个同类型实现用语义接口、@Qualifier、@Primary/@Fallback 明确。',
              '依赖过多提示类职责过重，应拆分而非继续堆构造参数。',
            ],
            correctness:
              'Optional 注入不应掩盖配置错误；关键能力缺失应在启动阶段失败。',
          },
          {
            name: 'Scope、生命周期与销毁',
            explanation:
              'singleton、prototype、request、session 等 scope 决定实例边界。初始化经过构造、属性注入、Aware、BeanPostProcessor、初始化回调；销毁回调只对容器管理且可追踪的生命周期生效。',
            points: [
              '外部资源 bean 实现关闭回调并在优雅停机时释放。',
              'prototype 注入 singleton 时要通过 Provider/ObjectProvider 获取新实例。',
              'request/session 数据不进入 singleton 可变字段。',
            ],
            correctness:
              '容器通常不管理 prototype Bean 的完整销毁生命周期，使用者承担清理。',
          },
          {
            name: '循环依赖与代理',
            explanation:
              '构造器循环依赖无法建立完整对象图，应通过职责拆分、领域事件或中介服务消除。代理 Bean 可能使运行时类型与原类不同，影响 final 方法、equals 和 self-invocation。',
            points: [
              '不以 `@Lazy` 作为长期循环依赖修复。',
              '按接口依赖降低实现耦合。',
              '调试时检查 bean 实际类型和 advisor。',
            ],
            correctness:
              '容器能在部分 setter/字段场景“绕过”循环并不证明设计正确，且与代理/版本组合可能失败。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["配置/扫描"] --> B["BeanDefinition"]
  B --> C["实例化"]
  C --> D["依赖注入"]
  D --> E["BeanPostProcessor/代理"]
  E --> F["初始化完成"]
  F --> G["销毁回调"]
\`\`\``,
        practice: [
          '把字段注入服务重构为构造器注入并写无 Spring 单元测试。',
          '制造循环依赖，再通过职责拆分消除。',
          '记录一个代理 Bean 从定义到销毁的生命周期回调顺序。',
        ],
        checks: [
          '能解释 ApplicationContext 与 BeanDefinition。',
          '能选择构造器、setter 和 Provider。',
          '能区分 Bean scope 与线程安全。',
          '能识别代理类型和生命周期边界。',
        ],
        refs: [
          [
            'Spring IoC Container',
            'https://docs.spring.io/spring-framework/reference/core/beans.html',
          ],
          [
            'Bean Scopes',
            'https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html',
          ],
          [
            'Annotation Configuration',
            'https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html',
          ],
        ],
      },
      {
        file: '02-Spring-AOP代理与事务.md',
        title: 'Spring AOP、代理与声明式事务',
        summary:
          'Spring AOP 通过代理拦截 Spring Bean 的方法执行，声明式事务是其最重要应用之一。理解代理边界才能解释事务为何有时“失效”。',
        scope: [
          'join point、pointcut、advice、aspect 与 advisor',
          'JDK/CGLIB 类代理与 self-invocation',
          '@Transactional 传播、隔离、回滚和只读',
          '事务事件、远程调用边界与测试',
        ],
        topics: [
          {
            name: 'Spring AOP 模型',
            explanation:
              'Spring AOP 只支持 Spring Bean 方法执行 join point，以 JDK 动态代理或类代理包装目标。before/after/around advice 通过 pointcut 选择方法。',
            points: [
              '横切关注点适合日志、指标、授权和事务，不承载核心业务流程。',
              'pointcut 尽量精确，避免无意代理整个应用。',
              'around advice 必须正确调用 proceed 并保留异常语义。',
            ],
            correctness:
              'Spring AOP 不是完整 AspectJ；字段访问和任意对象构造等 join point 不在代理式 AOP 范围。',
          },
          {
            name: '代理与自调用',
            explanation:
              '外部调用经过代理才能触发 advice；目标对象内部 `this.otherMethod()` 不经过代理，因此该方法上的事务/缓存/异步注解通常不会生效。',
            points: [
              '把事务边界放在外部应用服务公开方法。',
              '需要复用时拆分到另一个 Bean，而非获取当前代理形成隐式耦合。',
              'final/private 方法不适合作为类代理拦截点。',
            ],
            correctness:
              '注解只是元数据，真正行为来自代理和 advisor；对象不由 Spring 管理时注解没有对应拦截器。',
          },
          {
            name: '事务传播与回滚',
            explanation:
              'REQUIRED 加入现有事务或新建，REQUIRES_NEW 挂起外层并新建，NESTED 依赖 savepoint 支持。默认对 RuntimeException/Error 回滚，受检异常需通过 rollbackFor 或显式策略。',
            points: [
              '事务方法围绕一个本地数据库一致性边界。',
              '捕获异常后若继续提交，要明确业务允许；否则重新抛出或标记 rollback-only。',
              'REQUIRES_NEW 需要额外连接，嵌套使用可能耗尽连接池。',
            ],
            correctness: '`readOnly=true` 是优化提示和框架语义，不是数据库权限控制。',
          },
          {
            name: '远程调用与事务事件',
            explanation:
              '数据库事务上下文不会自动跨 HTTP/RPC 传播。事务内调用远端会延长锁持有并产生“本地回滚、远端已成功”。可靠事件使用 outbox 或事务后回调。',
            points: [
              '@TransactionalEventListener 按阶段执行，但进程崩溃下并不等于可靠消息。',
              '事件必须有幂等 key、版本和重放策略。',
              '集成测试验证真实数据库提交/回滚而非只 Mock。',
            ],
            correctness: '本地事务 + 发送消息的普通两步操作不是原子事务。',
          },
        ],
        process: `\`\`\`mermaid
sequenceDiagram
  participant C as Caller
  participant P as Spring Proxy
  participant T as TransactionManager
  participant S as Service
  C->>P: method()
  P->>T: begin/join
  P->>S: invoke
  alt success
    P->>T: commit
  else exception
    P->>T: rollback by rule
  end
\`\`\``,
        practice: [
          '制造 self-invocation 导致事务未生效，再通过服务拆分修复。',
          '验证 REQUIRED/REQUIRES_NEW 在内外层异常组合下的提交结果。',
          '实现 transactional outbox 并测试进程重启后的重放。',
        ],
        checks: [
          '能解释代理式 AOP 的 join point 限制。',
          '能说明事务注解失效的常见原因。',
          '能选择传播和回滚规则。',
          '能划清本地事务与远程调用边界。',
        ],
        refs: [
          [
            'Spring AOP',
            'https://docs.spring.io/spring-framework/reference/core/aop.html',
          ],
          [
            'Spring AOP Capabilities',
            'https://docs.spring.io/spring-framework/reference/core/aop/introduction-spring-defn.html',
          ],
          [
            'Declarative Transactions',
            'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html',
          ],
        ],
      },
      {
        file: '03-Spring资源事件校验缓存与调度.md',
        title: 'Spring 资源、事件、校验、缓存与任务调度',
        summary:
          'Spring Core 还提供 Resource、事件、类型转换、Bean Validation 集成、缓存抽象和任务调度；这些能力必须带边界使用。',
        scope: [
          'Resource、Environment、PropertySource 与 profile',
          'ApplicationEvent 与同步/异步监听',
          'ConversionService、DataBinder 与 Bean Validation',
          '@Cacheable、@Scheduled、@Async 与执行器',
        ],
        topics: [
          {
            name: '资源与环境',
            explanation:
              'Resource 统一 classpath、文件和 URL 资源；Environment 聚合 profiles 与属性源。配置值应映射到强类型对象并在启动时校验。',
            points: [
              'classpath 资源在 jar 中不一定能转成普通 File。',
              'profile 控制少量环境差异，不用于组合大量业务开关。',
              '密钥通过专用 secret 机制，不打印到 endpoint 或日志。',
            ],
            correctness:
              'Resource.getFile 只适用于真实文件资源；jar 内资源应使用 InputStream。',
          },
          {
            name: '应用事件',
            explanation:
              'ApplicationEvent 默认同步调用监听器，发布者线程承担耗时和异常。异步监听需要明确 Executor、上下文传播、重试与丢失语义。',
            points: [
              '进程内事件用于解耦模块协作，不替代可靠消息系统。',
              '监听器幂等且小，避免难追踪的事件链。',
              '事务阶段监听明确 BEFORE_COMMIT/AFTER_COMMIT 等语义。',
            ],
            correctness: '标记 @Async 后，发布返回不表示监听成功；进程崩溃可能丢事件。',
          },
          {
            name: '转换、绑定与校验',
            explanation:
              'ConversionService 负责类型转换，DataBinder 绑定外部属性，Bean Validation 用约束注解与分组校验对象。语法校验、业务不变量和数据库约束属于不同层。',
            points: [
              'DTO 绑定采用字段白名单，避免 mass assignment。',
              '错误消息不泄露内部字段或正则细节。',
              '跨字段业务校验放类级约束或领域服务。',
            ],
            correctness: '前端校验只改善体验，后端与数据库仍必须执行权威校验。',
          },
          {
            name: '缓存、调度与异步',
            explanation:
              'Spring Cache 是注解抽象，实际一致性取决于 cache manager；@Scheduled 触发任务，@Async 交给 Executor。三者都经过代理并受 self-invocation 约束。',
            points: [
              '缓存 key、TTL、空值和失效策略显式设计。',
              '集群定时任务需要单实例选主、分布式调度或幂等执行。',
              'Executor 有界队列、拒绝策略、trace 和优雅关闭。',
            ],
            correctness:
              '@Scheduled 默认并不保证集群只有一个节点执行，也不自动补跑错过任务。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["外部配置"] --> B["强类型绑定与校验"]
  B --> C["应用服务"]
  C --> D["进程内事件"]
  C --> E["缓存抽象"]
  C --> F["调度/异步执行器"]
\`\`\``,
        practice: [
          '把散落配置重构为强类型 ConfigurationProperties 并添加启动校验。',
          '比较同步事件和异步事件的异常传播。',
          '在两个应用实例上运行定时任务，设计幂等和单执行方案。',
        ],
        checks: [
          '能正确读取 jar 内 classpath 资源。',
          '能区分进程内事件与可靠消息。',
          '能划分绑定校验、业务校验和数据库约束。',
          '能解释缓存/异步/调度的代理与集群边界。',
        ],
        refs: [
          [
            'Spring Resources',
            'https://docs.spring.io/spring-framework/reference/core/resources.html',
          ],
          [
            'Spring Validation',
            'https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html',
          ],
          [
            'Spring Cache',
            'https://docs.spring.io/spring-framework/reference/integration/cache.html',
          ],
          [
            'Task Execution and Scheduling',
            'https://docs.spring.io/spring-framework/reference/integration/scheduling.html',
          ],
        ],
      },
    ],
  },
  {
    folder: '05-Spring Boot与Web',
    title: 'Spring Boot 与 Web 开发',
    intro:
      'Spring Boot 负责约定、自动配置、依赖管理、可执行应用和生产能力；Web 层仍建立在 HTTP、Servlet 或 Reactive 语义上。',
    refs: [
      ['Spring Boot 4.1 Reference', 'https://docs.spring.io/spring-boot/reference/'],
      [
        'Spring MVC Reference',
        'https://docs.spring.io/spring-framework/reference/web/webmvc.html',
      ],
      [
        'Spring Boot Actuator',
        'https://docs.spring.io/spring-boot/reference/actuator/',
      ],
      ['Jakarta Servlet Specification', 'https://jakarta.ee/specifications/servlet/'],
    ],
    docs: [
      {
        file: '01-Spring-Boot自动配置与启动.md',
        title: 'Spring Boot 自动配置、Starter、配置文件与启动过程',
        summary:
          'Spring Boot 不是 Spring 的替代品，而是在 Spring Framework 上提供自动配置、starter、可执行打包和生产默认值。',
        scope: [
          '@SpringBootApplication 与启动阶段',
          'starter、依赖管理和条件化自动配置',
          '外部化配置、优先级、profile 与强类型绑定',
          'Boot 4.x/3.x 与 Java 版本选择、AOT/native',
        ],
        topics: [
          {
            name: '启动与组合注解',
            explanation:
              '@SpringBootApplication 组合配置、组件扫描和自动配置。SpringApplication 推断应用类型、准备 Environment、创建 ApplicationContext、加载 Bean 并触发 runner。',
            points: [
              '主类放在合理根包，防止漏扫或过度扫描。',
              '启动失败查看 Conditions Evaluation Report 和首个根因。',
              'runner 只做短小初始化，长期任务交给生命周期组件。',
            ],
            correctness:
              '组件扫描与自动配置是两条机制；排除自动配置不等于排除组件扫描 Bean。',
          },
          {
            name: 'Starter 与自动配置条件',
            explanation:
              'starter 聚合依赖，auto-configuration 根据 classpath、Bean、属性和 Web 类型条件创建默认 Bean，并允许用户自定义 Bean back off。',
            points: [
              '通过 `--debug`/Actuator conditions 观察匹配原因。',
              '自建 starter 拆分 autoconfigure 与 starter 模块，并提供 metadata。',
              '不要复制 Boot 管理版本后再随意覆盖。',
            ],
            correctness: '自动配置是条件化普通配置，不是运行时“魔法扫描所有可能”。',
          },
          {
            name: '外部化配置与优先级',
            explanation:
              'Boot 从配置文件、环境变量、系统属性、命令行等属性源合并值，优先级影响最终结果。ConfigurationProperties 提供层次化类型绑定和校验。',
            points: [
              '配置命名稳定、默认值安全、启动时 fail-fast。',
              '环境差异通过外部注入，制品保持相同。',
              '敏感值脱离普通配置库并限制 Actuator 暴露。',
            ],
            correctness: 'profile 只控制激活配置，不提供 secret 保护和动态配置一致性。',
          },
          {
            name: '版本与 AOT',
            explanation:
              '截至 2026-07，Spring Boot 4.1 为最新稳定线，同时 4.0、3.5 等维护线仍存在。项目选择必须结合 JDK、Spring Cloud 和第三方 starter 兼容矩阵。',
            points: [
              '新项目可评估 JDK 25 LTS + Boot 4.x，迁移项目按官方 migration guide 分阶段。',
              'AOT/native image 改变反射、代理和资源发现，需要 hints 与专门测试。',
              '不要仅为启动速度牺牲调试、兼容和构建成本。',
            ],
            correctness:
              '版本号最新不等于生态组件全部支持；依赖必须按 release train/BOM 组合验证。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["SpringApplication.run"] --> B["Environment"]
  B --> C["ApplicationContext"]
  C --> D["用户配置/组件"]
  D --> E["条件自动配置"]
  E --> F["Web Server + Runners"]
\`\`\``,
        practice: [
          '用 conditions report 解释 DataSource 自动配置为何匹配/未匹配。',
          '写一个带配置 metadata 和 back-off 规则的小型 starter。',
          '在 Boot 3.5 与 4.1 测试同一最小应用的兼容差异。',
        ],
        checks: [
          '能拆解 @SpringBootApplication。',
          '能解释 starter 与 auto-configuration。',
          '能确定属性最终来源与优先级。',
          '能按兼容矩阵选择 Boot/JDK。',
        ],
        refs: [
          ['Spring Boot Reference', 'https://docs.spring.io/spring-boot/reference/'],
          [
            'Auto-configuration',
            'https://docs.spring.io/spring-boot/reference/using/auto-configuration.html',
          ],
          [
            'Externalized Configuration',
            'https://docs.spring.io/spring-boot/reference/features/external-config.html',
          ],
          ['Spring Boot 4.1', 'https://spring.io/projects/spring-boot/'],
        ],
      },
      {
        file: '02-Servlet-Tomcat-Spring-MVC完整链路.md',
        title: 'Servlet、Tomcat 与 Spring MVC 请求完整链路',
        summary:
          'Spring MVC 建立在 Servlet 容器上。理解连接、过滤器、DispatcherServlet、HandlerMapping、参数解析和消息转换，才能定位 Web 问题。',
        scope: [
          'HTTP 连接、Tomcat Connector 与 Servlet 容器',
          'Filter、DispatcherServlet、Interceptor 与 Controller',
          'HandlerMapping/Adapter、ArgumentResolver、MessageConverter',
          '线程模型、异步请求、文件上传与静态资源',
        ],
        topics: [
          {
            name: 'Servlet 与容器',
            explanation:
              'Servlet 容器管理 Servlet 生命周期并把 HTTP 请求映射为 HttpServletRequest/Response。Tomcat Connector 处理网络协议，容器线程执行 Filter 链和 Servlet。',
            points: [
              'Servlet 通常单实例多线程调用，实例字段不可保存请求状态。',
              'Filter 适合容器级请求/响应包装、认证和关联 ID。',
              '容器连接、线程、accept queue 和超时共同决定过载行为。',
            ],
            correctness:
              'Tomcat 既是 Servlet 容器也提供 HTTP 服务器能力；Nginx 反代并不是运行 Spring MVC 的前提。',
          },
          {
            name: 'DispatcherServlet 调度',
            explanation:
              'DispatcherServlet 根据 HandlerMapping 找 handler，通过 HandlerAdapter 调用，ArgumentResolver 解析参数，返回值处理器和 HttpMessageConverter 生成响应。',
            points: [
              'Interceptor 位于 Spring MVC handler 链，不能替代容器 Filter 的所有场景。',
              'JSON 序列化、内容协商、校验和异常解析各由独立组件负责。',
              '控制器保持薄，事务与业务逻辑进入应用服务。',
            ],
            correctness:
              'Controller 方法并不是由浏览器直接反射调用，中间存在映射、绑定、校验、转换和异常处理。',
          },
          {
            name: '请求绑定与响应',
            explanation:
              '@PathVariable、@RequestParam、@RequestHeader、@RequestBody 对应不同输入来源。内容类型决定消息转换器，Accept 参与响应内容协商。',
            points: [
              'DTO 与实体分离，字段白名单绑定。',
              '上传限制总大小、单文件、类型、文件名和存储路径。',
              '流式响应和下载正确设置 Content-Type、Disposition 与缓存。',
            ],
            correctness:
              '仅检查文件扩展名不足以识别内容类型，且用户文件名不得直接作为服务器路径。',
          },
          {
            name: '线程模型与异步',
            explanation:
              '传统 MVC 请求占用容器线程直到完成；Callable/DeferredResult 可释放容器线程等待异步结果，但实际工作仍需受控 Executor。虚拟线程可简化阻塞代码但下游资源仍有限。',
            points: [
              '请求上下文、SecurityContext、MDC/trace 跨异步边界显式传播。',
              '设置请求截止时间并取消下游操作。',
              '响应提交后异常无法再正常改写状态码。',
            ],
            correctness: '异步/虚拟线程不自动提供背压，必须限制队列、连接和并发。',
          },
        ],
        process: `\`\`\`mermaid
sequenceDiagram
  participant C as Client
  participant T as Tomcat
  participant F as Filter Chain
  participant D as DispatcherServlet
  participant H as Controller
  C->>T: HTTP request
  T->>F: request/response
  F->>D: dispatch
  D->>H: bind + validate + invoke
  H-->>D: body/status
  D-->>C: message conversion response
\`\`\``,
        practice: [
          '为同一接口分别编写 Filter、Interceptor 和 Controller 日志，观察顺序。',
          '自定义 HandlerMethodArgumentResolver 解析当前租户。',
          '压测慢下游下容器线程池、虚拟线程与连接池的关系。',
        ],
        checks: [
          '能画出 Tomcat 到 Controller 的调用链。',
          '能区分 Filter 与 Interceptor。',
          '能解释参数解析和消息转换。',
          '能设计异步上下文传播与超时。',
        ],
        refs: [
          [
            'Spring MVC',
            'https://docs.spring.io/spring-framework/reference/web/webmvc.html',
          ],
          [
            'DispatcherServlet',
            'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html',
          ],
          ['Jakarta Servlet', 'https://jakarta.ee/specifications/servlet/'],
          ['Apache Tomcat Documentation', 'https://tomcat.apache.org/'],
        ],
      },
      {
        file: '03-REST-API校验错误处理与版本.md',
        title: 'REST API：资源建模、HTTP 语义、校验、错误处理与版本演进',
        summary:
          'REST API 的正确性来自 HTTP 语义、资源模型、幂等性、错误契约和兼容演进，而不是 URL 是否“看起来像名词”。',
        scope: [
          'URI、HTTP method、status、header 与缓存',
          'DTO、Bean Validation、Problem Details 与异常映射',
          '分页、过滤、排序、幂等键与并发控制',
          'OpenAPI、版本、兼容与弃用',
        ],
        topics: [
          {
            name: '资源与 HTTP 语义',
            explanation:
              'GET 安全且幂等，PUT 幂等地替换/更新已知资源，DELETE 幂等但响应内容可变化，POST 通常创建或执行非幂等动作。状态码和 header 共同表达结果。',
            points: [
              '201 返回 Location，204 无响应体，409 表达状态冲突，422 可表达语义校验失败。',
              'Cache-Control、ETag、If-Match/If-None-Match 支持缓存与乐观并发。',
              '不要用所有请求都返回 200 + 自定义 code 抹掉 HTTP 语义。',
            ],
            correctness:
              '幂等表示重复相同请求的预期服务端效果一致，不表示每次响应字节完全相同。',
          },
          {
            name: 'DTO、校验与错误契约',
            explanation:
              '请求/响应 DTO 隔离领域和持久化模型。Bean Validation 处理字段/跨字段约束，服务层处理依赖当前状态的业务规则，数据库约束做最终保护。',
            points: [
              '错误响应采用 RFC Problem Details 或等价稳定结构，含 type/title/status/detail/instance/traceId。',
              '参数错误定位字段但不回显敏感输入。',
              '统一异常处理只映射已知类型，未知异常返回通用信息并记录完整 cause。',
            ],
            correctness: '校验注解不能替代授权、状态检查和唯一约束。',
          },
          {
            name: '分页、排序与幂等',
            explanation:
              'offset 分页简单但深页慢且并发变更会漂移；keyset/cursor 分页基于稳定唯一排序。POST 重试可用幂等键把业务结果与请求标识关联。',
            points: [
              '限制 pageSize、过滤复杂度和排序白名单。',
              '幂等记录包含请求摘要、状态和响应，处理并发首次请求。',
              '创建操作同时依赖数据库唯一约束。',
            ],
            correctness:
              '幂等键不是普通缓存 key；必须定义作用域、过期、请求内容冲突和处理中状态。',
          },
          {
            name: 'OpenAPI 与兼容演进',
            explanation:
              'OpenAPI 描述路径、schema、响应和安全方案，可生成客户端/校验和契约测试。兼容演进优先新增可选字段；删除、重命名、收紧枚举都可能破坏客户端。',
            points: [
              '契约纳入版本控制和 CI diff。',
              '宽容读取不等于忽略未知错误；服务端明确 additionalProperties 策略。',
              '弃用记录日期、替代方案、使用量和移除条件。',
            ],
            correctness:
              '在响应增加字段对严格反序列化客户端也可能是破坏性变更，需要真实消费者契约验证。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["HTTP 请求"] --> B["认证/授权"]
  B --> C["绑定与语法校验"]
  C --> D["业务不变量"]
  D --> E["事务写入"]
  E --> F["稳定响应/Problem Details"]
\`\`\``,
        practice: [
          '设计订单 API，覆盖 ETag、幂等创建和 keyset 分页。',
          '生成 OpenAPI 并对破坏性 schema 变更做 CI 检查。',
          '为 400/401/403/404/409/422/500 建统一错误契约测试。',
        ],
        checks: [
          '能正确选择 HTTP method/status。',
          '能划分 DTO 校验、业务校验和数据库约束。',
          '能设计稳定分页和幂等键。',
          '能识别 API 破坏性变更。',
        ],
        refs: [
          ['HTTP Semantics RFC 9110', 'https://www.rfc-editor.org/rfc/rfc9110'],
          ['Problem Details RFC 9457', 'https://www.rfc-editor.org/rfc/rfc9457'],
          ['OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html'],
          [
            'Spring MVC REST',
            'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html',
          ],
        ],
      },
      {
        file: '04-Actuator日志指标追踪与生产配置.md',
        title: 'Spring Boot Actuator、日志、指标、追踪与生产配置',
        summary:
          '生产级 Boot 服务需要 health、metrics、traces、logs、审计和安全暴露策略形成诊断闭环。',
        scope: [
          'Actuator endpoint、health group 与 probes',
          '结构化日志、MDC、敏感信息和采样',
          'Micrometer metrics 与高基数控制',
          'OpenTelemetry trace/context 与告警',
        ],
        topics: [
          {
            name: 'Actuator endpoint 与安全',
            explanation:
              'Actuator 提供 health、metrics、env、configprops、loggers、threaddump 等生产端点。默认暴露应最小化，管理端口/网络与鉴权独立控制。',
            points: [
              'liveness 只判断是否应重启，readiness 判断是否接流量。',
              '自定义 HealthIndicator 设置短超时，不把所有外部依赖放 liveness。',
              'env/configprops 可能包含敏感值，生产严格限制。',
            ],
            correctness: '数据库短暂不可用通常不应让 liveness 失败并触发所有实例重启。',
          },
          {
            name: '结构化日志与关联',
            explanation:
              '日志是离散事件，包含时间、level、service、trace/span、请求/业务标识和安全上下文。MDC 在线程切换和异步边界需要传播并清理。',
            points: [
              '不记录密码、token、完整卡号和大请求体。',
              '异常记录一次完整 cause，避免层层重复打同一堆栈。',
              '日志级别可动态调整但需权限和审计。',
            ],
            correctness:
              '日志量不是可观测性质量；无结构、无关联和无语义的海量日志仍难诊断。',
          },
          {
            name: '指标与高基数',
            explanation:
              'Micrometer 用 Counter、Gauge、Timer、DistributionSummary 等抽象导出指标。tag 维度决定时间序列数量，userId/orderId 等高基数标签会冲垮后端。',
            points: [
              '以 RED（Rate/Error/Duration）和资源饱和度建立仪表盘。',
              '延迟使用 histogram/percentile 并理解聚合方式。',
              '业务指标定义单位、所有者和告警动作。',
            ],
            correctness:
              '客户端计算平均百分位不能在实例间正确聚合；使用可合并直方图桶。',
          },
          {
            name: '分布式追踪与告警',
            explanation:
              'trace 由 spans 组成，通过 context propagation 跨 HTTP/消息边界。OpenTelemetry 统一 traces、metrics、logs API/协议；采样影响成本与可见性。',
            points: [
              '入口生成/验证 trace context，异步消息携带上下文。',
              '错误与高延迟可尾采样，关键业务保留策略明确。',
              '告警基于 SLO 和用户影响，附带 runbook。',
            ],
            correctness:
              'trace 显示相关调用链，不自动证明因果；仍需日志、指标和代码证据交叉验证。',
          },
        ],
        process: `\`\`\`mermaid
flowchart LR
  A["请求"] --> B["Trace Context"]
  B --> C["结构化日志"]
  B --> D["Metrics"]
  B --> E["Spans"]
  C --> F["Dashboard/Query"]
  D --> F
  E --> F
  F --> G["SLO 告警 + Runbook"]
\`\`\``,
        practice: [
          '为订单接口接入 Actuator、Timer 和 trace，构造一次跨服务慢请求。',
          '验证异步线程池中 MDC/trace 是否传播与清理。',
          '设计 readiness/liveness 并模拟数据库和自身死锁故障。',
        ],
        checks: [
          '能安全暴露 Actuator。',
          '能区分 liveness 与 readiness。',
          '能控制指标标签基数。',
          '能用日志、指标、trace 联合定位。',
        ],
        refs: [
          [
            'Spring Boot Actuator',
            'https://docs.spring.io/spring-boot/reference/actuator/',
          ],
          [
            'Production-ready Features',
            'https://docs.spring.io/spring-boot/reference/actuator/index.html',
          ],
          [
            'Micrometer Documentation',
            'https://docs.micrometer.io/micrometer/reference/',
          ],
          ['OpenTelemetry Java', 'https://opentelemetry.io/docs/languages/java/'],
        ],
      },
    ],
  },
]

backendSections.push(...extraBackendSections)

for (const section of backendSections) {
  for (const doc of section.docs) {
    await writeDoc(`${section.folder}/${doc.file}`, topicDoc(doc))
  }
  await writeDoc(
    `${section.folder}/90-推荐阅读/01-${section.title}推荐阅读.md`,
    recommendationDoc(`${section.title}推荐阅读`, section.intro, section.refs),
  )
}

for (const guide of stageGuides) {
  await writeDoc(`${guide.folder}/00-本阶段导学.md`, guide.content)
}

for (const doc of supplementaryDocuments) {
  await writeDoc(`${doc.folder}/${doc.file}`, doc.content)
}

console.log(
  JSON.stringify(
    {
      contentRoot,
      foundationDocuments: foundationLessons.length,
      backendSections: backendSections.length,
      backendDocuments: backendSections.reduce(
        (count, section) => count + section.docs.length + 1,
        0,
      ),
      stageGuides: stageGuides.length,
      supplementaryDocuments: supplementaryDocuments.length,
      totalDocuments:
        foundationLessons.length +
        2 +
        backendSections.reduce((count, section) => count + section.docs.length + 1, 0) +
        stageGuides.length +
        supplementaryDocuments.length,
    },
    null,
    2,
  ),
)
