import React, { useState } from 'react';
import { X, Check, Search, ExternalLink, ShieldCheck, AlertTriangle, Download, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matcha-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border border-matcha-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-matcha-100 bg-matcha-50/80">
          <div className="flex items-center gap-3.5">
            <span className="font-fashion text-base px-3.5 py-1 rounded-full bg-white text-matcha-900 font-bold border border-matcha-200 shadow-sm">
              {keyword.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-fashion font-bold text-matcha-950">
                  {keyword.withAccent}
                </h3>
                <span className="text-xs text-matcha-600 font-curvy text-lg">
                  ({keyword.withoutAccent})
                </span>
              </div>
              <p className="text-xs text-matcha-700 flex items-center gap-2 mt-0.5 font-sans">
                <span className="inline-block w-2 h-2 rounded-full bg-matcha-600"></span>
                Danh mục: <span className="text-matcha-900 font-medium">{keyword.category?.nameVi}</span>
                <span className="text-matcha-300">|</span>
                <span>Thư mục: <code className="text-matcha-800 font-mono bg-white px-1.5 py-0.2 rounded border border-matcha-200">dataset/{keyword.category?.id}/</code></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-matcha-600 hover:text-matcha-950 hover:bg-white rounded-full border border-transparent hover:border-matcha-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search refinement bar */}
        <div className="px-7 py-3.5 bg-cream-50 border-b border-matcha-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-matcha-200 focus-within:border-matcha-600 transition shadow-sm">
            <Search className="w-4 h-4 text-matcha-500" />
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm tùy chỉnh nếu cần tra cứu lại..."
              className="w-full bg-transparent text-xs text-matcha-950 focus:outline-none placeholder:text-matcha-400 font-sans"
            />
          </div>
          <button
            onClick={() => onReCrawl(keyword.id, customQuery)}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full bg-matcha-900 hover:bg-matcha-800 text-cream-50 transition disabled:opacity-50 font-sans shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Đang tìm...' : 'Tra cứu lại'}</span>
          </button>
        </div>

        {/* Candidates Grid */}
        <div className="p-7 overflow-y-auto flex-1 bg-cream-50/50">
          {candidates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-matcha-100 flex items-center justify-center mx-auto mb-3 text-matcha-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-fashion font-bold text-matcha-950">Chưa có ảnh ứng viên nào</p>
              <p className="text-xs text-matcha-600 mt-1">Bấm nút "Tra cứu lại" ở trên để tìm kiếm 3 ảnh tốt nhất.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-matcha-700" />
                  <span className="text-sm font-fashion font-bold text-matcha-950">
                    3 Tác phẩm ảnh được tuyển chọn tốt nhất:
                  </span>
                </div>
                <span className="text-xs text-matcha-600 font-sans">
                  Nhấp chọn ảnh ưng ý để lưu vào dataset
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidates.map((cand, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isDimensionValid = cand.width >= 300 && cand.height >= 300;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`group relative rounded-2xl border p-3.5 flex flex-col transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-matcha-50 border-matcha-600 shadow-fashion ring-2 ring-matcha-400'
                          : 'bg-white border-matcha-200 hover:border-matcha-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Ranking badge */}
                      <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-matcha-900 text-cream-50 shadow-sm">
                          #{idx + 1} Best Match
                        </span>
                        {cand.qualityBadge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-matcha-800 border border-matcha-200 shadow-sm">
                            {cand.qualityBadge}
                          </span>
                        )}
                      </div>

                      {/* Image Preview Container */}
                      <div className="relative w-full aspect-[3/4] bg-matcha-100/50 rounded-xl overflow-hidden flex items-center justify-center border border-matcha-200 mb-3">
                        <img
                          src={cand.thumbnail || cand.url}
                          alt={cand.title || keyword.withAccent}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = cand.url;
                          }}
                        />

                        {isSelected && (
                          <div className="absolute inset-0 bg-matcha-950/40 border-2 border-matcha-600 rounded-xl pointer-events-none flex items-center justify-center">
                            <div className="w-11 h-11 rounded-full bg-white text-matcha-900 flex items-center justify-center shadow-lg">
                              <Check className="w-6 h-6 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Metadata */}
                      <div className="flex-1 flex flex-col justify-between space-y-2 font-sans">
                        <div>
                          <p className="text-xs text-matcha-950 font-medium line-clamp-2" title={cand.title}>
                            {cand.title || keyword.withAccent}
                          </p>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-matcha-100">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-matcha-600">Độ phân giải:</span>
                            <span className="font-mono text-matcha-950 font-semibold">
                              {cand.width > 0 && cand.height > 0 ? `${cand.width} × ${cand.height} px` : 'Kiểm tra khi lưu'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-matcha-600">Nguồn:</span>
                            <span className="text-matcha-600 truncate max-w-[120px]" title={cand.domain}>
                              {cand.domain || 'Internet'}
                            </span>
                          </div>

                          <div className="mt-1">
                            {isDimensionValid ? (
                              <div className="flex items-center gap-1 text-[11px] text-matcha-700 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Kích thước đạt chuẩn kiểm định</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Kích thước kiểm định khi tải</span>
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
        <div className="px-7 py-4 bg-white border-t border-matcha-100 flex items-center justify-between">
          <div className="text-xs text-matcha-700 font-sans">
            {candidates[selectedIdx] ? (
              <span>
                Đang chọn: <strong className="text-matcha-950 font-fashion text-sm">Ứng viên #{selectedIdx + 1}</strong>
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
