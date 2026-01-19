-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create game_records table
CREATE TABLE IF NOT EXISTS game_records (
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

-- Create wrong_answers table
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  target_value JSONB NOT NULL,
  student_answer JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  color_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_records_student_id ON game_records(student_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_student_id ON wrong_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_artworks_student_id ON artworks(student_id);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at);

-- Enable RLS (Row Level Security) for public access
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Create policies for public insert/select (adjust based on your security requirements)
CREATE POLICY "Allow public insert on students" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on students" ON students
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on game_records" ON game_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on game_records" ON game_records
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on wrong_answers" ON wrong_answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on wrong_answers" ON wrong_answers
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on artworks" ON artworks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on artworks" ON artworks
  FOR SELECT USING (true);
