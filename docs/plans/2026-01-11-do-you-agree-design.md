# DoYouAgree 应用设计文档

**日期**: 2026-01-11
**状态**: 设计完成，待实现

## 概述

DoYouAgree（你同意吗）是一个社交互动应用，允许用户向好友提问并获得回答。核心特性：
- 双向好友系统（必须双方同意才能成为好友）
- 提问功能（可自定义回答选项）
- 站内通知机制
- 不可变记录（一旦回答就无法修改）
- 严格的权限控制（完全私密，只有双方可见）

## 架构方案

采用**混合架构**：
- 在 `applications` 表中创建 `agree_question` 类型（保持架构一致性）
- 添加独立的 `friends` 和 `agree_questions` 表（专门为社交功能优化）
- `agree_questions` 表引用 `application_id`，但有自己的社交字段

## 数据库设计

### 1. friends 表（好友关系）

```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  friend_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 索引优化
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
```

字段说明：
- `user_id`: 发起好友请求的用户
- `friend_id`: 接收请求的用户
- `status`: 状态值（pending/accepted/rejected），应用层保证正确性
- 双向好友关系：A->B 和 B->A 都是 accepted 时才算真正的好友

### 2. agree_questions 表（问题记录）

```sql
CREATE TABLE agree_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  answer TEXT NULL,
  status TEXT NOT NULL,
  answered_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_user_id != to_user_id)
);

-- 索引优化
CREATE INDEX idx_agree_questions_from_user ON agree_questions(from_user_id);
CREATE INDEX idx_agree_questions_to_user ON agree_questions(to_user_id);
CREATE INDEX idx_agree_questions_status ON agree_questions(status);
CREATE INDEX idx_agree_questions_app_id ON agree_questions(application_id);
```

字段说明：
- `application_id`: 关联到 applications 表（保持架构一致）
- `from_user_id`: 提问者
- `to_user_id`: 被提问者
- `question_text`: 问题内容
- `options`: JSONB 数组，存储可自定义的回答选项（如 ["同意", "不同意", "待考虑"]）
- `answer`: 用户选择的答案（一旦填写就不可修改）
- `status`: 状态值（pending/answered/expired），应用层保证正确性
- `answered_at`: 回答时间

### 3. notifications 表（通知）

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read, created_at DESC);
```

字段说明：
- `type`: 通知类型（friend_request/new_question/question_answered）
- `title`: 通知标题
- `content`: 通知内容
- `link`: 点击跳转的链接
- `read`: 是否已读

## RLS 权限策略

### friends 表的 RLS

```sql
-- 启用 RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- 用户只能查看与自己相关的好友关系
CREATE POLICY friends_select ON friends
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- 用户只能创建自己发起的好友请求
CREATE POLICY friends_insert ON friends
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

-- 只能更新发给自己的好友请求（接受/拒绝）
CREATE POLICY friends_update ON friends
  FOR UPDATE USING (
    auth.uid() = friend_id AND status = 'pending'
  );

-- 可以删除自己发起的或接收到的好友关系
CREATE POLICY friends_delete ON friends
  FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );
```

### agree_questions 表的 RLS

```sql
-- 启用 RLS
ALTER TABLE agree_questions ENABLE ROW LEVEL SECURITY;

-- 只有提问者和被提问者能查看
CREATE POLICY agree_questions_select ON agree_questions
  FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- 只能创建自己发起的问题
CREATE POLICY agree_questions_insert ON agree_questions
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND status = 'pending'
  );

-- 只有被提问者可以更新（回答问题），且只能回答一次
CREATE POLICY agree_questions_update ON agree_questions
  FOR UPDATE USING (
    auth.uid() = to_user_id AND status = 'pending' AND answer IS NULL
  );

-- 提问者可以删除未回答的问题
CREATE POLICY agree_questions_delete ON agree_questions
  FOR DELETE USING (
    auth.uid() = from_user_id AND status = 'pending'
  );
