/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { db, HoneypotLog } from '../lib/nosql';
import { 
  Shield, 
  Database, 
  AlertOctagon, 
  Activity, 
  Users, 
  Globe, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter, 
  Terminal, 
  Play, 
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Settings
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  logs: HoneypotLog[];
  onLogsChanged: () => void;
  customIP: string;
  setCustomIP: (ip: string) => void;
  customUA: string;
  setCustomUA: (ua: string) => void;
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  threatProfiles: any[];
  onBackToDecoy: () => void;
}

export default function AdminDashboard({ 
  logs, 
  onLogsChanged, 
  customIP, 
  setCustomIP, 
  customUA, 
  setCustomUA, 
  selectedProfileId, 
  setSelectedProfileId, 
  threatProfiles,
  onBackToDecoy
}: AdminDashboardProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlagFilter, setSelectedFlagFilter] = useState<'ALL' | 'BRUTE_FORCE' | 'NORMAL'>('ALL');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Simulation State
  const [simUsername, setSimUsername] = useState('admin');
  const [simIP, setSimIP] = useState('144.76.82.203');
  const [simAttemptsCount, setSimAttemptsCount] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'alerts' | 'analytics' | 'nosql' | 'simulator'>('alerts');

  // Hardcoded Admin Password
  const ADMIN_PASSWORD = 'admin'; // Easy to test as requested!

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      // Shake effect or feedback
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Actions
  const handleClearLogs = async () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל רשומות הלוג ממסד הנתונים ה-NoSQL המקומי?')) {
      await db.clear();
      onLogsChanged();
    }
  };

  const handleResetToDefault = async () => {
    await db.resetToDefault();
    onLogsChanged();
  };

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Automated attack simulation
  const handleSimulateAttack = () => {
    if (!simUsername) return;
    setIsSimulating(true);
    setSimSuccessMsg(null);

    let currentStep = 0;
    const interval = setInterval(async () => {
      // Insert a simulated brute-force attempt
      await db.insert({
        ip: simIP || '85.203.15.22',
        internalIp: '10.0.12.25',
        username: simUsername,
        password: `SimulatedPass_${Math.random().toString(36).substr(2, 5)}`,
        userAgent: 'Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)'
      });
      onLogsChanged();

      currentStep++;
      if (currentStep >= simAttemptsCount) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimSuccessMsg(`סומל בהצלחה התקפת Brute Force הכוללת ${simAttemptsCount} ניסיונות עבור המשתמש "${simUsername}". מערכת ה-NoSQL זיהתה וסימנה את האירועים בהתאם!`);
        setTimeout(() => setSimSuccessMsg(null), 8000);
      }
    }, 400);
  };

  // Calculations for Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueIPs = new Set(logs.map(l => l.ip)).size;
    const uniqueUsers = new Set(logs.map(l => l.username.toLowerCase())).size;
    const bruteForceCount = logs.filter(l => l.flags.includes('BRUTE_FORCE')).length;

    return {
      total,
      uniqueIPs,
      uniqueUsers,
      bruteForceCount
    };
  }, [logs]);

  // Analytics Charts Data Prep
  const chartsData = useMemo(() => {
    // 1. Most targeted usernames
    const userMap: Record<string, number> = {};
    logs.forEach(l => {
      const u = l.username.toLowerCase();
      userMap[u] = (userMap[u] || 0) + 1;
    });
    const targetedUsers = Object.entries(userMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Most active attacking IPs
    const ipMap: Record<string, number> = {};
    logs.forEach(l => {
      ipMap[l.ip] = (ipMap[l.ip] || 0) + 1;
    });
    const activeIPs = Object.entries(ipMap)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Browser Distribution
    const browserMap: Record<string, number> = {};
    logs.forEach(l => {
      browserMap[l.browser] = (browserMap[l.browser] || 0) + 1;
    });
    const browserData = Object.entries(browserMap).map(([name, value]) => ({ name, value }));

    // 4. Attack timeline (grouped by last 10 minutes or timestamps)
    const timelineData = logs.slice(-15).map(l => {
      const date = new Date(l.timestamp);
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      return {
        time: timeStr,
        attempts: 1,
        isBrute: l.flags.includes('BRUTE_FORCE') ? 1 : 0
      };
    });

    return {
      targetedUsers,
      activeIPs,
      browserData,
      timelineData
    };
  }, [logs]);

  // COLORS for charts
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search match
      const matchesSearch = 
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm) ||
        log.password.includes(searchTerm) ||
        log.userAgent.toLowerCase().includes(searchTerm.toLowerCase());

      // Flag filter match
      if (selectedFlagFilter === 'BRUTE_FORCE') {
        return matchesSearch && log.flags.includes('BRUTE_FORCE');
      } else if (selectedFlagFilter === 'NORMAL') {
        return matchesSearch && !log.flags.includes('BRUTE_FORCE');
      }
      return matchesSearch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Show newest first
  }, [logs, searchTerm, selectedFlagFilter]);

  // Secure Password Gate
  if (!isAuthenticated) {
    return (
      <div className="w-full flex items-center justify-center p-4 bg-[#0A0C10] text-slate-200 min-h-[580px] rounded-2xl border border-[#334155] shadow-2xl relative overflow-hidden" dir="rtl">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="absolute top-4 left-4 flex items-center gap-2 text-rose-400 font-mono text-[11px] bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded">
          <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span>
          <span>מצב נעול</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md bg-[#111827] border border-[#334155] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-14 w-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 mb-3">
              <Lock size={28} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Sentinel Honey-Portal</h1>
            <p className="text-xs text-slate-400 mt-1">ממשק שליטה אבטחה וניהול מלכודות דבש ארגוניות</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">הזן סיסמת מנהל מערכת</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="הקלד סיסמה..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-sm bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono transition-all"
                />
                <Key className="absolute left-3 top-2.5 text-slate-500" size={16} />
              </div>
            </div>

            {loginError && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-400 font-medium text-right"
              >
                סיסמה שגויה! אנא נסה שנית.
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Unlock size={16} />
              <span>פתח פאנל ניהול</span>
            </button>
          </form>

          {/* Quick Guidance Card */}
          <div className="mt-6 bg-[#0A0C10] border border-[#334155]/60 p-3.5 rounded-xl text-[11px] text-slate-400 leading-normal">
            <span className="font-semibold text-amber-400">הנחיית אימות:</span> סיסמת הניהול הארגונית מוגדרת בקוד המערכת. הזן <code className="bg-[#111827] text-white px-1.5 py-0.5 rounded font-mono font-bold mx-1 border border-[#334155]">admin</code> כדי להיכנס למרכז הבקרה.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0A0C10] text-slate-200 min-h-[580px] rounded-2xl border border-[#334155] shadow-2xl flex flex-col justify-between overflow-hidden font-sans" dir="rtl">
      {/* Dynamic Security Command Header */}
      <div className="bg-[#111827] border-b border-[#334155] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Sentinel Cyber-SOC Control</h1>
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-mono font-bold animate-pulse">ACTIVE_HONEY_PORTAL</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">ניטור איומים, ניתוח NoSQL וזיהוי מתקפות Brute Force בזמן אמת</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetToDefault}
            title="אפס לנתוני דוגמה"
            className="p-2 bg-[#0A0C10] hover:bg-slate-800 text-slate-300 border border-[#334155] rounded-xl transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">טען נתוני דמו</span>
          </button>
          
          <button
            onClick={handleClearLogs}
            title="נקה את כל הלוגים"
            className="p-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/30 rounded-xl transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">נקה מסד</span>
          </button>

          <div className="h-6 w-[1px] bg-[#334155] mx-1"></div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-[#0A0C10] hover:bg-[#111827] text-slate-200 text-xs rounded-xl border border-[#334155] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock size={13} />
            <span>נעילת מסך</span>
          </button>
        </div>
      </div>

      {/* Cyber Intelligence Dashboard Analytics Grid */}
      <div className="p-6 flex-1 space-y-6">
        
        {/* KPI Row - Elegant Bento Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-[#334155] p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">סה"כ ניסיונות התחברות</span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Database size={20} />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#334155] p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">כתובות IP תוקפות</span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">{stats.uniqueIPs}</h3>
            </div>
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Globe size={20} />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#334155] p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">שמות משתמש מותקפים</span>
              <h3 className="text-2xl font-black text-white font-mono mt-1">{stats.uniqueUsers}</h3>
            </div>
            <div className="h-10 w-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/20">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#334155] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden shadow-lg">
            {stats.bruteForceCount > 0 && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
            )}
            <div>
              <span className="text-[11px] text-slate-400 font-medium">ניסיונות Brute Force</span>
              <h3 className={`text-2xl font-black font-mono mt-1 ${stats.bruteForceCount > 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{stats.bruteForceCount}</h3>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${stats.bruteForceCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/35' : 'bg-slate-800 text-slate-400 border-slate-750'}`}>
              <AlertOctagon size={20} />
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="border-b border-[#334155] flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === 'alerts' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <AlertOctagon size={14} />
            <span>לוגי התראות ואירועים ({filteredLogs.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === 'analytics' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Activity size={14} />
            <span>תרשימי ניתוח איומים</span>
          </button>

          <button
            onClick={() => setActiveTab('nosql')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === 'nosql' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Database size={14} />
            <span>סייר NoSQL JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${activeTab === 'simulator' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Cpu size={14} />
            <span>סימולטור תקיפה (מבחן זיהוי)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[300px]">
          {/* TAB 1: Alerts Logs */}
          {activeTab === 'alerts' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#111827]/60 p-4 rounded-2xl border border-[#334155]">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="חפש לפי IP, שם משתמש, סיסמה..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl pl-3 pr-8 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <Search className="absolute right-2.5 top-2.5 text-slate-500" size={14} />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Filter size={12} />
                    <span>סינון תיוג:</span>
                  </span>
                  <div className="flex bg-[#0A0C10] border border-[#334155] p-0.5 rounded-xl text-[10px]">
                    <button
                      onClick={() => setSelectedFlagFilter('ALL')}
                      className={`px-3 py-1 rounded-lg transition-colors ${selectedFlagFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      הכל
                    </button>
                    <button
                      onClick={() => setSelectedFlagFilter('BRUTE_FORCE')}
                      className={`px-3 py-1 rounded-lg transition-colors ${selectedFlagFilter === 'BRUTE_FORCE' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Brute Force בלבד
                    </button>
                    <button
                      onClick={() => setSelectedFlagFilter('NORMAL')}
                      className={`px-3 py-1 rounded-lg transition-colors ${selectedFlagFilter === 'NORMAL' ? 'bg-[#111827] text-slate-200 border border-[#334155]' : 'text-slate-400 hover:text-white'}`}
                    >
                      רגיל
                    </button>
                  </div>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto border border-[#334155] rounded-2xl bg-[#111827]/40">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#111827] text-slate-300 border-b border-[#334155] font-medium">
                      <th className="p-4">זמן</th>
                      <th className="p-4">כתובת IP (חיצונית / פנימית)</th>
                      <th className="p-4">שם משתמש שהוזן</th>
                      <th className="p-4">סיסמה שהוזנה</th>
                      <th className="p-4">דפדפן / מערכת הפעלה</th>
                      <th className="p-4 text-center">זיהוי מנגנון (Flags)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/50">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          לא נמצאו רשומות לוג התואמות את החיפוש הנוכחי במלכודת הדבש.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const date = new Date(log.timestamp);
                        const formattedTime = `${date.toLocaleDateString('he-IL')} ${date.toLocaleTimeString('he-IL')}`;
                        const isBrute = log.flags.includes('BRUTE_FORCE');

                        return (
                          <tr key={log.id} className={`hover:bg-[#111827]/60 transition-colors ${isBrute ? 'bg-red-500/[0.02]' : ''}`}>
                            <td className="p-4 text-slate-400 font-mono">{formattedTime}</td>
                            <td className="p-4 font-mono font-semibold text-sky-400">
                              <div className="flex flex-col">
                                <span>{log.ip} <span className="text-[9px] text-slate-500 font-sans font-normal">(חיצוני)</span></span>
                                {log.internalIp && <span className="text-[10px] text-slate-400 font-normal">{log.internalIp} <span className="text-[9px] text-slate-600 font-sans font-normal">(פנימי)</span></span>}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-[#0A0C10] px-2.5 py-1 rounded-md text-slate-200 font-mono font-semibold border border-[#334155]">
                                {log.username}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className={`text-xs ${revealedPasswords[log.id] ? 'text-amber-400 font-bold' : 'text-slate-500 font-sans'}`}>
                                  {revealedPasswords[log.id] ? log.password : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordReveal(log.id)}
                                  className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                                >
                                  {revealedPasswords[log.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-slate-400">
                              <span className="bg-[#0A0C10] px-2 py-0.5 rounded-md text-[10px] text-slate-300 font-mono mr-1 border border-[#334155]">
                                {log.browser}
                              </span>
                              <span className="bg-[#0A0C10] px-2 py-0.5 rounded-md text-[10px] text-slate-300 font-mono border border-[#334155]">
                                {log.os}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {isBrute ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                                  <AlertOctagon size={10} />
                                  <span>BRUTE_FORCE</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle size={10} />
                                  <span>NORMAL</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informative Guidance */}
              <div className="bg-[#111827]/40 border border-[#334155] p-5 rounded-2xl text-[11px] text-slate-400 leading-relaxed shadow-md">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <Activity size={12} />
                  <span>הסבר לוגיקת זיהוי מתקפות (Pattern Analysis Algorithm):</span>
                </span>
                מערכת ה-Honey-Portal מריצה אלגוריתם NoSQL Query סורק בזמן אמת. אם מזוהים <strong>3 ניסיונות התחברות או יותר</strong> בעלי שם משתמש זהה <strong>או</strong> מאותה כתובת IP בתוך חלון זמן דינמי של <strong>5 דקות</strong>, המערכת מתייגת אוטומטית את כל ניסיונות הגישה הללו עם הדגל <code className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">BRUTE_FORCE</code>.
              </div>
            </div>
          )}

          {/* TAB 2: Analytics Charts */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 border border-[#334155] rounded-2xl bg-[#111827]/40">
                  אין מספיק נתונים במסד ה-NoSQL המקומי לייצור תרשימי איומים. נסה להזין התחברויות בפורטל או להריץ סימולציה.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Targeted Usernames */}
                  <div className="bg-[#111827]/80 p-5 rounded-2xl border border-[#334155] shadow-lg">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-1.5 border-b border-[#334155] pb-2">
                      <Users size={14} className="text-blue-400" />
                      <span>שמות המשתמש הממוקדים ביותר (טופ 5)</span>
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.targetedUsers} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', color: '#fff', fontSize: 12, borderRadius: '12px' }}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {chartsData.targetedUsers.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Active Attacking IPs */}
                  <div className="bg-[#111827]/80 p-5 rounded-2xl border border-[#334155] shadow-lg">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-1.5 border-b border-[#334155] pb-2">
                      <Globe size={14} className="text-rose-400" />
                      <span>מקורות תקיפה מובילים (IPs מובילים)</span>
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartsData.activeIPs} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                          <YAxis dataKey="ip" type="category" stroke="#94a3b8" fontSize={11} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', color: '#fff', fontSize: 12, borderRadius: '12px' }}
                          />
                          <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]}>
                            {chartsData.activeIPs.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Browser Platforms */}
                  <div className="bg-[#111827]/80 p-5 rounded-2xl border border-[#334155] shadow-lg">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-1.5 border-b border-[#334155] pb-2">
                      <Cpu size={14} className="text-teal-400" />
                      <span>פילוח דפדפני התוקפים (User-Agent Log)</span>
                    </h4>
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartsData.browserData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartsData.browserData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', color: '#fff', fontSize: 11, borderRadius: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 text-xs space-y-2 pr-4">
                        {chartsData.browserData.map((b, i) => (
                          <div key={b.name} className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                            <span className="text-slate-300 font-mono font-medium">{b.name}: {b.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart 4: Attack Timeline */}
                  <div className="bg-[#111827]/80 p-5 rounded-2xl border border-[#334155] shadow-lg">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-1.5 border-b border-[#334155] pb-2">
                      <Terminal size={14} className="text-amber-400" />
                      <span>זרם ניסיונות תקיפה אחרונים (Timeline)</span>
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartsData.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', color: '#fff', fontSize: 12, borderRadius: '12px' }} />
                          <Line type="monotone" dataKey="attempts" stroke="#f59e0b" strokeWidth={2} name="נסיונות גישה" activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="isBrute" stroke="#ef4444" strokeWidth={2} name="אירועי Brute Force" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: NoSQL Database Raw Explorer */}
          {activeTab === 'nosql' && (
            <div className="space-y-4 animate-fade-in font-mono text-xs">
              <div className="bg-[#111827] border border-[#334155] p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between border-b border-[#334155] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">collection_name: 'sentinel_honeypot_logs'</span>
                  </div>
                  <div className="text-[10px] bg-[#0A0C10] text-slate-400 px-2.5 py-1 rounded-md border border-[#334155]">
                    מבוסס JSON Local Storage (NoSQL Emulator)
                  </div>
                </div>

                <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#334155] max-h-[350px] overflow-y-auto text-emerald-400">
                  <pre className="whitespace-pre-wrap font-mono leading-relaxed text-right" dir="ltr">
                    {JSON.stringify(logs, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-[#111827]/40 border border-[#334155] p-3.5 rounded-2xl text-[11px] text-slate-400 leading-normal">
                <span className="font-semibold text-amber-400">אופן השמירה:</span> מסד הנתונים מוטמע כתוסף NoSQL מבוסס-דפדפן (In-browser Document Store). ניתן לערוך שאילתות, לבצע הזרקת רשומות, או לנקות את בסיס הנתונים באופן מלא לצורך ביצוע ניסויים חוזרים.
              </div>
            </div>
          )}

          {/* TAB 4: Attacks Simulator Panel */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 animate-fade-in text-right">
              
              {/* Dual Layout: Config vs Run Simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Decoy Profile Setup */}
                <div className="lg:col-span-7 bg-[#111827]/80 border border-[#334155] p-6 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
                    <Settings size={18} className="text-red-500" />
                    <div>
                      <h4 className="text-sm font-bold text-white">פרופיל האיום הפעיל במלכודת (Decoy Active Profile)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">קבע איזה כתובת IP ודפדפן (User-Agent) ייזקפו לזכותו של תוקף שינסה להקליד ידנית פרטים בפורטל SharePoint.</p>
                    </div>
                  </div>

                  {/* Profile Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {threatProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfileId(profile.id);
                          setCustomIP(profile.ip);
                          setCustomUA(profile.ua);
                        }}
                        className={`text-right p-3 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${selectedProfileId === profile.id ? 'bg-[#0A0C10] border-red-500/50 shadow-inner ring-1 ring-red-500/20' : 'bg-[#0A0C10]/40 hover:bg-[#0A0C10]/80 border-[#334155]'}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-white">{profile.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold border ${profile.badgeColor}`}>
                            {profile.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">{profile.description}</p>
                        
                        <div className="flex flex-col gap-1 text-[9px] text-slate-500 font-mono mt-1 border-t border-[#334155]/40 pt-1.5">
                          <span className="truncate">IP: <span className="text-sky-400 font-semibold">{profile.ip}</span></span>
                          <span className="truncate" title={profile.ua}>UA: {profile.ua}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Advanced settings for manual customization */}
                  <div className="pt-3 border-t border-[#334155] grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">כתובת IP מותאמת אישית:</label>
                      <input
                        type="text"
                        value={customIP}
                        onChange={(e) => {
                          setCustomIP(e.target.value);
                          setSelectedProfileId('custom');
                        }}
                        className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1 font-mono">דפדפן (User-Agent Override):</label>
                      <input
                        type="text"
                        value={customUA}
                        onChange={(e) => {
                          setCustomUA(e.target.value);
                          setSelectedProfileId('custom');
                        }}
                        className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>
                      פרופיל אקטיבי מוכן! פתח את <button onClick={onBackToDecoy} className="text-red-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">עמוד פורטל SharePoint המדומה</button> והזן פרטים כדי לרשום את המתקפה תחת פרופיל זה.
                    </span>
                  </div>
                </div>

                {/* Right Column: Simulated attack injector */}
                <div className="lg:col-span-5 bg-[#111827]/80 border border-[#334155] p-6 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#334155] pb-3">
                      <Cpu size={18} className="text-amber-500 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-white">מחולל התקפות מבוקרות - Brute Force Tester</h4>
                        <p className="text-xs text-slate-400 mt-0.5">סימולטור זה מאפשר להזרים התקפות מרובות באופן אוטומטי לבדיקת יעילות זיהוי הדגלים</p>
                      </div>
                    </div>

                    {simSuccessMsg && (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-400">
                        {simSuccessMsg}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">שם המשתמש המותקף בפורטל</label>
                        <input
                          type="text"
                          value={simUsername}
                          onChange={(e) => setSimUsername(e.target.value)}
                          placeholder="למשל: admin, cohen, test"
                          className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">כתובת IP של התוקף המדומה</label>
                        <input
                          type="text"
                          value={simIP}
                          onChange={(e) => setSimIP(e.target.value)}
                          placeholder="למשל: 144.76.82.203"
                          className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">כמות ניסיונות גישה בסימולציה</label>
                        <select
                          value={simAttemptsCount}
                          onChange={(e) => setSimAttemptsCount(Number(e.target.value))}
                          className="w-full text-xs bg-[#0A0C10] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value={3}>3 ניסיונות (סף הזיהוי המינימלי)</option>
                          <option value={5}>5 ניסיונות (מתקפה מובהקת)</option>
                          <option value={10}>10 ניסיונות (מתקפה אגרסיבית)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#334155]/60">
                    <button
                      onClick={handleSimulateAttack}
                      disabled={isSimulating}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-700 disabled:text-slate-500"
                    >
                      {isSimulating ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>מזרים ניסיונות תקיפה למסד...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          <span>הפעל סימולציית תקיפה מיידית</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Informational guide */}
              <div className="bg-[#111827]/40 border border-[#334155] p-4 rounded-2xl text-xs text-slate-400 space-y-2">
                <span className="font-bold text-white block">הוראות והסבר למחקר ופיתוח:</span>
                <p className="leading-relaxed">
                  הפרדנו לחלוטין את לוחות הבקרה מעמוד המלכודת החיצוני כדי לדמות תרחיש תקיפה אמיתי! כעת, משתמש קצה או תוקף שיקבל גישה לפורטל החיצוני ייחשף אך ורק לדף SharePoint אמין לחלוטין. מנהלי SOC יכולים לקבוע בפנל זה את פרופיל האיום המשפיע על דף הגישה, או להזריק לוגים אוטומטיים ישירות למסד הנתונים בעזרת ה-Tester.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Cyber Security Status Bar Footer */}
      <div className="bg-[#111827] border-t border-[#334155] px-6 py-3.5 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[11px] font-mono text-emerald-400">SOC_NODE_CONNECTED // SSL_VERIFIED</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>מספר רשומות NoSQL: {stats.total}</span>
          <span>גרסה: Sentinel Honey-Portal v3.1-Final</span>
        </div>
      </div>
    </div>
  );
}
