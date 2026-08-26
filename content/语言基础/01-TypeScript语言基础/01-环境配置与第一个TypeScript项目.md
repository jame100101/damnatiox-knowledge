# 环境配置与第一个 TypeScript 项目

本章从零搭建一个可复现的 Node.js + TypeScript 项目。核心原则是：**项目级依赖、严格配置、类型检查与运行分离**。

## 1. 准备 Node.js 与包管理器

TypeScript 编译器通过 npm 分发。先安装受支持的 Node.js LTS，并检查命令来源：

```bash
node --version
npm --version
```

Windows PowerShell 可用 `Get-Command node,npm,npx`，macOS/Linux 可用 `command -v node npm npx`。如果团队使用 `.nvmrc`、Volta 或 Corepack，应把版本约束提交到仓库。

## 2. 初始化项目

```bash
mkdir hello-typescript
cd hello-typescript
npm init -y
npm install --save-dev typescript@latest @types/node
npx tsc --init
```

推荐目录：

```text
hello-typescript/
├─ src/
│  └─ index.ts
├─ test/
├─ package.json
├─ package-lock.json
└─ tsconfig.json
```

`@types/node` 只提供 Node API 的类型声明，不提供 Node 运行时本身。浏览器项目通常不需要它，而通过 `lib` 获取 DOM 类型。

## 3. 建立严格 tsconfig

新版本默认值会变化，因此关键意图仍建议显式记录：

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "verbatimModuleSyntax": true,
    "sourceMap": true,
    "declaration": true,
    "skipLibCheck": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

配套 `package.json` 使用 ESM：

```json
{
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js"
  }
}
```

`module` 与 `moduleResolution` 应成对匹配真实执行环境。使用 Vite、esbuild 等构建器的前端项目通常选择 `module: "ESNext"` 与 `moduleResolution: "Bundler"`；原生 Node ESM 更适合 `NodeNext`。

## 4. 第一个程序

`src/index.ts`：

```typescript
type User = {
  readonly id: string
  name: string
}

function greet(user: User): string {
  return `Hello, ${user.name}!`
}

const currentUser = { id: "u-1", name: "Ada", role: "admin" }
console.log(greet(currentUser))
```

执行质量链：

```bash
npm run typecheck
npm run build
npm start
```

结构化类型允许带额外 `role` 属性的变量传给只要求 `id`、`name` 的函数。若直接把带未知属性的对象字面量写进参数位置，会触发“多余属性检查”；这是一项专门帮助发现拼写错误的检查，不代表 TypeScript 变成名义类型系统。

## 5. 开发期直接运行与生产构建

Node 的新版本或第三方运行器可以剥离部分 TypeScript 类型语法，但“能运行”不等于“做过完整类型检查”。稳定做法是始终保留独立门禁：

```bash
npx tsc --noEmit
```

如果开发环境用 `tsx`、Babel、SWC 或 esbuild 快速转换，CI 仍运行 `tsc --noEmit`。这些转换器通常只去掉类型语法，不执行完整语义检查。

## 6. 调试配置

开启 `sourceMap` 后，Node 可把堆栈映射回 `.ts`：

```bash
node --enable-source-maps dist/index.js
```

不要把真实密钥写进源码或 source map。环境变量在 Node 中是 `string | undefined`，必须检查：

```typescript
function requiredEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

const apiUrl = new URL(requiredEnv("API_URL"))
```

## 7. 常见故障定位

| 症状 | 原因 | 检查 |
| --- | --- | --- |
| `tsc` 版本不一致 | 调用了全局安装 | 用 `npx tsc --version`，检查锁文件 |
| ESM 导入运行时报错 | `package.json`、扩展名和模块配置不匹配 | 查 `type`、`module`、`moduleResolution` |
| 编辑器无错但 CI 报错 | 编辑器使用了另一版本 | 在编辑器选择 workspace TypeScript |
| 找不到 Node API | 缺 `@types/node` 或 `types` 未包含 | 检查依赖与 `compilerOptions.types` |
| 编译成功但输入崩溃 | 外部数据未运行时验证 | 将入口数据视为 `unknown` 并解析 |

## 8. 环境验收清单

- [ ] `node --version` 与团队要求一致。
- [ ] `npx tsc --version` 来自本地依赖。
- [ ] `npm ci && npm run typecheck && npm run build` 在干净目录通过。
- [ ] `dist` 中没有 `interface`、`type` 等纯类型声明。
- [ ] source map 能定位源文件。
- [ ] CI 没有用 `skipLibCheck` 隐藏本项目声明错误；若因依赖性能开启，已记录取舍。

参考：[官方安装页](https://www.typescriptlang.org/download/)、[TSConfig Reference](https://www.typescriptlang.org/tsconfig/)、[Modules: Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html)。

