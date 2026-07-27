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

const files = await walk(contentRoot)
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
