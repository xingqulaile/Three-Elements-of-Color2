import React, { useState } from 'react';
import { GameStage, Student, HSL } from './types';
import * as GameService from './services/gameService';
import WelcomeScreen from './components/WelcomeScreen';
import GameLevel from './components/GameLevel';
import CreativeLevel from './components/CreativeLevel';
import Scoreboard from './components/Scoreboard';
import AdminPanel from './components/AdminPanel';
import { Home, ArrowLeft, ArrowRight, Menu } from 'lucide-react';

function App() {
  const [stage, setStage] = useState<GameStage>(GameStage.WELCOME);
  const [student, setStudent] = useState<Student | null>(null);
  
  const handleStartGame = async (name: string, className: string) => {
    try {
      const newStudent = await GameService.createStudent(name, className);
      if (newStudent) {
        setStudent(newStudent);
        setStage(GameStage.STORY_INTRO);
      } else {
        alert("无法开始游戏，请重试。");
      }
    } catch (e) {
      console.error(e);
      alert("发生未知错误");
    }
  };

  const handleLevelComplete = async (success: boolean, stats: any) => {
    if (!student?.id) return;

    // 1. Save Record
    await GameService.saveGameRecord({
      student_id: student.id,
      level_number: getLevelNumber(stage),
      is_correct: success,
      attempts: stats.attempts,
      time_spent: stats.timeSpent,
      hints_used: stats.hintsUsed,
      score: stats.score
    });

    // 2. Save Wrong Answer
    if (!success) {
      await GameService.saveWrongAnswer({
        student_id: student.id,
        level_number: getLevelNumber(stage),
        target_value: stats.targetColor,
        student_answer: stats.finalColor
      });
    }

    // 3. Update Score
    await GameService.updateStudentScore(student.id, stats.score);
    setStudent(prev => prev ? ({ ...prev, total_score: (prev.total_score || 0) + stats.score }) : null);

    // 4. Move to next stage
    moveToNextStage();
  };

  const handleCreativeComplete = async (imageData: string, colorSettings: Record<string, HSL>) => {
    if (!student?.id) return;

    await GameService.saveArtwork({
      student_id: student.id,
      image_data: imageData,
      color_settings: colorSettings
    });

    await GameService.updateStudentScore(student.id, 50);
    setStudent(prev => prev ? ({ ...prev, total_score: (prev.total_score || 0) + 50 }) : null);

    await GameService.completeStudentGame(student.id);
    setStage(GameStage.GAME_OVER);
  };

  const handleRestart = () => {
    setStudent(null);
    setStage(GameStage.WELCOME);
  };

  const getLevelNumber = (s: GameStage): number => {
    switch(s) {
      case GameStage.LEVEL_1: return 1;
      case GameStage.LEVEL_2: return 2;
      case GameStage.LEVEL_3: return 3;
      case GameStage.LEVEL_4: return 4;
      case GameStage.LEVEL_5: return 5;
      default: return 0;
    }
  };

  const moveToNextStage = () => {
    const order = [
      GameStage.STORY_INTRO,
      GameStage.LEVEL_1,
      GameStage.LEVEL_2,
      GameStage.LEVEL_3,
      GameStage.LEVEL_4,
      GameStage.LEVEL_5,
      GameStage.GAME_OVER
    ];
    const currentIndex = order.indexOf(stage);
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
      setStage(order[currentIndex + 1]);
    }
  };

  const moveToPrevStage = () => {
     const order = [
      GameStage.STORY_INTRO,
      GameStage.LEVEL_1,
      GameStage.LEVEL_2,
      GameStage.LEVEL_3,
      GameStage.LEVEL_4,
      GameStage.LEVEL_5,
      GameStage.GAME_OVER
    ];
    const currentIndex = order.indexOf(stage);
    if (currentIndex > 0) {
      setStage(order[currentIndex - 1]);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case GameStage.WELCOME:
        return <WelcomeScreen onStart={handleStartGame} onAdmin={() => setStage(GameStage.ADMIN_LOGIN)} />;
      
      case GameStage.STORY_INTRO:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8">
            <div className="max-w-2xl text-center space-y-6">
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">糟糕！颜色消失了...</h1>
              <p className="text-xl leading-relaxed">
                色彩王国的<span className="text-red-400">色相</span>、<span className="text-green-400">明度</span>和<span className="text-blue-400">纯度</span>水晶被神秘力量偷走了。世界变得灰暗无光。
              </p>
              <p className="text-lg">
                亲爱的守护者 <strong>{student?.name}</strong>，我们需要你通过重重关卡，找回这些元素，重新点亮这个世界！
              </p>
              <button 
                onClick={moveToNextStage}
                className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full text-xl font-bold transition-all"
              >
                接受任务
              </button>
            </div>
          </div>
        );

      case GameStage.LEVEL_1:
      case GameStage.LEVEL_2:
      case GameStage.LEVEL_3:
      case GameStage.LEVEL_4:
        return <GameLevel levelNumber={getLevelNumber(stage)} onComplete={handleLevelComplete} />;

      case GameStage.LEVEL_5:
        return <CreativeLevel onComplete={handleCreativeComplete} />;

      case GameStage.GAME_OVER:
        return student && <Scoreboard student={student} onRestart={handleRestart} />;

      case GameStage.ADMIN_LOGIN:
      case GameStage.ADMIN_DASHBOARD:
        return <AdminPanel onLogout={() => setStage(GameStage.WELCOME)} />;
        
      default:
        return <div>Loading...</div>;
    }
  };

  // Navigation Bar Component
  const renderNavBar = () => {
    // Only show nav bar during main game stages (including intro and game over)
    if (stage === GameStage.WELCOME || stage === GameStage.ADMIN_LOGIN || stage === GameStage.ADMIN_DASHBOARD) return null;

    const currentLevel = getLevelNumber(stage);
    const isIntro = stage === GameStage.STORY_INTRO;
    const isGameOver = stage === GameStage.GAME_OVER;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setStage(GameStage.WELCOME)}
          className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <Home size={20} className="mr-1" />
          <span className="text-sm font-bold">首页</span>
        </button>

        <div className="flex space-x-2">
          {!isIntro && (
            <button 
              onClick={moveToPrevStage}
              className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span className="text-sm">上一关</span>
            </button>
          )}

          {!isGameOver && (
            <button 
              onClick={moveToNextStage}
              className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm"
            >
              <span className="text-sm">下一关</span>
              <ArrowRight size={20} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 relative">
       {/* Top Bar */}
       {stage !== GameStage.WELCOME && stage !== GameStage.ADMIN_LOGIN && stage !== GameStage.ADMIN_DASHBOARD && stage !== GameStage.STORY_INTRO && stage !== GameStage.GAME_OVER && (
         <div className="bg-indigo-700 text-white px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
           <div className="font-bold flex items-center"><Menu size={18} className="mr-2 opacity-50"/> 色彩守护者: {student?.name}</div>
           <div className="bg-indigo-900 px-3 py-1 rounded text-sm font-mono">积分: {student?.total_score || 0}</div>
         </div>
       )}
       
       <div className="pb-16">
         {renderContent()}
       </div>

       {renderNavBar()}
    </div>
  );
}

export default App;
