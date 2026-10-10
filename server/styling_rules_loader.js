import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const STYLING_KB_DIR = path.join(ROOT_DIR, 'knowledge_base', 'styling');
const OCCASIONS_KB_DIR = path.join(ROOT_DIR, 'knowledge_base', 'occasions');

/**
 * Chapter metadata and order mapping for Heritage & Modern Styling Rules
 */
const CHAPTER_METADATA = [
  {
    file: 'layering_techniques.md',
    chapterNumber: 'Chương I',
    titleVi: 'Kỹ Thuật Phối Nhiều Lớp Trang Phục (Layering Techniques)',
    category: 'Cấu Trúc Đa Lớp',
    icon: 'Layers',
    badge: 'Di Sản & Nghi Lễ'
  },
  {
    file: 'rules_and_taboos.md',
    chapterNumber: 'Chương II',
    titleVi: 'Quy Tắc Tuyệt Đối & Điều Kiêng Kị (Rules & Taboos)',
    category: 'Chuẩn Mực Văn Hóa',
    icon: 'ShieldCheck',
    badge: 'Sống Còn'
  },
  {
    file: 'color_guide.md',
    chapterNumber: 'Chương III',
    titleVi: 'Nghệ Thuật Phối Màu Sắc Di Sản & Đương Đại',
    category: 'Màu Sắc & Ngũ Hành',
    icon: 'Sparkles',
    badge: 'Mỹ Cảm Á Đông'
  },
  {
    file: 'remix_modern_guide.md',
    chapterNumber: 'Chương IV',
    titleVi: 'Cẩm Nang Phối Việt Phục Với Thời Trang Hiện Đại (Remix & Streetwear)',
    category: 'Phong Cách Đương Đại',
    icon: 'Compass',
    badge: 'Gen Z Neo-Heritage'
  },
  {
    file: 'body_type_fit_guide.md',
    chapterNumber: 'Chương V',
    titleVi: 'Bí Quyết Tôn Dáng & Chọn Phom Cho Mọi Thể Trạng',
    category: 'Phom Dáng & Tỉ Lệ',
    icon: 'UserCheck',
    badge: 'Tôn Dáng'
  },
  {
    file: 'fabric_weather_guide.md',
    chapterNumber: 'Chương VI',
    titleVi: 'Hướng Dẫn Chọn Chất Liệu Theo Thời Tiết & Mùa Khí Hậu',
    category: 'Chất Liệu & Khí Hậu',
    icon: 'CloudSun',
    badge: 'Thời Tiết 4 Mùa'
  },
  {
    file: 'footwear_and_bags_matching.md',
    chapterNumber: 'Chương VII',
    titleVi: 'Quy Chuẩn Phối Giày Hài, Guốc Mộc & Túi Ví Phụ Kiện',
    category: 'Giày Dép & Túi',
    icon: 'Footprints',
    badge: 'Cân Đối Tổng Thể'
  },
  {
    file: 'makeup_and_hair_guide.md',
    chapterNumber: 'Chương VIII',
    titleVi: 'Nghệ Thuật Trang Điểm & Kiểu Tóc Tôn Vinh Cổ Phục',
    category: 'Trang Điểm & Tóc',
    icon: 'Smile',
    badge: 'Thần Thái'
  },
  {
    file: 'social_status_codes.md',
    chapterNumber: 'Chương IX',
    titleVi: 'Mật Mã Tôn Ti & Đẳng Cấp Xã Hội Cổ Truyền',
    category: 'Lịch Sử & Điển Chế',
    icon: 'Crown',
    badge: 'Triều Nguyễn & Lê'
  },
  {
    file: 'aesthetics_vibes.md',
    chapterNumber: 'Chương X',
    titleVi: 'Hệ Thống Thẩm Mỹ & Phong Cách Cảm Hứng (Aesthetics & Vibes)',
    category: 'Cảm Hứng Thị Giác',
    icon: 'Heart',
    badge: 'Lookbook & Concept'
  }
];

/**
 * Load all styling rules from knowledge_base/styling/
 */
export function loadHeritageStylingRules() {
  const chapters = [];
  const consolidatedPieces = [];

  for (const meta of CHAPTER_METADATA) {
    const fullPath = path.join(STYLING_KB_DIR, meta.file);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const rawContent = fs.readFileSync(fullPath, 'utf-8');
      
      // Extract title from first markdown header
      const titleMatch = rawContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : meta.titleVi;

      // Parse sub-sections (## )
      const sectionBlocks = rawContent.split(/\n(?=##\s+)/);
      const sections = [];

      for (let i = 0; i < sectionBlocks.length; i++) {
        const block = sectionBlocks[i].trim();
        if (!block) continue;

        if (i === 0 && !block.startsWith('##')) {
          sections.push({
            subId: `${meta.file.replace('.md', '')}-intro`,
            subTitle: 'Tổng Quan & Triết Lý',
            body: block.replace(/^#\s+.+\n*/, '').trim()
          });
        } else {
          const lines = block.split('\n');
          const subTitle = lines[0].replace(/^##\s+/, '').trim();
          const body = lines.slice(1).join('\n').trim();
          sections.push({
            subId: `${meta.file.replace('.md', '')}-sec-${i}`,
            subTitle,
            body
          });
        }
      }

      chapters.push({
        id: meta.file.replace('.md', ''),
        chapterNumber: meta.chapterNumber,
        title: title,
        category: meta.category,
        badge: meta.badge,
        fileName: meta.file,
        content: rawContent,
        sections
      });

      consolidatedPieces.push(`# ${meta.chapterNumber}: ${title}\n\n${rawContent}`);
    } catch (err) {
      console.warn(`[StylingRulesLoader] Error reading ${meta.file}:`, err.message);
    }
  }

  // Also include occasional guides as an Appendix Chapter
  if (fs.existsSync(OCCASIONS_KB_DIR)) {
    try {
      const occasionFiles = fs.readdirSync(OCCASIONS_KB_DIR).filter(f => f.endsWith('.md'));
      const occasionSummaries = [];

      for (const oFile of occasionFiles) {
        const oPath = path.join(OCCASIONS_KB_DIR, oFile);
        const oContent = fs.readFileSync(oPath, 'utf-8');
        const oTitleMatch = oContent.match(/^#\s+(.+)$/m);
        const oTitle = oTitleMatch ? oTitleMatch[1].trim() : oFile.replace('.md', '');
        occasionSummaries.push(`### ${oTitle}\n${oContent.slice(0, 800)}...\n\n`);
      }

      if (occasionSummaries.length > 0) {
        const appendixContent = `# Phụ Lục: Cẩm Nang Phối Đồ Theo Dịp & Hoàn Cảnh (Occasions)\n\n` + occasionSummaries.join('\n---\n');
        chapters.push({
          id: 'appendix_occasions',
          chapterNumber: 'Phụ Lục',
          title: 'Cẩm Nang Phối Đồ Theo Dịp & Sự Kiện (Occasions Guide)',
          category: 'Hoàn Cảnh & Lễ Hội',
          badge: 'Dịp Lễ & Đời Thường',
          fileName: 'occasions_all.md',
          content: appendixContent,
          sections: [
            {
              subId: 'occasions-summary',
              subTitle: 'Tổng hợp các dịp mặc Cổ phục',
              body: appendixContent
            }
          ]
        });
        consolidatedPieces.push(appendixContent);
      }
    } catch (e) {
      console.warn('[StylingRulesLoader] Occasions scan error:', e.message);
    }
  }

  return {
    chapters,
    totalChapters: chapters.length,
    consolidatedMarkdown: consolidatedPieces.join('\n\n\n---\n\n\n')
  };
}
