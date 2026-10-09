import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { getApiConfig } from './rag.js';
import { buildGuardrailKnowledge } from './knowledge_loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Convert an image input (file path, buffer, base64, or URL) into a standardized format for Vision API.
 * @param {string|Buffer} input - Local file path, URL, or Base64 string
 * @returns {string} - Direct image URL or base64 data URI
 */
export function formatImageForVision(input) {
  if (!input) {
    throw new Error('Image input is empty or invalid.');
  }

  // 1. If it's already a Data URI or HTTP URL
  if (typeof input === 'string') {
    if (input.startsWith('data:image/') || input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }

    // 2. Resolve relative or absolute file path
    let resolvedPath = path.isAbsolute(input) ? input : path.resolve(ROOT_DIR, input);
    if (!fs.existsSync(resolvedPath)) {
      // Check in test_b5 or dataset if relative
      const altTestPath = path.join(ROOT_DIR, 'test_b5', input);
      if (fs.existsSync(altTestPath)) {
        resolvedPath = altTestPath;
      } else {
        throw new Error(`Không tìm thấy file ảnh tại đường dẫn: ${input}`);
      }
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase().replace('.', '');
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const base64Data = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }

  // 3. If it's a raw Buffer
  if (Buffer.isBuffer(input)) {
    const base64Data = input.toString('base64');
    return `data:image/jpeg;base64,${base64Data}`;
  }

  throw new Error('Định dạng ảnh không được hỗ trợ.');
}

/**
 * Build Vision AI System Prompt with comprehensive Cultural Guardrail Instructions
 */
function buildGuardrailSystemPrompt(knowledgeContext) {
  return `Bạn là "CHỦ TỊCH HỘI ĐỒNG GIÁM ĐỊNH VĂN HÓA & CỔ PHỤC VIỆT NAM" (Cultural Guardrail & Heritage Fashion Expert).
Nhiệm vụ của bạn là soi chiếu và thẩm định bức ảnh trang phục được cung cấp, đối chiếu nghiêm ngặt với BỘ NGUYÊN TẮC VĂN HÓA VÀ QUY CHUẨN CỔ PHỤC đính kèm.

HÃY ĐÁNH GIÁ THEO 4 TRỤ CỘT BẮT BUỘC:
1. 🇻🇳 TÍNH CHUẨN XÁC VĂN HÓA CỔ PHỤC (Authenticity & Cultural Identity):
   - Phân biệt chính xác Cổ phục Việt Nam (Áo Ngũ Thân tay chẽn/tay thụng/Áo Tấc, Giao Lĩnh, Viên Lĩnh, Nhật Bình, Tứ Thân, Áo Dài, Áo Bà Ba) với Hán Phục (Hanfu), Sườn Xám (Qipao), Hanbok.
   - Nhận diện cấu trúc chi tiết: Cổ áo (Lập lĩnh - cổ đứng ôm khít; Giao lĩnh - cổ chéo; Viên lĩnh - cổ tròn; Đối khâm - cổ song song).
   - Hướng vạt áo & khuy: Áo Việt Nam quy chuẩn vạt trái đè lên vạt phải, cài khuy sang bên nách/sườn PHẢI (Hữu nhậm). Nghiêm cấm vạt quấn sang trái (Tả nhậm - Hán phục/đồ tang). Cấu trúc ngũ thân chuẩn (5 thân, 5 khuy cài kín đáo).

2. ⚖️ THUẦN PHONG MỸ TỤC & 20+ ĐIỀU KIÊNG KỊ (Decency & Cultural Taboos):
   - Kiểm tra mức độ kín đáo, lịch thiệp. Tuyệt đối không xuyên thấu lộ nội y, không phanh cúc ngực phản cảm.
   - Kiểm tra các điều cấm kỵ: Áo Nhật Bình không phối váy ngắn cũn cỡn; Đi chùa/nơi thờ tự phải kín đáo; Mùng 1 Tết không mặc trắng toát tang tóc; Áo tấc không xắn tay luộm thuộm; v.v.

3. 📍 PHÙ HỢP HOÀN CẢNH, THỜI TIẾT & YÊU CẦU NGƯỜI DÙNG (Occasion & Climate Suitability):
   - Đối chiếu với Dịp/Hoàn cảnh được yêu cầu (Đi cafe, dạo phố, chụp kỷ yếu, lễ cưới, đi chùa, sự kiện nghệ thuật).
   - Đánh giá mức độ trang trọng (Formal vs Casual) và chất liệu vải theo nhiệt độ/thời tiết.

4. 🎨 THẨM MỸ & NGHỆ THUẬT PHỐI ĐỒ REMIX (Styling & Accessories Balance):
   - Đánh giá phụ kiện đi kèm: Khăn đóng/vấn, nón lá/quai thao, hài/guốc/giày tây/sneaker, quạt, kiềng bạc, túi xách.
   - Sự hài hòa giữa nét cổ điển và hơi thở hiện đại (nếu là phong cách Remix).

${knowledgeContext}

QUY ĐỊNH BẮT BUỘC VỀ OUTPUT:
Bạn CHỈ ĐƯỢC PHÉP TRẢ VỀ DUY NHẤT MỘT KHỐI JSON HỢP LỆ (nằm trong thẻ \`\`\`json ... \`\`\`), KHÔNG kèm thêm bất kỳ văn bản râu ria nào ngoài JSON.

Cấu trúc JSON Schema bắt buộc:
\`\`\`json
{
  "status": "SAFE" | "WARNING" | "REJECTED",
  "summary": "Tóm tắt ngắn gọn nhận định của Giám khảo văn hóa (1-2 câu súc tích)",
  "scores": {
    "cultural_authenticity": 95,
    "occasion_suitability": 90,
    "decency_and_taboos": 100,
    "styling_aesthetics": 92,
    "overall_score": 94
  },
  "identified_costume": {
    "detected_name": "Tên loại trang phục nhận diện được (VD: Áo Ngũ Thân Tay Thụng / Áo Tấc Nữ)",
    "period_style": "Triều đại / Thời kỳ (VD: Thời Nguyễn / Cận đại)",
    "collar_type": "Kiểu cổ áo nhận diện (VD: Cổ lập lĩnh ôm khít)",
    "buttoning_side": "Hướng vạt & cài khuy (VD: Cài khuy bên phải - Hữu nhậm chuẩn phong cách Việt)",
    "sleeves_and_form": "Mô tả dáng tay và form áo (VD: Tay thụng rộng, dáng suông chữ bát)",
    "material_and_color": "Mô tả chất liệu và màu sắc nhận diện trên ảnh"
  },
  "criteria_checklist": {
    "is_vietnamese_authentic": true,
    "is_modest_and_decent": true,
    "no_taboo_violated": true,
    "matches_user_occasion": true,
    "accessories_harmonious": true
  },
  "detected_violations": [
    {
      "severity": "CRITICAL" | "MODERATE" | "MINOR",
      "rule_name": "Tên quy tắc vi phạm (nếu có)",
      "issue_description": "Mô tả chi tiết vị trí hoặc chi tiết sai lệch trên ảnh",
      "cultural_reason": "Giải thích nguồn gốc/lý do văn hóa tại sao lại sai"
    }
  ],
  "expert_suggestions": [
    "Gợi ý 1: Lời khuyên cụ thể giúp nâng tầm hoặc hoàn thiện trang phục",
    "Gợi ý 2: Gợi ý phụ kiện, cách tạo dáng hoặc lưu ý bảo tồn nét đẹp di sản"
  ]
}
\`\`\`

Ý NGHĨA TRẠNG THÁI:
- SAFE: Trang phục chuẩn xác văn hóa Cổ phục Việt Nam, kín đáo, không vi phạm kiêng kị, phù hợp hoàn cảnh.
- WARNING: Có chi tiết nhỏ cần lưu ý (VD: phụ kiện hiện đại hơi lệch tone, màu sắc hơi chói, hoặc xắn tay nhẹ) nhưng không xúc phạm văn hóa.
- REJECTED: Vi phạm nghiêm trọng (VD: Hán phục quấn vạt trái, sườn xám xẻ cao phản cảm nhận nhầm là áo dài/ngũ thân, phanh ngực hở hang, mặc váy ngắn với Nhật Bình, xuyên thấu lộ nội y).
`;
}

/**
 * Clean and parse JSON response from LLM
 */
function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response from Vision AI model.');
  }

  // 1. Try extracting from markdown code block
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let jsonString = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

  // 2. Remove any accidental surrounding non-json text
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    // Attempt minor sanitization (remove trailing commas)
    try {
      const sanitized = jsonString
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
      return JSON.parse(sanitized);
    } catch (e) {
      throw new Error(`Lỗi parse JSON từ kết quả Vision AI: ${parseError.message}\nNội dung gốc: ${rawText.slice(0, 300)}...`);
    }
  }
}

