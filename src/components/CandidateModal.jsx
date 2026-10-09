import React, { useState } from 'react';
import { X, Check, Search, ExternalLink, ShieldCheck, AlertTriangle, Download, RefreshCw, Sparkles, Image as ImageIcon, Cpu, Zap } from 'lucide-react';

export default function CandidateModal({
  keyword,
  onClose,
  onSaveCandidate,
  onReCrawl,
  isSaving,
  isSearching
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customQuery, setCustomQuery] = useState(keyword?.searchQuery || '');
  const candidates = keyword?.candidates || [];

  if (!keyword) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-matcha-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-white border border-matcha-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-matcha-100 bg-matcha-50/90">
          <div className="flex items-center gap-3.5">
            <span className="font-fashion text-base px-3.5 py-1 rounded-full bg-white text-matcha-900 font-bold border border-matcha-200 shadow-sm">
              {keyword.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-fashion font-bold text-matcha-950">
                  {keyword.withAccent}
                </h3>
                <span className="text-xs text-matcha-600 font-curvy text-lg">
                  ({keyword.withoutAccent})
                </span>
              </div>
              <p className="text-xs text-matcha-700 flex flex-wrap items-center gap-2 mt-0.5 font-sans">
                <span className="inline-block w-2 h-2 rounded-full bg-matcha-600"></span>
                Danh mục: <span className="text-matcha-900 font-medium">{keyword.category?.nameVi}</span>
                <span className="text-matcha-300">|</span>
                <span>Lưu vào: <code className="text-matcha-800 font-mono bg-white px-1.5 py-0.2 rounded border border-matcha-200">dataset/{keyword.category?.id}/</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-800">
              <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Google SigLIP 2 Vision AI Sàng Lọc</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-matcha-600 hover:text-matcha-950 hover:bg-white rounded-full border border-transparent hover:border-matcha-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search refinement bar */}
        <div className="px-6 py-3 bg-cream-50 border-b border-matcha-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-matcha-200 focus-within:border-matcha-600 transition shadow-sm">
            <Search className="w-4 h-4 text-matcha-500" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm tùy chỉnh nếu cần tra cứu lại 10 ảnh mới..."
              className="w-full bg-transparent text-xs text-matcha-950 focus:outline-none placeholder:text-matcha-400 font-sans"
            />
          </div>
          <button
            onClick={() => onReCrawl(keyword.id, customQuery)}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full bg-matcha-900 hover:bg-matcha-800 text-cream-50 transition disabled:opacity-50 font-sans shadow-sm whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Đang lọc 10 ảnh...' : 'Tra cứu lại (10 ảnh)'}</span>
          </button>
        </div>

        {/* Candidates Grid (10 items) */}
        <div className="p-6 overflow-y-auto flex-1 bg-cream-50/50">
          {candidates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-matcha-100 flex items-center justify-center mx-auto mb-3 text-matcha-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-fashion font-bold text-matcha-950">Chưa có ảnh ứng viên nào</p>
              <p className="text-xs text-matcha-600 mt-1">Bấm nút "Tra cứu lại" ở trên để AI tìm kiếm và sàng lọc 10 ảnh tốt nhất.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-matcha-700" />
                  <span className="text-sm font-fashion font-bold text-matcha-950">
                    Top {candidates.length} Tác Phẩm Tuyển Chọn Bằng Google SigLIP 2 AI:
                  </span>
                </div>
                <span className="text-xs text-matcha-600 font-sans">
                  Nhấp chọn 1 ảnh ưng ý nhất để lưu vào thư mục
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {candidates.map((cand, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isDimensionValid = (cand.width || 0) >= 200 && (cand.height || 0) >= 200;
                  const siglipVal = cand.siglipScore ?? cand.qualityScore ?? 75;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group relative rounded-2xl border p-2.5 flex flex-col transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-matcha-50 border-matcha-600 shadow-fashion ring-2 ring-matcha-500 scale-[1.02]'
                          : 'bg-white border-matcha-200 hover:border-matcha-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Rank Badge */}
                      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
                          idx === 0 
                            ? 'bg-amber-600 text-white font-extrabold ring-1 ring-white' 
                            : idx < 3 
                              ? 'bg-matcha-900 text-cream-50' 
                              : 'bg-matcha-800/90 text-cream-100'
                        }`}>
                          #{idx + 1} {idx === 0 ? '★ Top 1' : ''}
                        </span>

                        {siglipVal > 0 && (
                          <span className="px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-black/75 text-emerald-300 backdrop-blur-sm border border-emerald-500/40">
                            SigLIP: {siglipVal}%
                          </span>
                        )}
                      </div>

                      {/* Image Preview Container */}
                      <div className="relative w-full aspect-[3/4] bg-matcha-100/40 rounded-xl overflow-hidden flex items-center justify-center border border-matcha-200 mb-2">
                        <img
                          src={cand.thumbnail || cand.url}
                          alt={cand.title || keyword.withAccent}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            if (cand.url && e.target.src !== cand.url) {
                              e.target.src = cand.url;
                            }
                          }}
                        />

                        {isSelected && (
                          <div className="absolute inset-0 bg-matcha-950/40 border-2 border-matcha-600 rounded-xl pointer-events-none flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-white text-matcha-900 flex items-center justify-center shadow-lg animate-scaleIn">
                              <Check className="w-5 h-5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Metadata */}
                      <div className="flex-1 flex flex-col justify-between space-y-1.5 font-sans">
                        <div>
                          <p className="text-[11px] text-matcha-950 font-medium line-clamp-2 leading-tight" title={cand.title}>
                            {cand.title || keyword.withAccent}
                          </p>
                        </div>

                        <div className="space-y-1 pt-1.5 border-t border-matcha-100 text-[10px]">
                          <div className="flex items-center justify-between text-matcha-700">
                            <span>Độ phân giải:</span>
                            <span className="font-mono font-semibold text-matcha-950">
                              {cand.width > 0 && cand.height > 0 ? `${cand.width}×${cand.height}` : 'Chuẩn HD'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-matcha-600">
                            <span>Nguồn:</span>
                            <span className="truncate max-w-[80px]" title={cand.domain}>
                              {cand.domain || 'Web'}
                            </span>
                          </div>

                          <div className="pt-0.5">
                            {isDimensionValid ? (
                              <div className="flex items-center gap-1 text-[9.5px] text-emerald-700 font-medium truncate">
                                <ShieldCheck className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                                <span>Đạt chuẩn kích thước</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[9.5px] text-amber-700 truncate">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0 text-amber-600" />
                                <span>Kiểm tra khi tải</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-matcha-100 flex items-center justify-between">
          <div className="text-xs text-matcha-700 font-sans">
            {candidates[selectedIdx] ? (
              <span>
                Đang chọn: <strong className="text-matcha-950 font-fashion text-sm">Ứng viên #{selectedIdx + 1}</strong>
                {candidates[selectedIdx]?.siglipScore && (
                  <span className="ml-2 text-emerald-700 font-semibold">(Độ khớp SigLIP 2: {candidates[selectedIdx].siglipScore}%)</span>
                )}
              </span>
            ) : (
              <span>Chưa có ảnh được chọn</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium rounded-full text-matcha-700 hover:text-matcha-950 hover:bg-matcha-50 transition"
            >
              Hủy bỏ
            </button>

            <button
              disabled={candidates.length === 0 || isSaving}
              onClick={() => onSaveCandidate(keyword.id, candidates[selectedIdx]?.url)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-matcha-900 hover:bg-matcha-800 text-cream-50 shadow-md transition disabled:opacity-50 font-sans uppercase tracking-wide"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Lưu ảnh vào thư mục</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
