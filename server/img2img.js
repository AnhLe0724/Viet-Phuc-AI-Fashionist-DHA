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

// API Credentials from src/knowledge/api.txt
const BASE_URL = 'https://api.vilao.ai/v1';
const TEXT_MODEL = 'ram/gemini-3.6-flash-high';
const TEXT_API_KEY = 'sk-0d96f175cdea67f6a9baeec9e4f1c54aedd2cba422245735b507f946d994fcea';

const IMAGE_MODEL = 'veo/gemini-3.0-pro-image';
const IMAGE_API_KEY = 'sk-ae9effb5a2ce8b274e72df27443de5391c9349e14fa3acccedd6edbeea2eb91f';

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
      path.join(ROOT_DIR, 'src', 'human model', 'woman 1.png')
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
   - Upper Body: Dress the model in the specified traditional Vietnamese top/robe (with accurate collars, sleeve cuts, buttons, embroidery, and silk sheen).
   - Lower Body: Dress the model in the specified pants/skirt/trousers with realistic fabric drapery and folds.
   - Feet: Put the specified traditional or modern shoes/footwear on the model's feet.
   - Accessories: Seamlessly place accessories (jade pendant on waist, silver collar on neck, fan in hand, etc.).
3. FABRIC & LIGHTING EXCELLENCE: Mention authentic textures (royal silk brocade gấm tơ tằm, sa cát, metallic gold embroidery chỉ ánh kim, 5 filigree gold buttons) and studio lighting (soft rim light, neutral clean backdrop, Hasselblad medium format 8k, sharp focus, no noise).
4. OUTPUT ONLY THE FINAL PROMPT in English. Do NOT wrap in quotes, do NOT include markdown headings or bullet points.`;

  let userContent = '';
  if (layers && Object.keys(layers).length > 0) {
    const layerDescriptions = [];
    if (layers.top) layerDescriptions.push(`- TOP / ROBE (Áo): ${layers.top.name || layers.top}`);
    if (layers.bottom) layerDescriptions.push(`- BOTTOM / PANTS / SKIRT (Quần/Xiêm): ${layers.bottom.name || layers.bottom}`);
    if (layers.headwear) layerDescriptions.push(`- HEADWEAR / HAT / TURBAN (Mũ/Nón/Khăn): ${layers.headwear.name || layers.headwear}`);
    if (layers.footwear) layerDescriptions.push(`- FOOTWEAR / SHOES (Giày/Hài/Guốc): ${layers.footwear.name || layers.footwear}`);
    if (layers.accessory) layerDescriptions.push(`- ACCESSORIES (Phụ kiện/Trang sức): ${layers.accessory.name || layers.accessory}`);

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
    const response = await axios.post(`${BASE_URL}/chat/completions`, {
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${TEXT_API_KEY}`,
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
      modelUsed: TEXT_MODEL
    };
  } catch (err) {
    console.warn('[Prompt Optimizer Fallback]:', err.message);
    let fallbackPrompt = `High-fashion full-body studio portrait: strictly preserve the exact face, hairstyle, skin tone, and standing pose of the model. Replace current clothing with an authentic Vietnamese outfit (${garmentName}) crafted from luxury silk with gold embroidery, elegant tailored silhouette, soft natural fabric folds, editorial studio lighting, Hasselblad 8k photography.`;
    if (layers) {
      const topDesc = layers.top?.name || 'Vietnamese silk robe';
      const bottomDesc = layers.bottom?.name || 'traditional silk trousers';
      const headDesc = layers.headwear?.name ? `wearing ${layers.headwear.name} on the head, ` : '';
      const footDesc = layers.footwear?.name ? `wearing ${layers.footwear.name} on the feet, ` : '';
      fallbackPrompt = `Haute couture full-body studio portrait: strictly keep the exact face, skin tone, and standing pose of the model. Dress the model in ${topDesc} on the upper body, paired with ${bottomDesc} on the lower body, ${headDesc}${footDesc}harmonious royal Vietnamese aesthetic, Hasselblad 8k studio lighting, ultra sharp photorealistic.`;
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
 * 2. Execute Image-to-Image / Virtual Try-On using veo/gemini-3.0-pro-image
 */
export async function executeImageToImage({
  humanImageSource,
  garmentImageSource,
  prompt,
  garmentName = 'Trang phục Việt Phục',
  size = '1024x1024'
}) {
  const startTime = Date.now();
  const steps = [];

  // Step 1: Input image resolution
  steps.push({ step: 1, name: 'Chuẩn bị dữ liệu hình ảnh người mẫu & Trang phục', status: 'success' });
  const humanBuffer = await resolveImageBuffer(humanImageSource);
  if (!humanBuffer) {
    throw new Error('Không thể nạp dữ liệu ảnh người mẫu');
  }

  // Step 2: Prompt optimization check
  let finalPrompt = prompt;
  if (!finalPrompt || finalPrompt.length < 20) {
    steps.push({ step: 2, name: 'Tự động kích hoạt AI tối ưu hóa Prompt Cổ Phục...', status: 'running' });
    const optRes = await optimizeFashionPrompt({ garmentName });
    finalPrompt = optRes.optimizedPrompt;
    steps[steps.length - 1].status = 'success';
  } else {
    steps.push({ step: 2, name: 'Áp dụng Prompt mỹ thuật đã tối ưu', status: 'success' });
  }

  // Step 3: Call Image Edit API
  steps.push({ step: 3, name: 'Gửi yêu cầu đến Gemini 3.0 Pro Image Engine (Cloud GPU)...', status: 'running' });
  
  const formData = new FormData();
  const humanBlob = new Blob([humanBuffer], { type: 'image/png' });
  formData.append('image', humanBlob, 'model_portrait.png');
  formData.append('model', IMAGE_MODEL);
  formData.append('prompt', finalPrompt);
  formData.append('size', size);
  formData.append('n', '1');

  const editResponse = await axios.post(`${BASE_URL}/images/edits`, formData, {
    headers: {
      'Authorization': `Bearer ${IMAGE_API_KEY}`
    },
    timeout: 90000 // Image generation can take ~35s
  });

  steps[steps.length - 1].status = 'success';

  const remoteUrl = editResponse.data?.data?.[0]?.url;
  if (!remoteUrl) {
    throw new Error('API không trả về link ảnh kết quả');
  }

  // Step 4: Download and cache image locally
  steps.push({ step: 4, name: 'Tải và lưu trữ ảnh kết xuất độ phân giải cao vào hệ thống', status: 'running' });
  const fileHash = `remix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const localSavedPath = path.join(OUTPUT_DIR, fileHash);
  const relativeUrl = `/api/dataset/remix_outputs/${fileHash}`;

  try {
    const dlResponse = await axios.get(remoteUrl, { responseType: 'arraybuffer', timeout: 20000 });
    fs.writeFileSync(localSavedPath, Buffer.from(dlResponse.data));
    steps[steps.length - 1].status = 'success';
  } catch (dlErr) {
    console.warn('[Cache Warning]: Không thể lưu cache local, sử dụng URL gốc từ CDN:', dlErr.message);
    steps[steps.length - 1].status = 'warning';
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    success: true,
    resultUrl: fs.existsSync(localSavedPath) ? relativeUrl : remoteUrl,
    cdnUrl: remoteUrl,
    optimizedPrompt: finalPrompt,
    executionTime: `${totalTime}s`,
    modelUsed: IMAGE_MODEL,
    garmentName,
    steps,
    createdAt: new Date().toISOString()
  };
}
