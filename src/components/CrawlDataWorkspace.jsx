import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Play, CheckCircle2, Clock, AlertCircle, 
  Download, Eye, RefreshCw, FolderOpen, Sparkles, Layers,
  Table as TableIcon, LayoutGrid, Zap, Check, ExternalLink, HardDrive,
  CheckCheck, ChevronRight, Image as ImageIcon, Compass, Cpu, ShieldCheck
} from 'lucide-react';

export default function CrawlDataWorkspace({
  keywords,
  stats,
  siglipStatus,
  onCrawlSingle,
  onCrawlBatch,
  onSaveCandidate,
  onBatchSaveTop,
  onOpenCandidateModal,
  onOpenFolder,
  loadingStates
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'need_select' | 'saved' | 'uncrawled'
  const [viewMode, setViewMode] = useState('fast_review'); // 'fast_review' | 'table' | 'grid'

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map();
    keywords.forEach(k => {
      if (k.category && !map.has(k.category.id)) {
        map.set(k.category.id, k.category);
      }
    });
    return Array.from(map.values());
  }, [keywords]);

  // Filtered keywords list
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      const matchText = 
        kw.withAccent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kw.withoutAccent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (kw.alias && kw.alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
        kw.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || kw.category.id === selectedCategory;
      
      let matchStatus = true;
      if (selectedStatus === 'saved') {
        matchStatus = kw.status === 'saved';
      } else if (selectedStatus === 'need_select') {
        matchStatus = kw.candidates && kw.candidates.length > 0 && kw.status !== 'saved';
      } else if (selectedStatus === 'uncrawled') {
        matchStatus = !kw.candidates || kw.candidates.length === 0;
      }

      return matchText && matchCategory && matchStatus;
    });
  }, [keywords, searchQuery, selectedCategory, selectedStatus]);

  // Stats
  const savedCount = keywords.filter(k => k.status === 'saved').length;
  const readyToSelectCount = keywords.filter(k => k.candidates && k.candidates.length > 0 && k.status !== 'saved').length;
  const uncrawledCount = keywords.filter(k => !k.candidates || k.candidates.length === 0).length;
  const progressPercent = Math.round((savedCount / (keywords.length || 1)) * 100);

  return (
    <div className="space-y-8 pb-24">
      
      {/* Editorial Lookbook Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-matcha-100 via-matcha-50 to-cream-100 border border-matcha-200/80 p-6 sm:p-10 shadow-fashion overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-matcha-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-matcha-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-curvy text-2xl text-matcha-700 font-bold">L'Archive</span>
              <span className="text-[10px] fashion-badge font-bold px-3 py-1 rounded-full bg-white/80 border border-matcha-300 text-matcha-900 shadow-sm">
                Collection 2026 • 100 Pièces
              </span>
              
              {/* Real OpenAI CLIP ViT Filter Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full text-[10px] font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OpenAI CLIP ViT Filter • 4 Ảnh Tinh Tuyển/Keyword</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-fashion font-bold text-matcha-950 tracking-tight leading-none">
              Kho Lưu Trữ <span className="font-curvy font-normal text-3xl sm:text-5xl text-matcha-600 lowercase block sm:inline">di sản</span> & Kiểm Định CLIP
            </h1>
            <p className="text-xs sm:text-sm text-matcha-800/80 mt-3 max-w-2xl font-sans leading-relaxed">
              Tiền xử lý tìm kiếm với LLM và Knowledge Base, thu thập đa nguồn và hậu kiểm định bằng mô hình Deep Learning CLIP ViT-B/32, tinh tuyển 4 ảnh chuẩn mực nhất cho mỗi món đồ di sản.
            </p>
          </div>

          {/* Editorial Stats Trio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-matcha-200 shadow-sm text-center">
              <span className="text-[10px] uppercase tracking-wider text-matcha-600 font-bold block mb-0.5">Keywords</span>
              <span className="text-2xl sm:text-3xl font-fashion font-bold text-matcha-950">{keywords.length}</span>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-matcha-200/60 backdrop-blur-md border border-matcha-300 shadow-sm text-center">
              <span className="text-[10px] uppercase tracking-wider text-matcha-800 font-bold block mb-0.5">Chờ Duyệt</span>
              <span className="text-2xl sm:text-3xl font-fashion font-bold text-matcha-900">{readyToSelectCount}</span>
            </div>

            <div className="px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-matcha-900 text-cream-50 shadow-md text-center">
              <span className="text-[10px] uppercase tracking-wider text-matcha-300 font-bold block mb-0.5">Đã Lưu</span>
              <span className="text-2xl sm:text-3xl font-fashion font-bold text-cream-100">{savedCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="mt-6 pt-5 border-t border-matcha-200/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-matcha-800 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Tiến độ số hóa kho dữ liệu chuẩn:
            </span>
            <span className="font-fashion font-bold text-sm sm:text-base text-matcha-950">{savedCount} / {keywords.length} ảnh ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-matcha-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-matcha-700 to-matcha-900 transition-all duration-700 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Haute Couture Control Bar */}
      <div className="rounded-2xl fashion-glass p-4 sm:p-5 space-y-4 shadow-fashion sticky top-20 z-30">
        
        {/* Top Controls: Search, View Mode & Batch Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-84">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-matcha-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mẫu trang phục, chất liệu..."
              className="w-full bg-white border border-matcha-200 pl-10 pr-4 py-2.5 rounded-full text-xs text-matcha-950 placeholder:text-matcha-400 focus:outline-none focus:border-matcha-600 shadow-sm transition"
            />
          </div>

          {/* Fashion View Mode Switcher */}
          <div className="flex items-center bg-matcha-100/80 p-1 rounded-full border border-matcha-200/80 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('fast_review')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'fast_review'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm'
                  : 'text-matcha-800 hover:text-matcha-950'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>⚡ Chọn Nhanh (Top 10)</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white text-matcha-950 shadow-sm border border-matcha-200'
                  : 'text-matcha-800 hover:text-matcha-950'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Bảng Lưu Trữ</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-matcha-950 shadow-sm border border-matcha-200'
                  : 'text-matcha-800 hover:text-matcha-950'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới Lookbook</span>
            </button>
          </div>

          {/* Batch Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => onCrawlBatch(false)}
              disabled={loadingStates.batchCrawl}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-full bg-matcha-800 hover:bg-matcha-900 text-cream-50 shadow-sm transition disabled:opacity-50"
              title="Crawl tự động 10 ảnh chất lượng cho tất cả 100 keywords"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${loadingStates.batchCrawl ? 'animate-spin' : ''}`} />
              <span>{loadingStates.batchCrawl ? 'Đang Crawl 10 Ảnh...' : 'Crawl Tất Cả 100 (10 Ảnh)'}</span>
            </button>

            <button
              onClick={() => onCrawlBatch(true)}
              disabled={loadingStates.batchCrawl || uncrawledCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-full bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-matcha-600" />
              <span>Crawl ({uncrawledCount}) Chưa Có</span>
            </button>

            <button
              onClick={onBatchSaveTop}
              disabled={readyToSelectCount === 0 || loadingStates.batchSave}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 shadow-sm transition disabled:opacity-40"
              title="Lưu ảnh Top #1 có điểm thẩm định cao nhất"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
              <span>{loadingStates.batchSave ? 'Đang lưu...' : `Auto-Save (${readyToSelectCount}) Top 1`}</span>
            </button>
          </div>
        </div>

        {/* Status Filters & Category Chips */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-matcha-200/60">
          
          {/* Status Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-matcha-600 mr-1 text-[10px] uppercase font-bold tracking-wider">Trạng thái:</span>
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1 rounded-full font-medium transition ${selectedStatus === 'ALL' ? 'bg-matcha-900 text-cream-50' : 'text-matcha-700 hover:text-matcha-950 bg-white border border-matcha-200'}`}
            >
              Tất cả ({keywords.length})
            </button>
            <button
              onClick={() => setSelectedStatus('need_select')}
              className={`px-3 py-1 rounded-full font-medium transition ${selectedStatus === 'need_select' ? 'bg-matcha-800 text-cream-50' : 'text-matcha-700 hover:text-matcha-950 bg-white border border-matcha-200'}`}
            >
              Chờ duyệt ({readyToSelectCount})
            </button>
            <button
              onClick={() => setSelectedStatus('saved')}
              className={`px-3 py-1 rounded-full font-medium transition ${selectedStatus === 'saved' ? 'bg-matcha-800 text-cream-50' : 'text-matcha-700 hover:text-matcha-950 bg-white border border-matcha-200'}`}
            >
              Đã lưu ({savedCount})
            </button>
            <button
              onClick={() => setSelectedStatus('uncrawled')}
              className={`px-3 py-1 rounded-full font-medium transition ${selectedStatus === 'uncrawled' ? 'bg-matcha-800 text-cream-50' : 'text-matcha-700 hover:text-matcha-950 bg-white border border-matcha-200'}`}
            >
              Chưa crawl ({uncrawledCount})
            </button>
          </div>

          {/* Category Horizontal Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs">
            <span className="text-matcha-600 mr-1 text-[10px] uppercase font-bold tracking-wider">Danh mục:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-matcha-900 text-cream-50 font-semibold'
                  : 'bg-white text-matcha-800 hover:bg-matcha-50 border border-matcha-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-matcha-900 text-cream-50 font-semibold shadow-sm'
                    : 'bg-white text-matcha-800 hover:bg-matcha-50 border border-matcha-200'
                }`}
              >
                <span>{cat.nameVi}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 1. FAST REVIEW MODE (Up to 10 candidates per keyword) */}
      {viewMode === 'fast_review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="font-fashion font-bold text-lg text-matcha-950">
                Chế độ Chọn Nhanh (Fast Review 10 Ứng Viên)
              </span>
              <span className="text-xs text-matcha-600">
                (Hiển thị {filteredKeywords.length} mẫu)
              </span>
            </div>
            <span className="text-xs text-matcha-600 hidden sm:inline">
              Nhấp trực tiếp vào ảnh bất kỳ để lưu ngay vào thư mục
            </span>
          </div>

          <div className="space-y-6">
            {filteredKeywords.map((kw) => {
              const isSearching = loadingStates[`search_${kw.id}`];
              const isSaving = loadingStates[`save_${kw.id}`];
              const hasCandidates = kw.candidates && kw.candidates.length > 0;
              const isSaved = kw.status === 'saved' && kw.savedImage;

              return (
                <div
                  key={kw.id}
                  className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${
                    isSaved
                      ? 'bg-matcha-50/40 border-matcha-300 shadow-sm'
                      : hasCandidates
                      ? 'bg-white border-matcha-200 shadow-fashion hover:border-matcha-400'
                      : 'bg-white/70 border-matcha-200/70'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-matcha-100 mb-4">
                    <div className="flex items-center gap-3.5">
                      <span className="font-fashion text-base px-3.5 py-1 rounded-full bg-matcha-100 text-matcha-900 font-bold border border-matcha-200">
                        {kw.code}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-fashion font-bold text-matcha-950 tracking-tight">
                            {kw.withAccent}
                          </h3>
                          <span className="text-xs text-matcha-600 font-curvy text-lg">
                            ({kw.withoutAccent})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-matcha-700">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-matcha-50 border border-matcha-200 text-matcha-800">
                            {kw.category.nameVi}
                          </span>
                          <span className="text-matcha-300">•</span>
                          <span className="text-[11px] text-matcha-600 truncate max-w-md font-sans">
                            Lưu: <code className="text-matcha-800 bg-matcha-50 px-1 rounded">dataset/{kw.category.id}/</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isSaved && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 border border-matcha-300 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Đã lưu: <strong>{kw.savedImage.filename}</strong></span>
                        </div>
                      )}

                      <button
                        onClick={() => onCrawlSingle(kw.id)}
                        disabled={isSearching}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 shadow-sm transition disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin text-matcha-600' : ''}`} />
                        <span>{isSearching ? 'Đang lọc 10 ảnh...' : hasCandidates ? 'Lọc lại 10 ảnh' : 'Crawl 10 ảnh HD'}</span>
                      </button>

                      {hasCandidates && (
                        <button
                          onClick={() => onOpenCandidateModal(kw)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Full 10 Ảnh ({kw.candidates.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Candidates Strip (Top 5 visible + button to view all 10) */}
                  {hasCandidates ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                        {kw.candidates.slice(0, 5).map((cand, cIdx) => {
                          const isThisSaved = isSaved && kw.savedImage?.originalUrl === cand.url;
                          const isBestMatch = cIdx === 0;
                          const siglipScore = cand.siglipScore || cand.qualityScore || 80;

                          return (
                            <div
                              key={cIdx}
                              onClick={() => onSaveCandidate(kw.id, cand.url)}
                              className={`group relative rounded-2xl border p-2.5 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
                                isThisSaved
                                  ? 'bg-matcha-50/90 border-matcha-600 ring-2 ring-matcha-400 shadow-fashion'
                                  : isBestMatch
                                  ? 'bg-white border-emerald-300 hover:border-emerald-500 shadow-sm hover:-translate-y-0.5'
                                  : 'bg-white border-matcha-100 hover:border-matcha-300 hover:-translate-y-0.5'
                              }`}
                            >
                              {/* Badges */}
                              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                                  isThisSaved
                                    ? 'bg-matcha-900 text-cream-50'
                                    : isBestMatch
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-black/60 text-white backdrop-blur-sm'
                                }`}>
                                  #{cIdx + 1} {isBestMatch ? '★ Top 1' : ''}
                                </span>

                                <span className="px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-white/95 text-emerald-800 border border-emerald-200 shadow-sm">
                                  {siglipScore}% HD
                                </span>
                              </div>

                              {/* 3:4 Fashion Ratio Image */}
                              <div className="relative w-full aspect-[3/4] bg-matcha-100/40 rounded-xl overflow-hidden flex items-center justify-center border border-matcha-200/60 mb-2">
                                <img
                                  src={cand.thumbnail || cand.url}
                                  alt={cand.title || kw.withAccent}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    if (cand.url && e.target.src !== cand.url) {
                                      e.target.src = cand.url;
                                    }
                                  }}
                                />

                                {/* Hover Action Overlay */}
                                <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center ${
                                  isThisSaved
                                    ? 'bg-matcha-950/50 opacity-100'
                                    : 'bg-matcha-950/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px]'
                                }`}>
                                  {isThisSaved ? (
                                    <div className="flex flex-col items-center gap-1 text-cream-50">
                                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                        <Check className="w-5 h-5 stroke-[3]" />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider font-sans">ĐÃ CHỌN</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5 text-cream-50">
                                      <div className="w-8 h-8 rounded-full bg-cream-50 text-matcha-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Download className="w-4 h-4 stroke-[2.5]" />
                                      </div>
                                      <span className="text-[10px] font-bold text-cream-100 uppercase tracking-wide">Nhấp để lưu</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Image Caption */}
                              <div className="space-y-1 text-xs">
                                <p className="text-matcha-950 font-medium line-clamp-1 text-[11px] font-sans" title={cand.title}>
                                  {cand.title || kw.withAccent}
                                </p>
                                
                                <div className="flex items-center justify-between text-[10px] text-matcha-600 pt-1 border-t border-matcha-100 font-mono">
                                  <span>{cand.width > 0 && cand.height > 0 ? `${cand.width}×${cand.height}` : 'HD'}</span>
                                  <span className="truncate max-w-[80px] text-matcha-500" title={cand.domain}>{cand.domain}</span>
                                </div>
                              </div>

                              {/* Direct Save Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSaveCandidate(kw.id, cand.url);
                                }}
                                disabled={isSaving}
                                className={`mt-2 w-full py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                                  isThisSaved
                                    ? 'bg-matcha-100 text-matcha-900 border border-matcha-300'
                                    : isBestMatch
                                    ? 'bg-matcha-900 hover:bg-matcha-800 text-cream-50 shadow-sm'
                                    : 'bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200'
                                }`}
                              >
                                {isThisSaved ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Đã Lưu</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3 h-3 fill-current text-amber-400" />
                                    <span>Chọn mẫu #{cIdx + 1}</span>
                                  </>
                                )}
                              </button>

                            </div>
                          );
                        })}
                      </div>

                      {/* View all 10 candidates bottom bar */}
                      {kw.candidates.length > 5 && (
                        <div className="mt-3.5 pt-3 border-t border-matcha-100 flex items-center justify-between text-xs">
                          <span className="text-matcha-700">
                            Đang hiển thị 5/{kw.candidates.length} ứng viên tốt nhất được sàng lọc tự động.
                          </span>
                          <button
                            onClick={() => onOpenCandidateModal(kw)}
                            className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
                          >
                            <span>Mở hộp thoại xem đủ {kw.candidates.length} ảnh</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Uncrawled Minimalist Box */
                    <div className="py-8 px-4 text-center rounded-2xl bg-matcha-50/50 border border-dashed border-matcha-300">
                      <div className="w-10 h-10 rounded-full bg-white border border-matcha-200 flex items-center justify-center mx-auto mb-2 text-matcha-600 shadow-sm">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-fashion font-bold text-matcha-950">Chưa có ảnh ứng viên nào cho mẫu này</p>
                      <p className="text-xs text-matcha-600 mt-0.5">Bấm nút bên dưới để AI tự động tìm kiếm và sàng lọc 10 ảnh chuẩn thời trang từ internet.</p>
                      
                      <button
                        onClick={() => onCrawlSingle(kw.id)}
                        disabled={isSearching}
                        className="mt-3 px-5 py-2 rounded-full text-xs font-bold bg-matcha-900 hover:bg-matcha-800 text-cream-50 shadow-sm transition disabled:opacity-50"
                      >
                        <Search className="w-3.5 h-3.5 inline mr-1.5" />
                        {isSearching ? 'Đang tra cứu...' : 'Crawl 10 ảnh HD ngay'}
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-3xl bg-white border border-matcha-200 overflow-hidden shadow-fashion">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-matcha-100/70 text-matcha-800 uppercase tracking-wider font-semibold border-b border-matcha-200">
                <tr>
                  <th className="py-4 px-5 w-16 font-fashion text-sm">ID</th>
                  <th className="py-4 px-5">Tên Cổ Phục / Trang Phục</th>
                  <th className="py-4 px-5">Không Dấu / Tên Phụ</th>
                  <th className="py-4 px-5">Phân Loại Thư Mục</th>
                  <th className="py-4 px-5">Trạng Thái</th>
                  <th className="py-4 px-5">10 Ứng Viên / Ảnh Đã Lưu</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-matcha-100 text-matcha-900 font-normal">
                {filteredKeywords.map((kw) => {
                  const isSearching = loadingStates[`search_${kw.id}`];
                  const hasCandidates = kw.candidates && kw.candidates.length > 0;
                  const isSaved = kw.status === 'saved' && kw.savedImage;

                  return (
                    <tr 
                      key={kw.id} 
                      className={`hover:bg-matcha-50/60 transition duration-150 ${isSaved ? 'bg-matcha-50/40' : ''}`}
                    >
                      <td className="py-4 px-5 font-fashion font-bold text-sm text-matcha-900">
                        {kw.code}
                      </td>
                      <td className="py-4 px-5 font-medium text-matcha-950 text-sm">
                        {kw.withAccent}
                      </td>
                      <td className="py-4 px-5 text-matcha-600 font-mono text-[11px]">
                        <div>{kw.withoutAccent}</div>
                        {kw.alias && kw.alias !== kw.withoutAccent && (
                          <div className="text-[10px] text-matcha-400 italic">{kw.alias}</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-matcha-100 text-matcha-800 border border-matcha-200">
                          {kw.category.nameVi}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {isSearching ? (
                          <span className="inline-flex items-center gap-1.5 text-matcha-700 text-[11px]">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Đang lọc 10 ảnh...
                          </span>
                        ) : isSaved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-matcha-800 text-cream-50 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Đã lưu Local
                          </span>
                        ) : hasCandidates ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] font-medium">
                            <Cpu className="w-3 h-3 text-emerald-700" />
                            Có {kw.candidates.length} ảnh SigLIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-matcha-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            Chưa crawl
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {isSaved ? (
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-matcha-300 bg-matcha-100 flex-shrink-0">
                              <img
                                src={kw.savedImage.url}
                                alt={kw.withAccent}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-[10px] space-y-0.5">
                              <div className="text-matcha-900 font-mono font-medium">{kw.savedImage.dimensions} px</div>
                              <div className="text-matcha-500">{kw.savedImage.fileSizeKB} KB</div>
                            </div>
                          </div>
                        ) : hasCandidates ? (
                          <div className="flex items-center gap-1 max-w-xs overflow-x-auto py-1">
                            {kw.candidates.slice(0, 6).map((cand, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => onSaveCandidate(kw.id, cand.url)}
                                title={`#${cIdx + 1}: SigLIP ${cand.siglipScore || cand.qualityScore}% - Nhấp để lưu`}
                                className="w-8 h-8 rounded-lg border border-matcha-200 hover:border-emerald-600 overflow-hidden cursor-pointer bg-matcha-50 relative flex-shrink-0 group"
                              >
                                <img
                                  src={cand.thumbnail || cand.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 right-0 text-[7px] bg-black/75 px-0.5 text-white font-mono">
                                  #{cIdx + 1}
                                </span>
                              </div>
                            ))}
                            {kw.candidates.length > 6 && (
                              <span className="text-[10px] text-matcha-600 font-mono pl-1">
                                +{kw.candidates.length - 6}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-matcha-400 italic">Trống</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onCrawlSingle(kw.id)}
                            disabled={isSearching}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 transition disabled:opacity-50 whitespace-nowrap"
                          >
                            {isSearching ? 'Đang tìm...' : hasCandidates ? 'Tìm lại' : 'Crawl 10 ảnh'}
                          </button>

                          {hasCandidates && (
                            <button
                              onClick={() => onOpenCandidateModal(kw)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-matcha-100 hover:bg-matcha-200 text-matcha-900 border border-matcha-200 transition whitespace-nowrap"
                            >
                              Xem & Chọn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. GRID LOOKBOOK VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredKeywords.map((kw) => {
            const hasCandidates = kw.candidates && kw.candidates.length > 0;
            const isSaved = kw.status === 'saved' && kw.savedImage;
            const isSearching = loadingStates[`search_${kw.id}`];

            return (
              <div
                key={kw.id}
                className={`rounded-3xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                  isSaved
                    ? 'bg-white border-matcha-400 shadow-fashion ring-1 ring-matcha-200'
                    : 'bg-white border-matcha-200 hover:border-matcha-300 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-fashion text-sm font-bold text-matcha-900">
                      {kw.code}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-matcha-50 border border-matcha-200 text-matcha-800">
                      {kw.category.nameVi}
                    </span>
                  </div>

                  <h3 className="text-base font-fashion font-bold text-matcha-950 line-clamp-1 mb-0.5">
                    {kw.withAccent}
                  </h3>
                  <p className="text-xs text-matcha-600 font-mono mb-3 truncate">
                    {kw.withoutAccent}
                  </p>

                  <div className="w-full aspect-[3/4] bg-matcha-50 rounded-2xl overflow-hidden border border-matcha-200/80 relative mb-3 flex items-center justify-center">
                    {isSaved ? (
                      <>
                        <img
                          src={kw.savedImage.url}
                          alt={kw.withAccent}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-cream-100 font-mono flex items-center justify-between">
                          <span>{kw.savedImage.dimensions}</span>
                          <span>{kw.savedImage.fileSizeKB} KB</span>
                        </div>
                      </>
                    ) : hasCandidates ? (
                      <div className="grid grid-cols-3 gap-1 w-full h-full p-1.5 bg-matcha-100/50">
                        {kw.candidates.slice(0, 6).map((c, i) => (
                          <div 
                            key={i} 
                            onClick={() => onSaveCandidate(kw.id, c.url)}
                            className="relative rounded-lg overflow-hidden cursor-pointer group"
                            title={`Nhấp để lưu ảnh #${i+1} (${c.siglipScore || c.qualityScore}%)`}
                          >
                            <img src={c.thumbnail || c.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition" />
                            <span className="absolute top-1 left-1 text-[8px] bg-black/75 px-1 rounded text-white font-mono">#{i+1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-matcha-400 text-xs">
                        <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span>Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-matcha-100">
                  <button
                    onClick={() => onCrawlSingle(kw.id)}
                    disabled={isSearching}
                    className="flex-1 py-1.5 text-xs font-medium rounded-full bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 transition disabled:opacity-50"
                  >
                    {isSearching ? 'Đang tìm...' : 'Crawl 10 ảnh'}
                  </button>

                  {hasCandidates && (
                    <button
                      onClick={() => onOpenCandidateModal(kw)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-full bg-matcha-100 hover:bg-matcha-200 text-matcha-900 border border-matcha-200 transition"
                    >
                      Full 10 Ảnh
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
