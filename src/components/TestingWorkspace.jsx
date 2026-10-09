import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Upload, Play, CheckCircle2, AlertCircle, RefreshCw, 
  Download, ArrowRight, Layers, Eye, Image as ImageIcon, Check,
  Zap, Cpu, ShieldCheck, User, Shirt, Scissors, Maximize2, Trash2,
  Sliders, SlidersHorizontal, Info, Compass, Wand2, Copy, Clock,
  ExternalLink, Sparkle, Camera, Crown, Footprints, Gem,
  Palette, CheckSquare, PlusCircle
} from 'lucide-react';
import defaultManImg from '../human model/man 1.jpg';
import defaultShirtImg from '../clothes/shirt.png';

// Multi-Slot Layer Catalog Items (Áo, Quần, Nón, Giày, Phụ Kiện)
export const MULTI_SLOT_CATALOG = {
  tops: [
    {
      id: 'top-ngu-than',
      name: 'Áo Ngũ Thân Gấm Đỏ Thêu Sen Vàng',
      category: 'Áo Cổ Phục',
      badge: 'Gấm Tơ Tằm',
      url: '/api/clothes/viet_phuc_sample.jpg',
      promptPart: 'royal ruby red silk brocade Ao Ngu Than tay chen with intricate gold lotus embroidery and 5 gold filigree buttons'
    },
    {
      id: 'top-nhat-binh',
      name: 'Áo Nhật Bình Gấm Cung Đình (Ngũ Sắc)',
      category: 'Cổ Phục Triều Nguyễn',
      badge: 'Hoàng Gia',
      url: '/api/dataset/01_ao_co_phuc/VP_002_ao_nhat_binh_fullset.jpg',
      promptPart: 'authentic royal emerald green and scarlet red silk Ao Nhat Binh robe with 5-color striped cuffs (ngu sac) and phoenix motifs'
    },
    {
      id: 'top-giao-linh',
      name: 'Áo Giao Lĩnh Chàm Xanh Cổ Chéo',
      category: 'Thời Lê Trung Hưng',
      badge: 'Quý Tộc',
      url: '/api/dataset/01_ao_co_phuc/VP_003_ao_giao_linh.jpg',
      promptPart: 'deep indigo blue silk cross-collar Ao Giao Linh robe with golden trim borders and flowing wide sleeves'
    },
    {
      id: 'top-ba-ba',
      name: 'Áo Bà Ba Nâu Đất Mộc Mạc',
      category: 'Trang Phục Dân Gian',
      badge: 'Nam Bộ',
      url: '/api/dataset/01_ao_co_phuc/VP_006_ao_ba_ba.png',
      promptPart: 'traditional earthy brown linen Vietnamese Ao Ba Ba with delicate button placket and natural drape'
    },
    {
      id: 'top-so-mi',
      name: 'Áo Sơ Mi Trắng Thêu Họa Tiết Cổ',
      category: 'Hiện Đại Remix',
      badge: 'Streetwear',
      url: '/api/clothes/shirt.png',
      promptPart: 'crisp tailored white button-down shirt with subtle Vietnamese heritage ethnic embroidered collar accents'
    }
  ],

  bottoms: [
    {
      id: 'bot-sa-trang',
      name: 'Quần Sa Bạch Hoàng Gia Ống Rộng',
      badge: 'Lụa Bạch',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
      promptPart: 'loose flowing pure white traditional Vietnamese silk trousers (quan sa bach)'
    },
    {
      id: 'bot-lua-den',
      name: 'Quần Lụa Đen Ống Suông Truyền Thống',
      badge: 'Lụa Hà Đông',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_016_quan_lua_ong_rong_truyen_thong.webp',
      promptPart: 'traditional wide-leg black Habotai silk trousers with soft natural fabric drape'
    },
    {
      id: 'bot-xiem-vang',
      name: 'Xiêm Váy Lụa Hoàng Kim Dập Ly (Nữ)',
      badge: 'Cung Đình',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_018_thuong_xep_ly.jpg',
      promptPart: 'royal golden yellow pleated silk skirt (thuong / xiem) layered with white inner trousers'
    },
    {
      id: 'bot-quan-tay',
      name: 'Quần Tây Âu Đen Slim-fit Hiện Đại',
      badge: 'Hiện Đại',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_017_vay_dong.jpg',
      promptPart: 'tailored high-waisted black formal dress trousers with crisp front creases'
    }
  ],

  headwear: [
    {
      id: 'head-khan-dong',
      name: 'Khăn Đóng Lụa Đen Truyền Thống (Nam)',
      badge: 'Nam Giới',
      url: '/api/dataset/03_mu_non_khan_toc/VP_021_khan_dong_nam.jpg',
      promptPart: 'wearing authentic traditional Vietnamese black folded silk turban (khan dong) wrapped neatly on the head'
    },
    {
      id: 'head-khan-vanh',
      name: 'Khăn Vành Nữ Hoàng Tộc Dát Vàng',
      badge: 'Hoàng Hậu',
      url: '/api/dataset/03_mu_non_khan_toc/VP_022_khan_vanh_nu.jpg',
      promptPart: 'wearing royal Vietnamese golden yellow wrapped coronet headdress (khan vanh khai) adorned with subtle filigree ornaments'
    },
    {
      id: 'head-non-quai-thao',
      name: 'Nón Quai Thao Quai Tơ Hồng',
      badge: 'Quan Họ',
      url: '/api/dataset/03_mu_non_khan_toc/VP_023_non_quai_thao.jpg',
      promptPart: 'wearing traditional Northern Vietnamese wide flat palm-leaf hat (non quai thao) with pink silk ribbons'
    },
    {
      id: 'head-non-la',
      name: 'Nón Lá Xứ Huế Truyền Thống',
      badge: 'Truyền Thống',
      url: '/api/dataset/03_mu_non_khan_toc/VP_025_non_la_truyen_thong.jpg',
      promptPart: 'wearing classic Vietnamese conical leaf hat (non la) made from sun-dried palm leaves'
    },
    {
      id: 'head-beret',
      name: 'Mũ Beret Cổ Điển (Modern Chic)',
      badge: 'Modern Chic',
      url: '/api/dataset/03_mu_non_khan_toc/VP_028_mu_beret.jpg',
      promptPart: 'wearing stylish vintage wool black beret tilted fashionably on head'
    },
    {
      id: 'head-none',
      name: 'Không đội mũ (Giữ tóc tự nhiên)',
      badge: 'Tự Nhiên',
      url: null,
      promptPart: 'natural neat hairstyle without headwear'
    }
  ],

  footwear: [
    {
      id: 'foot-hai-theu',
      name: 'Hài Cong Thêu Hoa Sen Chỉ Vàng',
      badge: 'Cổ Điển',
      url: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
      promptPart: 'wearing authentic curved-toe royal silk slippers (hai) with gold lotus embroidery on the feet'
    },
    {
      id: 'foot-guoc-moc',
      name: 'Guốc Mộc Quai Nhung Đỏ',
      badge: 'Dân Gian',
      url: '/api/dataset/04_giay_dep_guoc/VP_036_guoc_quai_nhung.jpg',
      promptPart: 'wearing traditional handcrafted Vietnamese wooden clogs (guoc moc) with scarlet red velvet straps'
    },
    {
      id: 'foot-oxford',
      name: 'Giày Da Oxford Cổ Điển',
      badge: 'Âu Phục',
      url: '/api/dataset/04_giay_dep_guoc/VP_042_giay_oxford_da_co_dien.jpg',
      promptPart: 'wearing polished black leather classic Oxford dress shoes on the feet'
    },
    {
      id: 'foot-sneaker',
      name: 'Giày Sneaker Trắng Tối Giản',
      badge: 'Streetwear',
      url: '/api/dataset/04_giay_dep_guoc/VP_039_sneaker_trang_co_thap.jpg',
      promptPart: 'wearing clean minimalist low-top white leather sneakers on the feet'
    }
  ],

  accessories: [
    {
      id: 'acc-the-bai',
      name: 'Ngọc Bội Thẻ Bài Cung Đình Đeo Hông',
      badge: 'Hoàng Cung',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_058_bao_the_bai_ngoc_boi_deo_hong.png',
      promptPart: 'adorned with royal green nephrite jade medallion tablet (the bai ngoc boi) with golden tassels hanging elegantly on the waist'
    },
    {
      id: 'acc-kieng-bac',
      name: 'Kiềng Bạc Chạm Khắc Sen Cổ Truyền',
      badge: 'Trang Sức',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_060_vong_kieng_bac_cham_khac.jpg',
      promptPart: 'wearing traditional handcrafted rigid silver neck ring (kieng bac) with etched lotus motifs'
    },
    {
      id: 'acc-quat-lua',
      name: 'Quạt Lụa Tròn Thêu Tay Cầm Tay',
      badge: 'Nhã Nhặn',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_068_quat_lua_tron_theu_tay.jpg',
      promptPart: 'gracefully holding a circular silk hand fan (quat lua) with delicate Vietnamese nature embroidery'
    },
    {
      id: 'acc-kinh-retro',
      name: 'Kính Retro Gọng Tròn Kim Loại',
      badge: 'Tân Cổ Giao Duyên',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_066_kinh_gong_kim_loai_tron_retro.jpg',
      promptPart: 'wearing vintage round gold wire-rimmed spectacles for an intellectual artistic aesthetic'
    },
    {
      id: 'acc-none',
      name: 'Không mang phụ kiện',
      badge: 'Tối Giản',
      url: null,
      promptPart: 'minimalist styling without extra accessories'
    }
  ]
};

