
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Heart, 
  Wrench, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  BarChart2,
  PieChart,
  MessageSquare,
  Globe,
  Wallet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_CENTERS, USAGE_DATA, MONTHS } from './constants';
import { TrainingCenter, CenterStatus } from './types';
import StatCard from './components/StatCard';
import CenterCard from './components/CenterCard';
import TimelineView from './components/TimelineView';
import { getGeminiInsights } from './services/geminiService';

const App: React.FC = () => {
  const [centers, setCenters] = useState<TrainingCenter[]>(MOCK_CENTERS);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'timeline'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Derived Stats
  const stats = {
    totalBeneficiaries: centers.reduce((acc, c) => acc + (c.monthlyStatus.filter(s => s === CenterStatus.OCCUPIED).length * (c.capacity / 2)), 0), 
    avgOccupancy: Math.round(centers.reduce((sum, c) => sum + c.occupancyRate, 0) / centers.length) || 0,
    maintenanceCount: centers.filter(c => c.status === CenterStatus.MAINTENANCE).length,
    availableCount: centers.filter(c => c.status === CenterStatus.AVAILABLE).length
  };

  const fetchInsights = async () => {
    setIsLoadingInsight(true);
    const result = await getGeminiInsights(centers);
    setAiInsight(result);
    setIsLoadingInsight(false);
  };

  const handleUpdateCenterMeta = (id: string, updates: Partial<TrainingCenter>) => {
    setCenters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleUpdateTenant = (centerId: string, startMonth: number, endMonth: number, newTenant: string) => {
    setCenters(prev => prev.map(center => {
      if (center.id !== centerId) return center;
      
      const newMonthlyTenants = [...center.monthlyTenants];
      const newMonthlyStatus = [...center.monthlyStatus];
      
      for (let i = startMonth; i <= endMonth; i++) {
        if (i < 12) {
          newMonthlyTenants[i] = newTenant;
          newMonthlyStatus[i] = CenterStatus.OCCUPIED;
        }
      }
      
      const occRate = Math.round((newMonthlyStatus.filter(s => s === CenterStatus.OCCUPIED).length / 12) * 100);
      
      return { 
        ...center, 
        monthlyTenants: newMonthlyTenants, 
        monthlyStatus: newMonthlyStatus,
        occupancyRate: occRate,
        status: newMonthlyStatus[new Date().getMonth()]
      };
    }));
  };

  const handleDeleteSchedule = (centerId: string, startMonth: number, endMonth: number) => {
    setCenters(prev => prev.map(center => {
      if (center.id !== centerId) return center;
      
      const newMonthlyTenants = [...center.monthlyTenants];
      const newMonthlyStatus = [...center.monthlyStatus];
      
      for (let i = startMonth; i <= endMonth; i++) {
        if (i < 12) {
          newMonthlyTenants[i] = undefined;
          newMonthlyStatus[i] = CenterStatus.AVAILABLE;
        }
      }
      
      const occRate = Math.round((newMonthlyStatus.filter(s => s === CenterStatus.OCCUPIED).length / 12) * 100);
      
      return { 
        ...center, 
        monthlyTenants: newMonthlyTenants, 
        monthlyStatus: newMonthlyStatus,
        occupancyRate: occRate,
        status: newMonthlyStatus[new Date().getMonth()]
      };
    }));
  };

  return (
    <div className="min-h-screen flex bg-[#fbfcfd] text-slate-900 font-['Pretendard']">
      {/* Modern Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[280px]' : 'w-[100px]'} bg-white border-r border-slate-100 transition-all duration-500 flex flex-col fixed h-full z-50`}>
        <div className="p-10 flex items-center gap-4 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-[18px] shadow-lg shadow-blue-200 shrink-0">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <span className={`font-black text-2xl tracking-tighter transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>EduSpace</span>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'dashboard', icon: <Home size={22} />, label: 'DASHBOARD' },
            { id: 'timeline', icon: <Calendar size={22} />, label: 'PLANNING' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                if (item.id === 'dashboard' || item.id === 'timeline') setViewMode(item.id as any);
              }}
              className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 ${
                (item.id === viewMode) 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className={`shrink-0 ${(item.id === viewMode) ? 'scale-110' : ''}`}>{item.icon}</span>
              <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
           <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[100px]'} p-12 bg-[#f8f9fb]`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {viewMode === 'dashboard' ? 'Overview Status' : 'Planning Management'}
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Management</span>
              <ChevronRight size={12} />
              <span className="text-blue-500">Center Status</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3 items-center mr-4">
               {[1,2,3].map(i => (
                 <div key={i} className={`w-10 h-10 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500`}>
                   {i}
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                 +13
               </div>
            </div>
            <button 
              onClick={fetchInsights}
              className="group flex items-center gap-3 bg-white border border-slate-100 px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Sparkles size={18} className="text-blue-500 group-hover:animate-pulse" /> AI Insight
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[20px] shadow-lg shadow-pink-100 flex items-center justify-center text-white font-black cursor-pointer hover:scale-110 transition-transform">
              NS
            </div>
          </div>
        </header>

        {viewMode === 'dashboard' ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Total Users (Est.)" value={stats.totalBeneficiaries.toLocaleString()} icon={<Users size={24} />} trend="+0%" color="blue" />
              <StatCard title="Average Occupancy" value={`${stats.avgOccupancy}%`} icon={<TrendingUp size={24} />} trend="+0%" color="purple" />
              <StatCard title="Maintenance" value={stats.maintenanceCount} icon={<AlertCircle size={24} />} color="amber" />
              <StatCard title="Available Centers" value={stats.availableCount} icon={<ChevronRight size={24} />} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Center Overview</h2>
                  <button onClick={() => setViewMode('timeline')} className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">Manage Detailed Schedule</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {centers.slice(0, 6).map(center => (
                    <CenterCard key={center.id} center={center} onClick={(c) => setSelectedCenter(c)} />
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                 <div className="bg-[#1e1e2d] rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                      <Sparkles size={120} className="text-blue-400" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-500/20 p-3 rounded-[16px]">
                        <Sparkles size={20} className="text-blue-400" />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight">AI Analysis</h3>
                    </div>
                    {isLoadingInsight ? (
                      <div className="flex flex-col items-center py-10 space-y-4">
                        <RefreshCw className="animate-spin text-blue-400" size={32} />
                        <span className="text-xs font-bold text-slate-500 uppercase">Analyzing Schedule...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-300 leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar">
                        {aiInsight || "인사이트를 받으려면 'AI Insight' 버튼을 클릭하세요."}
                      </div>
                    )}
                 </div>

                 <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex justify-between items-center">
                      Monthly Occupancy
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Trend</span>
                    </h3>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={MONTHS.map((m, i) => ({ name: m, users: centers.filter(c => c.monthlyStatus[i] === CenterStatus.OCCUPIED).length }))}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                           <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                           <Bar dataKey="users" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={20} />
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <TimelineView 
              centers={centers} 
              onUpdateCenterMeta={handleUpdateCenterMeta} 
              onUpdateTenant={handleUpdateTenant}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </div>
        )}

        {selectedCenter && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-lg p-12 relative animate-in fade-in zoom-in duration-300 shadow-[0_50px_100px_rgba(0,0,0,0.1)]">
              <button onClick={() => setSelectedCenter(null)} className="absolute top-10 right-10 p-3 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X size={24} />
              </button>
              
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-[28px] mx-auto mb-6 flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                   <Home size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCenter.name}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">{selectedCenter.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { label: 'Capacity', val: `${selectedCenter.capacity} People` },
                  { label: 'Current User', val: selectedCenter.currentTenant || 'Vacant' },
                  { label: 'Efficiency', val: `${selectedCenter.occupancyRate}%` },
                  { label: 'Status', val: selectedCenter.status === CenterStatus.OCCUPIED ? 'Occupied' : 'Free' },
                ].map((d, i) => (
                  <div key={i} className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{d.label}</p>
                    <p className="text-lg font-black text-slate-800">{d.val}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => { setViewMode('timeline'); setSelectedCenter(null); }} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-slate-200 active:scale-95 mb-4">Manage Schedule</button>
              <button onClick={() => setSelectedCenter(null)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Close</button>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
