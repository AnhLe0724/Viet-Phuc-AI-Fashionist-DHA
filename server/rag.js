import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { loadKeywords, removeVietnameseTones } from './keywords.js';
import { loadMetadata } from './crawler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const API_CONFIG_PATH = path.join(ROOT_DIR, 'src', 'knowledge', 'api.txt');
const PHOI_DO_PATH = path.join(ROOT_DIR, 'src', 'knowledge', 'phoi do.txt');

// 1. Read and parse API config from api.txt
export function getApiConfig() {
  if (!fs.existsSync(API_CONFIG_PATH)) {
    throw new Error(`File config API không tồn tại: ${API_CONFIG_PATH}`);
  }

  const content = fs.readFileSync(API_CONFIG_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let model = 'ram/gemini-3.6-flash-high';
  let baseUrl = 'https://api.vilao.ai/v1';
  let apiKey = '';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('tên model:') || lower.startsWith('model:')) {
      model = line.split(':')[1].trim();
    } else if (lower.startsWith('base url:') || lower.startsWith('url:')) {
      baseUrl = line.split(/base url:\s*/i)[1]?.trim() || line.split(/url:\s*/i)[1]?.trim() || baseUrl;
    } else if (lower.startsWith('api key:') || lower.startsWith('key:')) {
      apiKey = line.split(/api key:\s*/i)[1]?.trim() || line.split(/key:\s*/i)[1]?.trim() || '';
    }
  }

  return { model, baseUrl, apiKey };
}

// 2. Load the full styling guide knowledge
export function getKnowledgeBase() {
  if (!fs.existsSync(PHOI_DO_PATH)) {
    return 'Tài liệu hướng dẫn phối đồ Cổ phục Việt Nam và trang phục hiện đại.';
  }
  return fs.readFileSync(PHOI_DO_PATH, 'utf-8');
}