/**
 * Validate and guarantee schema integrity of the guardrail verdict.
 */
function normalizeGuardrailVerdict(parsedData) {
  const status = ['SAFE', 'WARNING', 'REJECTED'].includes(parsedData.status) ? parsedData.status : 'WARNING';
  
  const scores = {
    cultural_authenticity: Math.min(100, Math.max(0, parsedData.scores?.cultural_authenticity ?? 80)),
    occasion_suitability: Math.min(100, Math.max(0, parsedData.scores?.occasion_suitability ?? 80)),
    decency_and_taboos: Math.min(100, Math.max(0, parsedData.scores?.decency_and_taboos ?? 85)),
    styling_aesthetics: Math.min(100, Math.max(0, parsedData.scores?.styling_aesthetics ?? 80)),
    overall_score: Math.min(100, Math.max(0, parsedData.scores?.overall_score ?? 82))
  };

  return {
    status,
    summary: parsedData.summary || 'Đã hoàn tất giám định văn hóa trang phục.',
    scores,
    identified_costume: {
      detected_name: parsedData.identified_costume?.detected_name || 'Cổ phục Việt Nam',
      period_style: parsedData.identified_costume?.period_style || 'Truyền thống',
      collar_type: parsedData.identified_costume?.collar_type || 'Cổ đứng / Lập lĩnh',
      buttoning_side: parsedData.identified_costume?.buttoning_side || 'Cài khuy bên phải',
      sleeves_and_form: parsedData.identified_costume?.sleeves_and_form || 'Form dáng truyền thống',
      material_and_color: parsedData.identified_costume?.material_and_color || 'Không xác định'
    },
    criteria_checklist: {
      is_vietnamese_authentic: Boolean(parsedData.criteria_checklist?.is_vietnamese_authentic ?? (status !== 'REJECTED')),
      is_modest_and_decent: Boolean(parsedData.criteria_checklist?.is_modest_and_decent ?? true),
      no_taboo_violated: Boolean(parsedData.criteria_checklist?.no_taboo_violated ?? (status === 'SAFE')),
      matches_user_occasion: Boolean(parsedData.criteria_checklist?.matches_user_occasion ?? true),
      accessories_harmonious: Boolean(parsedData.criteria_checklist?.accessories_harmonious ?? true)
    },
    detected_violations: Array.isArray(parsedData.detected_violations) ? parsedData.detected_violations : [],
    expert_suggestions: Array.isArray(parsedData.expert_suggestions) ? parsedData.expert_suggestions : []
  };
}

