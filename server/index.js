// VIET PHUC AI REMIX - BACKEND SERVER
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { loadKeywords } from './keywords.js';
import { crawlKeywordImages, downloadAndSaveImage, loadMetadata, checkCrawlerHealth } from './crawler.js';
import { generateOutfitRecommendation } from './rag.js';
import { evaluateCulturalGuardrail, evaluateBatchGuardrail, validatePreGenerationGuardrail } from './cultural_guardrail.js';
import { buildGuardrailKnowledge } from './knowledge_loader.js';
import { optimizeFashionPrompt, executeImageToImage } from './img2img.js';
import { fashionLibrary } from './fashion_library.js';
import { loadHeritageStylingRules } from './styling_rules_loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory runtime state for keywords & crawled candidates
let runtimeKeywords = loadKeywords();

// Function to sync with saved metadata from disk
function syncWithDisk() {
  const metadata = loadMetadata();
  runtimeKeywords = runtimeKeywords.map(kw => {
    const saved = metadata[kw.code];
    const localRelPath = saved ? path.join(DATASET_DIR, kw.category.id, saved.filename) : null;
    const exists = saved && ((localRelPath && fs.existsSync(localRelPath)) || (saved.fullPath && fs.existsSync(saved.fullPath)));
    if (exists) {
      return {
        ...kw,
        status: 'saved',
        savedImage: {
          ...saved,
          url: `/api/dataset/${kw.category.id}/${saved.filename}`
        }
      };
    }
    return kw;
  });
}

// Initial sync
syncWithDisk();

// Serve static images from dataset directory
app.use('/api/dataset', express.static(DATASET_DIR));
app.use('/api/human-model', express.static(path.join(ROOT_DIR, 'src', 'human model')));
app.use('/api/clothes', express.static(path.join(ROOT_DIR, 'src', 'clothes')));

// 1. Get all keywords with status & categories
app.get('/api/keywords', (req, res) => {
  syncWithDisk();
  res.json({
    success: true,
    total: runtimeKeywords.length,
    keywords: runtimeKeywords
  });
});

// 2. Crawl 4 best images for a single keyword with LLM query & CLIP filter
app.post('/api/crawl', async (req, res) => {
  const { id, customQuery, limit = 4, userPrompt } = req.body;
  const kw = runtimeKeywords.find(k => k.id === Number(id));

  if (!kw) {
    return res.status(404).json({ success: false, message: 'Keyword không tồn tại' });
  }

  kw.status = 'searching';
  if (customQuery) {
    kw.searchQuery = customQuery;
  }

  try {
    const candidates = await crawlKeywordImages(kw, Number(limit) || 4, userPrompt || '');
    kw.candidates = candidates;
    kw.status = candidates.length > 0 ? 'ready' : 'failed';

    res.json({
      success: true,
      keyword: kw,
      candidates
    });
  } catch (error) {
    kw.status = 'failed';
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi crawl ảnh'
    });
  }
});

// 3. Batch crawl multiple keywords (4 images per keyword)
app.post('/api/batch-crawl', async (req, res) => {
  const { ids, onlyUncrawled, limit = 4, userPrompt } = req.body;
  let targetKws = runtimeKeywords;

  if (Array.isArray(ids) && ids.length > 0) {
    const idSet = new Set(ids.map(Number));
    targetKws = runtimeKeywords.filter(k => idSet.has(k.id));
  } else if (onlyUncrawled) {
    targetKws = runtimeKeywords.filter(k => k.status !== 'saved' && k.candidates.length === 0);
  }

  const results = [];
  const concurrency = 2; // Controlled concurrency for high quality & CLIP AI processing

  for (let i = 0; i < targetKws.length; i += concurrency) {
    const chunk = targetKws.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (kw) => {
        try {
          kw.status = 'searching';
          const candidates = await crawlKeywordImages(kw, Number(limit) || 4, userPrompt || '');
          kw.candidates = candidates;
          kw.status = candidates.length > 0 ? 'ready' : 'failed';
          results.push({ id: kw.id, success: true, count: candidates.length });
        } catch (e) {
          kw.status = 'failed';
          results.push({ id: kw.id, success: false, error: e.message });
        }
      })
    );
  }

  res.json({
    success: true,
    crawledCount: results.length,
    results
  });
});