// Curated Multi-Slot Combo Master Presets (1-Click Advanced Test Sets)
const MULTI_SLOT_COMBOS = [
  {
    id: 'combo-hoang-toc-nam',
    title: '👑 Hoàng Tộc Triều Nguyễn (Full Set Nam)',
    desc: 'Áo Ngũ Thân Gấm Đỏ + Quần Sa Bạch + Khăn Đóng Đen + Hài Thêu Sen + Ngọc Bội Thẻ Bài',
    topId: 'top-ngu-than',
    bottomId: 'bot-sa-trang',
    headId: 'head-khan-dong',
    footId: 'foot-hai-theu',
    accId: 'acc-the-bai'
  },
  {
    id: 'combo-cung-dinh-nu',
    title: '🌸 Cung Đình Nhật Bình Vương Giả (Full Set Nữ)',
    desc: 'Áo Nhật Bình Ngũ Sắc + Xiêm Hoàng Kim + Khăn Vành Dát Vàng + Hài Thêu + Kiềng Bạc',
    topId: 'top-nhat-binh',
    bottomId: 'bot-xiem-vang',
    headId: 'head-khan-vanh',
    footId: 'foot-hai-theu',
    accId: 'acc-kieng-bac'
  },
  {
    id: 'combo-nho-nha-le-trung-hung',
    title: '🍃 Danh Sĩ Giao Lĩnh (Lê Trung Hưng)',
    desc: 'Áo Giao Lĩnh Chàm + Quần Lụa Đen + Khăn Đóng + Guốc Mộc Nhung + Quạt Lụa Tròn',
    topId: 'top-giao-linh',
    bottomId: 'bot-lua-den',
    headId: 'head-khan-dong',
    footId: 'foot-guoc-moc',
    accId: 'acc-quat-lua'
  },
  {
    id: 'combo-dan-gian-nam-bo',
    title: '🌾 Dân Gian Mộc Mạc Nam Bộ',
    desc: 'Áo Bà Ba Nâu + Quần Lụa Đen + Nón Lá Xứ Huế + Guốc Mộc + Quạt Lụa',
    topId: 'top-ba-ba',
    bottomId: 'bot-lua-den',
    headId: 'head-non-la',
    footId: 'foot-guoc-moc',
    accId: 'acc-quat-lua'
  },
  {
    id: 'combo-remix-streetwear',
    title: '⚡ Tân Cổ Giao Duyên Remix (Streetwear 8K)',
    desc: 'Áo Ngũ Thân Gấm Đỏ + Quần Tây Đen Slim-fit + Mũ Beret + Giày Sneaker Trắng + Kính Retro',
    topId: 'top-ngu-than',
    bottomId: 'bot-quan-tay',
    headId: 'head-beret',
    footId: 'foot-sneaker',
    accId: 'acc-kinh-retro'
  }
];

