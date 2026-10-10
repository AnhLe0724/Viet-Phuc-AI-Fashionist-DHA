import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'dataset', 'remix_outputs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

import 'dotenv/config';
import { getApiConfig } from './rag.js';

// Dynamic API Credentials from environment variables (.env) with safe fallbacks
export function getTextApiConfig() {
  try {
    return getApiConfig('text');
  } catch (e) {
    return {
      baseUrl: 'https://api.vilao.ai/v1',
      model: 'ram/gemini-3.6-flash-high',
      apiKey: 'sk-0d96f175cdea67f6a9baeec9e4f1c54aedd2cba422245735b507f946d994fcea'
    };
  }
}

export function getImageApiConfig() {
  try {
    const cfg = getApiConfig('image');
    // Ensure standard model id for vilao.ai image endpoints
    let m = cfg.model || 'gemini-3.0-pro-image';
    if (m.includes('gemini-3.0-pro-image')) m = 'gemini-3.0-pro-image';
    return { ...cfg, model: m };
  } catch (e) {
    return {
      baseUrl: 'https://api.vilao.ai/v1',
      model: 'gemini-3.0-pro-image',
      apiKey: 'sk-ae9effb5a2ce8b274e72df27443de5391c9349e14fa3acccedd6edbeea2eb91f'
    };
  }
}

/**
 * Helper: Resolve image input (Base64, local path, Vite @fs URL, or web URL) to a Buffer
 */