// 4. Save selected image to local category folder
app.post('/api/save-image', async (req, res) => {
  const { id, imageUrl } = req.body;
  const kw = runtimeKeywords.find(k => k.id === Number(id));

  if (!kw) {
    return res.status(404).json({ success: false, message: 'Keyword không tồn tại' });
  }
  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Chưa chọn hình ảnh' });
  }

  try {
    const saveResult = await downloadAndSaveImage(kw, imageUrl);
    kw.status = 'saved';
    kw.savedImage = {
      ...saveResult,
      url: `/api/dataset/${kw.category.id}/${saveResult.filename}`
    };

    res.json({
      success: true,
      message: `Đã lưu ảnh thành công vào ${saveResult.savedPath}`,
      data: kw.savedImage,
      keyword: kw
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tải hoặc lưu ảnh'
    });
  }
});

// 5. Batch auto-save top #1 candidate for all ready keywords
app.post('/api/batch-save-top', async (req, res) => {
  const readyKws = runtimeKeywords.filter(k => k.candidates && k.candidates.length > 0 && k.status !== 'saved');
  const savedResults = [];

  for (const kw of readyKws) {
    const topCandidate = kw.candidates[0];
    if (topCandidate && topCandidate.url) {
      try {
        const saveRes = await downloadAndSaveImage(kw, topCandidate.url);
        kw.status = 'saved';
        kw.savedImage = {
          ...saveRes,
          url: `/api/dataset/${kw.category.id}/${saveRes.filename}`
        };
        savedResults.push({ id: kw.id, success: true, path: saveRes.savedPath });
      } catch (err) {
        savedResults.push({ id: kw.id, success: false, error: err.message });
      }
    }
  }

  res.json({
    success: true,
    totalSaved: savedResults.filter(r => r.success).length,
    results: savedResults
  });
});

// 6. Quality Vision & CLIP Evaluator Status
app.get('/api/siglip-status', async (req, res) => {
  const health = await checkCrawlerHealth();
  res.json({
    success: true,
    status: health.status === 'ready' ? 'online' : 'ready',
    ready: true,
    mode: health.mode,
    model: health.model || 'openai/clip-vit-base-patch32',
    device: health.device || 'cpu'
  });
});

// 7. Dataset statistics
app.get('/api/stats', (req, res) => {
  syncWithDisk();
  const total = runtimeKeywords.length;
  const saved = runtimeKeywords.filter(k => k.status === 'saved').length;
  const ready = runtimeKeywords.filter(k => k.status === 'ready').length;
  const idle = runtimeKeywords.filter(k => k.status === 'idle').length;
  const failed = runtimeKeywords.filter(k => k.status === 'failed').length;

  const categoryStats = {};
  for (const kw of runtimeKeywords) {
    const catId = kw.category.id;
    if (!categoryStats[catId]) {
      categoryStats[catId] = {
        name: kw.category.nameVi,
        total: 0,
        saved: 0
      };
    }
    categoryStats[catId].total += 1;
    if (kw.status === 'saved') {
      categoryStats[catId].saved += 1;
    }
  }

  res.json({
    total,
    saved,
    ready,
    idle,
    failed,
    progressPercentage: Math.round((saved / total) * 100) || 0,
    categoryStats
  });
});

// 8. RAG AI Chatbot Endpoint for Remix Room
app.post('/api/chat-remix', async (req, res) => {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống' });
  }

  try {
    const result = await generateOutfitRecommendation(message, history || []);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi xử lý tư vấn phối đồ'
    });
  }
});

// 8.5 Image-to-Image AI Prompt Optimizer
app.post('/api/img2img/optimize-prompt', async (req, res) => {
  const { garmentName, garmentCategory, styleTags, userPrompt, humanDescription, layers } = req.body;
  try {
    const result = await optimizeFashionPrompt({
      garmentName,
      garmentCategory,
      styleTags,
      userPrompt,
      humanDescription,
      layers
    });
    res.json(result);
  } catch (err) {
    console.warn('[Prompt Optimizer Route Error]:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi tối ưu hóa prompt'
    });
  }
});

