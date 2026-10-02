import React from 'react';
import { 
  Sparkles, ArrowRight, BookOpen, Layers, ShieldCheck, 
  Compass, CheckCircle2, ChevronRight, Zap, Play, Heart, Bot
} from 'lucide-react';

const CURATED_LOOKBOOK_IMAGES_UP = [
  {
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    title: 'Áo Ngũ Thân Tay Chẽn',
    subtitle: 'Di sản Triều Nguyễn'
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&auto=format&fit=crop&q=80',
    title: 'Lụa Tơ Tằm Hà Đông',
    subtitle: 'Chất liệu Cổ truyền'
  },
  {
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80',
    title: 'Gen Z Sneaker Remix',
    subtitle: 'Streetwear Fusion'
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
    title: 'Khăn Vấn Nữ Sinh',
    subtitle: 'Thanh lịch & Tinh tế'
  },
  {
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80',
    title: 'Túi Bao Tử Contemporary',
    subtitle: 'Phụ kiện Năng động'
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80',
    title: 'Áo Đối Khâm Tân Thời',
    subtitle: 'Haute Couture Lookbook'
  }
];

const CURATED_LOOKBOOK_IMAGES_DOWN = [
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=700&auto=format&fit=crop&q=80',
    title: 'Áo Dài Lemur Cát Tường',
    subtitle: 'Thập niên 1930s'
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&auto=format&fit=crop&q=80',
    title: 'Nhật Bình Cung Đình',
    subtitle: 'Họa tiết Phụng Vũ'
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&auto=format&fit=crop&q=80',
    title: 'Dark Academia Heritage',
    subtitle: 'Phong cách Học đường'
  },
  {
    url: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=700&auto=format&fit=crop&q=80',
    title: 'Áo Giao Lĩnh Cổ Phục',
    subtitle: 'Thời Lê Trung Hưng'
  },
  {
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&auto=format&fit=crop&q=80',
    title: 'Guốc Mộc Quai Nhung',
    subtitle: 'Nét duyên Bắc Bộ'
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=700&auto=format&fit=crop&q=80',
    title: 'Editorial Runway Studio',
    subtitle: 'Việt Phục Remix 2026'
  }
];

