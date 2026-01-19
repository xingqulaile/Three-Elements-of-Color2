import React from 'react';
import { Palette, ChevronDown } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (name: string, className: string) => Promise<void>;
  onAdmin: () => void;
}

// Highly Detailed Kingdom Landscape Component
const KingdomLandscape: React.FC<{ variant: 'color' | 'grayscale' }> = ({ variant }) => {
  const isGray = variant === 'grayscale';
  
  // Advanced Palette
  const p = {
    skyTop: isGray ? '#9ca3af' : '#0ea5e9', // Deep Sky Blue
    skyMid: isGray ? '#d1d5db' : '#60a5fa', // Blue 400
    skyBot: isGray ? '#f3f4f6' : '#c084fc', // Purple tint at horizon
    sun: isGray ? '#e5e7eb' : '#fbbf24', 
    sunCore: isGray ? '#f3f4f6' : '#fffbeb',
    cloudBase: isGray ? '#e5e7eb' : '#ffffff',
    cloudShadow: isGray ? '#d1d5db' : '#e0f2fe',
    mtnFar: isGray ? '#6b7280' : '#4f46e5', // Indigo 600
    mtnMid: isGray ? '#4b5563' : '#7c3aed', // Violet 600
    mtnClose: isGray ? '#374151' : '#2563eb', // Blue 600
    snow: '#ffffff',
    hillFar: isGray ? '#4b5563' : '#059669', // Emerald 600
    hillClose: isGray ? '#1f2937' : '#16a34a', // Green 600
    water: isGray ? '#9ca3af' : '#38bdf8', // Sky 400
    waterDeep: isGray ? '#6b7280' : '#0284c7', // Sky 600
    waterSparkle: isGray ? '#e5e7eb' : '#ffffff',
    castleBase: isGray ? '#e5e7eb' : '#f8fafc', // Slate 50
    castleShadow: isGray ? '#9ca3af' : '#cbd5e1', // Slate 300
    roof: isGray ? '#1f2937' : '#db2777', // Pink 600
    roofShadow: isGray ? '#111827' : '#be185d', // Pink 700
    flag: isGray ? '#374151' : '#facc15', // Yellow
    treeDark: isGray ? '#111827' : '#14532d', // Green 900
    treeLight: isGray ? '#1f2937' : '#166534', // Green 800
    door: isGray ? '#111827' : '#451a03',
  };

  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <linearGradient id={`skyComplex-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.skyTop} />
          <stop offset="60%" stopColor={p.skyMid} />
          <stop offset="100%" stopColor={p.skyBot} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* 1. Sky Background */}
      <rect width="800" height="600" fill={`url(#skyComplex-${variant})`} />

      {/* 2. Celestial Bodies */}
      <circle cx="720" cy="80" r="50" fill={p.sun} opacity={isGray ? 0.3 : 0.8} />
      <circle cx="720" cy="80" r="35" fill={p.sunCore} opacity={isGray ? 0.5 : 1} filter="url(#glow)" />

      {/* 3. Clouds (Layered) */}
      <g opacity="0.8">
        <path d="M100,100 Q130,70 160,100 T220,100 L220,130 H100 Z" fill={p.cloudBase} />
        <path d="M120,130 Q150,110 180,130" fill="none" stroke={p.cloudShadow} strokeWidth="2" />
        
        <path d="M550,60 Q590,20 630,60 T700,60 L700,100 H550 Z" fill={p.cloudBase} />
        <path d="M300,150 Q340,120 380,150 T450,150 L450,180 H300 Z" fill={p.cloudBase} opacity="0.6" />
      </g>

      {/* 4. Mountains (Back to Front) */}
      {/* Range 1 */}
      <path d="M-50,600 L200,250 L450,600 Z" fill={p.mtnFar} />
      <path d="M200,250 L240,320 L200,300 L160,320 Z" fill={p.snow} opacity="0.8" />
      
      {/* Range 2 */}
      <path d="M500,600 L700,200 L900,600 Z" fill={p.mtnMid} />
      <path d="M700,200 L750,280 L700,260 L650,280 Z" fill={p.snow} opacity="0.9" />

      {/* Range 3 (Closest) */}
      <path d="M250,600 L450,300 L650,600 Z" fill={p.mtnClose} />
      <path d="M450,300 L490,360 L450,340 L410,360 Z" fill={p.snow} />

      {/* 5. Landscape Base */}
      {/* Rolling Hills Background */}
      <path d="M0,450 C200,400 600,400 800,450 V600 H0 Z" fill={p.hillFar} />
      
      {/* River (Perspective) */}
      <path d="M380,450 C420,450 450,480 550,600 H250 C350,480 360,450 380,450 Z" fill={p.water} />
      <path d="M380,450 C420,450 450,480 550,600 H400 C400,550 380,500 380,450 Z" fill={p.waterDeep} opacity="0.3" />
      {/* Sparkles */}
      {!isGray && (
        <g fill={p.waterSparkle}>
           <circle cx="400" cy="500" r="2" opacity="0.8"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
           <circle cx="450" cy="550" r="3" opacity="0.6"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></circle>
           <circle cx="350" cy="580" r="2" opacity="0.7"><animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"/></circle>
        </g>
      )}

      {/* 6. The Castle (Complex) */}
      <g transform="translate(350, 320) scale(0.8)">
        {/* Base Foundation */}
        <rect x="-20" y="100" width="140" height="20" fill={p.castleShadow} />
        
        {/* Main Tower Center */}
        <rect x="20" y="40" width="60" height="80" fill={p.castleBase} />
        <rect x="25" y="40" width="5" height="80" fill={p.castleShadow} opacity="0.3" /> {/* Texture */}
        <rect x="70" y="40" width="5" height="80" fill={p.castleShadow} opacity="0.3" />
        
        {/* Center Roof */}
        <path d="M10,40 L50,-10 L90,40 Z" fill={p.roof} />
        <path d="M10,40 L50,-10 L50,40 Z" fill={p.roofShadow} opacity="0.2" /> 
        
        {/* Left Tower */}
        <rect x="-10" y="60" width="30" height="60" fill={p.castleBase} />
        <path d="M-20,60 L5,20 L30,60 Z" fill={p.roof} />
        
        {/* Right Tower */}
        <rect x="80" y="60" width="30" height="60" fill={p.castleBase} />
        <path d="M70,60 L95,20 L120,60 Z" fill={p.roof} />
        
        {/* Gate & Windows */}
        <path d="M35,120 L35,90 Q50,80 65,90 L65,120 Z" fill={p.door} />
        <rect x="40" y="55" width="20" height="25" rx="10" fill={p.skyMid} />
        <rect x="0" y="70" width="10" height="15" rx="5" fill={p.skyMid} />
        <rect x="90" y="70" width="10" height="15" rx="5" fill={p.skyMid} />

        {/* Flags */}
        <path d="M50,-10 L50,-40 L80,-25 L50,-10" fill={p.flag} />
        <line x1="50" y1="-10" x2="50" y2="-40" stroke="#333" strokeWidth="2"/>
        
        <path d="M5,20 L5,0 L25,10 L5,20" fill={p.flag} transform="scale(0.8) translate(0,0)" />
        <line x1="5" y1="20" x2="5" y2="0" stroke="#333" strokeWidth="2"/>
      </g>

      {/* 7. Foreground Elements */}
      <path d="M0,600 C100,500 300,550 350,600 Z" fill={p.hillClose} />
      <path d="M800,600 C700,500 500,550 450,600 Z" fill={p.hillClose} />

      {/* Trees Left */}
      <g transform="translate(50, 520)">
         <path d="M0,0 L20,-60 L40,0 Z" fill={p.treeDark} />
         <path d="M0,-20 L20,-70 L40,-20 Z" fill={p.treeLight} />
         <path d="M5,-40 L20,-80 L35,-40 Z" fill={p.treeDark} />
      </g>
      <g transform="translate(10, 550) scale(0.8)">
         <path d="M0,0 L20,-60 L40,0 Z" fill={p.treeLight} />
         <path d="M0,-20 L20,-70 L40,-20 Z" fill={p.treeDark} />
      </g>

      {/* Trees Right */}
      <g transform="translate(700, 530)">
         <circle cx="20" cy="-20" r="30" fill={p.treeDark} />
         <circle cx="40" cy="-10" r="25" fill={p.treeLight} />
         <circle cx="0" cy="-10" r="25" fill={p.treeLight} />
         <rect x="15" y="0" width="10" height="20" fill="#3f2c22" />
      </g>

      {/* Birds */}
      <g stroke={isGray ? '#333' : '#1e3a8a'} strokeWidth="2" fill="none">
        <path d="M600,150 Q610,140 620,150" />
        <path d="M620,150 Q630,140 640,150" />
        
        <path d="M630,130 Q640,120 650,130" transform="scale(0.8) translate(150, 30)" />
        <path d="M650,130 Q660,120 670,130" transform="scale(0.8) translate(150, 30)" />
      </g>

    </svg>
  );
};

const GRADES = [
  '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
  '七年级', '八年级', '九年级',
  '高一', '高二', '高三'
];

const CLASSES = Array.from({ length: 20 }, (_, i) => i + 1);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onAdmin }) => {
  const [name, setName] = React.useState('');
  // Defaults
  const [selectedGrade, setSelectedGrade] = React.useState('七年级');
  const [selectedClassNum, setSelectedClassNum] = React.useState('1');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selectedGrade && selectedClassNum) {
      setLoading(true);
      const fullClassName = `${selectedGrade}(${selectedClassNum})班`;
      try {
        await onStart(name, fullClassName);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Split (Vertical) */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top: Colorful World */}
        <div className="w-full h-1/2 relative border-b-4 border-white/30 z-0 overflow-hidden">
          <KingdomLandscape variant="color" />
        </div>
        
        {/* Bottom: Grayscale World */}
        <div className="w-full h-1/2 relative z-0 overflow-hidden">
          <KingdomLandscape variant="grayscale" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-4 border-white/50">
          <div className="flex justify-center mb-6 -mt-16">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-full text-white shadow-lg ring-4 ring-white transform transition-transform hover:scale-110">
              <Palette size={56} />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            色彩王国：守护者之旅
          </h1>
          <p className="text-center text-gray-600 mb-8 font-medium">
            色彩被偷走了！世界一半陷入黑白。<br/>
            我们需要你找回色彩的三要素。
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">守护者姓名</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="请输入你的名字"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">年级</label>
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                  >
                    {GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">班级</label>
                <div className="relative">
                  <select
                    value={selectedClassNum}
                    onChange={(e) => setSelectedClassNum(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                  >
                     {CLASSES.map(c => (
                      <option key={c} value={c}>{c} 班</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl shadow-lg text-lg font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {loading ? '正在连接王国...' : '开启冒险，拯救色彩！'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onAdmin} className="text-xs text-gray-400 hover:text-indigo-600 font-medium transition-colors">
              教师管理后台
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
