import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, RefreshCw, Layers, ShieldCheck, 
  Trash2, ExternalLink, HelpCircle, Check, Download, Info, Zap, 
  Shirt, Scissors, Heart, Compass, ArrowUpRight, CheckCircle2,
  Palette, Camera, Copy, Eye, Flame, Moon, Sparkle, Cpu
} from 'lucide-react';
import manImg from '../human model/man 1.jpg';
import MarkdownRenderer from './MarkdownRenderer';

// 1. Initial suggestion bubbles when NO outfit has been chosen yet (Gợi ý chọn hoàn cảnh / vóc dáng)
const INITIAL_SELECTION_BUBBLES = [
  {
    id: 'tall-active',
    title: 'Nữ, dáng cao, di chuyển nhiều',
    prompt: 'Tôi là nữ, dáng người cao ráo, cần một bộ Việt phục kết hợp hiện đại để đi chơi, dạo phố và di chuyển nhiều năng động.',
    icon: Sparkles,
    colorClass: 'from-emerald-500/15 to-matcha-500/10 border-matcha-300 text-matcha-950 hover:bg-matcha-100 hover:border-matcha-500'
  },
  {
    id: 'petite-dark',
    title: 'Nữ, dáng nhỏ nhắn, thích tone tối',
    prompt: 'Tôi là nữ dáng người nhỏ nhắn, thích phong cách Cổ phục tone màu tối huyền bí, sang trọng và tôn dáng.',
    icon: Moon,
    colorClass: 'from-stone-500/15 to-neutral-500/10 border-stone-300 text-stone-950 hover:bg-stone-100 hover:border-stone-500'
  },
  {
    id: 'festival-formal',
    title: 'Đi lễ hội / Tết thanh lịch chụp ảnh',
    prompt: 'Tôi muốn tư vấn một bộ Cổ phục trang trọng, thanh lịch để đi dự lễ hội truyền thống hoặc du xuân chụp ảnh Tết.',
    icon: Sparkle,
    colorClass: 'from-amber-500/15 to-rose-500/10 border-amber-300 text-amber-950 hover:bg-amber-100 hover:border-amber-500'
  },
  {
    id: 'genz-sneaker',
    title: 'Gen Z mix Áo ngũ thân với Sneaker',
    prompt: 'Tôi muốn một outfit Gen Z trẻ trung đi học, mix Áo ngũ thân tay chẽn cùng giày Sneaker năng động.',
    icon: Zap,
    colorClass: 'from-sky-500/15 to-indigo-500/10 border-sky-300 text-sky-950 hover:bg-sky-100 hover:border-sky-500'
  },
  {
    id: 'dark-academia',
    title: 'Phong cách Dark Academia phối Cổ phục',
    prompt: 'Tư vấn phong cách Dark Academia kết hợp giữa áo dài Cổ phục Việt Nam và phụ kiện da cổ điển.',
    icon: Eye,
    colorClass: 'from-amber-700/15 to-stone-600/10 border-amber-400 text-amber-950 hover:bg-amber-100 hover:border-amber-600'
  }
];

// 2. The 3 Dynamic follow-up quick chat bubbles shown AFTER outfit has been selected/generated
const OUTFIT_FOLLOW_UP_BUBBLES = [
  {
    id: 'remix-again',
    title: 'Chưa cảm thấy phù hợp, hãy tạo kiểu khác',
    shortLabel: 'Tạo kiểu khác',
    icon: RefreshCw,
    colorClass: 'from-amber-500/15 to-orange-500/10 border-amber-300 text-amber-950 hover:bg-amber-100/80 hover:border-amber-500',
    prompt: 'Tôi chưa cảm thấy bộ trang phục này thực sự phù hợp với phong cách của mình. Hãy tạo một kiểu phối đồ khác độc đáo hơn, kết hợp Việt phục và phụ kiện hiện đại mới mẻ nhé!'
  },
  {
    id: 'color-palette',
    title: 'Tôi muốn xem cách phối màu phù hợp với trang phục này',
    shortLabel: 'Xem cách phối màu & Phong thủy',
    icon: Palette,
    colorClass: 'from-emerald-500/15 to-teal-500/10 border-emerald-300 text-emerald-950 hover:bg-emerald-100/80 hover:border-emerald-500',
    prompt: 'Tôi muốn xem cách phối màu phù hợp với trang phục này. Hãy đưa ra các bảng phối màu hiện đại kèm mã HEX, và phân tích chi tiết ý nghĩa tâm linh, phong thủy ngũ hành của từng màu như một thầy bói thời trang cao tay nhé!'
  },
  {
    id: 'posing-guide',
    title: 'Tôi nên tạo dáng thế nào khi chụp với bộ trang phục này?',
    shortLabel: 'Gợi ý tạo dáng chụp ảnh',
    icon: Camera,
    colorClass: 'from-sky-500/15 to-indigo-500/10 border-sky-300 text-sky-950 hover:bg-sky-100/80 hover:border-sky-500',
    prompt: 'Tôi nên tạo dáng thế nào khi chụp ảnh với bộ trang phục này? Hãy gợi ý các tư thế chụp dạo phố, chụp tĩnh tâm và góc máy tôn trọn thần thái di sản của Việt phục!'
  }
];

