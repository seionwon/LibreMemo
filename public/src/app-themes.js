// Built-in lightweight app atmosphere themes (zero bitmap assets; pure CSS tokens,
// procedural patterns, bundled variable Hangul fonts and WebKit/Android meta sync).

export const THEME_CATEGORIES = Object.freeze([
  Object.freeze({id: 'all', label: '전체'}),
  Object.freeze({id: 'modern', label: '모던·시스템'}),
  Object.freeze({id: 'paper', label: '서재·종이책'}),
  Object.freeze({id: 'stationery', label: '노트·다이어리'}),
  Object.freeze({id: 'nature', label: '자연·계절'}),
  Object.freeze({id: 'mood', label: '감성·아틀리에'}),
  Object.freeze({id: 'bold', label: '개성·레트로'}),
]);

export const THEME_SHAPE_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'sharp', label: '직각 (0px · 인쇄·콘솔)'}),
  Object.freeze({id: 'crisp', label: '단정 (5px · 서재·노트)'}),
  Object.freeze({id: 'soft', label: '부드러움 (14px · 밸런스)'}),
  Object.freeze({id: 'round', label: '라운드 (20px · 알약 버튼)'}),
]);

export const THEME_TEXTURE_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'none', label: '무지 단색'}),
  Object.freeze({id: 'paper', label: '한지·종이 결'}),
  Object.freeze({id: 'grid', label: '모눈 방안지'}),
  Object.freeze({id: 'lined', label: '가로 줄노트'}),
  Object.freeze({id: 'dots', label: '도트 불릿 수첩'}),
  Object.freeze({id: 'diagonal', label: '패브릭 사선 결'}),
  Object.freeze({id: 'glow', label: '오로라 은은한 빛'}),
  Object.freeze({id: 'scanline', label: '터미널 스캔라인'}),
]);

export const THEME_FONT_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'system', label: '기기 기본 산세리프'}),
  Object.freeze({id: 'sans', label: 'LibreMemo 고딕'}),
  Object.freeze({id: 'serif', label: 'LibreMemo 명조'}),
  Object.freeze({id: 'rounded', label: '라운드 소프트 고딕'}),
  Object.freeze({id: 'mono', label: '고정폭 타자기·코딩체'}),
]);

export const THEME_FRAME_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'clean', label: '깔끔한 표준 실선'}),
  Object.freeze({id: 'elevated', label: '소프트 입체 카드'}),
  Object.freeze({id: 'glass', label: '프로스트 반투명 유리'}),
  Object.freeze({id: 'editorial', label: '인쇄 매거진 구획선'}),
  Object.freeze({id: 'brutal', label: '네오 브루탈 잉크 보드'}),
  Object.freeze({id: 'stitched', label: '다이어리 점선 스티치'}),
  Object.freeze({id: 'bevel', label: '레트로 입체 베벨'}),
]);

export const THEME_ACCENT_PRESETS = Object.freeze([
  '#334155', '#2563eb', '#0071e3', '#0284c7', '#0d7480', '#1f5e45', '#3d6b35', '#4d7c0f',
  '#4f46e5', '#6d28d9', '#9333ea', '#be185d', '#b91c1c', '#c2410c', '#8a5a19', '#171717',
]);

const p = (bg, surface, surfaceMuted, text, muted, line, accent, accentSoft, onAccent, prefix) =>
  Object.freeze({bg, surface, surfaceMuted, text, muted, line, accent, accentSoft, onAccent, prefix});

