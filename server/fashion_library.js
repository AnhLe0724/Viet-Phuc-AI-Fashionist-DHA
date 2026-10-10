import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');
const LIBRARY_FILE = path.join(DATASET_DIR, 'fashion_library_cache.json');

// Helper to remove Vietnamese tones for robust matching
export function removeVietnameseTones(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Adaptive Fashion Library Class
 * Permanently stores, enriches, and rapidly retrieves fashion items across all 6 slots:
 * innerwear, tops, bottoms, headwear, footwear, accessories.
 */
class FashionLibrary {
  constructor() {
    this.items = [];
    this.loadLibrary();
  }

  loadLibrary() {
    try {
      if (fs.existsSync(LIBRARY_FILE)) {
        const raw = fs.readFileSync(LIBRARY_FILE, 'utf-8');
        this.items = JSON.parse(raw);
        console.log(`[FashionLibrary] Loaded ${this.items.length} items from ${LIBRARY_FILE}`);
        this.ensureCoreSeeds();
      } else {
        console.log('[FashionLibrary] Library file not found. Seeding from dataset directory...');
        this.seedFromDataset();
        this.saveLibrary();
      }
    } catch (err) {
      console.warn('[FashionLibrary] Error loading library file, seeding default:', err.message);
      this.seedFromDataset();
    }
  }

  ensureCoreSeeds() {
    const existingCodes = new Set(this.items.map(i => i.code));
    let hasNew = false;
    let modified = false;

    // Fix any existing items that had outer robe images assigned to innerwear
    for (const item of this.items) {
      if (item.code === 'INNER_001' && item.imageUrl && item.imageUrl.includes('VP_001')) {
        item.imageUrl = '/api/clothes/shirt.png';
        item.name = 'Áo Trung Lĩnh Cổ Đứng Trắng Ló Viền';
        modified = true;
      }
      if (item.code === 'INNER_003' && (!item.imageUrl || item.imageUrl.includes('viet_phuc_sample'))) {
        item.imageUrl = '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg';
        modified = true;
      }
    }

    const coreSeeds = [
      // Authentic Innerwear Seeds (Áo mặc bên trong: yếm, áo ba lỗ, áo cộc tay lót, áo cánh, trung lĩnh)
      {
        id: 'lib-inner-yem-lua',
        code: 'INNER_003',
        name: 'Áo Yếm Lụa Tơ Tằm Cổ Xây',
        nameNoAccent: 'ao yem lua to tam co xay',
        slot: 'innerwear',
        category: 'Nội Y Cổ Truyền',
        badge: '👑 Lụa Đào Duyên Dáng',
        imageUrl: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
        reason: 'Áo yếm lụa tơ tằm e ấp lót trong áo ngũ thân, tứ thân hoặc đối khâm, tạo nét duyên kín đáo chuẩn truyền thống.',
        clipScore: 98,
        source: 'heritage',
        usageCount: 15,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-ba-lo',
        code: 'INNER_005',
        name: 'Áo Ba Lỗ Lót Cotton Trắng (Tank Top / May-ô)',
        nameNoAccent: 'ao ba lo lot cotton trang tank top may o',
        slot: 'innerwear',
        category: 'Lớp Lót Hiện Đại Remix',
        badge: '⚡ Năng Động Thoáng Mát',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Áo ba lỗ cotton may-ô ôm nhẹ cơ thể, thấm hút mồ hôi tối ưu khi mặc lót trong áo tấc hoặc ngũ thân dạo phố.',
        clipScore: 96,
        source: 'modern',
        usageCount: 12,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-coc-tay',
        code: 'INNER_006',
        name: 'Áo Cộc Tay Lót Cotton Mỏng (Undershirt)',
        nameNoAccent: 'ao coc tay lot cotton mong undershirt',
        slot: 'innerwear',
        category: 'Lớp Lót Hiện Đại Remix',
        badge: '🌿 Mỏng Nhẹ Thấm Hút',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Áo thun cộc tay lót mỏng nhẹ cổ tròn/cổ tim, đóng vai trò lớp lót nền chuẩn xác bảo vệ áo cổ phục chính.',
        clipScore: 95,
        source: 'modern',
        usageCount: 11,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-yem-dao',
        code: 'INNER_007',
        name: 'Áo Yếm Đào Thêu Sen Cổ Truyền',
        nameNoAccent: 'ao yem dao theu sen co truyen',
        slot: 'innerwear',
        category: 'Nội Y Cổ Truyền',
        badge: '🌺 Đậm Đà Nữ Tính',
        imageUrl: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
        reason: 'Yếm đào thêu chỉ tơ sen mềm mại, lớp nội y trang nhã tôn vinh vẻ đẹp kín đáo của phụ nữ Việt.',
        clipScore: 97,
        source: 'heritage',
        usageCount: 10,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-trung-linh',
        code: 'INNER_001',
        name: 'Áo Trung Lĩnh Cổ Đứng Trắng Ló Viền',
        nameNoAccent: 'ao trung linh co dung trang lo vien',
        slot: 'innerwear',
        category: 'Lớp Lót Cổ Truyền',
        badge: '👑 Viền Cổ 1 Ly Chuẩn Y Lễ',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Áo lót trong cổ đứng ló viền trắng 1-2mm thanh nhã, giữ vững phong độ "Ngoại thâm nội bạch" chuẩn mực.',
        clipScore: 98,
        source: 'heritage',
        usageCount: 20,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-ho-canh',
        code: 'INNER_002',
        name: 'Áo Cánh Lót Phin Trắng Cổ Tròn',
        nameNoAccent: 'ao canh lot phin trang co tron',
        slot: 'innerwear',
        category: 'Lớp Lót Di Sản',
        badge: 'Bông Phin Tự Nhiên',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Chất vải bông phin đanh mịn thấm hút mồ hôi, bảo vệ tơ lụa áo chính và tạo độ đứng dáng tự nhiên.',
        clipScore: 95,
        source: 'heritage',
        usageCount: 8,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-camisole',
        code: 'INNER_008',
        name: 'Áo Hai Dây Lụa Camisole',
        nameNoAccent: 'ao hai day lua camisole',
        slot: 'innerwear',
        category: 'Lớp Lót Hiện Đại Remix',
        badge: 'Thoáng Nhẹ Nữ Tính',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Áo hai dây lụa satin mềm mịn, làm lớp lót trong mát dịu khi phối đồ cổ phục phong cách trẻ trung.',
        clipScore: 94,
        source: 'modern',
        usageCount: 7,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-giu-nhiet',
        code: 'INNER_004',
        name: 'Áo Cổ Lọ Giữ Nhiệt Cao Cấp',
        nameNoAccent: 'ao co lo giu nhiet cao cap',
        slot: 'innerwear',
        category: 'Hiện Đại Remix',
        badge: '❄️ Giữ Ấm Mùa Lạnh',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Lớp lót ôm sát cổ giữ ấm tuyệt đối trong mùa đông lạnh, tôn phom dáng hiện đại Neo-Heritage.',
        clipScore: 93,
        source: 'modern',
        usageCount: 6,
        lastSelectedAt: new Date().toISOString()
      },

      // Footwear Seeds
      {
        id: 'lib-foot-hai-theu-vang',
        code: 'FOOT_001',
        name: 'Hài Thêu Chỉ Vàng Cung Đình Mũi Cong',
        nameNoAccent: 'hai theu chi vang cung dinh mui cong',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: '👑 Hoàng Gia',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
        reason: 'Hài thêu gấm chỉ vàng mũi cong đài các, nâng bước đoan trang trong lễ phục cung đình.',
        clipScore: 98,
        source: 'heritage',
        usageCount: 9,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-guoc-moc-nhung',
        code: 'FOOT_002',
        name: 'Guốc Mộc Quai Nhung Đỏ Cổ Phong',
        nameNoAccent: 'guoc moc quai nhung do co phong',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Mộc Mạc',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_036_guoc_quai_nhung.jpg',
        reason: 'Guốc gỗ mộc tiếng gõ thanh tao, kết hợp quai nhung đỏ thắm trang nhã ngày xuân.',
        clipScore: 96,
        source: 'heritage',
        usageCount: 8,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-hai-gam-cuc',
        code: 'FOOT_003',
        name: 'Hài Gấm Thêu Hoa Cúc Xanh Ngọc',
        nameNoAccent: 'hai gam theu hoa cuc xanh ngoc',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Thơ Mộng',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
        reason: 'Hài gấm xanh ngọc thêu hoa cúc nền nã, tạo điểm nhấn màu sắc tinh tế cho tà áo ngũ thân.',
        clipScore: 96,
        source: 'heritage',
        usageCount: 7,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-dep-coi-xua',
        code: 'FOOT_004',
        name: 'Dép Cói Tự Nhiên Quai Thêu Gần Với Hài',
        nameNoAccent: 'dep coi tu nhien quai theu gan voi hai',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Nhã Nhặn',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_038_dep_coi_tu_nhien.jpg',
        reason: 'Dép cói mộc mạc quai thêu thanh tao, êm ái khi tản bộ dạo phố ngắm cảnh.',
        clipScore: 94,
        source: 'heritage',
        usageCount: 6,
        lastSelectedAt: new Date().toISOString()
      }
    ];

    for (const s of coreSeeds) {
      if (!existingCodes.has(s.code)) {
        this.items.push(s);
        hasNew = true;
      }
    }
    if (hasNew || modified) this.saveLibrary();
  }

  saveLibrary() {
    try {
      if (!fs.existsSync(DATASET_DIR)) {
        fs.mkdirSync(DATASET_DIR, { recursive: true });
      }
      fs.writeFileSync(LIBRARY_FILE, JSON.stringify(this.items, null, 2), 'utf-8');
      console.log(`[FashionLibrary] Saved ${this.items.length} items to library cache.`);
    } catch (err) {
      console.error('[FashionLibrary] Failed to write library cache:', err.message);
    }
  }

  seedFromDataset() {
    const seeded = [];
    const categoryMapping = {
      '01_ao_co_phuc': { slot: 'tops', defaultCategory: 'Áo Cổ Phục' },
      '02_quan_vay_co_phuc': { slot: 'bottoms', defaultCategory: 'Quần / Váy Cổ Phục' },
      '03_mu_non_khan_toc': { slot: 'headwear', defaultCategory: 'Mũ / Khăn / Nón' },
      '04_giay_dep_guoc': { slot: 'footwear', defaultCategory: 'Giày / Hài / Guốc' },
      '05_phu_kien_trang_suc': { slot: 'accessories', defaultCategory: 'Phụ Kiện / Trang Sức' },
      '06_trang_phuc_remix_streetwear': { slot: 'mixed', defaultCategory: 'Streetwear Remix' }
    };

    // Scan each dataset directory
    for (const [folder, meta] of Object.entries(categoryMapping)) {
      const folderPath = path.join(DATASET_DIR, folder);
      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

        const baseName = file.replace(/\.[^/.]+$/, '');
        const parts = baseName.split('_');
        const code = parts[0] + '_' + parts[1]; // e.g. VP_001
        const rawName = parts.slice(2).join(' '); // e.g. ao ngu than tay chen

        // Nicely title-case Vietnamese name
        const cleanName = rawName
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        let slot = meta.slot;
        if (slot === 'mixed') {
          const norm = removeVietnameseTones(cleanName);
          if (/quan|vay|short/i.test(norm)) slot = 'bottoms';
          else if (/ao|hoodie|bomber|blazer|mang to|croptop/i.test(norm)) slot = 'tops';
          else if (/giay|dep|sneaker/i.test(norm)) slot = 'footwear';
          else slot = 'accessories';
        }

        seeded.push({
          id: `lib-${code.toLowerCase()}`,
          code: code,
          name: cleanName,
          nameNoAccent: removeVietnameseTones(cleanName),
          slot: slot,
          category: meta.defaultCategory,
          badge: '✨ Kho Chuẩn',
          imageUrl: `/api/dataset/${folder}/${file}`,
          reason: `Trang phục chuẩn mực từ kho lưu trữ di sản và phong cách Việt Phục Remix.`,
          clipScore: 95,
          source: 'dataset',
          usageCount: 5,
          lastSelectedAt: new Date().toISOString()
        });
      }
    }

    // Seed innerwear items
    const innerwears = [
      {
        id: 'lib-inner-trung-linh',
        code: 'INNER_001',
        name: 'Áo Trung Lĩnh Cổ Đứng Trắng',
        nameNoAccent: 'ao trung linh co dung trang',
        slot: 'innerwear',
        category: 'Lớp Lót Cổ Truyền',
        badge: '👑 Chuẩn Y Lễ (Viền 1 Ly)',
        imageUrl: '/api/dataset/01_ao_co_phuc/VP_001_ao_ngu_than_nam.jpg',
        reason: 'Áo lót cổ đứng ló viền trắng 1-2mm thanh nhã, giữ vững phong độ "Ngoại thâm nội bạch" chuẩn mực triều Nguyễn.',
        clipScore: 98,
        source: 'heritage',
        usageCount: 10,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-ho-canh',
        code: 'INNER_002',
        name: 'Áo Cánh Lót Phin Trắng Cổ Tròn',
        nameNoAccent: 'ao canh lot phin trang co tron',
        slot: 'innerwear',
        category: 'Lớp Lót Di Sản',
        badge: 'Bông Phin Tự Nhiên',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Chất vải bông phin đanh mịn thấm hút mồ hôi, bảo vệ tơ lụa áo chính và tạo độ đứng dáng tự nhiên.',
        clipScore: 95,
        source: 'heritage',
        usageCount: 8,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-yem-lua',
        code: 'INNER_003',
        name: 'Áo Yếm Lụa Tơ Tằm Cổ Xây',
        nameNoAccent: 'ao yem lua to tam co xay',
        slot: 'innerwear',
        category: 'Nội Y Cổ Truyền',
        badge: 'Lụa Đào Duyên Dáng',
        imageUrl: '/api/clothes/viet_phuc_sample.jpg',
        reason: 'Yếm lụa đào e ấp lót trong áo tứ thân, giao lĩnh hoặc đối khâm, tạo nét duyên kín đáo duyên dáng.',
        clipScore: 96,
        source: 'heritage',
        usageCount: 7,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-inner-giu-nhiet',
        code: 'INNER_004',
        name: 'Áo Cổ Lọ Giữ Nhiệt Cao Cấp',
        nameNoAccent: 'ao co lo giu nhiet cao cap',
        slot: 'innerwear',
        category: 'Hiện Đại Remix',
        badge: '❄️ Giữ Ấm Mùa Lạnh',
        imageUrl: '/api/clothes/shirt.png',
        reason: 'Lớp lót ôm sát cổ giữ ấm tuyệt đối trong mùa đông lạnh, tôn phom dáng hiện đại Neo-Heritage.',
        clipScore: 93,
        source: 'modern',
        usageCount: 6,
        lastSelectedAt: new Date().toISOString()
      }
    ];

    // Seed authentic heritage footwear items
    const heritageFootwears = [
      {
        id: 'lib-foot-hai-theu-vang',
        code: 'FOOT_001',
        name: 'Hài Thêu Chỉ Vàng Cung Đình Mũi Cong',
        nameNoAccent: 'hai theu chi vang cung dinh mui cong',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: '👑 Hoàng Gia',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
        reason: 'Hài thêu gấm chỉ vàng mũi cong đài các, nâng bước đoan trang trong lễ phục cung đình.',
        clipScore: 98,
        source: 'heritage',
        usageCount: 9,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-guoc-moc-nhung',
        code: 'FOOT_002',
        name: 'Guốc Mộc Quai Nhung Đỏ Cổ Phong',
        nameNoAccent: 'guoc moc quai nhung do co phong',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Mộc Mạc',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_036_guoc_quai_nhung.jpg',
        reason: 'Guốc gỗ mộc tiếng gõ thanh tao, kết hợp quai nhung đỏ thắm trang nhã ngày xuân.',
        clipScore: 96,
        source: 'heritage',
        usageCount: 8,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-hai-gam-cuc',
        code: 'FOOT_003',
        name: 'Hài Gấm Thêu Hoa Cúc Xanh Ngọc',
        nameNoAccent: 'hai gam theu hoa cuc xanh ngoc',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Thơ Mộng',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
        reason: 'Hài gấm xanh ngọc thêu hoa cúc nền nã, tạo điểm nhấn màu sắc tinh tế cho tà áo ngũ thân.',
        clipScore: 96,
        source: 'heritage',
        usageCount: 7,
        lastSelectedAt: new Date().toISOString()
      },
      {
        id: 'lib-foot-dep-coi-xua',
        code: 'FOOT_004',
        name: 'Dép Cói Tự Nhiên Quai Thêu Gần Với Hài',
        nameNoAccent: 'dep coi tu nhien quai theu gan voi hai',
        slot: 'footwear',
        category: 'Giày / Hài / Guốc',
        badge: 'Nhã Nhặn',
        imageUrl: '/api/dataset/04_giay_dep_guoc/VP_038_dep_coi_tu_nhien.jpg',
        reason: 'Dép cói mộc mạc quai thêu thanh tao, êm ái khi tản bộ dạo phố ngắm cảnh.',
        clipScore: 94,
        source: 'heritage',
        usageCount: 6,
        lastSelectedAt: new Date().toISOString()
      }
    ];

    this.items = [...seeded, ...innerwears, ...heritageFootwears];
  }

  /**
   * Search Library by query, optional slot, and excludeTypes
   */
  searchLibrary(query = '', slot = null, excludeTypes = []) {
    let normalizedSlot = slot;
    if (normalizedSlot === 'top') normalizedSlot = 'tops';
    if (normalizedSlot === 'bottom') normalizedSlot = 'bottoms';
    if (normalizedSlot === 'accessory') normalizedSlot = 'accessories';
    if (normalizedSlot === 'inner_wear') normalizedSlot = 'innerwear';

    const qNorm = removeVietnameseTones(query);
    const excludeNorms = (Array.isArray(excludeTypes) ? excludeTypes : [])
      .map(e => removeVietnameseTones(String(e).trim()))
      .filter(Boolean);

    // If searching innerwear, automatically enforce strict exclusion of outer coats and outerwear
    if (normalizedSlot === 'innerwear') {
      const outerExcludes = [
        'ao khoac', 'khoac', 'blazer', 'bomber', 'biker', 'mang to', 'jacket',
        'cardigan', 'hoodie', 'doi kham', 'nhat binh', 'ao tac', 'coat', 'overcoat',
        'ao gio', 'parka', 'ao len day', 'vest'
      ];
      for (const oe of outerExcludes) {
        if (!excludeNorms.includes(oe)) excludeNorms.push(oe);
      }
    }

    const tokens = qNorm.split(/\s+/).filter(t => t.length > 1);

    const scored = this.items.map(item => {
      // Slot filter check
      if (normalizedSlot) {
        let itemSlot = item.slot;
        if (itemSlot === 'top') itemSlot = 'tops';
        if (itemSlot === 'bottom') itemSlot = 'bottoms';
        if (itemSlot === 'accessory') itemSlot = 'accessories';
        if (itemSlot === 'inner_wear') itemSlot = 'innerwear';
        if (itemSlot !== normalizedSlot) return { item, score: -1 };
      }

      const nameNorm = item.nameNoAccent || removeVietnameseTones(item.name);
      const catNorm = removeVietnameseTones(item.category || '');
      const comboNorm = `${nameNorm} ${catNorm}`;

      // Check explicit exclusion
      for (const ex of excludeNorms) {
        if (comboNorm.includes(ex)) {
          return { item, score: -1 };
        }
      }

      // If slot is innerwear, strictly reject any item that is an outer robe (ngũ thân, giao lĩnh, nhật bình, đối khâm)
      // unless it explicitly denotes an inner layer (áo lót, trung lĩnh, áo cánh lót)
      if (normalizedSlot === 'innerwear') {
        const isOuterRobe = /ngu than|giao linh|vien linh|nhat binh|doi kham|ao tac|ao dai/i.test(nameNorm);
        const isInnerLayer = /trung linh|canh|lot|yem|ba lo|may o|coc tay|undershirt|hai day|camisole/i.test(nameNorm);
        if (isOuterRobe && !isInnerLayer) {
          return { item, score: -1 };
        }
      }

      let score = 0;

      // Direct full match
      if (qNorm && nameNorm.includes(qNorm)) score += 60;

      // Semantic Subcategory Boosts (Innerwear & Heritage accuracy)
      if (normalizedSlot === 'innerwear') {
        if (nameNorm.includes('yem')) score += 50;
        if (nameNorm.includes('ba lo') || nameNorm.includes('may o') || nameNorm.includes('tank top')) score += 50;
        if (nameNorm.includes('coc tay') || nameNorm.includes('thun lot') || nameNorm.includes('undershirt')) score += 50;
        if (nameNorm.includes('trung linh')) score += 40;
        if (nameNorm.includes('canh lot') || nameNorm.includes('ao canh')) score += 40;
        if (nameNorm.includes('hai day') || nameNorm.includes('camisole')) score += 40;

        if (qNorm.includes('yem') && nameNorm.includes('yem')) score += 80;
        if ((qNorm.includes('ba lo') || qNorm.includes('may o') || qNorm.includes('tank top')) && 
            (nameNorm.includes('ba lo') || nameNorm.includes('may o') || nameNorm.includes('tank top'))) score += 80;
        if ((qNorm.includes('coc tay') || qNorm.includes('thun lot') || qNorm.includes('undershirt')) && 
            (nameNorm.includes('coc tay') || nameNorm.includes('thun lot') || nameNorm.includes('undershirt'))) score += 80;
        if (qNorm.includes('trung linh') && nameNorm.includes('trung linh')) score += 80;
        if (qNorm.includes('canh') && nameNorm.includes('canh')) score += 80;
        if ((qNorm.includes('hai day') || qNorm.includes('camisole')) && 
            (nameNorm.includes('hai day') || nameNorm.includes('camisole'))) score += 80;
      }

      // Semantic Footwear Boosts
      if (qNorm.includes('hai') && nameNorm.includes('hai')) score += 80;
      if (qNorm.includes('guoc') && nameNorm.includes('guoc')) score += 80;
      if (qNorm.includes('sneaker') && nameNorm.includes('sneaker')) score += 80;
      if (qNorm.includes('loafer') && nameNorm.includes('loafer')) score += 80;
      if (qNorm.includes('ngu than') && nameNorm.includes('ngu than')) score += 80;
      if (qNorm.includes('tac') && nameNorm.includes('tac')) score += 80;
      if (qNorm.includes('giao linh') && nameNorm.includes('giao linh')) score += 80;
      if (qNorm.includes('nhat binh') && nameNorm.includes('nhat binh')) score += 80;
      if (qNorm.includes('non la') && nameNorm.includes('non la')) score += 80;
      if (qNorm.includes('khan dong') && nameNorm.includes('khan dong')) score += 80;

      // Token matches
      for (const tok of tokens) {
        if (nameNorm.includes(tok)) score += 15;
        if (catNorm.includes(tok)) score += 8;
      }

      // Usage boost (self-enrichment weighting)
      score += Math.min(20, (item.usageCount || 0) * 2);

      return { item, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }

  /**
   * Upsert an item into Library Cache
   * Triggered when an item is recommended, clicked, or selected by the user.
   */
  saveOrUpdateItem(itemData = {}) {
    if (!itemData || !itemData.name) return null;

    const nameNorm = removeVietnameseTones(itemData.name);
    let existingIndex = this.items.findIndex(
      i => (itemData.code && i.code && i.code === itemData.code) ||
           (i.nameNoAccent && i.nameNoAccent === nameNorm) ||
           (i.id && i.id === itemData.id)
    );

    let normalizedSlot = itemData.slot || 'tops';
    if (normalizedSlot === 'top') normalizedSlot = 'tops';
    if (normalizedSlot === 'bottom') normalizedSlot = 'bottoms';
    if (normalizedSlot === 'accessory') normalizedSlot = 'accessories';
    if (normalizedSlot === 'inner_wear') normalizedSlot = 'innerwear';

    if (existingIndex >= 0) {
      // Update existing item
      const cur = this.items[existingIndex];
      cur.usageCount = (cur.usageCount || 0) + 1;
      cur.lastSelectedAt = new Date().toISOString();
      if (itemData.imageUrl && !cur.imageUrl.startsWith('http')) {
        cur.imageUrl = itemData.imageUrl;
      }
      if (itemData.reason) cur.reason = itemData.reason;
      if (itemData.clipScore) cur.clipScore = itemData.clipScore;
      this.saveLibrary();
      return cur;
    } else {
      // Insert new item discovered or uploaded
      const newItem = {
        id: itemData.id || `lib-dyn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        code: itemData.code || `DYN_${this.items.length + 1}`,
        name: itemData.name,
        nameNoAccent: nameNorm,
        slot: normalizedSlot,
        category: itemData.category || 'Phong Cách Đã Chọn',
        badge: itemData.badge || '⭐ Đã Lưu Thư Viện',
        imageUrl: itemData.imageUrl || itemData.url || '/api/clothes/viet_phuc_sample.jpg',
        reason: itemData.reason || 'Món đồ thời trang được AI tuyển chọn và bạn đã tin dùng.',
        clipScore: itemData.clipScore || 95,
        source: itemData.source || 'user_selected',
        usageCount: 1,
        lastSelectedAt: new Date().toISOString()
      };
      this.items.unshift(newItem); // put at top
      this.saveLibrary();
      return newItem;
    }
  }

  /**
   * Get top candidates for a slot with theme prioritization & excludeTypes
   */
  getSlotCandidates(slotType, userQuery = '', limit = 4, excludeTypes = []) {
    let normalizedSlot = slotType;
    if (normalizedSlot === 'top') normalizedSlot = 'tops';
    if (normalizedSlot === 'bottom') normalizedSlot = 'bottoms';
    if (normalizedSlot === 'accessory') normalizedSlot = 'accessories';
    if (normalizedSlot === 'inner_wear') normalizedSlot = 'innerwear';

    const mergedExcludes = [...(Array.isArray(excludeTypes) ? excludeTypes : [])];
    if (normalizedSlot === 'innerwear') {
      const outerExcludes = [
        'áo khoác', 'khoác', 'blazer', 'bomber', 'biker', 'măng tô', 'jacket',
        'cardigan', 'hoodie', 'đối khâm', 'nhật bình', 'áo tấc', 'coat', 'overcoat',
        'áo gió', 'parka', 'áo len dày'
      ];
      for (const oe of outerExcludes) {
        if (!mergedExcludes.includes(oe)) mergedExcludes.push(oe);
      }
    }

    const searchResults = this.searchLibrary(userQuery, normalizedSlot, mergedExcludes);

    if (searchResults.length >= limit) {
      return searchResults.slice(0, limit);
    }

    const excludeNorms = mergedExcludes
      .map(e => removeVietnameseTones(String(e).trim()))
      .filter(Boolean);

    // Fallback: fill up to limit with items in that slot NOT matching excludeTypes
    const allInSlot = this.items.filter(i => {
      let isSlot = i.slot;
      if (isSlot === 'top') isSlot = 'tops';
      if (isSlot === 'bottom') isSlot = 'bottoms';
      if (isSlot === 'accessory') isSlot = 'accessories';
      if (isSlot === 'inner_wear') isSlot = 'innerwear';
      if (isSlot !== normalizedSlot) return false;

      const comboNorm = removeVietnameseTones(`${i.name} ${i.category}`);
      if (excludeNorms.some(ex => comboNorm.includes(ex))) return false;

      if (normalizedSlot === 'innerwear') {
        const isOuterRobe = /ngu than|giao linh|vien linh|nhat binh|doi kham|ao tac|ao dai/i.test(comboNorm);
        const isInnerLayer = /trung linh|canh|lot|yem|ba lo|may o|coc tay|undershirt|hai day|camisole/i.test(comboNorm);
        if (isOuterRobe && !isInnerLayer) return false;
      }

      return true;
    });

    const existingIds = new Set(searchResults.map(i => i.id));
    for (const item of allInSlot) {
      if (searchResults.length >= limit) break;
      if (!existingIds.has(item.id)) {
        searchResults.push(item);
        existingIds.add(item.id);
      }
    }

    return searchResults.slice(0, limit);
  }

  /**
   * Delete an item from the library cache
   */
  deleteItem(id) {
    if (!id) return false;
    const initialLen = this.items.length;
    const idLower = String(id).toLowerCase();
    this.items = this.items.filter(i => {
      const matchId = i.id && String(i.id).toLowerCase() === idLower;
      const matchCode = i.code && String(i.code).toLowerCase() === idLower;
      return !matchId && !matchCode;
    });
    if (this.items.length !== initialLen) {
      this.saveLibrary();
      return true;
    }
    return false;
  }
}

export const fashionLibrary = new FashionLibrary();
