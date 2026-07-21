/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../lib/nosql';
import { Eye, EyeOff, AlertTriangle, ShieldAlert, Shield, Sun, Moon } from 'lucide-react';

interface HoneypotPortalProps {
  onAttackLogged: () => void;
  onNavigateToAdmin: () => void;
  selectedIP: string;
  selectedUA: string;
}

export default function HoneypotPortal({ onAttackLogged, onNavigateToAdmin, selectedIP, selectedUA }: HoneypotPortalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setErrorMsg(null);

    // Simulate standard corporate Active Directory latency
    setTimeout(async () => {
      try {
        let internalIp = '10.0.12.150';
        if (selectedIP === '185.220.101.5') internalIp = '10.0.12.3';
        else if (selectedIP === '82.102.14.99') internalIp = '10.0.12.99';
        else if (selectedIP === '95.213.132.8') internalIp = '10.0.12.112';
        else if (selectedIP === '192.168.1.100' || selectedIP === '192.168.1.45') internalIp = '10.0.12.5';
        else if (selectedIP === '45.129.56.200') internalIp = '10.0.12.200';

        // Save to NoSQL local database silently without alerting the attacker
        await db.insert({
          ip: selectedIP || '192.168.1.115',
          internalIp,
          username,
          password,
          userAgent: selectedUA || navigator.userAgent,
        });

        // Genuine-looking Finance system error to prevent suspicion
        setErrorMsg('שם המשתמש או הסיסמה שהוזנו למערכת כספי אינם נכונים. אנא ודא כי מקש Caps Lock אינו פעיל ונסה שנית.');
        
        // Notify database change
        onAttackLogged();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        // Clear password field to match real corporate behavior
        setPassword('');
      }
    }, 1100);
  };

  return (
    <div className={`w-full min-h-screen flex flex-col justify-between relative font-sans select-text transition-colors duration-200 ${isDarkMode ? 'bg-[#111827] text-slate-200' : 'bg-[#f3f3f3] text-slate-700'}`} dir="rtl">
      
      {/* Floating System Controller - Admin navigation button requested by user */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onNavigateToAdmin}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-lg border border-red-500 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
          title="מעבר לעמוד ניהול סנטינל"
        >
          <Shield size={14} className="animate-pulse" />
          <span>כניסה לעמוד הניהול (Sentinel SOC)</span>
        </button>
      </div>

      {/* Dark/Light mode theme toggle */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center justify-center p-2.5 rounded-full shadow-lg border transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.97] ${isDarkMode ? 'bg-[#1f2937] text-amber-400 border-[#374151]' : 'bg-white text-slate-700 border-[#e5e5e5]'}`}
          title={isDarkMode ? 'מעבר לעיצוב בהיר' : 'מעבר לעיצוב כהה'}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      
      {/* Absolute Stealth Decoy Header - Mimics Microsoft Single Sign-On */}
      <div className="hidden">
        {/* Anti-crawler hidden decoy tag */}
        {/* Microsoft SharePoint Server Ver 16.0.4351.1000 - CSRF Verified Token */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-[440px] border shadow-[0_2px_4px_rgba(0,0,0,0.1)] p-11 rounded-sm relative transition-colors duration-200 ${isDarkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e5e5e5]'}`}>
          
          {/* Microsoft / SharePoint Corporate Styled Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-[#0078d4] flex items-center justify-center text-white font-bold text-lg rounded-sm shadow-sm select-none">
              כ
            </div>
            <div>
              <h1 className={`text-xl font-semibold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#242424]'}`}>מערכת כספי</h1>
              <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>מערכת הכספים הארגונית - אימות כניסה מאובטח</span>
            </div>
          </div>

          <div className="mb-5">
            <h2 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-[#242424]'}`}>התחבר למערכת כספי</h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>הזן את שם המשתמש והסיסמה של מערכת הכספים של סנטינל תעשיות.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border-r-4 border-red-500 p-3 text-xs text-red-800 rounded-sm animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-[#505050]'}`}>שם משתמש (domain\user)</label>
              <input
                type="text"
                required
                placeholder="username@sentinel.co.il"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className={`w-full text-sm px-3 py-2 border rounded-sm focus:outline-none focus:border-[#0078d4] transition-colors ${isDarkMode ? 'bg-[#2d3748] border-[#4a5568] text-white placeholder-slate-500' : 'bg-white border-[#8a8886] text-slate-800'}`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`block text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-[#505050]'}`}>סיסמה</label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('שחזור סיסמת מערכת כספי חסום בדפדפן זה. אנא פנה למרכז השירות הטלפוני של סנטינל תעשיות או למחלקת הכספים.'); }} 
                  className="text-xs text-[#0078d4] hover:underline"
                >
                  שכחת סיסמה?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`w-full text-sm pl-10 pr-3 py-2 border rounded-sm focus:outline-none focus:border-[#0078d4] transition-colors ${isDarkMode ? 'bg-[#2d3748] border-[#4a5568] text-white placeholder-slate-500' : 'bg-white border-[#8a8886] text-slate-800'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="keep-signed"
                className="rounded-sm border-slate-300 text-[#0078d4] focus:ring-[#0078d4] h-3.5 w-3.5"
              />
              <label htmlFor="keep-signed" className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} select-none`}>
                השאר אותי מחובר במכשיר זה
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold text-xs py-2 px-4 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-[#c8c6c4] disabled:text-[#a19f9d]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>מאמת פרטי כניסה...</span>
                </>
              ) : (
                <span>התחברות</span>
              )}
            </button>
          </form>

          <div className={`mt-8 border-t pt-4 flex flex-col gap-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <p className={`text-[10px] leading-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              מערכת זו מיועדת לעובדים מורשים של סנטינל תעשיות בלבד. השימוש כפוף לתקנון ולמדיניות אבטחת המידע הארגונית.
            </p>
          </div>
        </div>
      </div>

      {/* SharePoint Decoy Footer - Contains hidden discrete administrative link to access SOC dashboard */}
      <footer className={`border-t px-6 py-4 text-xs flex flex-wrap justify-between items-center gap-4 transition-colors duration-200 ${isDarkMode ? 'bg-[#1f2937] border-[#374151] text-slate-400' : 'bg-white border-[#e5e5e5] text-slate-400'}`}>
        <div className="flex gap-4 items-center">
          <span>© 2026 Sentinel Industries. כל הזכויות שמורות.</span>
          <span>•</span>
          <a href="#help" onClick={(e) => { e.preventDefault(); alert('אנא פנה למחלקת הכספים או ל-IT לקבלת סיוע.'); }} className="hover:underline">עזרה ותמיכה</a>
        </div>
        
        {/* Stealth Access Point for Admins/Evaluators - Mimics standard network sync but opens SOC */}
        <button
          onClick={onNavigateToAdmin}
          className={`text-[11px] transition-colors flex items-center gap-1 cursor-pointer border px-2 py-1 rounded ${isDarkMode ? 'text-slate-400 border-[#374151] hover:text-slate-200 hover:border-[#4b5563]' : 'text-slate-300 border-transparent hover:border-[#e5e5e5] hover:text-slate-500'}`}
          title="כניסת מערכת מאובטחת"
        >
          <ShieldAlert size={12} className="opacity-50" />
          <span>סנכרון מערכת כספי</span>
        </button>
      </footer>

    </div>
  );
}