export const APP_THEMES = Object.freeze([
  // 1. Modern & System (5)
  Object.freeze({
    id: 'default', category: 'modern', name: '라이브러리 데스크', summary: '차분한 슬레이트 네이비 기본 서재',
    shape: 'default', texture: 'none', font: 'system', frame: 'clean',
    light: p('#f6f7fb', '#ffffff', '#edf0f6', '#202633', '#596377', '#e0e5ee', '#334155', '#e7ecf3', '#ffffff', '#4f6d8c'),
    dark: p('#10151e', '#1b2230', '#252f40', '#f2f4f8', '#b4becf', '#374357', '#c2d2e8', '#29374a', '#10151e', '#8fb0cc'),
  }),
  Object.freeze({
    id: 'oneui-breeze', category: 'modern', name: '원UI 코발트 브리즈', summary: '큼직한 라운드 카드와 산뜻한 블루',
    shape: 'round', texture: 'none', font: 'rounded', frame: 'elevated',
    light: p('#f1f5fb', '#ffffff', '#e5edf8', '#151c28', '#526075', '#d6e0ee', '#1d5bd6', '#e0ebff', '#ffffff', '#295ec9'),
    dark: p('#0b1019', '#161e2c', '#202a3d', '#eef3fb', '#a5b4cb', '#2c3a52', '#7ab0ff', '#1e3254', '#081224', '#86b8ff'),
  }),
  Object.freeze({
    id: 'cupertino-glass', category: 'modern', name: '쿠퍼티노 프로스트 글래스', summary: '반투명 유리 질감과 은은한 오로라 빛',
    shape: 'soft', texture: 'glow', font: 'system', frame: 'glass',
    light: p('#eef3fa', '#ffffff', '#e3ebf6', '#141b26', '#505c6e', '#d3deec', '#0062cc', '#dcebff', '#ffffff', '#1d68b8'),
    dark: p('#0d121c', '#182132', '#232f45', '#f2f6fc', '#a7b5cc', '#30405b', '#66b2ff', '#1b3556', '#071322', '#7ec0ff'),
  }),
  Object.freeze({
    id: 'material-sage', category: 'modern', name: '머티리얼 세이지 토널', summary: '유칼립투스 색조가 스며든 파스텔 카드',
    shape: 'round', texture: 'none', font: 'sans', frame: 'clean',
    light: p('#edf4ef', '#f9fcf9', '#dfebe3', '#18261f', '#4d6156', '#cadbd0', '#21634c', '#d5ebe1', '#ffffff', '#2c6e57'),
    dark: p('#101915', '#192620', '#23342c', '#e7f2ec', '#a2b8ac', '#32483e', '#7fd4b3', '#214034', '#091a13', '#8ad9ba'),
  }),
  Object.freeze({
    id: 'nordic-arctic', category: 'modern', name: '노르딕 아틱 스노우', summary: '북유럽 스튜디오의 시원하고 단정한 직선미',
    shape: 'crisp', texture: 'none', font: 'sans', frame: 'clean',
    light: p('#f2f6f9', '#ffffff', '#e5edf3', '#1a2733', '#526575', '#d2dfe9', '#25587a', '#ddeaf3', '#ffffff', '#31688c'),
    dark: p('#0f161d', '#17222c', '#21303d', '#eaf1f7', '#a0b3c4', '#2f4354', '#7cc0e8', '#1d394d', '#091824', '#8cc9ed'),
  }),

  // 2. Paper & Bookish (5)
  Object.freeze({
    id: 'hanji-library', category: 'paper', name: '전통 한지 서재', summary: '따뜻한 미색 한지 결과 명조체·송연묵 청록',
    shape: 'crisp', texture: 'paper', font: 'serif', frame: 'clean',
    light: p('#f5efe2', '#fcf9f2', '#ebe3d2', '#26231d', '#635d52', '#dcd2be', '#27594b', '#dfebe4', '#ffffff', '#3c6659'),
    dark: p('#191713', '#24211b', '#302c24', '#efe9dc', '#b5ac9b', '#423d32', '#82c4ae', '#253d35', '#0f1c17', '#95ceb9'),
  }),
  Object.freeze({
    id: 'vintage-hardcover', category: 'paper', name: '빈티지 양장 도서관', summary: '고서 크림지와 버건디 가죽 책등의 품격',
    shape: 'crisp', texture: 'paper', font: 'serif', frame: 'editorial',
    light: p('#f3ead7', '#fbf6ea', '#e7dbc3', '#2b1f1a', '#69574d', '#d6c6aa', '#7c1d2e', '#f2dde0', '#ffffff', '#8a3040'),
    dark: p('#1b1413', '#271d1b', '#342725', '#f3e8df', '#bca89d', '#493733', '#f29aa6', '#462128', '#220b0f', '#f5adb7'),
  }),
  Object.freeze({
    id: 'editorial-press', category: 'paper', name: '문예지 에디토리얼 프레스', summary: '직각 지면과 선명한 먹색 잉크의 인쇄 저널',
    shape: 'sharp', texture: 'none', font: 'serif', frame: 'editorial',
    light: p('#f7f6f1', '#ffffff', '#eceae2', '#141413', '#575651', '#cfcdc3', '#181817', '#e6e5de', '#ffffff', '#3f3f3c'),
    dark: p('#121211', '#1c1c1a', '#272724', '#f4f3ee', '#b3b1a8', '#3c3b37', '#eceae2', '#32322e', '#121211', '#d2d0c6'),
  }),
  Object.freeze({
    id: 'warm-bookcafe', category: 'paper', name: '오후의 북카페 세피아', summary: '오트밀 라떼 색감과 로스팅 브라운의 온기',
    shape: 'soft', texture: 'paper', font: 'serif', frame: 'elevated',
    light: p('#f5ece2', '#fdf9f4', '#eadccf', '#2c2119', '#6b584b', '#dccab9', '#6e3f20', '#f0e2d5', '#ffffff', '#804f2e'),
    dark: p('#1a1410', '#251d18', '#332821', '#f3e9df', '#bca999', '#47382e', '#e5af87', '#3f2c1f', '#1d1108', '#ecc09e'),
  }),
  Object.freeze({
    id: 'eink-paperwhite', category: 'paper', name: '모노크롬 전자잉크 리더', summary: '눈부심을 덜어낸 무채색 E-Ink 단말기 감성',
    shape: 'crisp', texture: 'none', font: 'serif', frame: 'editorial',
    light: p('#f1f1ee', '#f9f9f7', '#e4e4e0', '#191918', '#555552', '#c8c8c2', '#262625', '#e2e2dd', '#ffffff', '#444441'),
    dark: p('#141414', '#1f1f1f', '#2b2b2b', '#ededeb', '#adadab', '#3d3d3d', '#e0e0dc', '#333333', '#141414', '#c7c7c3'),
  }),

  // 3. Stationery & Notebooks (5)
  Object.freeze({
    id: 'grid-engineering', category: 'stationery', name: '모눈 엔지니어링 노트', summary: '정밀한 방안지 격자와 만년필 블루블랙',
    shape: 'crisp', texture: 'grid', font: 'sans', frame: 'clean',
    light: p('#f3f6fa', '#ffffff', '#e6ecf5', '#172234', '#506079', '#cdd9ea', '#1e3a8a', '#dde6fb', '#ffffff', '#284aa3'),
    dark: p('#0e1420', '#172032', '#212d44', '#ebf1fb', '#a1b2cc', '#2e3e5c', '#8ab0ff', '#1e3158', '#091326', '#9dc0ff'),
  }),
  Object.freeze({
    id: 'lined-diary', category: 'stationery', name: '줄노트 리갈패드 수첩', summary: '아이보리 가로 줄노트와 루비 인덱스 포인트',
    shape: 'crisp', texture: 'lined', font: 'serif', frame: 'clean',
    light: p('#fbf6e3', '#fffdf5', '#f1e9ce', '#282218', '#665c49', '#dfd3b2', '#a61e2b', '#f8dfe2', '#ffffff', '#9e2a36'),
    dark: p('#1b1811', '#262218', '#332d21', '#f3ecd9', '#b9ae94', '#463e2d', '#f7949d', '#472227', '#24090c', '#faa8b0'),
  }),
  Object.freeze({
    id: 'dot-bullet', category: 'stationery', name: '도트 불릿 저널', summary: '점선 매트릭스 수첩과 바이올렛 스티커 카드',
    shape: 'soft', texture: 'dots', font: 'rounded', frame: 'elevated',
    light: p('#f6f4fc', '#ffffff', '#ebe6f8', '#211a34', '#5e5378', '#d9d0ee', '#5b21b6', '#ebe2ff', '#ffffff', '#6933c2'),
    dark: p('#13101f', '#1d182f', '#282240', '#f0ecfb', '#afa5ca', '#3b3259', '#c4a7ff', '#2f2152', '#150b2e', '#d1baff'),
  }),
  Object.freeze({
    id: 'kraft-scrapbook', category: 'stationery', name: '크라프트 스크랩북', summary: '재생 크라프트지와 다이어리 점선 스티치',
    shape: 'soft', texture: 'paper', font: 'sans', frame: 'stitched',
    light: p('#ecdec9', '#f7efe2', '#e1d0b6', '#2b2217', '#665642', '#cbb799', '#365918', '#dfead2', '#ffffff', '#446b22'),
    dark: p('#1c1711', '#282119', '#352c22', '#f1e6d6', '#b9a892', '#4a3e30', '#a7d979', '#2b3d1c', '#121d08', '#b7e28f'),
  }),
  Object.freeze({
    id: 'blueprint-studio', category: 'stationery', name: '아키텍트 블루프린트', summary: '건축 제도판 모눈과 고정폭 시안 블루',
    shape: 'sharp', texture: 'grid', font: 'mono', frame: 'editorial',
    light: p('#eaf3fb', '#f7fbff', '#dceaf7', '#0f2742', '#436182', '#bcd4ec', '#0353a4', '#d5e8fb', '#ffffff', '#0b6bcb'),
    dark: p('#081c36', '#0f294a', '#173760', '#e8f3ff', '#9ec0e6', '#264d7d', '#7cc0ff', '#163f6e', '#061a33', '#94cdff'),
  }),

  // 4. Nature & Seasons (5)
  Object.freeze({
    id: 'forest-moss', category: 'nature', name: '깊은 숲과 이끼 책상', summary: '편백 숲의 고요한 녹음과 안개 채광',
    shape: 'soft', texture: 'glow', font: 'sans', frame: 'elevated',
    light: p('#eaf2ec', '#f9fcf9', '#dce8df', '#17271d', '#4d6355', '#c5d8cb', '#1c593f', '#d4eadf', '#ffffff', '#266b4e'),
    dark: p('#0d1711', '#16241c', '#203328', '#e6f2ea', '#9eb8a7', '#2e4738', '#79cfa6', '#1c3d2e', '#081b12', '#8ed8b5'),
  }),
  Object.freeze({
    id: 'ocean-breeze', category: 'nature', name: '오션 호라이즌', summary: '맑은 바다 수평선과 딥 라군 틸 포인트',
    shape: 'round', texture: 'glow', font: 'sans', frame: 'glass',
    light: p('#eaf7f9', '#ffffff', '#daf0f4', '#12282e', '#49666e', '#c0dfe5', '#0b6975', '#d2f0f4', '#ffffff', '#127885'),
    dark: p('#0a181c', '#13262c', '#1c353d', '#e6f6f9', '#9bc0c8', '#2a4a54', '#6bd7e5', '#173e46', '#061d21', '#84e0ec'),
  }),
  Object.freeze({
    id: 'sakura-spring', category: 'nature', name: '사쿠라 블로섬', summary: '봄날의 화사한 로즈 파스텔과 폭신한 카드',
    shape: 'round', texture: 'glow', font: 'rounded', frame: 'elevated',
    light: p('#fcf1f5', '#ffffff', '#f6e3eb', '#2e1822', '#70505f', '#e9cad7', '#ad1457', '#fce0ec', '#ffffff', '#b82565'),
    dark: p('#1c1015', '#291820', '#37212b', '#f9e9f0', '#c7a3b3', '#4d303e', '#ff94c2', '#4a2033', '#260815', '#ffa8cd'),
  }),
  Object.freeze({
    id: 'autumn-terracotta', category: 'nature', name: '어텀 메이플 테라코타', summary: '가을 단풍의 앰버 브라운과 따뜻한 종이 결',
    shape: 'soft', texture: 'paper', font: 'serif', frame: 'clean',
    light: p('#faf2ea', '#fffcf8', '#f1e3d5', '#2d1e14', '#6e5646', '#e2cbb6', '#9a3b08', '#fbe5d4', '#ffffff', '#ab4913'),
    dark: p('#1c130e', '#281c15', '#36261d', '#f6eae1', '#c4aa97', '#4c3629', '#f7ad77', '#462916', '#231004', '#f9be92'),
  }),
  Object.freeze({
    id: 'matcha-tea', category: 'nature', name: '우지 말차 다도실', summary: '차분한 다완 크림과 깊은 말차 그린',
    shape: 'crisp', texture: 'paper', font: 'serif', frame: 'clean',
    light: p('#f1f4e9', '#fbfcf7', '#e4ead8', '#20281b', '#56624e', '#ced8be', '#376128', '#dfedd8', '#ffffff', '#457334'),
    dark: p('#131810', '#1c2418', '#263121', '#eaf0e4', '#a7b69d', '#384731', '#9bd484', '#263c1e', '#0e1b09', '#addd99'),
  }),

  // 5. Mood & Atelier (4)
  Object.freeze({
    id: 'lavender-dream', category: 'mood', name: '라벤더 더스크', summary: '보랏빛 노을 안개와 반투명 유리 카드',
    shape: 'round', texture: 'glow', font: 'rounded', frame: 'glass',
    light: p('#f4f1fc', '#ffffff', '#e8e2f8', '#221b35', '#5e547a', '#d7cef0', '#6326bf', '#ece3ff', '#ffffff', '#7138c9'),
    dark: p('#141021', '#1e1931', '#292242', '#f1ecfc', '#b1a6ce', '#3d335c', '#c8abff', '#312254', '#170c30', '#d4bdff'),
  }),
  Object.freeze({
    id: 'peach-sorbet', category: 'mood', name: '피치 코랄 소르베', summary: '살구빛 도트 캔버스와 생기 있는 코랄',
    shape: 'round', texture: 'dots', font: 'rounded', frame: 'elevated',
    light: p('#fff3ed', '#ffffff', '#fbe5da', '#2f1c15', '#715449', '#eccbc0', '#b83814', '#ffe4db', '#ffffff', '#c44521'),
    dark: p('#1d1310', '#2a1c17', '#382620', '#f9ebe5', '#c8a89d', '#4f362e', '#ffa285', '#492419', '#260d06', '#ffb49c'),
  }),
  Object.freeze({
    id: 'midnight-astronomy', category: 'mood', name: '천문대 별빛 살롱', summary: '별자리 도트 무늬와 미드나잇 인디고·골드',
    shape: 'soft', texture: 'dots', font: 'serif', frame: 'elevated',
    light: p('#eff1f9', '#fbfcff', '#e2e6f3', '#191e36', '#52597a', '#ccd2e8', '#2e2a85', '#e2e2fb', '#ffffff', '#3d399c'),
    dark: p('#0b0e1d', '#141930', '#1e2544', '#eef0fb', '#a5add1', '#2f3963', '#f5c451', '#38321c', '#1c1403', '#9db2ff'),
  }),
  Object.freeze({
    id: 'royal-velvet', category: 'mood', name: '로열 벨벳 & 앤티크 골드', summary: '클래식 살롱의 플럼 벨벳과 골드 장식선',
    shape: 'crisp', texture: 'diagonal', font: 'serif', frame: 'editorial',
    light: p('#f8f4ee', '#fffdf9', '#eee6da', '#281926', '#695365', '#dfd2c3', '#631d56', '#f4e0f0', '#ffffff', '#7a296b'),
    dark: p('#171019', '#231826', '#302234', '#f5ebf4', '#c1abc0', '#48334c', '#ecc05a', '#3d3119', '#1e1503', '#e5a4df'),
  }),

  // 6. Bold, Tech & Retro (4)
  Object.freeze({
    id: 'neo-brutal-pop', category: 'bold', name: '네오 브루탈 팝 스튜디오', summary: '굵은 블랙 잉크 테두리와 오프셋 하드 그림자',
    shape: 'crisp', texture: 'dots', font: 'sans', frame: 'brutal',
    light: p('#fffbeb', '#ffffff', '#fef3c7', '#111827', '#4b5563', '#111827', '#1d4ed8', '#dbeafe', '#ffffff', '#1e40af'),
    dark: p('#141418', '#1f2028', '#2b2d38', '#f9fafb', '#c4c9d4', '#e5e7eb', '#facc15', '#3b3514', '#141204', '#93c5fd'),
  }),
  Object.freeze({
    id: 'pop-mint-candy', category: 'bold', name: '민트 팝 인디 보드', summary: '상큼한 민트 캔버스와 또렷한 만화책 윤곽선',
    shape: 'soft', texture: 'diagonal', font: 'rounded', frame: 'brutal',
    light: p('#e8fbf3', '#ffffff', '#d3f5e7', '#132620', '#446158', '#16382e', '#047857', '#ccf7e8', '#ffffff', '#065f46'),
    dark: p('#0d1915', '#162721', '#20362e', '#ebfaf4', '#a3c7ba', '#8ce6c6', '#34d399', '#173f31', '#051b13', '#6ee7b7'),
  }),
  Object.freeze({
    id: 'cyber-terminal', category: 'bold', name: '사이버 터미널 콘솔', summary: '개발자 고정폭 글꼴과 스캔라인 네온 그린',
    shape: 'sharp', texture: 'scanline', font: 'mono', frame: 'editorial',
    light: p('#ebf3ef', '#f7fcf9', '#dceae3', '#0f241b', '#426153', '#b8d4c7', '#046c4e', '#d1f2e6', '#ffffff', '#067a59'),
    dark: p('#070d0a', '#0e1713', '#16241e', '#e2f7ec', '#8ebaa5', '#234235', '#22e59b', '#103829', '#041a11', '#47f0af'),
  }),
  Object.freeze({
    id: 'retro-classic-os', category: 'bold', name: '레트로 95 데스크톱', summary: '추억의 워크스테이션 입체 베벨과 시스템 네이비',
    shape: 'sharp', texture: 'none', font: 'mono', frame: 'bevel',
    light: p('#dedcd5', '#efede8', '#d2cfc7', '#141414', '#4f4e4a', '#9e9b93', '#004e89', '#d2e3f3', '#ffffff', '#005a9e'),
    dark: p('#181c20', '#23292f', '#2e363e', '#edf0f2', '#a8b2bc', '#4a5561', '#6bb8ff', '#1c3752', '#071626', '#8ac8ff'),
  }),
]);

