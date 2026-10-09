import React, { useState, useRef } from 'react';
import { 
  Sparkles, Upload, Play, CheckCircle2, AlertCircle, RefreshCw, 
  Download, ArrowRight, Layers, Eye, Image as ImageIcon, Check,
  Zap, Cpu, ShieldCheck, User, Shirt, Scissors, Maximize2, Trash2,
  Sliders, SlidersHorizontal, Info, Compass
} from 'lucide-react';
import defaultWomanImg from '../human model/woman 1.png';
import defaultShirtImg from '../clothes/shirt.png';

// Garment Sample Presets for Quick Testing
const SAMPLE_GARMENT_PRESETS = [
  {
    id: 'shirt-test',
    name: 'Áo sơ mi test (shirt.png)',
    type: 'top',
    typeLabel: 'Áo (Top)',
    url: '/api/clothes/shirt.png',
    badge: 'Mặc định'
  },
  {
    id: 'vp-001',
    name: 'Áo ngũ thân tay chẽn (VP_001)',
    type: 'top',
    typeLabel: 'Áo Cổ Phục',
    url: '/api/dataset/01_ao_co_phuc/VP_001_ao_ngu_than_tay_chen.jpg',
    badge: 'Cổ Phục'
  },
  {
    id: 'vp-003',
    name: 'Áo giao lĩnh (VP_003)',
    type: 'top',
    typeLabel: 'Áo Cổ Phục',
    url: '/api/dataset/01_ao_co_phuc/VP_003_ao_giao_linh.jpg',
    badge: 'Cổ Phục'
  },
  {
    id: 'vp-006',
    name: 'Áo bà ba (VP_006)',
    type: 'top',
    typeLabel: 'Áo Cổ Phục',
    url: '/api/dataset/01_ao_co_phuc/VP_006_ao_ba_ba.png',
    badge: 'Nam Bộ'
  },
  {
    id: 'vp-015',
    name: 'Quần sa trắng (VP_015)',
    type: 'bottom',
    typeLabel: 'Quần / Váy',
    url: '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
    badge: 'Quần Cổ Phục'
  },
  {
    id: 'vp-016',
    name: 'Quần lụa ống rộng (VP_016)',
    type: 'bottom',
    typeLabel: 'Quần / Váy',
    url: '/api/dataset/02_quan_vay_co_phuc/VP_016_quan_lua_ong_rong_truyen_thong.webp',
    badge: 'Quần Cổ Phục'
  }
];

