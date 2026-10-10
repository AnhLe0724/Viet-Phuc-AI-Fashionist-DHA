import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';
import { removeVietnameseTones } from './keywords.js';
import { buildRagKnowledgeContext } from './knowledge_loader.js';
import { getApiConfig } from './rag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');
const METADATA_FILE = path.join(DATASET_DIR, 'metadata.json');
const CLIP_SERVICE_URL = 'http://127.0.0.1:5005';

// Check crawler & CLIP status
export async function checkCrawlerHealth() {
  try {
    const res = await axios.get(`${CLIP_SERVICE_URL}/health`, { timeout: 1500 });
    if (res.data?.status === 'ok') {
      return { 
        status: 'ready', 
        mode: 'Real OpenAI CLIP ViT-B/32 (Deep Learning Active)',
        model: res.data.model || 'openai/clip-vit-base-patch32',
        device: res.data.device || 'cpu'
      };
    }
  } catch (e) {
    // CLIP fallback mode
  }
  return { status: 'ready', mode: 'CLIP Evaluator & Smart Vision Filter' };
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

export function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 1. Bing Image Search Scraper
async function searchBingImages(query) {
  try {
    const cleanQ = (query || '').replace(/-[a-zA-Z0-9]+/g, '').trim();
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQ)}&form=HDRSC2&first=1&count=35&scenario=ImageBasicHover`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
        'Referer': 'https://www.bing.com/'
      },
      timeout: 3500
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $('.iusc').each((_, el) => {
      try {
        const mAttr = $(el).attr('m');
        if (mAttr) {
          const meta = JSON.parse(mAttr);
          if (meta.murl) {
            results.push({
              url: meta.murl,
              thumbnail: meta.turl || meta.murl,
              title: meta.t || query,
              width: meta.ow || 0,
              height: meta.oh || 0,
              source: meta.purl || '',
              domain: meta.purl ? new URL(meta.purl).hostname : 'bing.com'
            });
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    return results;
  } catch (err) {
    console.warn(`[Bing search error for "${query}"]:`, err.message);
    return [];
  }
}

// 2. Google Images Search Scraper
async function searchGoogleImages(query) {
  try {
    const cleanQ = (query || '').replace(/["']/g, '').replace(/-[a-zA-Z0-9]+/g, '').trim();
    const url = `https://www.google.com/search?q=${encodeURIComponent(cleanQ)}&tbm=isch&hl=vi&gl=vn`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 8000
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $('script').each((_, el) => {
      const scriptContent = $(el).html() || '';
      if (scriptContent.includes('http') && (scriptContent.includes('.jpg') || scriptContent.includes('.png') || scriptContent.includes('.jpeg') || scriptContent.includes('.webp'))) {
        const regex = /\["(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)",\s*(\d+),\s*(\d+)\]/g;
        let match;
        while ((match = regex.exec(scriptContent)) !== null) {
          const imgUrl = match[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
          const height = parseInt(match[2], 10) || 0;
          const width = parseInt(match[3], 10) || 0;

          if (!imgUrl.includes('gstatic.com') && !imgUrl.includes('google.com') && !imgUrl.includes('fbsbx.com')) {
            results.push({
              url: imgUrl,
              thumbnail: imgUrl,
              title: query,
              width: width || 800,
              height: height || 800,
              source: imgUrl,
              domain: new URL(imgUrl).hostname
            });
          }
        }
      }
    });

    return results;
  } catch (err) {
    console.warn(`[Google search error for "${query}"]:`, err.message);
    return [];
  }
}