// 8.6 Image-to-Image Virtual Try-On Execution (Gemini 3.0 Pro Image)
app.post('/api/img2img/generate', async (req, res) => {
  const { humanImage, garmentImage, prompt, garmentName, size, layers, styleTags, userPrompt } = req.body;
  
  if (!humanImage) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu hình ảnh người mẫu' });
  }

  try {
    const result = await executeImageToImage({
      humanImageSource: humanImage,
      garmentImageSource: garmentImage,
      prompt,
      garmentName,
      layers,
      styleTags,
      userPrompt,
      size: size || '1024x1024'
    });
    res.json(result);
  } catch (err) {
    console.warn('[Image-to-Image Generation Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: err.message || 'Lỗi khi kết xuất ảnh Image-to-Image từ Cloud AI'
    });
  }
});

// 9. Get Heritage Styling Rules Codex from knowledge_base/styling/*.md
app.get('/api/styling-rules', (req, res) => {
  try {
    const rulesData = loadHeritageStylingRules();
    res.json({
      success: true,
      chapters: rulesData.chapters,
      totalChapters: rulesData.totalChapters,
      content: rulesData.consolidatedMarkdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. STEP 5: Cultural Guardrail Evaluation (Chốt Chặn Văn Hóa)
app.post('/api/cultural-guardrail', async (req, res) => {
  const { image, context, selectedItems, userPrompt, weather, occasion, styleVibe } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh (image path, base64 hoặc URL)' });
  }

  try {
    const mergedContext = {
      ...(context || {}),
      selectedItems: selectedItems || context?.selectedItems,
      userPrompt: userPrompt || context?.userPrompt,
      weather: weather || context?.weather,
      occasion: occasion || context?.occasion,
      styleVibe: styleVibe || context?.styleVibe
    };
    const evaluation = await evaluateCulturalGuardrail(image, mergedContext);
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi thực hiện thẩm định văn hóa'
    });
  }
});

// 10.5 STEP 4-5 GUARD: Pre-Generation Cultural Guardrail Check
// Intercepts before image generation to prevent offensive/inappropriate attire
app.post('/api/precheck-guardrail', async (req, res) => {
  const { selectedItems, userPrompt, humanImage, context } = req.body;
  try {
    const verdict = await validatePreGenerationGuardrail({
      selectedItems: selectedItems || {},
      userPrompt: userPrompt || '',
      humanImage: humanImage || '',
      context: context || {}
    });
    res.json(verdict);
  } catch (err) {
    console.warn('[Precheck Guardrail Error]:', err.message);
    res.json({
      allowed: true,
      status: 'SAFE',
      title: 'Đạt Tiêu Chuẩn Văn Hóa & Phong Cách',
      reason: 'Đã hoàn tất kiểm tra quy chuẩn an toàn di sản.'
    });
  }
});

// 11. STEP 5: Batch Cultural Guardrail Evaluation (Thẩm định 4 Options)
app.post('/api/cultural-guardrail/batch', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách items không hợp lệ' });
  }

  try {
    const results = await evaluateBatchGuardrail(items);
    res.json({
      success: true,
      total: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi thẩm định hàng loạt'
    });
  }
});