export async function resolveImageBuffer(source) {
  if (!source) return null;

  // 1. Base64 Data URI
  if (typeof source === 'string' && (source.startsWith('data:image') || source.includes(';base64,'))) {
    const base64Data = source.split(',')[1] || source;
    return Buffer.from(base64Data, 'base64');
  }

  // 2. String source (path or URL)
  if (typeof source === 'string') {
    let cleanPath = decodeURIComponent(source.trim());

    // Strip URL protocol & domain if localhost
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      if (cleanPath.includes('localhost:') || cleanPath.includes('127.0.0.1:')) {
        try {
          const urlObj = new URL(cleanPath);
          cleanPath = urlObj.pathname;
        } catch (e) {}
      } else {
        try {
          const response = await axios.get(cleanPath, { responseType: 'arraybuffer', timeout: 15000 });
          return Buffer.from(response.data);
        } catch (e) {
          console.warn('[resolveImageBuffer] Fetch error:', e.message);
        }
      }
    }

    // Handle Vite @fs paths (e.g. /@fs/d:/Project/Viet Phuc AI/src/human model/woman 1.png)
    if (cleanPath.includes('/@fs/')) {
      cleanPath = cleanPath.split('/@fs/')[1];
    } else if (cleanPath.startsWith('@fs/')) {
      cleanPath = cleanPath.slice(4);
    }

    // Remove leading slashes
    const relPath = cleanPath.replace(/^[/\\]+/, '');

    const candidatePaths = [
      cleanPath,
      path.join(ROOT_DIR, relPath),
      path.join(ROOT_DIR, 'src', 'human model', relPath.replace(/^api\/human-model\//, '')),
      path.join(ROOT_DIR, 'src', 'clothes', relPath.replace(/^api\/clothes\//, '')),
      path.join(ROOT_DIR, 'dataset', relPath.replace(/^api\/dataset\//, '')),
      path.join(ROOT_DIR, 'src', relPath),
      path.join(ROOT_DIR, 'dataset', relPath),
      path.join(ROOT_DIR, 'src', 'human model', 'man 1.jpg'),
      path.join(ROOT_DIR, 'src', 'human model', 'woman 1.jpg')
    ];

    for (const cand of candidatePaths) {
      if (cand && fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        try {
          return fs.readFileSync(cand);
        } catch (e) {}
      }
    }
  }

  return null;
}

/**
 * Biometric Identity Extraction (Gemini 3.6 Flash Vision)
 * Fast 1-2s analysis of the human model image to lock in facial features, age, gender, hair, skin tone, and body pose.
 */
export async function extractBiometricDescription(imageBuffer) {
  if (!imageBuffer) return 'Vietnamese model, standing full-body studio portrait';
  const textCfg = getTextApiConfig();
  try {
    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    const res = await axios.post(`${textCfg.baseUrl}/chat/completions`, {
      model: textCfg.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this person for accurate identity-preserving virtual try-on in 25 words: gender, approximate age, hairstyle and color, skin tone, facial features, body build, and standing pose. Output ONLY the concise biometric description in English.'
            },
            {
              type: 'image_url',
              image_url: { url: dataUri }
            }
          ]
        }
      ],
      max_tokens: 60,
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${textCfg.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const desc = res.data?.choices?.[0]?.message?.content?.trim();
    if (desc && desc.length > 10) {
      return desc.replace(/^["']|["']$/g, '');
    }
  } catch (err) {
    console.warn('[Biometric Vision Warning]:', err.message);
  }
  return 'Vietnamese model, standing full-body studio portrait';
}

/**
 * 1. Intelligent AI Prompt Optimizer using ram/gemini-3.6-flash-high
 * Supports both Single Outfit and Complex Multi-Item Layering (Top, Bottom, Headwear, Footwear, Accessory)
 */
export async function optimizeFashionPrompt({
  garmentName = 'Áo Ngũ Thân Truyền Thống',
  garmentCategory = 'Cổ Phục Việt Nam',
  styleTags = [],
  userPrompt = '',
  humanDescription = 'Vietnamese model',
  layers = null // Optional: { top, bottom, headwear, footwear, accessory }
}) {
  const startTime = Date.now();
  
  const systemPrompt = `You are a world-class Haute Couture Fashion Stylist, Heritage Researcher, and Master AI Prompt Engineer specializing in Vietnamese Traditional Heritage Costumes (Việt Phục) & Modern Remix.
Your mission is to generate the most photorealistic, vivid, and precise English image-editing prompt for Google Gemini 3.0 Pro Image (veo/gemini-3.0-pro-image).

CRITICAL RULES:
1. STRICTLY PRESERVE IDENTITY: Must instruct the AI to keep the EXACT face, hairstyle, facial expression, skin tone, and full-body standing pose of the person in the input image.
2. PRECISE MULTI-LAYER PLACEMENT:
   - Head/Hair: Render the specified headwear/turban/hat securely on the model's head.
   - Base Layer / Innerwear: If specified (Ao Trung Linh / Ao Canh / Ao Yem), show the pristine inner shirt with its neat collar subtly visible (e.g. 1-2mm white collar rim peeking above the outer robe).
   - Upper Body / Top: Dress the model in the specified traditional Vietnamese top/robe (with accurate collars, sleeve cuts, buttons, embroidery, and silk sheen).
   - Lower Body: Dress the model in the specified pants/skirt/trousers with realistic fabric drapery and folds.
   - Feet: Put the specified traditional or modern shoes/footwear on the model's feet.
   - Accessories: Seamlessly place all specified accessories (jade pendant on waist, silver collar on neck, fan gracefully in hand, retro spectacles, etc.).
3. FABRIC & LIGHTING EXCELLENCE: Mention authentic textures (royal silk brocade gấm tơ tằm, sa cát, metallic gold embroidery chỉ ánh kim, 5 filigree gold buttons) and studio lighting (soft rim light, neutral clean backdrop, Hasselblad medium format 8k, sharp focus, no noise).
4. OUTPUT ONLY THE FINAL PROMPT in English. Do NOT wrap in quotes, do NOT include markdown headings or bullet points.`;

  let userContent = '';
  if (layers && Object.keys(layers).length > 0) {
    const layerDescriptions = [];
    const getColorSpec = (item) => {
      if (!item || !item.color) return '';
      const c = item.color;
      if (typeof c === 'string') return ` [MÀU SẮC ĐƯỢC CHỌN: ${c}]`;
      if (c.prompt) return ` [SPECIFIC COLOR: ${c.name || ''} - ${c.prompt}]`;
      if (c.name) return ` [SPECIFIC COLOR: ${c.name}]`;
      return '';
    };

    if (layers.innerwear && layers.innerwear.id !== 'inner-none') {
      const inName = layers.innerwear.name || layers.innerwear;
      const inPrompt = layers.innerwear.prompt || '';
      const colorStr = getColorSpec(layers.innerwear);
      layerDescriptions.push(`- BASE LAYER / INNERWEAR (Áo lót trong / Trung Lĩnh): ${inName}${colorStr}${inPrompt ? ` (${inPrompt})` : ''}`);
    }
    if (layers.top) {
      const topName = layers.top.name || layers.top;
      const topPrompt = layers.top.prompt || '';
      const colorStr = getColorSpec(layers.top);
      layerDescriptions.push(`- TOP / OUTER ROBE (Áo ngoài / chính): ${topName}${colorStr}${topPrompt ? ` (${topPrompt})` : ''}`);
    }
    if (layers.bottom) {
      const botName = layers.bottom.name || layers.bottom;
      const botPrompt = layers.bottom.prompt || '';
      const colorStr = getColorSpec(layers.bottom);
      layerDescriptions.push(`- BOTTOM / PANTS / SKIRT (Quần/Xiêm): ${botName}${colorStr}${botPrompt ? ` (${botPrompt})` : ''}`);
    }
    if (layers.headwear && layers.headwear.id !== 'head-none') {
      const headName = layers.headwear.name || layers.headwear;
      const headPrompt = layers.headwear.prompt || '';
      const colorStr = getColorSpec(layers.headwear);
      layerDescriptions.push(`- HEADWEAR / HAT / TURBAN (Mũ/Khăn): ${headName}${colorStr}${headPrompt ? ` (${headPrompt})` : ''}`);
    }
    if (layers.footwear) {
      const footName = layers.footwear.name || layers.footwear;
      const footPrompt = layers.footwear.prompt || '';
      const colorStr = getColorSpec(layers.footwear);
      layerDescriptions.push(`- FOOTWEAR / SHOES (Giày/Hài/Guốc): ${footName}${colorStr}${footPrompt ? ` (${footPrompt})` : ''}`);
    }
    
    // Support multiple accessories (array or single object)
    if (Array.isArray(layers.accessories)) {
      const validAccs = layers.accessories.filter(a => a && a.id !== 'acc-none');
      if (validAccs.length > 0) {
        const accTexts = validAccs.map(a => `${a.name || a}${getColorSpec(a)}${a.prompt ? ` (${a.prompt})` : ''}`).join(', ');
        layerDescriptions.push(`- ACCESSORIES / JEWELRY (Phụ kiện/Trang sức - Render all): ${accTexts}`);
      }
    } else if (layers.accessory && layers.accessory.id !== 'acc-none') {
      const accName = layers.accessory.name || layers.accessory;
      const accPrompt = layers.accessory.prompt || '';
      const colorStr = getColorSpec(layers.accessory);
      layerDescriptions.push(`- ACCESSORIES (Phụ kiện): ${accName}${colorStr}${accPrompt ? ` (${accPrompt})` : ''}`);
    }

    userContent = `Task: Complex Multi-Item Layered Vietnamese Heritage Outfit Try-On
Model: ${humanDescription} (Full body standing studio portrait)
Outfit Layers to Combine into ONE Cohesive Look:
${layerDescriptions.join('\n')}

Style Tags / Aesthetics: ${styleTags.join(', ') || 'Haute Couture Editorial, Authentic Royal Court, Hasselblad 8k'}
User Custom Request: ${userPrompt || 'Harmoniously combine all layers onto the full-body model while strictly preserving their identity and standing pose.'}

Generate the comprehensive English image edit prompt now:`;
  } else {
    userContent = `Garment to wear: ${garmentName} (Category: ${garmentCategory})
Model: ${humanDescription}
Additional style tags: ${styleTags.join(', ') || 'Authentic Heritage, Premium Silk'}
User custom note: ${userPrompt || 'None'}

Generate the optimized Image-to-Image editing prompt now:`;
  }

  try {
    const textCfg = getTextApiConfig();
    const response = await axios.post(`${textCfg.baseUrl}/chat/completions`, {
      model: textCfg.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${textCfg.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const optimizedPrompt = response.data?.choices?.[0]?.message?.content?.trim() || '';
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    return {
      success: true,
      optimizedPrompt,
      timeSeconds: elapsed,
      modelUsed: textCfg.model
    };
  } catch (err) {
    console.warn('[Prompt Optimizer Fallback]:', err.message);
    let fallbackPrompt = `High-fashion full-body studio portrait: strictly preserve the exact face, hairstyle, skin tone, and standing pose of the model. Replace current clothing with an authentic Vietnamese outfit (${garmentName}) crafted from luxury silk with gold embroidery, elegant tailored silhouette, soft natural fabric folds, editorial studio lighting, Hasselblad 8k photography.`;
    if (layers) {
      const innerDesc = layers.innerwear?.name ? `with ${layers.innerwear.name} base layer, ` : '';
      const topDesc = layers.top?.name || 'Vietnamese silk robe';
      const bottomDesc = layers.bottom?.name || 'traditional silk trousers';
      const headDesc = layers.headwear?.name ? `wearing ${layers.headwear.name} on the head, ` : '';
      const footDesc = layers.footwear?.name ? `wearing ${layers.footwear.name} on the feet, ` : '';
      const accList = Array.isArray(layers.accessories) 
        ? layers.accessories.filter(a => a && a.id !== 'acc-none').map(a => a.name).join(', ')
        : (layers.accessory?.name || '');
      const accDesc = accList ? `adorned with ${accList}, ` : '';
      fallbackPrompt = `Haute couture full-body studio portrait: strictly keep the exact face, skin tone, and standing pose of the model. Dress the model in ${topDesc} on the upper body ${innerDesc}paired with ${bottomDesc} on the lower body, ${headDesc}${footDesc}${accDesc}harmonious royal Vietnamese aesthetic, Hasselblad 8k studio lighting, ultra sharp photorealistic.`;
    }
    return {
      success: true,
      optimizedPrompt: fallbackPrompt,
      timeSeconds: '0.01',
      modelUsed: 'Heuristic Rule-Based Optimizer (Fallback)'
    };
  }
}

/**
 * 2. Execute Image-to-Image / Virtual Try-On using gemini-3.0-pro-image (/images/edits)
 */
export async function executeImageToImage({
  humanImageSource,
  garmentImageSource,
  prompt,
  garmentName = 'Trang phục Việt Phục',
  layers = null,
  styleTags = [],
  userPrompt = '',
  size = '1024x1024'
}) {
  const startTime = Date.now();
  const steps = [];

  // Step 1: Input image resolution
  steps.push({ step: 1, name: 'Chuẩn bị dữ liệu hình ảnh người mẫu & Trang phục', status: 'running' });
  const humanBuffer = await resolveImageBuffer(humanImageSource);
  if (!humanBuffer) {
    throw new Error('Không thể tải hoặc xử lý hình ảnh người mẫu đầu vào.');
  }
  steps[0].status = 'success';

  // Step 2: Biometric Identity Extraction (Vision AI)
  steps.push({ step: 2, name: 'Khóa nhận diện khuôn mặt & vóc dáng người mẫu (Biometric Preservation)...', status: 'running' });
  const biometricDescription = await extractBiometricDescription(humanBuffer);
  steps[1].status = 'success';

  // Step 3: Prompt optimization
  steps.push({ step: 3, name: 'Tối ưu hóa câu lệnh Virtual Try-On Cổ phục đa lớp...', status: 'running' });
  let finalPrompt = prompt;
  if (!finalPrompt || finalPrompt.length < 30 || !finalPrompt.includes('VIRTUAL TRY-ON')) {
    const optRes = await optimizeFashionPrompt({
      garmentName,
      layers,
      styleTags,
      userPrompt,
      humanDescription: biometricDescription
    });
    finalPrompt = optRes.optimizedPrompt;
  }

  // Ensure prompt explicitly forces identity preservation on the base image
  const tryOnPrompt = `VIRTUAL TRY-ON EDITING: Strictly preserve the EXACT person, facial features, hair, skin tone, body shape, and standing pose from the input image (${biometricDescription}) 100% UNCHANGED. Perform garment replacement only: dress this person in ${finalPrompt}. Ultra-sharp photorealistic, authentic fabric folds, Hasselblad 8k studio lighting.`;
  steps[2].status = 'success';

  // Step 4: Call Image-to-Image / Inpainting API (with automatic fallback to generations)
  steps.push({ step: 4, name: 'Gửi yêu cầu Virtual Try-On đến Gemini 3.0 Pro Image Engine (Cloud GPU)...', status: 'running' });

  const humanBase64 = `data:image/jpeg;base64,${humanBuffer.toString('base64')}`;
  const imgCfg = getImageApiConfig();

  let remoteUrl = null;
  let usedModel = imgCfg.model;

  // Attempt 1: Call /images/edits
  try {
    const editResponse = await axios.post(`${imgCfg.baseUrl}/images/edits`, {
      image: humanBase64,
      prompt: tryOnPrompt,
      model: imgCfg.model,
      size: size || '1024x1024',
      n: 1
    }, {
      headers: {
        'Authorization': `Bearer ${imgCfg.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 120s for cloud GPU rendering
    });

    remoteUrl = editResponse.data?.data?.[0]?.url;
  } catch (apiErr) {
    console.warn('[Image Edits Notice, attempting fallback via /images/generations]:', apiErr.response?.data || apiErr.message);

    // Attempt 2: Fallback to /images/generations
    try {
      const genResponse = await axios.post(`${imgCfg.baseUrl}/images/generations`, {
        prompt: tryOnPrompt,
        model: imgCfg.model,
        size: size || '1024x1024',
        n: 1
      }, {
        headers: {
          'Authorization': `Bearer ${imgCfg.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      });

      remoteUrl = genResponse.data?.data?.[0]?.url;
    } catch (genErr) {
      console.error('[Virtual Try-On Cloud API Error]:', genErr.response?.data || genErr.message);
      throw new Error(`Lỗi kết xuất ảnh từ máy chủ AI: ${genErr.response?.data?.error?.message || genErr.message || apiErr.message}`);
    }
  }

  if (remoteUrl) {
    steps[3].status = 'success';
  } else {
    throw new Error('Máy chủ AI không trả về URL ảnh');
  }

  // Step 5: Download and cache locally
  steps.push({ step: 5, name: 'Tải và lưu trữ tác phẩm độ phân giải cao vào hệ thống', status: 'running' });
  const fileHash = `remix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const localSavedPath = path.join(OUTPUT_DIR, fileHash);
  const relativeUrl = `/api/dataset/remix_outputs/${fileHash}`;

  if (remoteUrl) {
    try {
      const dlResponse = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 30000 });
      fs.writeFileSync(localSavedPath, Buffer.from(dlResponse.data));
      steps[4].status = 'success';
    } catch (dlErr) {
      console.warn('[Cache Warning]: Không thể lưu cache local, sử dụng URL gốc từ CDN:', dlErr.message);
      steps[4].status = 'warning';
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    success: true,
    resultUrl: fs.existsSync(localSavedPath) ? relativeUrl : remoteUrl,
    cdnUrl: remoteUrl,
    optimizedPrompt: tryOnPrompt,
    biometrics: biometricDescription,
    executionTime: `${totalTime}s`,
    modelUsed: usedModel,
    garmentName,
    steps,
    createdAt: new Date().toISOString()
  };
}
