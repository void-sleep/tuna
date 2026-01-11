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

如果本地已经 npm run dev 启动开发模式，在每次改代码后就不要 npm run build，复用开发模式即可。

```bash
npm run dev       # 本地开发服务器
npm run build     # 构建生产版本
npm run lint      # 代码检查
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

## 数据库设计规范

**数据库技术**: 使用 Supabase PostgreSQL，强制实施行级安全策略

### 基本要求

- SQL 语句可使用英文、下划线，不要包含中文或特殊字符

### 权限安全核心原则

- **最小权限原则**: 每个用户/角色只获得必需的最小权限，拒绝默认信任
- **零信任架构**: 所有数据访问请求都需要经过明确的权限验证，不存在特殊例外
- **显式拒绝优先**: 未明确允许的操作视为禁止，避免隐含的权限泄露

### RLS（行级安全）策略

**强制要求**:

1. 所有用户数据表必须启用 RLS
2. 为每个表定义明确的访问策略
3. 区分 SELECT、INSERT、UPDATE、DELETE 四种操作权限

**常见模式**:

```sql
-- 用户只能访问自己的数据
CREATE POLICY user_isolation ON user_data
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能修改自己的数据
CREATE POLICY user_update ON user_data
  FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以访问所有数据
CREATE POLICY admin_access ON user_data
  FOR ALL USING (is_admin(auth.uid()));
