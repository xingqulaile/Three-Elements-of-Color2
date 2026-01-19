# Supabase 数据库配置说明

## ✅ 配置完成

你的 "Three-Elements-of-Color" 应用已成功配置到 Supabase 项目 **"Three-essential-elements-of-color"**。

## 📋 已完成的步骤

### 1. 连接信息
- **项目 URL**: https://ofuerolgqjyocjzyymsw.supabase.co
- **API Key**: sb_publishable_k3FsLXY1RmJsJcgTz1FDtw_VrCFYBgk
- 这些信息已保存在 `constants.ts` 文件中

### 2. 数据库表格
已创建以下表格：

#### **students** - 学生信息表
```
- id (UUID) - 主键
- name (TEXT) - 学生姓名
- class_name (TEXT) - 班级名称
- total_score (INTEGER) - 总积分
- completed (BOOLEAN) - 是否完成
- created_at (TIMESTAMP) - 创建时间
```

#### **game_records** - 游戏记录表
```
- id (UUID) - 主键
- student_id (UUID) - 学生ID (外键)
- level_number (INTEGER) - 关卡数
- is_correct (BOOLEAN) - 是否正确
- attempts (INTEGER) - 尝试次数
- time_spent (INTEGER) - 花费时间（秒）
- hints_used (INTEGER) - 使用提示数
- score (INTEGER) - 获得积分
- created_at (TIMESTAMP) - 创建时间
```

#### **wrong_answers** - 错误答案记录表
```
- id (UUID) - 主键
- student_id (UUID) - 学生ID (外键)
- level_number (INTEGER) - 关卡数
- target_value (JSONB) - 目标色值 {h, s, l}
- student_answer (JSONB) - 学生答案 {h, s, l}
- created_at (TIMESTAMP) - 创建时间
```

#### **artworks** - 艺术作品表
```
- id (UUID) - 主键
- student_id (UUID) - 学生ID (外键)
- image_data (TEXT) - 图像数据
- color_settings (JSONB) - 色彩设置
- created_at (TIMESTAMP) - 创建时间
```

### 3. 索引
已创建以下性能索引：
- `idx_game_records_student_id` 
- `idx_wrong_answers_student_id`
- `idx_artworks_student_id`
- `idx_students_created_at`
- `idx_game_records_created_at`

### 4. 行级安全 (RLS) 策略
所有表格都已启用 RLS，并配置了公共访问策略（支持 INSERT 和 SELECT）。

## 🚀 如何开始

### 1. 安装依赖
```bash
npm install
```

### 2. 运行开发服务器
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 📱 应用功能

### 游戏流程
1. **欢迎界面** - 输入学生名字和班级
2. **故事介绍** - 色彩王国背景故事
3. **第一关** - 学习色相 (Hue)
4. **第二关** - 学习明度 (Lightness/Value)
5. **第三关** - 学习纯度 (Saturation)
6. **第四关** - 综合挑战（色相 + 明度 + 纯度）
7. **第五关** - 创意模式（为图画着色）
8. **结束** - 显示最终积分

### 管理员功能
- 访问管理后台查看所有学生数据
- 查看游戏记录和分析
- 查看学生创作的艺术作品

## 🔄 本地存储降级方案

应用包含自动降级机制：
- 如果无法连接到 Supabase，数据会自动保存到本地 localStorage
- 当 Supabase 恢复连接时，数据可以同步

## 🔐 安全建议

当前配置使用公开的 anon/public key，仅适合演示和教学用途。

**生产环境建议**：
1. 使用环境变量存储敏感信息
2. 配置更严格的 RLS 策略
3. 使用认证系统保护管理员功能
4. 定期备份数据库

## 📝 环境变量配置（可选）

如果需要使用环境变量，可以创建 `.env.local` 文件：
```
VITE_SUPABASE_URL=https://ofuerolgqjyocjzyymsw.supabase.co
VITE_SUPABASE_KEY=sb_publishable_k3FsLXY1RmJsJcgTz1FDtw_VrCFYBgk
```

然后在 `constants.ts` 中修改为：
```typescript
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';
```

## ✨ 完成

你的应用已完全配置到 Supabase 数据库。所有数据操作都会自动同步到云端。祝你使用愉快！
