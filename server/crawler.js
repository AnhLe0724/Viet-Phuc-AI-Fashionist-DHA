import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';
import { removeVietnameseTones } from './keywords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_DIR = path.join(ROOT_DIR, 'dataset');
const METADATA_FILE = path.join(DATASET_DIR, 'metadata.json');

// Ensure dataset dir exists
if (!fs.existsSync(DATASET_DIR)) {
  fs.mkdirSync(DATASET_DIR, { recursive: true });
}

// User-Agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 1. Bing Image Search Scraper
async function searchBingImages(query) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1&scenario=ImageBasicHover`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
        'Referer': 'https://www.bing.com/'
      },
      timeout: 8000
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
              title: meta.t || '',
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
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=vi&gl=vn`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 8000
    });

    const $ = cheerio.load(res.data);
    const results = [];

    // Extract image metadata from Google scripts
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
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json`;
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

// Advanced Relevance & Quality Scorer
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
    relevanceScore += 50; // Exact keyword match in title
  } else {
    // Token overlap
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

  // High authority cultural domains boost
  const goodDomains = ['vietphuc', 'kenh14', 'dep.com.vn', 'elle.vn', 'baotang', 'vogue', 'pinterest', 'wikimedia', 'dantri', 'vnexpress', 'thanhnien', 'tuoitre', 'zing', 'znews', 'fashion'];
  for (const gd of goodDomains) {
    if (domain.includes(gd)) {
      relevanceScore += 15;
      break;
    }
  }

  // Negative Penalty for Irrelevant Stuff (ads, anime, memes, vector cliparts, unrelated retail)
  const spamKeywords = ['clipart', 'vector', 'cartoon', 'anime', 'chibi', 'meme', 'coloring', 'in decal', 'shopee', 'lazada', 'tiki', 'giá rẻ', 'thanh lý', 'áo thun nữ rẻ', 'sách giáo khoa'];
  for (const sp of spamKeywords) {
    if (title.includes(sp) || url.includes(sp)) {
      relevanceScore -= 45;
    }
  }

  // 3. Dimension & Aspect Ratio Evaluation
  let qualityBadge = 'Tốt';
  let dimensionScore = 50;

  if (w > 0 && h > 0) {
    if (w < 250 || h < 250) {
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
        // Ideal fashion aspect ratios (portrait 3:4, 2:3, square 1:1)
        if (ratio >= 0.6 && ratio <= 1.4) {
          dimensionScore += 20; // Portrait / square bonus
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

  // Total combined score (Relevance 70% + Dimension 30%)
  const finalScore = Math.min(100, Math.max(0, Math.round(relevanceScore * 0.7 + dimensionScore * 0.3)));

  // Badge assignment
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
    isValid: isValid && finalScore >= 35,
    validationMessage,
    qualityBadge,
    relevanceScore,
    qualityScore: finalScore
  };
}

// Fetch top 3 best images for a keyword with parallel multi-query search
export async function crawlKeywordImages(keywordObj) {
  const queriesToRun = [];

  // Primary optimized query
  if (keywordObj.searchQuery) {
    queriesToRun.push(keywordObj.searchQuery);
  }

  // Suggested secondary queries
  if (Array.isArray(keywordObj.suggestedQueries)) {
    for (const q of keywordObj.suggestedQueries) {
      if (!queriesToRun.includes(q)) {
        queriesToRun.push(q);
      }
    }
  }

  if (queriesToRun.length === 0) {
    queriesToRun.push(`"${keywordObj.withAccent}" cổ phục việt nam`);
  }

  const primaryQuery = queriesToRun[0];
  const secondaryQuery = queriesToRun[1] || `${keywordObj.withAccent} Việt Nam`;

  // Run Bing, Google, and Wikimedia in PARALLEL with Promise.allSettled for max speed & resilience
  const searchPromises = [
    searchBingImages(primaryQuery),
    searchGoogleImages(primaryQuery),
    searchBingImages(secondaryQuery),
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
  const seen = new Set();
  const unique = [];
  for (const c of allRawCandidates) {
    if (c.url && !seen.has(c.url)) {
      seen.add(c.url);
      unique.push(c);
    }
  }

  // Evaluate and rank by Relevance & Quality Score
  const evaluated = unique
    .map(c => evaluateCandidateWithRelevance(c, keywordObj))
    .filter(c => c.isValid);

  // Sort: Highest Relevance/Quality score first
  evaluated.sort((a, b) => b.qualityScore - a.qualityScore);

  // Take top 3
  const top3 = evaluated.slice(0, 3);
  return top3;
}

// Download image locally to categorized folder & validate dimensions
export async function downloadAndSaveImage(keywordObj, selectedImageUrl, customExt) {
  const categoryFolder = keywordObj.category.id;
  const targetDir = path.join(DATASET_DIR, categoryFolder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // URLs to try: primary selected URL, then thumbnail if available
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

  // Inspect real dimensions with image-size
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

  // Determine file extension
  let ext = dimensions.type || customExt || 'jpg';
  if (ext === 'jpeg') ext = 'jpg';
  const cleanFilename = `${keywordObj.code}_${keywordObj.slug}.${ext}`;
  const targetPath = path.join(targetDir, cleanFilename);
  const relativePath = `dataset/${categoryFolder}/${cleanFilename}`;

  fs.writeFileSync(targetPath, buffer);

  // Update metadata file
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

// Load or initialize metadata
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

// Save metadata entry
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
