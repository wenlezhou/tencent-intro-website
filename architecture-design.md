# AI 教程内容整合站 — 系统架构设计

## 1. 架构总览

### 1.1 系统定位

本系统是一个**内容加工管道 + 静态站点**的组合体：上游负责从多数据源采集、转录、翻译、去品牌化处理原始内容；下游负责将加工后的 Markdown 内容渲染为美观的静态站点。

核心架构决策：**将内容管道（Pipeline）与站点展示（Site）彻底解耦**，中间以 Markdown 文件集合作为契约接口。

```
┌─────────────────────────────────────────────────────────────────┐
│                      Content Pipeline                           │
│                   (CLI / CI 定时运行)                            │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │  Fetch   │──▶│Transcribe│──▶│ Translate │──▶│  Debrand &   │ │
│  │  Module  │   │  Module  │   │  Module   │   │  Refine      │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────┬───────┘ │
│       ▲                                              │         │
│  Anthropic Academy                          Markdown 文件集    │
│  YouTube Channel                            (content/ 目录)    │
└─────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Static Site (Astro)                         │
│                   (构建时渲染, 静态导出)                          │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │ Markdown │──▶│  Astro   │──▶│  Static  │──▶│   Deploy     │ │
│  │  Collection│  │  Build   │   │  Export  │   │  (Vercel/    │ │
│  │  (源内容) │   │  (SSG)   │   │  (HTML)  │   │   Cloudflare)│ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 架构模式 | Pipeline + Static Site 解耦 | 内容加工是重 IO/重计算任务，与站点渲染的生命周期完全不同；解耦后可独立迭代、独立扩缩 |
| 站点框架 | **Astro** | 原生 Markdown Collections 支持、零 JS 默认输出、构建速度极快、SEO 天然友好；Next.js 在 SSG 场景下过重 |
| 内容格式 | Markdown + Frontmatter | 人类可读、Git 友好、Astro 原生支持、方便 diff 审查 |
| 内容管道 | Node.js CLI 工具 | 与 Astro 同生态，共享类型定义；可本地运行也可 CI 触发 |
| 翻译策略 | LLM 翻译 + 人工审校 | LLM 对技术教程的翻译质量已足够高；保留人工介入点确保关键内容准确 |
| 部署方式 | 静态导出 + CDN | 零服务器成本、全球加速、无安全攻击面 |

---

## 2. 技术选型详述

### 2.1 站点框架：Astro 5.x

**选择理由：**

- **Markdown Collections**：Astro 的内容集合（Content Collections）提供类型安全的 Frontmatter Schema 验证，这正是本项目的核心需求——大量结构化的 Markdown 内容
- **零 JS 默认**：默认不向客户端发送 JavaScript，首屏加载极快，SEO 和阅读体验俱佳
- ** Islands 架构**：需要交互的组件（搜索、暗色模式切换）可以用 React/Preact 组件按需注入，不影响全局性能
- **静态导出**：`output: 'static'` 一行配置，构建产物可直接部署到任何静态托管
- **构建速度**：同等内容量下，Astro 构建速度约为 Next.js SSG 的 3-5 倍

**不选 Next.js 的理由：**

- Next.js 的 SSG 模式本质是为 SSR 设计的降级方案，Markdown 内容处理需要额外插件
- 输出包含不必要的 JS runtime（约 80KB+），对纯内容站点是浪费
- App Router 的复杂度对本项目无收益

### 2.2 内容管道：Node.js + TypeScript CLI

| 组件 | 技术选择 | 理由 |
|------|----------|------|
| 爬取框架 | Cheerio + fetch | Anthropic Academy 是服务端渲染页面，无需 headless browser；轻量且快 |
| YouTube 元数据 | youtubei / yt-dlp | youtubei 提供类型安全的 API；yt-dlp 作为转录的底层工具 |
| 视频转录 | OpenAI Whisper API | 转录质量最高，支持时间戳；或本地 Whisper large-v3（成本更低） |
| 翻译 | Anthropic Claude API | Claude 对中英翻译质量优秀，且可通过 system prompt 精确控制去品牌化行为 |
| 去品牌化 | Claude API（翻译同一调用） | 合并到翻译步骤，一次 LLM 调用同时完成翻译+去品牌化+知识提炼，减少 token 消耗 |
| 调度 | GitHub Actions / 手动触发 | 内容更新频率低，无需常驻服务 |

### 2.3 前端样式与组件

| 组件 | 选择 | 理由 |
|------|------|------|
| CSS 框架 | Tailwind CSS 4 | 原子化 CSS，与 Astro 集成极佳；构建时自动 tree-shake，零冗余 |
| 搜索 | Pagefind | 静态站点搜索方案，构建时索引、零服务器、中文分词支持好 |
| 代码高亮 | Shiki | Astro 内置支持，主题丰富，支持差异高亮 |
| 交互组件 | Preact | 仅 3KB runtime，用于搜索框、主题切换等少量交互 |
| 字体 | 系统字体栈 + 思源宋体 | 中文阅读体验优先，避免字体加载闪烁 |

---

## 3. 数据流设计

### 3.1 完整数据流

```
Phase 1: 采集 (Fetch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Anthropic Academy                YouTube Channel
       │                                │
       ▼                                ▼
  GET 教程页面列表              GET 频道视频列表
       │                                │
       ▼                                ▼
  解析课程结构                  提取视频元数据
  (标题/描述/章节)             (标题/描述/时长/ID)
       │                                │
       ▼                                ▼
  保存原始 HTML                 保存元数据 JSON
  raw/academy/*.html            raw/youtube/*.json
                                      │
                                      ▼
                              下载音频 track
                              raw/youtube/*.webm


Phase 2: 转录 (Transcribe)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  YouTube 音频 ──▶ Whisper API ──▶ 原始转录文本
                                    transcript/*.txt
                                         │
                                         ▼
                                  按段落清洗格式化
                                  transcript/*.md


Phase 3: 翻译 + 去品牌化 (Translate & Refine)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Academy HTML ──┐
                ├──▶ Claude API ──▶ 精炼中文 Markdown
  Transcript ────┘     (System Prompt:
                       - 翻译为中文
                       - 移除品牌标识
                       - 剔除营销话术
                       - 保留技术知识
                       - 重构为教程格式)
                              │
                              ▼
                     content/
                       courses/
                         {slug}/
                           index.md       ← 课程概览
                           ch1-xxx.md     ← 各章节
                       videos/
                         {slug}.md        ← 视频精华


Phase 4: 构建 & 部署 (Build & Deploy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  content/ ──▶ Astro Build ──▶ dist/ ──▶ CDN Deploy
              (Content          (静态
               Collections)      HTML)
```

### 3.2 管道状态管理

每个内容条目有明确的处理状态，支持断点续跑：

```
状态流转：
  discovered → fetched → transcribed → translated → refined → published

原始数据保留：
  raw/          ← 原始采集数据，便于回溯和重跑
  transcript/   ← 转录中间产物
  content/      ← 最终产物，站点直接消费
```

状态记录在 `pipeline-state.json` 中，记录每条内容的处理阶段、时间戳、hash，避免重复处理。

---

## 4. 内容数据模型（Schema 设计）

### 4.1 课程内容 Schema

```typescript
// content/courses/{slug}/index.md Frontmatter

interface CourseFrontmatter {
  // === 基础信息 ===
  title: string;                    // 课程标题（中文）
  titleEn: string;                  // 原始英文标题
  slug: string;                     // URL 友好标识
  description: string;              // 课程简介（中文）
  source: 'anthropic-academy';      // 数据来源
  sourceUrl: string;                // 原始链接（便于溯源）

  // === 分类与标签 ===
  category: string;                 // 主分类：prompting | safety | building | fundamentals
  tags: string[];                   // 标签：['chain-of-thought', 'few-shot', ...]
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;         // 预计学习时长（分钟）

  // === 结构信息 ===
  chapters: ChapterMeta[];          // 章节列表
  totalChapters: number;

  // === 元数据 ===
  publishedAt: string;              // 原始发布日期 (ISO 8601)
  processedAt: string;              // 处理日期
  version: number;                  // 内容版本（源站更新时递增）
}

interface ChapterMeta {
  slug: string;                     // 章节文件名
  title: string;                    // 章节标题（中文）
  order: number;                    // 排序
}
```

### 4.2 视频内容 Schema

```typescript
// content/videos/{slug}.md Frontmatter

interface VideoFrontmatter {
  // === 基础信息 ===
  title: string;                    // 视频标题（中文）
  titleEn: string;                  // 原始英文标题
  slug: string;                     // URL 友好标识
  description: string;              // 视频简介（中文）
  source: 'anthropic-youtube';
  sourceUrl: string;                // YouTube 原始链接

  // === 视频特有 ===
  videoId: string;                  // YouTube Video ID
  duration: string;                 // 时长 (HH:MM:SS)
  publishedAt: string;              // 发布日期
  thumbnail: string;                // 缩略图路径（本地化后）

  // === 分类与标签 ===
  category: string;                 // 主分类
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // === 转录信息 ===
  hasTranscript: boolean;           // 是否有完整转录
  transcriptLanguage: string;       // 转录语言

  // === 元数据 ===
  processedAt: string;
  version: number;
}
```

### 4.3 Astro Content Collections 配置

```typescript
// src/content.config.ts

import { defineCollection, z } from 'astro:content';

const courses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    slug: z.string(),
    description: z.string(),
    source: z.literal('anthropic-academy'),
    sourceUrl: z.string().url(),
    category: z.enum(['prompting', 'safety', 'building', 'fundamentals']),
    tags: z.array(z.string()),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedMinutes: z.number(),
    chapters: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      order: z.number(),
    })),
    totalChapters: z.number(),
    publishedAt: z.string(),
    processedAt: z.string(),
    version: z.number().default(1),
  }),
});

const videos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    slug: z.string(),
    description: z.string(),
    source: z.literal('anthropic-youtube'),
    sourceUrl: z.string().url(),
    videoId: z.string(),
    duration: z.string(),
    publishedAt: z.string(),
    thumbnail: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    hasTranscript: z.boolean(),
    transcriptLanguage: z.string().default('zh-CN'),
    processedAt: z.string(),
    version: z.number().default(1),
  }),
});

export const collections = { courses, videos };
```

---

## 5. 目录结构设计

```
ai-tutorial-hub/
├── README.md
├── package.json
├── astro.config.mjs              # Astro 配置（静态输出、Tailwind、Pagefind）
├── tsconfig.json
├── tailwind.config.mjs
│
├── content/                      # ★ 内容目录（Pipeline 产出，Site 消费）
│   ├── courses/                  # 课程集合
│   │   ├── prompting-essentials/
│   │   │   ├── index.md          # 课程概览页
│   │   │   ├── ch1-introduction.md
│   │   │   ├── ch2-chain-of-thought.md
│   │   │   └── ch3-few-shot.md
│   │   └── building-with-claude/
│   │       ├── index.md
│   │       └── ...
│   └── videos/                   # 视频集合
│       ├── understanding-rlhf.md
│       ├── constitutional-ai-explained.md
│       └── ...
│
├── pipeline/                     # ★ 内容管道（独立 CLI 工具）
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # CLI 入口（commander.js）
│   │   ├── config.ts             # 管道配置（API keys、目标站点等）
│   │   ├── state.ts              # 状态管理（pipeline-state.json 读写）
│   │   │
│   │   ├── fetchers/             # 采集器
│   │   │   ├── academy.ts        # Anthropic Academy 爬取
│   │   │   ├── youtube.ts        # YouTube 元数据 + 音频下载
│   │   │   └── types.ts          # 采集数据类型
│   │   │
│   │   ├── transcribers/         # 转录器
│   │   │   ├── whisper.ts        # Whisper API 转录
│   │   │   └── formatter.ts      # 转录文本格式化
│   │   │
│   │   ├── translators/          # 翻译+精炼
│   │   │   ├── claude.ts         # Claude API 调用
│   │   │   ├── prompts.ts        # System Prompt 模板
│   │   │   └── postprocessor.ts  # 输出后处理（格式校正）
│   │   │
│   │   └── utils/                # 工具函数
│   │       ├── slugify.ts        # 标题 → slug
│   │       ├── rate-limit.ts     # API 限速
│   │       └── retry.ts          # 重试逻辑
│   │
│   └── data/                     # 管道中间数据（.gitignore）
│       ├── raw/                  # 原始采集数据
│       │   ├── academy/          # Academy 原始 HTML
│       │   └── youtube/          # YouTube 元数据 JSON + 音频
│       ├── transcripts/          # 转录文本
│       └── pipeline-state.json   # 处理状态追踪
│
├── src/                          # ★ Astro 站点源码
│   ├── content.config.ts         # Content Collections Schema 定义
│   │
│   ├── layouts/                  # 页面布局
│   │   ├── BaseLayout.astro      # 基础布局（head、nav、footer）
│   │   ├── CourseLayout.astro    # 课程布局（侧边栏目录）
│   │   └── VideoLayout.astro     # 视频布局（播放器 + 文字）
│   │
│   ├── pages/                    # 页面路由
│   │   ├── index.astro           # 首页（最新内容、分类导航）
│   │   ├── courses/
│   │   │   ├── index.astro       # 课程列表页
│   │   │   └── [slug]/
│   │   │       ├── index.astro   # 课程概览页
│   │   │       └── [chapter].astro # 章节详情页
│   │   ├── videos/
│   │   │   ├── index.astro       # 视频列表页
│   │   │   └── [slug].astro      # 视频详情页
│   │   ├── categories/
│   │   │   └── [category].astro  # 分类页
│   │   ├── tags/
│   │   │   └── [tag].astro       # 标签页
│   │   └── search.astro          # 搜索页（Pagefind）
│   │
│   ├── components/               # UI 组件
│   │   ├── common/               # 通用组件
│   │   │   ├── Header.astro      # 顶部导航
│   │   │   ├── Footer.astro      # 页脚
│   │   │   ├── SearchBox.tsx     # 搜索框（Preact 交互组件）
│   │   │   ├── ThemeToggle.tsx   # 暗色模式切换（Preact）
│   │   │   └── Breadcrumb.astro  # 面包屑导航
│   │   ├── cards/                # 卡片组件
│   │   │   ├── CourseCard.astro  # 课程卡片
│   │   │   └── VideoCard.astro   # 视频卡片
│   │   ├── content/              # 内容渲染组件
│   │   │   ├── Prose.astro       # 排版容器（统一文章样式）
│   │   │   ├── TableOfContents.astro  # 目录导航
│   │   │   ├── ChapterNav.astro  # 上下章导航
│   │   │   └── CodeBlock.astro   # 代码块（Shiki 增强）
│   │   └── video/                # 视频相关
│   │       └── VideoPlayer.astro # YouTube 嵌入播放器
│   │
│   ├── styles/                   # 全局样式
│   │   ├── global.css            # 全局 CSS + Tailwind 指令
│   │   ├── typography.css        # 排版样式（中文优化）
│   │   └── code.css              # 代码高亮主题
│   │
│   └── lib/                      # 工具函数
│       ├── collections.ts        # 内容集合查询辅助
│       └── utils.ts              # 通用工具
│
├── public/                       # 静态资源
│   ├── favicon.svg
│   ├── og-default.png            # 默认 OG 图片
│   └── images/                   # 内容图片
│       ├── courses/
│       └── videos/
│
└── .github/
    └── workflows/
        ├── build-deploy.yml      # 站点构建部署
        └── pipeline.yml          # 内容管道定时任务
```

---

## 6. 关键模块详细设计

### 6.1 内容采集模块

```
采集策略：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anthropic Academy 采集：
  1. 请求课程列表页，解析课程链接
  2. 对每个课程页请求并解析：
     - 课程标题、描述、难度
     - 章节列表及各章节内容 HTML
     - 代码示例、图片资源
  3. 下载图片等静态资源到 public/images/
  4. 将原始 HTML 存入 raw/academy/ 便于回溯

YouTube 采集：
  1. 调用 YouTube Data API 获取频道视频列表
     - 过滤：仅保留教程/教育类视频（排除 Shorts、促销类）
  2. 对每个视频获取：
     - 标题、描述、时长、发布日期、缩略图
     - 下载缩略图到 public/images/videos/
  3. 调用 yt-dlp 下载音频轨道
     - 格式：webm (opus)，低码率即可
  4. 元数据存入 raw/youtube/{videoId}.json

限速与容错：
  - 请求间隔 2-5 秒随机延迟，避免被封
  - 失败重试 3 次，指数退避
  - 支持断点续跑：检查 pipeline-state.json 跳过已完成条目
```

### 6.2 转录模块

```
转录策略：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

输入：raw/youtube/{videoId}.webm（音频文件）
输出：transcripts/{videoId}.md（格式化转录文本）

处理流程：
  1. 调用 Whisper API 转录
     - model: "whisper-1"
     - language: "en"（指定英语，提高准确性）
     - response_format: "verbose_json"（含时间戳）
  2. 后处理格式化：
     - 按自然段落合并碎片句子
     - 标记说话人（如果有多人对话）
     - 移除填充词（um, uh, you know）
     - 生成 Markdown 格式文本

降级方案：
  - Whisper API 不可用时，回退到本地 whisper-large-v3
  - 本地也不可用时，检查 YouTube 是否有自动字幕可提取
```

### 6.3 翻译 + 去品牌化模块（核心）

这是整个系统最关键的模块——一次 LLM 调用同时完成三项任务：

```
System Prompt 设计策略：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

角色定义：
  你是一位专业的 AI 技术教程编辑和翻译，擅长将英文 AI 教程转化为高质量的中文技术内容。

核心指令（按优先级排序）：
  1. 【翻译】将英文内容准确翻译为中文
     - 技术术语保留英文原文，首次出现时用"中文(English)"格式
     - 代码示例不翻译，但注释翻译为中文
     - 保持原文的逻辑结构和技术准确性

  2. 【去品牌化】移除所有品牌相关内容
     - 移除 "Anthropic"、"Claude" 等品牌名称的推销性使用
     - 将 "Claude" 替换为通用术语"AI 助手"或"大语言模型"
     - 移除产品对比、市场份额等营销性表述
     - 移除 CTA（Call-to-Action）链接：如"立即体验"、"注册免费试用"

  3. 【知识提炼】重构为纯知识内容
     - 保留所有技术知识、方法论、最佳实践
     - 通用化品牌特定功能描述：如"Claude 的 200K 上下文窗口"→"大上下文窗口（如 200K tokens）"
     - 补充必要的技术背景，使内容自成体系
     - 移除对特定产品界面/功能的引用（如"在 Claude 控制台中点击..."）

输出格式：
  - 输出完整的 Markdown 文本
  - 保持原文的标题层级结构
  - 代码块标注语言类型
```

```
处理流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Academy 内容：
  原始 HTML → 提取正文 → Markdown 清洗 → LLM 翻译+去品牌化 → 人工审校 → content/courses/

YouTube 转录：
  转录文本 → LLM 翻译+去品牌化+结构化 → 人工审校 → content/videos/

关键设计：
  - 长文本分块处理：超过 4000 token 的内容按章节/自然段分块
  - 上下文窗口：每块携带前一块的最后 200 token 作为上下文
  - 输出校验：后处理检查 Markdown 格式完整性、Frontmatter 完整性
  - 人工审校点：生成后标记为 draft: true，审校通过后改为 draft: false
```

### 6.4 前端展示模块

```
页面设计：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

首页 (/)
  ├── Hero 区域：站点标题 + 一句话描述 + 搜索框
  ├── 精选内容：3-4 个推荐卡片
  ├── 分类导航：按 category 浏览
  └── 最新更新：最近处理的内容列表

课程列表 (/courses)
  ├── 分类筛选（侧边栏/顶部标签）
  ├── 难度筛选
  └── 课程卡片网格（标题、描述、章节数、难度、时长）

课程详情 (/courses/{slug})
  ├── 课程元信息（标题、描述、难度、时长）
  ├── 侧边栏目录（章节列表，当前章节高亮）
  ├── 正文内容（Markdown 渲染）
  └── 上下章导航

视频列表 (/videos)
  ├── 分类筛选
  └── 视频卡片网格（缩略图、标题、时长、难度）

视频详情 (/videos/{slug})
  ├── YouTube 嵌入播放器（懒加载）
  ├── 视频元信息
  ├── 完整转录/精华文字版
  └── 时间戳跳转（如有）

搜索 (/search)
  └── Pagefind 全文搜索，支持中文

响应式断点：
  - 移动端 (< 640px)：单列布局，底部导航
  - 平板 (640-1024px)：双列卡片，折叠侧边栏
  - 桌面 (> 1024px)：三列卡片，固定侧边栏

暗色模式：
  - 跟随系统偏好
  - 手动切换按钮（Preact 组件，localStorage 持久化）
```

---

## 7. 构建与部署

### 7.1 构建流程

```yaml
# .github/workflows/build-deploy.yml

触发条件：
  - push to main（content/ 或 src/ 变更）
  - 手动触发

步骤：
  1. checkout 代码
  2. pnpm install
  3. pnpm build          # astro build → dist/
  4. npx pagefind        # 构建搜索索引
  5. 部署 dist/ 到 CDN

构建产物：
  dist/
  ├── index.html
  ├── courses/
  ├── videos/
  ├── search/
  ├── pagefind/          # 搜索索引
  ├── assets/            # CSS/JS/Fonts
  └── images/            # 内容图片
```

### 7.2 内容管道工作流

```yaml
# .github/workflows/pipeline.yml

触发条件：
  - 定时：每周一 09:00 UTC
  - 手动触发

步骤：
  1. checkout 代码
  2. cd pipeline && pnpm install
  3. pnpm fetch           # 采集新内容
  4. pnpm transcribe      # 转录新视频
  5. pnpm translate       # 翻译+去品牌化
  6. git diff content/    # 检查内容变更
  7. 如有变更：创建 PR，等待人工审校
  8. 审校通过合并后，自动触发站点构建
```

---

## 8. 架构决策记录（ADR）

### ADR-001: Pipeline 与 Site 解耦

- **状态**：Accepted
- **上下文**：内容加工涉及外部 API 调用、长耗时任务、可能失败需重试；站点构建需要稳定、快速、可重复
- **决策**：将内容管道作为独立 CLI 工具，与 Astro 站点分离，通过 `content/` 目录作为接口
- **后果**：
  - ✅ 管道和站点可独立版本化、独立部署
  - ✅ 内容可离线审校后再合并
  - ✅ 站点构建不受 API 不可用影响
  - ❌ 需要额外的 CI 编排确保管道产物触发站点重建

### ADR-002: Astro over Next.js

- **状态**：Accepted
- **上下文**：本站是纯内容展示站点，无服务端逻辑需求，SEO 和性能是首要目标
- **决策**：选择 Astro 作为站点框架
- **后果**：
  - ✅ 构建速度显著更快
  - ✅ 默认零 JS 输出，首屏性能极佳
  - ✅ Content Collections 原生支持 Markdown Schema 验证
  - ❌ 社区生态和组件库不如 Next.js 丰富（但本项目不需要复杂交互）

### ADR-003: 合并翻译与去品牌化为单次 LLM 调用

- **状态**：Accepted
- **上下文**：翻译和去品牌化都是文本变换任务，分开调用会导致上下文丢失和 token 浪费
- **决策**：通过精心设计的 System Prompt，在一次 Claude API 调用中同时完成翻译、去品牌化、知识提炼
- **后果**：
  - ✅ 减少 API 调用次数和总 token 消耗
  - ✅ LLM 可在翻译时自然地完成去品牌化，无需二次理解上下文
  - ❌ Prompt 工程复杂度增加，需多轮调试
  - ❌ 单次调用失败可能导致部分任务完成、部分未完成

### ADR-004: Markdown 作为内容契约

- **状态**：Accepted
- **上下文**：需要一个对人类和程序都友好的格式，作为管道产出和站点消费的接口
- **决策**：所有内容以 Markdown + YAML Frontmatter 格式存储
- **后果**：
  - ✅ Git 友好，可 diff、可 review
  - ✅ Astro 原生支持
  - ✅ 人类可直接编辑修正
  - ❌ 不适合存储高度结构化的关系数据（但本项目不需要）

---

## 9. 扩展性设计

### 9.1 新数据源扩展

添加新数据源只需实现 `Fetcher` 接口：

```typescript
interface Fetcher {
  name: string;
  fetch(): Promise<RawContent[]>;
}

// 示例：添加 OpenAI Cookbook 数据源
class OpenAICookbookFetcher implements Fetcher {
  name = 'openai-cookbook';
  async fetch() { /* ... */ }
}
```

### 9.2 新内容类型扩展

在 Astro Content Collections 中添加新的 collection 定义即可，无需修改站点框架代码。

### 9.3 多语言扩展

当前仅支持中英翻译，但翻译模块的 prompt 模板化设计使得添加新语言只需增加 prompt 配置：

```typescript
const TRANSLATION_PROMPTS = {
  'zh-CN': '将以下英文内容翻译为简体中文...',
  'ja': '将以下英文内容翻译为日本語...',
  'ko': '将以下英文内容翻译为한국어...',
};
```

---

## 10. 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 源站结构变更导致爬取失败 | 中 | 高 | 爬取器模块化设计，失败快速告警；保留原始数据可回溯 |
| LLM 翻译质量不稳定 | 中 | 中 | 人工审校环节；长文本分块提供上下文；输出格式校验 |
| YouTube 音频下载受限 | 低 | 高 | 多种降级方案（本地 Whisper → YouTube 字幕提取 → 手动上传） |
| 内容版权问题 | 中 | 高 | 去品牌化处理；提取纯知识而非原文搬运；标注原始出处 |
| 大量内容构建缓慢 | 低 | 低 | Astro 增量构建；内容分页；Pagefind 异步索引 |
