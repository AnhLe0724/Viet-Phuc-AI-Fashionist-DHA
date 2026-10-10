import React from 'react';
import { Database, Sparkles, FolderOpen, RefreshCw, Layers, Compass, ArrowUpRight, Cpu, Crown } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, onRefresh, onOpenFolder }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-matcha-200/70 bg-cream-50/90 backdrop-blur-md">
      <div className="max-w-[2500px] w-full mx-auto px-4 sm:px-6 2xl:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Brand & Editorial Logo (Clickable to Welcome) */}
          <div 
            onClick={() => setActiveTab('welcome')}
            className="flex items-center gap-3.5 cursor-pointer group"
            title="Về trang giới thiệu Welcome"
          >
            <div className="w-11 h-11 rounded-full bg-matcha-100 border border-matcha-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-curvy text-2xl text-matcha-800 font-bold">vp</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-fashion text-2xl font-bold tracking-widest text-matcha-950 uppercase">
                  Việt Phục
                </span>
                <span className="font-curvy text-xl text-matcha-600 lowercase tracking-normal -ml-1">
                  remix
                </span>
                <span className="hidden sm:inline-block text-[9px] fashion-badge font-bold px-2 py-0.5 rounded-full bg-matcha-100 border border-matcha-300 text-matcha-800">
                  Haute Couture Studio
                </span>
              </div>
              <p className="text-[11px] text-matcha-700/80 font-sans tracking-wide">
                L’Art du Costume Traditionnel & AI Remix
              </p>
            </div>
          </div>

          {/* Top Horizontal Navigation Tabs (Haute Couture Capsule) */}
          <nav className="flex items-center bg-matcha-100/70 p-1.5 rounded-full border border-matcha-200/80 shadow-inner">
            <button
              onClick={() => setActiveTab('remix')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeTab === 'remix'
                  ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Remix Room</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'remix' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200 text-matcha-800'}`}>
                studio
              </span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeTab === 'library'
                  ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-matcha-300" />
              <span>Library</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'library' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200 text-matcha-800'}`}>
                di sản
              </span>
            </button>

            <button
              onClick={() => setActiveTab('lookbook')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeTab === 'lookbook'
                  ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-200/50'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Lookbook</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'lookbook' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200 text-matcha-800'}`}>
                archives
              </span>
            </button>
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenFolder}
              title="Mở thư mục dataset trên máy tính"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 shadow-sm transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-matcha-600" />
              <span className="hidden sm:inline">Dataset Local</span>
            </button>

            <button
              onClick={onRefresh}
              title="Làm mới trạng thái"
              className="p-2 text-matcha-700 hover:text-matcha-950 hover:bg-white rounded-full border border-matcha-200 shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
