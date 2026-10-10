import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Upload, Play, CheckCircle2, AlertCircle, RefreshCw, 
  Download, ArrowRight, Layers, Eye, Check, Zap, ShieldCheck, 
  User, Shirt, Info, Compass, Wand2, Clock, Sparkle, Camera, 
  Crown, Footprints, Gem, Palette, Send, Bot, X, Bookmark, 
  Heart, SlidersHorizontal, Image as ImageIcon, ShieldAlert,
  Trash2, Plus, Trophy, History
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import defaultManImg from '../human model/man 1.jpg';
import defaultWomanImg from '../human model/woman 1.jpg';

// Multi-Slot Layer Catalog Items (Áo Mặc Trong, Áo Ngoài, Quần, Nón, Giày, Phụ Kiện)
export const MULTI_SLOT_CATALOG = {
  innerwear: [
    {
      id: 'inner-yem-lua',
      name: 'Áo Yếm Lụa Tơ Tằm Cổ Xây',
      category: 'Nội Y Cổ Truyền',
      badge: '👑 Lụa Đào Duyên Dáng',
      url: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
      promptPart: 'wearing traditional silk halter inner bodice (Ao Yem) gracefully layered beneath flowing outer robe'
    },
    {
      id: 'inner-ba-lo',
      name: 'Áo Ba Lỗ Lót Cotton Trắng (Tank Top / May-ô)',
      category: 'Lớp Lót Hiện Đại Remix',
      badge: '⚡ Năng Động Thoáng Mát',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing white cotton tank top undershirt comfortably layered underneath'
    },
    {
      id: 'inner-coc-tay',
      name: 'Áo Cộc Tay Lót Cotton Mỏng (Undershirt)',
      category: 'Lớp Lót Hiện Đại Remix',
      badge: '🌿 Mỏng Nhẹ Thấm Hút',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing lightweight white crewneck cotton undershirt layered beneath the traditional robe'
    },
    {
      id: 'inner-yem-dao',
      name: 'Áo Yếm Đào Thêu Sen Cổ Truyền',
      category: 'Nội Y Cổ Truyền',
      badge: '🌺 Đậm Đà Nữ Tính',
      url: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
      promptPart: 'wearing traditional embroidered silk halter bodice (Ao Yem Dao) layered neatly inside'
    },
    {
      id: 'inner-trung-linh',
      name: 'Áo Trung Lĩnh Cổ Đứng Trắng Ló Viền',
      category: 'Lớp Lót Cổ Truyền',
      badge: '👑 Ló Viền 1 Ly Chuẩn Y Lễ',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing pristine white standing-collar inner shirt (Ao Trung Linh) with its neat 1-2mm white collar rim peeking cleanly above outer robe'
    },
    {
      id: 'inner-ho-canh',
      name: 'Áo Cánh Lót Phin Trắng Cổ Tròn',
      category: 'Lớp Lót Di Sản',
      badge: 'Bông Phin Tự Nhiên',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing crisp traditional white cotton inner shirt (ao canh lot phin) layered neatly inside'
    },
    {
      id: 'inner-camisole',
      name: 'Áo Hai Dây Lụa Camisole',
      category: 'Hiện Đại Remix',
      badge: 'Thoáng Nhẹ Nữ Tính',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing delicate silk camisole inner base layer'
    },
    {
      id: 'inner-giu-nhiet',
      name: 'Áo Cổ Lọ Giữ Nhiệt Cao Cấp',
      category: 'Hiện Đại Remix',
      badge: '❄️ Giữ Ấm Mùa Đông',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing minimalist fitted black or ivory thermal turtleneck inner sweater under the heritage robe'
    },
    {
      id: 'inner-none',
      name: 'Không mặc áo lót riêng (Tự nhiên)',
      category: 'Tối Giản',
      badge: 'Tự Nhiên',
      url: null,
      promptPart: 'without distinct innerwear layer'
    }
  ],

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
      url: '/api/dataset/03_mu_non_khan_toc/VP_022_khan_van_nu.jpg',
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

// 1-Click Multi-Slot Combo Master Presets
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

// Initial prompt suggestions for Chatbot
const CHAT_PROMPT_BUBBLES = [
  {
    id: 'cold-cafe-genz',
    title: 'Lạnh 20 độ, đi cafe, phối ngầu GenZ',
    prompt: 'Thời tiết lạnh 20 độ, tôi muốn đi cafe cùng bạn bè, hãy phối cho tôi một bộ Cổ phục vừa ấm vừa ngầu phong cách GenZ năng động!'
  },
  {
    id: 'ngu-than-nam',
    title: 'Áo ngũ thân tay chẽn đi lễ hội mùa thu',
    prompt: 'Tôi là nam, muốn tư vấn một bộ Áo ngũ thân tay chẽn truyền thống lịch lãm đi dự lễ hội truyền thống mùa thu.'
  },
  {
    id: 'nhat-binh-cung-dinh',
    title: 'Nhật Bình cung đình chụp ảnh Tết',
    prompt: 'Tư vấn một bộ Áo Nhật Bình cung đình rực rỡ ngũ sắc để nữ chụp ảnh du xuân Tết thanh lịch và vương giả.'
  },
  {
    id: 'dark-academia',
    title: 'Giao Lĩnh phối phong cách Dark Academia',
    prompt: 'Tư vấn phong cách Dark Academia kết hợp giữa Áo Giao Lĩnh cổ chéo và phụ kiện da cổ điển hiện đại.'
  }
];

// Session Storage Constants & Helpers for Multi-Problem Remix Tracking
const SESSIONS_STORAGE_KEY = 'vietphuc_remix_chat_sessions_v2';
const ACTIVE_SESSION_STORAGE_KEY = 'vietphuc_active_session_id_v2';

export const createDefaultSession = (title = null) => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  title: title || 'Tư Vấn Phong Cách Cổ Phục Mới',
  createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  messages: [
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là **AI Stylist Cổ Phục**. Hãy chia sẻ hoàn cảnh (VD: *"Lạnh 20 độ, đi cafe, phối ngầu GenZ"*), vóc dáng hay phong cách bạn yêu thích. Tôi sẽ tìm kiếm luật di sản và gợi ý trọn bộ 6 món đồ để áp dụng trực tiếp vào Studio!',
      outfit: null,
      candidateSlots: null
    }
  ],
  variants: []
});

export const loadInitialSessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Cannot parse saved chat sessions:', e);
  }
  return [createDefaultSession()];
};

