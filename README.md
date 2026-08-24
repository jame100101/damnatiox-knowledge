# Damnatiox Knowledge

基于 Nuxt 3、Vue 3、TypeScript 与 Supabase 的动态 Markdown 知识库。公开运行时从 Supabase 读取文件夹、文章正文与元数据；`content/Agent开发`、`content/Java开发` 是两条课程的 Git 审查与批量同步源。

## 功能

- 任意层级知识文件夹、稳定排序、移动与循环关系校验
- `/knowledge/[...path]` 动态文件夹/文章路由与完整面包屑
- Markdown 上传、Frontmatter 解析、左右分栏实时预览
- 表格、任务列表、代码高亮/复制、KaTeX、Mermaid 与目录
- 首页工作台、三栏阅读界面、全文/标题/标签搜索、移动端目录
- Supabase Auth 管理员登录、Postgres 数据、Storage、Realtime
- RLS 强制匿名只读已发布文章、管理员写入
- 未配置 Supabase 时使用只读内置演示数据，方便检查 UI

## 本地运行

要求 Node.js 24（见 `.nvmrc`）。

```bash
npm install
copy .env.example .env
npm run dev
```

默认访问 `http://localhost:3000`。未填写 Supabase 变量时，公开页面使用演示数据；开发环境中的管理页采用内存演示模式。

## 环境变量

| 变量 | 作用 |
|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | Supabase 项目 API URL，可安全发送到浏览器 |
| `NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable/Anon Key，访问范围由 RLS 控制 |

项目不依赖 service role；不要把数据库密码、Access Token 或 service role key 放入 `.env.example`、客户端变量或 Git。

## Supabase 初始化

安装并登录 CLI：

```bash
npm install --global supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase db seed
```

迁移 `supabase/migrations/202607250001_initial_knowledge_schema.sql` 会创建：

- `profiles`：关联 `auth.users`，角色仅为 `admin` / `reader`
- `folders`：使用 `parent_id` 表达层级，根与同级 Slug 均唯一
- `documents`：正文、元数据、发布状态与 Storage 路径
- `document_links`：预留相关文档/双向链接
- 更新时间、新用户 Profile、循环父子关系和角色提权保护触发器
- 全部索引、RLS、Realtime publication 与 Storage Policy

迁移也会创建：

- `knowledge-source`：私有，Markdown 最大 2 MB，仅管理员读写
- `knowledge-assets`：公开读取、管理员写入，图片/PDF 最大 20 MB

### 创建第一个管理员

1. Supabase Dashboard → Authentication → Users，手动创建用户（公开注册保持关闭）。
2. 在 SQL Editor 运行一次：

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'ADMIN_EMAIL'
);
```

3. 使用该邮箱和密码访问 `/admin/login`。

生产环境中后续角色调整应由已有管理员执行，不应从浏览器自行提升。

### 验证 RLS

- 未登录客户端查询 `documents` 只返回 `status = 'published'`。
- 未登录执行 `insert/update/delete` 应返回 RLS 错误。
- reader 查询草稿、修改文件夹或更新 `profiles.role` 应失败。
- admin 可读写业务表和两个 Bucket。

## Vercel 部署

```bash
npm install --global vercel
vercel link
vercel env add NUXT_PUBLIC_SUPABASE_URL
vercel env add NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
vercel
vercel --prod
```

Nuxt/Nitro 已配置 `vercel` preset，动态 catch-all 路由由服务端渲染，直接刷新不会依赖静态重写。部署后把 Supabase Auth 的：

- Site URL 设置为生产 URL；
- Redirect URLs 加入 `https://YOUR_DOMAIN/**`；
- 如需自定义域名，在 Vercel Project → Settings → Domains 绑定并同步更新上述 Auth URL。

## 管理操作

### 添加知识文件夹

1. 登录 `/admin/login`。
2. 打开“文件夹”并点击“新建文件夹”。
3. 填写名称、Slug、描述、父文件夹、排序和可见性。
4. 选择父级可创建子文件夹；编辑父级可移动文件夹。
5. 数据库触发器与 UI 都会阻止移动到自身或后代。

