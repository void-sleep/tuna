# 快速修复头像上传问题

## 🚨 你遇到的错误
```
上传失败: new row violates row-level security policy
```

## ✅ 快速解决方案（2 分钟）

### 方法 1：通过 Dashboard（最简单推荐）

1. **打开 Supabase Dashboard**
   - 进入你的项目

2. **进入 Storage**
   - 左侧菜单点击 "Storage"

3. **检查 avatars bucket**
   - 如果不存在，点击 "New bucket" 创建
   - Name: `avatars`
   - **重要**: ✅ 勾选 "Public bucket"
   - 点击 "Create"

4. **配置 Policies（关键步骤）**
   - 点击 `avatars` bucket
   - 点击顶部的 "Policies" 标签
   - 点击 "New Policy"
   - 选择 "Custom policy"
   - 创建以下策略：

**策略 1: 允许上传**
```
Policy name: Allow authenticated uploads
Allowed operation: INSERT
Target roles: authenticated
USING expression: true
WITH CHECK expression: bucket_id = 'avatars'
```

**策略 2: 允许读取**
```
Policy name: Allow public read
Allowed operation: SELECT
Target roles: public
USING expression: bucket_id = 'avatars'
```

**策略 3: 允许更新**
```
Policy name: Allow authenticated updates
Allowed operation: UPDATE
Target roles: authenticated
USING expression: bucket_id = 'avatars'
WITH CHECK expression: bucket_id = 'avatars'
```

**策略 4: 允许删除**
```
Policy name: Allow authenticated deletes
Allowed operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'avatars'
```

### 方法 2：通过 SQL Editor（快速）

1. 打开 Supabase Dashboard > **SQL Editor**
2. 点击 "New query"
3. 复制粘贴这段 SQL：

```sql
-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- 创建 bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 创建简单的策略
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars');
```

4. 点击 "Run" 执行

### 方法 3：临时快速修复（开发环境）

如果你只是想快速测试，可以暂时关闭 RLS：

```sql
-- ⚠️ 仅用于开发测试，生产环境不要这样做
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

## 🧪 测试

执行完上述任一方法后：

1. 刷新你的应用页面
2. 打开浏览器开发者工具（F12）
3. 前往 `/apps/settings`
4. 上传头像
5. 查看：
   - 是否显示成功提示
   - Console 中是否还有错误
   - Supabase Storage > avatars 中是否出现文件

## 📊 验证 Policies 设置正确

在 Supabase Dashboard > Storage > avatars > Policies，你应该看到：

✅ 4 个策略启用：
- INSERT for authenticated
- SELECT for public
- UPDATE for authenticated
- DELETE for authenticated

## 🔍 如果还是失败

请检查并告诉我：

1. **Bucket 是否存在且为 public？**
   - Storage > avatars > Settings > Public bucket 应该是 ON

2. **用户是否已登录？**
   - 确认 localStorage 中有 supabase 的 token

3. **错误信息是什么？**
   - 在浏览器 Console 查看完整错误

4. **Policies 是否都创建成功？**
   - Storage > avatars > Policies 应该有 4 个策略
