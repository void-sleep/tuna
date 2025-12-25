-- =============================================================================
-- Tuna Database Schema - Initial Setup
-- =============================================================================
--
-- 数据架构设计原则：
-- 1. applications 表 - 存储应用元数据和应用级配置
-- 2. application_items 表 - 存储应用的数据项（选项、候选项等）
-- 3. application_results 表 - 存储应用运行结果和历史记录
--
-- 安全策略：
-- - 所有表启用 RLS（Row Level Security）
-- - 用户只能访问和操作自己创建的应用及相关数据
-- - 管理员（app_metadata.role = 'admin'）可以访问所有数据
-- - 只有认证用户才能创建运行结果
--
-- =============================================================================

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- 检查当前用户是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- =============================================================================
-- Table: applications
-- =============================================================================
--
-- 用途：存储应用的基本信息和元配置
--
-- 重要说明：
-- - type 字段：应用类型标识，在应用层验证（如 'binary_choice', 'wheel', 'counter' 等）
-- - config 字段仅用于应用级配置（如主题色、动画速度、显示选项等）
-- - 不要在 config 中存储数据项！数据项应存储在 application_items 表中
-- - 例如：二选一应用的两个选项应该是 application_items 表的两条记录
--
-- =============================================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 基本信息
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,

  -- 应用级配置（仅用于元配置，不存储数据项）
  -- 示例：{"theme": "dark", "animationSpeed": "normal", "showHistory": true}
  config JSONB NOT NULL DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_user_type ON applications(user_id, type);

-- RLS 安全策略
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications"
  ON applications
  FOR ALL
  USING (is_admin() OR auth.uid() = user_id)
  WITH CHECK (is_admin() OR auth.uid() = user_id);

-- 自动更新时间戳
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: application_items
-- =============================================================================
--
-- 用途：存储应用的数据项（选项、候选项等）
--
-- 示例用法：
-- - 二选一应用：两条记录（position 0 和 1）
-- - 转盘应用：多条记录，每条代表一个选项
-- - 投票应用：多条记录，每条代表一个候选项
--
-- 字段说明：
-- - user_id: 所有者 ID（数据库自动填充 DEFAULT auth.uid()）
-- - text: 选项文本
-- - icon: 可选的图标（emoji）
-- - description: 可选的描述说明
-- - metadata: 选项级元数据（如颜色、权重等）
-- - position: 排序位置（从0开始）
-- - is_active: 软删除标记（删除时设为 false，支持历史记录）
--
-- 唯一性约束：
-- - 使用部分索引保证活跃记录的 (application_id, position) 唯一
-- - 允许软删除的记录存在重复 position
--
-- =============================================================================

CREATE TABLE IF NOT EXISTS application_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),

  -- 数据字段
  text VARCHAR(500) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- 排序和状态
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_application_items_user_id ON application_items(user_id);
CREATE INDEX IF NOT EXISTS idx_application_items_app_id ON application_items(application_id);
CREATE INDEX IF NOT EXISTS idx_application_items_position ON application_items(application_id, position);
CREATE INDEX IF NOT EXISTS idx_application_items_active ON application_items(application_id, is_active);
CREATE INDEX IF NOT EXISTS idx_application_items_app_active_pos ON application_items(application_id, is_active, position);

-- 部分唯一索引：只对活跃记录强制 position 唯一性
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_app_item_position
  ON application_items(application_id, position)
  WHERE is_active = TRUE;

-- RLS 安全策略
ALTER TABLE application_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON application_items
  FOR ALL
  USING (is_admin() OR auth.uid() = user_id)
  WITH CHECK (is_admin() OR auth.uid() = user_id);

-- 自动更新时间戳
CREATE TRIGGER update_application_items_updated_at
  BEFORE UPDATE ON application_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Table: application_results
-- =============================================================================
--
-- 用途：存储应用的运行结果和历史记录
--
-- 字段说明：
-- - user_id: 应用所有者 ID（数据库自动填充 DEFAULT auth.uid()，用于权限控制）
-- - runner_id: 可选，记录实际运行者（可能是应用所有者或其他用户）
-- - result_data: 结果详情（JSONB格式，灵活存储各种结果）
-- - ip_address: 可选，记录IP地址
-- - user_agent: 可选，记录浏览器信息
--
-- 示例 result_data：
-- {
--   "selected_option": "A",
--   "selected_text": "生存",
--   "duration_ms": 3000,
--   "timestamp": "2025-01-01T12:00:00Z"
-- }
--
-- =============================================================================

CREATE TABLE IF NOT EXISTS application_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),

  -- 结果数据
  result_data JSONB NOT NULL,

  -- 可选的元数据
  runner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_application_results_user_id ON application_results(user_id);
CREATE INDEX IF NOT EXISTS idx_application_results_runner_id ON application_results(runner_id);
CREATE INDEX IF NOT EXISTS idx_application_results_app_id ON application_results(application_id);
CREATE INDEX IF NOT EXISTS idx_application_results_created_at ON application_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_results_app_time ON application_results(application_id, created_at DESC);

-- RLS 安全策略
ALTER TABLE application_results ENABLE ROW LEVEL SECURITY;

-- 只允许认证用户创建结果
CREATE POLICY "Authenticated users can create results"
  ON application_results
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户只能查看自己应用的结果
CREATE POLICY "Users can view their own data"
  ON application_results
  FOR SELECT
  USING (is_admin() OR auth.uid() = user_id);

-- 用户只能删除自己应用的结果
CREATE POLICY "Users can delete their own data"
  ON application_results
  FOR DELETE
  USING (is_admin() OR auth.uid() = user_id);

-- =============================================================================
-- Views
-- =============================================================================

-- 便捷视图：应用及其数据项
CREATE OR REPLACE VIEW applications_with_items AS
SELECT
  a.id,
  a.user_id,
  a.title,
  a.description,
  a.type,
  a.config,
  a.created_at,
  a.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', ai.id,
        'text', ai.text,
        'icon', ai.icon,
        'description', ai.description,
        'metadata', ai.metadata,
        'position', ai.position,
        'is_active', ai.is_active
      ) ORDER BY ai.position
    ) FILTER (WHERE ai.id IS NOT NULL),
    '[]'
  ) as items
FROM applications a
LEFT JOIN application_items ai ON a.id = ai.application_id AND ai.is_active = true
GROUP BY a.id;

-- =============================================================================
-- Schema Initialization Complete
-- =============================================================================
