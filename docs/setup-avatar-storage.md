# 设置头像存储（Supabase Storage）

## 方法 1: 通过 Supabase Dashboard（推荐）

1. 访问 Supabase 项目控制台
2. 点击左侧菜单的 **Storage**
3. 点击 **Create a new bucket**
4. 设置：
   - **Name**: `avatars`
   - **Public bucket**: ✅ 勾选（允许公开访问）
   - **File size limit**: `2 MB`
   - **Allowed MIME types**:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`
5. 点击 **Create bucket**

## 方法 2: 通过 SQL 迁移文件

我们已经创建了迁移文件：`supabase/migrations/20260112_setup_avatars_storage.sql`

在本地开发环境运行：

```bash
# 如果使用 Supabase CLI
supabase db push

# 或者直接在 Supabase Dashboard 的 SQL Editor 中执行该文件内容
```

## 配置 RLS 策略

迁移文件已包含以下 RLS 策略：

1. **上传策略**: 用户只能上传到自己的文件夹 (`{user_id}/`)
2. **查看策略**: 所有人可以查看头像（公开访问）
3. **更新策略**: 用户只能更新自己的头像
4. **删除策略**: 用户只能删除自己的头像

## 文件组织结构

```
avatars/
  └── {user_id}/
      └── {timestamp}.{ext}
```

例如：
```
avatars/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 1704672000000.jpg
```

## 测试上传

1. 登录应用
2. 前往个人设置页面 `/apps/settings`
3. 点击头像或"上传头像"按钮
4. 选择图片文件（最大 2MB）
5. 上传成功后应该：
   - 看到成功提示
   - 头像立即显示
   - Storage 中出现文件

## 故障排查

### 上传失败

如果看到错误 "上传失败: new row violates row-level security policy"：
- 确保 bucket 已创建且为 public
- 检查 RLS 策略是否正确设置
- 确认用户已登录

### 头像不显示

如果头像上传成功但不显示：
- 检查浏览器控制台是否有 CORS 错误
- 确认 bucket 设置为 public
- 清除浏览器缓存
- 检查 `profiles` 表的 `avatar_url` 字段是否正确更新

### 查看 Storage 内容

在 Supabase Dashboard > Storage > avatars bucket 中可以看到所有上传的文件。
