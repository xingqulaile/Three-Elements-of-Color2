import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Star, Award, RotateCcw } from 'lucide-react';
import { Student } from '../types';

interface ScoreboardProps {
  student: Student;
  onRestart: () => void;
}

// Reusing the highly detailed SVG Component for consistency
const KingdomLandscape: React.FC<{ variant: 'color' | 'grayscale' }> = ({ variant }) => {
  const isGray = variant === 'grayscale';
  
  // Advanced Palette (Same as WelcomeScreen)
  const p = {
    skyTop: isGray ? '#9ca3af' : '#0ea5e9',
    skyMid: isGray ? '#d1d5db' : '#60a5fa',
    skyBot: isGray ? '#f3f4f6' : '#c084fc',
    sun: isGray ? '#e5e7eb' : '#fbbf24', 
    sunCore: isGray ? '#f3f4f6' : '#fffbeb',
    cloudBase: isGray ? '#e5e7eb' : '#ffffff',
    cloudShadow: isGray ? '#d1d5db' : '#e0f2fe',
    mtnFar: isGray ? '#6b7280' : '#4f46e5',
    mtnMid: isGray ? '#4b5563' : '#7c3aed',
    mtnClose: isGray ? '#374151' : '#2563eb',
    snow: '#ffffff',
    hillFar: isGray ? '#4b5563' : '#059669',
    hillClose: isGray ? '#1f2937' : '#16a34a',
    water: isGray ? '#9ca3af' : '#38bdf8',
    waterDeep: isGray ? '#6b7280' : '#0284c7',
    waterSparkle: isGray ? '#e5e7eb' : '#ffffff',
    castleBase: isGray ? '#e5e7eb' : '#f8fafc',
    castleShadow: isGray ? '#9ca3af' : '#cbd5e1',
    roof: isGray ? '#1f2937' : '#db2777',
    roofShadow: isGray ? '#111827' : '#be185d',
    flag: isGray ? '#374151' : '#facc15',
    treeDark: isGray ? '#111827' : '#14532d',
    treeLight: isGray ? '#1f2937' : '#166534',
    door: isGray ? '#111827' : '#451a03',
  };

  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <linearGradient id={`skyComplex-${variant}-end`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.skyTop} />
          <stop offset="60%" stopColor={p.skyMid} />
          <stop offset="100%" stopColor={p.skyBot} />
        </linearGradient>
        <filter id="glow-end">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="800" height="600" fill={`url(#skyComplex-${variant}-end)`} />

      <circle cx="720" cy="80" r="50" fill={p.sun} opacity={isGray ? 0.3 : 0.8} />
      <circle cx="720" cy="80" r="35" fill={p.sunCore} opacity={isGray ? 0.5 : 1} filter="url(#glow-end)" />

      <g opacity="0.8">
        <path d="M100,100 Q130,70 160,100 T220,100 L220,130 H100 Z" fill={p.cloudBase} />
        <path d="M120,130 Q150,110 180,130" fill="none" stroke={p.cloudShadow} strokeWidth="2" />
        
        <path d="M550,60 Q590,20 630,60 T700,60 L700,100 H550 Z" fill={p.cloudBase} />
        <path d="M300,150 Q340,120 380,150 T450,150 L450,180 H300 Z" fill={p.cloudBase} opacity="0.6" />
      </g>

      <path d="M-50,600 L200,250 L450,600 Z" fill={p.mtnFar} />
      <path d="M200,250 L240,320 L200,300 L160,320 Z" fill={p.snow} opacity="0.8" />
      
      <path d="M500,600 L700,200 L900,600 Z" fill={p.mtnMid} />
      <path d="M700,200 L750,280 L700,260 L650,280 Z" fill={p.snow} opacity="0.9" />

      <path d="M250,600 L450,300 L650,600 Z" fill={p.mtnClose} />
      <path d="M450,300 L490,360 L450,340 L410,360 Z" fill={p.snow} />

      <path d="M0,450 C200,400 600,400 800,450 V600 H0 Z" fill={p.hillFar} />
      
      <path d="M380,450 C420,450 450,480 550,600 H250 C350,480 360,450 380,450 Z" fill={p.water} />
      <path d="M380,450 C420,450 450,480 550,600 H400 C400,550 380,500 380,450 Z" fill={p.waterDeep} opacity="0.3" />
      {!isGray && (
        <g fill={p.waterSparkle}>
           <circle cx="400" cy="500" r="2" opacity="0.8"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
           <circle cx="450" cy="550" r="3" opacity="0.6"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle>
           <circle cx="350" cy="580" r="2" opacity="0.7"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/></circle>
        </g>
      )}

      <g transform="translate(350, 320) scale(0.8)">
        <rect x="-20" y="100" width="140" height="20" fill={p.castleShadow} />
        
        <rect x="20" y="40" width="60" height="80" fill={p.castleBase} />
        <rect x="25" y="40" width="5" height="80" fill={p.castleShadow} opacity="0.3" /> 
        <rect x="70" y="40" width="5" height="80" fill={p.castleShadow} opacity="0.3" />
        
        <path d="M10,40 L50,-10 L90,40 Z" fill={p.roof} />
        <path d="M10,40 L50,-10 L50,40 Z" fill={p.roofShadow} opacity="0.2" /> 
        
        <rect x="-10" y="60" width="30" height="60" fill={p.castleBase} />
        <path d="M-20,60 L5,20 L30,60 Z" fill={p.roof} />
        
        <rect x="80" y="60" width="30" height="60" fill={p.castleBase} />
        <path d="M70,60 L95,20 L120,60 Z" fill={p.roof} />
        
        <path d="M35,120 L35,90 Q50,80 65,90 L65,120 Z" fill={p.door} />
        <rect x="40" y="55" width="20" height="25" rx="10" fill={p.skyMid} />
        <rect x="0" y="70" width="10" height="15" rx="5" fill={p.skyMid} />
        <rect x="90" y="70" width="10" height="15" rx="5" fill={p.skyMid} />

        <path d="M50,-10 L50,-40 L80,-25 L50,-10" fill={p.flag} />
        <line x1="50" y1="-10" x2="50" y2="-40" stroke="#333" strokeWidth="2"/>
        
        <path d="M5,20 L5,0 L25,10 L5,20" fill={p.flag} transform="scale(0.8) translate(0,0)" />
        <line x1="5" y1="20" x2="5" y2="0" stroke="#333" strokeWidth="2"/>
      </g>

      <path d="M0,600 C100,500 300,550 350,600 Z" fill={p.hillClose} />
      <path d="M800,600 C700,500 500,550 450,600 Z" fill={p.hillClose} />

      <g transform="translate(50, 520)">
         <path d="M0,0 L20,-60 L40,0 Z" fill={p.treeDark} />
         <path d="M0,-20 L20,-70 L40,-20 Z" fill={p.treeLight} />
         <path d="M5,-40 L20,-80 L35,-40 Z" fill={p.treeDark} />
      </g>
      <g transform="translate(10, 550) scale(0.8)">
         <path d="M0,0 L20,-60 L40,0 Z" fill={p.treeLight} />
         <path d="M0,-20 L20,-70 L40,-20 Z" fill={p.treeDark} />
      </g>

      <g transform="translate(700, 530)">
         <circle cx="20" cy="-20" r="30" fill={p.treeDark} />
         <circle cx="40" cy="-10" r="25" fill={p.treeLight} />
         <circle cx="0" cy="-10" r="25" fill={p.treeLight} />
         <rect x="15" y="0" width="10" height="20" fill="#3f2c22" />
      </g>

      <g stroke={isGray ? '#333' : '#1e3a8a'} strokeWidth="2" fill="none">
        <path d="M600,150 Q610,140 620,150" />
        <path d="M620,150 Q630,140 640,150" />
        
        <path d="M630,130 Q640,120 650,130" transform="scale(0.8) translate(150, 30)" />
        <path d="M650,130 Q660,120 670,130" transform="scale(0.8) translate(150, 30)" />
      </g>

    </svg>
  );
};