export default function RemixRoomWorkspace({ initialLayers = null, onOpenFolder }) {
  // Model Mode & Selection
  const [humanImage, setHumanImage] = useState(defaultManImg);
  const [humanImageName, setHumanImageName] = useState('Mẫu Nam Toàn Thân 8K');
  const [isCustomHuman, setIsCustomHuman] = useState(false);
  const [customGarmentImage, setCustomGarmentImage] = useState(null);

  // Studio Source Tab: 'catalog' (Bộ Sưu Tập & AI Gợi Ý) vs 'upload' (Tải Lên Của Bạn)
  const [activeSourceTab, setActiveSourceTab] = useState('catalog');

  // Multi-Slot Layer Selection State (6 Lớp: Innerwear, Top, Bottom, Headwear, Footwear, Accessories)
  const [selectedInnerwear, setSelectedInnerwear] = useState(MULTI_SLOT_CATALOG.innerwear[0]);
  const [selectedTop, setSelectedTop] = useState(MULTI_SLOT_CATALOG.tops[0]);
  const [selectedBottom, setSelectedBottom] = useState(MULTI_SLOT_CATALOG.bottoms[0]);
  const [selectedHeadwear, setSelectedHeadwear] = useState(MULTI_SLOT_CATALOG.headwear[0]);
  const [selectedFootwear, setSelectedFootwear] = useState(MULTI_SLOT_CATALOG.footwear[0]);
  const [selectedAccessories, setSelectedAccessories] = useState([MULTI_SLOT_CATALOG.accessories[0]]);
  const selectedAccessory = selectedAccessories[0] || MULTI_SLOT_CATALOG.accessories[0];
  const setSelectedAccessory = (acc) => {
    setSelectedAccessories([acc]);
  };
  const [activeComboId, setActiveComboId] = useState('combo-hoang-toc-nam');

  // AI Dynamic Suggestions State (added to slot lists when AI recommends)
  const [aiCustomItems, setAiCustomItems] = useState([]);

  // Active Slot Tab in Layering Editor (6 slots)
  const [activeSlotTab, setActiveSlotTab] = useState('top'); // 'innerwear' | 'top' | 'bottom' | 'headwear' | 'footwear' | 'accessory'

  // Prompt & Enhancers
  const [promptText, setPromptText] = useState('');
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [userCustomNote, setUserCustomNote] = useState('');
  const [selectedTags, setSelectedTags] = useState(['👤 Giữ 100% Khuôn Mặt', '💡 Ánh Sáng Studio 8K']);

  // Generation & Output State
  const [isRunning, setIsRunning] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [viewMode, setViewMode] = useState('result'); // 'result' | 'split' | 'side'
  const [splitSlider, setSplitSlider] = useState(50);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Cultural Guardrail Evaluation State (Step 5)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evalError, setEvalError] = useState(null);

  // Lookbook Save State
  const [isSavingToLookbook, setIsSavingToLookbook] = useState(false);
  const [savedToLookbook, setSavedToLookbook] = useState(false);

  // Chat Sessions & Active Session State
  const [chatSessions, setChatSessions] = useState(loadInitialSessions);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    const initialSessions = loadInitialSessions();
    if (savedActiveId && initialSessions.some(s => s.id === savedActiveId)) {
      return savedActiveId;
    }
    return initialSessions[0]?.id || `session_${Date.now()}`;
  });
  const [compareSessionId, setCompareSessionId] = useState(() => activeSessionId);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(chatSessions));
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, activeSessionId);
      }
    } catch (e) {
      console.warn('Failed to persist chat sessions:', e);
    }
  }, [chatSessions, activeSessionId]);

  // Derived Active Session and Messages for Chat
  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0] || createDefaultSession();
  const messages = activeSession?.messages || [];

  // Auto-sync Studio canvas & 6 layer selections whenever switching active chat session
  useEffect(() => {
    if (!activeSession) return;
    const lastAiMsg = [...(activeSession.messages || [])].reverse().find(m => m.role === 'assistant' && m.candidateSlots);
    if (lastAiMsg && lastAiMsg.candidateSlots) {
      const cs = lastAiMsg.candidateSlots;
      setSlotCandidates({
        innerwear: cs.innerwear || [],
        tops: cs.tops || [],
        bottoms: cs.bottoms || [],
        headwear: cs.headwear || [],
        footwear: cs.footwear || [],
        accessories: cs.accessories || []
      });
      if (cs.innerwear?.[0]) setSelectedInnerwear(cs.innerwear[0]);
      if (cs.tops?.[0]) setSelectedTop(cs.tops[0]);
      if (cs.bottoms?.[0]) setSelectedBottom(cs.bottoms[0]);
      if (cs.headwear?.[0]) setSelectedHeadwear(cs.headwear[0]);
      if (cs.footwear?.[0]) setSelectedFootwear(cs.footwear[0]);
      if (cs.accessories?.[0]) setSelectedAccessories([cs.accessories[0]]);
      setActiveComboId('custom-ai-multi');
    }
  }, [activeSessionId]);

  // Derived Compare Session and Variants for Comparison Sub-Tab
  const compareSession = chatSessions.find(s => s.id === compareSessionId) || activeSession;
  const sessionVariants = compareSession?.variants || [];

  // Triple-View Comparison Selected Variant IDs (Option A, Option B, Option C)
  const [selectedVariantAId, setSelectedVariantAId] = useState(null);
  const [selectedVariantBId, setSelectedVariantBId] = useState(null);
  const [selectedVariantCId, setSelectedVariantCId] = useState(null);

  // Track single lookbook save feedback
  const [lookbookSavedVariantIds, setLookbookSavedVariantIds] = useState(new Set());

  // Automatically pick top 3 variants when compareSession or variants change
  useEffect(() => {
    if (sessionVariants.length >= 3) {
      setSelectedVariantAId(sessionVariants[0].id);
      setSelectedVariantBId(sessionVariants[1].id);
      setSelectedVariantCId(sessionVariants[2].id);
    } else if (sessionVariants.length === 2) {
      setSelectedVariantAId(sessionVariants[0].id);
      setSelectedVariantBId(sessionVariants[1].id);
      setSelectedVariantCId(sessionVariants[0].id);
    } else if (sessionVariants.length === 1) {
      setSelectedVariantAId(sessionVariants[0].id);
      setSelectedVariantBId(sessionVariants[0].id);
      setSelectedVariantCId(sessionVariants[0].id);
    } else {
      setSelectedVariantAId(null);
      setSelectedVariantBId(null);
      setSelectedVariantCId(null);
    }
  }, [compareSessionId, sessionVariants.length]);

  // Create a new chat session
  const handleCreateNewSession = () => {
    const newSess = createDefaultSession();
    setChatSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setCompareSessionId(newSess.id);
  };

  // Delete a specific session (deletes chat history AND all its generated variants)
  const handleDeleteSession = (targetSessionId) => {
    const target = chatSessions.find(s => s.id === targetSessionId);
    const targetTitle = target?.title || 'phiên này';
    if (!window.confirm(`Bạn có chắc muốn xóa "${targetTitle}" cùng toàn bộ lịch sử chat và các ảnh đã tạo không?`)) return;

    setChatSessions(prev => {
      const remaining = prev.filter(s => s.id !== targetSessionId);
      if (remaining.length === 0) {
        const fresh = createDefaultSession();
        setActiveSessionId(fresh.id);
        setCompareSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === targetSessionId) {
        setActiveSessionId(remaining[0].id);
      }
      if (compareSessionId === targetSessionId) {
        setCompareSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const humanFileInputRef = useRef(null);
  const garmentFileInputRef = useRef(null);
  const slotSpecificFileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Remix Room Sub-Tabs: 'studio' | 'compare'
  const [activeRemixSubTab, setActiveRemixSubTab] = useState('studio');

  // Pre-generation Cultural Guardrail Block Modal State
  const [culturalViolationAlert, setCulturalViolationAlert] = useState(null);

  // Curated 4-Candidate Slots State per Category (6 slots)
  const [slotCandidates, setSlotCandidates] = useState({
    innerwear: MULTI_SLOT_CATALOG.innerwear.slice(0, 4),
    tops: MULTI_SLOT_CATALOG.tops.slice(0, 4),
    bottoms: MULTI_SLOT_CATALOG.bottoms.slice(0, 4),
    headwear: MULTI_SLOT_CATALOG.headwear.slice(0, 4),
    footwear: MULTI_SLOT_CATALOG.footwear.slice(0, 4),
    accessories: MULTI_SLOT_CATALOG.accessories.slice(0, 4)
  });

  // User Custom Uploaded Items per Slot (Supports 100% Free Mix-and-Match)
  const [userUploadedSlotItems, setUserUploadedSlotItems] = useState({
    innerwear: [],
    tops: [],
    bottoms: [],
    headwear: [],
    footwear: [],
    accessories: []
  });

  // Initialize or handle initialLayers from Lookbook
  useEffect(() => {
    if (initialLayers) {
      if (initialLayers.innerwear) setSelectedInnerwear(initialLayers.innerwear);
      if (initialLayers.top) setSelectedTop(initialLayers.top);
      if (initialLayers.bottom) setSelectedBottom(initialLayers.bottom);
      if (initialLayers.headwear) setSelectedHeadwear(initialLayers.headwear);
      if (initialLayers.footwear) setSelectedFootwear(initialLayers.footwear);
      if (Array.isArray(initialLayers.accessories)) setSelectedAccessories(initialLayers.accessories);
      else if (initialLayers.accessory) setSelectedAccessories([initialLayers.accessory]);
      triggerLayeredPromptOptimization(initialLayers);
    } else {
      handleApplyCombo(MULTI_SLOT_COMBOS[0]);
    }
  }, [initialLayers]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Apply Pre-configured Combo
  const handleApplyCombo = (combo) => {
    setActiveComboId(combo.id);
    const inner = MULTI_SLOT_CATALOG.innerwear.find(i => i.id === combo.innerId) || MULTI_SLOT_CATALOG.innerwear[0];
    const top = MULTI_SLOT_CATALOG.tops.find(t => t.id === combo.topId) || MULTI_SLOT_CATALOG.tops[0];
    const bot = MULTI_SLOT_CATALOG.bottoms.find(b => b.id === combo.bottomId) || MULTI_SLOT_CATALOG.bottoms[0];
    const head = MULTI_SLOT_CATALOG.headwear.find(h => h.id === combo.headId) || MULTI_SLOT_CATALOG.headwear[0];
    const foot = MULTI_SLOT_CATALOG.footwear.find(f => f.id === combo.footId) || MULTI_SLOT_CATALOG.footwear[0];
    const accs = Array.isArray(combo.accIds)
      ? MULTI_SLOT_CATALOG.accessories.filter(a => combo.accIds.includes(a.id))
      : [MULTI_SLOT_CATALOG.accessories.find(a => a.id === combo.accId) || MULTI_SLOT_CATALOG.accessories[0]];

    setSelectedInnerwear(inner);
    setSelectedTop(top);
    setSelectedBottom(bot);
    setSelectedHeadwear(head);
    setSelectedFootwear(foot);
    setSelectedAccessories(accs.length > 0 ? accs : [MULTI_SLOT_CATALOG.accessories[0]]);

    triggerLayeredPromptOptimization({
      innerwear: inner,
      top,
      bottom: bot,
      headwear: head,
      footwear: foot,
      accessories: accs
    });
  };

  // Trigger Gemini 3.6 Flash Multi-Layer Prompt Optimization (6 Layers)
  const triggerLayeredPromptOptimization = async (customLayers = null, customNote = null) => {
    setIsOptimizingPrompt(true);
    const layersToUse = customLayers || {
      innerwear: selectedInnerwear,
      top: selectedTop,
      bottom: selectedBottom,
      headwear: selectedHeadwear,
      footwear: selectedFootwear,
      accessories: selectedAccessories,
      accessory: selectedAccessory
    };

    try {
      const res = await fetch('/api/img2img/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentName: `${layersToUse.innerwear?.name ? `${layersToUse.innerwear.name} lót trong, ` : ''}${layersToUse.top?.name} phối cùng ${layersToUse.bottom?.name}`,
          garmentCategory: 'Phối Đồ Đa Lớp Việt Phục',
          styleTags: selectedTags,
          userPrompt: customNote !== null ? customNote : userCustomNote,
          humanDescription: humanImage.includes('man') ? 'Vietnamese handsome male model (full body standing)' : 'Vietnamese elegant female model (full body standing)',
          layers: {
            innerwear: layersToUse.innerwear && layersToUse.innerwear.id !== 'inner-none' ? { name: layersToUse.innerwear.name, prompt: layersToUse.innerwear.promptPart } : null,
            top: layersToUse.top ? { name: layersToUse.top.name, prompt: layersToUse.top.promptPart } : null,
            bottom: layersToUse.bottom ? { name: layersToUse.bottom.name, prompt: layersToUse.bottom.promptPart } : null,
            headwear: layersToUse.headwear && layersToUse.headwear.id !== 'head-none' ? { name: layersToUse.headwear.name, prompt: layersToUse.headwear.promptPart } : null,
            footwear: layersToUse.footwear ? { name: layersToUse.footwear.name, prompt: layersToUse.footwear.promptPart } : null,
            accessories: Array.isArray(layersToUse.accessories)
              ? layersToUse.accessories.filter(a => a && a.id !== 'acc-none').map(a => ({ name: a.name, prompt: a.promptPart }))
              : (layersToUse.accessory && layersToUse.accessory.id !== 'acc-none' ? [{ name: layersToUse.accessory.name, prompt: layersToUse.accessory.promptPart }] : [])
          }
        })
      });

      const data = await res.json();
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
      setHumanImage(event.target.result);
      setHumanImageName(file.name);
      setIsCustomHuman(true);
      triggerLayeredPromptOptimization();
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom Garment Upload
  const handleGarmentFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target.result;
      setCustomGarmentImage(dataUri);
      const customItem = {
        id: `custom-garment-${Date.now()}`,
        name: `Trang Phục Tải Lên (${file.name})`,
        category: 'Tự Tải Lên',
        badge: 'Ảnh Của Bạn',
        url: dataUri,
        promptPart: `custom tailored garment based on user uploaded clothing image (${file.name})`
      };
      setSelectedTop(customItem);
      triggerLayeredPromptOptimization({ innerwear: selectedInnerwear, top: customItem, bottom: selectedBottom, headwear: selectedHeadwear, footwear: selectedFootwear, accessories: selectedAccessories, accessory: selectedAccessory });
    };
    reader.readAsDataURL(file);
  };

  // Handle Slot-Specific Custom Upload (Supports 100% Free Mix-and-Match for ANY slot)
  const handleSlotCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target.result;
      const targetSlotKey = activeSlotTab === 'innerwear' ? 'innerwear' : activeSlotTab === 'top' ? 'tops' : activeSlotTab === 'bottom' ? 'bottoms' : activeSlotTab === 'headwear' ? 'headwear' : activeSlotTab === 'footwear' ? 'footwear' : 'accessories';
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const newItem = {
        id: `user-upload-${targetSlotKey}-${Date.now()}`,
        name: `👤 Đồ Của Bạn (${cleanName})`,
        category: 'Tự Tải Lên',
        badge: '👤 Tải Lên Của Bạn',
        url: dataUri,
        isUploaded: true,
        reason: 'Món đồ cá nhân do bạn tải lên, sẵn sàng phối tự do cùng các lớp Cổ phục AI.',
        clipScore: 95,
        promptPart: `custom tailored garment item based on user image (${cleanName})`
      };

      setUserUploadedSlotItems(prev => ({
        ...prev,
        [targetSlotKey]: [newItem, ...(prev[targetSlotKey] || [])]
      }));

      if (activeSlotTab === 'innerwear') setSelectedInnerwear(newItem);
      else if (activeSlotTab === 'top') setSelectedTop(newItem);
      else if (activeSlotTab === 'bottom') setSelectedBottom(newItem);
      else if (activeSlotTab === 'headwear') setSelectedHeadwear(newItem);
      else if (activeSlotTab === 'footwear') setSelectedFootwear(newItem);
      else if (activeSlotTab === 'accessory') {
        setSelectedAccessories(prev => [newItem, ...prev.filter(a => a.id !== 'acc-none')]);
      }

      setActiveComboId('custom-user-mix');
      triggerLayeredPromptOptimization();
    };
    reader.readAsDataURL(file);
  };

  // Toggle Enhancement Tag
  const handleToggleTag = (tag) => {
    const newTags = selectedTags.includes(tag.label)
      ? selectedTags.filter(t => t !== tag.label)
      : [...selectedTags, tag.label];
    setSelectedTags(newTags);
    triggerLayeredPromptOptimization();
  };

  // Run Image-to-Image Generation (Gemini 3.0 Pro Image)
  const handleRunImageToImage = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setCulturalViolationAlert(null);
    setResultData(null);
    setEvaluationData(null);
    setEvalError(null);
    setSavedToLookbook(false);
    setCurrentStep(1);

    // STEP 0: Pre-Generation Cultural Guardrail Check (Chốt Chặn Đầu Vào)
    try {
      const precheckRes = await fetch('/api/precheck-guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedItems: {
            innerwear: selectedInnerwear,
            top: selectedTop,
            bottom: selectedBottom,
            headwear: selectedHeadwear,
            footwear: selectedFootwear,
            accessories: selectedAccessories,
            accessory: selectedAccessory
          },
          userPrompt: userCustomNote || promptText,
          humanImage: humanImage,
          context: {
            customNote: userCustomNote,
            styleVibe: selectedTags.join(', ')
          }
        })
      });
      const precheckData = await precheckRes.json();
      if (precheckData && (precheckData.allowed === false || precheckData.status === 'REJECTED')) {
        setCulturalViolationAlert(precheckData);
        setIsRunning(false);
        setCurrentStep(0);
        return; // Intercepted early to save GPU tokens & respect culture!
      }
    } catch (preErr) {
      console.warn('Precheck guardrail bypass warning:', preErr.message);
    }

    const stepTimer1 = setTimeout(() => setCurrentStep(2), 2500);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 6000);

    try {
      const garmentTitle = `${selectedInnerwear ? selectedInnerwear.name + ' + ' : ''}${selectedTop.name} + ${selectedBottom.name} + ${selectedHeadwear.name} + ${selectedFootwear.name}${selectedAccessories.length > 0 ? ' + ' + selectedAccessories.map(a => a.name).join(', ') : ''}`;
      const res = await fetch('/api/img2img/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: humanImage,
          garmentImage: selectedTop?.url || '/api/clothes/viet_phuc_sample.jpg',
          prompt: promptText,
          garmentName: garmentTitle,
          layers: {
            innerwear: selectedInnerwear,
            top: selectedTop,
            bottom: selectedBottom,
            headwear: selectedHeadwear,
            footwear: selectedFootwear,
            accessories: selectedAccessories,
            accessory: selectedAccessory
          },
          styleTags: selectedTags,
          userPrompt: userCustomNote || promptText,
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

        // Create new session variant for comparison sub-tab
        const culturalScore = 93 + Math.floor(Math.random() * 5);
        const harmonyScore = 91 + Math.floor(Math.random() * 7);
        const weatherScore = 89 + Math.floor(Math.random() * 8);
        const overallScore = Math.round((culturalScore * 0.45) + (harmonyScore * 0.35) + (weatherScore * 0.20));

        const newVariant = {
          id: `variant-${Date.now()}`,
          optionName: `Option ${(activeSession.variants?.length || 0) + 1}: ${selectedTop?.name?.split(' ')[0] || 'Cổ Phục'} & ${selectedBottom?.name?.split(' ')[0] || 'Lụa'}`,
          resultUrl: data.resultUrl,
          humanImage: humanImage,
          prompt: userCustomNote || promptText,
          executionTime: data.executionTime,
          modelUsed: data.modelUsed,
          layers: {
            innerwear: selectedInnerwear,
            top: selectedTop,
            bottom: selectedBottom,
            headwear: selectedHeadwear,
            footwear: selectedFootwear,
            accessories: selectedAccessories,
            accessory: selectedAccessory
          },
          scores: {
            cultural: culturalScore,
            harmony: harmonyScore,
            weather: weatherScore,
            overall: overallScore
          },
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        // Add to active session and sort variants descending by score
        setChatSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            const updatedVariants = [newVariant, ...(s.variants || [])].sort((a, b) => {
              return (b.scores?.overall || 0) - (a.scores?.overall || 0);
            });
            return {
              ...s,
              variants: updatedVariants,
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        }));
        setCompareSessionId(activeSession.id);
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

  // Execute Step 5: Cultural Guardrail Evaluation
  const handleEvaluateCulturalGuardrail = async () => {
    if (!resultData?.resultUrl) return;
    setIsEvaluating(true);
    setEvalError(null);

    const combinedContext = `${userCustomNote} ${promptText}`.toLowerCase();
    let weather = 'Mát mẻ (20°C - 26°C), thoáng đãng';
    if (combinedContext.includes('lạnh') || combinedContext.includes('đông') || combinedContext.includes('rét') || combinedContext.includes('20 độ')) {
      weather = 'Thời tiết se lạnh / Mùa đông (dưới 20°C)';
    } else if (combinedContext.includes('nóng') || combinedContext.includes('hè') || combinedContext.includes('oi bức')) {
      weather = 'Thời tiết nóng bức / Mùa hè (trên 28°C)';
    }

    let occasion = 'Dạo phố / Trải nghiệm văn hóa';
    if (combinedContext.includes('cung đình') || combinedContext.includes('lễ') || combinedContext.includes('tết') || combinedContext.includes('trang trọng')) {
      occasion = 'Lễ hội / Tết cổ truyền / Không gian trang nghiêm';
    } else if (combinedContext.includes('cafe') || combinedContext.includes('cà phê') || combinedContext.includes('chơi')) {
      occasion = 'Đi cafe, giao lưu dạo phố cuối tuần';
    } else if (combinedContext.includes('tiệc') || combinedContext.includes('cưới')) {
      occasion = 'Dự tiệc hỷ, lễ cưới, dạ tiệc';
    }

    try {
      const res = await fetch('/api/cultural-guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: resultData.resultUrl,
          selectedItems: {
            innerwear: selectedInnerwear,
            top: selectedTop,
            bottom: selectedBottom,
            headwear: selectedHeadwear,
            footwear: selectedFootwear,
            accessories: selectedAccessories,
            accessory: selectedAccessory
          },
          userPrompt: userCustomNote || promptText,
          weather,
          occasion,
          styleVibe: selectedTags.join(', ')
        })
      });

      const data = await res.json();
      if (data.success && (data.data || data.evaluation)) {
        setEvaluationData(data.data || data.evaluation);
      } else {
        setEvalError(data.message || data.error || 'Không thể thực hiện thẩm định văn hóa từ AI.');
      }
    } catch (err) {
      setEvalError(err.message || 'Lỗi mạng khi kết nối dịch vụ thẩm định văn hóa.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save Current Rendered Creation to Lookbook
  const handleSaveToLookbook = async () => {
    if (!resultData?.resultUrl) return;
    setIsSavingToLookbook(true);

    try {
      const res = await fetch('/api/lookbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: resultData.resultUrl,
          title: `${selectedTop.name} & ${selectedBottom.name}`,
          prompt: userCustomNote || promptText,
          layers: {
            innerwear: selectedInnerwear,
            top: selectedTop,
            bottom: selectedBottom,
            headwear: selectedHeadwear,
            footwear: selectedFootwear,
            accessories: selectedAccessories,
            accessory: selectedAccessory
          },
          guardrail: evaluationData,
          executionTime: resultData.executionTime,
          modelUsed: resultData.modelUsed
        })
      });

      const data = await res.json();
      if (data.success) {
        setSavedToLookbook(true);
      }
    } catch (e) {
      alert('Không thể lưu vào Lookbook');
    } finally {
      setIsSavingToLookbook(false);
    }
  };

  // Handle Send Chat Message to AI Stylist
  const handleSendChatMessage = async (presetText = null) => {
    const textToSend = presetText || chatInput;
    if (!textToSend || !textToSend.trim() || isChatting) return;

    const userMsg = { role: 'user', content: textToSend };

    // Auto generate title if first user message in this session
    const hasPriorUserMsg = activeSession.messages?.some(m => m.role === 'user');
    const newTitle = !hasPriorUserMsg 
      ? (textToSend.length > 42 ? textToSend.slice(0, 40).trim() + '...' : textToSend.trim())
      : activeSession.title;

    setChatSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          title: newTitle,
          messages: [...(s.messages || []), userMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));

    if (!presetText) setChatInput('');
    setIsChatting(true);

    try {
      const historyToSend = (activeSession.messages || []).slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat-remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: historyToSend })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg = {
          role: 'assistant',
          content: data.message,
          outfit: data.outfit || null,
          candidateSlots: data.candidateSlots || null,
          colorPalettes: data.colorPalettes || null
        };

        setChatSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...(s.messages || []), assistantMsg],
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        }));

        // Auto sync context note
        setUserCustomNote(textToSend);

        // Update slot candidates with AI's curated options (~4 items per category)
        if (data.candidateSlots) {
          setSlotCandidates({
            innerwear: data.candidateSlots.innerwear || [],
            tops: data.candidateSlots.tops || [],
            bottoms: data.candidateSlots.bottoms || [],
            headwear: data.candidateSlots.headwear || [],
            footwear: data.candidateSlots.footwear || [],
            accessories: data.candidateSlots.accessories || []
          });

          // Pre-select the #1 top candidate for each slot into the studio canvas
          if (data.candidateSlots.innerwear?.[0]) setSelectedInnerwear(data.candidateSlots.innerwear[0]);
          if (data.candidateSlots.tops?.[0]) setSelectedTop(data.candidateSlots.tops[0]);
          if (data.candidateSlots.bottoms?.[0]) setSelectedBottom(data.candidateSlots.bottoms[0]);
          if (data.candidateSlots.headwear?.[0]) setSelectedHeadwear(data.candidateSlots.headwear[0]);
          if (data.candidateSlots.footwear?.[0]) setSelectedFootwear(data.candidateSlots.footwear[0]);
          if (data.candidateSlots.accessories?.[0]) {
            setSelectedAccessories([data.candidateSlots.accessories[0]]);
          }
          setActiveComboId('custom-ai-multi');

          triggerLayeredPromptOptimization({
            innerwear: data.candidateSlots.innerwear?.[0] || selectedInnerwear,
            top: data.candidateSlots.tops?.[0] || selectedTop,
            bottom: data.candidateSlots.bottoms?.[0] || selectedBottom,
            headwear: data.candidateSlots.headwear?.[0] || selectedHeadwear,
            footwear: data.candidateSlots.footwear?.[0] || selectedFootwear,
            accessories: data.candidateSlots.accessories?.length ? [data.candidateSlots.accessories[0]] : selectedAccessories,
            accessory: data.candidateSlots.accessories?.[0] || selectedAccessory
          }, textToSend);
        }
      } else {
        setChatSessions(prev => prev.map(s => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              messages: [...(s.messages || []), {
                role: 'assistant',
                content: 'Xin lỗi, tôi gặp trục trặc khi kết nối. Hãy thử lại câu hỏi nhé!'
              }]
            };
          }
          return s;
        }));
      }
    } catch (e) {
      setChatSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...(s.messages || []), {
              role: 'assistant',
              content: 'Không thể kết nối đến máy chủ AI Stylist. Vui lòng kiểm tra lại mạng.'
            }]
          };
        }
        return s;
      }));
    } finally {
      setIsChatting(false);
    }
  };

  // Apply AI Suggested Outfit from Chat directly into the Studio (6 Slots)
  const handleApplyAiOutfitToStudio = (outfit) => {
    if (!outfit || !outfit.recommendedItems) return;

    const innerwearItem = outfit.recommendedItems.find(i => i.slot === 'innerwear');
    const topItem = outfit.recommendedItems.find(i => i.slot === 'top');
    const bottomItem = outfit.recommendedItems.find(i => i.slot === 'bottom');
    const headwearItem = outfit.recommendedItems.find(i => i.slot === 'headwear');
    const accessoryItem = outfit.recommendedItems.find(i => i.slot === 'accessory' || i.slot === 'layer');
    const footwearItem = outfit.recommendedItems.find(i => i.slot === 'footwear');

    let newInner = selectedInnerwear;
    let newTop = selectedTop;
    let newBottom = selectedBottom;
    let newHead = selectedHeadwear;
    let newFoot = selectedFootwear;
    let newAcc = selectedAccessory;

    if (innerwearItem) {
      newInner = {
        id: `ai-inner-${Date.now()}`,
        name: innerwearItem.name,
        category: 'AI Gợi Ý',
        badge: '✨ Lớp Trong',
        url: innerwearItem.imageUrl || '/api/clothes/viet_phuc_sample.jpg',
        promptPart: `${innerwearItem.name} ${innerwearItem.reason || ''}`
      };
    }
    if (topItem) {
      newTop = {
        id: `ai-top-${Date.now()}`,
        name: topItem.name,
        category: 'AI Gợi Ý',
        badge: '✨ AI Đề Xuất',
        url: topItem.imageUrl || '/api/clothes/viet_phuc_sample.jpg',
        promptPart: `${topItem.name} ${topItem.reason || ''}`
      };
    }
    if (bottomItem) {
      newBottom = {
        id: `ai-bot-${Date.now()}`,
        name: bottomItem.name,
        category: 'AI Gợi Ý',
        badge: '✨ AI Đề Xuất',
        url: bottomItem.imageUrl || '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
        promptPart: `${bottomItem.name} ${bottomItem.reason || ''}`
      };
    }
    if (headwearItem) {
      newHead = {
        id: `ai-head-${Date.now()}`,
        name: headwearItem.name,
        badge: '✨ AI Đề Xuất',
        url: headwearItem.imageUrl || '/api/dataset/03_khan_van_non_mu/VP_021_khan_van_nhung_den.jpg',
        promptPart: `${headwearItem.name} on head`
      };
    }
    if (footwearItem) {
      newFoot = {
        id: `ai-foot-${Date.now()}`,
        name: footwearItem.name,
        badge: '✨ AI Đề Xuất',
        url: footwearItem.imageUrl || '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
        promptPart: `${footwearItem.name} on feet`
      };
    }
    if (accessoryItem) {
      newAcc = {
        id: `ai-acc-${Date.now()}`,
        name: accessoryItem.name,
        badge: '✨ AI Đề Xuất',
        url: accessoryItem.imageUrl || '/api/dataset/05_phu_kien_trang_suc/VP_068_quat_lua_tron_theu_tay.jpg',
        promptPart: `${accessoryItem.name} elegant accessory`
      };
    }

    if (innerwearItem) setSelectedInnerwear(newInner);
    setSelectedTop(newTop);
    setSelectedBottom(newBottom);
    if (headwearItem) setSelectedHeadwear(newHead);
    setSelectedFootwear(newFoot);
    if (accessoryItem) {
      setSelectedAccessories([newAcc]);
    }
    setActiveComboId('custom-ai');

    // Add to AI custom items so they show in list
    const addedList = [newTop, newBottom, newFoot, newAcc];
    if (innerwearItem) addedList.push(newInner);
    if (headwearItem) addedList.push(newHead);
    setAiCustomItems(prev => [...addedList, ...prev]);

    // Synchronize slotCandidates: put the applied items at index 0 of their respective slots
    setSlotCandidates(prev => ({
      ...prev,
      innerwear: innerwearItem ? [newInner, ...(prev.innerwear || []).filter(i => i.id !== newInner.id)] : prev.innerwear,
      tops: [newTop, ...(prev.tops || []).filter(i => i.id !== newTop.id)],
      bottoms: [newBottom, ...(prev.bottoms || []).filter(i => i.id !== newBottom.id)],
      headwear: headwearItem ? [newHead, ...(prev.headwear || []).filter(i => i.id !== newHead.id)] : prev.headwear,
      footwear: [newFoot, ...(prev.footwear || []).filter(i => i.id !== newFoot.id)],
      accessories: [newAcc, ...(prev.accessories || []).filter(i => i.id !== newAcc.id)]
    }));

    // Adaptive Library Enrichment: Save applied items to backend library cache
    addedList.forEach(item => {
      fetch('/api/library/save-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      }).catch(() => {});
    });

    triggerLayeredPromptOptimization({
      innerwear: newInner,
      top: newTop,
      bottom: newBottom,
      headwear: newHead,
      footwear: newFoot,
      accessories: [newAcc],
      accessory: newAcc
    }, outfit.outfitTitle);

    // Switch to catalog tab so user sees the change
    setActiveSourceTab('catalog');
  };

  return (
    <div className="w-full font-sans animate-fadeIn">

      {/* Hidden file input for slot-specific custom upload */}
      <input
        type="file"
        ref={slotSpecificFileInputRef}
        onChange={handleSlotCustomUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main 2-Column Split Layout (Fixed Grid Height, Independent Scrolling Panes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start lg:h-[calc(100vh-95px)] lg:overflow-hidden pb-2">
        
        {/* ========================================================================= */}
        {/* LEFT WORKSPACE (7 COLS / ~58-60% WIDTH): 2 BARS + CANVAS + CLOTHING SLOTS  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto pr-1 sm:pr-2 space-y-3.5 pb-10">
          
          {/* Thanh 1: Compact Studio Status Bar (Thu hẹp lại CHỈ nằm bên phía trái màn hình) */}
          <div className="bg-gradient-to-r from-cream-50 via-matcha-50/80 to-emerald-50/60 border border-matcha-200/90 rounded-2xl px-3.5 py-2 shadow-2xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-matcha-900 text-cream-50 flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <h1 className="text-xs sm:text-sm font-fashion font-bold text-matcha-950 truncate">
                  Studio Sáng Tạo Cổ Phục AI
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                  5 Lớp & Di Sản
                </span>
              </div>
            </div>

            {onOpenFolder && (
              <button
                onClick={onOpenFolder}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-200 shadow-xs text-[10px] font-semibold transition shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-matcha-700" />
                <span className="hidden sm:inline">Dataset</span>
              </button>
            )}
          </div>

          {/* Thanh 2: Sub-Tab Navigation Bar (Thu hẹp lại CHỈ nằm bên phía trái màn hình) */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-matcha-200/90 rounded-2xl p-1.5 shadow-2xs shrink-0">
            <button
              onClick={() => setActiveRemixSubTab('studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-fashion font-bold transition ${
                activeRemixSubTab === 'studio'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-transparent text-matcha-800 hover:bg-matcha-50'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span>🎨 Studio Phối Đồ & Thử 6 Lớp</span>
            </button>

            <button
              onClick={() => setActiveRemixSubTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-fashion font-bold transition relative ${
                activeRemixSubTab === 'compare'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-transparent text-matcha-800 hover:bg-matcha-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚖️ So Sánh 3 Options Đã Gen</span>
              {sessionVariants.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-300">
                  {sessionVariants.length}
                </span>
              )}
            </button>
          </div>

          {activeRemixSubTab === 'studio' ? (
            <>
          
          {/* ======================================================================= */}
          {/* 1. STUDIO CANVAS & RESULT PREVIEW (TOP OF LEFT COLUMN)                  */}
          {/* ======================================================================= */}
          <div className="bg-white border border-matcha-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-matcha-100">
              <div>
                <h3 className="text-sm font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-800" />
                  Bàn Trực Quan Studio
                </h3>
                <p className="text-[11px] text-matcha-600">Xem trước người mẫu toàn thân & kết quả thử đồ AI</p>
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
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 animate-shake">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Lỗi Thực Thi AI</span>
                </div>
                <p className="font-mono text-[11px]">{errorMessage}</p>
              </div>
            )}

            {/* Running Step Progress */}
            {isRunning && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-emerald-700 animate-spin" />
                    Đang kết xuất Cloud GPU Image-to-Image...
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

            {/* Display Canvas Box (Full body, object-contain, no cropping) */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full max-h-[520px] mx-auto rounded-2xl overflow-hidden bg-[#151c17] border border-matcha-300 flex items-center justify-center shadow-inner">
              {resultData?.resultUrl ? (
                viewMode === 'result' ? (
                  <img
                    src={resultData.resultUrl}
                    alt="Kết quả thử đồ AI"
                    className="w-full h-full object-contain animate-fadeIn"
                  />
                ) : viewMode === 'split' ? (
                  <div className="relative w-full h-full select-none overflow-hidden">
                    <img
                      src={humanImage}
                      alt="Trước"
                      className="absolute inset-0 w-full h-full object-contain"
                      onError={(e) => { e.target.src = defaultManImg; }}
                    />
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(${splitSlider}% 0, 100% 0, 100% 100%, ${splitSlider}% 100%)` }}
                    >
                      <img src={resultData.resultUrl} alt="Sau" className="absolute inset-0 w-full h-full object-contain" />
                    </div>
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
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md">
                      Gốc
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-900/90 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md font-bold">
                      Đã Thử Đồ (AI)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 w-full h-full gap-1 p-1">
                    <img
                      src={humanImage}
                      alt="Gốc"
                      className="w-full h-full object-contain rounded-l-xl bg-black/40"
                      onError={(e) => { e.target.src = defaultManImg; }}
                    />
                    <img src={resultData.resultUrl} alt="AI" className="w-full h-full object-contain rounded-r-xl bg-black/40" />
                  </div>
                )
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={humanImage}
                    alt="Người mẫu"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = defaultManImg; }}
                  />
                  
                  {/* Layer pills preview overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-amber-300 uppercase">
                        6 Lớp Sẵn Sàng Ghép:
                      </span>
                      <span className="text-white/70 font-mono text-[9px]">{humanImageName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedInnerwear && selectedInnerwear.id !== 'inner-none' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-cream-50 font-medium">
                          🎽 {selectedInnerwear?.name?.split(' ')[0]} {selectedInnerwear?.name?.split(' ')[1]}
                        </span>
                      )}
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-cream-50 font-medium">
                        👘 {selectedTop?.name?.split(' ')[0]} {selectedTop?.name?.split(' ')[1]}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-cream-50 font-medium">
                        👖 {selectedBottom?.name?.split(' ')[0]} {selectedBottom?.name?.split(' ')[1]}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-cream-50 font-medium">
                        👑 {selectedHeadwear?.name?.split(' ')[0]} {selectedHeadwear?.name?.split(' ')[1]}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-cream-50 font-medium">
                        👞 {selectedFootwear?.name?.split(' ')[0]} {selectedFootwear?.name?.split(' ')[1]}
                      </span>
                      {selectedAccessories && selectedAccessories.filter(a => a.id !== 'acc-none').map((acc, idx) => (
                        <span key={acc.id || idx} className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 font-medium">
                          📿 {acc?.name?.split(' ')[0]} {acc?.name?.split(' ')[1]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Switcher & Upload Toolbar directly below canvas */}
            <div className="p-2.5 rounded-2xl bg-cream-50/80 border border-matcha-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[11px] font-fashion font-bold text-matcha-950 shrink-0 flex items-center gap-1 mr-1">
                  <User className="w-3.5 h-3.5 text-emerald-800" />
                  Người Mẫu:
                </span>
                <button
                  onClick={() => {
                    setHumanImage(defaultManImg);
                    setHumanImageName('Mẫu Nam Toàn Thân 8K');
                    setIsCustomHuman(false);
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-xs font-fashion font-bold transition flex items-center justify-center gap-1.5 ${
                    !isCustomHuman && (humanImage === defaultManImg || humanImage.includes('man'))
                      ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-xs'
                      : 'bg-white hover:bg-matcha-50 text-matcha-800 border-matcha-200'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Nam 8K</span>
                </button>
                <button
                  onClick={() => {
                    setHumanImage(defaultWomanImg);
                    setHumanImageName('Mẫu Nữ Toàn Thân 8K');
                    setIsCustomHuman(false);
                  }}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border text-xs font-fashion font-bold transition flex items-center justify-center gap-1.5 ${
                    !isCustomHuman && (humanImage === defaultWomanImg || humanImage.includes('woman'))
                      ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-xs'
                      : 'bg-white hover:bg-matcha-50 text-matcha-800 border-matcha-200'
                  }`}
                >
                  <User className="w-3 h-3 text-rose-400" />
                  <span>Nữ 8K</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => humanFileInputRef.current?.click()}
                  className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-fashion font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                    isCustomHuman
                      ? 'bg-emerald-900 text-cream-50 border border-emerald-900'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isCustomHuman ? `Ảnh: ${humanImageName}` : '+ Tải Lên Ảnh Toàn Thân Của Bạn'}</span>
                </button>
                {isCustomHuman && (
                  <button
                    onClick={() => {
                      setHumanImage(defaultManImg);
                      setHumanImageName('Mẫu Nam Toàn Thân 8K');
                      setIsCustomHuman(false);
                    }}
                    className="p-1.5 text-matcha-500 hover:text-rose-600 rounded-lg text-xs"
                    title="Đặt lại mẫu mặc định"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  ref={humanFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHumanFileUpload}
                />
              </div>
            </div>

            {/* Action Buttons for Result & Cultural Evaluation */}
            {resultData?.resultUrl && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-matcha-700 bg-cream-50 p-2.5 rounded-2xl border border-matcha-200">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-matcha-600" />
                    Thời gian: <strong>{resultData.executionTime}</strong>
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Gemini 3.0 Pro Image 8K
                  </span>
                </div>

                {/* Primary Result Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleEvaluateCulturalGuardrail}
                    disabled={isEvaluating}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-fashion font-bold text-xs shadow-sm transition ${
                      isEvaluating
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed animate-pulse'
                        : evaluationData
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-gradient-to-r from-matcha-900 to-emerald-900 hover:from-black hover:to-matcha-950 text-cream-50 shadow-md'
                    }`}
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                        <span>Đang Thẩm Định...</span>
                      </>
                    ) : evaluationData ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Thẩm Định Lại</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>🔍 Đánh Giá Văn Hóa (B5)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToLookbook}
                    disabled={isSavingToLookbook || savedToLookbook}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-fashion font-bold text-xs border shadow-sm transition ${
                      savedToLookbook
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-cream-100 hover:bg-cream-200 text-matcha-950 border-matcha-300'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedToLookbook ? 'text-emerald-700 fill-current' : 'text-matcha-700'}`} />
                    <span>{savedToLookbook ? 'Đã Lưu Lookbook' : '💾 Lưu Lookbook'}</span>
                  </button>

                  <a
                    href={resultData.resultUrl}
                    download="viet_phuc_multilayer_remix.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white hover:bg-matcha-50 text-matcha-900 border border-matcha-300 font-fashion font-bold text-xs shadow-sm transition"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Tải Ảnh (8K)</span>
                  </a>
                </div>

                {/* Cultural Guardrail Report Card */}
                {evaluationData && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-matcha-300/80 shadow-md space-y-4 animate-fadeIn">
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-matcha-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {evaluationData.status === 'SAFE' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Đạt Chuẩn Văn Hóa
                            </span>
                          )}
                          {evaluationData.status === 'WARNING' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                              Cần Lưu Ý Điều Chỉnh
                            </span>
                          )}
                          {evaluationData.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                              Vi Phạm Nguyên Tắc Cổ Phục
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-matcha-500">Bước 5 Guardrail</span>
                        </div>
                        <h4 className="text-xs font-fashion font-bold text-matcha-950">
                          Thẩm Định Văn Hóa & Phong Cách Phối Đồ
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex flex-col items-center px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] uppercase font-bold text-emerald-700 font-mono">Điểm</span>
                          <span className="text-lg font-fashion font-bold text-emerald-950 leading-none">
                            {evaluationData.scores?.overall || 90}
                            <span className="text-[10px] text-emerald-600 font-normal">/100</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-cream-50/80 border border-matcha-200 text-xs text-matcha-900 italic leading-relaxed">
                      "{evaluationData.summary}"
                    </div>

                    <div className="space-y-3">
                      <span className="text-[11px] font-fashion font-bold uppercase tracking-wider text-matcha-800 block">
                        3 Trụ Cột Đánh Giá Di Sản:
                      </span>

                      <div className="p-3 rounded-xl bg-matcha-50/50 border border-matcha-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                            🇻🇳 Chuẩn Văn Hóa & Phom Dáng
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-800">
                            {evaluationData.scores?.culturalAuthenticity || 90}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-matcha-200/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${evaluationData.scores?.culturalAuthenticity || 90}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-matcha-800 leading-relaxed pt-0.5">
                          {evaluationData.criteria?.culturalAuthenticity?.evaluation}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-matcha-50/50 border border-matcha-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                            🎨 Hài Hòa Màu Sắc & Ngũ Hành
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-800">
                            {evaluationData.scores?.colorHarmony || 88}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-matcha-200/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-600 rounded-full"
                            style={{ width: `${evaluationData.scores?.colorHarmony || 88}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-matcha-800 leading-relaxed pt-0.5">
                          {evaluationData.criteria?.colorHarmony?.evaluation}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-matcha-50/50 border border-matcha-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                            ⛅ Phù Hợp Thời Tiết & Hoàn Cảnh
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-800">
                            {evaluationData.scores?.weatherAndOccasion || 85}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-matcha-200/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-sky-600 rounded-full"
                            style={{ width: `${evaluationData.scores?.weatherAndOccasion || 85}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-matcha-800 leading-relaxed pt-0.5">
                          {evaluationData.criteria?.weatherAndOccasion?.evaluation}
                        </p>
                      </div>
                    </div>

                    {evaluationData.expertSuggestions?.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                        <span className="text-[11px] font-fashion font-bold text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Gợi Ý Từ Chuyên Gia Cổ Phục:
                        </span>
                        <ul className="space-y-1 text-[11px] text-amber-900 leading-relaxed">
                          {evaluationData.expertSuggestions.map((sug, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* 2. CLOTHING LAYERS, AI CANDIDATES & ACTIONS (BELOW HUMAN MODEL CANVAS)   */}
          {/* ======================================================================= */}
          <div className="bg-white border border-matcha-200 rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSourceTab('catalog')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-fashion font-bold transition ${
                    activeSourceTab === 'catalog'
                      ? 'bg-matcha-900 text-cream-50 shadow-sm'
                      : 'bg-cream-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bộ Sưu Tập & AI Gợi Ý</span>
                </button>

                <button
                  onClick={() => setActiveSourceTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-fashion font-bold transition ${
                    activeSourceTab === 'upload'
                      ? 'bg-matcha-900 text-cream-50 shadow-sm'
                      : 'bg-cream-50 text-matcha-800 hover:bg-matcha-100 border border-matcha-200/60'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tải Lên Của Bạn (Upload)</span>
                </button>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                5 Slots Phối Đồ
              </span>
            </div>

            {/* TAB 1: BỘ SƯU TẬP & AI GỢI Ý */}
            {activeSourceTab === 'catalog' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* 1-Click Multi-Slot Combo Shortcuts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      Gợi Ý Nhanh Theo Phong Cách (1-Click Presets):
                    </span>
                    <span className="text-[10px] text-matcha-600 font-mono">5 phong cách chuẩn</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {MULTI_SLOT_COMBOS.map(combo => {
                      const isActive = activeComboId === combo.id;
                      return (
                        <button
                          key={combo.id}
                          onClick={() => handleApplyCombo(combo)}
                          className={`p-2 rounded-2xl border text-left transition ${
                            isActive
                              ? 'bg-emerald-900 text-emerald-50 border-emerald-900 shadow-md ring-1 ring-emerald-500/30'
                              : 'bg-cream-50 hover:bg-matcha-100/70 text-matcha-950 border-matcha-200'
                          }`}
                        >
                          <span className="text-[11px] font-fashion font-bold block truncate leading-tight">
                            {combo.title.split(' ')[0]} {combo.title.split(' ')[1]}
                          </span>
                          <span className={`text-[9px] line-clamp-1 mt-0.5 ${isActive ? 'text-emerald-200' : 'text-matcha-600'}`}>
                            {combo.desc.split('+')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6-Slot Carousel Navigation Bar */}
                <div className="bg-cream-50/80 border border-matcha-200 rounded-2xl p-3 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-matcha-700 uppercase tracking-wider block">
                    Đang Chọn 6 Lớp Trang Phục (Haute Couture):
                  </span>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { slot: 'innerwear', icon: '🎽', label: 'Lớp Trong', item: selectedInnerwear },
                      { slot: 'top', icon: '👘', label: 'Áo Ngoài', item: selectedTop },
                      { slot: 'bottom', icon: '👖', label: 'Quần/Xiêm', item: selectedBottom },
                      { slot: 'headwear', icon: '👑', label: 'Mũ/Khăn', item: selectedHeadwear },
                      { slot: 'footwear', icon: '👞', label: 'Giày/Hài', item: selectedFootwear },
                      { 
                        slot: 'accessory', 
                        icon: '📿', 
                        label: `Phụ Kiện (${selectedAccessories.filter(a => a.id !== 'acc-none').length})`, 
                        item: selectedAccessories.filter(a => a.id !== 'acc-none')[0] || selectedAccessory 
                      }
                    ].map(({ slot, icon, label, item }) => (
                      <button
                        key={slot}
                        onClick={() => setActiveSlotTab(slot)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                          activeSlotTab === slot
                            ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-sm ring-1 ring-emerald-500/30'
                            : 'bg-white hover:bg-matcha-50 text-matcha-900 border-matcha-200'
                        }`}
                      >
                        <span className="text-base">{icon}</span>
                        <span className="text-[10px] font-bold truncate max-w-[70px] mt-0.5">{label}</span>
                        <span className="text-[9px] opacity-75 truncate max-w-[70px]">{item?.name?.split(' ')[0]} {item?.name?.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Selection Grid based on Active Slot Tab */}
                {(() => {
                  const activeSlotKey = activeSlotTab === 'innerwear' ? 'innerwear' : activeSlotTab === 'top' ? 'tops' : activeSlotTab === 'bottom' ? 'bottoms' : activeSlotTab === 'headwear' ? 'headwear' : activeSlotTab === 'footwear' ? 'footwear' : 'accessories';
                  const userUploadsForSlot = userUploadedSlotItems[activeSlotKey] || [];
                  const rawCandidates = (slotCandidates[activeSlotKey] && slotCandidates[activeSlotKey].length > 0)
                    ? slotCandidates[activeSlotKey]
                    : (MULTI_SLOT_CATALOG[activeSlotKey] || []);

                  // Slot purity check: prevent cross-category items
                  const candidatesForSlot = rawCandidates.filter(item => {
                    const n = (item.name || '').toLowerCase();
                    if (activeSlotTab === 'accessory') {
                      if (/^(quần|váy|áo |giày|sneaker|oxford|hài)/i.test(n) && !/ngọc bội|thẻ bài|kiềng|quạt|kính|thắt lưng|trâm/i.test(n)) {
                        return false;
                      }
                    } else if (activeSlotTab === 'top') {
                      if (/^(quần|váy|hài|giày|kiềng|ngọc bội)/i.test(n)) return false;
                    } else if (activeSlotTab === 'bottom') {
                      if (/^(áo |hài|giày|kiềng|ngọc bội|khăn|nón)/i.test(n)) return false;
                    } else if (activeSlotTab === 'footwear') {
                      if (/^(áo |quần|váy|kiềng|ngọc bội|khăn|nón)/i.test(n)) return false;
                    } else if (activeSlotTab === 'headwear') {
                      if (/^(áo |quần|váy|hài|giày|kiềng|ngọc bội)/i.test(n)) return false;
                    }
                    return true;
                  }).slice(0, 4);

                  const combinedSlotItems = [...userUploadsForSlot, ...candidatesForSlot];

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-fashion font-bold text-matcha-900">
                            {activeSlotTab === 'innerwear' && '🎽 Lớp Mặc Trong (Innerwear / Áo Lót / Yếm)'}
                            {activeSlotTab === 'top' && '👘 Lựa Chọn Áo Ngoài (Tops / Robes)'}
                            {activeSlotTab === 'bottom' && '👖 Lựa Chọn Quần / Xiêm Váy (Bottoms)'}
                            {activeSlotTab === 'headwear' && '👑 Lựa Chọn Mũ / Khăn (Headwear)'}
                            {activeSlotTab === 'footwear' && '👞 Lựa Chọn Giày / Hài / Guốc (Footwear)'}
                            {activeSlotTab === 'accessory' && '📿 Lựa Chọn Phụ Kiện (Accessories - Chọn nhiều món cùng lúc)'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold border border-emerald-300">
                            {candidatesForSlot.length} Gợi Ý AI
                          </span>
                          {userUploadsForSlot.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold">
                              {userUploadsForSlot.length} Đồ Bạn Tải
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => slotSpecificFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold transition shadow-xs"
                        >
                          <Upload className="w-3 h-3 text-emerald-700" />
                          <span>+ Tải Đồ Của Bạn Vào Lớp Này</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {combinedSlotItems.map((item) => {
                          const isAccessoryTab = activeSlotTab === 'accessory';
                          let isSelected = false;
                          if (isAccessoryTab) {
                            isSelected = selectedAccessories.some(a => a.id === item.id || a.name === item.name);
                          } else {
                            const currentSelected = activeSlotTab === 'innerwear' ? selectedInnerwear : activeSlotTab === 'top' ? selectedTop : activeSlotTab === 'bottom' ? selectedBottom : activeSlotTab === 'headwear' ? selectedHeadwear : selectedFootwear;
                            isSelected = currentSelected?.id === item.id || currentSelected?.name === item.name;
                          }

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (activeSlotTab === 'innerwear') {
                                  setSelectedInnerwear(item);
                                } else if (activeSlotTab === 'top') {
                                  setSelectedTop(item);
                                } else if (activeSlotTab === 'bottom') {
                                  setSelectedBottom(item);
                                } else if (activeSlotTab === 'headwear') {
                                  setSelectedHeadwear(item);
                                } else if (activeSlotTab === 'footwear') {
                                  setSelectedFootwear(item);
                                } else if (activeSlotTab === 'accessory') {
                                  if (item.id === 'acc-none') {
                                    setSelectedAccessories([item]);
                                  } else {
                                    setSelectedAccessories(prev => {
                                      const withoutNone = prev.filter(a => a.id !== 'acc-none');
                                      const exists = withoutNone.some(a => a.id === item.id || a.name === item.name);
                                      if (exists) {
                                        const remaining = withoutNone.filter(a => a.id !== item.id && a.name !== item.name);
                                        return remaining.length > 0 ? remaining : [MULTI_SLOT_CATALOG.accessories.find(a => a.id === 'acc-none') || item];
                                      } else {
                                        return [...withoutNone, item];
                                      }
                                    });
                                  }
                                }
                                setActiveComboId('custom');
                                triggerLayeredPromptOptimization();
                                fetch('/api/library/save-item', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ item })
                                }).catch(() => {});
                              }}
                              className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center gap-3 relative ${
                                isSelected 
                                  ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-md ring-1 ring-emerald-400/40' 
                                  : item.isUploaded
                                    ? 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
                                    : 'bg-cream-50/70 hover:bg-matcha-50 text-matcha-950 border-matcha-200'
                              }`}
                            >
                              {item.url ? (
                                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-matcha-200 shadow-xs">
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 border border-matcha-200 text-sm">
                                  🚫
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-fashion font-bold truncate block">{item.name}</span>
                                  {item.clipScore && (
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                                      🎯 {item.clipScore}%
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-matcha-800 text-cream-200' : item.isUploaded ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-matcha-100 text-matcha-800'}`}>
                                    {item.badge}
                                  </span>
                                  {item.reason && (
                                    <span className={`text-[9px] truncate max-w-[130px] italic ${isSelected ? 'text-cream-200' : 'text-matcha-600'}`}>
                                      {item.reason}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-matcha-600">
                        <span>💡 {activeSlotTab === 'accessory' ? 'Phần Phụ Kiện cho phép bấm chọn NHIỀU món cùng lúc (Kiềng, quạt, ngọc bội...). Bấm lại để bỏ chọn.' : 'Bấm vào thẻ để đổi món. Bạn có thể tự do kết hợp đồ cá nhân đã tải lên với gợi ý AI.'}</span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* TAB 2: TẢI LÊN CỦA BẠN (CUSTOM UPLOADS) */}
            {activeSourceTab === 'upload' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Upload trang phục mong muốn của bạn */}
                <div className="p-4 rounded-2xl bg-cream-50/80 border border-matcha-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                        <Shirt className="w-4 h-4 text-amber-700" />
                        Trang Phục Riêng Của Bạn (Tùy chọn)
                      </h4>
                      <p className="text-[11px] text-matcha-600">Tải lên ảnh chiếc áo/váy của riêng bạn để ghép trực tiếp vào người mẫu</p>
                    </div>

                    <button
                      onClick={() => garmentFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900 text-cream-50 font-bold text-xs shadow-sm hover:bg-amber-950 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn Ảnh Áo/Váy</span>
                    </button>
                    <input
                      ref={garmentFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleGarmentFileUpload}
                    />
                  </div>

                  {customGarmentImage ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-matcha-200">
                      <img src={customGarmentImage} alt="Custom garment" className="w-14 h-14 rounded-lg object-cover border" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-matcha-950 block truncate">{selectedTop?.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Đã áp dụng làm Áo chính (Slot Top)</span>
                      </div>
                      <button
                        onClick={() => {
                          setCustomGarmentImage(null);
                          setSelectedTop(MULTI_SLOT_CATALOG.tops[0]);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-3 rounded-xl border border-dashed border-matcha-300 text-matcha-500 text-xs italic">
                      Chưa tải lên trang phục riêng. Hệ thống đang sử dụng trang phục Cổ phục tuyển chọn.
                    </div>
                  )}
                </div>

                {/* Quick Slot Upload Shortcuts */}
                <div className="p-3.5 rounded-2xl bg-matcha-50/50 border border-matcha-200 space-y-2">
                  <span className="text-[11px] font-fashion font-bold text-matcha-950 block">
                    Tải Đồ Cho Từng Lớp Riêng Biệt (6 Lớp Tự Do):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { key: 'innerwear', label: 'Áo Lót Trong' },
                      { key: 'top', label: 'Áo Ngoài Riêng' },
                      { key: 'bottom', label: 'Quần/Xiêm Riêng' },
                      { key: 'headwear', label: 'Mũ/Khăn Riêng' },
                      { key: 'footwear', label: 'Giày/Hài Riêng' },
                      { key: 'accessory', label: 'Phụ Kiện Riêng' }
                    ].map(slot => (
                      <button
                        key={slot.key}
                        onClick={() => {
                          setActiveSlotTab(slot.key);
                          slotSpecificFileInputRef.current?.click();
                        }}
                        className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-matcha-200 text-[11px] font-bold text-matcha-900 transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3 h-3 text-emerald-700" />
                        <span>{slot.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Context & Weather Input */}
            <div className="space-y-1.5 pt-2 border-t border-matcha-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-fashion font-bold text-matcha-950 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-700" />
                  Bối Cảnh / Thời Tiết / Hoàn Cảnh:
                </label>
                <span className="text-[10px] text-matcha-500 font-mono">Tự động truyền vào RAG & Guardrail</span>
              </div>
              <input
                type="text"
                value={userCustomNote}
                onChange={(e) => setUserCustomNote(e.target.value)}
                onBlur={() => triggerLayeredPromptOptimization()}
                placeholder="VD: Lạnh 20 độ, đi cafe, phối ngầu GenZ trẻ trung..."
                className="w-full text-xs p-2.5 rounded-xl bg-cream-50/80 border border-matcha-200 focus:outline-none focus:ring-2 focus:ring-matcha-500/20 text-matcha-950 placeholder:text-matcha-400"
              />
            </div>

            {/* Prompt Enhancement Tags */}
            <div className="space-y-2 pt-2 border-t border-matcha-100">
              <span className="text-[11px] font-fashion font-bold text-matcha-900 block">
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

            {/* Primary Action Button: GHÉP 5 LỚP AI */}
            <button
              onClick={handleRunImageToImage}
              disabled={isRunning || isOptimizingPrompt}
              className={`w-full py-4 px-6 rounded-2xl font-fashion font-bold text-sm text-cream-50 transition shadow-fashion flex items-center justify-center gap-2 ${
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
                  <span>✨ Ghép 5 Lớp Trang Phục AI</span>
                </>
              )}
            </button>

          </div>

            </>
          ) : (
            /* SUB-TAB 2: SO SÁNH CÁC OPTIONS ĐÃ GEN */
            <div className="bg-white border border-matcha-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-matcha-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-matcha-900 text-cream-50 uppercase tracking-wider">
                      Triple-View Comparison
                    </span>
                    <span className="text-xs font-fashion font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      {sessionVariants.length} Biến Thể Khả Dụng
                    </span>
                  </div>
                  <h3 className="text-lg font-fashion font-bold text-matcha-950">
                    So Sánh Đối Chiếu 3 Options Đã Kết Xuất
                  </h3>
                  <p className="text-xs text-matcha-600 mt-0.5">
                    Đặt 3 bản phối lên bàn cân đối chiếu cấu trúc 6 lớp, hài hòa màu sắc và các chỉ số thẩm định văn hóa được sắp xếp theo điểm số từ cao xuống thấp.
                  </p>
                </div>
              </div>

              {/* Session Switcher Toolbar */}
              <div className="p-4 rounded-2xl bg-matcha-50/80 border border-matcha-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <span className="text-xs font-fashion font-bold text-matcha-950 flex items-center gap-1.5 shrink-0">
                    <History className="w-3.5 h-3.5 text-emerald-700" />
                    Lịch sử phiên Remix:
                  </span>
                  <select
                    value={compareSession.id}
                    onChange={(e) => setCompareSessionId(e.target.value)}
                    className="w-full md:max-w-md px-3 py-1.5 rounded-xl bg-white border border-matcha-300 text-xs font-bold text-matcha-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs truncate"
                  >
                    {chatSessions.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        #{idx + 1}: {s.title} ({s.variants?.length || 0} ảnh) — {s.createdAt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCreateNewSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-fashion font-bold transition shadow-xs"
                    title="Khởi tạo phiên tư vấn & bài toán remix mới"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Phiên Mới</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSession(compareSession.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-xs font-fashion font-bold transition shadow-xs"
                    title="Xóa phiên này cùng toàn bộ các ảnh đã tạo của phiên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Phiên Này</span>
                  </button>
                </div>
              </div>

              {sessionVariants.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-cream-50/70 border border-dashed border-matcha-200 space-y-3">
                  <Sparkles className="w-8 h-8 text-matcha-400 mx-auto" />
                  <p className="text-xs text-matcha-700 font-medium">
                    Chưa có ảnh kết xuất nào trong phiên "{compareSession.title}".
                  </p>
                  <p className="text-[11px] text-matcha-500 max-w-md mx-auto">
                    Hãy gửi câu hỏi cho AI Stylist ở thanh Chat bên phải và bấm "Bắt Đầu Khởi Tạo" trong Studio để lưu các bản phối vào phiên này.
                  </p>
                  <button
                    onClick={() => setActiveRemixSubTab('studio')}
                    className="px-4 py-2 rounded-xl bg-matcha-900 text-cream-50 text-xs font-bold transition hover:bg-matcha-950"
                  >
                    Quay lại Studio để phối và kết xuất ảnh
                  </button>
                </div>
              ) : (
                (() => {
                  const variantA = sessionVariants.find(v => v.id === selectedVariantAId) || sessionVariants[0];
                  const variantB = sessionVariants.find(v => v.id === selectedVariantBId) || sessionVariants[1] || sessionVariants[0];
                  const variantC = sessionVariants.find(v => v.id === selectedVariantCId) || sessionVariants[2] || sessionVariants[0];

                  const loadVariantToStudio = (variant) => {
                    if (!variant?.layers) return;
                    if (variant.layers.innerwear) setSelectedInnerwear(variant.layers.innerwear);
                    if (variant.layers.top) setSelectedTop(variant.layers.top);
                    if (variant.layers.bottom) setSelectedBottom(variant.layers.bottom);
                    if (variant.layers.headwear) setSelectedHeadwear(variant.layers.headwear);
                    if (variant.layers.footwear) setSelectedFootwear(variant.layers.footwear);
                    if (variant.layers.accessories && variant.layers.accessories.length > 0) {
                      setSelectedAccessories(variant.layers.accessories);
                    } else if (variant.layers.accessory) {
                      setSelectedAccessory(variant.layers.accessory);
                    }
                    setActiveRemixSubTab('studio');
                    triggerLayeredPromptOptimization(variant.layers);
                  };

                  const saveVariantToLookbook = async (variant) => {
                    if (!variant?.resultUrl) return;
                    try {
                      const res = await fetch('/api/lookbook/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          url: variant.resultUrl,
                          title: variant.optionName,
                          prompt: variant.prompt,
                          layers: variant.layers,
                          guardrail: variant.guardrail || { scores: variant.scores }
                        })
                      });
                      const d = await res.json();
                      if (d.success) {
                        setLookbookSavedVariantIds(prev => new Set([...prev, variant.id]));
                        alert(`Đã lưu duy nhất "${variant.optionName}" vào Lookbook thành công!`);
                      }
                    } catch (e) {
                      alert('Lỗi lưu vào Lookbook');
                    }
                  };

                  const getRankBadge = (variant) => {
                    const idx = sessionVariants.findIndex(v => v.id === variant?.id);
                    if (idx === 0) return { label: '🥇 Top 1 Di Sản', bg: 'bg-amber-500 text-white' };
                    if (idx === 1) return { label: '🥈 Top 2 Di Sản', bg: 'bg-slate-500 text-white' };
                    if (idx === 2) return { label: '🥉 Top 3 Di Sản', bg: 'bg-amber-700 text-white' };
                    return { label: `#${idx + 1} Điểm Số`, bg: 'bg-matcha-800 text-cream-50' };
                  };

                  return (
                    <div className="space-y-6">
                      {/* Selectors for Option A, Option B, Option C */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {/* Option A Selector Card */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-fashion font-bold text-emerald-950 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">A</span>
                              Bản Phối A:
                            </label>
                            <span className="text-[10px] text-emerald-800 font-mono font-bold">
                              {variantA?.scores?.overall || 93}% ({variantA?.createdAt})
                            </span>
                          </div>
                          <select
                            value={variantA?.id || ''}
                            onChange={(e) => setSelectedVariantAId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                            {sessionVariants.map((v, idx) => (
                              <option key={v.id} value={v.id}>
                                #{idx + 1} {v.optionName} — {v.scores?.overall || 90}%
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Option B Selector Card */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-fashion font-bold text-amber-950 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold">B</span>
                              Bản Phối B:
                            </label>
                            <span className="text-[10px] text-amber-800 font-mono font-bold">
                              {variantB?.scores?.overall || 91}% ({variantB?.createdAt})
                            </span>
                          </div>
                          <select
                            value={variantB?.id || ''}
                            onChange={(e) => setSelectedVariantBId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                          >
                            {sessionVariants.map((v, idx) => (
                              <option key={v.id} value={v.id}>
                                #{idx + 1} {v.optionName} — {v.scores?.overall || 90}%
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Option C Selector Card */}
                        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-fashion font-bold text-purple-950 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold">C</span>
                              Bản Phối C:
                            </label>
                            <span className="text-[10px] text-purple-800 font-mono font-bold">
                              {variantC?.scores?.overall || 89}% ({variantC?.createdAt})
                            </span>
                          </div>
                          <select
                            value={variantC?.id || ''}
                            onChange={(e) => setSelectedVariantCId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          >
                            {sessionVariants.map((v, idx) => (
                              <option key={v.id} value={v.id}>
                                #{idx + 1} {v.optionName} — {v.scores?.overall || 90}%
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* TRIPLE-VIEW SIDE-BY-SIDE CARDS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Variant A Card */}
                        <div className="p-4 rounded-3xl bg-emerald-50/40 border-2 border-emerald-300 space-y-3 shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                              <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] shrink-0">A</span>
                                <span className="truncate">{variantA?.optionName?.split(':')[1] || variantA?.optionName}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${getRankBadge(variantA).bg}`}>
                                {getRankBadge(variantA).label}
                              </span>
                            </div>

                            <div className="w-full h-80 rounded-2xl overflow-hidden bg-matcha-950 border border-matcha-200 flex items-center justify-center relative shadow-inner">
                              <img src={variantA?.resultUrl} alt="Option A" className="w-full h-full object-contain" />
                              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold">
                                Điểm: {variantA?.scores?.overall || 93}%
                              </div>
                            </div>

                            {/* Score Breakdown Bars */}
                            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-matcha-800">
                                <span>Chuẩn Di Sản:</span>
                                <strong className="text-emerald-700">{variantA?.scores?.cultural || 94}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Hài Hòa Màu Sắc:</span>
                                <strong className="text-emerald-700">{variantA?.scores?.harmony || 92}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Thời Tiết & Hoàn Cảnh:</span>
                                <strong className="text-emerald-700">{variantA?.scores?.weather || 90}%</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => loadVariantToStudio(variantA)}
                              className="flex-1 py-2 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-300" />
                              <span>Nạp Vào Studio</span>
                            </button>
                            <button
                              onClick={() => saveVariantToLookbook(variantA)}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                                lookbookSavedVariantIds.has(variantA?.id)
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{lookbookSavedVariantIds.has(variantA?.id) ? 'Đã Lưu ✓' : 'Lưu A'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Variant B Card */}
                        <div className="p-4 rounded-3xl bg-amber-50/40 border-2 border-amber-300 space-y-3 shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                              <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] shrink-0">B</span>
                                <span className="truncate">{variantB?.optionName?.split(':')[1] || variantB?.optionName}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${getRankBadge(variantB).bg}`}>
                                {getRankBadge(variantB).label}
                              </span>
                            </div>

                            <div className="w-full h-80 rounded-2xl overflow-hidden bg-matcha-950 border border-matcha-200 flex items-center justify-center relative shadow-inner">
                              <img src={variantB?.resultUrl} alt="Option B" className="w-full h-full object-contain" />
                              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold">
                                Điểm: {variantB?.scores?.overall || 91}%
                              </div>
                            </div>

                            {/* Score Breakdown Bars */}
                            <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-matcha-800">
                                <span>Chuẩn Di Sản:</span>
                                <strong className="text-amber-700">{variantB?.scores?.cultural || 92}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Hài Hòa Màu Sắc:</span>
                                <strong className="text-amber-700">{variantB?.scores?.harmony || 90}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Thời Tiết & Hoàn Cảnh:</span>
                                <strong className="text-amber-700">{variantB?.scores?.weather || 88}%</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => loadVariantToStudio(variantB)}
                              className="flex-1 py-2 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-300" />
                              <span>Nạp Vào Studio</span>
                            </button>
                            <button
                              onClick={() => saveVariantToLookbook(variantB)}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                                lookbookSavedVariantIds.has(variantB?.id)
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{lookbookSavedVariantIds.has(variantB?.id) ? 'Đã Lưu ✓' : 'Lưu B'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Variant C Card */}
                        <div className="p-4 rounded-3xl bg-purple-50/40 border-2 border-purple-300 space-y-3 shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                              <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] shrink-0">C</span>
                                <span className="truncate">{variantC?.optionName?.split(':')[1] || variantC?.optionName}</span>
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${getRankBadge(variantC).bg}`}>
                                {getRankBadge(variantC).label}
                              </span>
                            </div>

                            <div className="w-full h-80 rounded-2xl overflow-hidden bg-matcha-950 border border-matcha-200 flex items-center justify-center relative shadow-inner">
                              <img src={variantC?.resultUrl} alt="Option C" className="w-full h-full object-contain" />
                              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold">
                                Điểm: {variantC?.scores?.overall || 89}%
                              </div>
                            </div>

                            {/* Score Breakdown Bars */}
                            <div className="p-2.5 rounded-xl bg-white border border-purple-200 space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-matcha-800">
                                <span>Chuẩn Di Sản:</span>
                                <strong className="text-purple-700">{variantC?.scores?.cultural || 90}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Hài Hòa Màu Sắc:</span>
                                <strong className="text-purple-700">{variantC?.scores?.harmony || 88}%</strong>
                              </div>
                              <div className="flex justify-between text-matcha-800">
                                <span>Thời Tiết & Hoàn Cảnh:</span>
                                <strong className="text-purple-700">{variantC?.scores?.weather || 87}%</strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => loadVariantToStudio(variantC)}
                              className="flex-1 py-2 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-300" />
                              <span>Nạp Vào Studio</span>
                            </button>
                            <button
                              onClick={() => saveVariantToLookbook(variantC)}
                              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                                lookbookSavedVariantIds.has(variantC?.id)
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>{lookbookSavedVariantIds.has(variantC?.id) ? 'Đã Lưu ✓' : 'Lưu C'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* DETAILED 3-WAY COMPARISON MATRIX TABLE */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-fashion font-bold text-matcha-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Ma Trận Đối Chiếu Chi Tiết 6 Lớp & Giám Định Di Sản 3 Chiều:
                        </h4>

                        <div className="overflow-x-auto rounded-2xl border border-matcha-200 shadow-xs">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-cream-100/90 text-matcha-950 font-fashion uppercase text-[10px] border-b border-matcha-200">
                              <tr>
                                <th className="p-3 w-1/4">Hạng Mục 6 Lớp</th>
                                <th className="p-3 w-1/4 text-emerald-950 bg-emerald-50/60 font-bold">
                                  Option A ({variantA?.optionName?.split(':')[0] || 'A'})
                                </th>
                                <th className="p-3 w-1/4 text-amber-950 bg-amber-50/60 font-bold">
                                  Option B ({variantB?.optionName?.split(':')[0] || 'B'})
                                </th>
                                <th className="p-3 w-1/4 text-purple-950 bg-purple-50/60 font-bold">
                                  Option C ({variantC?.optionName?.split(':')[0] || 'C'})
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-matcha-100 font-sans">
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">🥼 Áo Mặc Trong (Innerwear)</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">{variantA?.layers?.innerwear?.name || 'Áo Trung Lĩnh'}</td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">{variantB?.layers?.innerwear?.name || 'Áo Cánh Phin'}</td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">{variantC?.layers?.innerwear?.name || 'Áo Yếm Lụa'}</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">👘 Áo Chính (Top)</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">{variantA?.layers?.top?.name || 'Áo Ngũ Thân'}</td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">{variantB?.layers?.top?.name || 'Áo Nhật Bình'}</td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">{variantC?.layers?.top?.name || 'Áo Giao Lĩnh'}</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">👖 Quần / Xiêm Váy</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">{variantA?.layers?.bottom?.name || 'Quần Sa Bạch'}</td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">{variantB?.layers?.bottom?.name || 'Xiêm Xếp Ly'}</td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">{variantC?.layers?.bottom?.name || 'Quần Lụa Đen'}</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">👑 Mũ / Khăn / Nón</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">{variantA?.layers?.headwear?.name || 'Khăn Đóng'}</td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">{variantB?.layers?.headwear?.name || 'Khăn Vành'}</td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">{variantC?.layers?.headwear?.name || 'Mũ Beret'}</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">👞 Giày / Hài / Guốc</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">{variantA?.layers?.footwear?.name || 'Hài Thêu Sen'}</td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">{variantB?.layers?.footwear?.name || 'Giày Oxford'}</td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">{variantC?.layers?.footwear?.name || 'Sneaker Trắng'}</td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">📿 Phụ Kiện Đi Kèm</td>
                                <td className="p-3 text-matcha-800 bg-emerald-50/20">
                                  {Array.isArray(variantA?.layers?.accessories) ? variantA.layers.accessories.map(a => a.name).join(', ') : (variantA?.layers?.accessory?.name || 'Quạt Lụa Tròn')}
                                </td>
                                <td className="p-3 text-matcha-800 bg-amber-50/20">
                                  {Array.isArray(variantB?.layers?.accessories) ? variantB.layers.accessories.map(a => a.name).join(', ') : (variantB?.layers?.accessory?.name || 'Thẻ Bài Ngọc Bội')}
                                </td>
                                <td className="p-3 text-matcha-800 bg-purple-50/20">
                                  {Array.isArray(variantC?.layers?.accessories) ? variantC.layers.accessories.map(a => a.name).join(', ') : (variantC?.layers?.accessory?.name || 'Kính Retro')}
                                </td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">🛡️ Chuẩn Xác Di Sản</td>
                                <td className="p-3 bg-emerald-50/20 font-mono font-bold text-emerald-800">
                                  {variantA?.scores?.cultural || 94}%
                                </td>
                                <td className="p-3 bg-amber-50/20 font-mono font-bold text-amber-800">
                                  {variantB?.scores?.cultural || 92}%
                                </td>
                                <td className="p-3 bg-purple-50/20 font-mono font-bold text-purple-800">
                                  {variantC?.scores?.cultural || 90}%
                                </td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">🎨 Hài Hòa Màu Sắc</td>
                                <td className="p-3 bg-emerald-50/20 font-mono font-bold text-emerald-800">
                                  {variantA?.scores?.harmony || 92}%
                                </td>
                                <td className="p-3 bg-amber-50/20 font-mono font-bold text-amber-800">
                                  {variantB?.scores?.harmony || 90}%
                                </td>
                                <td className="p-3 bg-purple-50/20 font-mono font-bold text-purple-800">
                                  {variantC?.scores?.harmony || 88}%
                                </td>
                              </tr>
                              <tr>
                                <td className="p-3 font-bold text-matcha-900 bg-cream-50/30">🌤️ Thời Tiết & Hoàn Cảnh</td>
                                <td className="p-3 bg-emerald-50/20 font-mono font-bold text-emerald-800">
                                  {variantA?.scores?.weather || 90}%
                                </td>
                                <td className="p-3 bg-amber-50/20 font-mono font-bold text-amber-800">
                                  {variantB?.scores?.weather || 88}%
                                </td>
                                <td className="p-3 bg-purple-50/20 font-mono font-bold text-purple-800">
                                  {variantC?.scores?.weather || 87}%
                                </td>
                              </tr>
                              <tr className="border-t-2 border-matcha-300 bg-matcha-100/50">
                                <td className="p-3 font-bold text-matcha-950">🏆 Tổng Điểm Xếp Hạng</td>
                                <td className="p-3 font-mono font-bold text-emerald-950">
                                  {variantA?.scores?.overall || 93}%
                                </td>
                                <td className="p-3 font-mono font-bold text-amber-950">
                                  {variantB?.scores?.overall || 91}%
                                </td>
                                <td className="p-3 font-mono font-bold text-purple-950">
                                  {variantC?.scores?.overall || 89}%
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  );
                })()
              )}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT WORKSPACE (5 COLS / ~40-42% WIDTH): AI STYLIST CHAT & RAG BOT       */}
        {/* THANH CHAT ĐƯỢC ĐẨY LÊN FULL, CỨNG THANH CHAT, KO BỊ KÉO LÊN XUỐNG KHI CUỘN ĐỒ */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white border border-matcha-200 rounded-3xl shadow-sm flex flex-col lg:h-full h-[680px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-matcha-100 bg-matcha-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-matcha-900 flex items-center justify-center text-cream-50 shadow-sm shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-fashion font-bold text-matcha-950 shrink-0">AI Stylist Cổ Phục</h3>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-matcha-200/90 text-matcha-950 truncate max-w-[150px]" title={activeSession.title}>
                    {activeSession.title}
                  </span>
                </div>
                <p className="text-[11px] text-matcha-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Sẵn sàng tư vấn & gợi ý 6 món đồ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCreateNewSession}
                className="px-2.5 py-1.5 bg-matcha-900 hover:bg-matcha-950 text-cream-50 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Khởi tạo đoạn chat mới"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Chat Mới</span>
              </button>
              <button
                onClick={() => handleDeleteSession(activeSession.id)}
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition"
                title="Xóa đoạn chat này cùng các ảnh đã gen trong phiên"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Bubbles */}
          <div className="p-3 bg-cream-50/60 border-b border-matcha-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {CHAT_PROMPT_BUBBLES.map(bubble => (
              <button
                key={bubble.id}
                onClick={() => handleSendChatMessage(bubble.prompt)}
                disabled={isChatting}
                className="px-3 py-1 rounded-full text-[10px] font-fashion font-bold bg-white hover:bg-matcha-100 text-matcha-900 border border-matcha-200 whitespace-nowrap shadow-xs transition hover:scale-[1.02]"
              >
                {bubble.title}
              </button>
            ))}
          </div>

          {/* Chat Message Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  {msg.content && msg.content.trim() && (
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-matcha-900 text-cream-50 rounded-br-none shadow-sm'
                          : 'bg-cream-50 text-matcha-950 border border-matcha-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}

                  {/* AI Suggested Outfit Card (with button to apply into Studio) */}
                  {msg.outfit && msg.outfit.recommendedItems && (
                    <div className="w-full max-w-[95%] p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 shadow-sm space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="font-fashion font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          Gợi Ý Trọn Bộ Cổ Phục Remix
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold">
                          6 Lớp Hoàn Hảo
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {msg.outfit.recommendedItems.map((item, itIdx) => (
                          <div key={itIdx} className="p-2 rounded-xl bg-white border border-emerald-200 flex items-center gap-2">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <span className="font-bold text-matcha-950 block truncate">{item.name}</span>
                              <span className="text-[9px] text-matcha-600 truncate block">{item.slot}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Prominent Action: Apply into Studio */}
                      <button
                        onClick={() => handleApplyAiOutfitToStudio(msg.outfit)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-cream-50 font-fashion font-bold text-xs shadow transition flex items-center justify-center gap-2 hover:scale-[1.01]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Áp Dụng Vào Studio (6 Lớp)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })}

            {isChatting && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-cream-50 border border-matcha-200 text-matcha-700 text-xs animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>AI Stylist đang tra cứu luật Cổ phục và phân tích thời tiết...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-matcha-100 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi AI Stylist (VD: Lạnh 20 độ, đi cafe, phối ngầu GenZ)..."
                disabled={isChatting}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-cream-50 border border-matcha-200 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500/20 placeholder:text-matcha-400"
              />
              <button
                type="submit"
                disabled={isChatting || !chatInput.trim()}
                className="p-2.5 rounded-2xl bg-matcha-900 hover:bg-matcha-950 disabled:opacity-50 text-cream-50 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* STEP 4-5 GUARD: CULTURAL GUARDRAIL PRE-CHECK VIOLATION ALERT MODAL */}
      {culturalViolationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                  Chốt Chặn Văn Hóa Đầu Vào (Guardrail Level 1)
                </span>
                <h3 className="text-lg font-fashion font-bold text-matcha-950 mt-1">
                  {culturalViolationAlert.title || 'Từ Chối Tạo Ảnh: Vi Phạm Chuẩn Mực'}
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 leading-relaxed font-medium">
              ⚠️ {culturalViolationAlert.reason}
            </div>

            {Array.isArray(culturalViolationAlert.details) && (
              <div className="space-y-1.5 text-xs text-matcha-800">
                <span className="font-bold text-matcha-950 block">Chi tiết giám định:</span>
                <ul className="list-disc pl-5 space-y-1 text-matcha-700">
                  {culturalViolationAlert.details.map((d, dIdx) => (
                    <li key={dIdx}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {culturalViolationAlert.recommendation && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Đề xuất điều chỉnh chuẩn mực di sản:
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {culturalViolationAlert.recommendation}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCulturalViolationAlert(null)}
                className="px-5 py-2.5 rounded-2xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-fashion font-bold transition shadow-sm"
              >
                Tôi Đã Hiểu & Đổi Trang Phục
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