```

### notifications 表的 RLS

```sql
-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 只能查看自己的通知
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 只能更新自己的通知（标记已读）
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 只能删除自己的通知
CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (auth.uid() = user_id);
```

## 状态转换规则

### 好友关系状态

```
pending → accepted (接受好友请求)
pending → rejected (拒绝好友请求)
```

限制：
- ❌ accepted/rejected 后不能再改变
- ❌ 只能由 friend_id 用户修改 status
- ✅ 任一方都可以删除好友关系

### 问题状态

```
pending → answered (回答问题)
pending → expired (取消/过期)
```

限制：
- ❌ answered 后完全不可修改（answer、status、answered_at 都锁定）
- ❌ 只能由 to_user_id 用户修改为 answered
- ✅ 提问者可以在 pending 状态时删除问题

## 应用层验证逻辑

### 创建问题前的检查

```typescript
// 1. 验证双方是否为好友
const isFriend = await checkFriendship(fromUserId, toUserId);
if (!isFriend) throw new Error('只能向好友提问');

// 2. 验证 options 格式
if (!Array.isArray(options) || options.length < 2) {
  throw new Error('至少需要2个选项');
}

// 3. 创建 application 记录（type='agree_question'）
// 4. 创建 agree_questions 记录（status='pending'）
```

### 回答问题时的检查

```typescript
// 1. 验证问题状态
if (question.status !== 'pending') {
  throw new Error('问题已回答或已过期');
}

// 2. 验证答案是否在 options 中
if (!question.options.includes(answer)) {
  throw new Error('无效的答案选项');
}

