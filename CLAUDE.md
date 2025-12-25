# Tuna - 庄周吃鱼

一些现代化的 AI 驱动的应用，用户可创建运行自己的应用，我们会不断增加应用类型和模板。

## 项目概述

**核心功能**: 一些有用有趣的小工具。

**技术栈**:

- Next.js 15.5 + React 19 App Router
- Tailwind CSS + shadcn/ui
- Supabase 认证 + 数据库
- next-intl 国际化多语
- Cloudflare Pages 部署平台

## 项目结构

```console
tuna/
├── app/                    # Next.js App Router
│   ├── auth/              # 认证相关页面 （登录/注册/密码）
│   ├── apps/              # 用户应用列表（需要登录）
│   ├── applications/      # 应用运行页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   └── *-form.tsx        # 业务表单组件
├── lib/                  # 工具库
│   ├── supabase/         # Supabase 客户端配置
│   └── utils.ts          # 工具函数
├── public/               # 静态资源
├── middleware.ts         # Next.js 中间件（认证等）
└── wrangler.toml         # Cloudflare 配置
```

## 开发命令

```bash
npm run dev       # 本地开发服务器
npm run build     # 构建生产版本
npm run lint      # 代码检查
npm run preview   # Cloudflare 本地预览
npm run deploy    # 部署到 Cloudflare
```

## 设计风格

**核心理念**: 现代极简、轻快明亮、直观易用

### 视觉设计

- **极简主义**: 去除冗余元素，专注核心功能，大量留白增强呼吸感
- **现代感**: 采用圆角、阴影、毛玻璃等现代设计语言
- **色彩**: 支持深色/浅色模式，使用柔和明亮的色调，高对比度保证可读性
- **图标**: 优先使用 Heroicons，风格统一简洁

### 布局原则

- **响应式优先**: 移动端优先设计，流畅适配各种屏幕
- **卡片化**: 信息分组使用卡片承载，清晰的视觉层级
- **网格系统**: 基于 Tailwind 的 12 列网格，保持对齐与平衡
- **留白**: 充足的间距（p-4, p-6, gap-4 等）避免拥挤

### 交互体验

- **流畅动画**: 使用 Tailwind 动画类，过渡自然
- **即时反馈**: hover、active 状态明确，操作结果及时响应
- **微交互**: 按钮点击、列表展开等细节动效提升愉悦感
- **加载状态**: 骨架屏或加载动画，避免空白等待

### 组件风格

- 按钮：圆角适中（rounded-md），清晰的主次关系
- 输入框：简洁边框，聚焦时明显反馈
- 卡片：轻微阴影（shadow-sm），hover 时提升（shadow-md）
- 字体：系统默认字体栈，中英文混排友好

## 开发规范

1. **组件**: 使用 shadcn/ui 基础组件，保持一致的设计系统
2. **路由**: 使用 Next.js App Router，服务端组件优先
3. **认证**: 通过 Supabase Auth，中间件保护路由
4. **样式**: Tailwind CSS，遵循 utility-first 原则
5. **类型**: TypeScript 严格模式，确保类型安全
6. **国际化**: 页面支持国际化多语

## 待办事项

参考 `roadmap.md`，关注 TODO List，忽略已完成的任务。
