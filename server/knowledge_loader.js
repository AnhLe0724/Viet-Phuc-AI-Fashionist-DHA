import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const KB_DIR = path.join(ROOT_DIR, 'knowledge_base');

/**
 * Helper to safely read a file if it exists.
 */
function safeReadFile(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

/**
 * Load core absolute rules and taboos.
 */
export function getRulesAndTaboos() {
  const filePath = path.join(KB_DIR, 'styling', 'rules_and_taboos.md');
  return safeReadFile(filePath);
}

/**
 * Load costume specifications for Vision AI verification.
 */
export function getCostumeTaxonomy() {
  const costumesDir = path.join(KB_DIR, 'costumes');
  const topsDir = path.join(costumesDir, 'tops');
  
  const files = [
    { name: 'Áo Ngũ Thân & Áo Tấc', path: path.join(costumesDir, 'ao_ngu_than.md') },
    { name: 'Áo Giao Lĩnh', path: path.join(costumesDir, 'ao_giao_linh.md') },
    { name: 'Áo Dài Nữ', path: path.join(costumesDir, 'ao_dai_nu.md') },
    { name: 'Áo Tứ Thân & Yếm', path: path.join(costumesDir, 'ao_tu_than.md') },
    { name: 'Áo Bà Ba', path: path.join(costumesDir, 'ao_ba_ba.md') },
    { name: 'Áo Nhật Bình', path: path.join(topsDir, 'ao_nhat_binh.md') },
    { name: 'Áo Viên Lĩnh', path: path.join(topsDir, 'ao_vien_linh.md') },
    { name: 'Áo Đối Khâm', path: path.join(topsDir, 'ao_doi_kham.md') }
  ];

  let taxonomyText = '';
  for (const f of files) {
    const content = safeReadFile(f.path);
    if (content) {
      // Extract key sections: Đặc điểm nhận dạng & Quy tắc
      taxonomyText += `\n### [QUY CHUẨN] ${f.name}\n${content.slice(0, 2000)}\n`;
    }
  }

  return taxonomyText;
}

/**
 * Load occasion-specific etiquette guidelines.
 */
export function getOccasionGuideline(occasionKey = '') {
  const occasionsDir = path.join(KB_DIR, 'occasions');
  if (!fs.existsSync(occasionsDir)) return '';

  const normalized = occasionKey.toLowerCase();
  let matchedFile = '';

  if (normalized.includes('chùa') || normalized.includes('le') || normalized.includes('tam linh')) {
    matchedFile = 'di_chua.md';
  } else if (normalized.includes('tet') || normalized.includes('xuan') || normalized.includes('nam moi')) {
    matchedFile = 'tet_nguyen_dan.md';
  } else if (normalized.includes('cuoi') || normalized.includes('hoi') || normalized.includes('dam cuoi')) {
    matchedFile = 'dam_cuoi_an_hoi.md';
  } else if (normalized.includes('ky yeu') || normalized.includes('tot nghiep') || normalized.includes('hoc sinh')) {
    matchedFile = 'chup_ky_yeu_tot_nghiep.md';
  } else if (normalized.includes('cafe') || normalized.includes('dao pho') || normalized.includes('di choi')) {
    matchedFile = 'daopho_caphe.md';
  } else if (normalized.includes('nghe thuat') || normalized.includes('su kien') || normalized.includes('trien lam')) {
    matchedFile = 'sukien_nghethuat.md';
  }

  if (matchedFile) {
    const fullPath = path.join(occasionsDir, matchedFile);
    return safeReadFile(fullPath);
  }

  // Fallback: return short overview of all occasion rules
  const allOccasionFiles = fs.readdirSync(occasionsDir).filter(f => f.endsWith('.md'));
  return allOccasionFiles.map(f => safeReadFile(path.join(occasionsDir, f)).slice(0, 600)).join('\n---\n');
}

/**
 * Load styling & remix guide.
 */
export function getStylingAndRemixRules() {
  const remixGuide = safeReadFile(path.join(KB_DIR, 'styling', 'remix_modern_guide.md'));
  const fabricWeather = safeReadFile(path.join(KB_DIR, 'styling', 'fabric_weather_guide.md'));
  const colorGuide = safeReadFile(path.join(KB_DIR, 'styling', 'color_guide.md'));
  
  return `
=== QUY TẮC PHỐI ĐỒ REMIX & CHẤT LIỆU THỜI TIẾT ===
${remixGuide.slice(0, 2500)}

=== QUY TẮC CHẤT LIỆU THEO THỜI TIẾT ===
${fabricWeather.slice(0, 1500)}

=== QUY TẮC MÀU SẮC & KIÊNG KỊ MÀU SẮC ===
${colorGuide.slice(0, 1500)}
`;
}

/**
 * Build the complete dynamic knowledge context for the Cultural Guardrail engine.
 */
export function buildGuardrailKnowledge(context = {}) {
  const rules = getRulesAndTaboos();
  const taxonomy = getCostumeTaxonomy();
  const occasion = getOccasionGuideline(context.occasion || context.userPrompt || '');
  const styling = getStylingAndRemixRules();

  return `
==================== BỘ NGUYÊN TẮC VĂN HÓA & QUY CHUẨN CỔ PHỤC VIỆT NAM ====================

1. QUY TẮC TUYỆT ĐỐI & ĐIỀU KIÊNG KỊ (TABOOS):
${rules}

2. QUY CHUẨN HÌNH THÁI VÀ NHẬN DIỆN CỔ PHỤC (CHO VISION AI):
${taxonomy}

3. QUY TẮC PHÙ HỢP HOÀN CẢNH / DỊP:
${occasion}

4. NGUYÊN TẮC PHỐI ĐỒ REMIX VÀ THỜI TIẾT:
${styling}
=============================================================================================
`;
}
