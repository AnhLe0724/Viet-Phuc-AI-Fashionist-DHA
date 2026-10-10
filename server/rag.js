import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { loadKeywords, removeVietnameseTones } from './keywords.js';
import { loadMetadata, crawlForSlot, fetchSlotCandidatesInternetFirst, evaluateCandidatesWithCLIP, mergeWithDiversity, searchExactCostumeImages } from './crawler.js';
import { buildRagKnowledgeContext } from './knowledge_loader.js';
import { fashionLibrary } from './fashion_library.js';
import { loadHeritageStylingRules } from './styling_rules_loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const API_CONFIG_PATH = path.join(ROOT_DIR, 'src', 'knowledge', 'api.txt');

// 1. Read and parse API config from api.txt (supports 'text' and 'image' types)
export function getApiConfig(type = 'text') {
  if (!fs.existsSync(API_CONFIG_PATH)) {
    throw new Error(`File config API không tồn tại: ${API_CONFIG_PATH}`);
  }

  const content = fs.readFileSync(API_CONFIG_PATH, 'utf-8');
  const sections = content.split(/(?=API\s+(?:Text|Image)\s+To\s+(?:Text|Image))/i);

  let targetSection = '';
  if (type === 'image') {
    targetSection = sections.find(s => /Image\s+To\s+Image/i.test(s)) || '';
  } else {
    targetSection = sections.find(s => /Text\s+To\s+Text/i.test(s)) || sections[0] || '';
  }

  const lines = targetSection.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let model = type === 'image' ? 'veo/gemini-3.0-pro-image' : 'ram/gemini-3.6-flash-high';
  let baseUrl = 'https://api.vilao.ai/v1';
  let apiKey = type === 'image' 
    ? 'sk-ae9effb5a2ce8b274e72df27443de5391c9349e14fa3acccedd6edbeea2eb91f' 
    : 'sk-0d96f175cdea67f6a9baeec9e4f1c54aedd2cba422245735b507f946d994fcea';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('tên model:') || lower.startsWith('model:')) {
      model = line.split(':')[1].trim();
    } else if (lower.startsWith('base url:') || lower.startsWith('url:')) {
      baseUrl = line.split(/base url:\s*/i)[1]?.trim() || line.split(/url:\s*/i)[1]?.trim() || baseUrl;
    } else if (lower.startsWith('api key:') || lower.startsWith('key:')) {
      apiKey = line.split(/api key:\s*/i)[1]?.trim() || line.split(/key:\s*/i)[1]?.trim() || apiKey;
    }
  }

  return { model, baseUrl, apiKey };
}

// 2. Load the full styling guide knowledge completely from Knowledge Base
export function getKnowledgeBase() {
  try {
    const rulesData = loadHeritageStylingRules();
    return rulesData.consolidatedMarkdown || 'Tài liệu cẩm nang phối đồ Cổ phục Việt Nam di sản.';
  } catch (err) {
    return 'Tài liệu hướng dẫn phối đồ Cổ phục Việt Nam và trang phục hiện đại.';
  }
}