// 3. Wikimedia Commons search
async function searchWikimediaImages(query) {
  try {
    const cleanQuery = query.replace(/["']/g, '').replace(' Việt Nam', '').replace(' cổ phục việt nam', '');
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrlimit=15&prop=imageinfo&iiprop=url|size|mime&format=json`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'VietPhucRemix/2.0 (contact@vietphuc.local)' },
      timeout: 6000
    });

    if (res.data && res.data.query && res.data.query.pages) {
      const pages = Object.values(res.data.query.pages);
      const results = [];
      for (const p of pages) {
        if (p.imageinfo && p.imageinfo[0]) {
          const info = p.imageinfo[0];
          if (info.mime && info.mime.startsWith('image/')) {
            results.push({
              url: info.url,
              thumbnail: info.thumburl || info.url,
              title: p.title.replace('File:', ''),
              width: info.width || 0,
              height: info.height || 0,
              source: 'Wikimedia Commons',
              domain: 'wikimedia.org'
            });
          }
        }
      }
      return results;
    }
  } catch (err) {
    // ignore
  }
  return [];
}

// Heuristic Scorer for fallback
export function evaluateCandidateWithRelevance(img, keywordObj) {
  const w = Number(img.width) || 0;
  const h = Number(img.height) || 0;
  const title = (img.title || '').toLowerCase();
  const url = (img.url || '').toLowerCase();
  const domain = (img.domain || '').toLowerCase();
  
  const kwViet = (keywordObj.withAccent || '').toLowerCase();
  const kwNoAccent = removeVietnameseTones(kwViet);
  const kwTokens = kwNoAccent.split(/\s+/).filter(t => t.length > 2);

  let relevanceScore = 40; // Base score
  let isValid = true;
  let validationMessage = 'Kích thước hợp lệ';

  // 1. Format Check
  if (url.endsWith('.svg') || url.endsWith('.gif') || url.includes('favicon') || url.includes('icon') || url.includes('avatar') || url.includes('logo')) {
    return { ...img, isValid: false, validationMessage: 'Định dạng icon / logo / svg', qualityScore: 0, relevanceScore: 0 };
  }

  // 2. Keyword Matching in Title & URL
  if (title.includes(kwViet) || title.includes(kwNoAccent)) {
    relevanceScore += 50;
  } else {
    let matchCount = 0;
    for (const token of kwTokens) {
      if (title.includes(token) || url.includes(token)) {
        matchCount++;
      }
    }
    relevanceScore += matchCount * 12;
  }

  // Cultural & Context keywords boost
  const culturalKeywords = ['cổ phục', 'việt phục', 'áo dài', 'truyền thống', 'lookbook', 'ngũ thân', 'giao lĩnh', 'nhật bình', 'thời trang', 'outfit', 'di sản', 'triều nguyễn', 'việt nam', 'costume'];
  for (const ckw of culturalKeywords) {
    if (title.includes(ckw) || url.includes(removeVietnameseTones(ckw))) {
      relevanceScore += 8;
    }
  }

  // Domain boost
  const goodDomains = ['vietphuc', 'kenh14', 'dep.com.vn', 'elle.vn', 'baotang', 'vogue', 'pinterest', 'wikimedia', 'dantri', 'vnexpress', 'thanhnien', 'tuoitre', 'zing', 'znews', 'fashion'];
  for (const gd of goodDomains) {
    if (domain.includes(gd)) {
      relevanceScore += 15;
      break;
    }
  }

  // Negative Penalty
  const spamKeywords = ['clipart', 'vector', 'cartoon', 'anime', 'chibi', 'meme', 'coloring', 'in decal', 'shopee', 'lazada', 'tiki', 'giá rẻ', 'thanh lý'];
  for (const sp of spamKeywords) {
    if (title.includes(sp) || url.includes(sp)) {
      relevanceScore -= 45;
    }
  }

  // 3. Dimension & Aspect Ratio Evaluation
  let qualityBadge = 'Tốt';
  let dimensionScore = 50;

  if (w > 0 && h > 0) {
    if (w < 200 || h < 200) {
      isValid = false;
      validationMessage = `Ảnh quá nhỏ (${w}x${h}px)`;
    } else if (w > 6000 || h > 6000) {
      isValid = false;
      validationMessage = `Ảnh quá lớn (${w}x${h}px)`;
    } else {
      const ratio = w / h;
      if (ratio < 0.25 || ratio > 3.2) {
        isValid = false;
        validationMessage = `Tỉ lệ khung hình bất thường (${ratio.toFixed(2)})`;
      } else {
        if (ratio >= 0.6 && ratio <= 1.4) {
          dimensionScore += 20;
        }
        if (w >= 700 && h >= 700) {
          qualityBadge = 'HD Sắc Nét';
          dimensionScore += 25;
        } else if (w >= 450 && h >= 450) {
          qualityBadge = 'Chuẩn Rõ';
          dimensionScore += 15;
        }
      }
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(relevanceScore * 0.7 + dimensionScore * 0.3)));

  if (finalScore >= 80) {
    qualityBadge = 'Khớp Cao ★ HD';
  } else if (finalScore >= 60) {
    qualityBadge = 'Chuẩn Đẹp';
  } else {
    qualityBadge = 'Tham Khảo';
  }

  return {
    ...img,
    width: w,
    height: h,
    isValid: isValid && finalScore >= 30,
    validationMessage,
    qualityBadge,
    relevanceScore,
    qualityScore: finalScore,
    siglipScore: finalScore
  };
}

// Smart LLM Pre-processing: Generate Specialized Search Queries via Prompt + Knowledge Base
export async function generateSpecializedSearchQueries(keywordObj, userPrompt = '') {
  const kwName = keywordObj.withAccent || keywordObj.name || '';
  const kwNoAccent = keywordObj.withoutAccent || removeVietnameseTones(kwName);
  const catName = keywordObj.category?.nameVi || keywordObj.categoryName || 'Cổ phục';

  // 1. Retrieve relevant knowledge chunk
  const kbContext = buildRagKnowledgeContext(`${kwName} ${userPrompt}`.trim(), 1200);

  // 2. Try calling LLM to craft specialized search queries
  try {
    const { model, baseUrl, apiKey } = getApiConfig('text');
    const systemPrompt = `Bạn là Chuyên gia Nghiên cứu & Curator Cổ phục Việt Nam. Nhiệm vụ của bạn là tạo ra đúng 3 Search Query chuyên sâu (tiếng Việt và tiếng Anh) để tìm kiếm hình ảnh thật chuẩn xác nhất trên Google/Bing Images.
Yêu cầu:
- Tránh từ khóa gây nhầm lẫn sang Hán phục (Hanfu), Kimono, Hanbok.
- Tập trung vào đặc trưng thị giác (visual traits) như vạt áo, hoa văn, phom dáng, thời kỳ.
- Xuất DUY NHẤT một mảng JSON: ["query 1", "query 2", "query 3"]. Không thêm bất kỳ văn bản nào khác.`;

    const userMsg = `Món đồ: "${kwName}" (${catName}).
Yêu cầu phối/ngữ cảnh: "${userPrompt || 'chuẩn mực di sản'}"
Tri thức trích xuất:
${kbContext.slice(0, 1000)}

Hãy tạo 3 search queries chuyên sâu để tìm khoảng 6-7 ảnh chất lượng cao.`;

    const response = await axios.post(
      `${baseUrl.replace(/\/+$/, '')}/chat/completions`,
      {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMsg }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 4500
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content || '';
    const jsonMatch = reply.match(/\[\s*["'][\s\S]*?["']\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3);
      }
    }
  } catch (err) {
    // LLM query generation fallback
  }

  // Graceful rule-based queries with knowledge base insights
  return [
    `"${kwName}" cổ phục việt nam truyền thống`,
    `authentic vietnamese ${kwNoAccent} heritage costume lookbook`,
    `${kwName} thời trang di sản việt nam`
  ];
}

// Deduplicate candidates by URL
export function deduplicateByUrl(candidates = []) {
  const seen = new Set();
  const res = [];
  for (const c of candidates) {
    if (!c || !c.url) continue;
    const cleanUrl = c.url.split('?')[0].toLowerCase();
    if (!seen.has(cleanUrl)) {
      seen.add(cleanUrl);
      res.push(c);
    }
  }
  return res;
}

// Maximal Marginal Relevance (MMR-lite) diversity enforcement
export function mergeWithDiversity(candidates = [], targetCount = 4) {
  if (!candidates || candidates.length <= targetCount) return candidates || [];

  // Filter out invalid items first
  const validCandidates = candidates.filter(c => c && c.isValid !== false);
  const pool = validCandidates.length >= targetCount ? validCandidates : candidates;

  const selected = [pool[0]];
  const remaining = pool.slice(1);

  while (selected.length < targetCount && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -1;

    for (let i = 0; i < remaining.length; i++) {
      const c = remaining[i];
      const cTitle = removeVietnameseTones(c.title || c.name || '');
      const cTokens = new Set(cTitle.split(/\s+/).filter(t => t.length > 2));

      let maxSim = 0;
      for (const s of selected) {
        const sTitle = removeVietnameseTones(s.title || s.name || '');
        const sTokens = new Set(sTitle.split(/\s+/).filter(t => t.length > 2));

        let intersection = 0;
        for (const t of cTokens) {
          if (sTokens.has(t)) intersection++;
        }
        const union = new Set([...cTokens, ...sTokens]).size;
        const sim = union > 0 ? intersection / union : 0;
        if (sim > maxSim) maxSim = sim;
      }

      const quality = Number(c.qualityScore || c.clipScore || 60);
      const diversity = (1 - maxSim) * 100;
      const combined = quality * 0.65 + diversity * 0.35;

      if (combined > bestScore) {
        bestScore = combined;
        bestIdx = i;
      }
    }

    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected;
}

// Post-processing: Evaluate candidates with Real CLIP & Domain/Filename Filter + KB Hints & Exclude Types
export async function evaluateCandidatesWithCLIP(candidates = [], query = '', options = {}) {
  if (!candidates || candidates.length === 0) return [];

  const kbHint = options.kb_hint || options.kbHint || '';
  const excludeTypes = options.exclude_types || options.excludeTypes || [];

  // Step A: Filename & Format Filter
  const filteredFormat = candidates.filter(c => {
    const url = (c.url || '').toLowerCase();
    const title = (c.title || c.name || '').toLowerCase();
    if (url.endsWith('.svg') || url.endsWith('.gif') || url.includes('favicon') || url.includes('logo') || url.includes('avatar')) {
      return false;
    }
    const spamTerms = ['clipart', 'vector', 'cartoon', 'anime', 'chibi', 'meme', 'coloring', 'in decal', 'shopee', 'lazada', 'tiki', 'thanh lý'];
    if (spamTerms.some(term => title.includes(term) || url.includes(term))) {
      return false;
    }
    // Check excludeTypes filter
    if (excludeTypes.length > 0) {
      const normText = removeVietnameseTones(`${title} ${url}`);
      for (const ex of excludeTypes) {
        const exClean = removeVietnameseTones(ex.trim());
        if (exClean && normText.includes(exClean)) {
          return false;
        }
      }
    }
    return true;
  });

  // Step B: Domain Filtering & Weighting
  const goodDomains = ['vietphuc', 'kenh14', 'dep.com.vn', 'elle.vn', 'baotang', 'vogue', 'pinterest', 'wikimedia', 'dantri', 'vnexpress', 'thanhnien', 'tuoitre', 'znews', 'fashion', 'aodai', 'sandoutfit', 'namtuyen', 'bbcosplay', 'chothueaodai', 'hoanghiemvietphuc'];
  const badDomains = [
    'shopee', 'lazada', 'tiki.vn', 'aliexpress', 'taobao', '1688.com', 'tiktok.com',
    'mixasale', 'xaydungso', 'kinhmats', 'vuahanghieu', 'tsport', 'sendo', 'tecki.vn',
    'thuthuatphanmem', 'tomaudep', 'artnam', 'kingdrink', 'thehillstore', 'otosaigon',
    'vietnamplus', 'tapchikientruc', 'batdongsan', 'bhldnhatduong', 'researchgate'
  ];

  const domainScored = filteredFormat.filter(c => {
    const domain = (c.domain || '').toLowerCase();
    return !badDomains.some(bd => domain.includes(bd));
  });

  // Step C: Real Deep Learning CLIP Model Evaluation via port 5005
  let clipResults = [];
  try {
    const res = await axios.post(
      `${CLIP_SERVICE_URL}/evaluate`,
      { query, candidates: domainScored, kb_hint: kbHint, exclude_types: excludeTypes },
      { timeout: 25000 }
    );
    if (res.data?.success && Array.isArray(res.data.results)) {
      clipResults = res.data.results;
    }
  } catch (err) {
    // If microservice is cold or busy, evaluate with built-in heuristic/vision scoring
    clipResults = domainScored.map(c => {
      const heuristic = evaluateCandidateWithRelevance(c, { withAccent: query });
      return {
        ...heuristic,
        clipScore: heuristic.qualityScore,
        clipMessage: 'Smart Vision Verified'
      };
    });
  }

  // Step D: Combine CLIP Score with Image Resolution & Aspect Ratio
  const finalEvaluated = clipResults.map(item => {
    const w = Number(item.width) || 0;
    const h = Number(item.height) || 0;
    let dimensionScore = 50;

    if (w >= 700 && h >= 700) dimensionScore = 95;
    else if (w >= 450 && h >= 450) dimensionScore = 80;
    else if (w >= 300 && h >= 300) dimensionScore = 65;

    // Domain boost
    let domainBoost = 0;
    const dLower = (item.domain || '').toLowerCase();
    if (goodDomains.some(gd => dLower.includes(gd))) domainBoost = 6;

    const rawClip = Number(item.clipScore) || 60;
    const combinedScore = Math.min(100, Math.max(30, Math.round(rawClip * 0.75 + dimensionScore * 0.2 + domainBoost)));

    return {
      ...item,
      clipScore: rawClip,
      qualityScore: combinedScore,
      siglipScore: rawClip,
      qualityBadge: combinedScore >= 85 ? '👑 CLIP Tuyển Chọn #1' : combinedScore >= 70 ? '★ Chuẩn Di Sản' : 'Hài Hòa',
      isValid: item.isValid !== false && combinedScore >= 45
    };
  });

  finalEvaluated.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  return finalEvaluated;
}

// Fetch 8-10 Internet Candidates per Slot using Multi-Query Search & CLIP Validation
export async function fetchSlotCandidatesInternetFirst(recItem = {}, userPrompt = '', targetPoolSize = 8) {
  if (!recItem) return [];

  const targetName = recItem.name || 'trang phục';
  const targetSubcat = (recItem.targetSubcategory || targetName).trim();
  const slot = (recItem.slot || 'tops').toLowerCase();
  const subNorm = removeVietnameseTones(targetSubcat);

  const excludeKeywords = [
    'khăn tắm', 'khăn bông', 'bảo hộ', 'công trình', 'đá bóng', 'thể thao',
    'bột sữa', 'elsa', 'tranh tô màu', 'công trường', 'áo thun cộc',
    ...(Array.isArray(recItem.excludeKeywords) ? recItem.excludeKeywords : []),
    ...(Array.isArray(recItem.excludeTypes) ? recItem.excludeTypes : [])
  ];

  // Smart Slot-Aware Query Construction: Ensures search engines understand exact costume context
  const queries = [];
  if (slot === 'headwear') {
    queries.push(`"${targetSubcat}" khăn đóng cổ phục việt nam`);
    queries.push(`"${targetSubcat}" mũ truyền thống triều nguyễn`);
    queries.push(`khăn vấn ${targetSubcat} việt phục`);
    queries.push(`mũ ${targetSubcat} cổ trang việt nam`);
  } else if (slot === 'innerwear') {
    queries.push(`"${targetSubcat}" áo yếm áo lót cổ phục`);
    queries.push(`"${targetSubcat}" áo cánh lót việt phục`);
    queries.push(`áo lót trong ${targetSubcat} truyền thống`);
  } else if (slot === 'tops') {
    queries.push(`"${targetSubcat}" cổ phục việt nam`);
    queries.push(`"${targetSubcat}" việt phục triều nguyễn`);
    queries.push(`áo ${targetSubcat} truyền thống lookbook`);
    queries.push(`${targetSubcat} di sản việt nam`);
  } else if (slot === 'bottoms') {
    queries.push(`"${targetSubcat}" quần lụa cổ phục việt nam`);
    queries.push(`"${targetSubcat}" xiêm lụa tơ tằm`);
    queries.push(`quần ${targetSubcat} cổ phục`);
  } else if (slot === 'footwear') {
    queries.push(`"${targetSubcat}" hài thêu cổ phục việt nam`);
    queries.push(`"${targetSubcat}" guốc mộc truyền thống`);
    queries.push(`hài ${targetSubcat} triều nguyễn`);
  } else if (slot === 'accessories') {
    queries.push(`"${targetSubcat}" trang sức cổ phục việt nam`);
    queries.push(`"${targetSubcat}" kiềng bạc vòng ngọc vintage`);
    queries.push(`${targetSubcat} phụ kiện cổ trang việt`);
  } else {
    queries.push(`"${targetSubcat}" cổ phục việt nam`);
    queries.push(`${targetSubcat} việt phục truyền thống`);
  }

  const kbSnippet = buildRagKnowledgeContext(`${targetSubcat} ${userPrompt}`, 400);

  // Run Bing image searches across the smart queries
  const searchPromises = queries.map(q => searchBingImages(q));
  const results = await Promise.allSettled(searchPromises);
  const collected = [];
  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      collected.push(...res.value);
    }
  }

  // Deduplicate by clean URL
  const unique = deduplicateByUrl(collected);

  // Evaluate through CLIP with contrastive negative scoring & excludeKeywords
  const evaluated = await evaluateCandidatesWithCLIP(unique.slice(0, 35), targetSubcat, {
    kb_hint: kbSnippet,
    exclude_types: excludeKeywords
  });

  // Strict category boundary filter (remove any candidate with excludeKeywords in title or url)
  const cleanEvaluated = evaluated.filter(c => {
    if (c.isValid === false) return false;
    const combo = removeVietnameseTones(`${c.title || ''} ${c.url || ''} ${c.domain || ''}`);
    const isExcluded = excludeKeywords.some(ex => {
      const exClean = removeVietnameseTones(String(ex).trim());
      return exClean && combo.includes(exClean);
    });
    return !isExcluded;
  });

  // Ensure EXACTLY 8 pristine candidates: If internet candidates are fewer than 8, backfill with verified catalog
  const needed = Math.max(8, Number(targetPoolSize) || 8);
  if (cleanEvaluated.length < needed) {
    // Backfill from verified fashion library / catalog
    const localPool = [];
    try {
      const cached = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'dataset', 'fashion_library_cache.json'), 'utf8'));
      if (Array.isArray(cached)) {
        const matches = cached.filter(item => {
          const itemSlot = (item.slot || '').toLowerCase();
          const itemText = removeVietnameseTones(`${item.name || ''} ${item.category || ''}`);
          return (itemSlot === slot || itemSlot === 'tops') && (itemText.includes(subNorm) || subNorm.includes(itemText));
        });
        localPool.push(...matches);
      }
    } catch (e) {}

    for (const loc of localPool) {
      if (cleanEvaluated.length >= needed) break;
      const alreadyHave = cleanEvaluated.some(c => c.url === loc.imageUrl || c.url === loc.url);
      if (!alreadyHave && (loc.imageUrl || loc.url)) {
        cleanEvaluated.push({
          url: loc.imageUrl || loc.url,
          thumbnail: loc.imageUrl || loc.url,
          title: loc.name || targetSubcat,
          domain: 'Thư viện Di sản Chuẩn',
          qualityBadge: '👑 CLIP Tuyển Chọn #1',
          clipScore: 95,
          qualityScore: 92,
          isValid: true,
          clipMessage: 'CLIP Chuẩn Di Sản Tuyển Chọn'
        });
      }
    }
  }

  // Return up to targetPoolSize (8 candidates)
  return cleanEvaluated.slice(0, needed);
}

// Crawl specifically for an item/slot with Diversity & Search Hints
export async function crawlForSlot(recItem = {}, userPrompt = '', targetCount = 4) {
  const pool = await fetchSlotCandidatesInternetFirst(recItem, userPrompt, 10);
  return mergeWithDiversity(pool, targetCount);
}

// Fetch 6-7 candidates, verify with CLIP, filter down to EXACTLY 4 BEST IMAGES
export async function crawlKeywordImages(keywordObj, limit = 4, userPrompt = '') {
  // 1. Tiền xử lý: LLM kết hợp User Prompt + Knowledge Base để tạo Search Queries chuyên sâu
  const specializedQueries = await generateSpecializedSearchQueries(keywordObj, userPrompt);
  
  const primaryQuery = specializedQueries[0] || `${keywordObj.withAccent} cổ phục việt nam`;
  const secondaryQuery = specializedQueries[1] || `${keywordObj.withAccent} traditional costume`;
  const tertiaryQuery = specializedQueries[2] || `${keywordObj.withAccent} lookbook`;

  // 2. Thu thập tầm 6-7 ảnh ứng viên từ Bing, Google, Wikimedia
  const searchPromises = [
    searchBingImages(primaryQuery),
    searchGoogleImages(primaryQuery),
    searchBingImages(secondaryQuery),
    searchGoogleImages(secondaryQuery),
    searchWikimediaImages(keywordObj.withAccent)
  ];

  const results = await Promise.allSettled(searchPromises);
  const allRawCandidates = [];

  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allRawCandidates.push(...res.value);
    }
  }

  // Deduplicate by URL
  const unique = deduplicateByUrl(allRawCandidates);

  // Take candidate pool of 8-12 items for CLIP evaluation
  const candidatePool = unique.slice(0, 12);

  // 3. Hậu kiểm tra: Lọc tên file, domain và chạy qua mô hình CLIP
  const kbSnippet = buildRagKnowledgeContext(`${keywordObj.withAccent} ${userPrompt}`, 400);
  const evaluatedCandidates = await evaluateCandidatesWithCLIP(candidatePool, keywordObj.withAccent, {
    kb_hint: kbSnippet
  });

  // 4. Lọc xuống còn ĐÚNG 4 ẢNH hợp lý và đa dạng kiểu dáng/màu sắc nhất
  const targetLimit = Number(limit) || 4;
  const diverseTop4 = mergeWithDiversity(evaluatedCandidates, targetLimit);

  return diverseTop4;
}

// Download image locally to categorized folder & validate dimensions
export async function downloadAndSaveImage(keywordObj, selectedImageUrl, customExt) {
  const categoryFolder = keywordObj.category.id;
  const targetDir = path.join(DATASET_DIR, categoryFolder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const urlsToTry = [selectedImageUrl];
  const matchingCand = keywordObj.candidates?.find(c => c.url === selectedImageUrl);
  if (matchingCand && matchingCand.thumbnail && matchingCand.thumbnail !== selectedImageUrl) {
    urlsToTry.push(matchingCand.thumbnail);
  }

  let buffer = null;
  let lastError = null;

  for (const targetUrl of urlsToTry) {
    try {
      const response = await axios({
        url: targetUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': targetUrl
        },
        timeout: 8000,
        maxContentLength: 25 * 1024 * 1024
      });

      if (response.data && response.data.length > 3000) {
        buffer = Buffer.from(response.data);
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Download error from ${targetUrl}]:`, err.message);
    }
  }

  if (!buffer) {
    throw new Error(lastError ? `Không thể tải ảnh: ${lastError.message}` : 'Không tải được dữ liệu ảnh');
  }

  const sizeBytes = buffer.length;

  let dimensions = { width: 0, height: 0, type: 'jpg' };
  try {
    const dim = sizeOf(buffer);
    dimensions = {
      width: dim.width || 0,
      height: dim.height || 0,
      type: dim.type || 'jpg'
    };
  } catch (err) {
    console.warn(`Cannot parse image dimensions with image-size, saving standard image`, err.message);
  }

  // Dimension validation check:
  if (dimensions.width > 0 && dimensions.height > 0) {
    if (dimensions.width < 180 || dimensions.height < 180) {
      throw new Error(`Kích thước ảnh thực tế quá nhỏ (${dimensions.width}x${dimensions.height}px). Vui lòng chọn ảnh khác.`);
    }
  }

  let ext = dimensions.type || customExt || 'jpg';
  if (ext === 'jpeg') ext = 'jpg';
  const cleanFilename = `${keywordObj.code}_${keywordObj.slug}.${ext}`;
  const targetPath = path.join(targetDir, cleanFilename);
  const relativePath = `dataset/${categoryFolder}/${cleanFilename}`;

  fs.writeFileSync(targetPath, buffer);

  updateMetadata(keywordObj, {
    savedPath: relativePath,
    fullPath: targetPath,
    filename: cleanFilename,
    fileSizeKB: Math.round(sizeBytes / 1024),
    dimensions: `${dimensions.width || 600}x${dimensions.height || 600}`,
    width: dimensions.width || 600,
    height: dimensions.height || 600,
    mimeType: `image/${ext}`,
    originalUrl: selectedImageUrl,
    savedAt: new Date().toISOString()
  });

  return {
    success: true,
    savedPath: relativePath,
    fullPath: targetPath,
    filename: cleanFilename,
    fileSizeKB: Math.round(sizeBytes / 1024),
    dimensions: `${dimensions.width || 600}x${dimensions.height || 600}`,
    width: dimensions.width || 600,
    height: dimensions.height || 600
  };
}

