import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

// Thêm xlsx/xls vào danh sách "đuôi file KHÔNG phải HTML" của VitePress.
// Mặc định VitePress coi `/downloads/*.xlsx` là route HTML nên (1) SPA router
// chặn click báo 404 và (2) normalizeLink nối thêm `.html` → sai URL. Đặt vào
// process.env để Vite copy sang import.meta.env cho cả SSR lẫn client (xem
// treatAsHtml / KNOWN_EXTENSIONS trong vitepress).
process.env.VITE_EXTRA_EXTENSIONS = 'xlsx,xls'

/**
 * Gấp dấu tiếng Việt (nước → nuoc) để khách gõ không dấu vẫn tra cứu được
 * toàn văn. Dùng cho bộ chỉ mục tìm kiếm local của VitePress/MiniSearch.
 */
const foldVietnamese = (term: string): string =>
  term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

// publicDir mặc định của Vite đi theo `root = srcDir` (thư mục gốc repo),
// nên phải trỏ tường minh về `docs/public` để nút tải Excel hoạt động chuẩn.
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

export default defineConfig({
  lang: 'vi-VN',
  title: 'Cẩm nang Mở & Vận hành Quán Phở',
  description:
    'Bộ cẩm nang vận hành quán Phở/Bún bò thực chiến theo chuẩn Docs-as-Code: SOP 6 phần, mô hình tài chính YAML, định lượng nguyên liệu, food cost, điểm hòa vốn và đặc tả App.',

  // Đọc trực tiếp toàn bộ file Markdown sẵn có của repo (từ README + 01..06)
  // mà KHÔNG nhân bản hay xáo trộn file gốc.
  srcDir: '..',
  srcExclude: [
    '00-raw-notes/**', // kho ghi chú gốc — lưu trữ, không xuất bản
    'scripts/**', // mã sinh Excel — không phải nội dung thương mại
    'node_modules/**',
    'docs/**', // cấu hình + public + dist/cache của chính VitePress
    'assets/**', // file nguồn Excel (bản tải nằm trong public/downloads)
    'README.md', // trang GitHub; thay bằng index.md landing page (tránh dead link tới raw-notes/yaml)
    'CLAUDE.md', // quy tắc làm việc cho AI — không phải nội dung bán cho khách
  ],

  // Đưa output/cache về dưới .vitepress để khớp .gitignore.
  outDir: '.vitepress/dist',
  cacheDir: '.vitepress/cache',

  lastUpdated: true,

  vite: {
    publicDir,
  },

  head: [
    ['meta', { name: 'theme-color', content: '#b45309' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'vi_VN' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Cẩm nang Mở & Vận hành Quán Phở — Bộ cẩm nang thực chiến v1.1.5',
      },
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'SOP 6 phần · Mô hình tài chính YAML · Định lượng nguyên liệu · Food cost & điểm hòa vốn · Đặc tả App quản lý.',
      },
    ],
    [
      'link',
      {
        rel: 'icon',
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8D%9C%3C/text%3E%3C/svg%3E",
      },
    ],
  ],

  themeConfig: {
    nav: [
      { text: 'Trang chủ', link: '/' },
      {
        text: '01 · Tài chính',
        items: [
          {
            text: 'Quyết định đầu tư 300 triệu',
            link: '/01-financial-models/investment-decision-300m',
          },
          {
            text: 'Tỷ lệ giá thành / COGS',
            link: '/01-financial-models/ty-le-gia-thanh-COGS',
          },
        ],
      },
      {
        text: '02 · Mở quán',
        items: [
          {
            text: 'Các bước chuẩn bị cơ bản',
            link: '/02-setup-and-location/cac-buoc-chuan-bi-co-ban',
          },
          {
            text: 'Điều kiện tiên quyết',
            link: '/02-setup-and-location/dieu-kien-tien-quyet',
          },
          {
            text: 'Danh mục thiết bị',
            link: '/02-setup-and-location/danh-muc-thiet-bi',
          },
          {
            text: 'Yêu cầu máy tính tiền',
            link: '/02-setup-and-location/thiet-bi-tinh-tien',
          },
          {
            text: 'Chọn vị trí',
            link: '/02-setup-and-location/nguyen-tac-chon-vi-tri',
          },
          {
            text: 'Tự xây hay nhượng quyền',
            link: '/02-setup-and-location/nhuong-quyen-hay-khong',
          },
        ],
      },
      {
        text: '03 · SOP Vận hành',
        items: [
          { text: 'Chọn xương bò', link: '/03-sop-operations/chon-xuong-bo' },
          { text: 'Ninh xương lấy nước dùng', link: '/03-sop-operations/ninh-xuong-bo' },
          { text: 'Chọn bánh phở', link: '/03-sop-operations/chon-banh-pho' },
          { text: 'Chọn rau thơm', link: '/03-sop-operations/chon-rau-thom' },
          { text: 'Chọn thịt nạm', link: '/03-sop-operations/chon-thit-nam' },
          { text: 'Chọn thịt gầu', link: '/03-sop-operations/chon-thit-gau' },
          { text: 'Chọn & thái thịt tái', link: '/03-sop-operations/chon-thit-tai' },
          { text: 'Bảo quản thịt tái', link: '/03-sop-operations/bao-quan-thit-tai' },
          { text: 'Bảo quản thịt chín', link: '/03-sop-operations/bao-quan-thit-chin' },
          { text: 'Ra tô & giữ nhiệt', link: '/03-sop-operations/ra-to-va-giu-nhiet' },
        ],
      },
      {
        text: '04 · Nhân sự',
        link: '/04-hr-and-training/quy-trinh-tuyen-dung-va-dao-tao',
      },
      {
        text: '05 · Marketing',
        items: [
          {
            text: 'Thiết kế menu & định giá',
            link: '/05-marketing-launch/nguyen-tac-thiet-ke-menu',
          },
          {
            text: 'Bán online – offline',
            link: '/05-marketing-launch/ban-online-offline',
          },
          {
            text: 'Chọn khung giờ bán',
            link: '/05-marketing-launch/chon-gio-ban-hang',
          },
          {
            text: 'Vận hành chưa có thương hiệu',
            link: '/05-marketing-launch/chua-co-thuong-hieu',
          },
        ],
      },
      {
        text: '06 · Đặc tả App',
        link: '/06-app-specifications/system-architecture-and-specs',
      },
      {
        text: 'Tải Excel',
        link: '/downloads/Bo-Cong-Cu-Tai-Chinh-Quan-Pho-v1.1.xlsx',
        target: '_blank',
        rel: 'noopener',
      },
    ],

    sidebar: {
      '/01-financial-models/': [
        {
          text: '01 · Mô hình tài chính',
          items: [
            {
              text: 'Quyết định đầu tư 300 triệu',
              link: '/01-financial-models/investment-decision-300m',
            },
            {
              text: 'Tỷ lệ giá thành / COGS',
              link: '/01-financial-models/ty-le-gia-thanh-COGS',
            },
          ],
        },
      ],
      '/02-setup-and-location/': [
        {
          text: '02 · Mở quán & Mặt bằng',
          items: [
            {
              text: 'Các bước chuẩn bị cơ bản',
              link: '/02-setup-and-location/cac-buoc-chuan-bi-co-ban',
            },
            {
              text: 'Điều kiện tiên quyết',
              link: '/02-setup-and-location/dieu-kien-tien-quyet',
            },
            {
              text: 'Danh mục thiết bị',
              link: '/02-setup-and-location/danh-muc-thiet-bi',
            },
            {
              text: 'Yêu cầu máy tính tiền',
              link: '/02-setup-and-location/thiet-bi-tinh-tien',
            },
            {
              text: 'Chọn vị trí',
              link: '/02-setup-and-location/nguyen-tac-chon-vi-tri',
            },
            {
              text: 'Tự xây hay nhượng quyền',
              link: '/02-setup-and-location/nhuong-quyen-hay-khong',
            },
          ],
        },
      ],
      '/03-sop-operations/': [
        {
          text: '03 · SOP Vận hành',
          items: [
            { text: 'Chọn xương bò', link: '/03-sop-operations/chon-xuong-bo' },
            {
              text: 'Ninh xương lấy nước dùng',
              link: '/03-sop-operations/ninh-xuong-bo',
            },
            { text: 'Chọn bánh phở', link: '/03-sop-operations/chon-banh-pho' },
            { text: 'Chọn rau thơm', link: '/03-sop-operations/chon-rau-thom' },
            { text: 'Chọn thịt nạm', link: '/03-sop-operations/chon-thit-nam' },
            { text: 'Chọn thịt gầu', link: '/03-sop-operations/chon-thit-gau' },
            { text: 'Chọn & thái thịt tái', link: '/03-sop-operations/chon-thit-tai' },
            { text: 'Bảo quản thịt tái', link: '/03-sop-operations/bao-quan-thit-tai' },
            { text: 'Bảo quản thịt chín', link: '/03-sop-operations/bao-quan-thit-chin' },
            {
              text: 'Ra tô & giữ nhiệt',
              link: '/03-sop-operations/ra-to-va-giu-nhiet',
            },
          ],
        },
        {
          text: 'Biểu mẫu nghiệm thu',
          items: [
            {
              text: 'Phiếu theo dõi mẻ nước dùng',
              link: '/03-sop-operations/forms/phieu-me-nuoc-dung',
            },
            {
              text: 'Phiếu cân luộc & thu hồi thịt',
              link: '/03-sop-operations/forms/phieu-luoc-va-thu-hoi-thit',
            },
            {
              text: 'Phiếu ra tô chuẩn',
              link: '/03-sop-operations/forms/phieu-ra-to-chuan',
            },
            {
              text: 'Ca mẫu điền đầy đủ',
              link: '/03-sop-operations/forms/example-filled-forms',
            },
          ],
        },
      ],
      '/04-hr-and-training/': [
        {
          text: '04 · Nhân sự & Đào tạo',
          items: [
            {
              text: 'Tuyển dụng & đào tạo nhân sự',
              link: '/04-hr-and-training/quy-trinh-tuyen-dung-va-dao-tao',
            },
          ],
        },
      ],
      '/05-marketing-launch/': [
        {
          text: '05 · Marketing & Khai trương',
          items: [
            {
              text: 'Thiết kế menu & định giá',
              link: '/05-marketing-launch/nguyen-tac-thiet-ke-menu',
            },
            {
              text: 'Bán online – offline',
              link: '/05-marketing-launch/ban-online-offline',
            },
            {
              text: 'Chọn khung giờ bán',
              link: '/05-marketing-launch/chon-gio-ban-hang',
            },
            {
              text: 'Vận hành chưa có thương hiệu',
              link: '/05-marketing-launch/chua-co-thuong-hieu',
            },
          ],
        },
      ],
      '/06-app-specifications/': [
        {
          text: '06 · Đặc tả hệ thống App',
          items: [
            {
              text: 'Kiến trúc hệ thống & đặc tả',
              link: '/06-app-specifications/system-architecture-and-specs',
            },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Tìm kiếm',
            buttonAriaLabel: 'Tìm kiếm',
          },
          modal: {
            displayDetails: 'Xem chi tiết',
            resetButtonTitle: 'Xóa tìm kiếm',
            backButtonTitle: 'Đóng',
            noResultsText: 'Không tìm thấy kết quả cho',
            footer: {
              selectText: 'Chọn',
              navigateText: 'Di chuyển',
              closeText: 'Đóng',
            },
          },
        },
        miniSearch: {
          options: {
            // Cho phép tra cứu không dấu: "nuoc dung" vẫn ra "nước dùng".
            processTerm: foldVietnamese,
          },
        },
      },
    },

    outline: {
      label: 'Mục lục trang',
      level: [2, 3],
    },

    lastUpdated: {
      text: 'Cập nhật lần cuối',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },

    docFooter: {
      prev: 'Trang trước',
      next: 'Trang sau',
    },

    darkModeSwitchLabel: 'Giao diện',
    lightModeSwitchTitle: 'Chuyển sang giao diện sáng',
    darkModeSwitchTitle: 'Chuyển sang giao diện tối',
    sidebarMenuLabel: 'Mục lục',
    returnToTopLabel: 'Về đầu trang',
    langMenuLabel: 'Ngôn ngữ',
    externalLinkIcon: true,

    footer: {
      message:
        'Tài liệu vận hành F&B chuẩn Docs-as-Code — mọi con số định lượng là biến số trong YAML.',
      copyright: '© 2026 · Bộ Cẩm Nang Mở & Vận hành Quán Phở',
    },
  },
})
