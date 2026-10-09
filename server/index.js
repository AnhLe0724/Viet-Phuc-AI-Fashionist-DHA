import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { loadKeywords } from './keywords.js';
import { crawlKeywordImages, downloadAndSaveImage, loadMetadata, checkSigLipHealth } from './crawler.js';
import { generateOutfitRecommendation } from './rag.js';

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
    if (saved && fs.existsSync(saved.fullPath)) {
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

// Helper: Check SigLIP 2 / Mobile-VTON Python Service status
function checkServiceStatus() {
  checkSigLipHealth().then(status => {
    if (status.status === 'ready') {
      console.log(`[AI Suite] Python SigLIP 2 + Mobile-VTON đang hoạt động (${status.device || 'GPU/CPU'}) - Model: ${status.model_name}`);
    } else {
      console.log('[AI Suite] Python AI Service đang khởi động hoặc chưa sẵn sàng...');
    }
  }).catch(() => {});
}

// Initial status check
setTimeout(checkServiceStatus, 2000);

// 1. Get all keywords with status & categories
app.get('/api/keywords', (req, res) => {
  syncWithDisk();
  res.json({
    success: true,
    total: runtimeKeywords.length,
    keywords: runtimeKeywords
  });
});

// 2. Crawl 10 best images for a single keyword with Google SigLIP 2
app.post('/api/crawl', async (req, res) => {
  const { id, customQuery, limit = 10 } = req.body;
  const kw = runtimeKeywords.find(k => k.id === Number(id));

  if (!kw) {
    return res.status(404).json({ success: false, message: 'Keyword không tồn tại' });
  }

  kw.status = 'searching';
  if (customQuery) {
    kw.searchQuery = customQuery;
  }

  try {
    const candidates = await crawlKeywordImages(kw, Number(limit) || 10);
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

// 3. Batch crawl multiple keywords (10 images per keyword)
app.post('/api/batch-crawl', async (req, res) => {
  const { ids, onlyUncrawled, limit = 10 } = req.body;
  let targetKws = runtimeKeywords;

  if (Array.isArray(ids) && ids.length > 0) {
    const idSet = new Set(ids.map(Number));
    targetKws = runtimeKeywords.filter(k => idSet.has(k.id));
  } else if (onlyUncrawled) {
    targetKws = runtimeKeywords.filter(k => k.status !== 'saved' && k.candidates.length === 0);
  }

  const results = [];
  const concurrency = 2; // Controlled concurrency for high quality & SigLIP 2 AI processing

  for (let i = 0; i < targetKws.length; i += concurrency) {
    const chunk = targetKws.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (kw) => {
        try {
          kw.status = 'searching';
          const candidates = await crawlKeywordImages(kw, Number(limit) || 10);
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

// 6. SigLIP 2 AI Service Health & Status
app.get('/api/siglip-status', async (req, res) => {
  const status = await checkSigLipHealth();
  res.json({
    success: true,
    ...status
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

// 8.5 Mobile-VTON Virtual Try-On Endpoint
app.post('/api/try-on', async (req, res) => {
  const { topCode, topUrl, topName, bottomCode, bottomUrl, bottomName } = req.body;
  const metadata = loadMetadata();
  
  // Resolve top image path
  let resolvedTopPath = null;
  if (topCode && metadata[topCode] && metadata[topCode].fullPath && fs.existsSync(metadata[topCode].fullPath)) {
    resolvedTopPath = metadata[topCode].fullPath;
  } else if (topUrl && topUrl.startsWith('/api/dataset/')) {
    const rel = topUrl.replace('/api/dataset/', '');
    const candidatePath = path.join(DATASET_DIR, rel);
    if (fs.existsSync(candidatePath)) resolvedTopPath = candidatePath;
  }
  if (!resolvedTopPath) {
    const defaultShirt = path.join(ROOT_DIR, 'src', 'clothes', 'shirt.png');
    if (fs.existsSync(defaultShirt)) resolvedTopPath = defaultShirt;
  }

  // Resolve bottom image path
  let resolvedBottomPath = null;
  if (bottomCode && metadata[bottomCode] && metadata[bottomCode].fullPath && fs.existsSync(metadata[bottomCode].fullPath)) {
    resolvedBottomPath = metadata[bottomCode].fullPath;
  } else if (bottomUrl && bottomUrl.startsWith('/api/dataset/')) {
    const rel = bottomUrl.replace('/api/dataset/', '');
    const candidatePath = path.join(DATASET_DIR, rel);
    if (fs.existsSync(candidatePath)) resolvedBottomPath = candidatePath;
  }

  try {
    const response = await axios.post('http://127.0.0.1:5001/api/try-on', {
      topImagePath: resolvedTopPath,
      bottomImagePath: resolvedBottomPath,
      topName: topName || 'Áo Cổ Phục',
      bottomName: bottomName || 'Quần / Váy Cổ Phục'
    }, { timeout: 15000 });

    res.json(response.data);
  } catch (err) {
    console.warn('[VTON Endpoint Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Không thể kết nối dịch vụ Mobile-VTON AI (port 5001)'
    });
  }
});

// 8.6 Mobile-VTON Custom Try-On Testing Endpoint
app.post('/api/vton-custom', async (req, res) => {
  const { humanImage, garmentImage, garmentType, garmentName } = req.body;

  try {
    const response = await axios.post('http://127.0.0.1:5001/api/vton-custom', {
      humanImage,
      garmentImage,
      garmentType: garmentType || 'top',
      garmentName: garmentName || 'Trang phục thử nghiệm'
    }, { 
      timeout: 25000,
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024
    });

    res.json(response.data);
  } catch (err) {
    console.warn('[VTON Custom Endpoint Error]:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Lỗi xử lý Virtual Try-On cho ảnh tùy chỉnh (port 5001)'
    });
  }
});

// 9. Get Styling Rules Codex from phoi do.txt
app.get('/api/styling-rules', (req, res) => {
  try {
    const rulesPath = path.join(ROOT_DIR, 'src', 'knowledge', 'phoi do.txt');
    if (fs.existsSync(rulesPath)) {
      const content = fs.readFileSync(rulesPath, 'utf-8');
      res.json({
        success: true,
        content
      });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy file phoi do.txt' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Open local dataset directory in Windows Explorer
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

app.listen(PORT, () => {
  console.log(`[Backend Server] Chạy trên http://localhost:${PORT}`);
});