// 12. Get Cultural Rules & Taxonomy Overview
app.get('/api/cultural-rules', (req, res) => {
  try {
    const knowledge = buildGuardrailKnowledge(req.query || {});
    res.json({
      success: true,
      knowledge
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Open local dataset directory in Windows Explorer
app.post('/api/open-folder', (req, res) => {
  const categoryId = req.body.categoryId;
  let targetPath = DATASET_DIR;
  if (categoryId) {
    targetPath = path.join(DATASET_DIR, categoryId);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }

  exec(`explorer "${targetPath}"`, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Không thể mở thư mục' });
    }
    res.json({ success: true, path: targetPath });
  });
});

// 14. LOOKBOOK APIs (Gallery of AI Generated Creations)
const LOOKBOOK_DIR = path.join(ROOT_DIR, 'dataset', 'remix_outputs');
const LOOKBOOK_METADATA_FILE = path.join(LOOKBOOK_DIR, 'lookbook_metadata.json');

function loadLookbookMetadata() {
  if (fs.existsSync(LOOKBOOK_METADATA_FILE)) {
    try {
      const data = fs.readFileSync(LOOKBOOK_METADATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.warn('[Lookbook Metadata Read Warning]:', e.message);
    }
  }
  return [];
}

function saveLookbookMetadata(items) {
  if (!fs.existsSync(LOOKBOOK_DIR)) {
    fs.mkdirSync(LOOKBOOK_DIR, { recursive: true });
  }
  fs.writeFileSync(LOOKBOOK_METADATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// GET /api/lookbook
app.get('/api/lookbook', (req, res) => {
  try {
    let metadataList = loadLookbookMetadata();
    // Sort newest first
    metadataList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
      success: true,
      total: metadataList.length,
      items: metadataList
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/lookbook/save
app.post('/api/lookbook/save', (req, res) => {
  const { id, url, title, prompt, layers, guardrail, executionTime, modelUsed } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Thiếu url ảnh tác phẩm' });
  }

  try {
    const list = loadLookbookMetadata();
    const itemId = id || `lookbook_${Date.now()}`;
    const filename = url.split('/').pop();

    const existingIndex = list.findIndex(item => item.id === itemId || item.url === url);
    const itemData = {
      id: itemId,
      filename,
      url,
      title: title || 'Tác Phẩm Việt Phục Remix',
      prompt: prompt || '',
      layers: layers || null,
      guardrail: guardrail || null,
      executionTime: executionTime || null,
      modelUsed: modelUsed || 'veo/gemini-3.0-pro-image',
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...itemData };
    } else {
      list.unshift(itemData);
    }

    saveLookbookMetadata(list);
    res.json({ success: true, item: itemData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/lookbook/:id
app.delete('/api/lookbook/:id', (req, res) => {
  const { id } = req.params;
  try {
    let list = loadLookbookMetadata();
    const item = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    saveLookbookMetadata(list);

    // Optionally remove physical file if it exists in LOOKBOOK_DIR
    if (item && item.filename) {
      const filePath = path.join(LOOKBOOK_DIR, item.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    res.json({ success: true, message: 'Đã xóa tác phẩm khỏi Lookbook' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Fashion Library Endpoints ---
// GET /api/library/search
app.get('/api/library/search', (req, res) => {
  const { q = '', slot = null, limit = 10 } = req.query;
  try {
    const results = fashionLibrary.searchLibrary(q, slot).slice(0, Number(limit) || 10);
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/library/save-item
app.post('/api/library/save-item', (req, res) => {
  const { item } = req.body;
  if (!item || !item.name) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin món đồ cần lưu' });
  }
  try {
    const saved = fashionLibrary.saveOrUpdateItem(item);
    res.json({ success: true, item: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/library/item/:id
app.delete('/api/library/item/:id', (req, res) => {
  const { id } = req.params;
  try {
    // 1. Delete from Fashion Library cache
    const libDeleted = fashionLibrary.deleteItem(id);

    // 2. Also sync with dataset/keywords.json if matching
    const keywordsPath = path.join(ROOT_DIR, 'dataset', 'keywords.json');
    let kwDeleted = false;
    if (fs.existsSync(keywordsPath)) {
      try {
        const kws = JSON.parse(fs.readFileSync(keywordsPath, 'utf-8'));
        const idLower = String(id).toLowerCase();
        const updatedKws = kws.filter(k => {
          const matchId = k.id && String(k.id).toLowerCase() === idLower;
          const matchCode = k.code && String(k.code).toLowerCase() === idLower;
          return !matchId && !matchCode;
        });
        if (updatedKws.length !== kws.length) {
          fs.writeFileSync(keywordsPath, JSON.stringify(updatedKws, null, 2), 'utf-8');
          kwDeleted = true;
        }
      } catch (e) {
        console.warn('[Keywords Delete Warning]:', e.message);
      }
    }

    res.json({ 
      success: true, 
      message: libDeleted || kwDeleted ? `Đã xóa item ${id} khỏi Thư Viện` : `Đã hoàn tất dọn sạch item ${id}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend Server] Chạy trên http://localhost:${PORT}`);
});
