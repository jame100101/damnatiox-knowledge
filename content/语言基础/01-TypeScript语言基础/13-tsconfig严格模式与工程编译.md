# tsconfig、严格模式、项目引用与工程编译

`tsconfig.json` 同时决定文件集合、类型环境、模块解释和生成行为。配置不是“能编译就行”，而是工程契约的一部分。

## 1. 文件选择

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["dist", "coverage"],
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

`exclude` 不是安全边界：被已包含文件导入的模块仍会进入程序。用 `npx tsc --explainFiles` 检查文件为何被纳入。

## 2. 严格模式族

`strict` 开启一组更强检查，未来版本可能向该组增加选项，所以升级后出现新诊断是正常的。重要成员包括：

- `strictNullChecks`：把 `null`/`undefined` 纳入类型。
- `noImplicitAny`：不允许无法推断而产生隐式 `any`。
- `strictFunctionTypes`：更严格检查函数参数兼容性。
- `strictPropertyInitialization`：要求类字段在构造完成前初始化。
- `useUnknownInCatchVariables`：`catch` 变量按 `unknown` 处理。

## 3. 推荐的额外防错选项

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

这些选项可能增加局部代码量，但能让数组越界、可选属性语义、覆写和分支遗漏显式出现。

## 4. `target`、`module`、`moduleResolution`、`lib`

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2024"],
    "types": ["node"]
  }
}
```

- Node 服务不应无意包含 `DOM`，否则 `window` 会在检查阶段虚假可用。
- 浏览器应用通常包含 `DOM`，但不应无意包含 Node 全局。
- `types` 控制自动注入的 `@types` 包；它不限制显式导入的声明。
- TypeScript 7 默认更现代且移除 6.0 废弃项，旧配置升级先读 6.0 与 7.0 release notes。

## 5. 检查与生成分离

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json"
  }
}
```

应用可能由 Vite/SWC 转换源码，而 `tsc --noEmit` 独立保证类型检查。库通常还需要声明 emit。

## 6. 配置继承

`tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true
  }
}
```

包配置：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

数组型配置通常会替换而非自动合并父配置，应使用 `--showConfig` 查看最终结果。

## 7. 项目引用

```json
{
  "files": [],
  "references": [
    { "path": "./packages/domain" },
    { "path": "./packages/api" }
  ]
}
```

```bash
npx tsc --build
npx tsc --build --clean
```

项目引用为大型仓库建立显式依赖和增量构建边界。被引用项目通常启用 `composite`，公共边界通过声明文件传递。

## 8. 增量构建与缓存

`incremental` 产生 `.tsbuildinfo` 缓存检查图。缓存不是产物真相，CI 缓存键至少包含 TypeScript 版本、配置和锁文件；出现难解差异时清理后全量构建。

## 9. `skipLibCheck` 的取舍

它跳过声明文件内部检查，可加快构建并缓解依赖声明冲突，但不会让本项目使用声明时完全无检查。库作者和类型基础设施应优先保持关闭；大型应用若开启，需要跟踪上游问题，避免长期掩盖重复类型版本。

## 10. 配置诊断命令

```bash
npx tsc --showConfig
npx tsc --explainFiles
npx tsc --traceResolution
npx tsc --extendedDiagnostics
```

参考：[TSConfig Reference](https://www.typescriptlang.org/tsconfig/)、[strict](https://www.typescriptlang.org/tsconfig/strict.html)、[Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)、[TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)。

## 11. Freshness metadata

- `last_verified`: `2026-08-26`
- `version_scope`: `TypeScript 7.0 / 6.0 migration`
- `source_type`: `TypeScript 官方文档`
- `stability`: `fast-moving`