// Modern Color Swatch & Fortune-Teller Spiritual Component
function ColorPalettesView({ palettes }) {
  const [copiedHex, setCopiedHex] = useState(null);

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  if (!palettes || !Array.isArray(palettes) || palettes.length === 0) return null;

  return (
    <div className="mt-4 space-y-4 font-sans">
      <div className="flex items-center gap-2 pb-2 border-b border-matcha-200/80">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm">
          <Palette className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-matcha-950">
          Bảng Phối Màu Hoàng Gia & Phong Thủy Di Sản
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {palettes.map((pal, pIdx) => (
          <div 
            key={pIdx}
            className="rounded-2xl bg-white/90 border border-matcha-200 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-fashion font-bold text-matcha-950">
                {pal.paletteName}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                {pal.vibe}
              </span>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-4 gap-2">
              {pal.colors.map((c, cIdx) => (
                <div 
                  key={cIdx}
                  onClick={() => copyToClipboard(c.hex)}
                  className="group relative flex flex-col items-center p-2 rounded-xl border border-matcha-100 hover:border-matcha-400 bg-matcha-50/50 cursor-pointer transition"
                  title="Nhấp để copy mã HEX"
                >
                  <div 
                    className="w-full h-8 rounded-lg shadow-inner mb-1.5 transition group-hover:scale-105"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] font-bold text-matcha-950 truncate w-full text-center">
                    {c.name}
                  </span>
                  <span className="text-[9px] font-mono text-matcha-600 flex items-center gap-0.5">
                    {copiedHex === c.hex ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : c.hex}
                  </span>
                </div>
              ))}
            </div>

            {/* Fortune-Teller / Spiritual Analysis */}
            {pal.fortuneMeaning && (
              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-cream-100 border border-amber-200/80 p-3 text-xs text-amber-950 leading-relaxed flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">🔮</span>
                <div>
                  <strong className="font-fashion font-bold text-amber-900 block mb-0.5">Luận Giải Phong Thủy & Ý Nghĩa:</strong>
                  <p className="text-[11px] text-amber-900/90 italic font-serif leading-normal">
                    {pal.fortuneMeaning}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RemixRoomWorkspace({ savedCount, onSwitchToCrawl }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Kính chào quý cô! Tôi là **AI Stylist Cổ Phục** của *L'Atelier Việt Phục Remix*. 

Tôi được trang bị toàn bộ **Cẩm nang 1,270 quy tắc phối đồ di sản** (\`phoi do.txt\`), tích hợp **Mobile-VTON Virtual Try-On** và kết nối trực tiếp với **kho 100 tác phẩm Dataset**.

👉 Xin vui lòng chia sẻ vóc dáng và hoàn cảnh bạn muốn diện (ví dụ: *Nữ dáng cao, đi chơi dạo phố nhiều năng động* hoặc *Đi tiệc Tết thanh lịch*), tôi sẽ tư vấn và **tự động thay trang phục Áo & Quần trực tiếp lên người mẫu bằng AI**!`,
      outfit: null,
      colorPalettes: null
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState({
    outfitTitle: 'Lookbook Mẫu: Cổ Phục Dạo Phố Năng Động',
    styleVibe: 'Gen Z Heritage / Streetwear Remix',
    recommendedItems: [
      {
        slot: 'top',
        code: 'VP_001',
        name: 'Áo ngũ thân tay chẽn',
        reason: 'Phom áo gọn gàng, tôn dáng cao thanh thoát và thuận tiện di chuyển cả ngày',
        categoryName: 'Áo Cổ Phục',
        imageUrl: '/api/dataset/01_ao_co_phuc/VP_001_ao_ngu_than_tay_chen.jpg',
        isSavedLocal: true
      },
      {
        slot: 'bottom',
        code: 'VP_015',
        name: 'Quần lụa ống rộng truyền thống',
        reason: 'Chất liệu lụa mềm mại, thoải mái vận động và tạo bước đi thướt tha',
        categoryName: 'Quần & Váy Cổ Phục',
        imageUrl: '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
        isSavedLocal: true
      },
      {
        slot: 'footwear',
        code: 'VP_039',
        name: 'Sneaker trắng cổ thấp',
        reason: 'Điểm nhấn Gen Z thời thượng, êm ái cho mọi hoạt động dạo phố',
        categoryName: 'Giày Dép',
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60',
        isSavedLocal: false
      },
      {
        slot: 'accessory',
        code: 'VP_051',
        name: 'Túi bao tử đeo chéo',
        reason: 'Gọn gàng mang theo đồ cá nhân, tăng chất cá tính Streetwear',
        categoryName: 'Phụ Kiện',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
        isSavedLocal: false
      }
    ]
  });

  // Mobile-VTON Virtual Try-On Live States
  const [tryonResultUrl, setTryonResultUrl] = useState(null);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryonMode, setTryonMode] = useState('vton'); // 'vton' | 'original'
  const [tryonSteps, setTryonSteps] = useState([]);
  const [tryonDetails, setTryonDetails] = useState(null);

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Execute Virtual Try-On using Mobile-VTON Pipeline
  const executeVirtualTryOn = async (outfit) => {
    if (!outfit || !outfit.recommendedItems) return;
    const topItem = outfit.recommendedItems.find(i => i.slot === 'top');
    const bottomItem = outfit.recommendedItems.find(i => i.slot === 'bottom');

    setIsTryingOn(true);
    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topCode: topItem?.code,
          topUrl: topItem?.imageUrl,
          topName: topItem?.name,
          bottomCode: bottomItem?.code,
          bottomUrl: bottomItem?.imageUrl,
          bottomName: bottomItem?.name
        })
      });
      const data = await res.json();
      if (data.success && data.resultUrl) {
        setTryonResultUrl(data.resultUrl);
        setTryonMode('vton');
        setTryonSteps(data.steps || []);
        setTryonDetails(data.details || {});
      }
    } catch (err) {
      console.warn('[VTON Execution Warning]:', err);
    } finally {
      setIsTryingOn(false);
    }
  };

  // Run try-on when initial lookbook or outfit changes
  useEffect(() => {
    if (currentOutfit && currentOutfit.recommendedItems) {
      executeVirtualTryOn(currentOutfit);
    }
  }, [currentOutfit?.outfitTitle]);

  // Handle send message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat-remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history })
      });

      const data = await res.json();

      if (data.success) {
        let palettes = data.colorPalettes;

        const isColorQuery = text.toLowerCase().includes('phối màu') || text.toLowerCase().includes('màu sắc') || text.toLowerCase().includes('mã màu') || text.toLowerCase().includes('tâm linh');
        if (!palettes && isColorQuery) {
          palettes = [
            {
              paletteName: 'Bản Phối 1: Lục Mộc Hoàng Thổ — Phú Quý An Khang',
              vibe: 'Tương Sinh Cát Tường',
              fortuneMeaning: 'Thầy phán: Sắc xanh lục của Mộc kết hợp cùng vàng hoàng kim của Thổ tạo thế Đất lành sinh cỏ cây hoa lá. Quẻ này chủ về Tài Lộc dồi dào, thu hút quý nhân phù trợ, xua tan tà khí và kích hoạt vận may công danh.',
              colors: [
                { hex: '#2E4B33', name: 'Xanh Rêu Cung Đình', role: 'Áo chính' },
                { hex: '#DFB76C', name: 'Hoàng Kim Quý Tộc', role: 'Điểm xuyết / Kim loại' },
                { hex: '#EBE2D3', name: 'Bạch Sa Lụa', role: 'Quần lụa' },
                { hex: '#8B263E', name: 'Hồng Đào Chu Sa', role: 'Phụ kiện' }
              ]
            },
            {
              paletteName: 'Bản Phối 2: Matcha Trà Đạo — Tĩnh Lặng Trừ Tà',
              vibe: 'Thanh Tâm An Nhiên',
              fortuneMeaning: 'Thầy phán: Quẻ Địa Thiên Thái. Tone xanh matcha dịu mát dung hòa cùng sắc kem ngà thanh tịnh giúp người diện tâm an trí sáng, xoa dịu thị phi, gia đạo hòa thuận và hóa giải mọi vận xui đeo bám.',
              colors: [
                { hex: '#7A9E66', name: 'Xanh Matcha Nhẹ', role: 'Áo ngũ thân' },
                { hex: '#F5F7F2', name: 'Bạch Ngọc Sa', role: 'Quần / Váy' },
                { hex: '#544634', name: 'Nâu Đất Nung Gốm', role: 'Túi / Dây đeo' },
                { hex: '#263725', name: 'Lục Thẫm Đại Ngàn', role: 'Khăn vấn' }
              ]
            }
          ];
        }

        const assistantMsg = {
          role: 'assistant',
          content: data.text,
          outfit: data.outfit,
          colorPalettes: palettes
        };

        setMessages(prev => [...prev, assistantMsg]);

        if (data.outfit && data.outfit.recommendedItems) {
          setCurrentOutfit(data.outfit);
          // Automatically trigger Mobile-VTON Virtual Try-On for the newly recommended outfit!
          executeVirtualTryOn(data.outfit);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${data.message || 'Lỗi khi xử lý phản hồi từ AI. Vui lòng thử lại.'}`,
            isError: true
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Lỗi kết nối mạng: ${err.message}`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get slot item
  const getItemBySlot = (slotName) => {
    return currentOutfit?.recommendedItems?.find(i => i.slot === slotName);
  };

  const headwearItem = getItemBySlot('headwear');
  const topItem = getItemBySlot('top');
  const bottomItem = getItemBySlot('bottom');
  const layerItem = getItemBySlot('layer');
  const accessoryItem = getItemBySlot('accessory');
  const footwearItem = getItemBySlot('footwear');

  return (
    <div className="w-full h-[calc(100vh-95px)] min-h-[720px] flex flex-col space-y-3 overflow-hidden">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex-shrink-0 flex items-center justify-between bg-white border border-matcha-200/90 rounded-2xl px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-matcha-950 font-bold uppercase tracking-wider text-[11px] font-sans">
            L'Atelier Haute Couture Studio:
          </span>
          <span className="font-fashion text-xs text-matcha-900 bg-matcha-100 px-2.5 py-0.5 rounded-full border border-matcha-200 font-bold">
            Model: ram/gemini-3.6-flash-high
          </span>
          <span className="text-matcha-300">|</span>
          <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-0.5 rounded-full border border-emerald-300 text-emerald-950 text-[11px] font-bold">
            <Cpu className="w-3.5 h-3.5 text-emerald-700" />
            <span>Virtual Try-On: CVPR 2026 Mobile-VTON</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <span className="text-matcha-700">
            Kho ảnh khả dụng: <strong className="text-matcha-950 font-fashion text-base font-bold">{savedCount}</strong> / 100 tác phẩm
          </span>
          <button
            onClick={onSwitchToCrawl}
            className="text-[11px] font-bold text-matcha-900 hover:text-matcha-700 underline flex items-center gap-1"
          >
            <span>Quản lý kho ảnh Dataset</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Panel Split: 60% Left Darker Matcha Stage & 40% Right RAG Chatbot */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-3.5 2xl:gap-5 min-h-0 overflow-hidden">
        
        {/* ================= LEFT PANEL (60% WIDTH): SYMMETRICAL ATELIER STAGE WITH ORTHOGONAL LEADER LINES ================= */}
        <div className="relative h-full rounded-3xl bg-gradient-to-b from-[#182617] via-[#101b0f] to-[#091108] border border-[#2d442a] shadow-2xl p-4 2xl:p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Luminous Ambient Matcha Runway Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-matcha-500/25 via-matcha-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[500px] h-24 bg-matcha-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Left Panel Header */}
          <div className="relative z-20 flex-shrink-0 flex items-center justify-between pb-2.5 border-b border-[#2d4229]">
            <div className="flex items-center gap-3">
              <span className="font-curvy text-2xl text-amber-300 font-bold">Silhouette</span>
              <span className="text-[10px] fashion-badge font-bold px-3 py-0.5 rounded-full bg-[#233520] border border-[#405c3b] text-matcha-200 shadow-sm">
                {currentOutfit?.styleVibe || 'Heritage Remix'}
              </span>
              <h2 className="text-xl 2xl:text-2xl font-fashion font-bold text-cream-50 tracking-tight ml-2">
                {currentOutfit?.outfitTitle || 'Set đồ Cổ Phục Remix'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => executeVirtualTryOn(currentOutfit)}
                disabled={isTryingOn}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition disabled:opacity-50"
                title="Chạy lại thử đồ bằng Mobile-VTON AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTryingOn ? 'animate-spin' : ''}`} />
                <span>{isTryingOn ? 'Đang thử đồ...' : 'Ướm Thử VTON'}</span>
              </button>
            </div>
          </div>

          {/* Stage Area: Symmetrical Left & Right Columns Flanking the Center Character */}
          <div className="relative flex-1 flex items-center justify-between px-2 2xl:px-4 my-1 min-h-0 overflow-hidden">
            
            {/* SVG ORTHOGONAL LEADER LINES */}
            <svg 
              viewBox="0 0 1000 700" 
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.45))' }}
            >
              <defs>
                <linearGradient id="lineGradGoldLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="lineGradGoldRight" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="lineGradDashed" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4d7c0f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a3e635" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* 1. Headwear Line */}
              {headwearItem ? (
                <g>
                  <circle cx="335" cy="145" r="4.5" fill="#facc15" stroke="#182617" strokeWidth="2" />
                  <path
                    d="M 335 145 L 425 145 L 455 110 L 488 110"
                    fill="none"
                    stroke="url(#lineGradGoldLeft)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="488" cy="110" r="5" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="488" cy="110" r="11" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 335 145 L 425 145 L 455 110 L 488 110"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="488" cy="110" r="3" fill="#4d7c0f" />
                </g>
              )}

              {/* 2. Main Top Costume Line */}
              {topItem ? (
                <g>
                  <circle cx="335" cy="370" r="5.5" fill="#facc15" stroke="#182617" strokeWidth="2.5" />
                  <path
                    d="M 335 370 L 420 370 L 455 235 L 488 235"
                    fill="none"
                    stroke="url(#lineGradGoldLeft)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="488" cy="235" r="6" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="488" cy="235" r="13" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.9" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 335 370 L 420 370 L 455 235 L 488 235"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="488" cy="235" r="3" fill="#4d7c0f" />
                </g>
              )}

              {/* 3. Bottom Pants/Skirt Line */}
              {bottomItem ? (
                <g>
                  <circle cx="335" cy="595" r="4.5" fill="#facc15" stroke="#182617" strokeWidth="2" />
                  <path
                    d="M 335 595 L 425 595 L 455 490 L 488 490"
                    fill="none"
                    stroke="url(#lineGradGoldLeft)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="488" cy="490" r="5" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="488" cy="490" r="11" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 335 595 L 425 595 L 455 490 L 488 490"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="488" cy="490" r="3" fill="#4d7c0f" />
                </g>
              )}

              {/* 4. Outer Layer Line */}
              {layerItem ? (
                <g>
                  <circle cx="665" cy="145" r="4.5" fill="#facc15" stroke="#182617" strokeWidth="2" />
                  <path
                    d="M 665 145 L 575 145 L 545 200 L 525 200"
                    fill="none"
                    stroke="url(#lineGradGoldRight)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="525" cy="200" r="5" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="525" cy="200" r="11" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 665 145 L 575 145 L 545 200 L 525 200"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="525" cy="200" r="3" fill="#4d7c0f" />
                </g>
              )}

              {/* 5. Accessory Line */}
              {accessoryItem ? (
                <g>
                  <circle cx="665" cy="370" r="4.5" fill="#facc15" stroke="#182617" strokeWidth="2" />
                  <path
                    d="M 665 370 L 595 370 L 580 360 L 565 360"
                    fill="none"
                    stroke="url(#lineGradGoldRight)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="565" cy="360" r="5" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="565" cy="360" r="11" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 665 370 L 595 370 L 580 360 L 565 360"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="565" cy="360" r="3" fill="#4d7c0f" />
                </g>
              )}

              {/* 6. Footwear Line */}
              {footwearItem ? (
                <g>
                  <circle cx="665" cy="595" r="4.5" fill="#facc15" stroke="#182617" strokeWidth="2" />
                  <path
                    d="M 665 595 L 580 595 L 540 660 L 505 660"
                    fill="none"
                    stroke="url(#lineGradGoldRight)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="505" cy="660" r="5" fill="#fde047" stroke="#182617" strokeWidth="2" />
                  <circle cx="505" cy="660" r="11" fill="none" stroke="#facc15" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
                </g>
              ) : (
                <g opacity="0.35">
                  <path
                    d="M 665 595 L 580 595 L 540 660 L 505 660"
                    fill="none"
                    stroke="url(#lineGradDashed)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="505" cy="660" r="3" fill="#4d7c0f" />
                </g>
              )}
            </svg>

            {/* LEFT COLUMN: Slots (Headwear, Main Top, Bottom) */}
            <div className="relative z-20 w-[32%] max-w-[340px] 2xl:max-w-[410px] h-full flex flex-col justify-around py-1 space-y-2.5">
              
              {/* Slot 1: Headwear */}
              <div className={`rounded-2xl backdrop-blur-md border p-3.5 2xl:p-4 shadow-xl transition-all duration-300 ${
                headwearItem
                  ? 'bg-[#182617]/95 border-[#3b5735] hover:border-matcha-400 ring-1 ring-white/5'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    👑 Mũ / Khăn
                  </span>
                  <span className="text-xs font-fashion font-bold text-cream-100">{headwearItem ? headwearItem.code : 'VP_XXX'}</span>
                </div>
                {headwearItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-[#4a6b43] flex-shrink-0 shadow-lg bg-black/60">
                      <img src={headwearItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{headwearItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-matcha-200 line-clamp-3 mt-1.5 leading-relaxed font-sans">{headwearItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn phụ kiện đầu
                  </div>
                )}
              </div>

              {/* Slot 2: Main Top Costume (Hero Card) */}
              <div className={`rounded-2xl backdrop-blur-md border-2 p-4 2xl:p-4.5 shadow-2xl transition-all duration-300 ${
                topItem
                  ? 'bg-[#1c2c1a]/95 border-amber-400/90 ring-2 ring-amber-400/25'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase font-bold text-slate-950 bg-amber-400 px-3 py-0.5 rounded-full shadow-xs">
                    👘 Áo Cổ Phục Chính (VTON)
                  </span>
                  <span className="text-xs font-fashion font-bold text-amber-300">{topItem ? topItem.code : 'VP_001'}</span>
                </div>
                {topItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-amber-400/90 flex-shrink-0 shadow-xl bg-black/60">
                      <img src={topItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{topItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-amber-100/90 line-clamp-3 mt-1.5 leading-relaxed font-sans">{topItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn áo chính
                  </div>
                )}
              </div>

              {/* Slot 3: Bottom Pants / Skirt */}
              <div className={`rounded-2xl backdrop-blur-md border p-3.5 2xl:p-4 shadow-xl transition-all duration-300 ${
                bottomItem
                  ? 'bg-[#182617]/95 border-[#3b5735] hover:border-matcha-400 ring-1 ring-white/5'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    👖 Quần / Váy (VTON)
                  </span>
                  <span className="text-xs font-fashion font-bold text-cream-100">{bottomItem ? bottomItem.code : 'VP_XXX'}</span>
                </div>
                {bottomItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-[#4a6b43] flex-shrink-0 shadow-lg bg-black/60">
                      <img src={bottomItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{bottomItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-matcha-200 line-clamp-3 mt-1.5 leading-relaxed font-sans">{bottomItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn quần / váy
                  </div>
                )}
              </div>

            </div>

            {/* CENTER: Female Model (With Mobile-VTON Virtual Try-On) */}
            <div className="relative z-10 flex-1 h-full flex flex-col items-center justify-center max-h-[580px] 2xl:max-h-[690px] px-2 overflow-visible">
              
              {/* Top VTON Mode Switcher & Status Badge */}
              <div className="absolute top-2 z-30 flex items-center gap-1.5 bg-[#0c160b]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#3b5735] shadow-xl">
                <button
                  onClick={() => setTryonMode('vton')}
                  disabled={!tryonResultUrl}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    tryonMode === 'vton'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-matcha-300 hover:text-cream-50'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTryingOn ? 'animate-spin' : ''}`} />
                  <span>{isTryingOn ? 'Đang ướm thử...' : '✨ Đã Thử Đồ (VTON)'}</span>
                </button>

                <button
                  onClick={() => setTryonMode('original')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    tryonMode === 'original'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-matcha-300 hover:text-cream-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Người Mẫu Gốc</span>
                </button>
              </div>

              {/* Model Image with Smooth Crossfade */}
              <div className="relative h-full w-auto max-h-[540px] 2xl:max-h-[660px] flex items-center justify-center">
                <img
                  src={tryonMode === 'vton' && tryonResultUrl ? tryonResultUrl : manImg}
                  alt="Người mẫu man 1.jpg"
                  className={`h-full w-auto max-h-[540px] 2xl:max-h-[660px] object-contain scale-[1.38] origin-center transform-gpu drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] transition-all duration-500 ${
                    isTryingOn ? 'opacity-70 blur-[1px]' : 'opacity-100'
                  }`}
                />

                {/* Loading Overlay when Mobile-VTON is processing */}
                {isTryingOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                    <div className="px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-400/80 shadow-2xl flex items-center gap-2 text-xs font-bold text-amber-300 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Mobile-VTON đang thay Áo & Quần...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom AI Model Tag */}
              <div className="absolute bottom-1 z-30 flex items-center gap-1.5 text-[10px] text-matcha-300/80 bg-[#091108]/85 backdrop-blur-sm px-3 py-0.5 rounded-full border border-white/10 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CVPR 2026 Mobile-VTON • On-Device Virtual Try-On</span>
              </div>

              <div className="absolute bottom-[-10px] w-72 h-8 rounded-full bg-gradient-to-r from-transparent via-matcha-400/50 to-transparent blur-lg pointer-events-none" />
            </div>

            {/* RIGHT COLUMN: Slots (Outer Layer, Accessory, Footwear) */}
            <div className="relative z-20 w-[32%] max-w-[340px] 2xl:max-w-[410px] h-full flex flex-col justify-around py-1 space-y-2.5">
              
              {/* Slot 4: Outer Layer */}
              <div className={`rounded-2xl backdrop-blur-md border p-3.5 2xl:p-4 shadow-xl transition-all duration-300 ${
                layerItem
                  ? 'bg-[#182617]/95 border-[#3b5735] hover:border-matcha-400 ring-1 ring-white/5'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    🧥 Khoác Layer
                  </span>
                  <span className="text-xs font-fashion font-bold text-cream-100">{layerItem ? layerItem.code : 'VP_XXX'}</span>
                </div>
                {layerItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-[#4a6b43] flex-shrink-0 shadow-lg bg-black/60">
                      <img src={layerItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{layerItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-matcha-200 line-clamp-3 mt-1.5 leading-relaxed font-sans">{layerItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn áo khoác ngoài
                  </div>
                )}
              </div>

              {/* Slot 5: Accessory */}
              <div className={`rounded-2xl backdrop-blur-md border p-3.5 2xl:p-4 shadow-xl transition-all duration-300 ${
                accessoryItem
                  ? 'bg-[#182617]/95 border-[#3b5735] hover:border-matcha-400 ring-1 ring-white/5'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                    👜 Phụ Kiện
                  </span>
                  <span className="text-xs font-fashion font-bold text-cream-100">{accessoryItem ? accessoryItem.code : 'VP_XXX'}</span>
                </div>
                {accessoryItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-[#4a6b43] flex-shrink-0 shadow-lg bg-black/60">
                      <img src={accessoryItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{accessoryItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-matcha-200 line-clamp-3 mt-1.5 leading-relaxed font-sans">{accessoryItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn phụ kiện
                  </div>
                )}
              </div>

              {/* Slot 6: Footwear */}
              <div className={`rounded-2xl backdrop-blur-md border p-3.5 2xl:p-4 shadow-xl transition-all duration-300 ${
                footwearItem
                  ? 'bg-[#182617]/95 border-[#3b5735] hover:border-matcha-400 ring-1 ring-white/5'
                  : 'bg-[#182617]/40 border-dashed border-[#2d4229]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    👟 Giày / Dép
                  </span>
                  <span className="text-xs font-fashion font-bold text-cream-100">{footwearItem ? footwearItem.code : 'VP_XXX'}</span>
                </div>
                {footwearItem ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-[92px] h-[115px] 2xl:w-[108px] 2xl:h-[135px] rounded-xl overflow-hidden border-2 border-[#4a6b43] flex-shrink-0 shadow-lg bg-black/60">
                      <img src={footwearItem.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm 2xl:text-base font-fashion font-bold text-cream-50 truncate">{footwearItem.name}</p>
                      <p className="text-xs 2xl:text-[13px] text-matcha-200 line-clamp-3 mt-1.5 leading-relaxed font-sans">{footwearItem.reason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-matcha-500 italic">
                    Chưa chọn giày dép
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Left Panel Footer Summary */}
          <div className="relative z-20 flex-shrink-0 pt-2 border-t border-[#2d4229] flex items-center justify-between text-xs text-matcha-300 font-sans">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dáng người: Nữ người mẫu chuẩn studio (1600x1600) • Tự động warp & thay trang phục qua Mobile-VTON AI</span>
            </span>
            <span className="text-[11px] text-matcha-400 italic">
              {tryonDetails?.top ? `Đang mặc: ${tryonDetails.top}` : 'Sẵn sàng thử đồ'}
            </span>
          </div>

        </div>

        {/* ================= RIGHT PANEL (40% WIDTH): RAG CHATBOT WITH CONVERSATIONAL STAGES ================= */}
        <div className="h-full rounded-3xl bg-white border border-matcha-200 shadow-xl flex flex-col min-h-0 overflow-hidden">
          
          {/* Chat Header */}
          <div className="flex-shrink-0 px-5 py-3.5 border-b border-matcha-100 bg-matcha-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-matcha-900 flex items-center justify-center text-cream-50 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-fashion font-bold text-matcha-950">AI Stylist Cổ Phục</h3>
                <p className="text-[11px] text-matcha-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Online • Sẵn sàng tư vấn phối đồ & Try-On
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    role: 'assistant',
                    content: 'Đã làm mới phiên tư vấn! Hãy chọn gợi ý bên dưới hoặc nhập yêu cầu của bạn.',
                    outfit: null,
                    colorPalettes: null
                  }
                ]);
              }}
              className="p-1.5 text-matcha-600 hover:text-matcha-950 hover:bg-white rounded-full border border-transparent hover:border-matcha-200 transition"
              title="Làm mới cuộc trò chuyện"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Scrollable Message List */}
          <div className="flex-1 p-4 2xl:p-5 overflow-y-auto space-y-4 bg-cream-50/40 min-h-0">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser ? 'bg-matcha-800 text-cream-50' : 'bg-matcha-100 text-matcha-900 border border-matcha-300'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans shadow-sm ${
                    isUser 
                      ? 'bg-matcha-900 text-cream-50 rounded-tr-xs font-medium'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
                      : 'bg-white text-matcha-950 border border-matcha-200/90 rounded-tl-xs'
                  }`}>
                    
                    {/* Markdown Formatted Text */}
                    <MarkdownRenderer content={msg.content} />

                    {/* Render Color Palettes if message has them */}
                    {msg.colorPalettes && (
                      <ColorPalettesView palettes={msg.colorPalettes} />
                    )}

                    {/* Interactive Outfit Card summary inside Chat */}
                    {msg.outfit && (
                      <div className="mt-3 pt-3 border-t border-matcha-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-fashion font-bold text-matcha-900">{msg.outfit.outfitTitle}</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Đã thử VTON
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {msg.outfit.recommendedItems?.map((item, itIdx) => (
                            <div key={itIdx} className="bg-matcha-50/70 p-1.5 rounded-lg border border-matcha-200/60 text-[10px]">
                              <span className="font-bold text-matcha-950 block truncate">{item.name}</span>
                              <span className="text-matcha-600 font-mono text-[9px]">{item.code}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-matcha-100 text-matcha-900 border border-matcha-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-matcha-200 rounded-2xl rounded-tl-xs p-3.5 text-xs text-matcha-700 flex items-center gap-2 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-matcha-700" />
                  <span>AI Stylist đang tra cứu 1,270 quy tắc & kích hoạt Mobile-VTON...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Dynamic Suggestion Pills (Initial or Follow-up after generation) */}
          <div className="flex-shrink-0 px-4 py-2 bg-white border-t border-matcha-100">
            <div className="text-[10px] uppercase font-bold text-matcha-600 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi ý tương tác nhanh:</span>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {INITIAL_SELECTION_BUBBLES.slice(0, 3).map((bubble) => {
                const Icon = bubble.icon;
                return (
                  <button
                    key={bubble.id}
                    onClick={() => handleSendMessage(bubble.prompt)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-matcha-50 hover:bg-matcha-100 text-matcha-900 border border-matcha-200 whitespace-nowrap transition shadow-xs disabled:opacity-50"
                  >
                    <Icon className="w-3 h-3 text-matcha-700" />
                    <span>{bubble.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Input Box */}
          <div className="flex-shrink-0 p-3.5 bg-matcha-50/80 border-t border-matcha-100">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-white rounded-full border border-matcha-200 p-1.5 focus-within:border-matcha-600 focus-within:ring-2 focus-within:ring-matcha-200 transition shadow-sm"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập yêu cầu phối đồ (Ví dụ: Nữ đi chụp ảnh Tết, thích tone đỏ)..."
                disabled={isLoading}
                className="flex-1 px-4 py-1.5 text-xs text-matcha-950 focus:outline-none placeholder:text-matcha-400 bg-transparent"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-matcha-900 hover:bg-matcha-800 disabled:opacity-40 text-cream-50 flex items-center justify-center transition flex-shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