```

### 数据隔离策略

1. **用户数据隔离**: 每条记录添加 `user_id` 外键，RLS 策略必须检查用户身份
2. **组织/团队隔离**: 多租户场景下，使用 `org_id` 作为隔离键
3. **避免全局查询**: 禁止不带用户条件的全表查询操作

**示例表设计**:

```sql
CREATE TABLE user_data (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  org_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_org FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- 确保在 org_id 和 user_id 上有索引优化查询
CREATE INDEX idx_user_org ON user_data(user_id, org_id);
```

### 权限验证检查清单

在每个数据操作中：

- ✅ 验证当前用户身份（via `auth.uid()`）
- ✅ 确认用户属于目标组织/团队
- ✅ 检查用户在组织中的角色权限
- ✅ 为操作记录审计日志
- ❌ 不依赖前端权限检查（前端权限仅用于 UX）
- ❌ 不使用 SQL 注入风险的动态拼接查询

### 常见安全陷阱

| 陷阱 | 后果 | 防护方案 |
| --- | --- | --- |
| RLS 未启用 | 任何认证用户可读写所有数据 | 创建表时强制启用 RLS，定义明确策略 |
| RLS 策略不完整 | INSERT/UPDATE 时权限绕过 | 为四种操作都定义策略，测试所有路径 |
| 使用 Admin API Key 查询 | 客户端调用时绕过 RLS | 客户端仅用公钥，服务端操作使用受限密钥 |
| 策略逻辑错误 | 权限判断失效导致越权 | 编写单元测试验证各场景，Code Review 必审 |
| 缺少审计日志 | 无法追踪违规访问 | 重要操作添加 `audit_log` 表记录 |
| 跨组织数据泄露 | 用户访问其他组织数据 | RLS 策略必须检查 `org_id`，禁止仅靠 `user_id` |

### 审计日志

为所有敏感操作（删除、权限变更等）添加审计记录：

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL, -- 'DELETE', 'UPDATE', 'PERMISSION_CHANGE'
  table_name TEXT NOT NULL,
  record_id UUID,
  changed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通过触发器自动记录
CREATE TRIGGER audit_trigger AFTER DELETE ON user_data
  FOR EACH ROW EXECUTE FUNCTION log_audit('DELETE');
```

### 性能优化原则

**核心思想**: 通过高质量的数据结构设计，最小化 Policy 和 Trigger 数量，在安全性和性能之间实现平衡

#### 1. 减少 Policy 数量的表设计

避免复杂多条 Policy，通过更优雅的表结构实现权限控制：

**反例 - 过度设计**:

```sql
-- 3 个 Policy 处理不同场景，策略复杂易错
CREATE POLICY owner_read ON documents FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY team_read ON documents FOR SELECT USING (team_id IN (SELECT team_id FROM user_teams WHERE user_id = auth.uid()));
CREATE POLICY admin_read ON documents FOR SELECT USING ((SELECT is_admin FROM users WHERE id = auth.uid()));
```

**正例 - 优雅设计**:

```sql
-- 通过规范化权限表，用单个 Policy 处理所有情况
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_access (
  document_id UUID REFERENCES documents,
  grantee_id UUID REFERENCES auth.users,
  access_level TEXT CHECK (access_level IN ('view', 'edit', 'admin')),
  PRIMARY KEY (document_id, grantee_id)
);

-- 单个 Policy 检查统一的权限表
CREATE POLICY document_access ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = documents.id
      AND grantee_id = auth.uid()
    )
  );
```

#### 2. 高效索引策略

设计索引时，优先考虑 RLS Policy 中使用的字段：

```sql
-- ✅ 好：为 RLS 条件字段建立复合索引
CREATE INDEX idx_documents_user_org ON documents(user_id, org_id, created_at DESC);

-- ✅ 好：为权限查询优化
CREATE INDEX idx_doc_access_user ON document_access(grantee_id, access_level);

-- ❌ 差：冗余索引，未考虑查询模式
CREATE INDEX idx_title ON documents(title);
CREATE INDEX idx_user ON documents(user_id);
```

**索引设计清单**:

- RLS Policy 中的条件字段必须有索引
- 常见的 WHERE 条件组合使用复合索引
- 排序字段（如 `created_at DESC`）应包含在索引中
- 避免超过 3 个字段的复合索引，优先使用部分索引

#### 3. 减少 Trigger 数量的策略

**优先级**: 应用层逻辑 > 约束条件 > Trigger

```sql
-- ❌ 不要用 Trigger 做简单的时间戳更新
-- CREATE TRIGGER update_modified BEFORE UPDATE ON documents
--   FOR EACH ROW SET NEW.updated_at = NOW();

-- ✅ 在应用层处理，或使用 PostgreSQL 内置支持
ALTER TABLE documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
-- 客户端在 UPDATE 时显式设置，或使用 supabase-js 的钩子

-- ❌ 不要用 Trigger 做复杂的计算字段维护
-- CREATE TRIGGER update_count AFTER INSERT ON comments
--   FOR EACH ROW EXECUTE FUNCTION increment_post_comment_count();

-- ✅ 查询时计算，或异步更新（非关键业务）
SELECT id, (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comment_count
FROM posts WHERE id = ?;
```

**何时使用 Trigger**:

- 跨表的数据一致性保证（如级联更新权限）
- 必须同步的审计日志（不能延迟）
- 不可用应用层处理的复杂业务逻辑

**Trigger 最佳实践**:

```sql
-- 审计日志 Trigger 示例（正当使用）
CREATE FUNCTION record_audit() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, record_id, changed_data, created_at)
  VALUES (auth.uid(), TG_OP, NEW.id, row_to_json(NEW), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_delete_document AFTER DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION record_audit();
```

#### 4. 避免性能陷阱

| 陷阱 | 问题 | 解决方案 |
| --- | --- | --- |
| RLS 中的子查询 | Policy 每行都执行子查询，导致 N+1 问题 | 用 `EXISTS` 替代 `IN`，利用数据库优化器 |
| 过多的 JOIN | Policy 涉及多表 JOIN，查询变慢 | 反范式化必要的字段（如将 `org_id` 冗余存储） |
| 无索引的 Policy 条件 | RLS 检查无索引字段，全表扫描 | 为所有 Policy 条件字段建立索引 |
| 同步 Trigger 处理重操作 | 单个操作触发多个 Trigger，阻塞客户端 | 异步处理非关键操作，或批量操作时禁用 Trigger |
| 没有 EXPLAIN ANALYZE | 假设查询快，实际性能差 | 每个新 Query 都用 EXPLAIN 验证执行计划 |

#### 5. 表设计最佳实践

**单一职责原则**:

```sql
-- ✅ 好：权限和数据分离，易于管理和扩展
CREATE TABLE posts (id UUID PRIMARY KEY, title TEXT, owner_id UUID);
CREATE TABLE post_permissions (post_id UUID, user_id UUID, permission TEXT);

-- ❌ 差：权限嵌入业务表，复杂 RLS，难以扩展
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title TEXT,
  owner_id UUID,
  viewers JSONB,  -- 权限混在数据中
  editors JSONB
);
```

**冗余字段权衡**:

```sql
-- 在性能和规范化之间的权衡
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,  -- 冗余存储，避免查询 users 表来确认组织
  owner_id UUID NOT NULL REFERENCES users(id),
  title TEXT,
  CONSTRAINT fk_owner_org FOREIGN KEY (owner_id, org_id)
    REFERENCES users(id, org_id)
);
-- 索引 org_id 使 RLS 查询快速，权衡了少量冗余空间
CREATE INDEX idx_posts_org ON posts(org_id);
```

### 数据库迁移规范

所有 schema 变更通过版本化迁移文件管理，存放在 `supabase/migrations` 目录。

#### 迁移文件原则

**一个文件，一次需求** - 每个迁移文件包含实现一个完整需求所需的所有 SQL 变更，包括：

- 表创建
- 索引创建
- RLS 策略定义
- 触发器和函数
- 审计日志设置

#### 何时创建新的迁移文件

**创建新文件的时机**（代表一个独立的需求/功能）：

1. **不同的需求/任务** - 来自不同的需求或 PR
   - 示例：Task A 要求添加文档协作功能，Task B 要求修改订阅模型 → 两个独立的迁移文件

2. **本地开发完成并准备提交** - 功能验证完毕，准备合并到主分支
   - 示例：文档协作功能完全设计和测试后，创建并提交一个完整的迁移文件

#### 何时复用同一文件（中间态讨论）

**复用文件的场景**（同一会话内的迭代）：

1. **设计阶段** - 在敲定最终方案前，反复调整同一个迁移文件
   - 示例：设计用户权限模型，多次调整表结构、RLS 策略和索引，最终确定后再 commit

2. **本地开发中** - 还未 commit 的版本迭代
   - 示例：本地开发时反复调整表结构和 RLS，验证功能无误后再提交

#### 迁移文件命名规范

使用时间戳 + 描述性名称，遵循 Supabase 约定：

```console
supabase/migrations/
├── 20250111_add_document_collaboration.sql      # 文档协作功能（完整）
└── 20250112_add_subscription_model.sql          # 订阅模型（完整）
```

**命名规则**:

- 格式：`YYYYMMDD_feature_name.sql`
- 以功能/需求名称命名，不需要细分（表、RLS、索引都包含在内）
- 使用下划线分隔单词

## Markdown 规范

- 所有代码块必须指定语言标记，格式：` ```language`
  - 如果没有明确的语言类型，使用 ` ```console` 作为默认
  - 常见语言标记：bash, python, java, javascript, json, yaml, xml, sql 等
- 表格格式使用 "consistent" 风格（管道符 `|` 前后都要有空格）
  - ✅ 正确：`| --- | --- |`
  - ❌ 错误：`|---|---|`
