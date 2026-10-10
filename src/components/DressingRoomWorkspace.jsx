import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, Upload, Search, Globe, Plus, Trash2, Check, CheckCircle2,
  Crown, Gem, Shirt, Layers, Footprints, RefreshCw, User, Eye,
  ArrowRight, Filter, AlertCircle, Bot, SlidersHorizontal, Image as ImageIcon,
  Undo2, Redo2, Download, ShieldCheck, ShieldAlert, X, Wand2, Compass,
  Palette, ChevronDown, Send, CloudSun, Snowflake, Calendar
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { MULTI_SLOT_CATALOG } from '../constants/slotCatalog';
import defaultManImg from '../human model/man 1.jpg';
import defaultWomanImg from '../human model/woman 1.jpg';

// Storage keys
const DRESSING_LAYERS_KEY = 'vietphuc_dressing_selected_layers_v1';
const DRESSING_CUSTOM_ITEMS_KEY = 'vietphuc_custom_costumes_v1';
const DRESSING_COLORS_KEY = 'vietphuc_dressing_selected_colors_v1';
const DRESSING_SESSIONS_STORAGE_KEY = 'vietphuc_dressing_chat_sessions_v1';

// Prompt suggestion bubbles for AI Stylist Chatbot (100% matching Remix Room)
export const CHAT_PROMPT_BUBBLES = [
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

// Phím tắt nhanh: Thời tiết
export const WEATHER_SHORTCUTS = [
  { id: 'cold', label: '❄️ Lạnh rét (< 20°C)', text: 'thời tiết lạnh mùa đông dưới 20 độ' },
  { id: 'autumn', label: '🍂 Se lạnh Thu (20°-25°C)', text: 'thời tiết se lạnh mùa thu khoảng 20-25 độ' },
  { id: 'spring', label: '☀️ Nắng ấm Xuân (25°-28°C)', text: 'thời tiết mùa xuân nắng ấm dịu mát' },
  { id: 'hot', label: '🌤️ Nắng nóng Hè (> 30°C)', text: 'thời tiết mùa hè nóng bức trên 30 độ' },
  { id: 'rain', label: '🌧️ Mưa phùn / Dịu mát', text: 'trời mưa phùn dịu mát' }
];

// Phím tắt nhanh: Sự kiện / Hoàn cảnh
export const OCCASION_SHORTCUTS = [
  { id: 'tet', label: '🌸 Du xuân / Chúc Tết', text: 'đi du xuân chúc Tết Nguyên Đán' },
  { id: 'temple', label: '⛩️ Lễ hội / Viếng chùa', text: 'đi dự lễ hội truyền thống, viếng đền chùa thanh tịnh' },
  { id: 'cafe', label: '☕ Cafe / Dạo phố', text: 'đi cà phê dạo phố cuối tuần cùng bạn bè' },
  { id: 'photo', label: '📸 Chụp ảnh Lookbook', text: 'chụp bộ ảnh nghệ thuật lookbook' },
  { id: 'wedding', label: '💍 Tiệc cưới / Trọng thể', text: 'dự tiệc cưới, sự kiện trang trọng' },
  { id: 'school', label: '🎓 Đi học / Thuyết trình', text: 'đi học, thuyết trình văn hóa lịch sử' }
];

export const createDefaultDressingSession = (title = null) => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  title: title || 'Tư Vấn Phong Cách Cổ Phục Mới',
  createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  messages: [
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là **AI Stylist Cổ Phục**. Hãy chia sẻ hoàn cảnh (VD: *"Lạnh 20 độ, đi cafe, phối ngầu GenZ"*), vóc dáng hay phong cách bạn yêu thích. Tôi sẽ tra cứu luật di sản và gợi ý trọn bộ 6 món đồ để bạn áp dụng trực tiếp vào phòng thay đồ!',
      outfit: null,
      candidateSlots: null
    }
  ]
});