// Curated Quick Tag Enhancers
const PROMPT_ENHANCEMENT_TAGS = [
  { label: '✨ Gấm Cung Đình Ánh Kim', tag: 'crafted from royal Hue court brocade silk with metallic threads' },
  { label: '🧵 Thêu Tay Chỉ Ngũ Sắc', tag: 'hand-embroidered with multi-colored Vietnamese dragon and lotus patterns' },
  { label: '💡 Ánh Sáng Studio 8K', tag: 'editorial rim lighting, soft natural shadows, 85mm lens portrait, Hasselblad 8k' },
  { label: '👤 Giữ 100% Khuôn Mặt', tag: 'strictly preserve the exact same facial features, expression, and skin tone of the model' },
  { label: '💎 Chuẩn Tỷ Lệ Toàn Thân', tag: 'full-body standing pose lookbook composition, perfectly proportioned from head to toe' }
];

export default function TestingWorkspace({ onOpenFolder }) {
  // Model Mode: Full-body male / female / custom
  const [humanImage, setHumanImage] = useState('/api/human-model/man 1.jpg');
  const [humanImageName, setHumanImageName] = useState('man 1.jpg (Mẫu Nam Toàn Thân 8K)');
  const [isCustomHuman, setIsCustomHuman] = useState(false);
  const [humanDimensions, setHumanDimensions] = useState({ w: 1024, h: 1024 });

  // Mode Selection: 'multi_slot' (Advanced Layering) vs 'single_preset' (1 Outfit)
  const [testMode, setTestMode] = useState('multi_slot'); // 'multi_slot' | 'single_preset'

  // Multi-Slot Layer Selection State
  const [selectedTop, setSelectedTop] = useState(MULTI_SLOT_CATALOG.tops[0]);
  const [selectedBottom, setSelectedBottom] = useState(MULTI_SLOT_CATALOG.bottoms[0]);
  const [selectedHeadwear, setSelectedHeadwear] = useState(MULTI_SLOT_CATALOG.headwear[0]);
  const [selectedFootwear, setSelectedFootwear] = useState(MULTI_SLOT_CATALOG.footwear[0]);
  const [selectedAccessory, setSelectedAccessory] = useState(MULTI_SLOT_CATALOG.accessories[0]);
  const [activeComboId, setActiveComboId] = useState('combo-hoang-toc-nam');

  // Active Slot Tab in Editor
  const [activeSlotTab, setActiveSlotTab] = useState('top'); // 'top' | 'bottom' | 'headwear' | 'footwear' | 'accessory'

  // Prompt Optimization State
  const [promptText, setPromptText] = useState('');
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [userCustomNote, setUserCustomNote] = useState('');
  const [selectedTags, setSelectedTags] = useState(['👤 Giữ 100% Khuôn Mặt', '💡 Ánh Sáng Studio 8K']);

  // Execution & Output State
  const [isRunning, setIsRunning] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [viewMode, setViewMode] = useState('result'); // 'result' | 'split' | 'side'
  const [splitSlider, setSplitSlider] = useState(50);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Hidden File Input Ref
  const humanFileInputRef = useRef(null);

  // Initial prompt generation on mount
  useEffect(() => {
    handleApplyCombo(MULTI_SLOT_COMBOS[0]);
  }, []);

  // Handle Apply Pre-configured Multi-Slot Combo
  const handleApplyCombo = (combo) => {
    setActiveComboId(combo.id);
    const top = MULTI_SLOT_CATALOG.tops.find(t => t.id === combo.topId) || MULTI_SLOT_CATALOG.tops[0];
    const bot = MULTI_SLOT_CATALOG.bottoms.find(b => b.id === combo.bottomId) || MULTI_SLOT_CATALOG.bottoms[0];
    const head = MULTI_SLOT_CATALOG.headwear.find(h => h.id === combo.headId) || MULTI_SLOT_CATALOG.headwear[0];
    const foot = MULTI_SLOT_CATALOG.footwear.find(f => f.id === combo.footId) || MULTI_SLOT_CATALOG.footwear[0];
    const acc = MULTI_SLOT_CATALOG.accessories.find(a => a.id === combo.accId) || MULTI_SLOT_CATALOG.accessories[0];

    setSelectedTop(top);
    setSelectedBottom(bot);
    setSelectedHeadwear(head);
    setSelectedFootwear(foot);
    setSelectedAccessory(acc);

    triggerLayeredPromptOptimization({ top, bottom: bot, headwear: head, footwear: foot, accessory: acc });
  };

  // Trigger Gemini 3.6 Flash Multi-Layer Prompt Optimization
  const triggerLayeredPromptOptimization = async (customLayers = null) => {
    setIsOptimizingPrompt(true);
    const layersToUse = customLayers || {
      top: selectedTop,
      bottom: selectedBottom,
      headwear: selectedHeadwear,
      footwear: selectedFootwear,
      accessory: selectedAccessory
    };

    try {
      const res = await fetch('/api/img2img/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentName: `${layersToUse.top?.name} phối cùng ${layersToUse.bottom?.name}`,
          garmentCategory: 'Phối Đồ Đa Lớp Việt Phục',
          styleTags: selectedTags,
          userPrompt: userCustomNote,
          humanDescription: humanImage.includes('man') ? 'Vietnamese handsome male model (full body standing)' : 'Vietnamese elegant female model (full body standing)',
          layers: {
            top: layersToUse.top ? { name: layersToUse.top.name, prompt: layersToUse.top.promptPart } : null,
            bottom: layersToUse.bottom ? { name: layersToUse.bottom.name, prompt: layersToUse.bottom.promptPart } : null,
            headwear: layersToUse.headwear && layersToUse.headwear.id !== 'head-none' ? { name: layersToUse.headwear.name, prompt: layersToUse.headwear.promptPart } : null,
            footwear: layersToUse.footwear ? { name: layersToUse.footwear.name, prompt: layersToUse.footwear.promptPart } : null,
            accessory: layersToUse.accessory && layersToUse.accessory.id !== 'acc-none' ? { name: layersToUse.accessory.name, prompt: layersToUse.accessory.promptPart } : null
          }
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn('Optimizer parse warning:', text);
        return;
      }
      if (data.success && data.optimizedPrompt) {
        setPromptText(data.optimizedPrompt);
      }
    } catch (err) {
      console.warn('Optimizer error:', err);
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  // Handle Human File Upload
  const handleHumanFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target.result;
      const img = new Image();
      img.onload = () => {
        setHumanImage(dataUri);
        setHumanImageName(file.name);
        setIsCustomHuman(true);
        setHumanDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        triggerLayeredPromptOptimization();
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  // Toggle Enhancement Tag
  const handleToggleTag = (tag) => {
    let newTags;
    if (selectedTags.includes(tag.label)) {
      newTags = selectedTags.filter(t => t !== tag.label);
    } else {
      newTags = [...selectedTags, tag.label];
    }
    setSelectedTags(newTags);
    triggerLayeredPromptOptimization();
  };

  // Run Image-to-Image Generation (veo/gemini-3.0-pro-image)
  const handleRunImageToImage = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setResultData(null);
    setCurrentStep(1);

    const stepTimer1 = setTimeout(() => setCurrentStep(2), 2500);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 6000);

    try {
      const res = await fetch('/api/img2img/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: humanImage,
          garmentImage: selectedTop?.url || '/api/clothes/viet_phuc_sample.jpg',
          prompt: promptText,
          garmentName: `${selectedTop.name} + ${selectedBottom.name} + ${selectedHeadwear.name} + ${selectedFootwear.name}`,
          size: '1024x1024'
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Máy chủ không phản hồi JSON (Mã lỗi ${res.status}): ${text.slice(0, 150)}`);
      }

      if (data.success) {
        setCurrentStep(4);
        setResultData(data);
        setViewMode('result');
      } else {
        setErrorMessage(data.message || data.error || 'Lỗi khi kết xuất ảnh');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi mạng khi kết nối tới máy chủ AI');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-cream-50 via-matcha-50 to-emerald-50/70 border border-matcha-300/80 rounded-3xl p-6 sm:p-8 shadow-fashion relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-matcha-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-900 text-emerald-100 border border-emerald-700 shadow-sm flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Multi-Layer Virtual Try-On Studio
              </span>
              <span className="text-[11px] font-fashion font-bold px-2.5 py-0.5 rounded-full bg-cream-100 text-matcha-900 border border-matcha-300">
                Gemini 3.0 Pro Image Engine
              </span>
              <span className="text-[11px] font-fashion font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Sparkle className="w-3 h-3 text-amber-600" />
                Prompt Synthesizer (Gemini 3.6)
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-fashion font-bold text-matcha-950 tracking-tight">
              Phòng Thử Đồ Đa Lớp Cổ Phục (Multi-Item Mix & Match)
            </h1>
            <p className="text-xs sm:text-sm text-matcha-800 mt-1 max-w-3xl leading-relaxed">
              Thử nghiệm bài test ghép nối phức tạp: Tự do chọn và phối kết hợp <strong>Áo + Quần/Xiêm + Mũ/Khăn + Giày/Hài + Phụ Kiện</strong> lên 1 người mẫu toàn thân, AI tự động đồng bộ bố cục và chất liệu chuẩn Haute Couture.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenFolder}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-300 shadow-sm text-xs font-semibold transition"
            >
              <Compass className="w-4 h-4 text-matcha-700" />
              <span>Thư Mục Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Multi-Slot Combo Shortcuts */}
      <div className="bg-white border border-matcha-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-fashion font-bold text-matcha-950 uppercase tracking-wider">
              Bộ Phối Mẫu Đỉnh Cao (1-Click Presets)
            </span>
          </div>
          <span className="text-[11px] text-matcha-600">Chọn nhanh combo hoàn chỉnh hoặc tự tùy biến từng slot bên dưới</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {MULTI_SLOT_COMBOS.map((combo) => {
            const isActive = activeComboId === combo.id;
            return (
              <button
                key={combo.id}
                onClick={() => handleApplyCombo(combo)}
                className={`p-3 rounded-2xl text-left border transition relative flex flex-col justify-between group ${
                  isActive 
                    ? 'bg-gradient-to-b from-matcha-900 to-emerald-950 text-cream-50 border-matcha-900 shadow-md ring-2 ring-emerald-500/30' 
                    : 'bg-cream-50/70 hover:bg-matcha-50/80 text-matcha-900 border-matcha-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-fashion font-bold ${isActive ? 'text-amber-300' : 'text-matcha-950'}`}>
                      {combo.title}
                    </span>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className={`text-[10px] line-clamp-2 leading-relaxed ${isActive ? 'text-matcha-200' : 'text-matcha-700'}`}>
                    {combo.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1: HUMAN MODEL INPUT (3.5 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-matcha-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-matcha-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-matcha-100 flex items-center justify-center text-matcha-800 font-bold text-xs">1</div>
                <div>
                  <h2 className="text-sm font-fashion font-bold text-matcha-950">Ảnh Người Mẫu Toàn Thân</h2>
                  <p className="text-[11px] text-matcha-600">Nhân vật chụp đứng đầy đủ từ đầu đến chân</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${isCustomHuman ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-matcha-100 text-matcha-800 border border-matcha-300'}`}>
                {isCustomHuman ? 'Ảnh Tự Tải' : 'Full-Body 8K'}
              </span>
            </div>

            {/* Human Preview Box */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-cream-50 border border-matcha-200 flex items-center justify-center group shadow-inner">
              <img
                src={humanImage}
                alt="Người mẫu đầu vào"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                <p className="text-white text-xs font-medium truncate">{humanImageName}</p>
              </div>
              
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-matcha-900 border border-matcha-200 shadow-sm">
                {humanDimensions.w} x {humanDimensions.h}px
              </div>
            </div>

            {/* Model Switcher Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setHumanImage('/api/human-model/man 1.jpg');
                  setHumanImageName('man 1.jpg (Mẫu Nam Toàn Thân 8K)');
                  setIsCustomHuman(false);
                  setHumanDimensions({ w: 1024, h: 1024 });
                  triggerLayeredPromptOptimization();
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  humanImage.includes('man') && !isCustomHuman
                    ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm'
                    : 'bg-cream-50 hover:bg-matcha-50 text-matcha-900 border-matcha-200'
                }`}
              >
                <span>👨 Nam Toàn Thân</span>
              </button>

              <button
                onClick={() => {
                  setHumanImage('/api/human-model/woman 1.jpg');
                  setHumanImageName('woman 1.jpg (Mẫu Nữ Toàn Thân 8K)');
                  setIsCustomHuman(false);
                  setHumanDimensions({ w: 1024, h: 1024 });
                  triggerLayeredPromptOptimization();
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  humanImage.includes('woman') && !isCustomHuman
                    ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm'
                    : 'bg-cream-50 hover:bg-matcha-50 text-matcha-900 border-matcha-200'
                }`}
              >
                <span>👩 Nữ Toàn Thân</span>
              </button>
            </div>

            {/* Custom Upload Button */}
            <div className="mt-2">
              <button
                onClick={() => humanFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-300 text-xs font-bold transition shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-matcha-700" />
                <span>Tải Ảnh Toàn Thân Riêng Của Bạn</span>
              </button>
            </div>

            <input
              ref={humanFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHumanFileUpload}
            />
          </div>
        </div>

        {/* ================= COLUMN 2: MULTI-SLOT LAYERING STUDIO (4.5 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-matcha-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-matcha-100 flex items-center justify-center text-matcha-800 font-bold text-xs">2</div>
                <div>
                  <h2 className="text-sm font-fashion font-bold text-matcha-950">Phối 5 Lớp Trang Phục</h2>
                  <p className="text-[11px] text-matcha-600">Áo, Quần, Mũ, Giày & Phụ Kiện</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                5 Slots Phối Đồ
              </span>
            </div>

            {/* Selected Layers Summary Carousel Bar */}
            <div className="bg-cream-50/80 border border-matcha-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-mono font-bold text-matcha-700 uppercase tracking-wider block">
                Trang Phục Đang Chọn:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { slot: 'top', icon: '👘', label: 'Áo', item: selectedTop },
                  { slot: 'bottom', icon: '👖', label: 'Quần', item: selectedBottom },
                  { slot: 'headwear', icon: '👑', label: 'Mũ/Khăn', item: selectedHeadwear },
                  { slot: 'footwear', icon: '👞', label: 'Giày/Hài', item: selectedFootwear },
                  { slot: 'accessory', icon: '📿', label: 'Phụ Kiện', item: selectedAccessory }
                ].map(({ slot, icon, label, item }) => (
                  <button
                    key={slot}
                    onClick={() => setActiveSlotTab(slot)}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      activeSlotTab === slot
                        ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm'
                        : 'bg-white hover:bg-matcha-50 text-matcha-900 border-matcha-200'
                    }`}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="text-[9px] font-bold truncate max-w-[50px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slot Tab Content Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fashion font-bold text-matcha-900">
                  {activeSlotTab === 'top' && '👘 Chọn Áo (Tops / Robes)'}
                  {activeSlotTab === 'bottom' && '👖 Chọn Quần / Xiêm Váy (Bottoms)'}
                  {activeSlotTab === 'headwear' && '👑 Chọn Mũ / Nón / Khăn (Headwear)'}
                  {activeSlotTab === 'footwear' && '👞 Chọn Giày / Hài / Guốc (Footwear)'}
                  {activeSlotTab === 'accessory' && '📿 Chọn Phụ Kiện / Trang Sức (Accessories)'}
                </span>
                <span className="text-[10px] text-matcha-600">Nhấp để áp dụng ngay</span>
              </div>

              {/* Items List based on Active Slot Tab */}
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                {activeSlotTab === 'top' && MULTI_SLOT_CATALOG.tops.map((top) => {
                  const isSelected = selectedTop.id === top.id;
                  return (
                    <div
                      key={top.id}
                      onClick={() => {
                        setSelectedTop(top);
                        setActiveComboId('custom');
                        triggerLayeredPromptOptimization({ top, bottom: selectedBottom, headwear: selectedHeadwear, footwear: selectedFootwear, accessory: selectedAccessory });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm' 
                          : 'bg-cream-50/50 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-matcha-200">
                        <img src={top.url} alt={top.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-fashion font-bold truncate">{top.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : 'bg-matcha-100 text-matcha-800'}`}>
                          {top.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}

                {activeSlotTab === 'bottom' && MULTI_SLOT_CATALOG.bottoms.map((bot) => {
                  const isSelected = selectedBottom.id === bot.id;
                  return (
                    <div
                      key={bot.id}
                      onClick={() => {
                        setSelectedBottom(bot);
                        setActiveComboId('custom');
                        triggerLayeredPromptOptimization({ top: selectedTop, bottom: bot, headwear: selectedHeadwear, footwear: selectedFootwear, accessory: selectedAccessory });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm' 
                          : 'bg-cream-50/50 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-matcha-200">
                        <img src={bot.url} alt={bot.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-fashion font-bold truncate block">{bot.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : 'bg-matcha-100 text-matcha-800'}`}>
                          {bot.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}

                {activeSlotTab === 'headwear' && MULTI_SLOT_CATALOG.headwear.map((head) => {
                  const isSelected = selectedHeadwear.id === head.id;
                  return (
                    <div
                      key={head.id}
                      onClick={() => {
                        setSelectedHeadwear(head);
                        setActiveComboId('custom');
                        triggerLayeredPromptOptimization({ top: selectedTop, bottom: selectedBottom, headwear: head, footwear: selectedFootwear, accessory: selectedAccessory });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm' 
                          : 'bg-cream-50/50 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                      }`}
                    >
                      {head.url ? (
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-matcha-200">
                          <img src={head.url} alt={head.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-cream-100 flex items-center justify-center shrink-0 border border-matcha-200 text-lg">
                          🚫
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-fashion font-bold truncate block">{head.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : 'bg-matcha-100 text-matcha-800'}`}>
                          {head.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}

                {activeSlotTab === 'footwear' && MULTI_SLOT_CATALOG.footwear.map((foot) => {
                  const isSelected = selectedFootwear.id === foot.id;
                  return (
                    <div
                      key={foot.id}
                      onClick={() => {
                        setSelectedFootwear(foot);
                        setActiveComboId('custom');
                        triggerLayeredPromptOptimization({ top: selectedTop, bottom: selectedBottom, headwear: selectedHeadwear, footwear: foot, accessory: selectedAccessory });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm' 
                          : 'bg-cream-50/50 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-matcha-200">
                        <img src={foot.url} alt={foot.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-fashion font-bold truncate block">{foot.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : 'bg-matcha-100 text-matcha-800'}`}>
                          {foot.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}

                {activeSlotTab === 'accessory' && MULTI_SLOT_CATALOG.accessories.map((acc) => {
                  const isSelected = selectedAccessory.id === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccessory(acc);
                        setActiveComboId('custom');
                        triggerLayeredPromptOptimization({ top: selectedTop, bottom: selectedBottom, headwear: selectedHeadwear, footwear: selectedFootwear, accessory: acc });
                      }}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm' 
                          : 'bg-cream-50/50 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                      }`}
                    >
                      {acc.url ? (
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-matcha-200">
                          <img src={acc.url} alt={acc.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-cream-100 flex items-center justify-center shrink-0 border border-matcha-200 text-lg">
                          🚫
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-fashion font-bold truncate block">{acc.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : 'bg-matcha-100 text-matcha-800'}`}>
                          {acc.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Enhancement Tags */}
            <div className="space-y-2 pt-2 border-t border-matcha-100">
              <span className="text-[11px] font-fashion font-bold text-matcha-900">
                Thẻ Bổ Trợ Phong Cách:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_ENHANCEMENT_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.label);
                  return (
                    <button
                      key={tag.label}
                      onClick={() => handleToggleTag(tag)}
                      className={`text-[10px] font-fashion font-bold px-2 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-emerald-900 text-emerald-100 border-emerald-900 shadow-sm'
                          : 'bg-cream-50 hover:bg-matcha-100 text-matcha-800 border-matcha-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generated Multi-Layer Prompt Box */}
            <div className="space-y-1.5 pt-2 border-t border-matcha-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-fashion font-bold text-matcha-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Prompt Tổng Hợp Đa Lớp (Gemini 3.6):
                </label>
                <button
                  onClick={() => triggerLayeredPromptOptimization()}
                  disabled={isOptimizingPrompt}
                  className="text-[10px] text-matcha-700 hover:text-matcha-950 font-bold flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isOptimizingPrompt ? 'animate-spin' : ''}`} />
                  Tối Ưu Lại
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-mono p-3 rounded-2xl bg-cream-50/80 border border-matcha-200 focus:outline-none focus:ring-2 focus:ring-matcha-500/20 text-matcha-950 resize-none leading-relaxed"
                  placeholder="Prompt tiếng Anh cho AI..."
                />
                {isOptimizingPrompt && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-matcha-800">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Gemini 3.6 đang phối hợp 5 lớp trang phục...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleRunImageToImage}
              disabled={isRunning || isOptimizingPrompt}
              className={`w-full py-3.5 px-6 rounded-2xl font-fashion font-bold text-sm text-cream-50 transition shadow-fashion flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-matcha-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-matcha-900 via-emerald-900 to-matcha-950 hover:opacity-95 active:scale-[0.99]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Đang Kết Xuất Phối Đồ AI Đa Lớp...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Chạy Thử Nghiệm Ghép 5 Lớp AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= COLUMN 3: RESULT & INSPECTION STUDIO (4.5 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-matcha-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-xs">3</div>
                <div>
                  <h2 className="text-sm font-fashion font-bold text-matcha-950">Kết Quả Render AI</h2>
                  <p className="text-[11px] text-matcha-600">So sánh Trước / Sau khi thử đồ</p>
                </div>
              </div>
              
              {resultData && (
                <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl border border-matcha-200">
                  <button
                    onClick={() => setViewMode('result')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${viewMode === 'result' ? 'bg-white shadow text-matcha-900' : 'text-matcha-600'}`}
                  >
                    Kết Quả
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${viewMode === 'split' ? 'bg-white shadow text-matcha-900' : 'text-matcha-600'}`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode('side')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${viewMode === 'side' ? 'bg-white shadow text-matcha-900' : 'text-matcha-600'}`}
                  >
                    2 Cột
                  </button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 animate-shake">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Lỗi Thực Thi AI</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed break-words">{errorMessage}</p>
              </div>
            )}

            {/* Running Step Progress */}
            {isRunning && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-emerald-700 animate-spin" />
                    Đang xử lý Cloud Image-to-Image...
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700">~30s</span>
                </div>

                <div className="space-y-1.5 text-[11px] text-emerald-800">
                  <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-900 font-semibold' : 'text-emerald-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStep >= 1 ? 'text-emerald-600' : 'text-emerald-300'}`} />
                    <span>1. Phân tích nhân vật & giải mã 5 lớp trang phục</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-900 font-semibold' : 'text-emerald-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStep >= 2 ? 'text-emerald-600' : 'text-emerald-300'}`} />
                    <span>2. Tối ưu prompt đa lớp với Gemini 3.6 Flash</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-900 font-semibold' : 'text-emerald-500'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStep >= 3 ? 'text-emerald-600 animate-pulse' : 'text-emerald-300'}`} />
                    <span>3. Gemini 3.0 Pro Image render trang phục lên nhân vật</span>
                  </div>
                </div>
              </div>
            )}

            {/* Display Result Box */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-cream-50 border border-matcha-200 flex items-center justify-center shadow-inner">
              {resultData?.resultUrl ? (
                viewMode === 'result' ? (
                  <img
                    src={resultData.resultUrl}
                    alt="Kết quả thử đồ AI"
                    className="w-full h-full object-cover animate-fadeIn"
                  />
                ) : viewMode === 'split' ? (
                  <div className="relative w-full h-full select-none overflow-hidden">
                    {/* Background Original Image */}
                    <img src={humanImage} alt="Trước" className="absolute inset-0 w-full h-full object-cover" />
                    
                    {/* Overlay AI Result Image with Clip Path */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(${splitSlider}% 0, 100% 0, 100% 100%, ${splitSlider}% 100%)` }}
                    >
                      <img src={resultData.resultUrl} alt="Sau" className="absolute inset-0 w-full h-full object-cover" />
                    </div>

                    {/* Slider Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize flex items-center justify-center pointer-events-none"
                      style={{ left: `${splitSlider}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-matcha-900 text-cream-50 border-2 border-white shadow flex items-center justify-center text-[10px] font-bold">
                        ↔
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={splitSlider}
                      onChange={(e) => setSplitSlider(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                    />

                    <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                      Gốc
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-900/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md font-bold">
                      Đã Thử Đồ (AI)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 w-full h-full gap-1">
                    <img src={humanImage} alt="Gốc" className="w-full h-full object-cover rounded-l-xl" />
                    <img src={resultData.resultUrl} alt="AI" className="w-full h-full object-cover rounded-r-xl" />
                  </div>
                )
              ) : (
                <div className="text-center p-6 space-y-2 text-matcha-400">
                  <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-matcha-300">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-fashion font-bold text-matcha-600">Chưa có kết quả kết xuất</p>
                  <p className="text-[11px] text-matcha-500 max-w-xs">
                    Hãy chọn người mẫu, phối 5 lớp trang phục và bấm nút <strong>Chạy Thử Nghiệm Ghép 5 Lớp AI</strong> để xem kết quả.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons for Result */}
            {resultData?.resultUrl && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-matcha-700 bg-cream-50 p-3 rounded-2xl border border-matcha-200">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-matcha-600" />
                    Thời gian: <strong>{resultData.executionTime}</strong>
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Gemini 3.0 Pro Image
                  </span>
                </div>

                <a
                  href={resultData.resultUrl}
                  download="viet_phuc_multilayer_remix.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-300 font-fashion font-bold text-xs shadow-sm transition"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Tải Xuống Ảnh Chất Lượng Cao (8K)</span>
                </a>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
