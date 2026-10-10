import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const KB_DIR = path.join(ROOT_DIR, 'knowledge_base');

/**
 * Remove Vietnamese accents for loose matching
 */
function removeAccents(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Helper to safely read a file if it exists.
 */
function safeReadFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      return '';
    }
  }
  return '';
}

/**
 * In-memory index of all Markdown knowledge files
 */
class KnowledgeIndex {
  constructor() {
    this.files = [];
    this.isLoaded = false;
    this.buildIndex();
  }

  buildIndex() {
    if (!fs.existsSync(KB_DIR)) {
      console.warn('[KnowledgeIndex] Directory not found:', KB_DIR);
      return;
    }

    const scanDir = (dir, category = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subCategory = category ? `${category}/${entry.name}` : entry.name;
          scanDir(fullPath, subCategory);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const relPath = path.relative(KB_DIR, fullPath).replace(/\\/g, '/');
          const slug = entry.name.replace(/\.md$/, '');
          const content = safeReadFile(fullPath);
          
          // Parse top # heading as title
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : slug;
          
          // Generate search tokens
          const tokens = new Set([
            ...removeAccents(slug).split(/[_ -]+/),
            ...removeAccents(title).split(/[\s,()\/]+/),
            ...removeAccents(category).split(/[\/_-]+/)
          ]);

          this.files.push({
            relPath,
            fullPath,
            category,
            slug,
            title,
            content,
            tokens: Array.from(tokens).filter(t => t.length > 1)
          });
        }
      }
    };

    this.files = [];
    scanDir(KB_DIR);
    this.isLoaded = true;
    console.log(`[KnowledgeIndex] Successfully indexed ${this.files.length} knowledge markdown files from knowledge_base/`);
  }

  /**
   * Search files matching a query or item name/slug
   */
  search(query = '', filterCategory = null) {
    if (!query) return [];
    const queryNorm = removeAccents(query);
    const queryTokens = queryNorm.split(/[\s,()_\-+/]+/).filter(t => t.length > 1);

    const scored = this.files
      .filter(f => !filterCategory || f.category.startsWith(filterCategory) || f.category === filterCategory)
      .map(file => {
        let score = 0;
        const fileNorm = removeAccents(file.slug + ' ' + file.title);
        
        // Exact slug or title match
        if (fileNorm.includes(queryNorm) || queryNorm.includes(file.slug)) {
          score += 100;
        }

        // Token matching
        for (const qt of queryTokens) {
          if (file.slug.includes(qt)) score += 35;
          if (file.tokens.includes(qt)) score += 20;
          if (fileNorm.includes(qt)) score += 15;
        }

        // Content snippet search
        if (score > 0 && removeAccents(file.content.slice(0, 500)).includes(queryNorm)) {
          score += 25;
        }

        return { file, score };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(s => s.file);
  }

  /**
   * Get file by exact relative path or slug
   */
  getFileBySlugOrPath(slugOrPath) {
    const clean = slugOrPath.replace(/\\/g, '/').replace(/\.md$/, '');
    return this.files.find(f => 
      f.relPath.replace(/\.md$/, '') === clean || 
      f.slug === clean || 
      path.basename(f.relPath, '.md') === clean
    ) || null;
  }
}

// Global Singleton Index
export const kbIndex = new KnowledgeIndex();

/**
 * Intelligent Knowledge Extractor for specific garments & layers
 */
export function findKnowledgeForGarment(garmentNameOrSlug, slotType = '') {
  if (!garmentNameOrSlug) return null;
  
  // Category hint based on slot
  let catHint = null;
  if (slotType === 'innerwear' || slotType === 'inner_wears') catHint = 'costumes/inner_wears';
  else if (slotType === 'top' || slotType === 'tops') catHint = 'costumes/tops';
  else if (slotType === 'bottom' || slotType === 'bottoms') catHint = 'costumes/bottoms';
  else if (slotType === 'headwear') catHint = 'costumes/headwear';
  else if (slotType === 'footwear') catHint = 'costumes/footwear';
  else if (slotType === 'accessory' || slotType === 'accessories' || slotType === 'jewelry') catHint = 'costumes';

  const matches = kbIndex.search(garmentNameOrSlug, catHint);
  if (matches.length > 0) {
    return matches[0];
  }

  // Fallback search across all costumes
  const fallback = kbIndex.search(garmentNameOrSlug, 'costumes');
  return fallback.length > 0 ? fallback[0] : null;
}

/**
 * Intelligent Knowledge Extractor for Occasions & Events
 */
export function findKnowledgeForOccasion(userText = '') {
  const norm = removeAccents(userText);
  if (norm.includes('chua') || norm.includes('den') || norm.includes('mieu') || norm.includes('tam linh')) {
    return kbIndex.getFileBySlugOrPath('occasions/di_chua');
  }
  if (norm.includes('tet') || norm.includes('xuan') || norm.includes('du xuan') || norm.includes('ho guom')) {
    return kbIndex.getFileBySlugOrPath('occasions/tet_nguyen_dan');
  }
  if (norm.includes('cuoi') || norm.includes('an hoi') || norm.includes('dam cuoi')) {
    return kbIndex.getFileBySlugOrPath('occasions/dam_cuoi_an_hoi');
  }
  if (norm.includes('ky yeu') || norm.includes('tot nghiep') || norm.includes('hoc sinh')) {
    return kbIndex.getFileBySlugOrPath('occasions/chup_ky_yeu_tot_nghiep');
  }
  if (norm.includes('nghe thuat') || norm.includes('trien lam') || norm.includes('su kien')) {
    return kbIndex.getFileBySlugOrPath('occasions/sukien_nghethuat');
  }
  if (norm.includes('gio to') || norm.includes('hung vuong')) {
    return kbIndex.getFileBySlugOrPath('occasions/gio_to_hung_vuong');
  }
  return kbIndex.getFileBySlugOrPath('occasions/daopho_caphe') || null;
}

/**
 * Core Styling Guides
 */
export function getLayeringRules() {
  const f = kbIndex.getFileBySlugOrPath('styling/layering_techniques');
  return f ? f.content : safeReadFile(path.join(KB_DIR, 'styling', 'layering_techniques.md'));
}

export function getRulesAndTaboos() {
  const f = kbIndex.getFileBySlugOrPath('styling/rules_and_taboos');
  return f ? f.content : safeReadFile(path.join(KB_DIR, 'styling', 'rules_and_taboos.md'));
}

export function getColorGuide() {
  const f = kbIndex.getFileBySlugOrPath('styling/color_guide');
  return f ? f.content : safeReadFile(path.join(KB_DIR, 'styling', 'color_guide.md'));
}

export function getFabricWeatherGuide() {
  const f = kbIndex.getFileBySlugOrPath('styling/fabric_weather_guide');
  return f ? f.content : safeReadFile(path.join(KB_DIR, 'styling', 'fabric_weather_guide.md'));
}

/**
 * Smart Knowledge Retriever:
 * Intelligently connects:
 * 1. Selected items (innerwear, top, bottom, headwear, footwear, accessories)
 * 2. Pairing & Layering rules (layering_techniques.md)
 * 3. Specific Occasion (occasions/*.md)
 * 4. Weather & Color Taboos (rules_and_taboos.md, color_guide.md)
 * 
 * Returns structured, high-signal rules directly derived from the knowledge files.
 */
export function smartRetrieveKnowledge(context = {}) {
  const {
    selectedItems = {},
    userPrompt = '',
    weather = '',
    occasion = '',
    styleVibe = ''
  } = context;

  const combinedSearchText = [
    userPrompt,
    weather,
    occasion,
    styleVibe
  ].join(' ');

  // 1. Resolve knowledge for each selected layer
  const layerKnowledgeSnippets = [];
  const resolvedFilesSet = new Set();

  const processItem = (item, slotType, slotLabel) => {
    if (!item || item.id === 'none' || item.id === 'head-none' || item.id === 'acc-none' || item.id === 'inner-none') return;
    const itemName = item.name || item.title || item.code || '';
    if (!itemName) return;

    const matchedFile = findKnowledgeForGarment(itemName, slotType);
    if (matchedFile && !resolvedFilesSet.has(matchedFile.relPath)) {
      resolvedFilesSet.add(matchedFile.relPath);
      // Extract key sections: Lịch sử, Đặc điểm nhận diện, Quy tắc sử dụng
      const excerpt = matchedFile.content.slice(0, 850).trim();
      layerKnowledgeSnippets.push(`[${slotLabel} - ${matchedFile.title}] (File: ${matchedFile.relPath}):\n${excerpt}`);
    } else {
      layerKnowledgeSnippets.push(`[${slotLabel}]: ${itemName}`);
    }
  };

  if (selectedItems) {
    if (selectedItems.innerwear) processItem(selectedItems.innerwear, 'innerwear', 'Lớp Trong / Innerwear');
    if (selectedItems.top) processItem(selectedItems.top, 'top', 'Áo Ngoài / Top');
    if (selectedItems.bottom) processItem(selectedItems.bottom, 'bottom', 'Quần/Xiêm / Bottom');
    if (selectedItems.headwear) processItem(selectedItems.headwear, 'headwear', 'Mũ/Khăn / Headwear');
    if (selectedItems.footwear) processItem(selectedItems.footwear, 'footwear', 'Giày/Hài / Footwear');
    
    // Process accessories (handles array or single object)
    if (Array.isArray(selectedItems.accessories)) {
      selectedItems.accessories.forEach((acc, idx) => {
        processItem(acc, 'accessory', `Phụ Kiện #${idx + 1}`);
      });
    } else if (selectedItems.accessory) {
      processItem(selectedItems.accessory, 'accessory', 'Phụ Kiện');
    }
  }

  // 2. Resolve Occasion Guideline
  const occasionFile = findKnowledgeForOccasion(combinedSearchText || occasion);
  const occasionSnippet = occasionFile 
    ? `Hoàn Cảnh (${occasionFile.title} - ${occasionFile.relPath}):\n${occasionFile.content.slice(0, 450).trim()}`
    : 'Hoàn cảnh tự nhiên, dạo phố văn hóa trang nhã.';

  // 3. Resolve Layering Technique
  const layeringContent = getLayeringRules();
  const layeringSnippet = layeringContent
    ? layeringContent.slice(0, 500).trim()
    : 'Tuân thủ triết lý xếp lớp Ngoại thâm nội bạch: Lớp áo trong hé lộ trang nhã dưới lớp áo ngoài.';

  // 4. Resolve Weather & Temperature
  const isCold = /lanh|se lanh|mua dong|ret|20 do|18 do|15 do|thoi tiet lanh/i.test(combinedSearchText);
  const isHot = /nong|mua he|oi buc|nang/i.test(combinedSearchText);
  let weatherGuidelines = 'Thời tiết mát mẻ (20°C - 25°C): Phù hợp đa dạng chất liệu truyền thống (lụa Hà Đông, sa cát, gấm nhẹ).';
  if (isCold) {
    weatherGuidelines = 'Thời tiết lạnh (< 20°C): Bắt buộc layer áo trong giữ nhiệt hoặc áo trung lĩnh + áo ngũ thân gấm dày dặn, tránh mặc trang phục mỏng lộ phong hàn.';
  } else if (isHot) {
    weatherGuidelines = 'Thời tiết nóng (> 28°C): Ưu tiên lụa sa cát, tơ tằm, đũi thoáng mát, phom suông rộng.';
  }

  // 5. Core Cultural Taboos
  const taboos = `
- QUY TẮC HỮU NHẬM: Áo Việt Nam cổ lập lĩnh và giao lĩnh quy chuẩn vạt trái đè vạt phải, cài khuy sang nách phải. TUYỆT ĐỐI CẤM tả nhậm (quấn vạt sang trái).
- THUẦN PHONG MỸ TỤC: Kín đáo, đoan trang. Nghiêm cấm hở hang, bikini, đồ bơi, nội y nơi tôn nghiêm hoặc không gian di sản.
- CẤU TRÚC 6 LỚP HÀI HÒA: Áo lót trong (Innerwear) phải có màu sắc và cổ áo hài hòa với Áo chính (Top), không gây cộm phom.`.trim();

  return `
=== QUY CHUẨN TRÍCH XUẤT TỰ ĐỘNG TỪ KNOWLEDGE_BASE ===
1. CHI TIẾT TỪNG MÓN ĐỒ ĐÃ CHỌN:
${layerKnowledgeSnippets.join('\n\n') || 'Không có mô tả chi tiết'}

2. NGHỆ THUẬT PHỐI NHIỀU LỚP (LAYERING TECHNIQUES):
${layeringSnippet}

3. HOÀN CẢNH & KHÔNG GIAN:
${occasionSnippet}

4. THỜI TIẾT & CHẤT LIỆU:
${weatherGuidelines}

5. ĐIỀU KIÊNG KỴ & QUY TẮC VĂN HÓA BẮT BUỘC:
${taboos}
======================================================
`.trim();
}

// ============================================================
// GARMENT SIGNAL MAP — Phát hiện loại trang phục từ prompt
// Dùng để định tuyến đúng file KB thay vì quét toàn bộ
// ============================================================
const GARMENT_SIGNAL_MAP = [
  // Footwear — Traditional
  { keywords: ['hai theu', 'giay hai', 'hia mang', 'giay co truyen', 'giay xua', 'giay co phuc', 'hai truyen thong'], category: 'costumes/footwear', slug: 'hai_theu', priority: 10 },
  { keywords: ['guoc moc', 'guoc go', 'guoc'], category: 'costumes/footwear', slug: 'guoc_moc', priority: 9 },
  { keywords: ['dep co so', 'dep co dien', 'dep xo'], category: 'costumes/footwear', slug: 'dep_co_so', priority: 8 },
  { keywords: ['xa cap', 'tat vai', 'xa phat'], category: 'costumes/footwear', slug: 'xa_cap_tat_vai', priority: 8 },
  // Footwear — Modern
  { keywords: ['sneaker', 'giay the thao'], category: 'costumes/footwear', slug: 'sneakers_chunky_canvas', priority: 7 },
  { keywords: ['mary jane', 'giay bup be'], category: 'costumes/footwear', slug: 'giay_mary_janes', priority: 7 },
  { keywords: ['loafer', 'giay luoi'], category: 'costumes/footwear', slug: 'giay_loafer_chunky', priority: 7 },
  { keywords: ['combat boot', 'boot co cao'], category: 'costumes/footwear', slug: 'combat_boots_da', priority: 7 },
  // Tops — Heritage
  { keywords: ['ao ngu than', 'ngu than', 'ngu than tay chen', 'ao ngu'], category: 'costumes/tops', slug: 'ao_ngu_than', priority: 10 },
  { keywords: ['ao tac', 'ao thung', 'ao le phuc'], category: 'costumes/tops', slug: 'ao_tac', priority: 10 },
  { keywords: ['ao giao linh', 'giao linh'], category: 'costumes/tops', slug: 'ao_giao_linh', priority: 10 },
  { keywords: ['ao nhat binh', 'nhat binh', 'ao hoang hau'], category: 'costumes/tops', slug: 'ao_nhat_binh', priority: 10 },
  { keywords: ['ao tu than', 'tu than'], category: 'costumes/tops', slug: 'ao_tu_than', priority: 10 },
  { keywords: ['ao ba ba'], category: 'costumes/tops', slug: 'ao_ba_ba', priority: 9 },
  { keywords: ['ao dai nu', 'ao dai truyen thong'], category: 'costumes/tops', slug: 'ao_dai_nu', priority: 10 },
  { keywords: ['ao the', 'ao the nam', 'ao canh'], category: 'costumes/tops', slug: 'ao_the', priority: 9 },
  // Headwear
  { keywords: ['non la', 'non bai tho', 'non truyen thong'], category: 'costumes/headwear', slug: 'non_la_truyen_thong', priority: 10 },
  { keywords: ['non quai thao', 'non ba tam'], category: 'costumes/headwear', slug: 'non_quai_thao_ba_tam', priority: 9 },
  { keywords: ['khan dong', 'khan xep', 'khan van day'], category: 'costumes/headwear', slug: 'khan_dong_khan_xep', priority: 9 },
  { keywords: ['khan mo qua'], category: 'costumes/headwear', slug: 'khan_mo_qua', priority: 9 },
  { keywords: ['mu phoc dau', 'dinh tu', 'can doi'], category: 'costumes/headwear', slug: 'mu_phoc_dau_dinh_tu', priority: 9 },
  { keywords: ['non dau mau', 'mau'], category: 'costumes/headwear', slug: 'non_dau_mau', priority: 8 },
  // Bottoms
  { keywords: ['quan lua', 'quan to tam', 'quan trang lua'], category: 'costumes/bottoms', slug: 'quan_lua_trang', priority: 9 },
  { keywords: ['kho loi', 'quan kho'], category: 'costumes/bottoms', slug: 'kho_loi', priority: 9 },
  { keywords: ['thuong xiem', 'xiem y', 'xiêm y'], category: 'costumes/bottoms', slug: 'thuong_xiem', priority: 9 },
  { keywords: ['vay dup', 'vay la'], category: 'costumes/bottoms', slug: 'vay_dup', priority: 9 },
  // Innerwear
  { keywords: ['ao trung linh', 'trung linh', 'ao lot co dung'], category: 'costumes/inner_wears', slug: 'ao_trung_linh', priority: 10 },
  { keywords: ['ao yem', 'yem dao', 'yem co xay'], category: 'costumes/inner_wears', slug: 'ao_yem', priority: 9 },
  // Accessories
  { keywords: ['quat lua', 'quat cam tay'], category: 'costumes/accessories', slug: 'quat_cam_tay', priority: 9 },
  { keywords: ['ngoc boi', 'the bai', 'kim khanh'], category: 'costumes/accessories', slug: 'ngoc_boi', priority: 9 },
];

/**
 * Detect specific garment types mentioned in prompt → Route to correct KB file
 * Returns array of { keyword, category, priority } for targeted KB loading
 */
export function detectGarmentSignals(normQuery = '') {
  const signals = [];
  const seen = new Set();

  for (const g of GARMENT_SIGNAL_MAP) {
    if (g.keywords.some(kw => normQuery.includes(kw))) {
      if (!seen.has(g.slug)) {
        seen.add(g.slug);
        signals.push({ keyword: g.slug, category: g.category, priority: g.priority });
      }
    }
  }

  // Sort by priority descending
  return signals.sort((a, b) => b.priority - a.priority);
}

/**
 * Build rich RAG Context — Smart Router Version (v2)
 * Does NOT scan all 128 files — routes intelligently to 2-4 relevant files.
 */
export function buildRagKnowledgeContext(userQuery = '', maxLen = 2500) {
  const norm = removeAccents(typeof userQuery === 'string' ? userQuery : String(userQuery || ''));
  const sections = [];
  const loadedSlugs = new Set();

  // ── 1. OCCASION ROUTING ──────────────────────────────────────────────────
  // Load exactly 1 occasion file — no full scan
  const occFile = findKnowledgeForOccasion(userQuery);
  if (occFile && !loadedSlugs.has(occFile.slug)) {
    loadedSlugs.add(occFile.slug);
    sections.push({ priority: 10, label: `HOÀN CẢNH — ${occFile.title}`, content: occFile.content.slice(0, 900) });
  }

  // ── 2. GARMENT ROUTING ──────────────────────────────────────────────────
  // Detect specific garments mentioned → load their dedicated KB files
  const garmentSignals = detectGarmentSignals(norm);
  for (const signal of garmentSignals.slice(0, 3)) {  // max 3 garment files
    const matchFile = kbIndex.search(signal.keyword, signal.category).slice(0, 1)[0]
      || kbIndex.getFileBySlugOrPath(`${signal.category}/${signal.slug}`);
    if (matchFile && !loadedSlugs.has(matchFile.slug)) {
      loadedSlugs.add(matchFile.slug);
      sections.push({ priority: signal.priority, label: `TRANG PHỤC — ${matchFile.title}`, content: matchFile.content.slice(0, 750) });
    }
  }

  // ── 3. STYLE ROUTING ─────────────────────────────────────────────────────
  // Only load style guides when relevant keywords appear
  if (/remix|streetwear|casual|hien dai|gen z|pha cach|modern/.test(norm)) {
    const remixGuide = kbIndex.getFileBySlugOrPath('styling/remix_modern_guide');
    if (remixGuide && !loadedSlugs.has(remixGuide.slug)) {
      loadedSlugs.add(remixGuide.slug);
      sections.push({ priority: 7, label: 'PHONG CÁCH REMIX', content: remixGuide.content.slice(0, 650) });
    }
  }

  // ── 4. LAYERING ───────────────────────────────────────────────────────────
  // Load layering rules only when explicitly mentioned, or as compact fallback
  if (/layering|xep lop|nhieu lop|trong ngoai|layer/.test(norm) || sections.length < 2) {
    const layering = kbIndex.getFileBySlugOrPath('styling/layering_techniques');
    if (layering && !loadedSlugs.has(layering.slug)) {
      loadedSlugs.add(layering.slug);
      const layerLen = sections.length >= 3 ? 400 : 700;  // compact if already have content
      sections.push({ priority: 6, label: 'KỸ THUẬT PHỐI LỚP', content: layering.content.slice(0, layerLen) });
    }
  }

  // ── 5. TABOOS ────────────────────────────────────────────────────────────
  // Only load when cultural/temple/wedding context detected
  if (/chua|den|le hoi|cuoi|kien|cam|tuyen|tam linh|le tet/.test(norm)) {
    const taboos = kbIndex.getFileBySlugOrPath('styling/rules_and_taboos');
    if (taboos && !loadedSlugs.has(taboos.slug)) {
      loadedSlugs.add(taboos.slug);
      sections.push({ priority: 9, label: 'QUY TẮC & ĐIỀU KIÊNG KỴ', content: taboos.content.slice(0, 500) });
    }
  }

  // ── 6. COLOR GUIDE ───────────────────────────────────────────────────────
  if (/mau sac|phoi mau|mau ao|phong thuy|menh/.test(norm)) {
    const color = kbIndex.getFileBySlugOrPath('styling/color_guide');
    if (color && !loadedSlugs.has(color.slug)) {
      loadedSlugs.add(color.slug);
      sections.push({ priority: 5, label: 'BẢNG PHỐI MÀU', content: color.content.slice(0, 500) });
    }
  }

  // ── 7. BODY TYPE / WEATHER ───────────────────────────────────────────────
  if (/dang nguoi|body type|nong|lanh|thoi tiet|mua dong|mua he/.test(norm)) {
    const weatherFile = kbIndex.getFileBySlugOrPath('styling/fabric_weather_guide');
    if (weatherFile && !loadedSlugs.has(weatherFile.slug)) {
      loadedSlugs.add(weatherFile.slug);
      sections.push({ priority: 6, label: 'THỜI TIẾT & CHẤT LIỆU', content: weatherFile.content.slice(0, 500) });
    }
  }

  // Sort by priority, build output
  sections.sort((a, b) => b.priority - a.priority);
  const result = sections.map(s => `### ${s.label}:\n${s.content}`).join('\n\n---\n\n');
  return result.slice(0, maxLen);
}

export function buildGuardrailKnowledge(context = {}) {
  return smartRetrieveKnowledge(context);
}