const THEME_BY_ID = new Map(APP_THEMES.map(theme => [theme.id, theme]));
const SHAPES = new Set(THEME_SHAPE_OPTIONS.map(o => o.id));
const TEXTURES = new Set(THEME_TEXTURE_OPTIONS.map(o => o.id));
const FONTS = new Set(THEME_FONT_OPTIONS.map(o => o.id));
const FRAMES = new Set(THEME_FRAME_OPTIONS.map(o => o.id));

export const DEFAULT_DESIGN_THEME = Object.freeze({
  id: 'default',
  shape: 'theme',
  texture: 'theme',
  font: 'theme',
  frame: 'theme',
  accent: '',
});

const FONT_STACKS = Object.freeze({
  system: 'HTMLMemoSans,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  sans: '"LibreMemo Sans",HTMLMemoSans,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif',
  serif: '"LibreMemo Serif","Iropke Batang","RIDIBatang",Georgia,"AppleMyungjo","Batang",serif',
  rounded: 'ui-rounded,"SF Pro Rounded","Apple SD Gothic Neo","LibreMemo Sans",system-ui,sans-serif',
  mono: 'ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"LibreMemo Sans",monospace',
});

const SHAPE_TOKENS = Object.freeze({
  default: Object.freeze({library: '8px', button: '10px', heroButton: '6px', dialog: '13px', popover: '10px', toolbar: '5px', control: '6px', panel: '18px'}),
  sharp: Object.freeze({library: '0px', button: '0px', heroButton: '0px', dialog: '2px', popover: '2px', toolbar: '2px', control: '0px', panel: '0px'}),
  crisp: Object.freeze({library: '5px', button: '6px', heroButton: '5px', dialog: '8px', popover: '7px', toolbar: '5px', control: '4px', panel: '8px'}),
  soft: Object.freeze({library: '14px', button: '11px', heroButton: '9px', dialog: '18px', popover: '14px', toolbar: '10px', control: '8px', panel: '16px'}),
  round: Object.freeze({library: '20px', button: '999px', heroButton: '999px', dialog: '24px', popover: '18px', toolbar: '999px', control: '11px', panel: '22px'}),
});

