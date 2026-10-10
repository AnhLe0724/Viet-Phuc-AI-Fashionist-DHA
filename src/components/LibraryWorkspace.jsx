import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Layers, Search, Sparkles, Filter, CheckCircle2, 
  ExternalLink, Eye, ArrowRight, ShieldCheck, Tag, Info, 
  FolderOpen, Star, AlertTriangle, Check, Compass, SlidersHorizontal,
  ChevronRight, Copy, Share2, RefreshCw, X, Trash2
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function LibraryWorkspace({ 
  keywords = [], 
  savedCount = 0, 
  onSwitchToRemix, 
  onSwitchToCrawl,
  onOpenFolder,
  onDeleteKeyword
}) {
  // Top level mode: 'costumes' (Thư viện Trang Phục) | 'rules' (Quy Tắc Phối Đồ)
  const [activeSubTab, setActiveSubTab] = useState('costumes');

  // Search & Filter States for Costumes
  const [costumeSearch, setCostumeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'saved' | 'crawled'
  const [selectedCostume, setSelectedCostume] = useState(null);
  const [deletedItemIds, setDeletedItemIds] = useState(new Set());

  // Search & Filter States for Rules
  const [rulesContent, setRulesContent] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleSearch, setRuleSearch] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [viewRawMarkdown, setViewRawMarkdown] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);

  // Fetch Heritage Styling Rules content from Knowledge Base
  useEffect(() => {
    const fetchRules = async () => {
      setRulesLoading(true);
      try {
        const res = await fetch('/api/styling-rules');
        const data = await res.json();
        if (data.success && data.content) {
          setRulesContent(data.content);
        }
      } catch (err) {
        console.error('Error loading rules:', err);
      } finally {
        setRulesLoading(false);
      }
    };

    fetchRules();
  }, []);

  // Distinct Categories list
  const categories = useMemo(() => {
    const map = new Map();
    keywords.forEach(k => {
      if (k.category && !map.has(k.category.id)) {
        map.set(k.category.id, {
          id: k.category.id,
          name: k.category.nameVi,
          folder: k.category.folder
        });
      }
    });
    return Array.from(map.values());
  }, [keywords]);

  // Handle Delete Costume from Library
  const handleDeleteItem = async (e, item) => {
    if (e) e.stopPropagation();
    const itemName = item.withAccent || item.name || item.code || 'trang phục';
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${itemName}" khỏi Thư Viện không?`)) return;

    try {
      const targetId = item.id || item.code;
      const res = await fetch(`/api/library/item/${targetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeletedItemIds(prev => new Set([...prev, item.id, item.code]));
        if (selectedCostume?.id === item.id) setSelectedCostume(null);
        if (onDeleteKeyword) onDeleteKeyword(item.id);
      } else {
        alert(data.message || 'Không thể xóa món đồ');
      }
    } catch (err) {
      alert('Lỗi mạng khi xóa món đồ khỏi Thư Viện');
    }
  };

  // Filtered Costumes
  const filteredCostumes = useMemo(() => {
    return keywords.filter(kw => {
      if (deletedItemIds.has(kw.id) || deletedItemIds.has(kw.code)) return false;

      // Category filter
      if (selectedCategory !== 'all' && kw.category?.id !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'saved' && kw.status !== 'saved') return false;
      if (statusFilter === 'crawled' && kw.candidates?.length === 0 && kw.status !== 'saved') return false;

      // Search term
      if (costumeSearch.trim()) {
        const query = costumeSearch.toLowerCase().trim();
        const matchName = kw.withAccent?.toLowerCase().includes(query);
        const matchNoAccent = kw.noAccent?.toLowerCase().includes(query);
        const matchCode = kw.code?.toLowerCase().includes(query);
        const matchCat = kw.category?.nameVi?.toLowerCase().includes(query);
        return matchName || matchNoAccent || matchCode || matchCat;
      }

      return true;
    });
  }, [keywords, selectedCategory, statusFilter, costumeSearch, deletedItemIds]);

  // Parsed structured rules from Knowledge Base chapters
  const parsedRules = useMemo(() => {
    if (!rulesContent) return [];
    
    // Split by Markdown headers (## )
    const sections = [];
    const chapters = rulesContent.split(/\n(?=# )/);

    chapters.forEach(chapterText => {
      const chapterLines = chapterText.trim().split('\n');
      const chapterTitle = chapterLines[0].replace(/^#\s*/, '').trim();

      const itemBlocks = chapterText.split(/\n(?=##\s)/);
      itemBlocks.forEach((block, idx) => {
        if (idx === 0 && !block.startsWith('##')) {
          // Chapter intro / overview
          if (block.trim() && !block.startsWith('# ')) {
            sections.push({
              type: 'overview',
              chapter: chapterTitle,
              title: chapterTitle,
              content: block.trim()
            });
          }
          return;
        }

        const lines = block.trim().split('\n');
        const title = lines[0].replace(/^##\s*/, '').trim();
        const body = lines.slice(1).join('\n').trim();

        // Extract remix stars if any (e.g. Remix: ★★★★☆)
        const remixMatch = body.match(/Remix:\s*([★☆]+)/i);
        const remixRating = remixMatch ? remixMatch[1] : null;

        sections.push({
          type: 'rule',
          chapter: chapterTitle,
          title,
          content: body,
          remixRating
        });
      });
    });

    return sections;
  }, [rulesContent]);

  // Rule Chapters list
  const ruleChapters = useMemo(() => {
    const set = new Set();
    parsedRules.forEach(r => {
      if (r.chapter) set.add(r.chapter);
    });
    return Array.from(set);
  }, [parsedRules]);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return parsedRules.filter(r => {
      if (selectedChapter !== 'all' && r.chapter !== selectedChapter) {
        return false;
      }
      if (ruleSearch.trim()) {
        const query = ruleSearch.toLowerCase().trim();
        return (
          r.title.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query) ||
          r.chapter.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [parsedRules, selectedChapter, ruleSearch]);

  // Helper to copy raw content
  const handleCopy = () => {
    if (rulesContent) {
      navigator.clipboard.writeText(rulesContent);
      setCopiedRule(true);
      setTimeout(() => setCopiedRule(false), 2000);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-95px)] min-h-[720px] flex flex-col space-y-3 overflow-hidden font-sans">
      
      {/* Top Header & Modern Segmented Control */}
      <div className="flex-shrink-0 bg-white border border-matcha-200/90 rounded-2xl px-6 py-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Workspace Title & Stats Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-matcha-900 text-cream-50 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fashion text-lg font-bold text-matcha-950 tracking-tight">
                Thư Viện Tri Thức & Dataset
              </h2>
              <span className="text-[10px] fashion-badge font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Di Sản Cung Đình
              </span>
            </div>
            <p className="text-[11px] text-matcha-700">
              Tra cứu danh mục <strong className="text-matcha-950">100 Tác phẩm</strong> & Toàn thư <strong className="text-matcha-950">1,270 Quy tắc phối đồ</strong>
            </p>
          </div>
        </div>

        {/* Modern Segmented Control Bar (Thanh chọn phong cách hiện đại) */}
        <div className="flex items-center bg-matcha-100/80 p-1 rounded-full border border-matcha-300 shadow-inner">
          <button
            onClick={() => setActiveSubTab('costumes')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeSubTab === 'costumes'
                ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thư Viện Trang Phục</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-semibold ${
              activeSubTab === 'costumes' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200 text-matcha-800'
            }`}>
              100 Items
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeSubTab === 'rules'
                ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Quy Tắc Phối Đồ Di Sản</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-semibold ${
              activeSubTab === 'rules' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200 text-matcha-800'
            }`}>
              Knowledge Base (10 Chương)
            </span>
          </button>
        </div>

        {/* Quick Utility Actions */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-matcha-50 hover:bg-matcha-100 text-matcha-800 border border-matcha-200 transition font-medium"
          >
            <FolderOpen className="w-3.5 h-3.5 text-matcha-600" />
            <span>Mở Folder Dataset</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: THƯ VIỆN TRANG PHỤC (COSTUME CATALOG LOOKBOOK)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'costumes' && (
        <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">
          
          {/* Filter & Search Bar */}
          <div className="flex-shrink-0 bg-white border border-matcha-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-matcha-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={costumeSearch}
                onChange={(e) => setCostumeSearch(e.target.value)}
                placeholder="Tìm trang phục theo tên, mã (VP_001)..."
                className="w-full bg-matcha-50/60 border border-matcha-200 rounded-full pl-9 pr-4 py-2 text-xs text-matcha-950 placeholder:text-matcha-400 focus:outline-none focus:border-matcha-600 transition"
              />
              {costumeSearch && (
                <button
                  onClick={() => setCostumeSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-matcha-400 hover:text-matcha-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-matcha-900 text-cream-50 shadow-sm'
                    : 'bg-matcha-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200'
                }`}
              >
                Tất cả ({keywords.length})
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-matcha-900 text-cream-50 shadow-sm'
                      : 'bg-matcha-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[11px] text-matcha-600 font-medium hidden sm:inline">Lọc:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  statusFilter === 'all' ? 'bg-matcha-800 text-white' : 'bg-matcha-100/70 text-matcha-700'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('saved')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  statusFilter === 'saved' ? 'bg-matcha-800 text-white' : 'bg-matcha-100/70 text-matcha-700'
                }`}
              >
                Đã lưu local ({savedCount})
              </button>
            </div>

          </div>

          {/* Catalog Grid View */}
          <div className="flex-1 bg-white border border-matcha-200/90 rounded-3xl p-5 shadow-fashion overflow-y-auto min-h-0">
            {filteredCostumes.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <Layers className="w-10 h-10 text-matcha-300 stroke-[1.5]" />
                <p className="font-fashion text-base text-matcha-900 font-bold">Không tìm thấy trang phục phù hợp</p>
                <p className="text-xs text-matcha-600">Thử đổi từ khóa hoặc bộ lọc danh mục</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredCostumes.map(item => {
                  const hasLocalImage = item.status === 'saved' && item.savedImage?.url;
                  const candidateUrl = item.candidates?.[0]?.url;
                  const imageUrl = hasLocalImage ? item.savedImage.url : candidateUrl;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCostume(item)}
                      className="group relative bg-[#fcfdfa] rounded-2xl border border-matcha-200/80 hover:border-matcha-600 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                    >
                      {/* Image Thumbnail (Portrait 3:4) */}
                      <div className="relative aspect-[3/4] w-full bg-matcha-100/50 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.withAccent}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-matcha-50">
                            <Layers className="w-6 h-6 text-matcha-400 stroke-[1.5] mb-1.5" />
                            <span className="text-[10px] text-matcha-600 italic">Chưa có ảnh</span>
                          </div>
                        )}

                        {/* Top Overlay Badges & Delete Button */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-white/10 shadow-sm pointer-events-none">
                            {item.code}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {hasLocalImage && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white shadow-sm flex items-center gap-1 pointer-events-none">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Local
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDeleteItem(e, item)}
                              title="Xóa món đồ này khỏi Thư Viện"
                              className="p-1 rounded-full bg-red-950/70 hover:bg-red-600 text-red-200 hover:text-white transition shadow-sm backdrop-blur-md opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-matcha-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-[11px] font-bold text-cream-50 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-matcha-700 tracking-wider">
                            {item.category?.nameVi}
                          </span>
                          <h3 className="font-fashion text-sm font-bold text-matcha-950 line-clamp-2 leading-snug group-hover:text-matcha-700 transition">
                            {item.withAccent}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-matcha-100 flex items-center justify-between text-[10px] text-matcha-600">
                          <span className="truncate">{item.searchQuery || item.noAccent}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: CẨM NANG & QUY TẮC PHỐI ĐỒ (STYLING RULES CODEX)               */}
      {/* ========================================================================= */}
      {activeSubTab === 'rules' && (
        <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">
          
          {/* Rules Search & Chapter Bar */}
          <div className="flex-shrink-0 bg-white border border-matcha-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-matcha-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Tìm quy tắc (VD: sneaker, dáng cao, Tết, giao lĩnh...)"
                className="w-full bg-matcha-50/60 border border-matcha-200 rounded-full pl-9 pr-4 py-2 text-xs text-matcha-950 placeholder:text-matcha-400 focus:outline-none focus:border-matcha-600 transition"
              />
              {ruleSearch && (
                <button
                  onClick={() => setRuleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-matcha-400 hover:text-matcha-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Chapter Selection Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedChapter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedChapter === 'all'
                    ? 'bg-matcha-900 text-cream-50 shadow-sm'
                    : 'bg-matcha-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200'
                }`}
              >
                Tất cả quy tắc ({parsedRules.length})
              </button>

              {ruleChapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedChapter(ch)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedChapter === ch
                      ? 'bg-matcha-900 text-cream-50 shadow-sm'
                      : 'bg-matcha-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200'
                  }`}
                >
                  {ch.replace(/^VIỆT PHỤC REMIX —\s*/, '')}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setViewRawMarkdown(!viewRawMarkdown)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-matcha-100 hover:bg-matcha-200 text-matcha-900 border border-matcha-300 transition flex items-center gap-1.5"
              >
                <span>{viewRawMarkdown ? 'Xem dạng Thẻ' : 'Xem Raw Markdown'}</span>
              </button>

              <button
                onClick={handleCopy}
                title="Sao chép toàn bộ cẩm nang"
                className="p-2 rounded-full bg-white hover:bg-matcha-50 text-matcha-800 border border-matcha-200 transition"
              >
                {copiedRule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>

          {/* Rules Display Container */}
          <div className="flex-1 bg-white border border-matcha-200/90 rounded-3xl p-6 shadow-fashion overflow-y-auto min-h-0">
            {rulesLoading ? (
              <div className="h-64 flex items-center justify-center gap-3 text-matcha-700 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Đang nạp cẩm nang phối đồ từ Knowledge Base di sản...</span>
              </div>
            ) : viewRawMarkdown ? (
              <div className="p-4 bg-matcha-50/50 rounded-2xl border border-matcha-200 font-mono text-xs leading-relaxed overflow-x-auto">
                <MarkdownRenderer content={rulesContent} />
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <Sparkles className="w-10 h-10 text-matcha-300 stroke-[1.5]" />
                <p className="font-fashion text-base text-matcha-900 font-bold">Không tìm thấy quy tắc tương ứng</p>
                <p className="text-xs text-matcha-600">Thử tìm kiếm từ khóa khác</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="bg-[#fbfcf8] rounded-2xl border border-matcha-200 hover:border-matcha-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    {/* Rule Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-matcha-100 text-matcha-800 border border-matcha-200">
                          {rule.chapter}
                        </span>

                        {rule.remixRating && (
                          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Remix: {rule.remixRating}
                          </span>
                        )}
                      </div>

                      <h3 className="font-fashion text-lg font-bold text-matcha-950 tracking-tight">
                        {rule.title}
                      </h3>
                    </div>

                    {/* Rule Body */}
                    <div className="text-xs text-matcha-900 leading-relaxed font-sans bg-white/70 rounded-xl p-3.5 border border-matcha-100 flex-1">
                      <MarkdownRenderer content={rule.content} />
                    </div>

                    {/* Action */}
                    <div className="pt-2 border-t border-matcha-100 flex items-center justify-between text-[11px]">
                      <span className="text-matcha-600 font-medium">✓ Quy tắc chuẩn di sản</span>
                      <button
                        onClick={onSwitchToRemix}
                        className="text-matcha-900 font-bold hover:text-matcha-700 flex items-center gap-1 hover:underline"
                      >
                        <span>Thử nghiệm trong Studio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* COSTUME DETAIL MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedCostume && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-matcha-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-fadeIn">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCostume(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Photo */}
            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-black flex items-center justify-center relative overflow-hidden">
              {selectedCostume.status === 'saved' && selectedCostume.savedImage?.url ? (
                <img
                  src={selectedCostume.savedImage.url}
                  alt={selectedCostume.withAccent}
                  className="w-full h-full object-cover"
                />
              ) : selectedCostume.candidates?.[0]?.url ? (
                <img
                  src={selectedCostume.candidates[0].url}
                  alt={selectedCostume.withAccent}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-cream-100 text-xs">
                  <Layers className="w-10 h-10 mx-auto mb-2 text-matcha-400" />
                  <span>Chưa có ảnh trong kho dataset</span>
                </div>
              )}

              <div className="absolute top-4 left-4">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-white/20">
                  {selectedCostume.code}
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-3 py-0.5 rounded-full bg-matcha-100 text-matcha-800 border border-matcha-300">
                  {selectedCostume.category?.nameVi}
                </span>

                <h3 className="font-fashion text-2xl font-bold text-matcha-950 mt-2">
                  {selectedCostume.withAccent}
                </h3>

                <p className="text-xs text-matcha-600 mt-1 font-sans">
                  Keyword không dấu: <code className="bg-matcha-50 px-1.5 py-0.5 rounded border border-matcha-200 text-matcha-900 font-semibold">{selectedCostume.noAccent}</code>
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-matcha-50/70 border border-matcha-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-matcha-700">Trạng thái kho:</span>
                    <strong className="text-matcha-950">
                      {selectedCostume.status === 'saved' ? '✓ Đã lưu cục bộ' : 'Chưa tải về'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-matcha-700">Thư mục:</span>
                    <span className="font-mono text-[11px] text-matcha-900">{selectedCostume.category?.folder}</span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-matcha-800 leading-relaxed font-sans">
                  <p className="font-bold text-matcha-950 mb-1">Gợi ý phân tích:</p>
                  <p>Trang phục này có thể phối trực tiếp trong <strong>Remix Room</strong> cùng các phụ kiện đương đại như Sneaker, Loafer, Túi tote hoặc áo khoác layer.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-matcha-200">
                <button
                  onClick={() => {
                    setSelectedCostume(null);
                    onSwitchToRemix();
                  }}
                  className="flex-1 py-2.5 rounded-full bg-matcha-900 hover:bg-matcha-800 text-cream-50 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Phối đồ với trang phục này</span>
                </button>
                <button
                  onClick={(e) => handleDeleteItem(e, selectedCostume)}
                  className="px-3.5 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold text-xs transition flex items-center justify-center gap-1.5 font-sans"
                  title="Xóa món đồ này khỏi Thư Viện"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