export default function TestingWorkspace({ onOpenFolder }) {
  // Input 1: Human Image State
  const [humanImage, setHumanImage] = useState(defaultWomanImg);
  const [humanImageName, setHumanImageName] = useState('woman 1.png (Người mẫu mặc định)');
  const [isCustomHuman, setIsCustomHuman] = useState(false);
  const [humanDimensions, setHumanDimensions] = useState({ w: 1600, h: 1600 });

  // Input 2: Garment Image State
  const [garmentImage, setGarmentImage] = useState('/api/clothes/shirt.png');
  const [garmentName, setGarmentName] = useState('Áo sơ mi test (shirt.png)');
  const [garmentType, setGarmentType] = useState('top'); // 'top' | 'bottom'
  const [isCustomGarment, setIsCustomGarment] = useState(false);
  const [garmentDimensions, setGarmentDimensions] = useState({ w: 1600, h: 1600 });

  // Execution & Output State
  const [isRunning, setIsRunning] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [viewMode, setViewMode] = useState('result'); // 'result' | 'human' | 'garment' | 'split'
  const [splitSlider, setSplitSlider] = useState(50);
  const [errorMessage, setErrorMessage] = useState(null);

  // Hidden File Input Refs
  const humanFileInputRef = useRef(null);
  const garmentFileInputRef = useRef(null);

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
      setHumanImage(dataUri);
      setHumanImageName(file.name);
      setIsCustomHuman(true);
      setResultData(null); // Reset previous result

      // Read dimensions
      const img = new Image();
      img.onload = () => {
        setHumanDimensions({ w: img.width, h: img.height });
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  // Handle Garment File Upload
  const handleGarmentFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target.result;
      setGarmentImage(dataUri);
      setGarmentName(file.name);
      setIsCustomGarment(true);
      setResultData(null); // Reset previous result

      // Read dimensions
      const img = new Image();
      img.onload = () => {
        setGarmentDimensions({ w: img.width, h: img.height });
      };
      img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };

  // Run Mobile-VTON Virtual Try-On Model
  const handleRunModel = async () => {
    if (!humanImage || !garmentImage || isRunning) return;

    setIsRunning(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/vton-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          humanImage: humanImage,
          garmentImage: garmentImage,
          garmentType: garmentType,
          garmentName: garmentName
        })
      });

      const data = await res.json();

      if (data.success && data.resultUrl) {
        setResultData(data);
        setViewMode('result');
      } else {
        setErrorMessage(data.message || data.error || 'Lỗi khi chạy model Mobile-VTON');
      }
    } catch (err) {
      setErrorMessage(`Lỗi kết nối máy chủ: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Editorial Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-matcha-100 via-matcha-50 to-cream-100 border border-matcha-200/90 p-6 sm:p-8 shadow-fashion overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-matcha-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-matcha-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="font-curvy text-2xl text-matcha-700 font-bold">Laboratoire</span>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/90 border border-matcha-300 text-matcha-900 shadow-sm">
                Testing Studio • Developer Mode
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-full text-[10px] font-bold shadow-sm">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>CVPR 2026 Mobile-VTON Engine (Universal)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-fashion font-bold text-matcha-950 tracking-tight leading-tight">
              Khu Vực Thử Nghiệm <span className="font-curvy font-normal text-3xl sm:text-5xl text-matcha-600 lowercase block sm:inline">virtual try-on</span> AI
            </h1>
            <p className="text-xs sm:text-sm text-matcha-800/85 mt-2 max-w-2xl font-sans leading-relaxed">
              Tải lên <strong>1 ảnh nhân vật bất kỳ</strong> và <strong>1 ảnh quần hoặc áo</strong>, sau đó nhấn nút chạy model để xem trực tiếp nhân vật đó mặc trang phục với độ chính xác cao.
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-matcha-200 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div className="text-xs font-sans">
              <span className="font-bold text-matcha-950 block">Kiểm định 5 bước tự động:</span>
              <span className="text-matcha-700 text-[11px]">Bảo tồn khuôn mặt • Tách nền tự động • Warp vải theo phom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================= COLUMN 1: INPUT 1 - ẢNH NHÂN VẬT (4 Cols) ================= */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-matcha-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-matcha-100 flex items-center justify-center text-matcha-800 font-bold text-xs shadow-sm">
                  1
                </div>
                <div>
                  <h3 className="font-fashion font-bold text-sm text-matcha-950">Ảnh Nhân Vật (Human Model)</h3>
                  <p className="text-[10px] text-matcha-600 font-sans">Tải lên ảnh bất kỳ hoặc dùng mặc định</p>
                </div>
              </div>

              {isCustomHuman && (
                <button
                  onClick={() => {
                    setHumanImage(defaultWomanImg);
                    setHumanImageName('woman 1.png (Người mẫu mặc định)');
                    setIsCustomHuman(false);
                    setHumanDimensions({ w: 1600, h: 1600 });
                  }}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-medium underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Dùng mẫu gốc</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={humanFileInputRef}
              onChange={handleHumanFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Human Image Preview Container */}
            <div 
              onClick={() => humanFileInputRef.current?.click()}
              className="group relative w-full aspect-[3/4] bg-matcha-50/70 rounded-2xl border-2 border-dashed border-matcha-300 hover:border-matcha-600 transition-all cursor-pointer overflow-hidden flex items-center justify-center shadow-inner"
              title="Nhấp để tải lên ảnh nhân vật mới từ máy tính"
            >
              <img
                src={humanImage}
                alt="Nhân vật"
                className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-matcha-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                <div className="w-10 h-10 rounded-full bg-white text-matcha-950 flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span>Tải ảnh nhân vật khác</span>
              </div>

              {/* Resolution Badge */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-cream-100 font-mono flex items-center justify-between pointer-events-none">
                <span className="truncate max-w-[140px]">{humanImageName}</span>
                <span>{humanDimensions.w}×{humanDimensions.h}</span>
              </div>
            </div>

            <p className="text-[11px] text-matcha-600 mt-2 font-sans italic text-center">
              💡 Mẹo: Có thể kéo thả hoặc nhấp vào ảnh trên để tải ảnh người của bạn từ máy tính.
            </p>
          </div>

          <button
            onClick={() => humanFileInputRef.current?.click()}
            className="w-full py-2.5 rounded-full text-xs font-bold bg-matcha-50 hover:bg-matcha-100 text-matcha-900 border border-matcha-200 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Ảnh Nhân Vật Mới</span>
          </button>
        </div>

        {/* ================= COLUMN 2: INPUT 2 - ẢNH QUẦN HOẶC ÁO (4 Cols) ================= */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-matcha-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-xs shadow-sm">
                  2
                </div>
                <div>
                  <h3 className="font-fashion font-bold text-sm text-matcha-950">Ảnh Trang Phục (Garment)</h3>
                  <p className="text-[10px] text-matcha-600 font-sans">Chọn Áo hoặc Quần/Váy</p>
                </div>
              </div>

              {/* Garment Type Selector (Áo vs Quần) */}
              <div className="flex items-center bg-matcha-100/70 p-0.5 rounded-full border border-matcha-200">
                <button
                  onClick={() => setGarmentType('top')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    garmentType === 'top'
                      ? 'bg-matcha-900 text-cream-50 shadow-xs'
                      : 'text-matcha-700 hover:text-matcha-950'
                  }`}
                >
                  Áo (Top)
                </button>
                <button
                  onClick={() => setGarmentType('bottom')}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                    garmentType === 'bottom'
                      ? 'bg-matcha-900 text-cream-50 shadow-xs'
                      : 'text-matcha-700 hover:text-matcha-950'
                  }`}
                >
                  Quần/Váy
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={garmentFileInputRef}
              onChange={handleGarmentFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Garment Image Preview Container */}
            <div 
              onClick={() => garmentFileInputRef.current?.click()}
              className="group relative w-full aspect-[3/4] bg-matcha-50/70 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-600 transition-all cursor-pointer overflow-hidden flex items-center justify-center shadow-inner"
              title="Nhấp để tải lên ảnh quần áo mới từ máy tính"
            >
              <img
                src={garmentImage}
                alt="Trang phục"
                className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-matcha-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                <div className="w-10 h-10 rounded-full bg-white text-matcha-950 flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span>Tải ảnh trang phục khác</span>
              </div>

              {/* Resolution Badge */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-full px-3 py-1 text-[10px] text-cream-100 font-mono flex items-center justify-between pointer-events-none">
                <span className="truncate max-w-[140px]">{garmentName}</span>
                <span>{garmentType === 'top' ? 'Thân trên' : 'Thân dưới'}</span>
              </div>
            </div>

            {/* Quick Presets Picker */}
            <div className="mt-3">
              <span className="text-[10px] uppercase font-bold text-matcha-700 block mb-1.5">
                Hoặc chọn mẫu có sẵn để test nhanh:
              </span>
              <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-1">
                {SAMPLE_GARMENT_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setGarmentImage(item.url);
                      setGarmentName(item.name);
                      setGarmentType(item.type);
                      setIsCustomGarment(false);
                      setResultData(null);
                    }}
                    className={`p-1.5 rounded-xl border text-left text-[10px] transition ${
                      garmentImage === item.url
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-400'
                        : 'bg-white border-matcha-200 text-matcha-800 hover:bg-matcha-50'
                    }`}
                  >
                    <span className="line-clamp-1 truncate block">{item.name}</span>
                    <span className="text-[8px] text-matcha-500 font-mono">{item.typeLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => garmentFileInputRef.current?.click()}
            className="w-full py-2.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải Ảnh Quần/Áo Mới</span>
          </button>
        </div>

        {/* ================= COLUMN 3: OUTPUT & ACTION - KẾT QUẢ THỬ ĐỒ (4 Cols) ================= */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-matcha-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-matcha-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-xs shadow-sm">
                  3
                </div>
                <div>
                  <h3 className="font-fashion font-bold text-sm text-matcha-950">Kết Quả (Try-On Output)</h3>
                  <p className="text-[10px] text-matcha-600 font-sans">Nhân vật mặc trang phục</p>
                </div>
              </div>

              {resultData && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                  {resultData.executionTime || 'Hoàn tất'}
                </span>
              )}
            </div>

            {/* Big Action Button */}
            <button
              onClick={handleRunModel}
              disabled={isRunning}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider mb-4 ${
                isRunning
                  ? 'bg-matcha-800 text-cream-100 opacity-90 cursor-wait'
                  : 'bg-gradient-to-r from-matcha-900 via-matcha-800 to-emerald-900 hover:from-black hover:to-matcha-900 text-cream-50 shadow-matcha-950/20 hover:scale-[1.01]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Đang Chạy Model Mobile-VTON...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
                  <span>Chạy Model VTON (Mặc Đồ Ngay)</span>
                </>
              )}
            </button>

            {/* Error Message if Any */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* View Mode Switcher (if Result Ready) */}
            {resultData && (
              <div className="flex items-center justify-center bg-matcha-100/70 p-1 rounded-full border border-matcha-200 mb-3">
                <button
                  onClick={() => setViewMode('result')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    viewMode === 'result'
                      ? 'bg-matcha-900 text-cream-50 shadow-xs'
                      : 'text-matcha-700 hover:text-matcha-950'
                  }`}
                >
                  ✨ Đã Mặc Đồ
                </button>
                <button
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    viewMode === 'human'
                      ? 'bg-white text-matcha-950 shadow-xs'
                      : 'text-matcha-700 hover:text-matcha-950'
                  }`}
                >
                  👤 Gốc
                </button>
                <button
                  onClick={() => setViewMode('garment')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    viewMode === 'garment'
                      ? 'bg-white text-matcha-950 shadow-xs'
                      : 'text-matcha-700 hover:text-matcha-950'
                  }`}
                >
                  👗 Áo/Quần
                </button>
              </div>
            )}

            {/* Result Image Stage Container */}
            <div className="relative w-full aspect-[3/4] bg-matcha-50/70 rounded-2xl border border-matcha-200 overflow-hidden flex items-center justify-center shadow-inner">
              {isRunning ? (
                /* Scanning Laser State during VTON */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="relative w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 animate-pulse shadow-md">
                    <Cpu className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-fashion font-bold text-sm text-matcha-950">Mobile-VTON Neural Warp</h4>
                    <p className="text-[11px] text-matcha-600 mt-0.5 font-sans">
                      Đang phân đoạn giải phẫu & uốn vải thích ứng...
                    </p>
                  </div>
                </div>
              ) : resultData ? (
                /* Rendered Result Output */
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={
                      viewMode === 'result'
                        ? resultData.resultUrl
                        : viewMode === 'human'
                        ? humanImage
                        : garmentImage
                    }
                    alt="Kết quả VTON"
                    className="w-full h-full object-contain transition-all duration-300"
                  />

                  {/* Top Result Tag */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[9px] font-bold text-emerald-300 font-sans border border-emerald-500/40">
                    CVPR 2026 Mobile-VTON
                  </div>
                </div>
              ) : (
                /* Placeholder before Run */
                <div className="text-center p-6 text-matcha-500 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-matcha-100 flex items-center justify-center mx-auto text-matcha-700">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="font-fashion font-bold text-sm text-matcha-900">Chưa có kết quả thử đồ</p>
                  <p className="text-xs text-matcha-600 font-sans">
                    Chọn ảnh nhân vật ở cột 1, chọn trang phục ở cột 2 rồi nhấn <strong>Chạy Model VTON</strong> ở trên.
                  </p>
                </div>
              )}
            </div>

            {/* Diagnostic Steps Log if available */}
            {resultData?.steps && (
              <div className="mt-3 bg-matcha-50/60 p-2.5 rounded-2xl border border-matcha-200 text-[10px] space-y-1">
                <span className="font-bold text-matcha-900 uppercase tracking-wider block">
                  Nhật ký kiểm định {resultData.steps.length} bước:
                </span>
                {resultData.steps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-matcha-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download Action if Result Available */}
          {resultData && (
            <a
              href={resultData.resultUrl}
              download={`vton_result_${Date.now()}.png`}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-matcha-900 hover:bg-matcha-800 text-cream-50 transition flex items-center justify-center gap-2 shadow-sm text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Ảnh Kết Quả Về Máy</span>
            </a>
          )}
        </div>

      </div>

    </div>
  );
}