// 3. 原子更新：status='answered', answer=xxx, answered_at=NOW()
```

## 功能流程

### 1. 好友管理流程

```
搜索用户 → 发送好友请求 → 对方收到通知 → 对方同意/拒绝 → 成为好友
```

页面结构：
- `/apps/friends` - 好友管理页
  - Tab 1: 我的好友（已接受的双向好友）
  - Tab 2: 待处理（收到的 pending 请求）
  - Tab 3: 已发送（发出的 pending 请求）
  - 搜索框：按用户名/邮箱搜索用户并添加

### 2. 提问流程

```
选择好友 → 输入问题 → 设置选项 → 发送 → 对方回答 → 查看结果
```

页面结构：
- `/apps` - 应用列表（显示 agree_question 类型应用）
- `/apps/applications/[id]/edit` - 创建/编辑问题
  - 选择好友（下拉列表，只显示已接受的好友）
  - 输入问题文本
  - 自定义选项（默认提供"同意/不同意/待考虑"，可修改）
- `/apps/applications/[id]/run` - 查看问题详情
  - 收到的未回答问题：显示选项按钮
  - 已回答问题：显示完整对话（只读）
  - 发出的问题：显示状态和对方回答

### 3. 通知流程

在导航栏添加通知图标（铃铛）：
- 显示未读数量徽章
- 点击展开通知下拉列表或跳转到 `/notifications` 页面
- 通知类型：
  - 好友请求（"xxx 想添加你为好友"）
  - 新问题（"xxx 向你提问：..."）
  - 问题被回答（"xxx 回答了你的问题"）

## UI 组件设计

### 1. FriendsPage 组件

```typescript
// 好友列表页：/apps/friends
interface FriendsPageProps {
  initialTab?: 'friends' | 'received' | 'sent';
}
```

子组件：
- `FriendsList`: 展示已接受的好友
- `FriendRequestList`: 展示好友请求（收到的/发出的）
- `UserSearchInput`: 搜索用户并发送请求

### 2. QuestionCard 组件

```typescript
interface QuestionCardProps {
  question: AgreeQuestion;
  viewMode: 'sent' | 'received';
}
```

展示逻辑：
- `sent` 模式：显示对方信息、问题、状态
- `received` 模式：
  - 如果 status='pending'：显示选项按钮
  - 如果 status='answered'：显示问题和答案（只读）

### 3. NotificationCenter 组件

```typescript
interface Notification {
  id: string;
  type: 'friend_request' | 'new_question' | 'question_answered';
  title: string;
  content: string;
  link?: string;
  read: boolean;
  created_at: string;
}
```

交互：
- 点击通知跳转到对应页面
- 标记已读/全部已读
- 删除通知

## 用户体验优化

### 即时反馈
- 发送好友请求后立即显示"已发送"
- 回答问题后立即显示结果

### 防误操作
- 回答问题前二次确认："确定选择【xxx】吗？"
- 删除好友前确认："确定删除好友吗？"

### 加载状态
- 所有异步操作显示 loading 动画
- 使用骨架屏优化首次加载体验

### 空状态
- 无好友时：引导添加第一个好友
- 无问题时：引导创建第一个问题

## 国际化支持

需要添加的翻译键：

```json
{
  "friends": {
    "title": "好友管理",
    "myFriends": "我的好友",
    "received": "待处理",
    "sent": "已发送",
    "search": "搜索用户",
    "addFriend": "添加好友",
    "accept": "接受",
    "reject": "拒绝",
    "noFriends": "还没有好友"
  },
  "agreeQuestion": {
    "title": "你同意吗",
    "createQuestion": "提问",
    "selectFriend": "选择好友",
    "questionText": "问题内容",
    "options": "回答选项",
    "send": "发送",
    "answer": "回答",
    "pending": "待回答",
    "answered": "已回答",
    "confirm": "确定选择【{option}】吗？"
  },
  "notifications": {
    "title": "通知",
    "friendRequest": "{name} 想添加你为好友",
    "newQuestion": "{name} 向你提问",
    "questionAnswered": "{name} 回答了你的问题",
    "markAllRead": "全部已读",
    "noNotifications": "暂无通知"
  }
}
```

## 实现优先级

### Phase 1: 数据库和基础功能
1. 创建数据库迁移文件（friends, agree_questions, notifications）
2. 实现 RLS 策略
3. 创建 Supabase 查询函数

### Phase 2: 好友系统
1. 好友管理页面
2. 用户搜索功能
3. 发送/接受/拒绝好友请求
4. 好友列表展示

### Phase 3: 提问功能
1. 创建问题页面（选择好友、输入问题、自定义选项）
2. 问题列表页面
3. 回答问题功能
4. 查看问题详情

### Phase 4: 通知系统
1. 通知中心 UI
2. 通知创建逻辑（好友请求、新问题、问题被回答）
3. 未读数量徽章
4. 通知列表和标记已读

### Phase 5: 优化和完善
1. 错误处理和边界情况
2. 加载状态和空状态
3. 国际化翻译
4. 用户体验优化

## 技术债务和未来改进

### 当前版本不包含
- 邮件通知（仅站内通知）
- 问题过期机制（可以手动取消）
- 好友分组
- 问题统计和历史记录

### 未来可能的改进
- 添加邮件通知
- 问题自动过期（如7天未回答）
- 批量操作（批量删除问题/好友）
- 导出问答记录

## 安全考虑

### 数据隔离
- ✅ RLS 策略确保只能查看与自己相关的数据
- ✅ 应用层双重验证（好友关系、问题状态）

### 防滥用
- 限制每日好友请求数量（如50个/天）
- 限制每日提问数量（如100个/天）
- 防止重复发送好友请求

### 隐私保护
- ✅ 完全私密（只有双方可见）
- ✅ 用户可以删除自己发起的请求/问题
- ✅ 用户可以删除好友关系

## 测试计划

### 单元测试
- 好友关系验证逻辑
- 问题状态转换逻辑
- RLS 策略测试

### 集成测试
- 完整的好友添加流程
- 完整的提问-回答流程
- 通知创建和读取

### E2E 测试
- 用户A添加用户B为好友
- 用户A向用户B提问
- 用户B回答问题
- 验证数据隔离和权限控制