export default function WelcomeWorkspace({ keywords = [], onStartRemix, onGoToLibrary }) {
  // Combine with local dataset images if available
  const datasetImages = keywords
    .filter(k => k.status === 'saved' && k.savedImage?.url)
    .map(k => ({
      url: k.savedImage.url,
      title: k.withAccent,
      subtitle: k.category?.nameVi || 'Cổ phục Việt'
    }));

  const streamUp = datasetImages.length >= 4 
    ? [...datasetImages.slice(0, Math.ceil(datasetImages.length / 2)), ...CURATED_LOOKBOOK_IMAGES_UP]
    : CURATED_LOOKBOOK_IMAGES_UP;

  const streamDown = datasetImages.length >= 4
    ? [...datasetImages.slice(Math.ceil(datasetImages.length / 2)), ...CURATED_LOOKBOOK_IMAGES_DOWN]
    : CURATED_LOOKBOOK_IMAGES_DOWN;

  // Duplicate for seamless infinite loop
  const listUp = [...streamUp, ...streamUp];
  const listDown = [...streamDown, ...streamDown];

  return (
    <div className="w-full h-[calc(100vh-95px)] min-h-[720px] rounded-3xl bg-white border border-matcha-200/90 shadow-fashion overflow-hidden flex flex-col lg:flex-row relative">
      
      {/* Luminous Ambient Matcha Background Glow */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-matcha-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* LEFT SECTION (54% WIDTH): HERO EDITORIAL BRANDING & CALL TO ACTION        */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full lg:w-[54%] p-8 sm:p-12 2xl:p-16 flex flex-col justify-between items-center text-center overflow-y-auto">
        
        {/* Top Capsule Tag */}
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-matcha-100/90 border border-matcha-300 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-matcha-600 animate-pulse" />
            <span className="text-xs font-bold text-matcha-950 uppercase tracking-widest font-sans">
              L'Atelier AI Stylist Studio
            </span>
          </div>

          <span className="text-xs font-fashion font-bold text-matcha-800 bg-matcha-50 px-3.5 py-1.5 rounded-full border border-matcha-200">
            Heritage × Gen Z Streetwear
          </span>
        </div>

        {/* Main Centered Headline & Description */}
        <div className="my-auto py-6 max-w-2xl flex flex-col items-center space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <span className="font-curvy text-4xl sm:text-5xl 2xl:text-6xl text-matcha-700 font-bold tracking-wide">
                L’Art du Costume
              </span>
            </div>

            <h1 className="font-fashion text-5xl sm:text-6xl 2xl:text-7xl font-bold tracking-tight text-matcha-950 leading-[1.06]">
              AI STYLIST <br />
              <span className="matcha-gradient-text">Việt Phục Remix</span>
            </h1>

            <p className="text-xs sm:text-sm 2xl:text-base text-matcha-600 font-mono tracking-widest uppercase pt-1">
              Hệ thống Phối đồ Di sản Thông minh & Kho Tri thức Cổ phục
            </p>
          </div>

          {/* Core Description (Larger & Centered) */}
          <p className="text-base sm:text-lg 2xl:text-xl text-matcha-800/90 leading-relaxed font-sans max-w-xl mx-auto">
            Cầu nối hoàn hảo giữa <strong>1,270 quy tắc phục trang di sản cung đình</strong> và hơi thở <strong>thời trang đương đại</strong>. 
            Chia sẻ hoàn cảnh và vóc dáng của bạn để AI Stylist tư vấn, phối ghép và minh họa trực quan trực tiếp lên người mẫu 3D trong studio.
          </p>

          {/* 3 Key Heritage Value Pillars */}
          <div className="grid grid-cols-3 gap-3.5 2xl:gap-5 w-full max-w-lg pt-1">
            <div className="p-4 2xl:p-5 rounded-2xl bg-matcha-50/90 border border-matcha-200/90 shadow-sm text-center">
              <span className="font-fashion text-2xl 2xl:text-3xl font-bold text-matcha-950 block">100</span>
              <span className="text-xs 2xl:text-sm text-matcha-700 font-medium leading-tight block mt-1">
                Tác phẩm Dataset
              </span>
            </div>

            <div className="p-4 2xl:p-5 rounded-2xl bg-matcha-50/90 border border-matcha-200/90 shadow-sm text-center">
              <span className="font-fashion text-2xl 2xl:text-3xl font-bold text-matcha-950 block">1,270</span>
              <span className="text-xs 2xl:text-sm text-matcha-700 font-medium leading-tight block mt-1">
                Quy tắc phối đồ di sản
              </span>
            </div>

            <div className="p-4 2xl:p-5 rounded-2xl bg-matcha-50/90 border border-matcha-200/90 shadow-sm text-center">
              <span className="font-fashion text-2xl 2xl:text-3xl font-bold text-matcha-950 block">Live RAG</span>
              <span className="text-xs 2xl:text-sm text-matcha-700 font-medium leading-tight block mt-1">
                ram/gemini-3.6
              </span>
            </div>
          </div>

          {/* Primary Action Buttons (Larger & Centered) */}
          <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={onStartRemix}
              className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-full bg-matcha-900 hover:bg-matcha-800 text-cream-50 font-fashion text-lg 2xl:text-xl font-bold tracking-wide shadow-xl hover:shadow-2xl shadow-matcha-950/25 transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
            >
              <Sparkles className="w-5 h-5 2xl:w-6 2xl:h-6 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Trải nghiệm ngay</span>
              <div className="w-8 h-8 rounded-full bg-cream-50/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform duration-300">
                <ArrowRight className="w-5 h-5 text-cream-50" />
              </div>
            </button>

            <button
              onClick={onGoToLibrary}
              className="inline-flex items-center gap-2.5 px-7 py-5 rounded-full bg-white hover:bg-matcha-50 text-matcha-900 font-sans text-sm 2xl:text-base font-bold border border-matcha-300 shadow-sm transition hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 2xl:w-5 2xl:h-5 text-matcha-700" />
              <span>Khám phá Thư viện</span>
            </button>
          </div>

        </div>

        {/* Left Footer Badges */}
        <div className="pt-4 border-t border-matcha-200 w-full flex items-center justify-between text-xs text-matcha-700 font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Được bảo chứng bởi quy tắc di sản truyền thống</span>
          </div>

          <span className="text-[11px] text-matcha-500 font-mono">
            Việt Phục Remix Studio v1.0
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT SECTION (46% WIDTH): DUAL INFINITE SCROLLING RUNWAY FILMSTRIPS     */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[46%] h-full bg-[#142013] border-l border-[#243722] overflow-hidden pointer-events-none flex items-center justify-center p-3 2xl:p-5">
        
        {/* Top & Bottom Gradient Filmstrip Masks for Seamless Fading */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#142013] via-[#142013]/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#142013] via-[#142013]/90 to-transparent z-20 pointer-events-none" />

        {/* Center Golden Accent Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-matcha-600/10 via-amber-400/5 to-transparent z-10 pointer-events-none" />

        {/* Dual Scrolling Columns Container */}
        <div className="w-full h-full grid grid-cols-2 gap-3.5 2xl:gap-5">
          
          {/* COLUMN 1: INFINITE SCROLL UP (DẢI TRÔI LÊN) */}
          <div className="relative h-full overflow-hidden">
            <div className="flex flex-col gap-4 animate-marquee-up">
              {listUp.map((item, idx) => (
                <div
                  key={`up-${idx}`}
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#374e33] bg-[#1a2b18] shadow-2xl flex-shrink-0"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[9px] uppercase font-bold text-amber-300 font-mono tracking-wider block">
                      {item.subtitle}
                    </span>
                    <p className="text-xs font-fashion font-bold text-cream-50 truncate mt-0.5">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: INFINITE SCROLL DOWN (DẢI TRÔI XUỐNG) */}
          <div className="relative h-full overflow-hidden">
            <div className="flex flex-col gap-4 animate-marquee-down">
              {listDown.map((item, idx) => (
                <div
                  key={`down-${idx}`}
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[#374e33] bg-[#1a2b18] shadow-2xl flex-shrink-0"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[9px] uppercase font-bold text-matcha-300 font-mono tracking-wider block">
                      {item.subtitle}
                    </span>
                    <p className="text-xs font-fashion font-bold text-cream-50 truncate mt-0.5">
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