// 3. Retrieve relevant knowledge chunks based on user query
export function retrieveRelevantKnowledge(userQuery, fullKnowledge) {
  const queryStr = typeof userQuery === 'string' ? userQuery : (userQuery?.text || userQuery?.userPrompt || userQuery?.message || String(userQuery || ''));
  const queryNoAccent = removeVietnameseTones(queryStr.toLowerCase());
  const tokens = queryNoAccent.split(/\s+/).filter(t => t.length > 2);

  const sections = fullKnowledge.split(/(?=^#+\s)/m);
  const scoredSections = [];

  for (const sec of sections) {
    const secNoAccent = removeVietnameseTones(sec.toLowerCase());
    let score = 0;

    for (const token of tokens) {
      if (secNoAccent.includes(token)) {
        score += 10;
      }
    }

    // Specific context boosts
    if ((queryNoAccent.includes('di choi') || queryNoAccent.includes('dao pho') || queryNoAccent.includes('di chuyen')) && 
        (secNoAccent.includes('dạo phố') || secNoAccent.includes('đời thường') || secNoAccent.includes('gen z') || secNoAccent.includes('sneaker') || secNoAccent.includes('tay chẽn') || secNoAccent.includes('bà ba'))) {
      score += 25;
    }
    if ((queryNoAccent.includes('di hoc') || queryNoAccent.includes('hoc sinh')) && secNoAccent.includes('học sinh')) {
      score += 25;
    }
    if ((queryNoAccent.includes('le hoi') || queryNoAccent.includes('su kien') || queryNoAccent.includes('tet') || queryNoAccent.includes('chup anh')) && 
        (secNoAccent.includes('lễ') || secNoAccent.includes('tết') || secNoAccent.includes('chụp ảnh') || secNoAccent.includes('sự kiện'))) {
      score += 25;
    }
    if ((queryNoAccent.includes('cao') || queryNoAccent.includes('thap') || queryNoAccent.includes('gay') || queryNoAccent.includes('tron')) && 
        (secNoAccent.includes('dáng') || secNoAccent.includes('chiều cao') || secNoAccent.includes('thể trạng'))) {
      score += 30;
    }

    scoredSections.push({ text: sec.trim(), score });
  }

  scoredSections.sort((a, b) => b.score - a.score);

  // Pick top 3 most relevant sections
  const topSections = scoredSections.slice(0, 3).filter(s => s.score > 0).map(s => s.text);
  
  if (topSections.length === 0) {
    // Return first 2200 chars as general overview
    return fullKnowledge.slice(0, 2200);
  }

  return topSections.join('\n\n---\n\n');
}

// 4. Get available dataset items with images
export function getAvailableDatasetCatalog() {
  const keywords = loadKeywords();
  const metadata = loadMetadata();

  const catalog = keywords.map(kw => {
    const saved = metadata[kw.code];
    let imageUrl = null;
    let isSavedLocal = false;

    const localRelPath = saved ? path.join(ROOT_DIR, 'dataset', kw.category.id, saved.filename) : null;
    if (saved && ((localRelPath && fs.existsSync(localRelPath)) || (saved.fullPath && fs.existsSync(saved.fullPath)))) {
      imageUrl = `/api/dataset/${kw.category.id}/${saved.filename}`;
      isSavedLocal = true;
    } else if (kw.candidates && kw.candidates.length > 0) {
      imageUrl = kw.candidates[0].thumbnail || kw.candidates[0].url;
    }

    return {
      id: kw.id,
      code: kw.code,
      name: kw.withAccent,
      nameNoAccent: kw.withoutAccent,
      category: kw.category.id,
      categoryName: kw.category.nameVi,
      imageUrl: imageUrl,
      isSavedLocal: isSavedLocal
    };
  });

  return catalog;
}

// 4.5 Build Curated Exactly 4 Candidate Slots per Category using Internet-First Multi-Query Search & Max 1 Local Anchor
export async function buildMultiCandidateSlots(userQuery = '', catalog = [], aiRecommendedItems = []) {
  const queryNoAccent = removeVietnameseTones(userQuery.toLowerCase());

  // Helper: map slot to candidate format
  const formatLibItemToCandidate = (item, isAiRecommended = false) => ({
    id: isAiRecommended ? `cand-ai-${item.slot}-${Date.now()}` : item.id,
    code: item.code || `LIB_${(item.slot || 'item').toUpperCase()}`,
    name: item.name,
    category: item.category || 'Việt Phục',
    badge: isAiRecommended ? '👑 AI Khuyên Dùng #1' : (item.badge || '✨ Kho Di Sản'),
    url: item.imageUrl || item.url || '/api/clothes/viet_phuc_sample.jpg',
    thumbnail: item.thumbnail || item.imageUrl || item.url || '/api/clothes/viet_phuc_sample.jpg',
    reason: item.reason || 'Món đồ chuẩn mực từ kho lưu trữ di sản.',
    clipScore: isAiRecommended ? 98 : (item.clipScore || 95),
    promptPart: `${item.nameNoAccent || item.name} fashion garment`
  });

  // Slot keys: innerwear, tops, bottoms, headwear, footwear, accessories
  const slots = ['innerwear', 'tops', 'bottoms', 'headwear', 'footwear', 'accessories'];
  const result = {};

  // Fetch all 6 slots in parallel for sub-second response speed
  await Promise.all(slots.map(async (slotKey) => {
    const singularKey = slotKey === 'tops' ? 'top' : slotKey === 'bottoms' ? 'bottom' : slotKey === 'accessories' ? 'accessory' : slotKey;

    // 1. Get AI recommendation for this slot
    const recItem = aiRecommendedItems.find(i => 
      i.slot === singularKey || 
      (singularKey === 'accessory' && (i.slot === 'accessory' || i.slot === 'layer')) ||
      (singularKey === 'innerwear' && (i.slot === 'innerwear' || i.slot === 'inner_wear'))
    );
    const targetSubcat = recItem?.targetSubcategory || recItem?.name || '';
    const excludeKeywords = [
      ...(Array.isArray(recItem?.excludeKeywords) ? recItem.excludeKeywords : []),
      ...(Array.isArray(recItem?.excludeTypes) ? recItem.excludeTypes : [])
    ];

    if (singularKey === 'innerwear') {
      const innerExcludes = [
        'áo khoác', 'khoác', 'áo khoác dạ', 'blazer', 'bomber', 'biker', 'măng tô',
        'jacket', 'cardigan', 'hoodie', 'áo đối khâm', 'đối khâm', 'nhật bình', 'áo tấc'
      ];
      innerExcludes.forEach(ex => {
        if (!excludeKeywords.includes(ex)) excludeKeywords.push(ex);
      });
    }

    const candidatePool = [];
    const seenNames = new Set();
    const seenUrls = new Set();

    // 2. ƯU TIÊN TRA CỨU ẢNH TRANG PHỤC THỰC TẾ TỪ WEB THEO KNOWLEDGE BASE
    try {
      const searchQuery = recItem?.searchHints?.[0] || targetSubcat || userQuery;
      const webMatches = await searchExactCostumeImages(searchQuery, singularKey, 3);
      for (const c of webMatches) {
        const normName = removeVietnameseTones(c.name || '');
        const cleanUrl = (c.url || '').split('?')[0].toLowerCase();
        if (!seenNames.has(normName) && !seenUrls.has(cleanUrl) && c.url) {
          seenNames.add(normName);
          seenUrls.add(cleanUrl);
          candidatePool.push({
            id: `cand-web-${singularKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            code: `WEB_${singularKey.toUpperCase()}`,
            name: c.name,
            category: c.category || '🌐 Web Search',
            badge: c.badge || '🌐 Trực Tuyến',
            url: c.url,
            thumbnail: c.thumbnail || c.url,
            reason: `Hình ảnh tra cứu tự động từ Web dựa trên tri thức di sản.`,
            clipScore: c.clipScore || 90,
            promptPart: `${c.name} authentic traditional look`
          });
        }
      }
    } catch (err) {
      console.warn(`[Fast web candidates error for ${slotKey}]:`, err.message);
    }

    // 3. Dự phòng & Bổ sung từ Fashion Library / Dataset nếu còn chỗ trống
    if (candidatePool.length < 4) {
      const libCandidates = fashionLibrary.getSlotCandidates(singularKey, targetSubcat || userQuery, 4 - candidatePool.length, excludeKeywords);
      for (const libIt of libCandidates) {
        const formatted = formatLibItemToCandidate(libIt, false);
        const nName = removeVietnameseTones(formatted.name);
        if (!seenNames.has(nName)) {
          seenNames.add(nName);
          candidatePool.push(formatted);
        }
      }
    }

    // 4. Món AI gợi ý #1 đưa lên vị trí danh dự đầu tiên
    let topAiItem = null;
    if (recItem && recItem.name) {
      const bestImgUrl = recItem.imageUrl || candidatePool[0]?.url || '/api/clothes/viet_phuc_sample.jpg';
      topAiItem = {
        id: `cand-ai-${slotKey}-${Date.now()}`,
        code: recItem.code || `REC_${singularKey.toUpperCase()}`,
        name: recItem.name,
        category: recItem.categoryName || (candidatePool[0]?.category || 'AI Tuyển Chọn'),
        badge: '👑 AI Khuyên Dùng #1',
        url: bestImgUrl,
        thumbnail: recItem.thumbnail || bestImgUrl,
        reason: recItem.reason || 'Lựa chọn chuẩn mực và sắc sảo nhất cho concept bạn mong muốn.',
        clipScore: 98,
        promptPart: `${recItem.name} detailed aesthetic garment`
      };
      seenNames.add(removeVietnameseTones(recItem.name));
    }

    // 5. Kết hợp
    const combinedPool = [...candidatePool];

    let diverseFinal = [];
    if (topAiItem) {
      const restPool = combinedPool.filter(c => removeVietnameseTones(c.name) !== removeVietnameseTones(topAiItem.name));
      diverseFinal = [topAiItem, ...restPool.slice(0, 3)];
    } else {
      diverseFinal = combinedPool.slice(0, 4);
    }

    // 6. Fallback đảm bảo đủ items
    if (diverseFinal.length < 4) {
      const extraLib = fashionLibrary.getSlotCandidates(singularKey, '', 4, excludeKeywords);
      for (const ex of extraLib) {
        if (diverseFinal.length >= 4) break;
        const nName = removeVietnameseTones(ex.name);
        if (!seenNames.has(nName)) {
          diverseFinal.push(formatLibItemToCandidate(ex, false));
          seenNames.add(nName);
        }
      }
    }

    result[slotKey] = diverseFinal.slice(0, 4);
  }));

  return result;
}

// 5. Main RAG Chatbot Service
export async function generateOutfitRecommendation(userMessage, conversationHistory = []) {
  const { model, baseUrl, apiKey } = getApiConfig();
  const fullKnowledge = getKnowledgeBase();
  const baseKnowledge = retrieveRelevantKnowledge(userMessage, fullKnowledge);
  const dynamicKb = buildRagKnowledgeContext(userMessage);
  const relevantKnowledge = `${baseKnowledge}\n\n---\n\n${dynamicKb}`;
  const catalog = getAvailableDatasetCatalog();

  // Create a structured list of available items in dataset for the AI to choose from
  const datasetItemNames = catalog.map(item => `[${item.code}] ${item.name} (${item.categoryName})`).join('\n');

  const systemPrompt = `Bạn là Chuyên gia Tư vấn Phối đồ & Haute Couture Stylist của hệ thống "VIỆT PHỤC REMIX".
Nhiệm vụ của bạn là tư vấn phối trang phục Cổ phục truyền thống Việt Nam kết hợp phong cách hiện đại (Remix/Streetwear/Casual) dựa trên hoàn cảnh, thể trạng và gu thẩm mỹ của người dùng.

PHONG CÁCH GIAO TIẾP & CẤU TRÚC PHẢN HỒI (BẮT BUỘC):
Hãy trò chuyện bằng Tiếng Việt với phong cách của một Haute Couture Fashion Stylist cao cấp: duyên dáng, gần gũi, tinh tế, tràn đầy cảm hứng và am hiểu sâu sắc về di sản kết hợp thời trang đương đại.
1. 👘 Lời chào & Phân tích phối đồ: Luôn mở đầu bằng lời chào ấm áp, trực tiếp đề cập đến hoàn cảnh người dùng hỏi (dạo phố, lễ tết, cafe, chụp ảnh cá tính...), phân tích vì sao bản phối này tạo nên sự cân bằng hoàn mỹ giữa nét trang trọng của Cổ phục và sự năng động, thời thượng của các món đồ hiện đại.
2. ✨ Điểm nhấn các lớp phục trang (6 Lớp): Giới thiệu cách phối 6 lớp (Lớp lót trong / Innerwear, Áo ngoài, Quần/Váy, Mũ/Khăn, Giày/Dép, Phụ kiện) sao cho tôn dáng và thoải mái.
3. 📸 Mẹo tạo dáng & Thần thái: Gợi ý 1-2 mẹo tạo dáng, góc máy hoặc thần thái khi chụp ảnh để người mặc tự tin và nổi bật nhất.

QUY TẮC RAG BẮT BUỘC:
- Tận dụng sâu sắc tài liệu cẩm nang phối đồ và các quy chuẩn di sản trích xuất từ Knowledge Base (Kỹ thuật Layering xếp lớp, Triết lý "Ngoại thâm nội bạch", Áo Trung Lĩnh, Áo Cánh Lót, quy chuẩn Hữu Nhậm, phối màu di sản, thích ứng thời tiết và hoàn cảnh sự kiện).
- KHÔNG BỊ RÀNG BUỘC CỨNG NHẮC theo danh mục thư viện nội bộ: Bạn hoàn toàn tự do sáng tạo, đề xuất những mẫu trang phục và phụ kiện chân thực, chuẩn xác nhất theo Knowledge Base. Hệ thống sẽ tự động ưu tiên tìm kiếm và đối chiếu ảnh phục trang thực tế trên Web theo từng món đồ bạn đề xuất.
- QUY TẮC ĐẶC BIỆT CHO LỚP MẶC TRONG (slot: "innerwear"): Đây là các loại áo mặc lót bên trong (Áo Yếm lụa/yếm đào, Áo Ba Lỗ cotton/may-ô/tank top lót trong, Áo Cộc Tay Lót cotton mỏng/undershirt, Áo Cánh Lót phin trắng, Áo Trung Lĩnh lót cổ đứng ló viền, Áo Hai Dây Lụa Camisole). TUYỆT ĐỐI KHÔNG chọn áo khoác, blazer, bomber, măng tô, áo đối khâm, áo tấc, áo dài hay áo ngoài cho slot innerwear.
- TUYỆT ĐỐI KHÔNG phán quẻ bói toán, KHÔNG nói chuyện mê tín phong thủy rườm rà. KHÔNG xuất thẻ \`\`\`color_palettes\`\`\`.

ĐÍNH KÈM DUY NHẤT MỘT KHỐI JSON nằm trong thẻ \`\`\`json ... \`\`\` với đầy đủ 6 lớp trang phục và thông số semantic search:
\`\`\`json
{
  "outfitTitle": "Tên bộ trang phục ấn tượng",
  "styleVibe": "Tên phong cách (VD: Di Sản Cung Đình Tết, Dạo Phố Cà Phê, Tân Cổ Giao Duyên...)",
  "recommendedItems": [
    {
      "slot": "innerwear",
      "name": "Áo Yếm Lụa Tơ Tằm Cổ Xây",
      "targetSubcategory": "áo yếm lụa cổ phục",
      "searchHints": ["áo yếm lụa truyền thống", "áo yếm cổ phục việt nam", "áo ba lỗ lót trong", "áo cộc tay lót cotton"],
      "diversityHints": ["yếm lụa đào", "yếm lụa tơ tằm trắng", "áo ba lỗ cotton ôm", "áo cộc tay lót mỏng"],
      "excludeTypes": ["áo khoác", "blazer", "bomber", "măng tô", "jacket", "cardigan", "hoodie", "áo đối khâm", "áo tấc", "áo dài"],
      "reason": "Lớp lót trong e ấp, tinh tế chuẩn mực y phục truyền thống Việt"
    },
    {
      "slot": "top",
      "name": "Áo dài ngũ thân tay chẽn gấm tơ tằm",
      "targetSubcategory": "áo ngũ thân tay chẽn",
      "searchHints": ["áo dài ngũ thân tay chẽn", "áo tấc lễ phục", "áo ngũ thân gấm"],
      "diversityHints": ["màu đỏ hoàng gia", "màu vàng hoa cúc", "màu xanh lục nhung", "màu lam gấm"],
      "excludeTypes": ["sườn xám", "hán phục", "áo khoác da", "áo phông"],
      "reason": "Phom áo tôn dáng, gấm hoa văn sang trọng"
    },
    {
      "slot": "bottom",
      "name": "Quần lụa ống suông trắng ngà",
      "targetSubcategory": "quần lụa ống suông truyền thống",
      "searchHints": ["quần lụa trắng cổ phục", "quần la toà ống rộng"],
      "diversityHints": ["màu trắng ngà", "màu đen huyền sa lụa", "màu kem"],
      "excludeTypes": ["quần đùi", "váy ngắn", "quần rách", "legging ôm"],
      "reason": "Chất lụa bay bổng trang nhã"
    },
    {
      "slot": "headwear",
      "name": "Nón lá truyền thống bài thơ",
      "targetSubcategory": "nón lá truyền thống",
      "searchHints": ["nón lá huế bài thơ", "nón lá truyền thống việt nam"],
      "diversityHints": ["nón lá chằm chỉ", "khăn đóng đen gấm", "khăn vành dây"],
      "excludeTypes": ["mũ lưỡi trai", "mũ len snapback", "mũ bảo hiểm"],
      "reason": "Tạo nét duyên dáng đằm thắm"
    },
    {
      "slot": "footwear",
      "name": "Hài thêu hoa sen cổ truyền",
      "targetSubcategory": "hài thêu truyền thống",
      "searchHints": ["hài thêu hoa sen cổ phục", "guốc mộc quai nhung", "hài cong cung đình"],
      "diversityHints": ["màu đỏ thêu chỉ vàng", "màu đen nhung thêu sen", "màu xanh lục thêu cúc", "guốc mộc quai nhung đỏ"],
      "excludeTypes": ["sneaker", "giày thể thao", "giày oxford", "giày tây", "giày cao gót nhọn", "combat boots"],
      "reason": "Hài thêu êm ái, đậm đà phong vị cổ phong"
    },
    {
      "slot": "accessory",
      "name": "Kiềng bạc chạm khắc sen cổ truyền",
      "targetSubcategory": "trang sức bạc cung đình",
      "searchHints": ["kiềng bạc chạm hoa sen", "ngọc bội thẻ bài đeo hông", "quạt lụa tròn thêu"],
      "diversityHints": ["kiềng bạc trơn", "thẻ bài ngọc bích", "quạt lụa tay cầm"],
      "excludeTypes": ["đồng hồ điện tử", "dây chuyền hiphop xích to"],
      "reason": "Phụ kiện thanh tao tôn khí chất di sản"
    }
  ]
}
\`\`\`
;`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await axios.post(
      `${baseUrl.replace(/\/+$/, '')}/chat/completions`,
      {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 28000
      }
    );

    const replyContent = response.data?.choices?.[0]?.message?.content || '';

    // Extract JSON payload for outfit
    let outfitData = null;
    const jsonMatch = replyContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        outfitData = JSON.parse(jsonMatch[1]);
      } catch (err) {
        console.warn('Cannot parse outfit JSON:', err.message);
      }
    }

    // Enhance outfitData with real image URLs - ƯU TIÊN ẢNH THỰC TẾ TRÊN MẠNG THEO KNOWLEDGE BASE
    if (outfitData && Array.isArray(outfitData.recommendedItems)) {
      await Promise.all(outfitData.recommendedItems.map(async (item) => {
        let finalImageUrl = null;
        let finalThumbnail = null;
        let finalCode = item.code || null;
        let finalCategory = item.categoryName || 'Việt Phục Remix';

        // 1. Ưu tiên hàng đầu: Tự động tra cứu ảnh trang phục thực tế trên Web theo từ khóa
        try {
          const webSearchQuery = item.searchHints?.[0] || item.targetSubcategory || item.name;
          const webResults = await searchExactCostumeImages(webSearchQuery, item.slot, 2);
          if (webResults.length > 0 && webResults[0].url) {
            finalImageUrl = webResults[0].url;
            finalThumbnail = webResults[0].thumbnail || webResults[0].url;
            finalCategory = webResults[0].category || finalCategory;
          }
        } catch (e) {
          // fallback gracefully
        }

        // 2. Dự phòng: Nếu Web chưa có hoặc lỗi thì lấy từ FashionLibrary / Dataset
        if (!finalImageUrl || finalImageUrl.includes('sample')) {
          const searchMatches = fashionLibrary.searchLibrary(item.name, item.slot);
          const match = searchMatches[0];
          if (match && match.imageUrl && !match.imageUrl.includes('sample')) {
            finalImageUrl = match.imageUrl;
            finalThumbnail = match.thumbnail || match.imageUrl;
            finalCode = match.code || finalCode;
            finalCategory = match.category || finalCategory;
          }
        }

        if (!finalImageUrl) {
          finalImageUrl = '/api/clothes/viet_phuc_sample.jpg';
        }

        item.code = finalCode;
        item.categoryName = finalCategory;
        item.imageUrl = finalImageUrl;
        item.thumbnail = finalThumbnail || finalImageUrl;
        item.badge = '👑 AI Khuyên Dùng #1';

        // Tự động lưu/làm giàu Fashion Library để tăng tốc các lần truy vấn tiếp theo
        fashionLibrary.saveOrUpdateItem({
          name: item.name,
          slot: item.slot,
          imageUrl: finalImageUrl,
          thumbnail: finalThumbnail,
          category: finalCategory,
          reason: item.reason
        });
      }));
    }

    // Clean text by removing raw JSON block from display message
    let cleanText = replyContent
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```color_palettes[\s\S]*?```/g, '')
      .trim();

    // Ensure cleanText is always a natural, high-fashion response
    if (!cleanText || cleanText.length < 25) {
      cleanText = `Chào bạn! Với phong cách **${outfitData?.styleVibe || 'Việt Phục Remix'}** bạn mong muốn, mình đã tuyển chọn một bản phối 6 lớp trang phục đặc sắc: sự kết hợp ăn ý giữa phom dáng Cổ phục trang trọng và nét phá cách đương đại. Bộ trang phục vừa tôn vinh bản sắc di sản, vừa mang lại sự thoải mái, tự tin khi dạo phố hay lên hình!\n\nBạn có thể nhấn nút **"Áp Dụng Vào Studio (6 Lớp)"** bên dưới để đưa ngay cả bộ vào Studio phối thử nhé!`;
    }

    // Pass recommendedItems to buildMultiCandidateSlots so they appear at #1 position of each slot!
    const candidateSlots = await buildMultiCandidateSlots(userMessage, catalog, outfitData?.recommendedItems || []);

    return {
      success: true,
      text: cleanText,
      rawReply: replyContent,
      outfit: outfitData,
      candidateSlots: candidateSlots,
      colorPalettes: null,
      retrievedKnowledgeLength: relevantKnowledge.length
    };
  } catch (error) {
    console.error('RAG Error (fallback active):', error.response?.data || error.message);

    // Fallback Generator based on query type so app never breaks
    const q = removeVietnameseTones(userMessage.toLowerCase());

    if (q.includes('phoi mau') || q.includes('mau sac') || q.includes('ma mau')) {
      return {
        success: true,
        text: `### 🎨 Cẩm Nang Phối Màu Sắc Di Sản & Đương Đại
Theo mỹ cảm Á Đông và kỹ nghệ thời trang cung đình, việc phối màu cổ phục tuân theo sự hài hòa giữa sắc độ chủ đạo, lớp lót ẩn và điểm nhấn trang sức.

---

### 👑 1. Nguyên Tắc Phối Màu Thời Trang Cổ Phục
* **Tỷ lệ 60 - 30 - 10:** 60% sắc màu chủ đạo của áo chính, 30% sắc màu trang nhã của quần/váy (thường là Sa Bạch hoặc Lụa Đen), 10% điểm xuyết từ viền cổ lót và phụ kiện ngọc/bạc.
* **Quy chuẩn "Ngoại thâm nội bạch":** Áo ngoài màu trầm hoặc sắc nét, cổ áo lót bên trong hé lộ viền trắng tinh khiết tạo nét đoan trang, thanh nhã.`,
        outfit: null,
        colorPalettes: null,
        retrievedKnowledgeLength: relevantKnowledge.length
      };
    } else if (q.includes('tao dang') || q.includes('chup anh') || q.includes('dang')) {
      return {
        success: true,
        text: `### 📸 Cẩm Nang Tạo Dáng Chụp Ảnh Việt Phục Remix

Khi diện Cổ phục kết hợp hiện đại, thần thái quyết định 70% vẻ đẹp của bức ảnh. Dưới đây là 4 thế tạo dáng chuẩn Haute Couture:

---

#### 1. Dáng "Bộ Hành Di Sản" (Streetwear Motion)
* **Tư thế:** Bước đi thong thả tự nhiên, một tay cầm vạt áo ngũ thân khẽ tung nhẹ theo nhịp bước, tay kia cầm túi bao tử hoặc điện thoại.
* **Góc máy:** Chụp góc nghiêng 45 độ từ dưới lên một chút để tôn chiều cao và độ rủ mềm của tà áo.
* **Thần thái:** Mắt nhìn thẳng hoặc hơi lệch góc máy, nét mặt kiêu kỳ hiện đại.

---

#### 2. Dáng "Trà Đạo Tĩnh Tâm" (Heritage Classic)
* **Tư thế:** Hai tay khẽ đan nhẹ ngang bụng hoặc một tay nâng chén trà/quạt lụa tròn che một góc gương mặt.
* **Góc máy:** Chụp ngang tầm mắt hoặc góc cận trung (Medium Close-up) để khoe đường nét cổ áo giao lĩnh/ngũ thân.
* **Thần thái:** Nụ cười mỉm thanh nhã, ánh mắt nhìn nhẹ xuống 30 độ.

---

#### 3. Dáng "Gió Cuốn Tà Áo" (Dynamic Flow)
* **Tư thế:** Đứng nghiêng 3/4 người, xoay nhẹ phần thân trên lại phía ống kính khi có làn gió thoảng qua.
* **Mẹo chụp:** Bật chế độ chụp liên tục (Burst mode) để bắt trọn khoảnh khắc tà lụa bay bổng.`,
        outfit: null,
        colorPalettes: null,
        retrievedKnowledgeLength: relevantKnowledge.length
      };
    } else {
      // Return alternative curated outfit look
      const item1 = catalog.find(c => c.code === 'VP_002') || catalog[1] || catalog[0];
      const item2 = catalog.find(c => c.code === 'VP_018') || catalog[17] || catalog[1];
      const item3 = catalog.find(c => c.code === 'VP_010') || catalog[9] || catalog[2];
      const item4 = catalog.find(c => c.code === 'VP_041') || catalog[40] || catalog[3];
      const item5 = catalog.find(c => c.code === 'VP_068') || catalog[67] || catalog[4];

      const outfitObj = {
        outfitTitle: 'Lookbook Mới: Giao Lĩnh & Đối Khâm Thượng Uyển Remix',
        styleVibe: 'Haute Couture Cung Đình Hiện Đại',
        recommendedItems: [
          {
            slot: 'top',
            code: item1.code,
            name: item1.name,
            reason: 'Phom dáng thanh thoát, cổ chéo giao hòa giữa nét cổ điển và tinh tế',
            categoryName: item1.categoryName,
            imageUrl: item1.imageUrl,
            isSavedLocal: item1.isSavedLocal
          },
          {
            slot: 'bottom',
            code: item2.code,
            name: item2.name,
            reason: 'Tạo độ rủ bay bổng, giúp từng bước đi thêm phần uyển chuyển đài các',
            categoryName: item2.categoryName,
            imageUrl: item2.imageUrl,
            isSavedLocal: item2.isSavedLocal
          },
          {
            slot: 'layer',
            code: item3.code,
            name: item3.name,
            reason: 'Lớp khoác đối khâm mỏng nhẹ bên ngoài tạo chiều sâu layering sang trọng',
            categoryName: item3.categoryName,
            imageUrl: item3.imageUrl,
            isSavedLocal: item3.isSavedLocal
          },
          {
            slot: 'footwear',
            code: item4.code,
            name: item4.name,
            reason: 'Kết nối tinh thần hiện đại cao cấp, êm ái khi di chuyển',
            categoryName: item4.categoryName,
            imageUrl: item4.imageUrl,
            isSavedLocal: item4.isSavedLocal
          },
          {
            slot: 'accessory',
            code: item5.code,
            name: item5.name,
            reason: 'Điểm nhấn di sản thanh lịch, làm phụ kiện chụp ảnh hoàn hảo',
            categoryName: item5.categoryName,
            imageUrl: item5.imageUrl,
            isSavedLocal: item5.isSavedLocal
          }
        ]
      };

      const candidateSlots = await buildMultiCandidateSlots(userMessage, catalog, outfitObj?.recommendedItems || []);

      return {
        success: true,
        text: `### 👘 Đề Xuất Kiểu Phối Mới: ${outfitObj.outfitTitle}

Tôi đã tái cấu trúc lại bộ trang phục theo phong cách **${outfitObj.styleVibe}** với các mảnh ghép mới từ Dataset. Các chi tiết đã được cập nhật trực quan lên nhân vật bên trái!

* **Áo chính:** ${item1.name} — Tôn vinh vẻ đẹp truyền thống.
* **Phần dưới:** ${item2.name} — Thanh thoát, duyên dáng.
* **Khoác Layer:** ${item3.name} — Nâng tầm đẳng cấp thời trang.
* **Giày & Phụ kiện:** ${item4.name} & ${item5.name} — Hòa quyện cổ kim tinh tế.`,
        outfit: outfitObj,
        candidateSlots: candidateSlots,
        colorPalettes: null,
        retrievedKnowledgeLength: relevantKnowledge.length
      };
    }
  }
}
