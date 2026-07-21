/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, HoneypotLog } from './lib/nosql';
import HoneypotPortal from './components/HoneypotPortal';
import AdminDashboard from './components/AdminDashboard';
import { Shield, Settings, HelpCircle, Terminal, Globe, Cpu } from 'lucide-react';

export interface ThreatProfile {
  id: string;
  name: string;
  ip: string;
  ua: string;
  description: string;
  badge: string;
  badgeColor: string;
}

export default function App() {
  const [activeView, setActiveView] = useState<'honeypot' | 'admin'>('honeypot');
  const [logs, setLogs] = useState<HoneypotLog[]>([]);
  
  // Custom Threat Simulation parameters (persisted in active state)
  const [customIP, setCustomIP] = useState(() => {
    return localStorage.getItem('sentinel_sim_ip') || '185.220.101.5';
  });
  const [customUA, setCustomUA] = useState(() => {
    return localStorage.getItem('sentinel_sim_ua') || 'Mozilla/5.0 (compatible; CrawlerBot/2.1; +http://sentinel.co.il/bot)';
  });
  const [selectedProfileId, setSelectedProfileId] = useState(() => {
    return localStorage.getItem('sentinel_sim_profile_id') || 'bot';
  });

  const threatProfiles: ThreatProfile[] = [
    {
      id: 'bot',
      name: 'סורק בוטים אוטומטי (Auto Bot)',
      ip: '185.220.101.5',
      ua: 'Mozilla/5.0 (compatible; CrawlerBot/2.1; +http://sentinel.co.il/bot)',
      description: 'סורק תעשייתי אוטומטי המחפש שרתי SharePoint חשופים לרוחב הרשת.',
      badge: 'BOT_SCANNER',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'hacker',
      name: 'האקר עצמאי (Script Kiddie)',
      ip: '82.102.14.99',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
      description: 'תוקף עצמאי המבצע התקפת מילון (Dictionary Attack) בעזרת סיסמאות נפוצות.',
      badge: 'DICT_ATTACK',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'apt',
      name: 'קבוצת תקיפה מתוחכמת (APT28)',
      ip: '95.213.132.8',
      ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      description: 'מתקפה ממוקדת ומאורגנת למטרות ריגול ארגוני וגניבת קבצי תיקיות מסווגים.',
      badge: 'APT_THREAT',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    {
      id: 'local',
      name: 'הדפדפן האמיתי שלך (Client Browser)',
      ip: '192.168.1.100',
      ua: navigator.userAgent,
      description: 'בדיקה ידנית מקומית המבוססת על נתוני הדפדפן ומערכת ההפעלה האמיתיים שלך.',
      badge: 'LOCAL_TEST',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  ];

  // Refresh logs list from local database
  const refreshLogs = async () => {
    const data = await db.getAll();
    setLogs(data);
  };

  // Initial load
  useEffect(() => {
    refreshLogs();
    
    // Check if query param specifies mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin' || params.get('admin') === 'true') {
      setActiveView('admin');
    }
  }, []);

  // Save parameters to localStorage so they persist across reloads
  useEffect(() => {
    localStorage.setItem('sentinel_sim_ip', customIP);
    localStorage.setItem('sentinel_sim_ua', customUA);
    localStorage.setItem('sentinel_sim_profile_id', selectedProfileId);
  }, [customIP, customUA, selectedProfileId]);

  if (activeView === 'honeypot') {
    // 1. HONEYPOT MODE - Standalone Pure Decoy SharePoint Portal
    // 100% full screen, zero Sentinel traces to deceive any observer!
    return (
      <HoneypotPortal 
        onAttackLogged={refreshLogs} 
        onNavigateToAdmin={() => setActiveView('admin')}
        selectedIP={customIP} 
        selectedUA={customUA} 
      />
    );
  }

  // 2. ADMIN PANEL - Beautiful Sentinel SOC Control & Intelligence Room
  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 animate-fade-in" dir="rtl">
      
      {/* Upper Navigation HUD for Admins only */}
      <header className="bg-[#111827] border-b border-[#334155] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Main Title branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center ring-4 ring-red-900/30 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Sentinel Honey-Portal</h1>
                <span className="bg-red-500/10 text-red-400 border border-red-500/35 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">v3.1-STABLE</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">מצב: מנהל מערכת // מרכז הבקרה SOC // מנוע NoSQL</p>
            </div>
          </div>

          {/* Mode switcher (Visible to authorized testers/admins inside dashboard) */}
          <div className="flex bg-[#0A0C10] border border-[#334155] p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveView('honeypot')}
              className="px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>הצג פורטל SharePoint (מלכודת)</span>
            </button>
            
            <button
              onClick={() => setActiveView('admin')}
              className="px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-red-600 text-white shadow-md"
            >
              <span className="h-2 w-2 rounded-full bg-white"></span>
              <span>לוח בקרה SOC Dashboard</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <AdminDashboard 
          logs={logs} 
          onLogsChanged={refreshLogs} 
          customIP={customIP}
          setCustomIP={setCustomIP}
          customUA={customUA}
          setCustomUA={setCustomUA}
          selectedProfileId={selectedProfileId}
          setSelectedProfileId={setSelectedProfileId}
          threatProfiles={threatProfiles}
          onBackToDecoy={() => setActiveView('honeypot')}
        />
      </main>

      {/* Global Interactive Security Footer */}
      <footer className="bg-[#111827] border-t border-[#334155] mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-red-500" />
            <span>סביבת הדמיה מבוקרת - Sentinel Security Lab Honey-portal Project</span>
          </div>
          <div className="flex gap-4">
            <span className="font-mono text-[11px]">DATE_STAMP: 2026-07-17 UTC</span>
            <span>•</span>
            <span className="text-slate-400">מוגדר על כתובת: localhost:3000</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
