# 数据持久化测试指南

## ✅ 配置已修复

你的 Supabase 数据库现在已配置完毕，RLS 策略已修复。所有数据操作应该能正常保存到数据库。

## 🧪 如何验证数据保存

### 方法 1: 通过浏览器测试应用

1. **打开应用** → http://192.168.31.70:3000
2. **输入学生信息**
   - 守护者姓名: 输入任意名字（如 "张三"）
   - 年级: 选择一个年级
   - 班级: 选择一个班级
3. **点击 "开启冒险，拯救色彩!"** 按钮
4. **进入游戏并完成至少一关**

### 方法 2: 在 Supabase 中查看数据

1. **登录 Supabase 控制面板**
2. **进入项目 "Three-essential-elements-of-color"**
3. **点击左侧 "Table Editor"**
4. **查看以下表格中的数据**
   - **students** - 应该看到新增的学生记录
   - **game_records** - 应该看到关卡完成记录
   - **wrong_answers** - 如果回答错误，会有错误记录
   - **artworks** - 如果完成第五关，会有艺术作品保存

## 📊 预期的数据结构

### students 表
```
id: UUID (自动生成)
name: 学生名字
class_name: 班级名称
total_score: 总积分
completed: 是否完成游戏 (true/false)
created_at: 创建时间
```

### game_records 表
```
id: UUID (自动生成)
student_id: 学生 ID (来自 students 表)
level_number: 关卡号 (1-5)
is_correct: 是否正确 (true/false)
attempts: 尝试次数
time_spent: 花费时间（秒）
hints_used: 使用提示数
score: 获得积分
created_at: 创建时间
```

### wrong_answers 表
```
id: UUID (自动生成)
student_id: 学生 ID
level_number: 关卡号
target_value: 目标色值 {h, s, l}
student_answer: 学生答案 {h, s, l}
created_at: 创建时间
```

### artworks 表
```
id: UUID (自动生成)
student_id: 学生 ID
image_data: 图像数据 (Base64)
color_settings: 色彩设置 {组件名称: {h, s, l}}
created_at: 创建时间
```

## 🔍 故障排查

### 问题: 数据仍未保存到 Supabase

**可能原因:**
1. RLS 策略执行失败
2. 网络连接问题
3. API Key 无效

**解决方案:**
```sql
-- 在 Supabase SQL Editor 中运行，查看 RLS 状态
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('students', 'game_records', 'wrong_answers', 'artworks');

-- 应该显示 rowsecurity = false（表示 RLS 已禁用）
```

### 问题: 浏览器控制台显示错误

检查浏览器的开发者工具（F12）中的 Console 选项卡，查看具体错误信息。

常见错误:
- `Failed to insert into students` - API Key 问题或表不存在
- `Network error` - 连接问题，应用会自动降级到本地存储

## ✨ 数据同步流程

```
用户在应用中输入数据
    ↓
应用调用 Supabase API
    ↓
如果成功 → 数据保存到云端 ✅
如果失败 → 数据保存到本地存储 (localStorage) ⚠️
    ↓
用户可以在 Supabase 控制面板中查看/导出数据
```

## 📱 管理员功能

点击欢迎页面的 **"教师管理后台"** 链接进入管理员模式：
- 默认用户名: `admin`
- 默认密码: `142587`

在管理员后台可以查看：
- 所有学生名单及积分
- 完整的游戏记录
- 学生错误答案分析
- 学生创作的艺术作品

## 🎯 完成配置

至此，你的 Three-Elements-of-Color 应用已完全配置到 Supabase 数据库。

所有数据现在都会自动保存到云端，可以：
- ✅ 跨设备访问学生数据
- ✅ 长期保存学习记录
- ✅ 进行数据分析和导出
- ✅ 实时查看学生进度

祝你使用愉快！🎉
