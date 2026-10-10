// Multi-Slot Layer Catalog Items (Áo Mặc Trong, Áo Ngoài, Quần, Nón, Giày, Phụ Kiện)
export const MULTI_SLOT_CATALOG = {
  innerwear: [
    {
      id: 'inner-yem-lua',
      name: 'Áo Yếm Lụa Tơ Tằm Cổ Xây',
      category: 'Nội Y Cổ Truyền',
      badge: '👑 Lụa Đào Duyên Dáng',
      url: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
      promptPart: 'wearing traditional silk halter inner bodice (Ao Yem) gracefully layered beneath flowing outer robe'
    },
    {
      id: 'inner-ba-lo',
      name: 'Áo Ba Lỗ Lót Cotton Trắng (Tank Top / May-ô)',
      category: 'Lớp Lót Hiện Đại Remix',
      badge: '⚡ Năng Động Thoáng Mát',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing white cotton tank top undershirt comfortably layered underneath'
    },
    {
      id: 'inner-coc-tay',
      name: 'Áo Cộc Tay Lót Cotton Mỏng (Undershirt)',
      category: 'Lớp Lót Hiện Đại Remix',
      badge: '🌿 Mỏng Nhẹ Thấm Hút',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing lightweight white crewneck cotton undershirt layered beneath the traditional robe'
    },
    {
      id: 'inner-yem-dao',
      name: 'Áo Yếm Đào Thêu Sen Cổ Truyền',
      category: 'Nội Y Cổ Truyền',
      badge: '🌺 Đậm Đà Nữ Tính',
      url: '/api/dataset/01_ao_co_phuc/VP_011_ao_yem_lua.jpg',
      promptPart: 'wearing traditional embroidered silk halter bodice (Ao Yem Dao) layered neatly inside'
    },
    {
      id: 'inner-trung-linh',
      name: 'Áo Trung Lĩnh Cổ Đứng Trắng Ló Viền',
      category: 'Lớp Lót Cổ Truyền',
      badge: '👑 Ló Viền 1 Ly Chuẩn Y Lễ',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing pristine white standing-collar inner shirt (Ao Trung Linh) with its neat 1-2mm white collar rim peeking cleanly above outer robe'
    },
    {
      id: 'inner-ho-canh',
      name: 'Áo Cánh Lót Phin Trắng Cổ Tròn',
      category: 'Lớp Lót Di Sản',
      badge: 'Bông Phin Tự Nhiên',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing crisp traditional white cotton inner shirt (ao canh lot phin) layered neatly inside'
    },
    {
      id: 'inner-camisole',
      name: 'Áo Hai Dây Lụa Camisole',
      category: 'Hiện Đại Remix',
      badge: 'Thoáng Nhẹ Nữ Tính',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing delicate silk camisole inner base layer'
    },
    {
      id: 'inner-giu-nhiet',
      name: 'Áo Cổ Lọ Giữ Nhiệt Cao Cấp',
      category: 'Hiện Đại Remix',
      badge: '❄️ Giữ Ấm Mùa Đông',
      url: '/api/clothes/shirt.png',
      promptPart: 'wearing minimalist fitted black or ivory thermal turtleneck inner sweater under the heritage robe'
    },
    {
      id: 'inner-none',
      name: 'Không mặc áo lót riêng (Tự nhiên)',
      category: 'Tối Giản',
      badge: 'Tự Nhiên',
      url: null,
      promptPart: 'without distinct innerwear layer'
    }
  ],

  tops: [
    {
      id: 'top-ngu-than',
      name: 'Áo Ngũ Thân Gấm Đỏ Thêu Sen Vàng',
      category: 'Áo Cổ Phục',
      badge: 'Gấm Tơ Tằm',
      url: '/api/clothes/viet_phuc_sample.jpg',
      promptPart: 'royal ruby red silk brocade Ao Ngu Than tay chen with intricate gold lotus embroidery and 5 gold filigree buttons'
    },
    {
      id: 'top-nhat-binh',
      name: 'Áo Nhật Bình Gấm Cung Đình (Ngũ Sắc)',
      category: 'Cổ Phục Triều Nguyễn',
      badge: 'Hoàng Gia',
      url: '/api/dataset/01_ao_co_phuc/VP_002_ao_nhat_binh_fullset.jpg',
      promptPart: 'authentic royal emerald green and scarlet red silk Ao Nhat Binh robe with 5-color striped cuffs (ngu sac) and phoenix motifs'
    },
    {
      id: 'top-giao-linh',
      name: 'Áo Giao Lĩnh Chàm Xanh Cổ Chéo',
      category: 'Thời Lê Trung Hưng',
      badge: 'Quý Tộc',
      url: '/api/dataset/01_ao_co_phuc/VP_003_ao_giao_linh.jpg',
      promptPart: 'deep indigo blue silk cross-collar Ao Giao Linh robe with golden trim borders and flowing wide sleeves'
    },
    {
      id: 'top-ba-ba',
      name: 'Áo Bà Ba Nâu Đất Mộc Mạc',
      category: 'Trang Phục Dân Gian',
      badge: 'Nam Bộ',
      url: '/api/dataset/01_ao_co_phuc/VP_006_ao_ba_ba.png',
      promptPart: 'traditional earthy brown linen Vietnamese Ao Ba Ba with delicate button placket and natural drape'
    },
    {
      id: 'top-so-mi',
      name: 'Áo Sơ Mi Trắng Thêu Họa Tiết Cổ',
      category: 'Hiện Đại Remix',
      badge: 'Streetwear',
      url: '/api/clothes/shirt.png',
      promptPart: 'crisp tailored white button-down shirt with subtle Vietnamese heritage ethnic embroidered collar accents'
    }
  ],

  bottoms: [
    {
      id: 'bot-sa-trang',
      name: 'Quần Sa Bạch Hoàng Gia Ống Rộng',
      badge: 'Lụa Bạch',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_015_quan_sa_trang.jpg',
      promptPart: 'loose flowing pure white traditional Vietnamese silk trousers (quan sa bach)'
    },
    {
      id: 'bot-lua-den',
      name: 'Quần Lụa Đen Ống Suông Truyền Thống',
      badge: 'Lụa Hà Đông',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_016_quan_lua_ong_rong_truyen_thong.webp',
      promptPart: 'traditional wide-leg black Habotai silk trousers with soft natural fabric drape'
    },
    {
      id: 'bot-xiem-vang',
      name: 'Xiêm Váy Lụa Hoàng Kim Dập Ly (Nữ)',
      badge: 'Cung Đình',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_018_thuong_xep_ly.jpg',
      promptPart: 'royal golden yellow pleated silk skirt (thuong / xiem) layered with white inner trousers'
    },
    {
      id: 'bot-quan-tay',
      name: 'Quần Tây Âu Đen Slim-fit Hiện Đại',
      badge: 'Hiện Đại',
      url: '/api/dataset/02_quan_vay_co_phuc/VP_017_vay_dong.jpg',
      promptPart: 'tailored high-waisted black formal dress trousers with crisp front creases'
    }
  ],

  headwear: [
    {
      id: 'head-khan-dong',
      name: 'Khăn Đóng Lụa Đen Truyền Thống (Nam)',
      badge: 'Nam Giới',
      url: '/api/dataset/03_mu_non_khan_toc/VP_021_khan_dong_nam.jpg',
      promptPart: 'wearing authentic traditional Vietnamese black folded silk turban (khan dong) wrapped neatly on the head'
    },
    {
      id: 'head-khan-vanh',
      name: 'Khăn Vành Nữ Hoàng Tộc Dát Vàng',
      badge: 'Hoàng Hậu',
      url: '/api/dataset/03_mu_non_khan_toc/VP_022_khan_van_nu.jpg',
      promptPart: 'wearing royal Vietnamese golden yellow wrapped coronet headdress (khan vanh khai) adorned with subtle filigree ornaments'
    },
    {
      id: 'head-non-quai-thao',
      name: 'Nón Quai Thao Quai Tơ Hồng',
      badge: 'Quan Họ',
      url: '/api/dataset/03_mu_non_khan_toc/VP_023_non_quai_thao.jpg',
      promptPart: 'wearing traditional Northern Vietnamese wide flat palm-leaf hat (non quai thao) with pink silk ribbons'
    },
    {
      id: 'head-non-la',
      name: 'Nón Lá Xứ Huế Truyền Thống',
      badge: 'Truyền Thống',
      url: '/api/dataset/03_mu_non_khan_toc/VP_025_non_la_truyen_thong.jpg',
      promptPart: 'wearing classic Vietnamese conical leaf hat (non la) made from sun-dried palm leaves'
    },
    {
      id: 'head-beret',
      name: 'Mũ Beret Cổ Điển (Modern Chic)',
      badge: 'Modern Chic',
      url: '/api/dataset/03_mu_non_khan_toc/VP_028_mu_beret.jpg',
      promptPart: 'wearing stylish vintage wool black beret tilted fashionably on head'
    },
    {
      id: 'head-none',
      name: 'Không đội mũ (Giữ tóc tự nhiên)',
      badge: 'Tự Nhiên',
      url: null,
      promptPart: 'natural neat hairstyle without headwear'
    }
  ],

  footwear: [
    {
      id: 'foot-hai-theu',
      name: 'Hài Cong Thêu Hoa Sen Chỉ Vàng',
      badge: 'Cổ Điển',
      url: '/api/dataset/04_giay_dep_guoc/VP_037_hai_theu_hoa_sen.jpg',
      promptPart: 'wearing authentic curved-toe royal silk slippers (hai) with gold lotus embroidery on the feet'
    },
    {
      id: 'foot-guoc-moc',
      name: 'Guốc Mộc Quai Nhung Đỏ',
      badge: 'Dân Gian',
      url: '/api/dataset/04_giay_dep_guoc/VP_036_guoc_quai_nhung.jpg',
      promptPart: 'wearing traditional handcrafted Vietnamese wooden clogs (guoc moc) with scarlet red velvet straps'
    },
    {
      id: 'foot-oxford',
      name: 'Giày Da Oxford Cổ Điển',
      badge: 'Âu Phục',
      url: '/api/dataset/04_giay_dep_guoc/VP_042_giay_oxford_da_co_dien.jpg',
      promptPart: 'wearing polished black leather classic Oxford dress shoes on the feet'
    },
    {
      id: 'foot-sneaker',
      name: 'Giày Sneaker Trắng Tối Giản',
      badge: 'Streetwear',
      url: '/api/dataset/04_giay_dep_guoc/VP_039_sneaker_trang_co_thap.jpg',
      promptPart: 'wearing clean minimalist low-top white leather sneakers on the feet'
    }
  ],

  accessories: [
    {
      id: 'acc-the-bai',
      name: 'Ngọc Bội Thẻ Bài Cung Đình Đeo Hông',
      badge: 'Hoàng Cung',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_058_bao_the_bai_ngoc_boi_deo_hong.png',
      promptPart: 'adorned with royal green nephrite jade medallion tablet (the bai ngoc boi) with golden tassels hanging elegantly on the waist'
    },
    {
      id: 'acc-kieng-bac',
      name: 'Kiềng Bạc Chạm Khắc Sen Cổ Truyền',
      badge: 'Trang Sức',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_060_vong_kieng_bac_cham_khac.jpg',
      promptPart: 'wearing traditional handcrafted rigid silver neck ring (kieng bac) with etched lotus motifs'
    },
    {
      id: 'acc-quat-lua',
      name: 'Quạt Lụa Tròn Thêu Tay Cầm Tay',
      badge: 'Nhã Nhặn',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_068_quat_lua_tron_theu_tay.jpg',
      promptPart: 'gracefully holding a circular silk hand fan (quat lua) with delicate Vietnamese nature embroidery'
    },
    {
      id: 'acc-kinh-retro',
      name: 'Kính Retro Gọng Tròn Kim Loại',
      badge: 'Tân Cổ Giao Duyên',
      url: '/api/dataset/05_phu_kien_trang_suc/VP_066_kinh_gong_kim_loai_tron_retro.jpg',
      promptPart: 'wearing vintage round gold wire-rimmed spectacles for an intellectual artistic aesthetic'
    },
    {
      id: 'acc-none',
      name: 'Không mang phụ kiện',
      badge: 'Tối Giản',
      url: null,
      promptPart: 'minimalist styling without extra accessories'
    }
  ]
};