非空文件夹不会被静默删除；应先移动其中的子文件夹和文章。

### 上传 Markdown

1. 打开“新建文档”。
2. 选择目标文件夹，拖入 `.md` / `.markdown`（最大 2 MB）。
3. 检查 Frontmatter 自动填充的标题、Slug、描述和标签。
4. 在左右分栏中编辑原文并检查实时预览。
5. 点击“保存草稿”或“发布文档”。
6. 发布会写入 Postgres、保存原始文件到 `knowledge-source`，随后立即打开动态文章 URL。

支持的 Frontmatter：

```yaml
---
title: Spring Boot 自动配置
description: 自动配置的工作原理
tags: [java, spring]
folder: Java 后端/Spring/Spring Boot
slug: auto-configuration
status: published
order: 10
---
```

`folder` 只作为提示；管理员必须在 UI 确认 `folder_id`。`owner`、`role` 等权限字段会被忽略。

## 跨设备同步

所有文件夹、文章和 Markdown 正文均保存在同一套 Supabase 数据中，任何设备读取相同数据；Realtime 在其他设备修改时显示更新提示。`localStorage`/Cookie 只保存侧栏等界面偏好，不保存知识正文。

### Git 内容树同步

```bash
# 先做本地结构、标题、链接、fence 与 freshness 校验
npm run content:validate-architecture

# 需要管理员密码或仅在当前进程注入 service-role key
$env:AGENT_SEED_ADMIN_PASSWORD="ADMIN_PASSWORD"
$env:CONTENT_SYNC_ARCHIVE="true"
npm run content:sync
```

同步器先按标题、原文件名和显式迁移 alias 匹配记录，再移动 `folder_id`，因此已存在文档会尽量保留数据库 ID。`CONTENT_SYNC_ARCHIVE=true` 会把两棵树中未匹配的旧文档设为草稿、旧文件夹设为隐藏；不做物理删除，且可在后台恢复。迁移详情见 `docs/CONTENT_ARCHITECTURE_MIGRATION_2026-08-24.md`。

快速变化文章使用正文可见的 `Freshness metadata` block；当前本地 importer 不把任意 frontmatter 字段映射到数据库 schema，因此该格式可在本地、后台编辑器和 Supabase 页面一致渲染。

## 检查与测试

```bash
npm run lint
npm run typecheck
npm test
npm run test:component
npm run test:security
npm run content:validate-architecture
npm run content:validate-code-groups
npx playwright install chromium
npm run test:e2e
npm run build
```

测试覆盖 Slug、文件名、Frontmatter、Markdown、文件夹树/排序/循环、动态路径、面包屑、选择器、XSS 与公开浏览流程。

## 目录结构

```text
app/
├── assets/css/       # 统一主题令牌
├── components/       # common / knowledge / markdown / admin
├── composables/      # 数据、Auth、Realtime
├── data/             # 无 Supabase 时的演示数据
├── layouts/          # 公开三栏与管理后台布局
├── middleware/       # 管理入口体验层保护
├── pages/            # 动态知识路由与后台
├── plugins/          # Supabase Client
├── types/
└── utils/            # Markdown、树、路径、文件名
supabase/
├── migrations/
├── seed.sql
└── config.toml
tests/
├── unit/
├── component/
├── security/
└── e2e/
```

## 当前边界

- 中文搜索第一版使用客户端包含匹配，数据量增大后建议迁移到 PostgreSQL FTS/RPC。
- 批量文件选择会逐个提示，但编辑器一次聚焦处理一篇；未实现批量冲突处理面板。
- 图片 Bucket 与 Policy 已就绪，第一版编辑器保留图片上传入口，完整的 MIME 文件头检测和自动插入 URL 待补充。
- Wiki Link 以模块化占位链接渲染，尚未建立标题解析 RPC。
- 拖放移动未启用；文件夹父级下拉与文档编辑器文件夹下拉已完整支持移动。