// 3. Retrieve relevant knowledge chunks based on user query
export function retrieveRelevantKnowledge(userQuery, fullKnowledge) {
  const queryNoAccent = removeVietnameseTones(userQuery.toLowerCase());
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

  // Pick top 4-6 most relevant sections
  const topSections = scoredSections.slice(0, 5).filter(s => s.score > 0).map(s => s.text);
  
  if (topSections.length === 0) {
    // Return first 3000 chars as general overview
    return fullKnowledge.slice(0, 4000);
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

    if (saved && fs.existsSync(saved.fullPath)) {
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

// 5. Main RAG Chatbot Service
export async function generateOutfitRecommendation(userMessage, conversationHistory = []) {
  const { model, baseUrl, apiKey } = getApiConfig();
  const fullKnowledge = getKnowledgeBase();
  const relevantKnowledge = retrieveRelevantKnowledge(userMessage, fullKnowledge);
  const catalog = getAvailableDatasetCatalog();

  // Create a structured list of available items in dataset for the AI to choose from
  const datasetItemNames = catalog.map(item => `[${item.code}] ${item.name} (${item.categoryName})`).join('\n');

  const systemPrompt = `Bạn là Chuyên gia Tư vấn Phối đồ & AI Stylist Cổ phục Việt Nam kiêm Bậc thầy Phong Thủy Thời Trang Di Sản của hệ thống "VIỆT PHỤC REMIX".
Nhiệm vụ của bạn là tư vấn phối trang phục Cổ phục truyền thống Việt Nam kết hợp phong cách hiện đại (Remix/Streetwear/Casual) dựa trên hoàn cảnh, thể trạng, giới tính và mục đích của người dùng.

QUY TẮC RAG BẮT BUỘC:
1. Dựa trên tài liệu cẩm nang phối đồ được cung cấp bên dưới để phân tích chuẩn xác các quy tắc kết hợp trang phục (Ngũ thân, Giao lĩnh, Viên lĩnh, Nhật bình, Tứ thân, Bà ba, v.v.).
2. QUAN TRỌNG: Bạn CHỈ ĐƯỢC PHÉP gợi ý các món trang phục/phụ kiện CÓ TRONG DANH SÁCH DATASET DƯỚI ĐÂY khi đề xuất bộ đồ. Không được bịa thêm các món đồ không có trong danh sách.
3. Khi đưa ra bộ trang phục (Outfit), hãy chọn từ 3 đến 6 món thuộc các vị trí: top, bottom, layer, headwear, footwear, accessory.

ĐẶC BIỆT KHI NGƯỜI DÙNG HỎI VỀ PHỐI MÀU / TÂM LINH PHONG THỦY:
Khi người dùng hỏi về cách phối màu, hãy:
- Đưa ra 2 đến 3 bảng phối màu cực kỳ ấn tượng, hài hòa giữa cổ điển và hiện đại.
- Luận giải ý nghĩa TÂM LINH & PHONG THỦY NGŨ HÀNH như một THẦY BÓI THỜI TRANG CAO TAY (VD: Quẻ Đại Cát, Chiêu tài đắc lộc, Khai thông vận khí, Tương sinh Mộc-Hỏa-Kim-Thổ-Thủy, Kích hoạt cung Đào hoa tình duyên, Trừ tà khí, Tụ vượng khí...).
- Đính kèm khối JSON \`\`\`color_palettes ... \`\`\` ở cuối bài với định dạng:
\`\`\`color_palettes
[
  {
    "paletteName": "Bản Phối 1: Mộc Hỏa Giao Duyên — Chiêu Tài Tụ Khí",
    "vibe": "Tương Sinh Đại Cát",
    "fortuneMeaning": "Thầy phán: Sắc xanh lục của Mộc dưỡng cho sắc đỏ tía của Hỏa. Quẻ này thuộc về Khai Quang Phát Tài, người diện set này khí sắc rạng ngời, quý nhân tương trợ, công việc hanh thông, trừ sạch ám khí.",
    "colors": [
      { "hex": "#2C3B23", "name": "Xanh Rêu Cung Đình", "role": "Áo chính" },
      { "hex": "#8B263E", "name": "Đỏ Chu Sa Hoàng Tộc", "role": "Khăn vấn / Điểm nhấn" },
      { "hex": "#DFB76C", "name": "Vàng Hoàng Kim", "role": "Phụ kiện / Kim loại" },
      { "hex": "#F4EBD9", "name": "Trắng Sa Lụa", "role": "Quần sa lụa" }
    ]
  },
  {
    "paletteName": "Bản Phối 2: Matcha Trà Đạo — Thanh Tâm An Nhiên",
    "vibe": "Tĩnh Tại & Bình An",
    "fortuneMeaning": "Thầy phán: Tone xanh matcha nhạt kết hợp cùng kem ngà và nâu gốm thuộc quẻ Địa Thiên Thái. Giúp tĩnh tâm an thần, hóa giải thị phi, gia tăng hòa khí trong gia đạo và thu hút năng lượng chữa lành.",
    "colors": [
      { "hex": "#84A56C", "name": "Xanh Matcha Nhẹ", "role": "Áo chính" },
      { "hex": "#EEF3E8", "name": "Bạch Ngọc Lụa", "role": "Quần / Váy" },
      { "hex": "#6B5838", "name": "Nâu Gốm Mộc", "role": "Túi / Giày" },
      { "hex": "#2D442A", "name": "Lục Thẫm Cổ", "role": "Phụ kiện" }
    ]
  }
]
\`\`\`

ĐẶC BIỆT KHI NGƯỜI DÙNG HỎI VỀ TẠO DÁNG (POSING GUIDE):
- Hướng dẫn 3-4 dáng chụp ấn tượng (Dáng dạo phố tự nhiên, Dáng quyền quý cung đình, Dáng tĩnh tâm trà đạo, Dáng chụp cận cảnh với phụ kiện).
- Gợi ý góc máy và thần thái biểu cảm (ánh mắt, nụ cười nhẹ, tư thế tay cầm quạt/vạt áo).

TÀI LIỆU CẨM NANG PHỐI ĐỒ (TRÍCH XUẤT TỪ PHOI DO.TXT):
=== BẮT ĐẦU TÀI LIỆU ===
${relevantKnowledge}
=== KẾT THÚC TÀI LIỆU ===

DANH SÁCH 100 QUẦN ÁO & PHỤ KIỆN KHẢ DỤNG TRONG DATASET:
=== BẮT ĐẦU DANH SÁCH DATASET ===
${datasetItemNames}
=== KẾT THÚC DANH SÁCH DATASET ===

CẤU TRÚC PHẢN HỒI:
Hãy trả lời người dùng bằng Tiếng Việt với phong cách Haute Couture tinh tế, thông tuệ văn hóa và dí dỏm:
1. 👘 **Phân tích chi tiết:** Giải đáp trực tiếp yêu cầu của người dùng.
2. ✨ **Bộ trang phục hoặc Bảng màu đề xuất.**
3. 💡 **Mẹo & Lưu ý di sản.**

Nếu có đề xuất bộ trang phục mới, hãy đính kèm MỘT KHỐI JSON duy nhất nằm trong thẻ \`\`\`json ... \`\`\` với định dạng:
\`\`\`json
{
  "outfitTitle": "Tên bộ trang phục ấn tượng",
  "styleVibe": "Tên phong cách",
  "recommendedItems": [
    {
      "slot": "top",
      "code": "VP_001",
      "name": "Áo ngũ thân tay chẽn",
      "reason": "Lý do chọn"
    }
  ]
}
\`\`\`
`;

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
        max_tokens: 1800
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
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

    // Extract color palettes JSON if present
    let colorPalettesData = null;
    const paletteMatch = replyContent.match(/```color_palettes\s*([\s\S]*?)\s*```/);
    if (paletteMatch && paletteMatch[1]) {
      try {
        colorPalettesData = JSON.parse(paletteMatch[1]);
      } catch (err) {
        console.warn('Cannot parse color palettes JSON:', err.message);
      }
    }

    // Enhance outfitData with real image URLs from dataset catalog or on-the-fly search
    if (outfitData && Array.isArray(outfitData.recommendedItems)) {
      const allKeywords = loadKeywords();
      
      outfitData.recommendedItems = await Promise.all(
        outfitData.recommendedItems.map(async (item) => {
          // Find matching item in catalog by code or name
          let match = catalog.find(c => 
            (item.code && c.code.toLowerCase() === item.code.toLowerCase()) ||
            (item.name && (c.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(c.name.toLowerCase())))
          );

          let finalImageUrl = match ? match.imageUrl : null;
          let isSavedLocal = match ? match.isSavedLocal : false;

          // If item doesn't have an image, find keyword and crawl top 3 on the fly
          if (!finalImageUrl) {
            const kwObj = allKeywords.find(k => 
              (item.code && k.code.toLowerCase() === item.code.toLowerCase()) ||
              (item.name && (k.withAccent.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(k.withAccent.toLowerCase())))
            );

            if (kwObj) {
              try {
                const { crawlKeywordImages } = await import('./crawler.js');
                const cands = await crawlKeywordImages(kwObj);
                if (cands && cands.length > 0) {
                  finalImageUrl = cands[0].thumbnail || cands[0].url;
                  kwObj.candidates = cands;
                }
              } catch (e) {
                console.warn(`[Auto-crawl image for ${item.name} failed]:`, e.message);
              }
            }
          }

          // Fallback image search query if still empty
          if (!finalImageUrl) {
            finalImageUrl = `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=60`;
          }

          return {
            ...item,
            code: match ? match.code : item.code,
            name: match ? match.name : item.name,
            categoryName: match ? match.categoryName : 'Trang phục',
            imageUrl: finalImageUrl,
            isSavedLocal: isSavedLocal
          };
        })
      );
    }

    // Clean text by removing raw JSON and color_palettes block from display message
    const cleanText = replyContent
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```color_palettes[\s\S]*?```/g, '')
      .trim();

    return {
      success: true,
      text: cleanText,
      rawReply: replyContent,
      outfit: outfitData,
      colorPalettes: colorPalettesData,
      retrievedKnowledgeLength: relevantKnowledge.length
    };
  } catch (error) {
    console.error('RAG Error (fallback active):', error.response?.data || error.message);

    // Fallback Generator based on query type so app never breaks
    const q = removeVietnameseTones(userMessage.toLowerCase());

    if (q.includes('phoi mau') || q.includes('mau sac') || q.includes('tam linh') || q.includes('ma mau')) {
      return {
        success: true,
        text: `### 🔮 Luận Giải Bảng Phối Màu Hoàng Gia & Tâm Linh Di Sản

Dựa trên cấu trúc cổ phục truyền thống và nguyên lý **Âm Dương Ngũ Hành**, việc kết hợp màu sắc không chỉ tạo nên tính duy mỹ Haute Couture mà còn là một liệu pháp phong thủy kích hoạt vận khí cát tường cho người mặc.

---

### 👑 1. Nguyên Tắc Phối Màu Hoàng Cung
* **Quy tắc Tam Hợp Sắc Điệu:** Kết hợp 1 tông màu đất/mộc làm chủ đạo (60%), 1 tông màu ngà lụa (30%) và 1 điểm nhấn chu sa/hoàng kim (10%).
* **Sự Cân Bằng Âm Dương:** Sắc tối của Thường/Quần tạo độ đằm vững chãi (Âm), đối trọng cùng sắc tươi sáng của Vạt áo ngũ thân (Dương).

---

### ✨ 2. Chi Tiết Các Bảng Phối Màu Khối & Lời Phán Thầy Bói
*(Mời bạn quan sát các khối màu hiện đại xếp cạnh nhau và bấm để sao chép mã HEX bên dưới)*`,
        outfit: null,
        colorPalettes: [
          {
            paletteName: "Bản Phối 1: Lục Mộc Hoàng Thổ — Khai Quang Đắc Lộc",
            vibe: "Tương Sinh Đại Cát",
            fortuneMeaning: "Thầy phán: Sắc xanh rêu của Mộc tương sinh nuôi dưỡng Hỏa và kết giao cùng Thổ kim. Quẻ này thuộc 'Đại Cát Đại Lợi', người diện set này thần thái ngút ngàn, quý nhân chỉ lối, vượng đường tài lộc và thanh trừ mọi chướng khí.",
            colors: [
              { hex: "#2E4B33", name: "Lục Rêu Cung Đình", role: "Áo ngũ thân chính" },
              { hex: "#DFB76C", name: "Hoàng Kim Quý Tộc", role: "Trang sức / Điểm xuyết" },
              { hex: "#EBE2D3", name: "Bạch Sa Thượng Hạng", role: "Quần sa lụa" },
              { hex: "#8B263E", name: "Chu Sa Hoàng Tộc", role: "Khăn vấn / Điểm nhấn" }
            ]
          },
          {
            paletteName: "Bản Phối 2: Matcha Trà Đạo — Thanh Tâm Trừ Tà",
            vibe: "Tĩnh Tại & Bình An",
            fortuneMeaning: "Thầy phán: Quẻ 'Địa Thiên Thái'. Tone xanh matcha dịu mát kết hợp cùng bạch ngọc và nâu đất nung giúp tĩnh tâm an thần, hóa giải thị phi, gia tăng hòa khí tình duyên và thu hút năng lượng chữa lành thanh khiết.",
            colors: [
              { hex: "#7A9E66", name: "Xanh Matcha Nhẹ", role: "Áo giao lĩnh / ngũ thân" },
              { hex: "#F5F7F2", name: "Bạch Ngọc Lụa", role: "Quần / Thường xếp ly" },
              { hex: "#544634", name: "Nâu Gốm Mộc Mạc", role: "Túi xách / Dây đeo" },
              { hex: "#263725", name: "Lục Thẫm Cổ Phục", role: "Phụ kiện viền" }
            ]
          },
          {
            paletteName: "Bản Phối 3: Hắc Mực & Xích Chu — Huyền Bí Quyền Uy",
            vibe: "Phong Cách Dark Heritage",
            fortuneMeaning: "Thầy phán: Quẻ 'Càn Uy Vạn Tượng'. Sắc đen tuyền của bóng đêm tương hỗ cùng đỏ tía chu sa tạo khí chất lãnh đạo kiêu hãnh, xua đuổi tiểu nhân, tăng cường uy lực và sự tự tin tuyệt đối.",
            colors: [
              { hex: "#1A1D1A", name: "Hắc Mực Thẫm", role: "Áo khoác đối khâm" },
              { hex: "#9E2A2B", name: "Xích Đỏ Cung Đình", role: "Áo lót trong" },
              { hex: "#C5A880", name: "Vàng Đồng Cổ Điển", role: "Khuy áo / Vòng kiềng" },
              { hex: "#F8F9FA", name: "Trắng Sa Tinh Khiết", role: "Quần ống suông" }
            ]
          }
        ],
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

      return {
        success: true,
        text: `### 👘 Đề Xuất Kiểu Phối Mới: ${outfitObj.outfitTitle}

Tôi đã tái cấu trúc lại bộ trang phục theo phong cách **${outfitObj.styleVibe}** với các mảnh ghép mới từ Dataset. Các chi tiết đã được cập nhật trực quan lên nhân vật bên trái!

* **Áo chính:** ${item1.name} — Tôn vinh vẻ đẹp truyền thống.
* **Phần dưới:** ${item2.name} — Thanh thoát, duyên dáng.
* **Khoác Layer:** ${item3.name} — Nâng tầm đẳng cấp thời trang.
* **Giày & Phụ kiện:** ${item4.name} & ${item5.name} — Hòa quyện cổ kim tinh tế.`,
        outfit: outfitObj,
        colorPalettes: null,
        retrievedKnowledgeLength: relevantKnowledge.length
      };
    }
  }
}
