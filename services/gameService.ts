import { supabase } from './supabaseClient';
import { Student, GameRecord, WrongAnswer, Artwork, HSL } from '../types';

// Helper for local storage fallback
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const createStudent = async (name: string, className: string): Promise<Student | null> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, class_name: className }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase connection failed, switching to Local Mode:', error);
    
    // Fallback: Create student locally
    const newStudent: Student = {
      id: `local-${Date.now()}`,
      name,
      class_name: className,
      total_score: 0,
      completed: false
    };
    
    const students = getLocal('local_students');
    students.push(newStudent);
    setLocal('local_students', students);
    
    return newStudent;
  }
};

export const saveGameRecord = async (record: GameRecord): Promise<void> => {
  try {
    const { error } = await supabase.from('game_records').insert([record]);
    if (error) throw error;
  } catch (e) {
    const records = getLocal('local_records');
    records.push(record);
    setLocal('local_records', records);
  }
};

export const saveWrongAnswer = async (answer: WrongAnswer): Promise<void> => {
  try {
    const { error } = await supabase.from('wrong_answers').insert([answer]);
    if (error) throw error;
  } catch (e) {
    // Optional: Log locally if needed, but usually not critical for gameplay
  }
};

export const updateStudentScore = async (studentId: string, additionalScore: number): Promise<void> => {
  try {
    // 1. If local user, update locally
    if (studentId.startsWith('local-')) {
      const students = getLocal('local_students');
      const idx = students.findIndex((s: Student) => s.id === studentId);
      if (idx !== -1) {
        students[idx].total_score += additionalScore;
        setLocal('local_students', students);
      }
      return;
    }

    // 2. Try Supabase update
    const { data: student, error: fetchError } = await supabase.from('students').select('total_score').eq('id', studentId).single();
    if (fetchError) throw fetchError;
    
    if (student) {
      await supabase
        .from('students')
        .update({ total_score: (student.total_score || 0) + additionalScore })
        .eq('id', studentId);
    }
  } catch (e) {
    console.warn("Score update failed:", e);
  }
};

export const completeStudentGame = async (studentId: string): Promise<void> => {
  try {
    if (studentId.startsWith('local-')) {
      const students = getLocal('local_students');
      const idx = students.findIndex((s: Student) => s.id === studentId);
      if (idx !== -1) {
        students[idx].completed = true;
        setLocal('local_students', students);
      }
      return;
    }

    const { error } = await supabase.from('students').update({ completed: true }).eq('id', studentId);
    if (error) throw error;
  } catch (e) {
    console.warn("Completion status update failed:", e);
  }
};

export const saveArtwork = async (artwork: Artwork): Promise<void> => {
  try {
    // If local user, always save local
    if (artwork.student_id.startsWith('local-')) {
        throw new Error("Local user");
    }
    const { error } = await supabase.from('artworks').insert([artwork]);
    if (error) throw error;
  } catch (e) {
    const arts = getLocal('local_artworks');
    // Add local metadata
    arts.push({
        ...artwork, 
        id: `art-${Date.now()}`, 
        created_at: new Date().toISOString()
    });
    setLocal('local_artworks', arts);
  }
};

// Admin Functions - Merges Cloud and Local Data
export const fetchAllStudents = async () => {
  let cloudStudents: Student[] = [];
  try {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (!error && data) cloudStudents = data;
  } catch (e) {
    console.warn("Could not fetch cloud students");
  }
  
  const localStudents = getLocal('local_students');
  return [...cloudStudents, ...localStudents];
};

export const fetchAllGameRecords = async (): Promise<GameRecord[]> => {
  let cloudRecords: GameRecord[] = [];
  try {
    // Limit to last 1000 records for performance, or fetch all if needed
    const { data, error } = await supabase.from('game_records').select('*');
    if (!error && data) cloudRecords = data;
  } catch (e) {
    console.warn("Could not fetch cloud records");
  }
  
  const localRecords = getLocal('local_records');
  return [...cloudRecords, ...localRecords];
};

export const fetchArtworks = async () => {
  let cloudArt: Artwork[] = [];
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, students(name, class_name)')
      .order('created_at', { ascending: false });
    if (!error && data) cloudArt = data;
  } catch (e) {
    console.warn("Could not fetch cloud art");
  }

  const localArts = getLocal('local_artworks');
  const localStudents = getLocal('local_students');
  
  const enrichedLocalArts = localArts.map((art: any) => {
    const s = localStudents.find((st: Student) => st.id === art.student_id);
    return {
      ...art,
      student_name: s ? s.name : '本地学生',
      class_name: s ? s.class_name : 'N/A'
    };
  });

  return [...cloudArt, ...enrichedLocalArts];
};

export const deleteStudent = async (id: string) => {
  if (id.startsWith('local-')) {
    const students = getLocal('local_students').filter((s: Student) => s.id !== id);
    setLocal('local_students', students);
    // Also clean up records
    const records = getLocal('local_records').filter((r: GameRecord) => r.student_id !== id);
    setLocal('local_records', records);
    return;
  }
  
  // Supabase cascade delete should handle records if foreign keys are set up, 
  // otherwise we might need to delete records manually. Assuming cascade for now or simple delete.
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
};