const Scoreboard: React.FC<ScoreboardProps> = ({ student, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [restored, setRestored] = useState(false);

  // Confetti Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 150;
    const colors = ['#ffffff', '#fbbf24', '#f472b6', '#c084fc', '#60a5fa'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 1,
        angle: Math.random() * 2 * Math.PI,
        spin: Math.random() * 0.2 - 0.1
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.y += p.speed;
        p.angle += p.spin;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(animate);
    }
    animate();

    // Trigger restoration animation shortly after load
    setTimeout(() => setRestored(true), 500);

  }, []);

  return (
    // Changed bg-gray-900 to a vibrant aurora gradient
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-10">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 w-full max-w-2xl px-4">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">
            色彩王国已复原！
          </h1>
          <p className="text-indigo-100 text-lg font-medium">感谢守护者 <span className="font-bold text-yellow-300 text-xl">{student.name}</span> 的英勇表现</p>
        </div>

        {/* Visual Restoration Card */}
        <div className="bg-white/95 backdrop-blur rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 mb-8 relative group">
           {/* The Image Container */}
           <div className="h-56 md:h-72 relative w-full bg-gray-200">
               {/* Grayscale Version (Background) */}
               <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                  <KingdomLandscape variant="grayscale" />
               </div>

               {/* Color Version (Foreground, animated width) */}
               <div 
                 className="absolute inset-0 overflow-hidden transition-all duration-[2000ms] ease-in-out border-r-4 border-white shadow-2xl"
                 style={{ width: restored ? '100%' : '0%' }}
               >
                 <div className="w-full h-full bg-sky-200 relative" style={{ width: '100%' }}>
                    {/* Fixed container width to prevent squashing during transition */}
                    <div className="w-full h-full" style={{ width: '672px' }}> 
                       <KingdomLandscape variant="color" />
                    </div>
                 </div>
               </div>

               {/* Label */}
               <div className="absolute bottom-4 right-4 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-bold shadow-lg border border-white/30">
                 {restored ? "王国色彩 100% 恢复" : "正在恢复色彩..."}
               </div>
           </div>
           
           <div className="p-6 bg-white text-center">
              <div className="flex justify-center items-center mb-4">
                 <div className="bg-yellow-100 p-4 rounded-full ring-4 ring-yellow-50 shadow-inner">
                    <Trophy className="text-yellow-500 w-12 h-12" />
                 </div>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">最终得分</p>
              <p className="text-6xl font-black text-indigo-900 mb-6">{student.total_score}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center">
                   <Star className="text-yellow-400 fill-yellow-400 w-8 h-8 mb-1" />
                   <span className="font-bold text-indigo-900">色彩大师</span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100 flex flex-col items-center">
                   <Award className="text-purple-400 fill-purple-200 w-8 h-8 mb-1" />
                   <span className="font-bold text-purple-900">完美通关</span>
                </div>
              </div>

              <button 
                onClick={onRestart}
                className="w-full group relative bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                   <RotateCcw className="mr-2 group-hover:rotate-180 transition-transform duration-500" /> 再次挑战
                </span>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Scoreboard;
