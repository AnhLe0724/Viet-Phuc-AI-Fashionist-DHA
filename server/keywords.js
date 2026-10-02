import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_FILE = path.join(ROOT_DIR, 'Viet Phuc Base.txt');

// Helper to remove diacritics
export function removeVietnameseTones(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

// Helper to generate slug
export function slugify(str) {
  return removeVietnameseTones(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Categorization taxonomy
export function categorizeKeyword(rawName, index) {
  const name = rawName.toLowerCase();
  
  if (name.includes('áo ngũ thân') || name.includes('giao lĩnh') || name.includes('viên lĩnh') || 
      name.includes('tứ thân') || name.includes('bà ba') || name.includes('lemur') || 
      name.includes('nữ sinh') || name.includes('nhật bình') || name.includes('đối khâm') || 
      name.includes('áo yếm') || name.includes('áo tấc') || name.includes('trấn thủ') || 
      name.includes('phong lĩnh') || name.includes('nhung cách tân')) {
    return {
      id: '01_ao_co_phuc',
      nameVi: 'Áo Cổ Phục & Truyền Thống',
      color: 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-amber-300'
    };
  }
  
  if (name.includes('quần sa') || name.includes('quần lụa') || name.includes('váy đổng') || name.includes('thường xếp ly')) {
    return {
      id: '02_quan_vay_co_phuc',
      nameVi: 'Quần & Váy Cổ Phục',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300'
    };
  }

  if (name.includes('khăn đóng') || name.includes('khăn vấn') || name.includes('nón quai thao') || 
      name.includes('nón ba tầm') || name.includes('nón lá') || name.includes('nón chóp') || 
      name.includes('nón ngựa') || name.includes('mũ beret') || name.includes('mũ bucket') || 
      name.includes('mũ lưỡi trai') || name.includes('turban') || name.includes('mũ len') || 
      name.includes('kẹp tóc') || name.includes('trâm cài') || name.includes('fedora')) {
    return {
      id: '03_mu_non_khan_toc',
      nameVi: 'Mũ Nón, Khăn & Phụ Kiện Tóc',
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300'
    };
  }

  if (name.includes('guốc') || name.includes('hài thêu') || name.includes('dép cói') || 
      name.includes('sneaker') || name.includes('loafer') || name.includes('oxford') || 
      name.includes('bốt') || name.includes('boots') || name.includes('sandal') || 
      name.includes('mary jane') || name.includes('mules') || name.includes('cao gót')) {
    return {
      id: '04_giay_dep_guoc',
      nameVi: 'Giày Dép & Guốc Cổ - Hiện Đại',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300'
    };
  }

  if (name.includes('túi') || name.includes('balo') || name.includes('thắt lưng') || 
      name.includes('dải lụa') || name.includes('thẻ bài') || name.includes('ngọc trai') || 
      name.includes('kiềng bạc') || name.includes('chỉ đỏ') || name.includes('dây chuyền') || 
      name.includes('nhẫn bạc') || name.includes('khuyên tai') || name.includes('kính') || 
      name.includes('quạt') || name.includes('ô dù')) {
    return {
      id: '05_phu_kien_trang_suc',
      nameVi: 'Phụ Kiện, Túi & Trang Sức',
      color: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30 text-fuchsia-300'
    };
  }

  if (name.includes('phông') || name.includes('croptop') || name.includes('blazer') || 
      name.includes('biker') || name.includes('bomber') || name.includes('măng tô') || 
      name.includes('hoodie') || name.includes('jean') || name.includes('cargo') || 
      name.includes('quần âu') || name.includes('tennis') || name.includes('voan') || 
      name.includes('gi-lê') || name.includes('sơ mi') || name.includes('bermuda')) {
    return {
      id: '06_trang_phuc_remix_streetwear',
      nameVi: 'Trang Phục Hiện Đại (Remix / Streetwear)',
      color: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300'
    };
  }

  if (name.includes('cúc cài') || name.includes('cổ áo') || name.includes('phượng hoàng') || 
      name.includes('thủy ba') || name.includes('lụa vạn phúc') || name.includes('đũi') || 
      name.includes('gấm')) {
    return {
      id: '07_hoa_van_chat_lieu',
      nameVi: 'Họa Tiết & Chất Liệu Vải',
      color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300'
    };
  }

  return {
    id: '08_concept_lookbook_remix',
    nameVi: 'Concept Phối Đồ & Lookbook',
    color: 'from-rose-500/20 to-violet-500/20 border-rose-500/30 text-rose-300'
  };
}

// Generate highly targeted search queries to guarantee maximum visual relevance
export function buildOptimizedQueries(rawViet, alias, categoryId) {
  const cleanViet = rawViet.trim();
  const queries = [];

  switch (categoryId) {
    case '01_ao_co_phuc':
      queries.push(`"${cleanViet}" cổ phục việt nam`);
      queries.push(`"${cleanViet}" trang phục truyền thống`);
      queries.push(`${cleanViet} việt phục triều nguyễn việt nam`);
      break;

    case '02_quan_vay_co_phuc':
      queries.push(`"${cleanViet}" cổ phục việt`);
      queries.push(`"${cleanViet}" trang phục cổ việt nam`);
      break;

    case '03_mu_non_khan_toc':
      if (cleanViet.includes('Nón') || cleanViet.includes('Khăn')) {
        queries.push(`"${cleanViet}" truyền thống việt nam`);
        queries.push(`"${cleanViet}" cổ phục`);
      } else {
        queries.push(`"${cleanViet}" ${alias || 'thời trang'}`);
      }
      break;

    case '04_giay_dep_guoc':
      if (cleanViet.includes('Guốc') || cleanViet.includes('Hài thêu') || cleanViet.includes('Dép cói')) {
        queries.push(`"${cleanViet}" truyền thống việt nam`);
        queries.push(`"${cleanViet}" cổ trang việt`);
      } else {
        queries.push(`"${cleanViet}" ${alias || 'fashion shoes'}`);
      }
      break;

    case '05_phu_kien_trang_suc':
      if (cleanViet.includes('Kiềng') || cleanViet.includes('Thẻ bài') || cleanViet.includes('Quạt') || cleanViet.includes('Ô dù')) {
        queries.push(`"${cleanViet}" cổ phục việt nam`);
        queries.push(`"${cleanViet}" truyền thống`);
      } else {
        queries.push(`"${cleanViet}" ${alias || 'phụ kiện thời trang'}`);
      }
      break;

    case '06_trang_phuc_remix_streetwear':
      queries.push(`"${cleanViet}" ${alias || 'streetwear fashion'}`);
      queries.push(`${cleanViet} aesthetic outfit`);
      break;

    case '07_hoa_van_chat_lieu':
      queries.push(`"${cleanViet}" hoa văn cổ phục việt nam`);
      queries.push(`"${cleanViet}" chất liệu vải việt nam`);
      break;

    case '08_concept_lookbook_remix':
      queries.push(`"${cleanViet}"`);
      queries.push(`${cleanViet} việt phục cách tân remix lookbook`);
      break;

    default:
      queries.push(`"${cleanViet}" việt nam`);
  }

  return queries;
}

// Load and parse base keywords
export function loadKeywords() {
  if (!fs.existsSync(BASE_FILE)) {
    throw new Error(`File not found: ${BASE_FILE}`);
  }

  const content = fs.readFileSync(BASE_FILE, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const keywords = lines.map((line, idx) => {
    let rawViet = line;
    let englishOrAlias = '';

    const parenMatch = line.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      rawViet = parenMatch[1].trim();
      englishOrAlias = parenMatch[2].trim();
    }

    const withoutAccent = removeVietnameseTones(rawViet);
    const category = categorizeKeyword(rawViet, idx);
    const slug = slugify(rawViet);
    const optimizedQueries = buildOptimizedQueries(rawViet, englishOrAlias, category.id);

    return {
      id: idx + 1,
      code: `VP_${String(idx + 1).padStart(3, '0')}`,
      rawOriginal: line,
      withAccent: rawViet,
      withoutAccent: withoutAccent,
      alias: englishOrAlias,
      slug: slug,
      category: category,
      searchQuery: optimizedQueries[0],
      suggestedQueries: optimizedQueries,
      status: 'idle', // 'idle' | 'searching' | 'ready' | 'saved' | 'failed'
      candidates: [],
      savedImage: null
    };
  });

  return keywords;
}
