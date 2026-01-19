import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Cell, AreaChart, Area
} from 'recharts';
import { 
  Download, Trash2, LogOut, Search, Filter, CheckSquare, Square, 
  Users, UserCheck, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Image as ImageIcon,
  ZoomIn, Columns, X, Maximize2, Minimize2, Activity, Eye, Home, Lightbulb, Zap, BarChart2, LayoutGrid
} from 'lucide-react';
import { ADMIN_USER, ADMIN_PASS } from '../constants';
import * as GameService from '../services/gameService';
import { Student, Artwork, GameRecord } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
}

// Color Palette for Charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View State
  const [activeTab, setActiveTab] = useState<'overview' | 'monitor' | 'students' | 'gallery'>('overview');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student, direction: 'asc' | 'desc' } | null>({ key: 'total_score', direction: 'desc' });
  
  // Modal States
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState<string | null>(null);
  const [viewingArt, setViewingArt] = useState<Artwork | null>(null); // For Lightbox
  const [selectedArtIds, setSelectedArtIds] = useState<Set<string>>(new Set()); // For Gallery Selection
  const [comparingArts, setComparingArts] = useState<Artwork[] | null>(null); // For Compare Modal

  // --- Auth & Data Loading ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('用户名或密码错误');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const sData = await GameService.fetchAllStudents();
      const aData = await GameService.fetchArtworks();
      const rData = await GameService.fetchAllGameRecords();
      setStudents(sData || []);
      setArtworks(aData || []);
      setRecords(rData || []);
    } catch (error) {
      console.error(error);
      alert('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  // --- Derived Metrics ---

  const classNames = useMemo(() => {
    const classes = new Set(students.map(s => s.class_name));
    return Array.from(classes).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = [...students];
    // Filter Class
    if (filterClass !== 'all') {
      result = result.filter(s => s.class_name === filterClass);
    }
    // Filter Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(lower) || s.class_name.toLowerCase().includes(lower));
    }
    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || 0;
        const valB = b[sortConfig.key] || 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [students, filterClass, searchTerm, sortConfig]);

  // Advanced: Class Comparison Stats
  const classComparisonData = useMemo(() => {
    const stats: Record<string, { totalScore: number, count: number, name: string }> = {};
    students.forEach(s => {
      if (!stats[s.class_name]) stats[s.class_name] = { totalScore: 0, count: 0, name: s.class_name };
      stats[s.class_name].totalScore += s.total_score || 0;
      stats[s.class_name].count += 1;
    });
    return Object.values(stats).map(item => ({
      name: item.name,
      avgScore: Math.round(item.totalScore / item.count),
      studentCount: item.count
    }));
  }, [students]);

  // Advanced: Level Difficulty Analysis
  const levelDifficultyData = useMemo(() => {
    const levels = [1, 2, 3, 4];
    const names = ['色相', '明度', '纯度', '综合'];
    return levels.map((lvl, index) => {
      const lvlRecords = records.filter(r => r.level_number === lvl);
      if (lvlRecords.length === 0) return { name: names[index], errorRate: 0 };
      
      const failed = lvlRecords.filter(r => !r.is_correct || r.attempts > 1).length;
      return {
        name: names[index],
        errorRate: Math.round((failed / lvlRecords.length) * 100)
      };
    });
  }, [records]);

  // Advanced: AI Insights Generation
  const aiInsights = useMemo(() => {
    const insights = [];
    if (students.length === 0) return ["暂无数据，请等待学生加入..."];

    // 1. Difficulty Spotting
    const levelFailures: Record<number, number> = {1:0, 2:0, 3:0, 4:0};
    let totalAttempts = 0;
    records.forEach(r => {
      if (r.level_number <= 4) {
        if (!r.is_correct || r.attempts > 1) levelFailures[r.level_number]++;
        totalAttempts++;
      }
    });
    const hardestLevel = Object.entries(levelFailures).sort((a,b) => b[1] - a[1])[0];
    const levelNames = ['', '色相', '明度', '纯度', '综合'];
    if (hardestLevel) {
       insights.push(`🔴 **教学预警**：全班在 **[${levelNames[Number(hardestLevel[0])]}]** 环节错误率最高，建议下节课重点复习该知识点。`);
    }

    // 2. High Performers
    const perfectStudents = students.filter(s => s.total_score >= 380); // Assuming ~400 max
    if (perfectStudents.length > 0) {
      insights.push(`🏆 **培优建议**：${perfectStudents.length} 名同学表现卓越（${perfectStudents[0].name}等），可邀请他们担任小组长。`);
    }

    // 3. Struggling Students
    const struggling = students.filter(s => s.total_score < 200 && s.completed);
    if (struggling.length > 0) {
       insights.push(`🆘 **干预提醒**：有 ${struggling.length} 名同学已完成但分数较低，可能对基础概念存在误解。`);
    }

    // 4. Speed Analysis
    const avgTime = records.reduce((acc, r) => acc + r.time_spent, 0) / (records.length || 1);
    if (avgTime > 60) {
       insights.push(`⏱️ **节奏把控**：平均答题时间较长（${Math.round(avgTime)}秒/关），建议引导学生掌握更高效的调色技巧。`);
    } else {
       insights.push(`⚡ **效率分析**：学生操作非常流畅，平均用时仅 ${Math.round(avgTime)}秒/关。`);
    }

    return insights;
  }, [students, records]);

  // --- Handlers ---

  const handleSelectAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id!)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudentIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedStudentIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedStudentIds.size} 名学生记录吗？此操作不可恢复！`)) {
      setLoading(true);
      try {
        await Promise.all(Array.from(selectedStudentIds).map((id) => GameService.deleteStudent(id as string)));
        await loadData();
        setSelectedStudentIds(new Set());
      } catch (e) {
        alert('删除过程中出现错误');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSort = (key: keyof Student) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const exportCSV = () => {
    // Header
    let csv = "\uFEFF姓名,班级,总分,是否完成,第一关(色相),第二关(明度),第三关(纯度),第四关(综合)\n";
    
    filteredStudents.forEach(s => {
      const studentRecords = records.filter(r => r.student_id === s.id);
      const getScore = (lvl: number) => studentRecords.find(r => r.level_number === lvl)?.score || 0;
      
      csv += `"${s.name}","${s.class_name}",${s.total_score},${s.completed ? '是' : '否'},${getScore(1)},${getScore(2)},${getScore(3)},${getScore(4)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `色彩王国成绩单_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Gallery Handlers
  const handleArtSelect = (id: string) => {
    const newSet = new Set(selectedArtIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedArtIds(newSet);
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = () => {
    if (selectedArtIds.size === 0) return;
    const selected = artworks.filter(a => selectedArtIds.has(a.id!));
    
    selected.forEach((art, index) => {
      setTimeout(() => {
        downloadImage(art.image_data, `${art.student_name}_${art.class_name}_作品.png`);
      }, index * 500);
    });
    alert(`已开始下载 ${selected.length} 张图片，请允许浏览器下载多个文件。`);
  };

  const handleCompare = () => {
    if (selectedArtIds.size < 2) return;
    const selected = artworks.filter(a => selectedArtIds.has(a.id!));
    setComparingArts(selected);
  };

  // --- Components ---

  const StudentAnalysisModal = () => {
    if (!selectedStudentForAnalysis) return null;
    const student = students.find(s => s.id === selectedStudentForAnalysis);
    if (!student) return null;

    const studentRecords = records.filter(r => r.student_id === student.id).sort((a,b) => a.level_number - b.level_number);
    
    // 1. Radar Data (Capability)
    const radarData = [1, 2, 3, 4].map(lvl => {
      const r = studentRecords.find(rec => rec.level_number === lvl);
      return {
        subject: lvl === 1 ? '色相' : lvl === 2 ? '明度' : lvl === 3 ? '纯度' : '综合',
        score: r ? r.score : 0,
        fullMark: 100
      };
    });

    // 2. Line Chart Data (Trajectory)
    const lineData = studentRecords.map(r => ({
      name: `关卡${r.level_number}`,
      score: r.score,
      time: r.time_spent
    }));

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Activity className="mr-2 text-indigo-600"/> 学生个性化诊断报告
              </h2>
              <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded">班级: {student.class_name}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">姓名: {student.name}</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">总分: {student.total_score}</span>
              </div>
            </div>
            <button onClick={() => setSelectedStudentForAnalysis(null)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} className="text-gray-500"/>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Charts */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                 <h3 className="font-bold text-gray-700 mb-2 flex items-center"><Zap size={16} className="mr-2 text-yellow-500"/> 能力维度 (雷达图)</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="得分" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <RechartsTooltip />
                      </RadarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                 <h3 className="font-bold text-gray-700 mb-2 flex items-center"><TrendingUp size={16} className="mr-2 text-green-500"/> 学习轨迹 (趋势图)</h3>
                 <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} fontSize={12} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} name="得分" />
                      </LineChart>
                   </ResponsiveContainer>
                 </div>
                 <p className="text-xs text-gray-400 mt-2 text-center">观察曲线走势，评估学生的状态是否稳定。</p>
              </div>
            </div>

            {/* Right Col: Detailed Table & Advice */}
            <div className="flex flex-col h-full">
               <h3 className="font-bold text-gray-700 mb-4">全流程数据明细</h3>
               <div className="overflow-hidden rounded-lg border border-gray-200 flex-1">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">关卡</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">尝试</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">用时</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">提示</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">得分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {[1, 2, 3, 4].map(lvl => {
                        const rec = studentRecords.find(r => r.level_number === lvl);
                        const label = lvl === 1 ? '色相' : lvl === 2 ? '明度' : lvl === 3 ? '纯度' : '综合';
                        return (
                          <tr key={lvl} className={!rec ? 'opacity-50' : ''}>
                             <td className="px-3 py-3 text-sm font-medium text-gray-900">{label}</td>
                             <td className="px-3 py-3 text-sm text-gray-500">{rec ? rec.attempts : '-'}</td>
                             <td className="px-3 py-3 text-sm text-gray-500">{rec ? rec.time_spent+'s' : '-'}</td>
                             <td className="px-3 py-3 text-sm text-gray-500">{rec ? rec.hints_used : '-'}</td>
                             <td className="px-3 py-3 text-sm font-bold text-indigo-600">{rec ? rec.score : '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                 </table>
               </div>
               
               <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm">
                  <h4 className="font-bold mb-2 flex items-center text-yellow-800"><Lightbulb size={18} className="mr-2"/> 智能辅导建议</h4>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                  {studentRecords.some(r => r.score < 60) 
                    ? "⚠️ 该生在基础概念理解上存在薄弱环节。建议：1. 一对一演示色相环的变化规律；2. 鼓励其多使用“提示”功能辅助理解。" 
                    : studentRecords.every(r => r.score > 90)
                      ? "🌟 该生极具天赋，基础非常扎实！建议：引导其在第五关创作中尝试更复杂的色彩搭配（如互补色、邻近色），并展示给全班。"
                      : "✅ 该生掌握情况良好，但在操作效率上还有提升空间。建议多进行几次练习，培养色彩直觉。"}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompareModal = () => {
     if (!comparingArts) return null;
     return (
       <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col z-50 animate-in fade-in">
         <div className="p-4 flex justify-between items-center text-white bg-black/40">
           <h2 className="text-xl font-bold flex items-center"><Columns className="mr-2"/> 作品对比分析</h2>
           <button onClick={() => setComparingArts(null)} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
         </div>
         <div className="flex-1 overflow-auto p-8">
            <div className={`grid gap-8 h-full ${comparingArts.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
              {comparingArts.map(art => (
                <div key={art.id} className="flex flex-col h-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                   <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
                      <img src={art.image_data} className="max-w-full max-h-full object-contain" />
                   </div>
                   <div className="p-4 bg-gray-900 text-white">
                      <div className="font-bold text-lg">{art.student_name}</div>
                      <div className="text-gray-400 text-sm">{art.class_name}</div>
                   </div>
                </div>
              ))}
            </div>
         </div>
       </div>
     );
  };

  const LightboxModal = () => {
    if (!viewingArt) return null;
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-in zoom-in-95 duration-200" onClick={() => setViewingArt(null)}>
         <img 
           src={viewingArt.image_data} 
           className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded"
           onClick={(e) => e.stopPropagation()} 
         />
         <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
            <X size={32} />
         </button>
         <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md text-lg font-bold">
               {viewingArt.student_name} - {viewingArt.class_name}
            </span>
         </div>
      </div>
    );
  };

  // --- Render ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-700">色彩王国</h2>
            <p className="text-gray-500">教师管理后台</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="管理员账号"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                type="password"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">
                安全登录
              </button>
            </div>
          </form>
          <button onClick={onLogout} className="mt-6 text-center w-full text-sm text-gray-500 hover:text-indigo-600">
            返回游戏首页
          </button>
        </div>
      </div>
    );
  }

  const avgScore = students.length > 0 ? Math.round(students.reduce((a, b) => a + (b.total_score || 0), 0) / students.length) : 0;
  const completionRate = students.length > 0 ? Math.round((students.filter(s => s.completed).length / students.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Modals */}
      <StudentAnalysisModal />
      <CompareModal />
      <LightboxModal />

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <BarChart2 size={20} className="text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">色彩三要素 · 智能教学数据中心</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">管理员: {ADMIN_USER}</span>
              <button 
                onClick={onLogout} 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <Home size={16} /> <span>返回首页</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        {/* Sidebar Navigation */}
        <nav className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-6 py-4 border-l-4 transition-all ${activeTab === 'overview' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <TrendingUp size={18} className="mr-3" /> 数据驾驶舱
            </button>
            <button 
              onClick={() => setActiveTab('monitor')}
              className={`w-full flex items-center px-6 py-4 border-l-4 transition-all ${activeTab === 'monitor' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={18} className="mr-3" /> 实时学情监控
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center px-6 py-4 border-l-4 transition-all ${activeTab === 'students' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <Users size={18} className="mr-3" /> 学生档案管理
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center px-6 py-4 border-l-4 transition-all ${activeTab === 'gallery' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <ImageIcon size={18} className="mr-3" /> 创意作品画廊
            </button>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="mt-6 space-y-4 sticky top-[280px]">
             <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
               <div className="text-indigo-100 text-sm mb-1">当前平均分</div>
               <div className="text-3xl font-bold">{avgScore}</div>
               <div className="mt-4 text-indigo-100 text-sm mb-1">班级完成率</div>
               <div className="text-3xl font-bold">{completionRate}%</div>
             </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* AI Insights Panel */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Lightbulb size={120} className="text-yellow-500" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                   <Lightbulb size={20} className="mr-2 text-yellow-500 fill-yellow-500"/> 智能教学助教 (AI Insights)
                 </h3>
                 <div className="grid gap-3">
                    {aiInsights.map((insight, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm border-l-4 border-indigo-500 flex items-start">
                         <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Chart 1: Class Comparison */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <BarChart2 size={18} className="mr-2 text-indigo-500"/> 班级横向对比 (平均分)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis domain={[0, 'dataMax + 50']} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="avgScore" name="平均分" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40}>
                            {classComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Chart 2: Difficulty Analysis */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <AlertTriangle size={18} className="mr-2 text-amber-500"/> 知识点难易度 (错误率)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={levelDifficultyData}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} unit="%" />
                          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="errorRate" name="错误率" fill="#f87171" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* MONITOR TAB (New) */}
          {activeTab === 'monitor' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-800">实时学情看板</h3>
                   <div className="flex space-x-2 text-sm">
                      <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>已完成</span>
                      <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>进行中</span>
                      <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>未开始</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {filteredStudents.map(student => {
                      // Determine status roughly based on score for demo purposes (real implementation would check exact level)
                      const isStarted = student.total_score > 0;
                      const isFinished = student.completed;
                      const statusColor = isFinished ? 'bg-green-50 border-green-200' : isStarted ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200';
                      const textColor = isFinished ? 'text-green-800' : isStarted ? 'text-yellow-800' : 'text-gray-500';

                      return (
                        <div key={student.id} className={`p-4 rounded-xl border-2 ${statusColor} flex flex-col items-center justify-center text-center transition-all hover:shadow-md cursor-pointer`} onClick={() => setSelectedStudentForAnalysis(student.id!)}>
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${isFinished ? 'bg-green-200 text-green-700' : isStarted ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                              {student.name.charAt(0)}
                           </div>
                           <h4 className="font-bold text-gray-900 truncate w-full">{student.name}</h4>
                           <p className="text-xs text-gray-500 mb-2">{student.class_name}</p>
                           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFinished ? 'bg-green-200' : isStarted ? 'bg-yellow-200' : 'bg-gray-200'} ${textColor}`}>
                              {isFinished ? '已通关' : isStarted ? `得分: ${student.total_score}` : '未开始'}
                           </span>
                        </div>
                      )
                   })}
                </div>
             </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full animate-in fade-in duration-300">
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3 flex-1">
                   <div className="relative">
                     <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <input 
                       type="text" 
                       placeholder="搜索姓名..." 
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                     />
                   </div>
                   <div className="relative">
                     <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                     <select 
                        value={filterClass} 
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="all">所有班级</option>
                        {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <div className="flex items-center space-x-2">
                   {selectedStudentIds.size > 0 && (
                     <button 
                       onClick={handleBulkDelete}
                       className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                     >
                       <Trash2 size={16} />
                       <span>删除 ({selectedStudentIds.size})</span>
                     </button>
                   )}
                   <button 
                     onClick={exportCSV}
                     className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                   >
                     <Download size={16} />
                     <span>导出成绩单</span>
                   </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button onClick={handleSelectAll} className="text-gray-400 hover:text-gray-600">
                          {selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                        </button>
                      </th>
                      {[
                        { k: 'name', l: '姓名' }, { k: 'class_name', l: '班级' }, 
                        { k: 'total_score', l: '总分' }, { k: 'completed', l: '状态' }
                      ].map(h => (
                        <th 
                          key={h.k} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort(h.k as keyof Student)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{h.l}</span>
                            {sortConfig?.key === h.k && (
                              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <button onClick={() => handleSelectOne(s.id!)} className="text-gray-400 hover:text-indigo-600">
                            {selectedStudentIds.has(s.id!) ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.class_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{s.total_score}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {s.completed ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                              <UserCheck size={12} className="mr-1 mt-0.5" /> 已完成
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                              进行中
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <button 
                             onClick={() => setSelectedStudentForAnalysis(s.id!)}
                             className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center hover:underline"
                           >
                             <Activity size={16} className="mr-1"/> 详情
                           </button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          没有找到符合条件的学生记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
                <span>共 {filteredStudents.length} 名学生</span>
                <span>已选 {selectedStudentIds.size} 项</span>
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-bold text-gray-800 mr-4">学生创意作品集</h3>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">已选中 {selectedArtIds.size} 张</span>
                  </div>
                  
                  <div className="flex space-x-2">
                     <button 
                        disabled={selectedArtIds.size === 0}
                        onClick={handleBulkDownload}
                        className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedArtIds.size > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                     >
                        <Download size={16} /> <span>批量下载</span>
                     </button>
                     <button 
                        disabled={selectedArtIds.size < 2}
                        onClick={handleCompare}
                        className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedArtIds.size >= 2 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                     >
                        <Columns size={16} /> <span>对比分析</span>
                     </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map(art => {
                  const isSelected = selectedArtIds.has(art.id!);
                  return (
                    <div 
                      key={art.id} 
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all group relative ${isSelected ? 'ring-4 ring-indigo-500 border-transparent' : 'border-gray-200'}`}
                    >
                      {/* Selection Checkbox */}
                      <button 
                        onClick={() => handleArtSelect(art.id!)}
                        className="absolute top-2 left-2 z-10 p-1 rounded bg-white/80 hover:bg-white text-indigo-600"
                      >
                         {isSelected ? <CheckSquare size={24} /> : <Square size={24} className="text-gray-400"/>}
                      </button>

                      {/* Zoom Button */}
                      <button 
                        onClick={() => setViewingArt(art)}
                        className="absolute top-2 right-2 z-10 p-1 rounded bg-white/80 hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <ZoomIn size={20} />
                      </button>

                      <div className="relative aspect-square bg-gray-100 cursor-pointer" onClick={() => handleArtSelect(art.id!)}>
                        <img src={art.image_data} alt="Art" className="w-full h-full object-contain p-2" />
                      </div>
                      
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                           <h4 className="font-bold text-gray-900 truncate">{art.student_name || '未知'}</h4>
                           <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{art.class_name}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <p className="text-xs text-gray-400">{new Date(art.created_at || '').toLocaleDateString()}</p>
                           <button onClick={(e) => { e.stopPropagation(); downloadImage(art.image_data, `${art.student_name}_作品.png`) }} className="text-gray-400 hover:text-indigo-600">
                              <Download size={16} />
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {artworks.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>暂无学生提交的作品</p>
                  </div>
                )}
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;