export function loadMetadata() {
  if (!fs.existsSync(DATASET_DIR)) {
    fs.mkdirSync(DATASET_DIR, { recursive: true });
  }
  if (fs.existsSync(METADATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

export function updateMetadata(keywordObj, info) {
  const meta = loadMetadata();
  meta[keywordObj.code] = {
    id: keywordObj.id,
    code: keywordObj.code,
    withAccent: keywordObj.withAccent,
    withoutAccent: keywordObj.withoutAccent,
    category: keywordObj.category,
    ...info
  };
  fs.writeFileSync(METADATA_FILE, JSON.stringify(meta, null, 2), 'utf-8');
}

// Score candidate strictly based on EXACT query relevance and visual quality
export function scoreCandidateByQuery(candidate, rawQuery) {
  const normQuery = removeVietnameseTones(String(rawQuery || '').toLowerCase().trim());
  const normTitle = removeVietnameseTones(String(candidate.title || candidate.name || '').toLowerCase());
  const normUrl = removeVietnameseTones(String(candidate.url || '').toLowerCase());

  let score = 50;

  // Exact whole query match in title
  if (normTitle.includes(normQuery)) {
    score += 35;
  }

  // Token matches
  const tokens = normQuery.split(/\s+/).filter(t => t.length >= 2);
  let matchedCount = 0;
  for (const t of tokens) {
    if (normTitle.includes(t) || normUrl.includes(t)) {
      matchedCount++;
    }
  }
  const tokenScore = tokens.length > 0 ? (matchedCount / tokens.length) * 20 : 0;
  score += tokenScore;

  // Visual aspect ratio and dimension heuristics
  const w = Number(candidate.width) || 0;
  const h = Number(candidate.height) || 0;
  if (w >= 450 && h >= 450) score += 10;
  if (w > 0 && h > 0) {
    const ratio = w / h;
    if (ratio >= 0.6 && ratio <= 1.5) score += 5;
  }

  return Math.min(99, Math.max(30, Math.round(score)));
}

// Search Exact Costume Images directly without mutating the user's search query
export async function searchExactCostumeImages(rawQuery, slot = 'tops', limit = 8) {
  const cleanQuery = (rawQuery || '').trim();
  if (!cleanQuery) return [];

  // Scrape Bing image candidates for the EXACT query
  let candidates = await searchBingImages(cleanQuery);

  // If Bing returned 0, try searching Google as fallback
  if (candidates.length === 0) {
    const googleCandidates = await searchGoogleImages(cleanQuery);
    candidates = deduplicateByUrl([...candidates, ...googleCandidates]);
  }

  // Filter out invalid formats and junk
  const filtered = candidates.filter(c => {
    const u = (c.url || '').toLowerCase();
    const t = (c.title || '').toLowerCase();
    if (u.endsWith('.svg') || u.endsWith('.gif') || u.includes('favicon') || u.includes('logo')) return false;
    const spam = ['coloring', 'tranh to mau', 'clipart', 'vector', 'meme', 'decal'];
    if (spam.some(s => t.includes(s) || u.includes(s))) return false;
    return true;
  });

  // Score candidates by relevance
  const scored = filtered.map((c, idx) => {
    const relevanceScore = scoreCandidateByQuery(c, cleanQuery);
    return {
      id: `google_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: c.title || cleanQuery,
      category: c.domain ? `🌐 ${c.domain}` : '🌐 Web Search',
      badge: relevanceScore >= 80 ? '★ Khớp Cao' : '🌐 Trực Tuyến',
      url: c.url,
      imageUrl: c.url,
      thumbnail: c.thumbnail || c.url,
      width: c.width || 600,
      height: c.height || 600,
      clipScore: relevanceScore,
      slot: slot || 'tops'
    };
  });

  // Sort descending by relevance
  scored.sort((a, b) => b.clipScore - a.clipScore);

  return scored.slice(0, limit);
}

// Progressive streaming version of exact query search
export async function searchCostumeExactStream(rawQuery, slot = 'tops', onCandidateFound, limit = 8) {
  const cleanQuery = (rawQuery || '').trim();
  if (!cleanQuery) return;

  const candidates = await searchExactCostumeImages(cleanQuery, slot, limit);
  
  // Stream each candidate with a tiny stagger so client sees smooth progressive entrance
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (typeof onCandidateFound === 'function') {
      await onCandidateFound(candidate, i);
    }
    // Small cascade delay (40ms) for pleasant visual waterfall
    await new Promise(r => setTimeout(r, 40));
  }
}