const ICON_STROKES = Object.freeze({
  clean: '1.7',
  elevated: '1.75',
  glass: '1.65',
  editorial: '1.4',
  brutal: '2.15',
  stitched: '1.8',
  bevel: '1.85',
});

function parseHex(hex) {
  const raw = String(hex || '').replace(/^#/, '');
  const n = Number.parseInt(raw, 16);
  return {r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255};
}

function toHex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mixHex(a, b, weightA) {
  const ca = parseHex(a), cb = parseHex(b), w = Math.max(0, Math.min(1, weightA));
  return toHex(ca.r * w + cb.r * (1 - w), ca.g * w + cb.g * (1 - w), ca.b * w + cb.b * (1 - w));
}

export function relativeLuminance(hex) {
  const {r, g, b} = parseHex(hex);
  const channel = v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function readableAccentForSurface(accentHex, surfaceHex, mode) {
  let candidate = accentHex.toLowerCase();
  const target = 4.5;
  for (let step = 0; step < 18 && contrastRatio(candidate, surfaceHex) < target; step++) {
    candidate = mixHex(candidate, mode === 'dark' ? '#ffffff' : '#000000', 0.86);
  }
  return candidate;
}

function onAccentColor(accentHex) {
  return contrastRatio(accentHex, '#ffffff') >= contrastRatio(accentHex, '#10151e') ? '#ffffff' : '#10151e';
}

export function normalizeDesignTheme(value) {
  if (value === undefined) return {...DEFAULT_DESIGN_THEME};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('디자인 테마 설정이 올바르지 않습니다.');
  const id = value.id ?? DEFAULT_DESIGN_THEME.id;
  const shape = value.shape ?? DEFAULT_DESIGN_THEME.shape;
  const texture = value.texture ?? DEFAULT_DESIGN_THEME.texture;
  const font = value.font ?? DEFAULT_DESIGN_THEME.font;
  const frame = value.frame ?? DEFAULT_DESIGN_THEME.frame;
  const rawAccent = value.accent === undefined || value.accent === null ? '' : String(value.accent).trim();
  if (typeof id !== 'string' || !THEME_BY_ID.has(id)) throw new Error('디자인 테마 ID가 올바르지 않습니다.');
  if (!SHAPES.has(shape) || !TEXTURES.has(texture) || !FONTS.has(font) || !FRAMES.has(frame)) throw new Error('디자인 테마 세부 스타일 설정이 올바르지 않습니다.');
  if (rawAccent !== '' && !/^#[\da-f]{6}$/i.test(rawAccent)) throw new Error('디자인 테마 강조 색상이 올바르지 않습니다.');
  return {id, shape, texture, font, frame, accent: rawAccent.toLowerCase()};
}

export function resolveDesignTheme(designTheme = DEFAULT_DESIGN_THEME, brightness = 'light') {
  const normalized = normalizeDesignTheme(designTheme);
  const preset = THEME_BY_ID.get(normalized.id) || APP_THEMES[0];
  const mode = brightness === 'dark' ? 'dark' : 'light';
  const base = mode === 'dark' ? preset.dark : preset.light;
  const shape = normalized.shape === 'theme' ? preset.shape : normalized.shape;
  const texture = normalized.texture === 'theme' ? preset.texture : normalized.texture;
  const font = normalized.font === 'theme' ? preset.font : normalized.font;
  const frame = normalized.frame === 'theme' ? preset.frame : normalized.frame;
  const accent = normalized.accent ? readableAccentForSurface(normalized.accent, base.surface, mode) : base.accent;
  const accentSoft = normalized.accent ? mixHex(accent, base.surface, mode === 'dark' ? 0.24 : 0.14) : base.accentSoft;
  const onAccent = normalized.accent ? onAccentColor(accent) : base.onAccent;
  const prefix = normalized.accent ? mixHex(accent, base.text, 0.75) : base.prefix;
  const prefixActive = mixHex(accent, mode === 'dark' ? '#ffffff' : '#000000', 0.85);
  const buttonBg = normalized.id === 'default' && !normalized.accent && mode === 'light' ? '#334155' : accent;
  const buttonInk = normalized.id === 'default' && !normalized.accent && mode === 'light' ? '#ffffff' : onAccent;
  const radii = SHAPE_TOKENS[shape] || SHAPE_TOKENS.default;
  const fontStack = FONT_STACKS[font] || FONT_STACKS.system;
  const iconStroke = ICON_STROKES[frame] || ICON_STROKES.clean;
  const frameInk = frame === 'brutal' ? (mode === 'dark' ? mixHex(base.line, '#ffffff', 0.65) : '#141821') : base.line;
  const shadow = frame === 'editorial' || frame === 'bevel'
    ? 'none'
    : frame === 'brutal'
      ? `3px 3px 0 ${frameInk}`
      : mode === 'dark'
        ? '0 12px 34px rgba(0,0,0,.38)'
        : `0 10px 32px ${mixHex(accent, '#0f172a', 0.35)}1a`;
  const cardRestShadow = frame === 'elevated'
    ? (mode === 'dark' ? '0 6px 20px rgba(0,0,0,.32)' : `0 6px 18px ${mixHex(accent, '#0f172a', 0.3)}12`)
    : frame === 'brutal'
      ? `3px 3px 0 ${frameInk}`
      : frame === 'bevel'
        ? (mode === 'dark' ? 'inset 1px 1px 0 rgba(255,255,255,.16),inset -1px -1px 0 rgba(0,0,0,.6)' : 'inset 1px 1px 0 #ffffff,inset -1px -1px 0 #8a877f')
        : 'none';
  // On Android Chrome & iOS/iPadOS Safari/WebApp, matching theme-color to the top chrome
  // unifies the status bar / Dynamic Island seamlessly with the app header.
  const themeColor = normalized.id === 'default' && !normalized.accent && mode === 'light' ? '#334155' : base.surface;
  const statusBarStyle = relativeLuminance(base.surface) < 0.35 ? 'black-translucent' : 'default';
  return {
    preset,
    mode,
    normalized,
    shape,
    texture,
    font,
    frame,
    themeColor,
    statusBarStyle,
    usesBundledFont: font === 'sans' ? 'LibreMemo Sans' : font === 'serif' ? 'LibreMemo Serif' : '',
    variables: {
      '--bg': base.bg,
      '--surface': base.surface,
      '--surface-muted': base.surfaceMuted,
      '--text': base.text,
      '--muted': base.muted,
      '--line': frame === 'brutal' ? frameInk : base.line,
      '--green': accent,
      '--green-light': accentSoft,
      '--on-green': onAccent,
      '--outline-prefix': prefix,
      '--outline-prefix-active': prefixActive,
      '--design-brand': buttonBg,
      '--design-canvas': base.bg,
      '--design-surface': base.surface,
      '--design-ink': base.text,
      '--design-muted': base.muted,
      '--design-line': frame === 'brutal' ? frameInk : base.line,
      '--btn-primary-bg': buttonBg,
      '--btn-primary-ink': buttonInk,
      '--app-font': fontStack,
      '--radius-library': radii.library,
      '--radius-button': radii.button,
      '--radius-hero-button': radii.heroButton,
      '--radius-dialog': radii.dialog,
      '--radius-popover': radii.popover,
      '--radius-toolbar': radii.toolbar,
      '--radius-control': radii.control,
      '--app-radius': radii.panel,
      '--app-icon-stroke': iconStroke,
      '--shadow': shadow,
      '--card-rest-shadow': cardRestShadow,
      '--frame-ink': frameInk,
      '--toast-bg': readableAccentForSurface(mode === 'dark' ? mixHex(base.surface, accent, 0.78) : mixHex('#1c2623', accent, 0.72), '#fffefb', 'light'),
      '--toast-ink': '#fffefb',
    },
  };
}

export function applyDesignThemeToDocument(doc, brightness = 'light', designTheme = DEFAULT_DESIGN_THEME) {
  const lightResolved = resolveDesignTheme(designTheme, 'light');
  const darkResolved = resolveDesignTheme(designTheme, 'dark');
  const resolved = brightness === 'dark' ? darkResolved : lightResolved;
  const root = doc?.documentElement;
  if (!root) return resolved;
  root.dataset.theme = resolved.mode;
  root.dataset.skin = resolved.preset.id;
  root.dataset.skinShape = resolved.shape;
  root.dataset.skinTexture = resolved.texture;
  root.dataset.skinFont = resolved.font;
  root.dataset.skinFrame = resolved.frame;
  const serializeVars = vars => Object.entries(vars).map(([name, value]) => `${name}:${value}`).join(';');
  const cssText = `:root{color-scheme:light;${serializeVars(lightResolved.variables)}}:root[data-theme="dark"]{color-scheme:dark;${serializeVars(darkResolved.variables)}}`;
  let styleEl = doc.querySelector?.('#librememo-design-theme');
  if (!styleEl && doc.createElement) {
    styleEl = doc.createElement('style');
    styleEl.id = 'librememo-design-theme';
    (doc.head || root).appendChild(styleEl);
  }
  if (styleEl && styleEl.textContent !== cssText) styleEl.textContent = cssText;
  const themeMeta = doc.querySelector?.('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', resolved.themeColor);
  const iosBarMeta = doc.querySelector?.('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (iosBarMeta) iosBarMeta.setAttribute('content', resolved.statusBarStyle);
  return resolved;
}

export function describeDesignTheme(designTheme = DEFAULT_DESIGN_THEME) {
  const normalized = normalizeDesignTheme(designTheme);
  const preset = THEME_BY_ID.get(normalized.id) || APP_THEMES[0];
  const extras = [];
  if (normalized.shape !== 'theme') extras.push(THEME_SHAPE_OPTIONS.find(o => o.id === normalized.shape)?.label.split(' ')[0]);
  if (normalized.texture !== 'theme') extras.push(THEME_TEXTURE_OPTIONS.find(o => o.id === normalized.texture)?.label);
  if (normalized.font !== 'theme') extras.push(THEME_FONT_OPTIONS.find(o => o.id === normalized.font)?.label);
  if (normalized.frame !== 'theme') extras.push(THEME_FRAME_OPTIONS.find(o => o.id === normalized.frame)?.label);
  if (normalized.accent) extras.push(normalized.accent);
  return extras.length ? `${preset.name} (${extras.filter(Boolean).join(' · ')})` : preset.name;
}
