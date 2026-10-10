const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = 'sk-ae9effb5a2ce8b274e72df27443de5391c9349e14fa3acccedd6edbeea2eb91f';
const BASE_URL = 'https://api.vilao.ai/v1';

const GENERATION_TASKS = [
  {
    name: 'Full-body Male Model',
    dest: path.join(__dirname, 'src', 'human model', 'man 1.jpg'),
    prompt: 'Full-body lookbook fashion studio photograph of a handsome tall Vietnamese male model standing in an elegant confident fashion pose, entire body visible from shoes up to head, centered, standing against a clean neutral light grey minimalist studio backdrop, wearing a plain dark grey fitted sleeveless tank top and fitted minimalist black trousers, soft studio rim lighting, Hasselblad 8k photography, crisp sharp focus, photorealistic, noise-free.'
  },
  {
    name: 'Full-body Female Model',
    dest: path.join(__dirname, 'src', 'human model', 'woman 1.jpg'),
    prompt: 'Full-body lookbook fashion studio photograph of a graceful slender Vietnamese female model standing in a gentle editorial fashion pose, entire body visible from feet to head, centered, standing against an off-white neutral studio background, wearing a simple plain white fitted tank top and tailored white trousers, soft daylight studio lighting, Hasselblad 8k photography, crisp sharp focus, photorealistic, noise-free.'
  },
  {
    name: 'Viet Phuc Ensemble 1 (Ao Ngu Than + Quan)',
    dest: path.join(__dirname, 'src', 'clothes', 'viet_phuc_sample.jpg'),
    mirrorDest: path.join(__dirname, 'dataset', '01_ao_co_phuc', 'VP_001_ao_ngu_than_tay_chen.jpg'),
    prompt: 'A complete full traditional Vietnamese male costume ensemble neatly laid out and styled flat on a clean neutral cream studio surface: authentic royal ruby red and golden silk brocade Ao Ngu Than tay chen (5-panel standing collar traditional Vietnamese robe with 5 golden filigree buttons and metallic gold lotus embroidery), paired with loose white silk traditional trousers (quan lua bach) and a black folded silk turban (khan dong), luxury haute couture lookbook photography, 8k resolution, photorealistic.'
  },
  {
    name: 'Viet Phuc Ensemble 2 (Ao Nhat Binh + Quan/Xiem)',
    dest: path.join(__dirname, 'dataset', '01_ao_co_phuc', 'VP_002_ao_nhat_binh_fullset.jpg'),
    prompt: 'A complete full traditional Vietnamese female royal costume ensemble styled flat on a clean neutral studio background: authentic royal Ao Nhat Binh robe in emerald green and scarlet red silk brocade with traditional square collar and multi-colored 5-striped sleeves (ngu sac), paired with a luxury golden silk embroidered skirt (xiem) and white silk trousers (quan lua), gold jewelry hairpins, lookbook studio photography, 8k ultra high resolution.'
  },
  {
    name: 'Viet Phuc Ensemble 3 (Ao Giao Linh + Quan)',
    dest: path.join(__dirname, 'dataset', '01_ao_co_phuc', 'VP_003_ao_giao_linh.jpg'),
    prompt: 'A complete traditional Vietnamese Ao Giao Linh full outfit ensemble styled on a clean neutral studio background: cross-collar deep indigo blue and gold-trimmed silk robe with wide sleeves, paired with dark tailored silk trousers and traditional waist sash, haute couture lookbook photography, ultra clean 8k resolution, photorealistic.'
  }
];

async function downloadFile(url, destPath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer',
    timeout: 60000
  });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(response.data));
  console.log(`[SAVED] ${destPath} (${(response.data.byteLength / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log('=== BẮT ĐẦU TẠO BỘ ẢNH FULL-BODY VÀ CỔ PHỤC CẢ BỘ (ÁO + QUẦN) ===');
  for (let i = 0; i < GENERATION_TASKS.length; i++) {
    const task = GENERATION_TASKS[i];
    console.log(`\n[${i + 1}/${GENERATION_TASKS.length}] Đang tạo: ${task.name}...`);
    try {
      const response = await axios.post(`${BASE_URL}/images/generations`, {
        prompt: task.prompt,
        model: 'veo/gemini-3.0-pro-image',
        n: 1,
        size: '1024x1024'
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      const imageUrl = response.data?.data?.[0]?.url;
      if (!imageUrl) {
        console.error(`[LỖI] Không nhận được URL ảnh từ API:`, response.data);
        continue;
      }

      console.log(`[URL] Đã nhận: ${imageUrl}`);
      await downloadFile(imageUrl, task.dest);
      if (task.mirrorDest) {
        fs.copyFileSync(task.dest, task.mirrorDest);
        console.log(`[MIRROR] Đã sao chép sang: ${task.mirrorDest}`);
      }
    } catch (err) {
      console.error(`[LỖI TẠO ẢNH] ${task.name}:`, err.response?.data || err.message);
    }
  }
  console.log('\n=== HOÀN TẤT TOÀN BỘ QUÁ TRÌNH TẠO ẢNH! ===');
}

run();
