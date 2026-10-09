import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { evaluateCulturalGuardrail } from './cultural_guardrail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_DIR = path.join(ROOT_DIR, 'test_b5');

/**
 * Pretty print evaluation verdict
 */
function printVerdict(testTitle, result) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 TEST CASE: ${testTitle}`);
  console.log('='.repeat(80));

  if (!result.success) {
    console.log(`❌ THẤT BẠI: ${result.error}`);
    return;
  }

  const { data, meta } = result;
  const statusEmoji = data.status === 'SAFE' ? '✅' : data.status === 'WARNING' ? '⚠️' : '🚫';
  
  console.log(`${statusEmoji} TRẠNG THÁI: [${data.status}]`);
  console.log(`📝 TÓM TẮT: ${data.summary}`);
  console.log('\n📊 ĐIỂM SỐ GIÁM ĐỊNH:');
  console.log(`   - Điểm Chuẩn Văn Hóa (Cultural Authenticity): ${data.scores.cultural_authenticity}/100`);
  console.log(`   - Điểm Hợp Hoàn Cảnh (Occasion Fit):        ${data.scores.occasion_suitability}/100`);
  console.log(`   - Điểm Thuần Phong Mỹ Tục (Decency/Taboo):   ${data.scores.decency_and_taboos}/100`);
  console.log(`   - Điểm Thẩm Mỹ (Styling Aesthetics):         ${data.scores.styling_aesthetics}/100`);
  console.log(`   🌟 TỔNG ĐIỂM: ${data.scores.overall_score}/100`);

  console.log('\n👘 NHẬN DIỆN CHI TIẾT TRANG PHỤC:');
  console.log(`   - Tên trang phục : ${data.identified_costume.detected_name}`);
  console.log(`   - Niên đại/Thời kỳ: ${data.identified_costume.period_style}`);
  console.log(`   - Kiểu cổ áo     : ${data.identified_costume.collar_type}`);
  console.log(`   - Vạt & hàng khuy: ${data.identified_costume.buttoning_side}`);
  console.log(`   - Dáng tay & form: ${data.identified_costume.sleeves_and_form}`);
  console.log(`   - Chất liệu & màu: ${data.identified_costume.material_and_color}`);

  console.log('\n✅ BẢNG CHECKLIST QUY CHUẨN:');
  console.log(`   - Chuẩn cổ phục Việt Nam  : ${data.criteria_checklist.is_vietnamese_authentic ? '✔️ ĐẠT' : '❌ KHÔNG'}`);
  console.log(`   - Kín đáo, đúng thuần phong: ${data.criteria_checklist.is_modest_and_decent ? '✔️ ĐẠT' : '❌ KHÔNG'}`);
  console.log(`   - Không vi phạm kiêng kị  : ${data.criteria_checklist.no_taboo_violated ? '✔️ ĐẠT' : '❌ KHÔNG'}`);
  console.log(`   - Hợp hoàn cảnh yêu cầu   : ${data.criteria_checklist.matches_user_occasion ? '✔️ ĐẠT' : '❌ KHÔNG'}`);
  console.log(`   - Phụ kiện hài hòa        : ${data.criteria_checklist.accessories_harmonious ? '✔️ ĐẠT' : '❌ KHÔNG'}`);

  if (data.detected_violations && data.detected_violations.length > 0) {
    console.log('\n⚠️ CẢNH BÁO / LỖI PHÁT HIỆN:');
    data.detected_violations.forEach((v, idx) => {
      console.log(`   ${idx + 1}. [${v.severity}] ${v.rule_name}`);
      console.log(`      - Chi tiết: ${v.issue_description}`);
      console.log(`      - Lý do văn hóa: ${v.cultural_reason}`);
    });
  } else {
    console.log('\n✨ KHÔNG PHÁT HIỆN LỖI SAI VĂN HÓA NÀO!');
  }

  if (data.expert_suggestions && data.expert_suggestions.length > 0) {
    console.log('\n💡 LỜI KHUYÊN & GỢI Ý TỪ CHUYÊN GIA:');
    data.expert_suggestions.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s}`);
    });
  }

  console.log(`\n🤖 Model thực thi: ${meta?.modelUsed} | Thời gian: ${meta?.evaluatedAt}`);
  console.log('='.repeat(80));
}

/**
 * Run test cases
 */
async function runTests() {
  console.log('🚀 ĐANG KHỞI CHẠY TEST SUITE BƯỚC 5: CHỐT CHẶN VĂN HÓA (CULTURAL GUARDRAIL)...');

  const testCases = [
    {
      title: 'Ảnh 1 (t1.jpg) - Nữ cổ phục áo tấc tím, chuỗi hạt, quạt nan',
      imagePath: path.join(TEST_DIR, 't1.jpg'),
      context: {
        userPrompt: 'Chụp ảnh concept nàng thơ cổ điển tại không gian trà đạo xưa',
        occasion: 'Chụp ảnh nghệ thuật, không gian trà đạo',
        weather: 'Mùa thu, 24 độ C',
        targetStyle: 'Thanh lịch, hoài cổ di sản',
        gender: 'Nữ'
      }
    },
    {
      title: 'Ảnh 2 (t2.jpg) - Nam mặc áo ngũ thân gấm xám, quạt giấy, phông cưới chữ Hỷ',
      imagePath: path.join(TEST_DIR, 't2.jpg'),
      context: {
        userPrompt: 'Chú rể diện cổ phục truyền thống trong lễ ăn hỏi / đám cưới xưa',
        occasion: 'Lễ cưới truyền thống, ăn hỏi',
        weather: 'Mát mẻ, 22 độ C',
        targetStyle: 'Trang trọng, quý phái, truyền thống',
        gender: 'Nam'
      }
    },
    {
      title: 'Ảnh 3 (VP_092) - Nữ áo dài cách tân hiện đại Y2K hồng cánh sen',
      imagePath: path.join(ROOT_DIR, 'dataset', '08_concept_lookbook_remix', 'VP_092_phong_cach_y2k_ao_dai_cach_tan.jpg'),
      context: {
        userPrompt: 'Phối đồ áo dài cách tân đi cafe dạo phố chụp ảnh sống ảo cùng bạn bè',
        occasion: 'Đi cafe, dạo phố cuối tuần',
        weather: 'Nắng ấm, 28 độ C',
        targetStyle: 'Y2K trẻ trung, cách tân hiện đại',
        gender: 'Nữ'
      }
    }
  ];

  for (const tc of testCases) {
    if (!fs.existsSync(tc.imagePath)) {
      console.warn(`⚠️ Không tìm thấy file: ${tc.imagePath}`);
      continue;
    }

    try {
      console.log(`\n⏳ Đang gửi ảnh và phân tích qua Multimodal Vision AI cho: ${tc.title}...`);
      const startTime = Date.now();
      const verdict = await evaluateCulturalGuardrail(tc.imagePath, tc.context);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⚡ Hoàn tất trong ${elapsed}s!`);
      printVerdict(tc.title, verdict);
    } catch (err) {
      console.error(`❌ Lỗi khi thực thi test case [${tc.title}]:`, err);
    }
  }

  console.log('\n🏁 HOÀN TẤT TẤT CẢ TEST CASES BƯỚC 5!');
}

runTests();
