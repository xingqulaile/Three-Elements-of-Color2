-- 修复表结构以匹配应用代码

-- 1. 检查 students 表的现有列
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'students';

-- 2. 如果 students 表有问题，我们删除并重新创建
DROP TABLE IF EXISTS students CASCADE;

-- 创建正确的 students 表
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 创建其他表
DROP TABLE IF EXISTS game_records CASCADE;
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  time_spent INTEGER NOT NULL,
  hints_used INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

DROP TABLE IF EXISTS wrong_answers CASCADE;
CREATE TABLE wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  target_value JSONB NOT NULL,
  student_answer JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

DROP TABLE IF EXISTS artworks CASCADE;
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  color_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 创建索引
CREATE INDEX idx_game_records_student_id ON game_records(student_id);
CREATE INDEX idx_wrong_answers_student_id ON wrong_answers(student_id);
CREATE INDEX idx_artworks_student_id ON artworks(student_id);
CREATE INDEX idx_students_created_at ON students(created_at);
CREATE INDEX idx_game_records_created_at ON game_records(created_at);

-- 禁用 RLS 允许公开访问
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
