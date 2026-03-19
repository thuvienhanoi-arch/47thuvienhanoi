import React from 'react';
import { MessageSquare, Mic, BookOpen, Settings, LogOut, Sparkles, Sun, Moon, Palette, Code } from 'lucide-react';
import { motion } from 'motion/react';

interface ThanhBenProps {
  activeTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  primaryColor: string;
  setPrimaryColor: (val: string) => void;
}

export default function ThanhBen({ 
  activeTab, 
  setTab, 
  onLogout, 
  isDarkMode, 
  setIsDarkMode, 
  primaryColor, 
  setPrimaryColor 
}: ThanhBenProps) {
  const menuItems = [
    { id: 'chat', label: 'Trò chuyện', icon: MessageSquare },
    { id: 'podcast', label: 'Podcast', icon: Mic },
    { id: 'tomtat', label: 'Tóm tắt', icon: BookOpen },
    { id: 'codefixer', label: 'Sửa Code', icon: Code },
  ];

  return (
    <div className="w-64 bg-[var(--bg-main)] border-r border-[var(--border-main)] flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 20px ${primaryColor}33` }}
          >
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>AI Studio</h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-[var(--glass-bg)] shadow-inner'
                  : 'text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-main)]'
              }`}
              style={activeTab === item.id ? { color: primaryColor } : {}}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[var(--border-main)] space-y-4">
        {/* Theme Controls */}
        <div className="space-y-3 px-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Giao diện</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--border-main)] transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between group">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Màu chủ đạo</span>
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--border-main)] cursor-pointer">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Cài đặt</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-muted)] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