export const loadInitialDressingSessions = () => {
  try {
    const raw = localStorage.getItem(DRESSING_SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Cannot parse saved dressing chat sessions:', e);
  }
  return [createDefaultDressingSession()];
};

// Empty accessory definition
export const EMPTY_ACCESSORY = {
  id: 'acc-none',
  name: 'Để trống (Không mang)',
  category: 'Tối Giản',
  badge: 'Trống',
  url: null,
  imageUrl: null,
  promptPart: 'without accessories'
};

// Bảng màu Di sản & Thời trang Việt truyền thống
export const HERITAGE_COLOR_PALETTE = [
  { id: 'default', name: 'Mặc định', hex: '#6B7280', prompt: 'original authentic fabric color' },
  { id: 'red', name: 'Đỏ Gấm', hex: '#A81C1E', prompt: 'imperial crimson red silk (Đỏ Gấm Hoàng Triều)' },
  { id: 'gold', name: 'Vàng Kim', hex: '#D4AF37', prompt: 'imperial royal gold yellow brocade (Vàng Kim Cung Đình)' },
  { id: 'indigo', name: 'Xanh Chàm', hex: '#1E3A5F', prompt: 'traditional indigo navy blue silk (Xanh Lam Chàm Cổ)' },
  { id: 'white', name: 'Sa Bạch', hex: '#F8F9FA', border: true, prompt: 'pure pristine ivory white silk (Trắng Sa Bạch Tuyết)' },
  { id: 'black', name: 'Huyền Sa', hex: '#18181B', prompt: 'deep lustrous obsidian black silk (Đen Tuyền Huyền Sa)' },
  { id: 'emerald', name: 'Thanh Lục', hex: '#15653D', prompt: 'luxurious jade emerald green silk (Xanh Thanh Lục Ngọc)' },
  { id: 'purple', name: 'Tím Huế', hex: '#6A2A60', prompt: 'regal Hue royal purple silk (Tím Huế Cung Đình)' },
  { id: 'pink', name: 'Hồng Đào', hex: '#CE5A73', prompt: 'delicate lotus blossom pink silk (Hồng Cánh Sen Đào)' },
  { id: 'brown', name: 'Nâu Sồng', hex: '#5E3A24', prompt: 'rustic Vietnamese brown silk (Nâu Sồng Trầm Tĩnh)' },
];

// 6 Categories configuration matching user's requested order
export const CATEGORY_DEFINITIONS = [
  { key: 'headwear', label: 'Mũ', fullLabel: 'Mũ / Khăn Đóng', icon: Crown, orderIndex: 1, position: 'left-top' },
  { key: 'accessories', label: 'Phụ kiện', fullLabel: 'Phụ Kiện / Trang Sức', icon: Gem, orderIndex: 2, position: 'right-top' },
  { key: 'innerwear', label: 'Áo trong', fullLabel: 'Áo Mặc Trong / Lót', icon: Layers, orderIndex: 3, position: 'left-mid' },
  { key: 'tops', label: 'Áo ngoài', fullLabel: 'Áo Ngoài / Cổ Phục', icon: Shirt, orderIndex: 4, position: 'right-mid' },
  { key: 'bottoms', label: 'Quần', fullLabel: 'Quần / Xiêm Lụa', icon: Layers, orderIndex: 5, position: 'left-bot' },
  { key: 'footwear', label: 'Giày', fullLabel: 'Giày / Hài / Guốc', icon: Footprints, orderIndex: 6, position: 'right-bot' }
];

export default function DressingRoomWorkspace({ onSwitchToStylist, initialLayers }) {
  // --- 1. MODEL STATE (Panel Remix) ---
  const [modelGender, setModelGender] = useState('man'); // 'man' | 'woman' | 'custom'
  const [humanImage, setHumanImage] = useState(defaultManImg);
  const [customModelPreview, setCustomModelPreview] = useState(null);
  const fileInputModelRef = useRef(null);

  // --- 2. SELECTED LAYERS (6 SLOTS) ---
  // Default for accessories is EMPTY_ACCESSORY ("Để trống")
  const [selectedLayers, setSelectedLayers] = useState(() => {
    try {
      const saved = localStorage.getItem(DRESSING_LAYERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            headwear: parsed.headwear || MULTI_SLOT_CATALOG.headwear[0],
            accessories: (parsed.accessories && parsed.accessories.id !== 'acc-none') ? parsed.accessories : EMPTY_ACCESSORY,
            innerwear: parsed.innerwear || MULTI_SLOT_CATALOG.innerwear[0],
            tops: parsed.tops || MULTI_SLOT_CATALOG.tops[0],
            bottoms: parsed.bottoms || MULTI_SLOT_CATALOG.bottoms[0],
            footwear: parsed.footwear || MULTI_SLOT_CATALOG.footwear[0],
          };
        }
      }
    } catch (e) {
      console.warn('Cannot load initial dressing layers:', e);
    }
    return {
      headwear: MULTI_SLOT_CATALOG.headwear[0],
      accessories: EMPTY_ACCESSORY,
      innerwear: MULTI_SLOT_CATALOG.innerwear[0],
      tops: MULTI_SLOT_CATALOG.tops[0],
      bottoms: MULTI_SLOT_CATALOG.bottoms[0],
      footwear: MULTI_SLOT_CATALOG.footwear[0],
    };
  });

  // --- 3. UNDO & REDO STACKS ---
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Sync selected layers to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(DRESSING_LAYERS_KEY, JSON.stringify(selectedLayers));
    } catch (e) {
      console.warn('Cannot save dressing layers:', e);
    }
  }, [selectedLayers]);

  // Synchronize when initialLayers is passed (e.g. from Lookbook "Phối lại")
  useEffect(() => {
    if (initialLayers && typeof initialLayers === 'object') {
      setSelectedLayers(prev => ({
        ...prev,
        ...initialLayers
      }));
    }
  }, [initialLayers]);

  // --- 2.5 SELECTED LAYER COLORS (6 SLOTS) ---
  const [layerColors, setLayerColors] = useState(() => {
    try {
      const saved = localStorage.getItem(DRESSING_COLORS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Cannot load initial dressing colors:', e);
    }
    return {
      headwear: null,
      accessories: null,
      innerwear: null,
      tops: null,
      bottoms: null,
      footwear: null,
    };
  });

  // Sync selected colors to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRESSING_COLORS_KEY, JSON.stringify(layerColors));
    } catch (e) {
      console.warn('Cannot save dressing colors:', e);
    }
  }, [layerColors]);

  // Handler to set or clear slot color
  const handleSelectColor = (slotKey, colorObj) => {
    setLayerColors(prev => ({
      ...prev,
      [slotKey]: (colorObj && colorObj.id !== 'default') ? colorObj : null
    }));
  };

  // Undo Handler
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, selectedLayers]);
    setSelectedLayers(previous);
  };

  // Redo Handler
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, selectedLayers]);
    setSelectedLayers(next);
  };

  // Helper to update layer with history tracking
  const updateLayerWithHistory = (slotKey, newItem) => {
    setUndoStack(prev => [...prev, selectedLayers]);
    setRedoStack([]);
    setSelectedLayers(prev => ({
      ...prev,
      [slotKey]: newItem
    }));
  };

  // --- 3.5 RIGHT PANEL TAB: 'costumes' vs 'stylist' ---
  const [rightPanelTab, setRightPanelTab] = useState('costumes');

  // --- 3.6 CHATBOT STATE (Replicated 100% from Remix Room) ---
  const [chatSessions, setChatSessions] = useState(loadInitialDressingSessions);
  const [activeSessionId, setActiveSessionId] = useState(() => chatSessions[0]?.id);
  const [chatInput, setChatInput] = useState('');
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [isChatting, setIsChatting] = useState(false);
  const chatBottomRef = useRef(null);

  // Sync chat sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRESSING_SESSIONS_STORAGE_KEY, JSON.stringify(chatSessions));
    } catch (e) {
      console.warn('Cannot persist dressing chat sessions:', e);
    }
  }, [chatSessions]);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || chatSessions[0] || createDefaultDressingSession();
  const messages = activeSession?.messages || [];

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (rightPanelTab === 'stylist') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatting, rightPanelTab]);

  // Create new chat session
  const handleCreateNewSession = () => {
    const newSess = createDefaultDressingSession();
    setChatSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  // Delete current session
  const handleDeleteSession = (targetSessionId) => {
    const target = chatSessions.find(s => s.id === targetSessionId);
    if (!target) return;
    const targetTitle = target.title || 'phiên chat này';
    if (!window.confirm(`Bạn có chắc muốn xóa "${targetTitle}" cùng toàn bộ lịch sử tư vấn?`)) return;

    setChatSessions(prev => {
      const remaining = prev.filter(s => s.id !== targetSessionId);
      if (remaining.length === 0) {
        const fresh = createDefaultDressingSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      setActiveSessionId(remaining[0].id);
      return remaining;
    });
  };

  // Send message to AI Stylist (Calls /api/chat-remix with full RAG knowledge base & outfit recommendation)
  const handleSendChatMessage = async (presetText = null) => {
    let textToSend = presetText;
    if (!textToSend) {
      const parts = [];
      if (selectedWeather) {
        const w = WEATHER_SHORTCUTS.find(item => item.id === selectedWeather);
        if (w) parts.push(`Thời tiết: ${w.text}`);
      }
      if (selectedOccasion) {
        const o = OCCASION_SHORTCUTS.find(item => item.id === selectedOccasion);
        if (o) parts.push(`Sự kiện / Mục đích: ${o.text}`);
      }
      if (chatInput.trim()) {
        parts.push(chatInput.trim());
      } else if (parts.length > 0) {
        parts.push('Hãy tư vấn và phối cho tôi 1 set Cổ phục 6 lớp đẹp và phù hợp nhất');
      }
      textToSend = parts.join(', ');
    }

    if (!textToSend || !textToSend.trim() || isChatting) return;

    const userMsg = { role: 'user', content: textToSend };
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

    if (!presetText) {
      setChatInput('');
      setSelectedWeather(null);
      setSelectedOccasion(null);
    }
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
          content: data.message || data.text,
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

  // Toast / notification for applying outfit
  const [toastMsg, setToastMsg] = useState(null);
  const showDressingToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Apply AI Outfit to Dressing Room (6 Slots)
  const handleApplyAiOutfitToDressing = (outfit) => {
    if (!outfit || !outfit.recommendedItems) return;

    // Save previous state to undo stack
    setUndoStack(prev => [...prev, selectedLayers]);
    setRedoStack([]);

    const innerwearItem = outfit.recommendedItems.find(i => i.slot === 'innerwear');
    const topItem = outfit.recommendedItems.find(i => i.slot === 'top' || i.slot === 'tops');
    const bottomItem = outfit.recommendedItems.find(i => i.slot === 'bottom' || i.slot === 'bottoms');
    const headwearItem = outfit.recommendedItems.find(i => i.slot === 'headwear');
    const accessoryItem = outfit.recommendedItems.find(i => i.slot === 'accessory' || i.slot === 'accessories');
    const footwearItem = outfit.recommendedItems.find(i => i.slot === 'footwear');

    setSelectedLayers(prev => {
      const next = { ...prev };
      if (headwearItem) {
        next.headwear = {
          id: `ai-head-${Date.now()}`,
          name: headwearItem.name,
          category: 'AI Gợi Ý',
          badge: '👑 Stylist AI',
          url: headwearItem.imageUrl || '/api/dataset/03_khan_van_non_mu/VP_021_khan_van_nhung_den.jpg',
          promptPart: `${headwearItem.name} ${headwearItem.reason || ''}`
        };
      }
      if (accessoryItem) {
        next.accessories = {
          id: `ai-acc-${Date.now()}`,
          name: accessoryItem.name,
          category: 'AI Gợi Ý',
          badge: '✨ Stylist AI',
          url: accessoryItem.imageUrl || '/api/dataset/04_phu_kien/VP_031_kieng_bac.jpg',
          promptPart: `${accessoryItem.name} ${accessoryItem.reason || ''}`
        };
      }
      if (innerwearItem) {
        next.innerwear = {
          id: `ai-inner-${Date.now()}`,
          name: innerwearItem.name,
          category: 'AI Gợi Ý',
          badge: '🌿 Lớp Trong',
          url: innerwearItem.imageUrl || '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
          promptPart: `${innerwearItem.name} ${innerwearItem.reason || ''}`
        };
      }
      if (topItem) {
        next.tops = {
          id: `ai-top-${Date.now()}`,
          name: topItem.name,
          category: 'AI Gợi Ý',
          badge: '👑 Áo Chính',
          url: topItem.imageUrl || '/api/clothes/viet_phuc_sample.jpg',
          promptPart: `${topItem.name} ${topItem.reason || ''}`
        };
      }
      if (bottomItem) {
        next.bottoms = {
          id: `ai-bot-${Date.now()}`,
          name: bottomItem.name,
          category: 'AI Gợi Ý',
          badge: '✨ Quần / Xiêm',
          url: bottomItem.imageUrl || '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
          promptPart: `${bottomItem.name} ${bottomItem.reason || ''}`
        };
      }
      if (footwearItem) {
        next.footwear = {
          id: `ai-foot-${Date.now()}`,
          name: footwearItem.name,
          category: 'AI Gợi Ý',
          badge: '✨ Giày / Hài',
          url: footwearItem.imageUrl || '/api/clothes/viet_phuc_sample.jpg',
          promptPart: `${footwearItem.name} ${footwearItem.reason || ''}`
        };
      }
      return next;
    });

    showDressingToast('✨ Đã áp dụng trọn bộ 6 món đồ từ Stylist AI vào nhân vật!');
  };

  // --- 4. ACTIVE CATEGORY (Panel Costumes) ---
  const [activeCategoryKey, setActiveCategoryKey] = useState('headwear');

  // --- 5. SEARCH & GOOGLE CLIP AGENT STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleResultsBySlot, setGoogleResultsBySlot] = useState({});

  // --- 6. CUSTOM UPLOADED COSTUMES STATE ---
  const [customCostumes, setCustomCostumes] = useState(() => {
    try {
      const saved = localStorage.getItem(DRESSING_CUSTOM_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Cannot load custom costumes:', e);
    }
    return [];
  });

  const fileInputGarmentRef = useRef(null);
  const [customItemName, setCustomItemName] = useState('');
  const [isUploadingGarment, setIsUploadingGarment] = useState(false);

  // --- 7. AI IMAGE GENERATION (VIRTUAL TRY-ON ENGINE) STATE ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genError, setGenError] = useState(null);
  const [culturalAlert, setCulturalAlert] = useState(null);

  // Save custom costumes to localStorage
  const saveCustomCostumes = (items) => {
    setCustomCostumes(items);
    try {
      localStorage.setItem(DRESSING_CUSTOM_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cannot persist custom costumes:', e);
    }
  };

  // Switch Model Gender or Custom
  const handleSelectModel = (gender) => {
    setModelGender(gender);
    if (gender === 'man') {
      setHumanImage(defaultManImg);
    } else if (gender === 'woman') {
      setHumanImage(defaultWomanImg);
    } else if (gender === 'custom' && customModelPreview) {
      setHumanImage(customModelPreview);
    }
  };

  // Handle Custom Model Image Upload
  const handleModelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setCustomModelPreview(result);
      setHumanImage(result);
      setModelGender('custom');
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom Garment Upload
  const handleGarmentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGarment(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const finalName = customItemName.trim() || cleanFileName || 'Món Đồ Tự Tải Lên';

      const newItem = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: finalName,
        category: 'Đồ Tự Tải Lên (Cục Bộ)',
        badge: '✨ Tự Tải Lên',
        url: dataUri,
        imageUrl: dataUri,
        slot: activeCategoryKey,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      const updated = [newItem, ...customCostumes];
      saveCustomCostumes(updated);

      // Select this item with history tracking
      updateLayerWithHistory(activeCategoryKey, newItem);

      setCustomItemName('');
      setIsUploadingGarment(false);
      if (fileInputGarmentRef.current) fileInputGarmentRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Remove a custom garment
  const handleDeleteCustomGarment = (id, e) => {
    e.stopPropagation();
    const updated = customCostumes.filter(i => i.id !== id);
    saveCustomCostumes(updated);

    // If currently selected, fallback to catalog default
    if (selectedLayers[activeCategoryKey]?.id === id) {
      const defaultItem = activeCategoryKey === 'accessories' 
        ? EMPTY_ACCESSORY 
        : (MULTI_SLOT_CATALOG[activeCategoryKey]?.[0] || null);
      updateLayerWithHistory(activeCategoryKey, defaultItem);
    }
  };

  // Reference to abort existing stream if user re-searches
  const streamAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamAbortRef.current) {
        streamAbortRef.current.close();
      }
    };
  }, []);

  // Handle Search on Google with Progressive Real-Time Streaming
  const handleSearchGoogleClip = async () => {
    const activeCat = CATEGORY_DEFINITIONS.find(c => c.key === activeCategoryKey);
    const query = searchQuery.trim() || activeCat?.label || 'Cổ Phục Việt Nam';

    // Abort existing stream if active
    if (streamAbortRef.current) {
      streamAbortRef.current.close();
      streamAbortRef.current = null;
    }

    // Reset this slot's results immediately so user sees newly found images stream in one by one in real-time
    setGoogleResultsBySlot(prev => ({
      ...prev,
      [activeCategoryKey]: []
    }));
    setIsSearchingGoogle(true);

    try {
      // Connect to SSE stream
      const streamUrl = `/api/costumes/search-stream?query=${encodeURIComponent(query)}&slot=${encodeURIComponent(activeCategoryKey)}&limit=8`;
      const es = new EventSource(streamUrl);
      streamAbortRef.current = es;

      es.addEventListener('candidate', (event) => {
        try {
          const candidate = JSON.parse(event.data);
          if (candidate && (candidate.url || candidate.imageUrl)) {
            setGoogleResultsBySlot(prev => {
              const currentList = prev[activeCategoryKey] || [];
              if (currentList.some(item => item.id === candidate.id || item.url === candidate.url)) {
                return prev;
              }
              return {
                ...prev,
                [activeCategoryKey]: [...currentList, candidate]
              };
            });
          }
        } catch (e) {
          console.warn('[Stream Parse Error]:', e);
        }
      });

      es.addEventListener('done', () => {
        setIsSearchingGoogle(false);
        if (streamAbortRef.current === es) {
          es.close();
          streamAbortRef.current = null;
        }
      });

      es.addEventListener('error', async () => {
        // Fallback to fast POST /api/costumes/search-google if SSE is interrupted or unsupported
        es.close();
        if (streamAbortRef.current === es) {
          streamAbortRef.current = null;
        }

        try {
          const res = await fetch('/api/costumes/search-google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              slot: activeCategoryKey,
              limit: 8
            })
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setGoogleResultsBySlot(prev => ({
              ...prev,
              [activeCategoryKey]: data.data
            }));
          }
        } catch (e) {
          console.warn('[Fallback Search Error]:', e);
        } finally {
          setIsSearchingGoogle(false);
        }
      });
    } catch (err) {
      console.warn('Lỗi kết nối stream search:', err.message);
      setIsSearchingGoogle(false);
    }
  };

  // Available items in the active category: Catalog + Custom Uploaded + Google Search Results
  // For accessories, ensure EMPTY_ACCESSORY ("Để trống") is always the first item!
  const currentCategoryCatalog = useMemo(() => {
    let rawCatalog = MULTI_SLOT_CATALOG[activeCategoryKey] || [];
    const rawCustom = customCostumes.filter(item => item.slot === activeCategoryKey);
    const rawGoogle = googleResultsBySlot[activeCategoryKey] || [];

    if (activeCategoryKey === 'accessories') {
      rawCatalog = [EMPTY_ACCESSORY, ...rawCatalog.filter(i => i.id !== 'acc-none')];
    }

    // Filter catalog & custom by search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const filteredCatalog = rawCatalog.filter(item => {
        const name = (item.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const cat = (item.category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const badge = (item.badge || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q) || cat.includes(q) || badge.includes(q);
      });
      const filteredCustom = rawCustom.filter(item => {
        const name = (item.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q);
      });
      // Always place rawGoogle items at the very top so user sees all ~8 Google search results directly
      return [...rawGoogle, ...filteredCustom, ...filteredCatalog];
    }

    if (activeCategoryKey === 'accessories') {
      const otherCatalog = rawCatalog.filter(i => i.id !== 'acc-none');
      return [EMPTY_ACCESSORY, ...rawGoogle, ...rawCustom, ...otherCatalog];
    }

    return [...rawGoogle, ...rawCustom, ...rawCatalog];
  }, [activeCategoryKey, customCostumes, googleResultsBySlot, searchQuery]);

  // Handle selecting an item
  const handleSelectItem = (item) => {
    updateLayerWithHistory(activeCategoryKey, item);
  };

  // Helper to get selected item for a category
  const getItemForSlot = (slotKey) => selectedLayers[slotKey] || null;

  // =========================================================================
  // PHƯƠNG PHÁP GEN ẢNH AI CHÍNH XÁC:
  // - Khi gen xong: ĐỔI NGAY ẢNH NGƯỜI MẪU HIỆN TẠI THÀNH ẢNH ĐÃ GEN
  // - KHÔNG hiện popup, KHÔNG chấm điểm, KHÔNG nhận xét
  // - Lưu ngầm vào Lookbook trong nền
  // =========================================================================
  const handleGenerateOutfitAI = async () => {
    setIsGenerating(true);
    setGenError(null);
    setCulturalAlert(null);
    setGenStep(1);

    // Tạo cấu trúc layer bao gồm thông số màu sắc tùy biến được chọn
    const buildLayerWithColor = (slotKey) => {
      const item = selectedLayers[slotKey];
      if (!item || item.id === 'acc-none') return null;
      const color = layerColors[slotKey];
      return {
        ...item,
        color: color ? { name: color.name, prompt: color.prompt, hex: color.hex } : null
      };
    };

    const payloadLayers = {
      innerwear: buildLayerWithColor('innerwear'),
      top: buildLayerWithColor('tops'),
      bottom: buildLayerWithColor('bottoms'),
      headwear: buildLayerWithColor('headwear'),
      footwear: buildLayerWithColor('footwear'),
      accessories: (selectedLayers.accessories && selectedLayers.accessories.id !== 'acc-none') 
        ? [buildLayerWithColor('accessories')] 
        : [],
      accessory: buildLayerWithColor('accessories')
    };

    const formatNameWithColor = (slotKey) => {
      const item = selectedLayers[slotKey];
      if (!item || item.id === 'acc-none') return null;
      const color = layerColors[slotKey];
      return color ? `${item.name} (Màu: ${color.name})` : item.name;
    };

    const garmentTitle = [
      formatNameWithColor('innerwear'),
      formatNameWithColor('tops'),
      formatNameWithColor('bottoms'),
      formatNameWithColor('headwear'),
      formatNameWithColor('footwear'),
      formatNameWithColor('accessories')
    ].filter(Boolean).join(' + ') || 'Bộ Cổ Phục Di Sản';

    // BƯỚC 0: PRE-CHECK CULTURAL GUARDRAIL (CHỐT CHẶN VĂN HÓA ĐẦU VÀO)
    try {
      const precheckRes = await fetch('/api/precheck-guardrail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedItems: payloadLayers,
          userPrompt: 'Phối trang phục Cổ phục Việt Nam di sản trang trọng, đúng chuẩn phong tục',
          humanImage: humanImage,
          context: {
            occasion: 'Dạo phố / Trải nghiệm văn hóa di sản truyền thống',
            styleVibe: 'Haute Couture Editorial, Authentic Royal Court'
          }
        })
      });
      const precheckData = await precheckRes.json();
      if (precheckData && (precheckData.allowed === false || precheckData.status === 'REJECTED')) {
        setCulturalAlert(precheckData);
        setIsGenerating(false);
        setGenStep(0);
        return; // Dừng ngay nếu vi phạm kiêng kỵ văn hóa
      }
    } catch (preErr) {
      console.warn('Precheck guardrail bypass warning:', preErr.message);
    }

    setGenStep(2);

    try {
      // BƯỚC 1: IMAGE-TO-IMAGE VIRTUAL TRY-ON GENERATION
      const res = await fetch('/api/img2img/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: humanImage,
          garmentImage: selectedLayers.tops?.url || selectedLayers.innerwear?.url || '/api/clothes/viet_phuc_sample.jpg',
          prompt: '',
          garmentName: garmentTitle,
          layers: payloadLayers,
          styleTags: ['Haute Couture Editorial', 'Authentic Royal Court', 'Hasselblad 8k', 'Tôn Trọng Di Sản'],
          userPrompt: 'Harmoniously dress the standing model in this cohesive Vietnamese heritage outfit with photorealistic fabric texture',
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

      if (!data.success) {
        throw new Error(data.message || data.error || 'Lỗi khi kết xuất ảnh từ máy chủ AI');
      }

      // THAY ĐỔI ẢNH NGƯỜI MẪU HIỆN TẠI THÀNH ẢNH ĐÃ GEN AI (KHÔNG HIỆN POPUP)
      setHumanImage(data.resultUrl);
      setModelGender('custom');

      // TỰ ĐỘNG LƯU NGẦM VÀO LOOKBOOK TRONG NỀN
      fetch('/api/lookbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.resultUrl,
          title: `${selectedLayers.tops?.name || 'Việt Phục'} & ${selectedLayers.bottoms?.name || 'Lụa'}`,
          prompt: data.optimizedPrompt || garmentTitle,
          layers: selectedLayers,
          executionTime: data.executionTime,
          modelUsed: data.modelUsed || 'veo/gemini-3.0-pro-image'
        })
      }).catch(err => console.warn('Silent lookbook save notice:', err));

    } catch (err) {
      setGenError(err.message || 'Lỗi mạng khi kết nối máy chủ AI');
    } finally {
      setIsGenerating(false);
      setGenStep(0);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 pb-10">

      {/* ========================================================================= */}
      {/* PANEL TRÁI: REMIX (52-53% CHIỀU NGANG - RỘNG VÀ THOÁNG HƠN)               */}
      {/* ========================================================================= */}
      <section className="w-full lg:w-[52%] xl:w-[53%] flex flex-col space-y-3.5 origin-top transform scale-[0.95] -mb-8 lg:-mb-12">

        {/* Panel Header & Model Controller */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-matcha-200/90 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-matcha-100 border border-matcha-300 text-matcha-800 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Remix Studio • Dressing Panel</span>
            </div>
            <h2 className="font-fashion text-2xl font-bold text-matcha-950">
              Phòng Thử Đồ Trực Quan
            </h2>
            <p className="text-xs text-matcha-700/80">
              Nhân vật đứng trung tâm và 6 khối phục trang xanh đậm tương tác xung quanh
            </p>
          </div>

          {/* Model Switcher Buttons */}
          <div className="flex items-center gap-2 bg-[#f4f5f0] p-1.5 rounded-full border border-matcha-200 shadow-inner">
            <button
              onClick={() => handleSelectModel('man')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                modelGender === 'man'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-white/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mẫu Nam</span>
            </button>

            <button
              onClick={() => handleSelectModel('woman')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                modelGender === 'woman'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-white/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-rose-300" />
              <span>Mẫu Nữ</span>
            </button>

            <label
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                modelGender === 'custom'
                  ? 'bg-matcha-900 text-cream-50 shadow-sm'
                  : 'text-matcha-800 hover:text-matcha-950 hover:bg-white/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Bạn</span>
              <input 
                ref={fileInputModelRef}
                type="file" 
                accept="image/*" 
                onChange={handleModelUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KHÔNG GIAN REMIX: 3 CỘT CÂN ĐỐI - KHÔNG ĐÈ LẪN NHAU                     */}
        {/* Cột trái (3 khối xanh) - Cột giữa (Người mẫu đứng) - Cột phải (3 khối)    */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-b from-[#f9faf7] to-[#f1f3ec] rounded-3xl border border-matcha-200/90 shadow-lg p-4 sm:p-5 min-h-[640px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Studio Backdrop Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#c6d1bb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Error Banner if any */}
          {genError && (
            <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between z-20">
              <span className="font-semibold">⚠️ {genError}</span>
              <button onClick={() => setGenError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer">✕</button>
            </div>
          )}

          {/* 3-COLUMN BALANCED FLEX CONTAINER */}
          <div className="flex flex-col xl:flex-row items-center justify-between gap-3 lg:gap-4 relative z-10 w-full flex-1 my-auto">

            {/* --- CỘT TRÁI (3 KHỐI GỌN CAO XANH ĐẬM): MŨ (TRÊN), ÁO TRONG (GIỮA), QUẦN (DƯỚI) --- */}
            <div className="w-full xl:w-[195px] 2xl:w-[215px] xl:max-w-[225px] flex flex-col justify-between gap-3 sm:gap-4 h-[525px] sm:h-[550px] 2xl:h-[570px] shrink-0">
              
              {/* 1. KHỐI TRÁI TRÊN: MŨ (HEADWEAR) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[0]} // Mũ
                item={getItemForSlot('headwear')}
                isActiveCategory={activeCategoryKey === 'headwear'}
                onSelectSlot={() => setActiveCategoryKey('headwear')}
                onClear={() => updateLayerWithHistory('headwear', null)}
                selectedColor={layerColors.headwear}
                onSelectColor={(color) => handleSelectColor('headwear', color)}
              />

              {/* 2. KHỐI TRÁI GIỮA: ÁO TRONG (INNERWEAR) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[2]} // Áo trong
                item={getItemForSlot('innerwear')}
                isActiveCategory={activeCategoryKey === 'innerwear'}
                onSelectSlot={() => setActiveCategoryKey('innerwear')}
                onClear={() => updateLayerWithHistory('innerwear', null)}
                selectedColor={layerColors.innerwear}
                onSelectColor={(color) => handleSelectColor('innerwear', color)}
              />

              {/* 3. KHỐI TRÁI DƯỚI: QUẦN (BOTTOMS) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[4]} // Quần
                item={getItemForSlot('bottoms')}
                isActiveCategory={activeCategoryKey === 'bottoms'}
                onSelectSlot={() => setActiveCategoryKey('bottoms')}
                onClear={() => updateLayerWithHistory('bottoms', null)}
                selectedColor={layerColors.bottoms}
                onSelectColor={(color) => handleSelectColor('bottoms', color)}
              />

            </div>

            {/* --- CỘT GIỮA (NHÂN VẬT ĐỨNG CHÍNH GIỮA) --- */}
            <div className="flex items-center justify-center relative my-2 xl:my-0 px-1 shrink-0">
              
              {/* Central Model Frame */}
              <div className="w-[255px] sm:w-[280px] 2xl:w-[305px] h-[525px] sm:h-[550px] 2xl:h-[570px] bg-white rounded-3xl border-2 border-matcha-300 shadow-xl overflow-hidden relative group transition-transform duration-300">
                <img
                  src={humanImage}
                  alt="Người Mẫu Studio"
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-102"
                />

                {/* Glassmorphism Model Tag Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {modelGender === 'man' ? 'Mẫu Nam Studio 8K' : modelGender === 'woman' ? 'Mẫu Nữ Studio 8K' : 'Ảnh Người Mẫu AI'}
                  </span>
                </div>

                {/* Generating Overlay Animation over Model */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white z-30 animate-fadeIn">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-3 border-amber-300/30 border-t-amber-300 animate-spin" />
                      <Sparkles className="w-7 h-7 text-amber-300 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <h4 className="font-fashion text-lg font-bold text-amber-300 mb-1">
                      Đang Tạo Ảnh Thử Đồ AI...
                    </h4>
                    <p className="text-xs text-cream-200/90 max-w-[220px] leading-relaxed mb-3">
                      Đang kết xuất trang phục trực tiếp lên người mẫu bằng Gemini 3.0 Pro Image...
                    </p>
                    <div className="w-44 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(25, genStep * 25)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* (Đã xóa dòng chữ tóm tắt/watermark phía dưới ảnh theo yêu cầu người dùng để không che hình ảnh) */}
              </div>

            </div>

            {/* --- CỘT PHẢI (3 KHỐI GỌN CAO XANH ĐẬM): PHỤ KIỆN (TRÊN), ÁO NGOÀI (GIỮA), GIÀY (DƯỚI) --- */}
            <div className="w-full xl:w-[195px] 2xl:w-[215px] xl:max-w-[225px] flex flex-col justify-between gap-3 sm:gap-4 h-[525px] sm:h-[550px] 2xl:h-[570px] shrink-0">

              {/* 4. KHỐI PHẢI TRÊN: PHỤ KIỆN (ACCESSORIES) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[1]} // Phụ kiện
                item={getItemForSlot('accessories')}
                isActiveCategory={activeCategoryKey === 'accessories'}
                onSelectSlot={() => setActiveCategoryKey('accessories')}
                onClear={() => updateLayerWithHistory('accessories', EMPTY_ACCESSORY)}
                selectedColor={layerColors.accessories}
                onSelectColor={(color) => handleSelectColor('accessories', color)}
                isRightColumn={true}
              />

              {/* 5. KHỐI PHẢI GIỮA: ÁO NGOÀI (TOPS) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[3]} // Áo ngoài
                item={getItemForSlot('tops')}
                isActiveCategory={activeCategoryKey === 'tops'}
                onSelectSlot={() => setActiveCategoryKey('tops')}
                onClear={() => updateLayerWithHistory('tops', null)}
                selectedColor={layerColors.tops}
                onSelectColor={(color) => handleSelectColor('tops', color)}
                isRightColumn={true}
              />

              {/* 6. KHỐI PHẢI DƯỚI: GIÀY (FOOTWEAR) */}
              <RectSlotBlock
                categoryDef={CATEGORY_DEFINITIONS[5]} // Giày
                item={getItemForSlot('footwear')}
                isActiveCategory={activeCategoryKey === 'footwear'}
                onSelectSlot={() => setActiveCategoryKey('footwear')}
                onClear={() => updateLayerWithHistory('footwear', null)}
                selectedColor={layerColors.footwear}
                onSelectColor={(color) => handleSelectColor('footwear', color)}
                isRightColumn={true}
              />

            </div>

          </div>

          {/* ========================================================================= */}
          {/* KHUNG ĐIỀU KHIỂN BÊN DƯỚI (BOTTOM ACTION BAR)                             */}
          {/* - Bên trái: Nút Undo & Redo                                               */}
          {/* - Ở giữa: Nút "Phối đồ bằng AI" & Nút "Chuyển sang Stylist Chatbot"      */}
          {/* ========================================================================= */}
          <div className="mt-5 pt-3.5 border-t border-matcha-200/70 flex flex-wrap items-center justify-between gap-3 relative z-20">
            
            {/* Vị trí bên trái: Undo & Redo */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-full border border-matcha-200 shadow-xs">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title="Quay lại bước trước (Undo)"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-matcha-900 hover:bg-matcha-100 disabled:opacity-35 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>

              <div className="w-[1px] h-4 bg-matcha-200" />

              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Tiến thêm bước (Redo)"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-matcha-900 hover:bg-matcha-100 disabled:opacity-35 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tiến thêm</span>
              </button>
            </div>

            {/* Vị trí ở giữa: Nút "Phối đồ bằng AI" & Nút "Chuyển sang Stylist Chatbot" */}
            <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
              
              {/* Nút Phối đồ bằng AI */}
              <button
                onClick={handleGenerateOutfitAI}
                disabled={isGenerating}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-matcha-950 via-matcha-900 to-emerald-900 hover:from-black hover:to-matcha-950 text-cream-50 font-fashion font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-matcha-950/25 hover:shadow-xl hover:scale-103 active:scale-97 disabled:opacity-60 transition-all duration-200 border border-amber-400/40 cursor-pointer disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Đang Tạo Ảnh AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Phối Đồ Bằng AI</span>
                  </>
                )}
              </button>

              {/* Nút Chuyển sang Stylist Chatbot */}
              <button
                onClick={() => setRightPanelTab(prev => prev === 'stylist' ? 'costumes' : 'stylist')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs border shadow-xs transition cursor-pointer ${
                  rightPanelTab === 'stylist'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                    : 'bg-matcha-100/90 hover:bg-matcha-200 text-matcha-950 border-matcha-300'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-matcha-700" />
                <span className="hidden sm:inline">
                  {rightPanelTab === 'stylist' ? 'Xem Tủ Đồ (Costumes)' : 'Mở Stylist Chatbot AI'}
                </span>
                <span className="sm:hidden">
                  {rightPanelTab === 'stylist' ? 'Tủ Đồ' : 'Stylist'}
                </span>
                <ArrowRight className="w-3 h-3 text-matcha-600" />
              </button>
            </div>

          </div>

        </div>

      </section>


      {/* ========================================================================= */}
      {/* PANEL PHẢI: DRESSING ROOM (TỦ ĐỒ) & STYLIST CHATBOT (47-48% CHIỀU NGANG)  */}
      {/* ========================================================================= */}
      <section className="w-full lg:w-[48%] xl:w-[47%] flex flex-col space-y-4">

        {/* HÀNG TRÊN CÙNG: CHUYỂN ĐỔI QUA LẠI GIỮA TỦ ĐỒ (COSTUMES) VÀ STYLIST CHATBOT */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-matcha-200/90 p-1.5 shadow-xs flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setRightPanelTab('costumes')}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              rightPanelTab === 'costumes'
                ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-100/60'
            }`}
          >
            <Shirt className="w-4 h-4 text-amber-300" />
            <span>Phòng Thay Đồ (Tủ Đồ)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              rightPanelTab === 'costumes' ? 'bg-matcha-800 text-matcha-200' : 'bg-matcha-200/80 text-matcha-800'
            }`}>
              6 món
            </span>
          </button>

          <button
            onClick={() => setRightPanelTab('stylist')}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              rightPanelTab === 'stylist'
                ? 'bg-matcha-900 text-cream-50 shadow-md shadow-matcha-950/20'
                : 'text-matcha-800 hover:text-matcha-950 hover:bg-matcha-100/60'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>Stylist Chatbot AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-400 text-matcha-950 font-bold shadow-xs">
              RAG Gợi Ý
            </span>
          </button>
        </div>

        {rightPanelTab === 'costumes' ? (
          <>
            {/* 1. HÀNG TRÊN CÙNG: CÁC BLOCK BO VIỀN CHỨA 6 LỰA CHỌN DANH MỤC */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-matcha-200/90 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-fashion text-base font-bold text-matcha-950 flex items-center gap-2">
              <Shirt className="w-4 h-4 text-matcha-700" />
              <span>Danh Mục Trang Phục</span>
            </h3>
            <span className="text-[11px] font-medium text-matcha-600 bg-matcha-100 px-2 py-0.5 rounded-full">
              6 Danh mục
            </span>
          </div>

          {/* 6 Category Selection Blocks */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CATEGORY_DEFINITIONS.map(cat => {
              const isSelected = activeCategoryKey === cat.key;
              const hasItem = Boolean(selectedLayers[cat.key]) && selectedLayers[cat.key]?.id !== 'acc-none';
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategoryKey(cat.key);
                    setSearchQuery('');
                  }}
                  className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all duration-200 relative cursor-pointer ${
                    isSelected
                      ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-md scale-102 font-bold'
                      : 'bg-[#f7f8f4] hover:bg-matcha-100/70 text-matcha-900 border-matcha-200 font-medium'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-matcha-700'}`} />
                  <span className="text-[11px] leading-tight truncate w-full">{cat.label}</span>
                  {hasItem && (
                    <span className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ${isSelected ? 'bg-amber-300' : 'bg-matcha-700'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. KHU VỰC CHI TIẾT DANH MỤC */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-matcha-200/90 shadow-sm p-4 sm:p-5 flex-1 flex flex-col space-y-4">

          {/* Header of Active Category with Inline Search on the Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-matcha-100">
            <div className="shrink-0">
              <span className="text-[10px] text-matcha-600 font-bold uppercase tracking-wider block">
                Đang duyệt danh mục:
              </span>
              <h4 className="font-fashion text-xl font-bold text-matcha-950">
                {CATEGORY_DEFINITIONS.find(c => c.key === activeCategoryKey)?.fullLabel}
              </h4>
            </div>

            {/* Ô tìm kiếm nằm ngang hàng bên phải */}
            <div className="relative flex items-center flex-1 sm:max-w-xs md:max-w-sm w-full">
              <Search className="w-4 h-4 text-matcha-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchGoogleClip();
                }}
                placeholder={`Tìm ${CATEGORY_DEFINITIONS.find(c => c.key === activeCategoryKey)?.label.toLowerCase()} (lụa, gấm...)...`}
                className="w-full pl-9 pr-24 py-2 rounded-2xl bg-[#f7f8f4] border border-matcha-200 text-xs text-matcha-950 placeholder-matcha-400 focus:outline-none focus:border-matcha-600 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-22 text-matcha-400 hover:text-matcha-700 text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
              {/* Nút tìm kiếm Google trực tiếp */}
              <button
                onClick={handleSearchGoogleClip}
                disabled={isSearchingGoogle}
                title="Tìm kiếm thêm mẫu trên Google và tự động lọc qua CLIP AI"
                className="absolute right-1 px-3 py-1.5 rounded-xl bg-matcha-800 hover:bg-matcha-950 disabled:bg-matcha-400 text-cream-50 text-[11px] font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                {isSearchingGoogle ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                ) : (
                  <Globe className="w-3 h-3 text-amber-300" />
                )}
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* (B) Ô TẢI ĐỒ LÊN (LƯU VÀO BỘ NHỚ CỤC BỘ ĐỂ SAU CHỌN LẠI) */}
          <div className="bg-[#f9faf7] rounded-2xl border border-dashed border-matcha-300 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-matcha-100 text-matcha-800 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-matcha-700" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-matcha-950">Tải Đồ Của Bạn Lên</p>
                <p className="text-[10px] text-matcha-600">Lưu vào bộ nhớ cục bộ để dùng lại bất kỳ lúc nào</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Tên món đồ (tùy chọn)"
                className="px-2.5 py-1.5 rounded-xl bg-white border border-matcha-200 text-xs text-matcha-900 placeholder-matcha-400 w-36 focus:outline-none"
              />
              <label className="px-3.5 py-1.5 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-cream-50 text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 shadow-sm transition">
                <span>Chọn Ảnh</span>
                <input
                  ref={fileInputGarmentRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGarmentUpload}
                  disabled={isUploadingGarment}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* (C) CÁC Ô Ở DƯỚI: TỪNG BLOCK QUẦN ÁO ĐỂ LỰA CHỌN */}
          <div className="flex-1 overflow-y-auto max-h-[540px] pr-1 space-y-2">

            {/* Real-time Streaming Status Banner */}
            {isSearchingGoogle && (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs shadow-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                  <span className="truncate">
                    Đang tra cứu trực tiếp: <strong className="font-bold text-amber-900">"{searchQuery.trim() || CATEGORY_DEFINITIONS.find(c => c.key === activeCategoryKey)?.label}"</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950 font-bold">
                    {(googleResultsBySlot[activeCategoryKey] || []).length}/8 ảnh
                  </span>
                </div>
              </div>
            )}

            {/* Completed Stream Results Notification Banner */}
            {!isSearchingGoogle && (googleResultsBySlot[activeCategoryKey]?.length > 0) && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Đã nạp <strong>{googleResultsBySlot[activeCategoryKey].length} ảnh chuẩn xác nhất</strong> từ Web
                  </span>
                </div>
                <button
                  onClick={() => setGoogleResultsBySlot(prev => ({ ...prev, [activeCategoryKey]: [] }))}
                  className="text-emerald-700 hover:text-emerald-950 font-bold underline text-[11px] cursor-pointer"
                >
                  Xóa kết quả Web
                </button>
              </div>
            )}

            {/* Grid danh sách các món đồ */}
            {currentCategoryCatalog.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {currentCategoryCatalog.map((item, index) => {
                  const isCurrentSelected = (selectedLayers[activeCategoryKey]?.id === item.id) || 
                    (item.id === 'acc-none' && (!selectedLayers.accessories || selectedLayers.accessories.id === 'acc-none')) ||
                    (selectedLayers[activeCategoryKey]?.name === item.name && selectedLayers[activeCategoryKey]?.url === item.url);

                  const isEmptyChoice = item.id === 'acc-none';

                  return (
                    <div
                      key={item.id || `item_${index}`}
                      onClick={() => handleSelectItem(item)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 transform flex flex-col justify-between relative group animate-fadeIn ${
                        isCurrentSelected
                          ? 'bg-matcha-100/70 border-matcha-800 ring-2 ring-matcha-800 shadow-md scale-[1.01]'
                          : 'bg-white hover:bg-[#fbfcf9] border-matcha-200/80 hover:border-matcha-400 shadow-xs'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full aspect-square rounded-xl bg-[#f0f2eb] border border-matcha-200/50 overflow-hidden relative mb-2 flex items-center justify-center">
                        {isEmptyChoice ? (
                          <div className="flex flex-col items-center justify-center text-matcha-600 gap-1">
                            <X className="w-8 h-8 text-matcha-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-matcha-700">Để Trống</span>
                          </div>
                        ) : (item.url || item.imageUrl) ? (
                          <img
                            src={item.url || item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              if (item.thumbnail && e.currentTarget.src !== item.thumbnail) {
                                e.currentTarget.src = item.thumbnail;
                              } else {
                                e.currentTarget.src = '/api/clothes/viet_phuc_sample.jpg';
                              }
                            }}
                          />
                        ) : (
                          <Shirt className="w-8 h-8 text-matcha-400" />
                        )}

                        {/* Selected Indicator Badge */}
                        {isCurrentSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-matcha-900 text-cream-50 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Source Tag Badge */}
                        <div className="absolute bottom-1.5 left-1.5 max-w-[85%] truncate px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium">
                          {item.badge || item.category || 'Di sản'}
                        </div>

                        {/* Delete button if custom uploaded */}
                        {item.isCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomGarment(item.id, e)}
                            title="Xóa món đồ này khỏi bộ nhớ cục bộ"
                            className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Name & Subtitle */}
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-matcha-950 line-clamp-2 leading-tight" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-matcha-600 truncate">
                          {isEmptyChoice ? 'Không đeo phụ kiện' : (item.category || CATEGORY_DEFINITIONS.find(c => c.key === activeCategoryKey)?.label)}
                        </p>
                      </div>

                      {/* Select Action Bar */}
                      <div className="mt-2 pt-1.5 border-t border-matcha-100 flex items-center justify-between text-[10px]">
                        <span className={`font-semibold ${isCurrentSelected ? 'text-matcha-900 font-bold' : 'text-matcha-600'}`}>
                          {isCurrentSelected ? '✓ Đang chọn' : 'Nhấp để chọn'}
                        </span>
                        {item.clipScore && (
                          <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            CLIP {item.clipScore}
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#f9faf7] rounded-2xl border border-dashed border-matcha-200 text-matcha-600 space-y-2">
                <Shirt className="w-8 h-8 text-matcha-300 mx-auto" />
                <p className="text-xs font-semibold">Không tìm thấy món đồ phù hợp với từ khóa.</p>
                <button
                  onClick={handleSearchGoogleClip}
                  className="px-4 py-1.5 rounded-full bg-matcha-800 text-cream-50 text-xs font-semibold hover:bg-matcha-950 transition cursor-pointer"
                >
                  Tìm trên Google ngay
                </button>
              </div>
            )}

          </div>

        </div>

          </>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: STYLIST CHATBOT AI (TÁI TẠO 100% TỪ REMIX ROOM)                  */
          /* ========================================================================= */
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-matcha-200/90 shadow-sm flex flex-col flex-1 h-[780px] lg:h-[820px] overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-matcha-100 bg-matcha-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-matcha-900 flex items-center justify-center text-cream-50 shadow-sm shrink-0">
                  <Bot className="w-5 h-5 text-amber-300" />
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
                    Online • RAG Knowledge & Luật Di Sản (6 Lớp)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCreateNewSession}
                  className="px-2.5 py-1.5 bg-matcha-900 hover:bg-matcha-950 text-cream-50 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Khởi tạo đoạn chat mới"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Chat Mới</span>
                </button>
                <button
                  onClick={() => handleDeleteSession(activeSession.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition cursor-pointer"
                  title="Xóa đoạn chat này"
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
                  className="px-3 py-1 rounded-full text-[10px] font-fashion font-bold bg-white hover:bg-matcha-100 text-matcha-900 border border-matcha-200 whitespace-nowrap shadow-xs transition hover:scale-[1.02] cursor-pointer disabled:opacity-50"
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
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2 animate-fadeIn`}
                  >
                    {msg.content && msg.content.trim() && (
                      <div
                        className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed ${
                          isUser
                            ? 'bg-matcha-900 text-cream-50 rounded-br-none shadow-sm'
                            : 'bg-[#f7f8f4] text-matcha-950 border border-matcha-200 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}

                    {/* AI Suggested Outfit Card (with button to apply into Dressing Room) */}
                    {msg.outfit && msg.outfit.recommendedItems && (
                      <div className="w-full max-w-[95%] p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 shadow-sm space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-fashion font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            Gợi Ý Trọn Bộ Cổ Phục Remix
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold">
                            6 Món Đồng Bộ
                          </span>
                        </div>

                        {/* Items Preview Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {msg.outfit.recommendedItems.map((item, itIdx) => (
                            <div key={itIdx} className="p-2 rounded-xl bg-white border border-emerald-200 flex items-center gap-2 shadow-xs">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt="" 
                                  className="w-9 h-9 rounded-lg object-cover border shrink-0" 
                                  onError={(e) => { e.currentTarget.src = '/api/clothes/viet_phuc_sample.jpg'; }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                                  👘
                                </div>
                              )}
                              <div className="overflow-hidden min-w-0">
                                <span className="font-bold text-matcha-950 block truncate">{item.name}</span>
                                <span className="text-[9px] text-emerald-700 font-semibold truncate block uppercase">{item.slot}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Prominent Action: Apply into Dressing Room Canvas */}
                        <button
                          onClick={() => handleApplyAiOutfitToDressing(msg.outfit)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-cream-50 font-fashion font-bold text-xs shadow-md transition flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Áp Dụng Vào Phòng Thay Đồ (6 Món)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}

              {isChatting && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#f7f8f4] border border-matcha-200 text-matcha-700 text-xs animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>AI Stylist đang tra cứu luật Cổ phục và phân tích thời tiết...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Shortcuts: Phím Tắt Nhanh Thời Tiết & Sự Kiện */}
            <div className="px-3.5 py-2.5 bg-[#f8f9f4] border-t border-matcha-200/80 space-y-2 shrink-0">
              
              {/* Row 1: Phím tắt Thời tiết */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                <span className="text-[10px] font-bold text-matcha-800 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Thời tiết:</span>
                </span>
                {WEATHER_SHORTCUTS.map(w => {
                  const isSel = selectedWeather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWeather(prev => prev === w.id ? null : w.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs ${
                        isSel
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-xs ring-1 ring-amber-400'
                          : 'bg-white hover:bg-matcha-100 text-matcha-800 border-matcha-200 hover:border-matcha-400'
                      }`}
                      title={`Bấm để chọn: ${w.label}`}
                    >
                      <span>{w.label}</span>
                      {isSel && <Check className="w-2.5 h-2.5 text-amber-300" />}
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Phím tắt Sự kiện / Hoàn cảnh */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                <span className="text-[10px] font-bold text-matcha-800 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sự kiện:</span>
                </span>
                {OCCASION_SHORTCUTS.map(o => {
                  const isSel = selectedOccasion === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOccasion(prev => prev === o.id ? null : o.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs ${
                        isSel
                          ? 'bg-matcha-900 text-cream-50 border-matcha-900 shadow-xs ring-1 ring-amber-400'
                          : 'bg-white hover:bg-matcha-100 text-matcha-800 border-matcha-200 hover:border-matcha-400'
                      }`}
                      title={`Bấm để chọn: ${o.label}`}
                    >
                      <span>{o.label}</span>
                      {isSel && <Check className="w-2.5 h-2.5 text-amber-300" />}
                    </button>
                  );
                })}

                {/* Nút Xóa chọn nhanh */}
                {(selectedWeather || selectedOccasion) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWeather(null);
                      setSelectedOccasion(null);
                    }}
                    className="text-[9px] text-rose-600 hover:text-rose-800 font-bold ml-1 px-1.5 py-0.5 rounded-full hover:bg-rose-50 cursor-pointer shrink-0 transition"
                    title="Xóa các phím tắt đã chọn"
                  >
                    Xóa chọn ✕
                  </button>
                )}
              </div>

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
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      (selectedWeather || selectedOccasion)
                        ? `Đã chọn: ${[
                            selectedWeather && WEATHER_SHORTCUTS.find(w => w.id === selectedWeather)?.label,
                            selectedOccasion && OCCASION_SHORTCUTS.find(o => o.id === selectedOccasion)?.label
                          ].filter(Boolean).join(' + ')} (nhập thêm yêu cầu hoặc bấm Gửi)...`
                        : "Hỏi AI Stylist (VD: Lạnh 20 độ, đi cafe, phối ngầu GenZ)..."
                    }
                    disabled={isChatting}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f7f8f4] border border-matcha-200 text-xs text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500/20 placeholder:text-matcha-400"
                  />
                  {chatInput && (
                    <button
                      type="button"
                      onClick={() => setChatInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-matcha-400 hover:text-matcha-700 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChatting || (!chatInput.trim() && !selectedWeather && !selectedOccasion)}
                  className="px-3.5 py-2.5 rounded-2xl bg-matcha-900 hover:bg-matcha-950 disabled:opacity-50 text-cream-50 shadow-sm transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
                  title="Gửi câu hỏi cho AI Stylist"
                >
                  <span className="hidden sm:inline">Gửi</span>
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </form>
            </div>

          </div>
        )}

      </section>

      {/* Toast Notification khi áp dụng outfit từ Chatbot */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950 text-cream-50 shadow-2xl border border-emerald-400/60 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CẢNH BÁO VI PHẠM QUY CHUẨN VĂN HÓA DI SẢN (PRECHECK INTERCEPT)      */}
      {/* ========================================================================= */}
      {culturalAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-lg w-full p-6 text-matcha-950 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-fashion text-xl font-bold text-rose-900">
                  {culturalAlert.title || 'Chốt Chặn Văn Hóa: Từ Chối Tạo Ảnh'}
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  {culturalAlert.reason || 'Trang phục hoặc ngữ cảnh không phù hợp quy chuẩn di sản.'}
                </p>
              </div>
            </div>

            {Array.isArray(culturalAlert.details) && culturalAlert.details.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                {culturalAlert.details.map((d, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{d}</span>
                  </p>
                ))}
              </div>
            )}

            {culturalAlert.recommendation && (
              <div className="p-3.5 rounded-2xl bg-matcha-50 border border-matcha-200 text-xs text-matcha-900">
                <p className="font-bold mb-1">💡 Đề xuất điều chỉnh từ chuyên gia:</p>
                <p>{culturalAlert.recommendation}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCulturalAlert(null)}
                className="px-6 py-2 rounded-full bg-rose-900 hover:bg-rose-950 text-white text-xs font-bold transition cursor-pointer"
              >
                Đã Hiểu & Điều Chỉnh Lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================================
// RECTANGLE COMPONENT: KHỐI HÌNH CHỮ NHẬT TO, XANH ĐẬM, CĂN CHỈNH CHUẨN XÁC
// - Kích thước lớn hơn h-[114px] sm:h-[122px] 2xl:h-[128px], lấp đầy khoảng trống
// - Thumbnail lớn hơn w-16 h-16 sm:w-18 sm:h-18 2xl:w-20 2xl:h-20
// - Tích hợp tính năng chọn màu sắc di sản và tùy biến cho từng món đồ
// =========================================================================
function RectSlotBlock({ 
  categoryDef, 
  item, 
  isActiveCategory, 
  onSelectSlot, 
  onClear,
  selectedColor,
  onSelectColor,
  isRightColumn = false
}) {
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [customHex, setCustomHex] = useState(selectedColor?.hex || '#A81C1E');
  const IconComponent = categoryDef.icon;
  const isNone = !item || item.id === 'acc-none' || !item.url;

  // 4 Màu di sản nhanh phổ biến nhất
  const QUICK_COLORS = [
    HERITAGE_COLOR_PALETTE[1], // Đỏ Gấm
    HERITAGE_COLOR_PALETTE[2], // Vàng Kim
    HERITAGE_COLOR_PALETTE[3], // Xanh Chàm
    HERITAGE_COLOR_PALETTE[4], // Sa Bạch
  ];

  // Quyết định hướng mở popover (xuống dưới cho các block trên, lên trên cho các block dưới)
  const isBottomRow = categoryDef.key === 'bottoms' || categoryDef.key === 'footwear';

  return (
    <div
      onClick={onSelectSlot}
      className={`w-full h-[156px] sm:h-[162px] 2xl:h-[168px] p-2.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between relative group shadow-md shrink-0 ${
        isActiveCategory
          ? 'bg-[#193d25] border-amber-400 ring-2 ring-amber-400/40 shadow-emerald-950/40'
          : 'bg-[#142d1d] hover:bg-[#183623] border-[#22472e] hover:border-matcha-500 shadow-xs'
      }`}
    >
      {/* 1. Header: Icon + Category Label + Clear Button */}
      <div className="flex items-center justify-between gap-1 w-full">
        <div className="flex items-center gap-1.5 min-w-0">
          <IconComponent className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] sm:text-[11px] uppercase font-bold text-amber-400 tracking-wider truncate">
            {categoryDef.label}
          </span>
          {isActiveCategory && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          )}
        </div>

        {/* Clear/Reset button on hover if item exists and not none */}
        {!isNone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title="Bỏ món đồ này"
            className="opacity-0 group-hover:opacity-100 transition w-4 h-4 rounded-full bg-black/60 hover:bg-rose-600 text-white text-[9px] flex items-center justify-center shadow-xs cursor-pointer shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Middle Body: Thumbnail + Item Details */}
      <div className="flex items-center gap-2 my-auto w-full">
        {/* Thumbnail Image Box */}
        <div className="w-13 h-13 sm:w-15 sm:h-15 2xl:w-16 2xl:h-16 rounded-xl bg-black/40 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
          {!isNone && (item?.url || item?.imageUrl) ? (
            <img
              src={item.url || item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/api/clothes/viet_phuc_sample.jpg';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-matcha-300/80">
              <IconComponent className="w-5 h-5 text-amber-400/70" />
              <span className="text-[8px] uppercase tracking-wider text-matcha-300 font-bold mt-0.5">Trống</span>
            </div>
          )}

          {/* Selected Color Indicator Badge on Thumbnail corner */}
          {selectedColor && !isNone && (
            <div 
              className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border border-white shadow-xs"
              style={{ backgroundColor: selectedColor.hex }}
              title={`Màu chỉ định: ${selectedColor.name}`}
            />
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0 pr-0.5">
          <p 
            className="text-[11px] sm:text-xs font-bold text-cream-50 leading-snug line-clamp-2 group-hover:text-amber-200 transition"
            title={isNone ? 'Để trống (Không mang)' : item?.name}
          >
            {isNone ? 'Để trống (Không mang)' : item?.name}
          </p>
          <span className="text-[9px] text-matcha-300/70 block mt-0.5 truncate">
            {isNone ? 'Tự do' : (item?.era || item?.category || 'Cổ phục')}
          </span>
        </div>
      </div>

      {/* 3. Bottom Row: Color Selection Bar */}
      {!isNone ? (
        <div className="relative pt-1 border-t border-white/10 w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-1 w-full">
            
            {/* Main Color Picker Trigger Button */}
            <button
              type="button"
              onClick={() => setShowColorPopover(!showColorPopover)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer shadow-xs min-w-0 shrink ${
                selectedColor
                  ? 'bg-emerald-950/90 border-amber-400/80 text-amber-200'
                  : 'bg-black/40 hover:bg-black/60 border-white/20 text-cream-100/90'
              }`}
              title="Bấm để mở bảng chọn màu sắc"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0 shadow-inner"
                style={{ backgroundColor: selectedColor ? selectedColor.hex : '#9CA3AF' }}
              />
              <span className="truncate max-w-[46px] sm:max-w-[55px]">
                {selectedColor ? selectedColor.name : 'Màu'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
            </button>

            {/* Quick Dots (4 popular heritage colors) */}
            <div className="flex items-center gap-1 shrink-0">
              {QUICK_COLORS.map(c => {
                const isCur = selectedColor?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectColor(c)}
                    title={`Đổi sang màu ${c.name}`}
                    className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer transform hover:scale-125 ${
                      isCur 
                        ? 'border-amber-300 ring-1 ring-amber-400 scale-110 shadow-sm' 
                        : 'border-white/30 hover:border-white/80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>

          </div>

          {/* COLOR PALETTE FLOATING POPOVER */}
          {showColorPopover && (
            <>
              {/* Backdrop dismisser */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowColorPopover(false)} 
              />

              {/* Popover Card */}
              <div 
                className={`absolute z-50 w-[230px] bg-[#0c1f13] border-2 border-amber-400/70 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-cream-50 animate-fadeIn ${
                  isRightColumn ? 'right-0' : 'left-0'
                } ${
                  isBottomRow ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Chọn Màu {categoryDef.label}</span>
                  </span>
                    <button
                      type="button"
                      onClick={() => setShowColorPopover(false)}
                      className="text-white/60 hover:text-white text-xs cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 10 Heritage Color Grid */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-0.5 custom-scrollbar">
                    {HERITAGE_COLOR_PALETTE.map((c) => {
                      const isChosen = (selectedColor?.id === c.id) || (!selectedColor && c.id === 'default');
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            onSelectColor(c.id === 'default' ? null : c);
                            setShowColorPopover(false);
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition cursor-pointer ${
                            isChosen
                              ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold'
                              : 'bg-black/30 hover:bg-black/50 border-white/10 text-cream-100 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[10px] truncate leading-tight">
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input row */}
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => setCustomHex(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-white/30 bg-transparent p-0"
                        title="Bấm để chọn mã màu bất kỳ"
                      />
                      <span className="text-[10px] text-cream-200">Màu tự do:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectColor({
                          id: `custom-${customHex}`,
                          name: `Màu Tùy Biến (${customHex})`,
                          hex: customHex,
                          prompt: `custom fabric color ${customHex}`
                        });
                        setShowColorPopover(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] transition cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>

                </div>
              </>
            )}

          </div>
        ) : (
          <div className="text-[10px] text-matcha-400/60 italic">
            Chưa có trang phục
          </div>
        )}

    </div>
  );
}
