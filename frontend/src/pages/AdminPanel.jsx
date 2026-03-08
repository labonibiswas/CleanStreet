import React, { useState } from 'react';
import { Download, Users, FileText, Clock, CheckCircle, BarChart3, PieChart as PieIcon } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // MOCK DATA: This makes the frontend visible without a backend
  const mockStats = [
    { label: 'Total Users', value: 0, icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Complaints', value: 0, icon: <FileText size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Complaints', value: 0, icon: <Clock size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Resolved Complaints', value: 0, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const mockComplaintTypes = [
    { type: 'Garbage', count: 2, percentage: '80%' },
    { type: 'Water Leakage', count: 1, percentage: '40%' },
    { type: 'Road Damage', count: 1, percentage: '40%' }
  ];

  // Place this ABOVE your main 'return' statement
const OverviewContent = (
  <>
    {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mockStats.map((stat, index) => (
            <div key={index} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800 leading-none">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics & Analytics Header */}
        <div className="mb-8 mt-12 flex flex-col gap-1">
        <div className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <BarChart3 size={22} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Statistics & Analytics</h2>
        </div>
        <p className="text-slate-400 text-sm font-medium ml-11">Visual insights into complaints and user data.</p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* 1. Complaint Status Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col">
            <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Complaint Status Distribution
            </h3>
            {/* Circular Chart Placeholder */}
            <div className="relative w-48 h-48 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full border-[20px] border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-[20px] border-indigo-500 border-t-transparent border-r-transparent -rotate-45"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-slate-300 text-xs font-bold uppercase tracking-tighter italic">Pie Chart</span>
            </div>
            </div>
            {/* Legend */}
            <div className="space-y-3 mt-auto">
            <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-400">Resolved</span></div>
                <span className="text-slate-700">1 (25.0%)</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div><span className="text-slate-400">In Review</span></div>
                <span className="text-slate-700">3 (75.0%)</span>
            </div>
            </div>
        </div>

        {/* 2. Complaint Types (Horizontal Bars) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2">
            <PieIcon size={18} className="text-indigo-500" /> Complaint Types
            </h3>
            <div className="space-y-7">
            {[
                { t: 'Road Damage', v: 1, p: '25%', c: 'bg-indigo-400' },
                { t: 'Garbage', v: 2, p: '50%', c: 'bg-indigo-600' },
                { t: 'Water Leakage', v: 1, p: '25%', c: 'bg-pink-500' }
            ].map((item) => (
                <div key={item.t}>
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">
                    <span>{item.t}</span>
                    <span className="text-slate-800">{item.v} ({item.p})</span>
                </div>
                <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                    <div className={`${item.c} h-full rounded-full transition-all duration-1000`} style={{ width: item.p }}></div>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* 3. User Roles (Horizontal Bars) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
            <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> User Roles
            </h3>
            <div className="space-y-7">
            {[
                { t: 'User', v: 12, p: '57.1%', c: 'bg-slate-500' },
                { t: 'Volunteer', v: 8, p: '38.1%', c: 'bg-emerald-500' },
                { t: 'Admin', v: 1, p: '4.8%', c: 'bg-red-500' }
            ].map((item) => (
                <div key={item.t}>
                <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">
                    <span>{item.t}</span>
                    <span className="text-slate-800">{item.v} ({item.p})</span>
                </div>
                <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                    <div className={`${item.c} h-full rounded-full transition-all duration-1000`} style={{ width: item.p }}></div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>


        {/* Charts Section: Complaints & Registrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* 1. Complaints (Last 7 Days) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[350px] flex flex-col">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
            <div className="text-indigo-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></div>
            Complaints (Last 7 Days)
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <div className="mb-4 opacity-20"><FileText size={48} /></div>
            <p className="text-sm font-medium italic">No data available</p>
            </div>
        </div>

        {/* 2. User Registrations (Last 30 Days) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[350px]">
            <h3 className="font-bold text-slate-700 mb-8 flex items-center gap-2">
            <div className="text-indigo-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></div>
            User Registrations (Last 30 Days)
            </h3>
            
            {/* Visual Line Chart Placeholder */}
            <div className="relative h-40 w-full mt-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 border-b border-slate-100 border-dashed top-1/4"></div>
            <div className="absolute inset-0 border-b border-slate-100 border-dashed top-2/4"></div>
            <div className="absolute inset-0 border-b border-slate-100 border-dashed top-3/4"></div>
            
            {/* The Line (SVG) */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path 
                d="M 0 80 L 100 80 L 200 80 L 300 30 L 400 80 L 500 80" 
                fill="none" 
                stroke="#10B981" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="w-full"
                />
                {/* Data Points */}
                <circle cx="0" cy="80" r="4" fill="#10B981" />
                <circle cx="100" cy="80" r="4" fill="#10B981" />
                <circle cx="200" cy="80" r="4" fill="#10B981" />
                <circle cx="300" cy="30" r="6" fill="#10B981" stroke="white" strokeWidth="2" />
                <circle cx="400" cy="80" r="4" fill="#10B981" />
                <circle cx="500" cy="80" r="4" fill="#10B981" />
            </svg>
            
            {/* X-Axis Labels */}
            <div className="absolute -bottom-8 w-full flex justify-between text-[10px] font-bold text-slate-400">
                <span>2/9</span><span>2/11</span><span>2/13</span><span>2/14</span><span>2/23</span>
            </div>
            </div>
        </div>
        </div>

            {/* Final Analytics Section: Monthly Trends & Top Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pb-12">
            
            {/* 1. Monthly Complaint Trends (Bar Chart) */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[350px] flex flex-col">
                <h3 className="font-bold text-slate-700 mb-12 flex items-center gap-2">
                <div className="text-indigo-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                </div>
                Monthly Complaint Trends (6 Months)
                </h3>
                
                <div className="flex-1 flex items-end gap-10 px-6 pb-4">
                {/* Dec 25 Bar */}
                <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full bg-[#8B5CF6] rounded-t-lg h-[180px] shadow-lg shadow-purple-100 transition-all hover:scale-105"></div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Dec 25</span>
                </div>
                
                {/* Feb 26 Bar */}
                <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full bg-[#8B5CF6] rounded-t-lg h-[60px] shadow-lg shadow-purple-100 transition-all hover:scale-105"></div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Feb 26</span>
                </div>

                {/* Placeholders for visual balance as seen in reference */}
                <div className="flex-1 flex flex-col items-center gap-4 opacity-10">
                    <div className="w-full bg-slate-200 rounded-t-lg h-4"></div>
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">-</span>
                </div>
                </div>
            </div>

            {/* 2. Top 5 Complaint Types (Large Thick Progress Bars) */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 min-h-[350px]">
                <h3 className="font-bold text-slate-700 mb-10 flex items-center gap-2">
                <div className="text-indigo-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="M2 12h20"/><path d="m4.93 19.07 14.14-14.14"/></svg>
                </div>
                Top 5 Complaint Types
                </h3>
                
                <div className="space-y-10 pr-4">
                {/* Garbage - Indigo */}
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-bold text-slate-500 w-24 text-right">Garbage</span>
                    <div className="flex-1 bg-slate-100 h-9 rounded-full overflow-hidden relative">
                    <div className="bg-[#6366F1] h-full rounded-full transition-all duration-1000 w-[90%] flex items-center justify-end pr-4">
                        <span className="text-white text-xs font-black">2</span>
                    </div>
                    </div>
                </div>

                {/* Water Leakage - Soft Purple */}
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-bold text-slate-500 w-24 text-right truncate">Water Leaka...</span>
                    <div className="flex-1 bg-slate-100 h-9 rounded-full overflow-hidden relative">
                    <div className="bg-[#818CF8] h-full rounded-full transition-all duration-1000 w-[60%] flex items-center justify-end pr-4">
                        <span className="text-white text-xs font-black">1</span>
                    </div>
                    </div>
                </div>

                {/* Road Damage - Pink/Rose */}
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-bold text-slate-500 w-24 text-right truncate">Road Dama...</span>
                    <div className="flex-1 bg-slate-100 h-9 rounded-full overflow-hidden relative">
                    <div className="bg-[#F43F5E] h-full rounded-full transition-all duration-1000 w-[60%] flex items-center justify-end pr-4">
                        <span className="text-white text-xs font-black">1</span>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
  </>
);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Real-time community oversight and management.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#6366F1] text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition-all active:scale-95">
            <Download size={18} /> Download Report
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-10 overflow-x-auto no-scrollbar">
          {['Overview', 'Manage Users', 'View Complaints', 'Activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold whitespace-nowrap transition-all ${
                activeTab.includes(tab.split(' ')[0]) 
                ? 'border-b-4 border-indigo-600 text-indigo-600' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* This is the area where the content changes */}
        <div className="mt-6">
        {activeTab === 'Overview' && OverviewContent}
        
        
        {activeTab.includes('View Complaints') && (
            <div className="p-20 text-center text-slate-400 italic bg-white rounded-[3rem]">
            Complaints List is under construction...
            </div>
        )}
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;