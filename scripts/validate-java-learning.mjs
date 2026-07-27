import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(projectRoot, 'content', 'Java开发')

const expectedFoundation = [
  '01-Java开发入门.md',
  '02-Java编程基础.md',
  '03-面向对象上.md',
  '04-面向对象下.md',
  '05-异常处理.md',
  '06-Java核心API.md',
  '07-Java集合框架.md',
  '08-Java泛型.md',
  '09-反射机制.md',
  '10-IO与NIO.md',
  '11-JDBC数据库访问.md',
  '12-Java并发与多线程.md',
  '13-Java网络编程.md',
  '14-泛型与集合框架综合.md',
]

const expectedFolders = [
  '01-Java基础',
  '02-工程工具与Linux',
  '03-数据库缓存与搜索',
  '04-Spring Framework',
  '05-Spring Boot与Web',
  '06-数据访问与ORM',
  '07-分布式与微服务',
  '08-高性能与消息队列',
  '09-安全认证与授权',
  '10-测试与质量工程',
  '11-云原生DevOps与可观测性',
  '12-前端与全栈交付',
  '13-项目阶梯',
]

const expectedSupplementary = [
  '02-工程工具与Linux/04-数据结构算法复杂度与刷题方法.md',
  '02-工程工具与Linux/05-设计原则UML与常用设计模式.md',
  '02-工程工具与Linux/06-JVM内存类加载字节码与GC.md',
  '04-Spring Framework/04-Spring异步定时任务Quartz与Batch.md',
  '05-Spring Boot与Web/05-OpenAPI文件处理邮件与WebSocket.md',
  '06-数据访问与ORM/04-MyBatis-Plus工程实践.md',
  '07-分布式与微服务/06-Spring-Cloud与Spring-Cloud-Alibaba组件图.md',
  '07-分布式与微服务/07-Seata-Sentinel-SkyWalking实战边界.md',
  '08-高性能与消息队列/06-Caffeine本地缓存与多级缓存.md',
  '12-前端与全栈交付/04-HTML语义表单媒体与可访问性.md',
  '12-前端与全栈交付/05-CSS级联盒模型布局响应式与动画.md',
  '12-前端与全栈交付/06-JavaScript基础类型函数集合DOM与事件.md',
  '12-前端与全栈交付/07-JavaScript高级异步模块网络与性能.md',
  '12-前端与全栈交付/08-TypeScript-Vue工程化测试与性能.md',
]

const requiredConcepts = [
  'JDK 25',
  'JDK 26',
  'Java Memory Model',
  'JDBC',
  'Maven',
  'Gradle',
  'Linux',
  'Docker',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'Spring Framework',
  'Spring Boot',
  'Servlet',
  'Tomcat',
  'Nginx',
  'MyBatis',
  'JPA',
  'CAP',
  'BASE',
  'Paxos',
  'Raft',
  'Gossip',
  'OpenFeign',
  'Dubbo',
  'gRPC',
  'Netty',
  'Nacos',
  '分布式 ID',
  'Outbox',
  'Saga',
  'Kafka',
  'RabbitMQ',
  'RocketMQ',
  'Spring Security',
  'OAuth 2.0',
  'JUnit',
  'Mockito',
  'Testcontainers',
  'Playwright',
  'Kubernetes',
  'OpenTelemetry',
  'SLO',
  'TypeScript',
  'Vue 3',
  '数据结构',
  '设计模式',
  '类加载',
  '垃圾收集',
  'MyBatis-Plus',
  'Spring Cloud Alibaba',
  'Seata',
  'Sentinel',
  'SkyWalking',
  'Spring Batch',
  'Quartz',
  'Caffeine',
  'WebSocket',
  '事件循环',
  '可访问性',
]

async function walk(directory) {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(filename)))
    else if (/\.md$/i.test(entry.name)) files.push(filename)
  }
  return files
}

const errors = []
const foundationDirectory = path.join(contentRoot, '01-Java基础')
const foundationNames = new Set(
  (await fs.readdir(foundationDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => entry.name),
)

for (const name of expectedFoundation) {
  if (!foundationNames.has(name)) errors.push(`缺少 PPT 对应文档：${name}`)
}
if (foundationNames.size !== expectedFoundation.length) {
  errors.push(
    `Java 基础直属文档应为 ${expectedFoundation.length} 个，实际为 ${foundationNames.size} 个`,
  )
}

for (const folder of expectedFolders) {
  try {
    const stat = await fs.stat(path.join(contentRoot, folder))
    if (!stat.isDirectory()) errors.push(`不是目录：${folder}`)
  } catch {
    errors.push(`缺少目录：${folder}`)
  }
}

for (const folder of expectedFolders.slice(1)) {
  try {
    await fs.access(path.join(contentRoot, folder, '00-本阶段导学.md'))
  } catch {
    errors.push(`缺少阶段导学：${folder}`)
  }
}

for (const relative of expectedSupplementary) {
  try {
    await fs.access(path.join(contentRoot, ...relative.split('/')))
  } catch {
    errors.push(`缺少路线补全文档：${relative}`)
  }
}

const files = await walk(contentRoot)
if (files.length !== 100) {
  errors.push(`Java 路线文档应为 100 个，实际为 ${files.length} 个`)
}
let combined = ''
for (const filename of files) {
  const markdown = await fs.readFile(filename, 'utf8')
  const relative = path.relative(contentRoot, filename)
  combined += `\n${markdown}`

  if (!/^#\s+\S/m.test(markdown)) errors.push(`缺少一级标题：${relative}`)
  if (!/## 参考资料|## 参考路线|## 官方资料优先顺序/.test(markdown)) {
    errors.push(`缺少参考资料：${relative}`)
  }
  if ((markdown.match(/```/g) || []).length % 2 !== 0) {
    errors.push(`代码围栏未闭合：${relative}`)
  }
  const isReading = relative.includes(`${path.sep}90-推荐阅读${path.sep}`)
  const isOverview = relative === '00-Java后端学习路线总览.md'
  const hasExecutableExample =
    /```(?:java|xml|sql|bash|yaml|json|typescript|javascript|vue|nginx|dockerfile|properties|proto|html|http|css)\b/.test(
      markdown,
    )
  if (!isReading && !isOverview && !hasExecutableExample) {
    errors.push(`缺少非 Mermaid 代码示例：${relative}`)
  }
  const minimum = isReading ? 350 : 1000
  if (markdown.length < minimum) {
    errors.push(`内容长度低于 ${minimum} 字符：${relative}`)
  }
}

for (const concept of requiredConcepts) {
  if (!combined.includes(concept)) errors.push(`路线缺少必备概念：${concept}`)
}
if (/(^|[^\p{L}])(Agent|RAG|AI)([^\p{L}]|$)|大模型|人工智能/imu.test(combined)) {
  errors.push('Java 路线混入了已排除的相关主题')
}

const report = {
  folders: expectedFolders.length,
  documents: files.length,
  pptDocuments: expectedFoundation.length,
  characters: combined.length,
  mermaidDiagrams: (combined.match(/```mermaid/g) || []).length,
  externalReferences: (combined.match(/\]\(https:\/\//g) || []).length,
}

if (errors.length) {
  console.error(JSON.stringify({ ...report, errors }, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify({ ...report, status: 'ok' }, null, 2))
}
