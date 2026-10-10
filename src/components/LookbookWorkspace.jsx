import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Download, Trash2, Eye, ShieldCheck, AlertCircle, 
  Clock, ArrowRight, RefreshCw, Filter, Search, Layers, 
  ExternalLink, Calendar, Crown, Heart, CheckCircle2, ChevronRight, X
} from 'lucide-react';

export default function LookbookWorkspace({ onGoToRemix, onRemixAgain }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'safe' | 'male' | 'female'
  const [selectedItem, setSelectedItem] = useState(null); // Modal view

  // Fetch lookbook items
  const fetchLookbook = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lookbook');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (e) {
      console.warn('Failed to load lookbook:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookbook();
  }, []);

  // Handle delete item
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa tác phẩm này khỏi Lookbook?')) return;

    try {
      const res = await fetch(`/api/lookbook/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (err) {
      alert('Không thể xóa tác phẩm');
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search text
      const textMatch = searchQuery === '' || 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.prompt && item.prompt.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter chips
      if (!textMatch) return false;
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'safe') {
        return item.guardrail?.status === 'SAFE' || (item.guardrail?.scores?.overall >= 80);
      }
      if (selectedFilter === 'male') {
        const text = `${item.title} ${item.prompt}`.toLowerCase();
        return text.includes('nam') || text.includes('men') || text.includes('khăn đóng');
      }
      if (selectedFilter === 'female') {
        const text = `${item.title} ${item.prompt}`.toLowerCase();
        return text.includes('nữ') || text.includes('women') || text.includes('nhật bình') || text.includes('khăn vành');
      }
      return true;
    });
  }, [items, searchQuery, selectedFilter]);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-r from-cream-50 via-matcha-50 to-emerald-50/70 border border-matcha-300/80 rounded-3xl p-6 sm:p-8 shadow-fashion relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-matcha-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-matcha-900 text-cream-50 shadow-sm flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                Haute Couture Archives
              </span>
              <span className="text-[11px] font-fashion font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {items.length} Tác Phẩm Đã Lưu
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-fashion font-bold text-matcha-950 tracking-tight">
              Bộ Sưu Tập Lookbook Cổ Phục Cá Nhân
            </h1>
            <p className="text-xs sm:text-sm text-matcha-800 mt-1.5 max-w-2xl leading-relaxed">
              Toàn bộ các tác phẩm ảnh phối đồ Cổ phục Việt do bạn kiến tạo thông qua <strong>AI Haute Couture Studio</strong>. Mỗi tác phẩm đều được lưu trữ độ phân giải cao và thẩm định theo Bộ Tri thức Di sản.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLookbook}
              className="p-3 rounded-2xl bg-white hover:bg-matcha-50 text-matcha-800 border border-matcha-300 shadow-sm transition"
              title="Làm mới bộ sưu tập"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onGoToRemix}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 font-fashion font-bold text-xs shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Sáng Tạo Mới Trong Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-matcha-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-matcha-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên trang phục, prompt..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-cream-50 border border-matcha-200 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-matcha-400 hover:text-matcha-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả tác phẩm' },
            { id: 'safe', label: '🇻🇳 Đạt chuẩn văn hóa' },
            { id: 'male', label: 'Trang phục Nam' },
            { id: 'female', label: 'Trang phục Nữ' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedFilter === f.id
                  ? 'bg-matcha-900 text-cream-50 shadow-sm'
                  : 'bg-cream-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Gallery */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-matcha-300 border-t-matcha-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-fashion font-bold text-matcha-800">Đang tải bộ sưu tập Lookbook...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-matcha-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-matcha-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-fashion font-bold text-base text-matcha-950">Chưa có tác phẩm nào</h3>
            <p className="text-xs text-matcha-600 mt-1 leading-relaxed">
              {searchQuery ? 'Không tìm thấy tác phẩm phù hợp với bộ lọc.' : 'Hãy vào Remix Room để trải nghiệm phối đồ 5 lớp và tạo ra những bộ trang phục di sản tuyệt mỹ đầu tiên.'}
            </p>
          </div>
          <button
            onClick={onGoToRemix}
            className="px-6 py-2.5 rounded-full bg-matcha-900 hover:bg-matcha-950 text-cream-50 font-fashion font-bold text-xs shadow-md transition"
          >
            Đến Remix Room Ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item, idx) => {
            const hasGuardrail = Boolean(item.guardrail);
            const score = item.guardrail?.scores?.overall || item.guardrail?.overallScore;
            const status = item.guardrail?.status || 'SAFE';

            return (
              <div
                key={item.id || idx}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-white border border-matcha-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-matcha-400 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-matcha-50 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title || 'Việt Phục Remix'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-cream-100 backdrop-blur-md">
                      8K Studio
                    </span>

                    {hasGuardrail && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm ${
                        status === 'SAFE' 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/30' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-400/30'
                      }`}>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{score ? `${score}đ` : 'Đạt chuẩn'}</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Hover Quick Actions */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-[11px] font-fashion font-bold text-cream-50 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.url}
                        download={`${item.filename || 'lookbook_remix.jpg'}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-matcha-900 shadow transition"
                        title="Tải ảnh 8K"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-200 shadow transition"
                        title="Xóa tác phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-fashion font-bold text-sm text-matcha-950 truncate">
                      {item.title || 'Tác Phẩm Việt Phục Remix'}
                    </h3>

                    <p className="text-[11px] text-matcha-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.prompt || 'Trang phục di sản kết hợp phong cách đương đại'}
                    </p>
                  </div>

                  {/* Date & Layers Preview */}
                  <div className="pt-2 border-t border-matcha-100 flex items-center justify-between text-[10px] text-matcha-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-matcha-400" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>

                    {item.layers && (
                      <span className="text-emerald-700 font-bold">5 Lớp Phối</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-matcha-200 flex flex-col md:flex-row">
            
            {/* Left High-res Image Preview */}
            <div className="md:w-1/2 bg-black/90 flex items-center justify-center relative min-h-[360px] md:min-h-full">
              <img
                src={selectedItem.url}
                alt={selectedItem.title}
                className="max-h-[85vh] w-auto object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full font-mono backdrop-blur-md">
                Gemini 3.0 Pro Image 8K
              </div>
            </div>

            {/* Right Information & Cultural Review */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-matcha-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-matcha-600 block">
                    Chi Tiết Tác Phẩm Lookbook
                  </span>
                  <h2 className="text-lg font-fashion font-bold text-matcha-950 mt-0.5">
                    {selectedItem.title || 'Tác Phẩm Việt Phục Remix'}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-full hover:bg-cream-100 text-matcha-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formula & Layers */}
              {selectedItem.layers && (
                <div className="p-3 rounded-2xl bg-cream-50 border border-matcha-200 space-y-2 text-xs">
                  <span className="font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-matcha-700" />
                    Công Thức 6 Lớp Trang Phục (Haute Couture):
                  </span>
                  <div className="space-y-1 text-[11px] text-matcha-800">
                    {selectedItem.layers.innerwear && <div>• <strong>Lớp Trong:</strong> {selectedItem.layers.innerwear.name || selectedItem.layers.innerwear}</div>}
                    {selectedItem.layers.top && <div>• <strong>Áo Ngoài:</strong> {selectedItem.layers.top.name || selectedItem.layers.top}</div>}
                    {selectedItem.layers.bottom && <div>• <strong>Quần/Xiêm:</strong> {selectedItem.layers.bottom.name || selectedItem.layers.bottom}</div>}
                    {selectedItem.layers.headwear && <div>• <strong>Mũ/Khăn:</strong> {selectedItem.layers.headwear.name || selectedItem.layers.headwear}</div>}
                    {selectedItem.layers.footwear && <div>• <strong>Giày/Hài:</strong> {selectedItem.layers.footwear.name || selectedItem.layers.footwear}</div>}
                    {selectedItem.layers.accessories && selectedItem.layers.accessories.length > 0 ? (
                      <div>• <strong>Phụ kiện:</strong> {selectedItem.layers.accessories.map(a => a.name || a).join(', ')}</div>
                    ) : selectedItem.layers.accessory ? (
                      <div>• <strong>Phụ kiện:</strong> {selectedItem.layers.accessory.name || selectedItem.layers.accessory}</div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Prompt Context */}
              <div className="space-y-1">
                <label className="text-[11px] font-fashion font-bold text-matcha-900">Prompt & Bối Cảnh:</label>
                <p className="text-xs font-mono p-3 rounded-xl bg-cream-50 text-matcha-950 border border-matcha-200/80 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedItem.prompt || 'Không có ghi chú prompt'}
                </p>
              </div>

              {/* Cultural Guardrail Breakdown (if available) */}
              {selectedItem.guardrail && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-fashion font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Thẩm Định Văn Hóa
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-900 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                      {selectedItem.guardrail.scores?.overall || 94}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 italic leading-relaxed">
                    "{selectedItem.guardrail.summary}"
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-matcha-100 flex items-center gap-2">
                <a
                  href={selectedItem.url}
                  download={`${selectedItem.filename || 'lookbook_remix.jpg'}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 font-fashion font-bold text-xs shadow transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Tải Xuống 8K</span>
                </a>

                {onRemixAgain && selectedItem.layers && (
                  <button
                    onClick={() => {
                      onRemixAgain(selectedItem.layers);
                      setSelectedItem(null);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-matcha-950 font-fashion font-bold text-xs border border-matcha-300 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-matcha-700" />
                    <span>Phối Lại Trong Studio</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
