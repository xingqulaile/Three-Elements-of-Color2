-- 修复 RLS 策略以确保数据能正常保存到 Supabase

-- 删除旧的限制性策略
DROP POLICY IF EXISTS "Allow public insert on students" ON students;
DROP POLICY IF EXISTS "Allow public select on students" ON students;
DROP POLICY IF EXISTS "Allow public insert on game_records" ON game_records;
DROP POLICY IF EXISTS "Allow public select on game_records" ON game_records;
DROP POLICY IF EXISTS "Allow public insert on wrong_answers" ON wrong_answers;
DROP POLICY IF EXISTS "Allow public select on wrong_answers" ON wrong_answers;
DROP POLICY IF EXISTS "Allow public insert on artworks" ON artworks;
DROP POLICY IF EXISTS "Allow public select on artworks" ON artworks;

-- 禁用 RLS（对于开发/演示环境，这样可以完全避免 RLS 问题）
-- 如果你需要安全性，可以跳过这一步，只使用下面的策略
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;

-- 或者，如果你想保持 RLS 启用，创建完全允许的策略：
-- 取消注释以下代码来替代上面的 DISABLE 语句

/*
-- 为 students 表创建允许所有操作的策略
CREATE POLICY "students_all_access" ON students
  USING (true)
  WITH CHECK (true);

-- 为 game_records 表创建允许所有操作的策略
CREATE POLICY "game_records_all_access" ON game_records
  USING (true)
  WITH CHECK (true);

-- 为 wrong_answers 表创建允许所有操作的策略
CREATE POLICY "wrong_answers_all_access" ON wrong_answers
  USING (true)
  WITH CHECK (true);

-- 为 artworks 表创建允许所有操作的策略
CREATE POLICY "artworks_all_access" ON artworks
  USING (true)
  WITH CHECK (true);
*/