/**
 * Main Guardrail Function: Evaluates a single image against cultural & aesthetic standards.
 * 
 * @param {string|Buffer} imageInput - Local file path, URL, Base64 data URI, or Buffer
 * @param {Object} context - Optional context parameters { occasion, weather, userPrompt, targetStyle, gender }
 * @returns {Promise<Object>} - Structured Guardrail Verdict
 */
export async function evaluateCulturalGuardrail(imageInput, context = {}) {
  const { model, baseUrl, apiKey } = getApiConfig();
  const formattedImageUrl = formatImageForVision(imageInput);
  const knowledgeContext = buildGuardrailKnowledge(context);
  const systemPrompt = buildGuardrailSystemPrompt(knowledgeContext);

  const userContextPrompt = `
HÃY GIÁM ĐỊNH BỨC ẢNH TRANG PHỤC NÀY.
Thông tin ngữ cảnh người dùng & Hoàn cảnh (Context):
- Yêu cầu người dùng (Prompt): ${context.userPrompt || 'Tư vấn và thẩm định cổ phục'}
- Dịp / Hoàn cảnh diện đồ (Occasion): ${context.occasion || 'Đi dạo phố, chụp ảnh văn hóa, sự kiện'}
- Điều kiện thời tiết (Weather): ${context.weather || 'Mát mẻ, 22-25 độ C'}
- Phong cách hướng tới (Style vibe): ${context.targetStyle || 'Cổ điển kết hợp hiện đại thanh lịch'}
- Giới tính (Gender): ${context.gender || 'Tự động nhận diện từ ảnh'}

Hãy quan sát thật kỹ từng chi tiết trong ảnh: cổ áo, vạt áo, cách cài khuy, chiều dài tà, quần/váy, giày dép, phụ kiện cầm tay, tư thế và thần thái.
Sau đó đối chiếu với Bộ nguyên tắc văn hóa và trả về kết quả JSON chính xác.
`;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userContextPrompt },
        {
          type: 'image_url',
          image_url: {
            url: formattedImageUrl
          }
        }
      ]
    }
  ];

  try {
    const response = await axios.post(
      `${baseUrl.replace(/\/+$/, '')}/chat/completions`,
      {
        model: model,
        messages: messages,
        temperature: 0.2, // Low temperature for consistent, strict factual evaluation
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000 // 25s timeout for multimodal analysis
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content || '';
    const parsedJSON = extractAndParseJSON(rawContent);
    const normalizedResult = normalizeGuardrailVerdict(parsedJSON);

    return {
      success: true,
      data: normalizedResult,
      meta: {
        modelUsed: model,
        evaluatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    // Handle error with informative structure
    const errorMsg = error.response?.data?.error?.message || error.message || 'Lỗi khi gọi Vision API';
    return {
      success: false,
      error: errorMsg,
      data: {
        status: 'WARNING',
        summary: `Hệ thống gặp sự cố khi phân tích hình ảnh: ${errorMsg}`,
        scores: { overall_score: 0 },
        criteria_checklist: { is_vietnamese_authentic: false },
        detected_violations: [{
          severity: 'MODERATE',
          rule_name: 'Lỗi xử lý hệ thống',
          issue_description: errorMsg,
          cultural_reason: 'Không thể hoàn tất phân tích thị giác tự động'
        }],
        expert_suggestions: ['Vui lòng thử lại với ảnh chất lượng cao hơn hoặc kiểm tra kết nối API.']
      }
    };
  }
}

/**
 * Batch evaluation for multiple outfit options (e.g. 4 options from Step 3 or Step 4)
 * @param {Array<{id: string|number, image: string, context: Object}>} items 
 * @returns {Promise<Array<Object>>}
 */
export async function evaluateBatchGuardrail(items = []) {
  const results = [];
  for (const item of items) {
    const evalRes = await evaluateCulturalGuardrail(item.image, item.context || {});
    results.push({
      id: item.id,
      ...evalRes
    });
  }
  return results;
}
