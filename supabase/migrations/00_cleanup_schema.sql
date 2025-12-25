-- =============================================================================
-- Tuna Database Schema - Cleanup Script
-- =============================================================================
--
-- 用途：清空所有 Tuna 相关的数据库对象
-- 警告：此脚本会删除所有表和数据，请谨慎使用！
--
-- 使用场景：
-- 1. 重新初始化数据库前清空现有结构
-- 2. 开发环境重置
--
-- =============================================================================

-- 删除视图
DROP VIEW IF EXISTS applications_with_items CASCADE;

-- 删除 RLS 策略（按表删除）
-- application_results 表的策略
DROP POLICY IF EXISTS "Authenticated users can create results" ON application_results;
DROP POLICY IF EXISTS "Users can view their own data" ON application_results;
DROP POLICY IF EXISTS "Users can delete their own data" ON application_results;
-- 兼容旧策略名称
DROP POLICY IF EXISTS "Users can view and delete their own data" ON application_results;
DROP POLICY IF EXISTS "Users can view and delete results of their own applications" ON application_results;
DROP POLICY IF EXISTS "Users can view results of their own applications" ON application_results;
DROP POLICY IF EXISTS "Users can delete results of their own applications" ON application_results;

-- application_items 表的策略
DROP POLICY IF EXISTS "Users can manage their own data" ON application_items;
-- 兼容旧策略名称
DROP POLICY IF EXISTS "Users can manage items of their own applications" ON application_items;
DROP POLICY IF EXISTS "Users can view items of their own applications" ON application_items;
DROP POLICY IF EXISTS "Users can create items for their own applications" ON application_items;
DROP POLICY IF EXISTS "Users can update items of their own applications" ON application_items;
DROP POLICY IF EXISTS "Users can delete items of their own applications" ON application_items;

-- applications 表的策略
DROP POLICY IF EXISTS "Users can manage their own applications" ON applications;
-- 兼容旧策略名称
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;

-- 删除索引
DROP INDEX IF EXISTS unique_active_app_item_position;
-- 兼容旧约束
ALTER TABLE IF EXISTS application_items DROP CONSTRAINT IF EXISTS unique_app_item_position;

-- 删除触发器
DROP TRIGGER IF EXISTS update_application_items_updated_at ON application_items;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
-- 兼容旧触发器
DROP TRIGGER IF EXISTS sync_application_results_user_id ON application_results;
DROP TRIGGER IF EXISTS sync_application_results_owner_id ON application_results;
DROP TRIGGER IF EXISTS sync_application_items_user_id ON application_items;

-- 删除表（CASCADE 会自动删除依赖的对象）
DROP TABLE IF EXISTS application_results CASCADE;
DROP TABLE IF EXISTS application_items CASCADE;
DROP TABLE IF EXISTS applications CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
-- 兼容旧函数
DROP FUNCTION IF EXISTS sync_user_id_from_application() CASCADE;
DROP FUNCTION IF EXISTS sync_owner_id_from_application() CASCADE;

-- =============================================================================
-- Cleanup Complete
-- =============================================================================
--
-- 现在可以执行 00_initial_schema.sql 来重新初始化数据库
--
-- =============================================================================
