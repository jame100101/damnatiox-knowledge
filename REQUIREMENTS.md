你是一名资深 Vue、Nuxt、Supabase、Vercel 全栈工程师和产品架构师。

请直接在当前工作区设计、实现、测试并部署一个完整的个人 Markdown 知识库网站。

不要只提供教程、示例代码、伪代码或架构建议。请完成一个可以实际运行和部署的第一版成品。

---

# 一、项目基本信息

项目名称：

Damnatiox Knowledge

建议的 Vercel 项目名称：

damnatiox-knowledge

建议的 Supabase 项目名称：

damnatiox-knowledge

参考网站：

[https://localchat.damnatiox.com/](https://localchat.damnatiox.com/)

视觉风格需要与该网站保持一致或高度接近。

开始开发前，请先检查：

1. 当前工作目录是否已经存在项目。
2. 是否存在 LocalChat 项目源码。
3. 是否存在可以复用的 CSS Variables、Tailwind 配置、字体、颜色、布局组件或设计令牌。
4. 当前 GitHub 仓库和远程分支情况。
5. 当前环境中是否已经连接 Vercel、Supabase 和 GitHub 插件、App、MCP 或 CLI。
6. Node.js、npm、Vercel CLI、Supabase CLI 是否可用。

严禁修改、覆盖或重新部署现有的 LocalChat 生产项目。

如果无法访问 LocalChat 登录后的页面或源代码：

* 不要虚构其具体布局。
* 使用本提示词中的视觉要求实现。
* 将颜色、圆角、边框、字体和间距集中定义，方便以后根据截图继续调整。

---

# 二、产品目标

创建一个具有以下特点的个人知识库：

* 类似 Obsidian 的 Markdown 文件管理。
* 类似 Datawhale 文档站的知识目录。
* 类似 GitBook 的三栏阅读界面。
* 类似文件管理器的文件夹组织能力。
* 与 LocalChat 相近的暗色工具型界面。
* 可以在网页中直接上传 Markdown 文件。
* 上传前可以立即预览。
* 上传后无需重新构建或部署即可生成文章页面。
* 所有设备访问网站时看到相同内容。
* 管理员可以直接在网页中管理知识文件夹和文章。

系统核心工作流：

1. 管理员登录管理后台。
2. 管理员创建知识文件夹，例如：

   * Java 后端
   * Agent 开发
   * RAG
   * 操作系统
   * 网络
3. 文件夹可以继续包含子文件夹，例如：

```text
Java 后端
├── Java 基础
├── Spring
│   ├── Spring Boot
│   ├── Spring Security
│   └── Spring Data JPA
└── JVM
```

4. 管理员进入某个文件夹。
5. 上传一个或多个 `.md` 文件。
6. 浏览器立即读取 Markdown 内容并显示预览。
7. 管理员填写或修改标题、路径、标签、描述和状态。
8. 点击发布。
9. Markdown 正文和元数据写入 Supabase Postgres。
10. 原始 `.md` 文件写入 Supabase Storage。
11. 发布后立即出现动态文章页面。
12. 文章显示在对应知识文件夹中。
13. 管理员可以移动文章到其他文件夹。
14. 管理员可以修改文件夹名称、排序和父文件夹。
15. 所有设备打开网站后看到相同的目录与文章。

该系统不是构建时文档站。

不要采用：

```text
上传 Markdown
→ 重新运行 npm build
→ 重新部署
→ 才能出现页面
```

正确流程必须是：

```text
上传 Markdown
→ 写入 Supabase
→ 动态页面立即可访问
```

---

# 三、技术栈

使用当前稳定版本：

* Vue 3
* Nuxt 3
* TypeScript
* Vite
* Supabase
* Supabase Postgres
* Supabase Auth
* Supabase Storage
* Supabase Realtime
* `@supabase/supabase-js`
* Markdown-it 或稳定的同类 Markdown 解析器
* Markdown Frontmatter 解析器
* DOMPurify 或可靠的同构 HTML 清理方案
* Shiki 或稳定的代码高亮方案
* Mermaid
* KaTeX
* ESLint
* Prettier
* Vitest
* Playwright
* Vercel

优先使用 npm。

使用当前稳定的 Node.js LTS，并通过以下方式固定版本：

* `.nvmrc`
* `package.json` 的 `engines`

不要添加：

* Spring Boot
* Express 独立服务器
* MySQL
* Redis
* MongoDB
* WordPress
* VitePress
* Docker 生产运行依赖
* Kubernetes
* 微服务
* 付费搜索服务
* 不必要的状态管理库

只有确实存在复杂跨页面状态时才使用 Pinia。

---

# 四、核心数据模型

“文件夹”不能只用一个 `category` 字符串实现。

必须建立真正的、支持父子关系的知识文件夹数据模型。

## 4.1 profiles 表

创建 `profiles` 表：

```text
id uuid primary key references auth.users(id) on delete cascade
display_name text
role text not null default 'reader'
created_at timestamptz
updated_at timestamptz
```

约束：

* role 只允许 `admin` 或 `reader`。
* 普通用户不能自行将 role 改为 admin。
* 新 Auth 用户创建后，自动创建对应 profile。

## 4.2 folders 表

创建 `folders` 表：

```text
id uuid primary key default gen_random_uuid()
parent_id uuid references folders(id)
name text not null
slug text not null
description text
icon text
sort_order integer not null default 0
is_visible boolean not null default true
created_by uuid references auth.users(id)
created_at timestamptz
updated_at timestamptz
```

要求：

* `parent_id` 为空表示顶级文件夹。
* 一个文件夹可以包含任意数量的子文件夹。
* 支持至少 5 层嵌套。
* 防止循环父子关系。
* 文件夹不能把自己设为自己的父级。
* 文件夹不能移动到自己的后代文件夹中。
* 同一个父文件夹下，slug 必须唯一。
* 同一个父文件夹下，name 可以限制为唯一，或者在 UI 中明确提示重名。
* 根目录下也要保证 slug 唯一。
* 增加 `updated_at` 自动更新触发器。
* 为 `parent_id`、`slug`、`sort_order` 建立索引。

示例：

```text
Agent 开发
├── Agent 基础
├── Tool Calling
├── Memory
└── Multi-Agent
```

数据库中通过 `parent_id` 表达层级关系。

## 4.3 documents 表

创建 `documents` 表：

```text
id uuid primary key default gen_random_uuid()
folder_id uuid references folders(id)
owner_id uuid references auth.users(id)
slug text not null
title text not null
description text
content text not null
tags text[] not null default '{}'
cover_url text
source_storage_path text
original_filename text
file_size_bytes bigint
content_hash text
status text not null default 'draft'
sort_order integer not null default 0
reading_time integer
excerpt text
published_at timestamptz
created_at timestamptz
updated_at timestamptz
```

约束：

* status 只允许 `draft` 或 `published`。
* 同一文件夹中的文档 slug 必须唯一。
* 不同文件夹中允许存在相同 slug。
* 文档可以不属于文件夹，但后台应默认提示选择文件夹。
* 文档移动时只修改 `folder_id`，不能复制出重复文档。
* 增加 `updated_at` 自动更新触发器。

创建索引：

* folder_id
* slug
* status
* tags
* updated_at
* published_at
* sort_order

## 4.4 可选关系表

为了支持相关文章和双向链接，可以创建：

```text
document_links
```

字段：

```text
id uuid
source_document_id uuid
target_document_id uuid
link_text text
created_at timestamptz
```

第一版可以只解析标准 Markdown 链接。

不要为了知识图谱引入过于复杂的数据库设计。

---

# 五、文件夹路径与路由设计

公开知识库路由采用：

```text
/knowledge/[...path]
```

例如：

```text
Java 后端
└── Spring
    └── Spring Boot
        └── dependency-injection.md
```

对应公开地址：

```text
/knowledge/java-backend/spring/spring-boot/dependency-injection
```

文件夹页面：

```text
/knowledge/java-backend
/knowledge/java-backend/spring
/knowledge/java-backend/spring/spring-boot
```

文件夹页面需要显示：

* 文件夹名称
* 文件夹描述
* 子文件夹
* 当前文件夹中的文章
* 最近更新文章
* 文档数量
* 面包屑导航

文章页面需要显示完整面包屑：

```text
知识库 / Java 后端 / Spring / Spring Boot / Dependency Injection
```

路由解析应根据数据库中的文件夹树和 slug 动态完成。

不要为每篇文章创建独立 Vue 文件。

不要将路径硬编码在路由配置中。

## 路径稳定性

文件夹改名时：

* 可以只改变显示名称，不改变 slug。
* 如果管理员主动修改 slug，需要提示公开链接会发生变化。
* 修改 slug 后，应重新计算子文件夹和文章的完整 URL。
* 文档数据库主键必须保持不变。

可以考虑建立重定向表保存历史路径，但第一版不是强制要求。

---

# 六、知识文件夹管理功能

管理后台需要提供完整文件夹管理。

路由建议：

```text
/admin/folders
```

功能包括：

## 6.1 创建文件夹

管理员可以填写：

* 名称
* slug
* 父文件夹
* 描述
* 图标
* 排序值
* 是否公开显示

slug 可以根据名称自动生成，但允许管理员手动修改。

中文名称例如：

```text
Java 后端
```

自动 slug 可以是：

```text
java-backend
```

如果无法可靠翻译中文，可以生成：

```text
java-houduan
```

或要求管理员确认 slug。

禁止生成空 slug。

## 6.2 嵌套文件夹

创建文件夹时可以选择父文件夹。

例如：

```text
父文件夹：Java 后端
名称：Spring Boot
```

最终形成：

```text
Java 后端 / Spring Boot
```

## 6.3 移动文件夹

支持：

* 下拉框选择新父级。
* 或拖拽移动。

第一版优先保证下拉选择方式可靠。

拖拽可以作为增强功能。

移动时必须：

* 检查循环关系。
* 检查 slug 冲突。
* 提示公开 URL 可能发生变化。
* 不丢失子文件夹。
* 不丢失其中的文章。

## 6.4 文件夹排序

支持设置 `sort_order`。

同级文件夹按照：

1. sort_order
2. name

稳定排序。

## 6.5 重命名文件夹

支持修改：

* 显示名称
* 描述
* 图标
* slug

修改 slug 前需要二次确认。

## 6.6 删除文件夹

删除非空文件夹时不能直接静默删除。

提供三种明确操作：

1. 取消删除。
2. 将其中文档和子文件夹移动到父目录。
3. 递归删除整个文件夹及其中内容。

递归删除属于高风险操作，必须二次确认，并明确显示：

* 子文件夹数量
* 文档数量

优先实现“非空文件夹禁止删除”，然后提供移动工具。

不要默认级联删除大量文档。

---

# 七、Markdown 上传与预览

管理后台路由：

```text
/admin/documents/new
```

或者：

```text
/admin/folders/[folder-id]/upload
```

上传页面需要包含：

* 文件夹选择器
* 拖放上传区
* 文件选择按钮
* Markdown 原文编辑区
* Markdown 实时预览区
* 元数据表单
* 发布按钮
* 保存草稿按钮

## 7.1 上传流程

1. 选择目标文件夹。
2. 拖入 `.md` 或 `.markdown` 文件。
3. 浏览器使用 File API 读取文本。
4. 验证 UTF-8 内容。
5. 解析 Frontmatter。
6. 自动填充标题、描述、标签、日期和 slug。
7. 左侧显示 Markdown 原文。
8. 右侧显示实时预览。
9. 管理员可以修改原文和元数据。
10. 点击保存草稿或发布。
11. 写入数据库。
12. 保存原始 Markdown 文件到 Supabase Storage。
13. 立即跳转到文章页面。

## 7.2 Frontmatter

支持：

```yaml
---
title: Spring Boot 自动配置
description: Spring Boot 自动配置的工作原理
tags:
  - java
  - spring
  - spring-boot
folder: Java 后端/Spring/Spring Boot
slug: auto-configuration
status: published
order: 10
---
```

处理规则：

* title 缺失时使用文件名。
* slug 缺失时根据文件名或标题生成。
* tags 缺失时使用空数组。
* folder 字段只作为导入建议。
* 最终 folder_id 必须由管理员确认。
* 上传文件中的 status 不得绕过管理员权限。
* 不信任 Frontmatter 中的 owner、role 或权限字段。
* 无效 Frontmatter 不得让整个页面崩溃。
* 显示清晰错误提示。

## 7.3 批量上传

支持一次选择多个 Markdown 文件。

批量上传时：

* 默认放入当前选中的文件夹。
* 每个文件独立解析。
* 显示成功和失败列表。
* slug 冲突时不能静默覆盖。
* 允许选择：

  * 跳过
  * 创建副本
  * 更新现有文档

默认使用“跳过并提示”。

## 7.4 Markdown 功能

支持：

* 标题
* 列表
* 引用
* 表格
* 任务列表
* 代码块
* 代码高亮
* 代码复制按钮
* 行号
* 本地图片
* 外部图片
* 链接
* 数学公式
* Mermaid
* Frontmatter
* 目录生成

可以支持简单 Wiki Link：

```text
[[Tool Calling]]
```

但必须模块化实现。

找不到目标文档时：

* 显示断链样式。
* 不导致 Markdown 渲染失败。

---

# 八、图片与附件

创建 Supabase Storage Bucket：

## knowledge-source

用途：

* 保存原始 Markdown 文件。
* private。
* 只有管理员可以上传、读取和删除。

路径建议：

```text
documents/{document-id}/{sanitized-filename}.md
```

## knowledge-assets

用途：

* 保存文章图片和附件。
* 图片可以公开读取。
* 只有管理员可以上传和删除。

路径建议：

```text
documents/{document-id}/{uuid}-{sanitized-filename}
```

支持：

* PNG
* JPEG
* WebP
* GIF
* SVG
* PDF 附件

默认限制：

* Markdown 最大 2 MB。
* 图片最大 10 MB。
* PDF 最大 20 MB。

文件名必须清理：

* 防止 `../`
* 防止绝对路径
* 防止控制字符
* 防止覆盖其他文档文件
* 使用 UUID 避免冲突

不能只根据扩展名检查文件类型。

同时检查：

* MIME
* 扩展名
* 文件头或可识别内容

SVG 必须进行安全处理。

无法安全清理时拒绝上传。

## Markdown 图片处理

上传 Markdown 时，可能包含：

```markdown
![架构图](./images/architecture.png)
```

第一版提供以下两种方式：

1. 上传 Markdown 后，继续上传其引用的图片。
2. 在编辑器中上传图片并自动插入新的公开 URL。

图片上传成功后，自动插入：

```markdown
![图片说明](https://...)
```

公开文章中的图片：

* 自适应宽度。
* 支持点击放大。
* 支持 Esc 关闭。
* 图片加载失败时显示提示。
* 不产生页面横向溢出。

---

# 九、搜索与文件夹过滤

实现纯 Supabase 数据搜索，不接入付费搜索服务。

搜索范围：

* 文件夹名称
* 文件夹描述
* 文章标题
* 文章描述
* Markdown 正文
* 标签

搜索界面需要支持：

* 全局搜索。
* 当前文件夹内搜索。
* 包含子文件夹搜索。
* 标签过滤。
* 状态过滤，仅管理员可见 draft。
* 最近更新排序。
* 标题排序。

快捷键：

```text
Ctrl + K
Cmd + K
```

搜索结果显示：

* 标题
* 所属文件夹完整路径
* 摘要
* 标签
* 更新时间
* 匹配片段

第一版可以使用 PostgreSQL Full Text Search 或合理的 `ilike` 组合。

中文搜索效果不足时：

* 明确记录限制。
* 保留后续升级接口。
* 不要立刻引入 Elasticsearch。

---

# 十、公开网站布局

桌面端采用三栏布局。

## 左侧

显示：

* Logo
* 网站名称
* 搜索入口
* 知识文件夹树
* 子文件夹折叠
* 当前文件夹高亮
* 当前文章高亮
* 文件夹文档数量
* 收起侧栏按钮

目录示例：

```text
Java 后端
├── Java 基础
├── Spring
│   ├── Spring Boot
│   └── Spring Security
└── JVM

Agent 开发
├── Agent 基础
├── Tool Calling
├── Memory
└── Multi-Agent
```

文件夹树从 Supabase 动态读取。

不能把目录硬编码到 Vue 组件。

## 中间

文章页面显示：

* 面包屑
* 标题
* 描述
* 所属文件夹
* 标签
* 更新时间
* 阅读时间
* Markdown 正文
* 上一篇
* 下一篇
* 相关文章

文件夹页面显示：

* 文件夹介绍
* 子文件夹卡片
* 当前文件夹文章列表
* 最近更新
* 文档数量

## 右侧

文章页面显示：

* 当前文章目录
* 根据 h2、h3 自动生成
* 滚动时高亮当前章节

文件夹页面可以显示：

* 子目录
* 文章统计
* 常用标签

## 移动端

* 左侧目录变成抽屉。
* 右侧目录变成折叠面板。
* 正文保持合理宽度。
* 代码块可以横向滚动。
* 整个页面不能横向溢出。
* 触控区域尺寸合理。

---

# 十一、首页

首页不要使用 VitePress 风格的大型营销 Hero。

首页更像个人知识工作台。

包括：

* 简洁标题
* 一句话介绍
* 全局搜索框
* 顶级知识文件夹卡片
* 最近更新文章
* 最近新增文章
* 热门标签
* 文件夹总数
* 文档总数
* 最近更新时间

顶级文件夹卡片从 `folders` 表动态读取。

不能人工维护重复配置。

每个卡片显示：

* 文件夹名称
* 描述
* 图标
* 子文件夹数量
* 文档数量
* 最近更新时间

---

# 十二、管理后台

管理后台路由：

```text
/admin
```

包括：

## 仪表盘

显示：

* 文件夹总数
* 文档总数
* 已发布数量
* 草稿数量
* 最近上传
* 最近修改

## 文件夹管理

路由：

```text
/admin/folders
```

功能：

* 新建
* 编辑
* 移动
* 排序
* 隐藏
* 删除
* 浏览文件夹树

## 文档管理

路由：

```text
/admin/documents
```

功能：

* 上传 Markdown
* 新建空白 Markdown
* 编辑
* 预览
* 发布
* 取消发布
* 移动文件夹
* 修改排序
* 删除
* 按文件夹筛选
* 按标签筛选
* 按状态筛选

## 编辑器

采用左右分栏：

```text
Markdown 原文 | 实时预览
```

支持：

* 保存草稿
* 发布
* 自动生成 slug
* 更换文件夹
* 添加标签
* 上传图片
* 插入链接
* 离开页面前检测未保存修改

第一版不需要实现多人实时协作。

---

# 十三、认证和权限

使用 Supabase Auth。

第一版优先实现：

* Email Magic Link
* 或 Email + Password

不要开放公开注册。

管理入口：

```text
/admin/login
```

只有管理员可以访问：

* `/admin`
* 文件夹管理
* Markdown 上传
* 编辑
* 删除
* 发布

管理员身份必须由数据库中的 `profiles.role` 判断。

不能通过以下方式判断管理员：

* 前端硬编码邮箱
* localStorage 标记
* URL 参数
* 隐藏按钮

Nuxt Middleware 只负责改善用户体验。

真正权限必须由 Supabase RLS 强制执行。

---

# 十四、RLS 安全策略

所有业务表启用 Row Level Security。

## documents

匿名用户和普通用户：

* 只能读取 `status = 'published'` 的文档。
* 不能读取 draft。
* 不能插入。
* 不能修改。
* 不能删除。

管理员：

* 可以查看全部文档。
* 可以创建。
* 可以修改。
* 可以发布。
* 可以取消发布。
* 可以删除。

## folders

匿名用户：

* 只能读取 `is_visible = true` 的文件夹。
* 不能创建。
* 不能修改。
* 不能删除。

管理员：

* 可以查看全部文件夹。
* 可以创建。
* 可以修改。
* 可以移动。
* 可以隐藏。
* 可以删除。

## profiles

* 用户可以读取自己的资料。
* 普通用户不能修改 role。
* 管理员角色不能由浏览器任意提升。

创建安全的数据库函数：

```text
is_admin()
```

用于 RLS Policy。

不得创建允许公开写入的：

```text
using (true)
```

策略。

不得为了开发方便关闭 RLS。

---

# 十五、视觉风格

整体风格参考：

[https://localchat.damnatiox.com/](https://localchat.damnatiox.com/)

要求：

* 深色优先。
* 黑色或深灰主背景。
* 内容区使用轻微区分的深色表面。
* 低对比度细边框。
* 克制阴影。
* 文字清晰但不过度发亮。
* 工具型工作台风格。
* 紧凑、现代。
* 不使用大面积渐变。
* 不使用玻璃拟态。
* 不使用花哨背景。
* 不使用卡通插画。
* 不做传统博客风格。
* 不照搬 VitePress 默认蓝色主题。
* 不使用过多动画。

使用集中式 CSS Variables：

```css
--kb-bg
--kb-surface
--kb-surface-secondary
--kb-surface-hover
--kb-border
--kb-border-strong
--kb-text
--kb-text-muted
--kb-text-subtle
--kb-accent
--kb-accent-hover
--kb-danger
--kb-success
--kb-code-bg
--kb-sidebar-width
--kb-right-sidebar-width
--kb-content-width
--kb-radius-sm
--kb-radius-md
--kb-radius-lg
```

所有主要颜色、圆角、阴影和间距必须从统一主题配置读取。

交互要求：

* hover 动画 100–200ms。
* 不使用弹跳动画。
* 不使用大幅位移。
* 当前目录项有明确但克制的高亮。
* focus 状态清晰可见。
* 支持键盘操作。
* 满足基本可访问性要求。

字体：

* 中英文清晰。
* 正文适合长时间阅读。
* 代码使用等宽字体。
* 不在仓库中提交未经许可的字体文件。

---

# 十六、Supabase Realtime

使用 Supabase Realtime 实现跨设备更新。

当以下内容发生变化：

* 创建文件夹
* 修改文件夹
* 移动文件夹
* 发布文档
* 修改文档
* 删除文档

其他已打开的设备应：

* 自动刷新相关列表。
* 或显示“知识库已有更新”的提示。
* 点击后刷新数据。

不要因为 Realtime 事件导致无限请求循环。

组件卸载时正确取消订阅。

---

# 十七、部署与插件调用

开始实施前，先检查当前 Codex 环境中是否存在：

* Vercel 插件或 App。
* Supabase 插件或 App。
* GitHub 插件或 App。
* Vercel CLI。
* Supabase CLI。
* GitHub CLI。

执行优先级：

1. 已连接并获得授权的官方插件或 App。
2. 官方 CLI。
3. 输出最少的人工授权步骤。

禁止：

* 假装调用不存在的插件。
* 假装部署成功。
* 没有获得真实项目 ID 就声称已创建。
* 没有得到部署 URL 就声称网站可访问。
* 将 Token 写入代码或提交到 GitHub。

## Vercel 部署

需要完成：

1. 创建或连接 Vercel 项目。
2. 设置 Nuxt 构建配置。
3. 配置环境变量。
4. 完成 Preview Deployment。
5. 完成 Production Deployment。
6. 返回真实部署 URL。
7. 检查生产页面可以访问。
8. 检查动态路由刷新不返回 404。

## Supabase 部署

需要完成：

1. 创建或连接 Supabase 项目。
2. 创建 migration。
3. 执行 migration。
4. 创建 Storage Bucket。
5. 创建 Storage Policy。
6. 创建 RLS Policy。
7. 创建管理员账户或提供最小化人工步骤。
8. 配置 Auth Site URL。
9. 配置 Auth Redirect URL。
10. 验证匿名读取和管理员写入。

## 环境变量

至少包括：

```text
NUXT_PUBLIC_SUPABASE_URL
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

如服务端确实需要 Secret：

* 只能放在 Vercel Server Environment Variables。
* 不能使用 `NUXT_PUBLIC_` 前缀。
* 不能发送到浏览器。
* 不能提交到 GitHub。

优先依靠 RLS，不要随意使用 service role。

---

# 十八、迁移和版本管理

所有数据库结构必须通过：

```text
supabase/migrations/
```

管理。

包括：

* tables
* indexes
* triggers
* helper functions
* RLS policies
* storage policies

禁止只在 Supabase Dashboard 手动操作而不留下 migration。

创建：

```text
supabase/seed.sql
```

只放安全的示例数据。

不得包含：

* 真实密码
* Access Token
* Secret Key
* 数据库密码
* 管理员明文凭据

---

# 十九、测试要求

必须完成以下测试。

## 单元测试

测试：

* slug 生成。
* 文件名清理。
* Frontmatter 解析。
* Markdown 解析。
* 文件夹树构建。
* 文件夹排序。
* 循环父子关系检查。
* 路由路径生成。
* 路径面包屑生成。

## 组件测试

测试：

* 文件夹树渲染。
* 当前文件夹高亮。
* Markdown 上传预览。
* 文件夹选择器。
* 文档列表。
* 错误提示。

## E2E 测试

使用 Playwright 测试：

1. 管理员登录。
2. 新建“Java 后端”文件夹。
3. 在其中新建“Spring Boot”子文件夹。
4. 上传 Markdown。
5. 查看实时预览。
6. 保存草稿。
7. 发布文章。
8. 在公开页面找到文章。
9. 移动文章到其他文件夹。
10. 检查 URL 和面包屑变化。
11. 匿名用户不能访问草稿。
12. 非管理员不能进入管理后台。

## 安全测试

验证：

* 匿名用户不能写入 documents。
* 匿名用户不能写入 folders。
* 普通用户不能提升管理员权限。
* 普通用户不能读取 draft。
* 浏览器中不存在 service role。
* Markdown 中的 script 不会执行。
* 恶意 HTML 被清理。
* 路径遍历文件名被拒绝。

---

# 二十、示例内容

创建以下示例目录：

```text
Java 后端
├── Java 基础
├── Spring
│   ├── Spring Boot
│   └── Spring Security
└── JVM

Agent 开发
├── Agent 基础
├── Tool Calling
├── Memory
└── Multi-Agent

RAG
├── Document Loader
├── Chunking
├── Embedding
├── Vector Store
└── Retrieval
```

创建少量示例 Markdown：

* Java 后端 / Spring / Spring Boot / Spring Boot 简介
* Agent 开发 / Tool Calling / Tool Calling 基础
* RAG / Chunking / 文档切分基础

示例内容只用于验证功能，不要生成大量无意义填充文章。

---

# 二十一、项目目录结构

请采用清晰的模块化结构，例如：

```text
app/
├── components/
│   ├── knowledge/
│   ├── folders/
│   ├── markdown/
│   ├── admin/
│   └── common/
├── composables/
├── layouts/
├── middleware/
├── pages/
│   ├── index.vue
│   ├── knowledge/
│   │   └── [...path].vue
│   └── admin/
├── plugins/
├── server/
├── types/
├── utils/
└── assets/

supabase/
├── migrations/
├── seed.sql
└── config.toml

tests/
├── unit/
├── component/
└── e2e/
```

不要把全部逻辑写进一个页面或 composable。

数据访问、Markdown 渲染、文件夹树、权限检查和 Storage 上传必须分离。

---

# 二十二、README

README 必须说明：

## 本地运行

```bash
npm install
npm run dev
```

## 环境变量配置

说明每个变量的作用。

不得在 README 中放真实 Secret。

## Supabase 初始化

说明：

* 如何登录 Supabase CLI。
* 如何 link 项目。
* 如何执行 migration。
* 如何创建管理员。
* 如何验证 RLS。

## Vercel 部署

说明：

* 如何连接项目。
* 如何配置环境变量。
* 如何部署。
* 如何绑定自定义域名。

## 添加知识文件夹

说明如何在网页中：

1. 登录后台。
2. 新建顶级文件夹。
3. 新建子文件夹。
4. 设置排序。
5. 移动文件夹。

## 上传 Markdown

说明如何：

1. 进入目标文件夹。
2. 上传 `.md`。
3. 检查预览。
4. 修改元数据。
5. 保存草稿。
6. 发布。

## 跨设备同步

明确解释：

```text
所有文件夹、文章和 Markdown 内容都保存在 Supabase。
任何设备打开网站时都读取同一套 Supabase 数据。
localStorage 不用于保存知识正文。
```

localStorage 只允许保存：

* 主题偏好
* 侧栏状态
* 编辑器布局偏好

---

# 二十三、实施步骤

按照以下阶段实施。

## 第一阶段：项目初始化

* 初始化 Nuxt 3。
* 配置 TypeScript。
* 配置 Supabase 客户端。
* 配置代码规范。
* 确保本地启动成功。

## 第二阶段：数据库

* 创建 profiles。
* 创建 folders。
* 创建 documents。
* 创建索引。
* 创建触发器。
* 创建 RLS。
* 创建 Storage Policy。
* 执行 migration。

## 第三阶段：公开知识库

* 首页。
* 文件夹树。
* 文件夹页面。
* 动态文章页面。
* Markdown 渲染。
* 面包屑。
* 移动端适配。

## 第四阶段：管理后台

* 管理员登录。
* 文件夹 CRUD。
* 嵌套文件夹。
* 文件夹移动。
* Markdown 上传。
* 实时预览。
* 草稿和发布。
* 文档移动。

## 第五阶段：增强功能

* 搜索。
* 标签。
* 图片上传。
* Realtime。
* 上一篇和下一篇。
* 相关文章。

## 第六阶段：测试

* 单元测试。
* 组件测试。
* E2E。
* RLS 验证。
* Markdown XSS 验证。

## 第七阶段：部署

* 连接 Supabase。
* 执行 migration。
* 配置 Auth。
* 创建管理员。
* 连接 GitHub。
* 部署 Vercel Preview。
* 验证后部署 Production。
* 返回真实 URL。

每完成一个阶段：

* 运行相关命令。
* 修复错误。
* 记录修改文件。
* 说明关键设计决定。
* 不要未经验证直接进入下一阶段。

---

# 二十四、最终验收标准

最终交付必须满足：

* 可以在网页中新建“Java 后端”等顶级文件夹。
* 可以在文件夹中建立子文件夹。
* 可以把 Markdown 上传到指定文件夹。
* 上传后立即预览。
* 不重新构建就能发布文章。
* 文章页面具有完整文件夹路径。
* 可以移动文章。
* 可以移动文件夹。
* 可以修改文件夹排序。
* 所有设备看到相同内容。
* 匿名用户只能读取已发布内容。
* 草稿只对管理员可见。
* RLS 实际生效。
* Markdown 中的恶意 HTML 不执行。
* Vercel 生产部署真实可访问。
* Supabase 数据和 Storage 真实可用。
* 没有 Secret 被提交进 Git。
* README 完整。
* 测试通过。
* 构建通过。
* 类型检查通过。

最终报告必须提供：

1. 项目目录结构。
2. 数据库结构。
3. RLS 策略摘要。
4. Storage Bucket 说明。
5. 本地启动命令。
6. 测试命令。
7. 构建命令。
8. Vercel 生产 URL。
9. Supabase 项目引用信息，但不得暴露 Secret。
10. 管理员首次登录步骤。
11. 新建文件夹步骤。
12. 上传 Markdown 步骤。
13. 已知限制。
14. 尚未完成的内容。

没有获得真实部署结果时，必须明确说明部署未完成以及阻塞原因，不得假装成功。
