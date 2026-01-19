import React, { useState, useEffect } from 'react';
import { HSL } from '../types';
import ColorSlider from './ColorSlider';
import { HelpCircle, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { LEVEL_CONFIG } from '../constants';

interface GameLevelProps {
  levelNumber: number;
  onComplete: (success: boolean, stats: { attempts: number, timeSpent: number, hintsUsed: number, score: number, finalColor: HSL, targetColor: HSL }) => void;
}

const GameLevel: React.FC<GameLevelProps> = ({ levelNumber, onComplete }) => {
  // Target color setup
  const [target, setTarget] = useState<HSL>({ h: 0, s: 0, l: 0 });
  const [current, setCurrent] = useState<HSL>({ h: 0, s: 0, l: 50 }); // Start gray
  
  // Stats
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showLearning, setShowLearning] = useState(true); // Show learning first
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const config = LEVEL_CONFIG[levelNumber as keyof typeof LEVEL_CONFIG];

  // Initialize Level
  useEffect(() => {
    let newTarget: HSL = { h: 0, s: 50, l: 50 };
    
    switch(levelNumber) {
      case 1: // Hue only
        newTarget = { h: Math.floor(Math.random() * 360), s: 70, l: 50 };
        setCurrent({ h: 0, s: 70, l: 50 }); // Fixed S/L for user
        break;
      case 2: // Value only
        newTarget = { h: 200, s: 70, l: Math.floor(Math.random() * 80) + 10 };
        setCurrent({ h: 200, s: 70, l: 50 }); // Fixed H/S for user
        break;
      case 3: // Saturation only
        newTarget = { h: 340, s: Math.floor(Math.random() * 90) + 10, l: 50 };
        setCurrent({ h: 340, s: 0, l: 50 }); // Fixed H/L
        break;
      case 4: // Combined
        newTarget = { 
          h: Math.floor(Math.random() * 360), 
          s: Math.floor(Math.random() * 80) + 20, 
          l: Math.floor(Math.random() * 60) + 20 
        };
        setCurrent({ h: 0, s: 50, l: 50 });
        break;
    }
    setTarget(newTarget);
    setShowLearning(true); // Always show theory first
    setIsSuccess(false);
    setAttempts(0);
    setHintsUsed(0);
    setFeedbackMsg('');
    setShowHint(false);
  }, [levelNumber]);

  const checkResult = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const hDiff = Math.abs(target.h - current.h);
    // Handle wrap around for Hue (e.g. 359 vs 1)
    const hDiffWrapped = Math.min(hDiff, 360 - hDiff);
    
    const sDiff = Math.abs(target.s - current.s);
    const lDiff = Math.abs(target.l - current.l);

    const passed = 
      hDiffWrapped <= config.tolerance.h && 
      sDiff <= config.tolerance.s && 
      lDiff <= config.tolerance.l;

    if (passed) {
      setIsSuccess(true);
      setFeedbackMsg('success');
    } else {
      setFeedbackMsg('fail');
      // Auto-show hint area if failed
      setShowHint(true); 
      setTimeout(() => setFeedbackMsg(''), 2000);
    }
  };

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    // Simple scoring: Base 100 - (attempts * 5) - (time/10) - (hints*10)
    let score = 100 - (attempts * 5) - Math.floor(timeSpent / 10) - (hintsUsed * 10);
    if (score < 10) score = 10;
    
    onComplete(true, {
      attempts: attempts,
      timeSpent,
      hintsUsed,
      score,
      finalColor: current,
      targetColor: target
    });
  };

  const hslString = (c: HSL) => `hsl(${c.h}, ${c.s}%, ${c.l}%)`;

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20"> 
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-indigo-800">{config.title}</h2>
          <p className="text-gray-600 text-sm md:text-base">{config.description}</p>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
           <button 
             onClick={() => setShowLearning(true)}
             className="flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
           >
             <BookOpen size={18} /> <span>知识点</span>
           </button>
           <button 
             onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }}
             className="flex items-center justify-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
           >
             <HelpCircle size={18} /> <span>提示</span>
           </button>
        </div>
      </div>

      {/* Learning Modal */}
      {showLearning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl border-2 border-indigo-100 transform transition-all scale-100">
            <h3 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center">
              <BookOpen className="mr-2" /> 色彩知识站
            </h3>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed font-medium">{config.learning}</p>
            
            {/* Visual Aid */}
            <div className="p-1 bg-gray-100 rounded-lg mb-6">
              {levelNumber === 1 && (
                <div className="h-6 w-full rounded shadow-inner" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}></div>
              )}
              {levelNumber === 2 && (
                <div className="h-6 w-full rounded shadow-inner" style={{ background: `linear-gradient(to right, black, hsl(${target.h}, ${target.s}%, 50%), white)` }}></div>
              )}
              {levelNumber === 3 && (
                <div className="h-6 w-full rounded shadow-inner" style={{ background: `linear-gradient(to right, hsl(${target.h}, 0%, 50%), hsl(${target.h}, 100%, 50%))` }}></div>
              )}
            </div>

            <button 
              onClick={() => setShowLearning(false)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg transition-transform hover:scale-[1.02]"
            >
              我明白了！
            </button>
          </div>
        </div>
      )}

      {/* Hint Box */}
      {showHint && (
        <div className="bg-yellow-50 border-l-8 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
          <p className="text-yellow-900 font-bold text-lg">{config.hint}</p>
          {attempts > 0 && !isSuccess && (
             <div className="mt-3 bg-white p-4 rounded-lg border border-yellow-200 shadow-inner flex flex-col md:flex-row items-center justify-between">
               <p className="text-red-500 font-bold mb-2 md:mb-0">加油！参考正确数值：</p>
               <div className="flex space-x-4 font-mono text-gray-800 bg-gray-100 px-4 py-2 rounded font-bold">
                 {config.tolerance.h < 360 && <span>H: {target.h}</span>}
                 {config.tolerance.s < 100 && <span>S: {target.s}</span>}
                 {config.tolerance.l < 100 && <span>L: {target.l}</span>}
               </div>
             </div>
          )}
        </div>
      )}

      {/* Game Area */}
      <div className="grid md:grid-cols-2 gap-8 mb-8 items-start">
        
        {/* Colors Display - SIGNIFICANTLY LARGER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center group">
              <span className="mb-3 font-bold text-gray-500 uppercase tracking-wide">目标颜色</span>
              <div 
                className="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-xl border-8 border-white ring-4 ring-gray-100 transition-transform group-hover:scale-105"
                style={{ backgroundColor: hslString(target) }}
              ></div>
            </div>
            
            <div className="hidden sm:block text-gray-300">
              <ArrowRight size={32} />
            </div>

            <div className="flex flex-col items-center group">
              <span className="mb-3 font-bold text-indigo-500 uppercase tracking-wide">你的调色</span>
              <div 
                className="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-xl border-8 border-white ring-4 ring-indigo-100 transition-all duration-200 group-hover:scale-105"
                style={{ backgroundColor: hslString(current) }}
              ></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-indigo-50 flex flex-col justify-center h-full">
          {isSuccess ? (
             <div className="text-center py-6 animate-pulse flex flex-col items-center justify-center h-full">
               <div className="bg-green-100 p-4 rounded-full mb-4">
                 <CheckCircle className="text-green-500 w-16 h-16" />
               </div>
               <h3 className="text-3xl font-black text-green-600 mb-2">完美匹配！</h3>
               <p className="text-gray-500 mb-8 font-medium">色彩能量已收集</p>
               <button
                 onClick={handleNext}
                 className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-emerald-700 flex items-center justify-center text-xl transition-transform hover:scale-[1.02]"
               >
                 进入下一关 <ArrowRight className="ml-2" />
               </button>
             </div>
          ) : (
            <div className="space-y-6">
              {(levelNumber === 1 || levelNumber === 4) && (
                <ColorSlider 
                  label="色相 (Hue)" 
                  value={current.h} 
                  min={0} max={360} 
                  onChange={(v) => setCurrent({...current, h: v})}
                  gradient="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
                />
              )}
              
              {(levelNumber === 2 || levelNumber === 4) && (
                 <ColorSlider 
                 label="明度 (Value)" 
                 value={current.l} 
                 min={0} max={100} 
                 onChange={(v) => setCurrent({...current, l: v})}
                 gradient={`linear-gradient(to right, black, hsl(${current.h}, ${current.s}%, 50%), white)`}
               />
              )}

              {(levelNumber === 3 || levelNumber === 4) && (
                 <ColorSlider 
                 label="纯度 (Saturation)" 
                 value={current.s} 
                 min={0} max={100} 
                 onChange={(v) => setCurrent({...current, s: v})}
                 gradient={`linear-gradient(to right, hsl(${current.h}, 0%, ${current.l}%), hsl(${current.h}, 100%, ${current.l}%))`}
               />
              )}

              <div className="mt-8 relative">
                <button
                  onClick={checkResult}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-indigo-700 transition-all transform active:scale-95"
                >
                  确认调色
                </button>
                {/* Temporary Fail Feedback inline */}
                {feedbackMsg === 'fail' && (
                  <div className="absolute -top-12 left-0 right-0 text-center animate-bounce">
                    <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold shadow-sm border border-red-200">
                      再试一次！颜色不太对哦
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLevel;
