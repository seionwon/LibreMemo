// Built-in lightweight app atmosphere themes (zero bitmap assets; pure CSS tokens,
// procedural patterns, bundled variable Hangul fonts and WebKit/Android meta sync).

export const THEME_CATEGORIES = Object.freeze([
  Object.freeze({id: 'all', label: '전체'}),
  Object.freeze({id: 'modern', label: '모던·시스템'}),
  Object.freeze({id: 'paper', label: '서재·종이책'}),
  Object.freeze({id: 'stationery', label: '노트·다이어리'}),
  Object.freeze({id: 'academic', label: '학술·작업실'}),
  Object.freeze({id: 'travel', label: '도시·여행'}),
  Object.freeze({id: 'nature', label: '자연·계절'}),
  Object.freeze({id: 'weather', label: '시간·날씨·OLED'}),
  Object.freeze({id: 'mood', label: '감성·아틀리에'}),
  Object.freeze({id: 'pastel', label: '파스텔·고대비'}),
  Object.freeze({id: 'bold', label: '개성·레트로'}),
]);

export const THEME_SHAPE_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'sharp', label: '직각 (0px · 인쇄·콘솔)'}),
  Object.freeze({id: 'crisp', label: '단정 (5px · 서재·노트)'}),
  Object.freeze({id: 'pebble', label: '다이어리 탭 (10px · 수첩)'}),
  Object.freeze({id: 'soft', label: '부드러움 (14px · 밸런스)'}),
  Object.freeze({id: 'round', label: '라운드 (20px · 알약 버튼)'}),
]);

export const THEME_TEXTURE_OPTIONS = Object.freeze([
  Object.freeze({id: 'theme', label: '테마 기본값'}),
  Object.freeze({id: 'none', label: '무지 단색'}),
  Object.freeze({id: 'paper', label: '한지·종이 결'}),
  Object.freeze({id: 'grid', label: '모눈 방안지'}),
  Object.freeze({id: 'millimeter', label: '정밀 밀리미터 방안지'}),
  Object.freeze({id: 'lined', label: '가로 줄노트'}),
  Object.freeze({id: 'cornell', label: '코넬 요약 구획'}),
  Object.freeze({id: 'manuscript', label: '원고지 집필 격자'}),
  Object.freeze({id: 'staff', label: '오선지 악보 결'}),
  Object.freeze({id: 'dots', label: '도트 불릿 수첩'}),
  Object.freeze({id: 'starlight', label: '은하수 별빛 도트'}),
  Object.freeze({id: 'canvas', label: '린넨·캔버스 직물'}),
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
  Object.freeze({id: 'double', label: '이중 인쇄 장식선'}),
  Object.freeze({id: 'spiral', label: '스프링 바인더 노트'}),
  Object.freeze({id: 'brutal', label: '네오 브루탈 잉크 보드'}),
  Object.freeze({id: 'stitched', label: '다이어리 점선 스티치'}),
  Object.freeze({id: 'bevel', label: '레트로 입체 베벨'}),
  Object.freeze({id: 'luminous', label: '은은한 네온 광채'}),
]);

export const THEME_ACCENT_PRESETS = Object.freeze([
  '#334155', '#1e3a8a', '#2563eb', '#0071e3', '#0284c7', '#0d7480', '#0f766e', '#1f5e45',
  '#365918', '#4d7c0f', '#4f46e5', '#6d28d9', '#9333ea', '#a21caf', '#be185d', '#9f1239',
  '#b91c1c', '#c2410c', '#9a3412', '#8a5a19', '#713f12', '#57534e', '#374151', '#171717',
]);

const p = raw => {
  const [bg, surface, surfaceMuted, text, muted, line, accent, accentSoft, prefix] = raw.split(' ').map(h => '#' + h);
  return Object.freeze({bg, surface, surfaceMuted, text, muted, line, accent, accentSoft, prefix});
};
const t = (id, category, name, summary, shape, texture, font, frame, light, dark) =>
  Object.freeze({id, category, name, summary, shape, texture, font, frame, light: p(light), dark: p(dark)});

// 80 curated themes across 10 categories (160 Light/Dark palettes).
export const APP_THEMES = Object.freeze([
  // 1. 모던·시스템 (modern: 8)
  t('default', 'modern', '라이브러리 데스크', '차분한 슬레이트 네이비 기본 서재', 'default', 'none', 'system', 'clean',
    'f6f7fb ffffff edf0f6 202633 596377 e0e5ee 334155 e7ecf3 4f6d8c',
    '10151e 1b2230 252f40 f2f4f8 b4becf 374357 c2d2e8 29374a 8fb0cc'),
  t('oneui-breeze', 'modern', '원UI 코발트 브리즈', '큼직한 라운드 카드와 산뜻한 블루', 'round', 'none', 'rounded', 'elevated',
    'f1f5fb ffffff e5edf8 151c28 526075 d6e0ee 1d5bd6 e0ebff 295ec9',
    '0b1019 161e2c 202a3d eef3fb a5b4cb 2c3a52 7ab0ff 1e3254 86b8ff'),
  t('cupertino-glass', 'modern', '쿠퍼티노 프로스트 글래스', '반투명 유리 질감과 은은한 오로라 빛', 'soft', 'glow', 'system', 'glass',
    'eef3fa ffffff e3ebf6 141b26 505c6e d3deec 0062cc dcebff 1d68b8',
    '0d121c 182132 232f45 f2f6fc a7b5cc 30405b 66b2ff 1b3556 7ec0ff'),
  t('material-sage', 'modern', '머티리얼 세이지 토널', '유칼립투스 색조가 스며든 파스텔 카드', 'round', 'none', 'sans', 'clean',
    'edf4ef f9fcf9 dfebe3 18261f 4d6156 cadbd0 21634c d5ebe1 2c6e57',
    '101915 192620 23342c e7f2ec a2b8ac 32483e 7fd4b3 214034 8ad9ba'),
  t('nordic-arctic', 'modern', '노르딕 아틱 스노우', '북유럽 스튜디오의 시원하고 단정한 직선미', 'crisp', 'none', 'sans', 'clean',
    'f2f6f9 ffffff e5edf3 1a2733 526575 d2dfe9 25587a ddeaf3 31688c',
    '0f161d 17222c 21303d eaf1f7 a0b3c4 2f4354 7cc0e8 1d394d 8cc9ed'),
  t('fluent-mica', 'modern', '플루언트 마이카 클라우드', '구름빛 반투명 레이어와 인디고 블루', 'soft', 'glow', 'system', 'glass',
    'f3f4fa ffffff e6e8f4 1b1d2e 555975 d5d8ea 3b49df e2e5ff 4755e3',
    '101222 1a1d33 252947 eff0fa a8add0 343a61 95a0ff 252b54 aab3ff'),
  t('titanium-studio', 'modern', '티타늄 프로 스튜디오', '무광 메탈 그레이와 선명한 스틸 블루', 'crisp', 'none', 'system', 'elevated',
    'eff0f2 fafafa e2e4e8 191b1f 525760 cfd3da 2b4c7e dfe7f2 385b91',
    '121316 1c1e22 262930 f0f1f4 a8aeb8 383d47 8cb4f5 22314a 9ec0f8'),
  t('swiss-international', 'modern', '스위스 모던 타이포', '선명한 직각 그리드와 버밀리온 레드', 'sharp', 'grid', 'sans', 'editorial',
    'f5f5f3 ffffff e8e8e4 121212 52524e c9c9c3 c81e1e fbe2e2 b91c1c',
    '111111 1b1b1b 262626 f5f5f3 b3b3ad 3b3b39 ff7b7b 471d1d ff9494'),

  // 2. 서재·종이책 (paper: 8)
  t('hanji-library', 'paper', '전통 한지 서재', '따뜻한 미색 한지 결과 명조체·송연묵 청록', 'crisp', 'paper', 'serif', 'clean',
    'f5efe2 fcf9f2 ebe3d2 26231d 635d52 dcd2be 27594b dfebe4 3c6659',
    '191713 24211b 302c24 efe9dc b5ac9b 423d32 82c4ae 253d35 95ceb9'),
  t('vintage-hardcover', 'paper', '빈티지 양장 도서관', '고서 크림지와 버건디 가죽 책등의 품격', 'crisp', 'paper', 'serif', 'editorial',
    'f3ead7 fbf6ea e7dbc3 2b1f1a 69574d d6c6aa 7c1d2e f2dde0 8a3040',
    '1b1413 271d1b 342725 f3e8df bca89d 493733 f29aa6 462128 f5adb7'),
  t('editorial-press', 'paper', '문예지 에디토리얼 프레스', '직각 지면과 선명한 먹색 잉크의 인쇄 저널', 'sharp', 'none', 'serif', 'editorial',
    'f7f6f1 ffffff eceae2 141413 575651 cfcdc3 181817 e6e5de 3f3f3c',
    '121211 1c1c1a 272724 f4f3ee b3b1a8 3c3b37 eceae2 32322e d2d0c6'),
  t('warm-bookcafe', 'paper', '오후의 북카페 세피아', '오트밀 라떼 색감과 로스팅 브라운의 온기', 'soft', 'paper', 'serif', 'elevated',
    'f5ece2 fdf9f4 eadccf 2c2119 6b584b dccab9 6e3f20 f0e2d5 804f2e',
    '1a1410 251d18 332821 f3e9df bca999 47382e e5af87 3f2c1f ecc09e'),
  t('eink-paperwhite', 'paper', '모노크롬 전자잉크 리더', '눈부심을 덜어낸 무채색 E-Ink 단말기 감성', 'crisp', 'none', 'serif', 'editorial',
    'f1f1ee f9f9f7 e4e4e0 191918 555552 c8c8c2 262625 e2e2dd 444441',
    '141414 1f1f1f 2b2b2b ededeb adadab 3d3d3d e0e0dc 333333 c7c7c3'),
  t('antique-parchment', 'paper', '고문서 양피지 서고', '고풍스러운 양피지 색감과 황동 이중 장식선', 'crisp', 'paper', 'serif', 'double',
    'f2e6cf faf3e3 e6d6b8 2c2214 695840 cbb894 704214 efe1cc 82511e',
    '1c170f 282116 352c1e f2e7d3 bdb097 4d3f2a e8ba78 423219 f0c992'),
  t('penguin-paperback', 'paper', '클래식 문고판 오렌지', '아이보리 문고본 표지와 시그니처 버밀리온 띠지', 'sharp', 'paper', 'serif', 'double',
    'f8f3e6 fffdf7 ede5d2 1e1c18 5d584d d8ceba b83b0e fbe3d8 c4491c',
    '181612 23201a 302c24 f4efe2 b8b09f 453f34 ff9f7a 472619 ffb294'),
  t('fountain-royal', 'paper', '만년필 로열블루 서한', '순면 레터지 질감과 만년필 로열블루 잉크', 'pebble', 'paper', 'serif', 'clean',
    'f4f5fa fdfdff e6e9f4 192038 515a78 cfd5ea 1e3f99 dfe6fb 2a4dad',
    '0f1322 181e34 232b47 edf0fc a4aed1 323d63 8caeff 202e59 a3beff'),

  // 3. 노트·다이어리 (stationery: 8)
  t('grid-engineering', 'stationery', '모눈 엔지니어링 노트', '정밀한 방안지 격자와 만년필 블루블랙', 'crisp', 'grid', 'sans', 'clean',
    'f3f6fa ffffff e6ecf5 172234 506079 cdd9ea 1e3a8a dde6fb 284aa3',
    '0e1420 172032 212d44 ebf1fb a1b2cc 2e3e5c 8ab0ff 1e3158 9dc0ff'),
  t('lined-diary', 'stationery', '줄노트 리갈패드 수첩', '아이보리 가로 줄노트와 루비 인덱스 포인트', 'crisp', 'lined', 'serif', 'clean',
    'fbf6e3 fffdf5 f1e9ce 282218 665c49 dfd3b2 a61e2b f8dfe2 9e2a36',
    '1b1811 262218 332d21 f3ecd9 b9ae94 463e2d f7949d 472227 faa8b0'),
  t('dot-bullet', 'stationery', '도트 불릿 저널', '점선 매트릭스 수첩과 바이올렛 스티커 카드', 'soft', 'dots', 'rounded', 'elevated',
    'f6f4fc ffffff ebe6f8 211a34 5e5378 d9d0ee 5b21b6 ebe2ff 6933c2',
    '13101f 1d182f 282240 f0ecfb afa5ca 3b3259 c4a7ff 2f2152 d1baff'),
  t('kraft-scrapbook', 'stationery', '크라프트 스크랩북', '재생 크라프트지와 다이어리 점선 스티치', 'soft', 'paper', 'sans', 'stitched',
    'ecdec9 f7efe2 e1d0b6 2b2217 665642 cbb799 365918 dfead2 446b22',
    '1c1711 282119 352c22 f1e6d6 b9a892 4a3e30 a7d979 2b3d1c b7e28f'),
  t('wongoji-manuscript', 'stationery', '원고지 집필 노트', '전통 주홍빛 원고지 칸과 단정한 먹빛 명조', 'sharp', 'manuscript', 'serif', 'clean',
    'faf5ec fffdf8 f0e7d8 241e1a 63564e e2c9be 9c2c1d f9e1dc ad3a2b',
    '1a1513 251e1b 332925 f4ebe6 bdaaa1 4d3933 f59a8c 47241e f8afa3'),
  t('cornell-summary', 'stationery', '코넬 요약 노트', '좌측 키워드 여백 구획선과 체계적인 필기감', 'crisp', 'cornell', 'sans', 'clean',
    'f6f8fc ffffff e9eef7 182232 526077 cfd9ea 1d4ed8 dde7fd 2957d4',
    '0f1520 182132 222e45 ecf1fb a3b3cc 30415e 8ab4ff 1e3359 9ec1ff'),
  t('millimeter-graph', 'stationery', '정밀 밀리미터 방안지', '대·소 눈금 섹션지와 제도용 에메랄드 그린', 'sharp', 'millimeter', 'mono', 'editorial',
    'f1f8f5 fbfefd e1efe9 142921 48665a bed8cd 0f6848 d4eee3 167855',
    '0b1713 13251f 1c342c e6f5ef 9bc0b1 2b4a3f 6ee0b4 173e30 87e6c1'),
  t('spiral-campus', 'stationery', '캠퍼스 스프링 노트', '좌측 스프링 바인더와 경쾌한 코발트 줄노트', 'pebble', 'lined', 'rounded', 'spiral',
    'f4f7fc ffffff e6ecf7 182235 51607a ccd7ec 1e40af dde5fc 294ec2',
    '101522 192134 232e47 edf1fc a4b2cf 314061 8eaeff 1f315c a3bdff'),

  // 4. 학술·작업실 (academic: 8)
  t('blueprint-studio', 'academic', '아키텍트 블루프린트', '건축 제도판 모눈과 고정폭 시안 블루', 'sharp', 'grid', 'mono', 'editorial',
    'eaf3fb f7fbff dceaf7 0f2742 436182 bcd4ec 0353a4 d5e8fb 0b6bcb',
    '081c36 0f294a 173760 e8f3ff 9ec0e6 264d7d 7cc0ff 163f6e 94cdff'),
  t('academic-margin', 'academic', '학술 논문 마진', '여백 구획선과 옥스퍼드 네이비 학술지 조판', 'sharp', 'cornell', 'serif', 'editorial',
    'f7f7f4 ffffff eaeae4 161c26 525a68 cfd3dc 1b365d dde5f0 274673',
    '10141c 191f2b 232b3b eef1f6 a7b0c0 343f54 94b8eb 21334d a8c6f0'),
  t('legal-manuscript', 'academic', '법률 원고·판례집', '상아빛 변론 지면과 중후한 이중선·크림슨', 'crisp', 'lined', 'serif', 'double',
    'f9f5eb fffdf8 eee7d6 231c18 61554e d8ccb8 881337 f7dde4 9c1c44',
    '191414 241d1d 312828 f4ecea bcaab0 48383b fda4af 471e26 feb8c1'),
  t('chalkboard-lecture', 'academic', '교실 칠판과 분필', '매트한 칠판 텍스처와 또렷한 분필 그린·크림', 'crisp', 'canvas', 'sans', 'bevel',
    'ebf2ed f7fbf8 dce8df 18281e 4c6354 c1d4c7 1e5638 d5ebdf 296947',
    '122019 1a2d24 243c31 f1f5ee b2c4b8 355243 cbe896 2c4422 d7efab'),
  t('chemistry-lab', 'academic', '화학 실험 기록부', '내산성 민트 밀리미터 방안지와 실험실 티탄 청록', 'crisp', 'millimeter', 'mono', 'clean',
    'eef6f6 fafefe dfeeee 12282a 486568 bed7d9 0d656d d2eef0 147780',
    '0b1819 132628 1c3538 e7f6f7 9cc0c3 2b4b4f 6cd9e2 173f43 86e1e8'),
  t('music-conservatory', 'academic', '음악원 오선지 악보첩', '크림색 오선지 결과 클래식 마호가니 브라운', 'pebble', 'staff', 'serif', 'double',
    'faf4e8 fffdf7 efe5d2 281e16 665648 dccbb4 78350f f4e3d4 8c4217',
    '1a1510 261e17 342920 f4eadc beae99 4a3b2d f5b87a 442e18 f7c794'),
  t('botanical-herbarium', 'academic', '식물 표본 채집첩', '린넨 직물 대지와 보태니컬 올리브 그린', 'soft', 'canvas', 'serif', 'stitched',
    'f2f2e8 fbfbf5 e5e6d6 222618 59604a cfd2ba 3f6212 e2edd0 4d7518',
    '151810 1f2418 2a3121 eef0e4 aeb69d 3c462f b5e478 2c3d19 c4ea92'),
  t('darkroom-halide', 'academic', '암실 인화지 세이프라이트', '실버 젤라틴 무채색과 암실 루비 레드 조명', 'sharp', 'scanline', 'mono', 'editorial',
    'f4f1f1 fcfafa e7e1e1 221818 615050 d4c8c8 991b1b fae0e0 ad2424',
    '0d0808 180f0f 241717 f5e6e6 c29f9f 422626 ff7575 451818 ff9191'),

  // 5. 도시·여행 (travel: 8)
  t('kyoto-teahouse', 'travel', '교토 대나무 다실', '다다미 미색과 고즈넉한 스기목·말차 그린', 'crisp', 'paper', 'serif', 'editorial',
    'f2efe4 faf8f1 e5e0d0 23241c 5c5e50 d1ccb9 385a32 dfeadc 466c3f',
    '151712 20231b 2b2f25 eceee4 adb2a0 3b4133 9bd191 263b23 aedba5'),
  t('paris-cafe', 'travel', '파리 생제르맹 카페', '대리석 크림 테이블과 프렌치 비스트로 네이비', 'pebble', 'none', 'serif', 'double',
    'f7f4ee fffdf9 ece6dc 1d2230 585f72 d7d0c4 1e355e dde4f2 2b4778',
    '12151f 1b202e 262d40 f2efe9 aeb4c6 384057 9ab6eb 23314d afc5f0'),
  t('santorini-aegean', 'travel', '산토리니 에게해', '눈부신 회벽 화이트와 코발트 블루 돔', 'round', 'glow', 'sans', 'elevated',
    'eef5fc ffffff dfecfa 10233b 476180 c4daf0 0055b3 d6e9ff 0b66cc',
    '091526 11223b 1a3052 ebf4ff 9cb8db 27466e 75baff 173963 8fc6ff'),
  t('prague-oldtown', 'travel', '프라하 고성 첨탑', '중세 사암 베이지와 보헤미안 가넷 레드', 'crisp', 'paper', 'serif', 'double',
    'f4ece2 fcf8f2 e8dccd 281f1b 665750 d6c6b5 8c1d2c f6dde1 9e2a3a',
    '1a1413 261d1c 342826 f3e9e4 bda9a2 493835 f59aa6 462126 f8aeb8'),
  t('newyork-loft', 'travel', '뉴욕 소호 로프트', '노출 콘크리트 그레이와 브릭 앰버 포인트', 'sharp', 'canvas', 'sans', 'editorial',
    'f1f0ee fbfaf8 e4e2de 1e1d1b 595753 cecbc4 9a3412 f9e3da ad411c',
    '151413 201f1d 2c2a27 f1efec b3afa8 3f3c38 fb9d74 462719 fcaea0'),
  t('seoul-giwa', 'travel', '서울 북촌 기와마루', '담백한 회벽 미색과 기와 차콜·단청 청록', 'crisp', 'paper', 'serif', 'clean',
    'f1f2ef fbfcfa e3e5e0 1d2424 546060 cbd1ce 1f5c58 d9ecea 2a6e69',
    '121717 1b2323 253030 eaf0ef a4b4b3 344444 7ed4cd 1d3e3b 95ddd7'),
  t('london-fog', 'travel', '런던 안개와 홍차', '템스강 안개빛 슬레이트와 얼그레이 플럼 브라운', 'soft', 'diagonal', 'serif', 'clean',
    'f0f1f4 fafbfe e2e4ea 22242c 5a5e6d cdd1dc 5b3246 efe0e8 6e4057',
    '14151b 1e2029 292c38 eeeff4 adb1c2 393d4d e5a8c5 3d2532 ebb9d1'),
  t('marrakech-riad', 'travel', '마라케시 리야드 정원', '따뜻한 사암 안뜰과 마조렐 코발트 블루', 'round', 'canvas', 'sans', 'elevated',
    'f8efe4 fffaf3 ede0cf 281f18 685749 decbb4 16429b dde6fa 2252b3',
    '1b1510 271f18 352a21 f5eadf c1ae9b 4b3b2d 8fb2ff 213154 a5c1ff'),

  // 6. 자연·계절 (nature: 8)
  t('forest-moss', 'nature', '깊은 숲과 이끼 책상', '편백 숲의 고요한 녹음과 안개 채광', 'soft', 'glow', 'sans', 'elevated',
    'eaf2ec f9fcf9 dce8df 17271d 4d6355 c5d8cb 1c593f d4eadf 266b4e',
    '0d1711 16241c 203328 e6f2ea 9eb8a7 2e4738 79cfa6 1c3d2e 8ed8b5'),
  t('ocean-breeze', 'nature', '오션 호라이즌', '맑은 바다 수평선과 딥 라군 틸 포인트', 'round', 'glow', 'sans', 'glass',
    'eaf7f9 ffffff daf0f4 12282e 49666e c0dfe5 0b6975 d2f0f4 127885',
    '0a181c 13262c 1c353d e6f6f9 9bc0c8 2a4a54 6bd7e5 173e46 84e0ec'),
  t('sakura-spring', 'nature', '사쿠라 블로섬', '봄날의 화사한 로즈 파스텔과 폭신한 카드', 'round', 'glow', 'rounded', 'elevated',
    'fcf1f5 ffffff f6e3eb 2e1822 70505f e9cad7 ad1457 fce0ec b82565',
    '1c1015 291820 37212b f9e9f0 c7a3b3 4d303e ff94c2 4a2033 ffa8cd'),
  t('autumn-terracotta', 'nature', '어텀 메이플 테라코타', '가을 단풍의 앰버 브라운과 따뜻한 종이 결', 'soft', 'paper', 'serif', 'clean',
    'faf2ea fffcf8 f1e3d5 2d1e14 6e5646 e2cbb6 9a3b08 fbe5d4 ab4913',
    '1c130e 281c15 36261d f6eae1 c4aa97 4c3629 f7ad77 462916 f9be92'),
  t('matcha-tea', 'nature', '우지 말차 다도실', '차분한 다완 크림과 깊은 말차 그린', 'crisp', 'paper', 'serif', 'clean',
    'f1f4e9 fbfcf7 e4ead8 20281b 56624e ced8be 376128 dfedd8 457334',
    '131810 1c2418 263121 eaf0e4 a7b69d 384731 9bd484 263c1e addd99'),
  t('winter-cedar', 'nature', '겨울 설원과 전나무', '고요한 설원 화이트와 상록 전나무 파인 그린', 'crisp', 'none', 'sans', 'clean',
    'f2f6f5 ffffff e4ecea 162422 4e6360 cad8d5 1b574c d6ece7 25695c',
    '0d1615 152321 1f322f e8f2f0 9eb7b3 2d4642 7ad1c0 1b3d36 90d9cb'),
  t('summer-hydrangea', 'nature', '초여름 수국 정원', '빗물 머금은 청보라 수국과 시원한 유리 카드', 'round', 'glow', 'rounded', 'glass',
    'f0f3fc ffffff e2e8f9 1b2138 525c7d ccd5ef 3949ab e1e5fc 4657bd',
    '0f1324 181e36 222b4a edf0fc a5b0d4 313d66 9aa8ff 222c5c aebaff'),
  t('jeju-basalt-sea', 'nature', '제주 현무암과 바다', '무광 현무암 그레이와 비양도 에메랄드 물빛', 'pebble', 'paper', 'sans', 'elevated',
    'eff2f1 fafcfb e1e7e5 1d2423 53605e c9d3d1 0f6860 d4eeeb 177a71',
    '121616 1b2221 252f2e ebf0ef a5b3b1 354341 6fd9cf 1a3e3a 88e1d9'),

  // 7. 시간·날씨·OLED (weather: 8)
  t('dawn-mist', 'weather', '새벽 물안개 호수', '동트기 전 고요한 청회색 안개와 여명빛', 'soft', 'glow', 'sans', 'glass',
    'eff3f7 fbfdff e2e9f0 1b2530 536273 ccd6e2 355475 dfe8f2 43658a',
    '0e1319 161f29 202c3a eaeff5 a2b1c2 2f3f52 94bce5 20344a a7c8ea'),
  t('rainy-window', 'weather', '비 오는 창가 빗소리', '빗방울 맺힌 유리창과 차분한 레인 슬레이트', 'soft', 'diagonal', 'sans', 'glass',
    'edf2f5 f9fbfd dfe8ee 1a252c 50616c c6d4de 28586b d9eaf0 33697e',
    '0d1418 152027 1f2e38 e7f0f5 9db2bf 2d414e 7cc7e3 1a3946 92d1e8'),
  t('sunset-horizon', 'weather', '노을빛 해변 수평선', '저녁노을 살구빛 광채와 딥 선셋 코랄', 'round', 'glow', 'serif', 'elevated',
    'fdf2ec fffdfb f7e3d8 2d1c18 6e534d e8c9ba ad3426 fce1dc bf4132',
    '1b1112 28191b 362326 f8eae7 c6a5a1 4d3235 ff9b8f 492220 ffb0a6'),
  t('aurora-borealis', 'weather', '극지방 오로라 밤하늘', '별빛 밤하늘과 신비로운 오로라 에메랄드', 'soft', 'starlight', 'sans', 'luminous',
    'ecf7f5 f9fefd dcf0ec 122926 476662 bce0da 0b6b5d d0f2ec 127d6e',
    '071114 0e1d22 162b32 e6f9f6 96c4be 224950 4ce8c6 113e37 6fefd3'),
  t('oled-pitch-black', 'weather', '완전 블랙 아몰레드', '다크모드 순수 #000 절전 배경과 아이스 블루', 'crisp', 'none', 'system', 'clean',
    'f4f6f9 ffffff e7ebf1 11161f 4e5869 d2d9e4 1d4ed8 dde7fd 2558e0',
    '000000 0a0d12 151a24 f5f7fa b0bac9 283142 7db8ff 142640 96c7ff'),
  t('oled-warm-amber', 'weather', '완전 블랙 야간 독서등', '다크모드 순수 #000 배경과 눈 편한 앰버 골드', 'crisp', 'none', 'serif', 'clean',
    'faf6ee fffdf9 efe7d8 241e14 615644 dcd0ba 8a4b08 f8e7d0 9c570e',
    '000000 0d0a06 1a140d f3e5ce bda98a 362a1b f5b95f 33240d f8c87e'),
  t('golden-afternoon', 'weather', '오후 다섯 시 골든아워', '창가로 스미는 꿀빛 햇살과 따뜻한 호박색', 'soft', 'glow', 'serif', 'elevated',
    'fbf5e8 fffdf7 f2e7cf 2a2113 685941 e0d0b0 8c4a08 f9e8d2 9e560e',
    '1a150d 261f14 342b1c f5ebd8 c0b093 493c26 f7be6d 423014 f9cb88'),
  t('starlight-camp', 'weather', '은하수 별빛 야영지', '은은한 별빛 도트와 깊은 밤하늘 인디고', 'pebble', 'starlight', 'sans', 'elevated',
    'eef1f9 fafbff e0e6f4 171e33 505a78 c9d2ea 2b3a8c dfe4fa 3849a3',
    '080c18 11172b 1a233f ebeffc a1aed4 2b3861 94adff 1e2a54 abbfff'),

  // 8. 감성·아틀리에 (mood: 8)
  t('lavender-dream', 'mood', '라벤더 더스크', '보랏빛 노을 안개와 반투명 유리 카드', 'round', 'glow', 'rounded', 'glass',
    'f4f1fc ffffff e8e2f8 221b35 5e547a d7cef0 6326bf ece3ff 7138c9',
    '141021 1e1931 292242 f1ecfc b1a6ce 3d335c c8abff 312254 d4bdff'),
  t('peach-sorbet', 'mood', '피치 코랄 소르베', '살구빛 도트 캔버스와 생기 있는 코랄', 'round', 'dots', 'rounded', 'elevated',
    'fff3ed ffffff fbe5da 2f1c15 715449 eccbc0 b83814 ffe4db c44521',
    '1d1310 2a1c17 382620 f9ebe5 c8a89d 4f362e ffa285 492419 ffb49c'),
  t('midnight-astronomy', 'mood', '천문대 별빛 살롱', '별자리 도트 무늬와 미드나잇 인디고·골드', 'soft', 'dots', 'serif', 'elevated',
    'eff1f9 fbfcff e2e6f3 191e36 52597a ccd2e8 2e2a85 e2e2fb 3d399c',
    '0b0e1d 141930 1e2544 eef0fb a5add1 2f3963 f5c451 38321c 9db2ff'),
  t('royal-velvet', 'mood', '로열 벨벳 & 앤티크 골드', '클래식 살롱의 플럼 벨벳과 골드 장식선', 'crisp', 'diagonal', 'serif', 'editorial',
    'f8f4ee fffdf9 eee6da 281926 695365 dfd2c3 631d56 f4e0f0 7a296b',
    '171019 231826 302234 f5ebf4 c1abc0 48334c ecc05a 3d3119 e5a4df'),
  t('espresso-roastery', 'mood', '에스프레소 로스터리', '진한 원두 크레마 향기와 다크 로스트 브라운', 'pebble', 'paper', 'sans', 'elevated',
    'f3ece6 fcf8f5 e7dbd1 261c16 645349 d6c5b8 5c3317 eee0d5 704121',
    '16110e 211a15 2e241d f2e8e0 bba89a 44352b e6b18a 3d2a1c eec2a2'),
  t('rosequartz-atelier', 'mood', '로즈쿼츠 화실', '더스티 로즈 린넨 직물과 말린 장미빛 잉크', 'soft', 'canvas', 'serif', 'clean',
    'f9f1f3 fffbfc f0e2e6 2b1b20 6b525a e2cad1 8f2447 f8dfe7 a33156',
    '1a1114 26191e 342229 f6eaee c4a6b0 4a313a f79cb8 46212e f9b2c8'),
  t('oil-canvas-ochre', 'mood', '유화 아틀리에 황토', '생지 캔버스 직물 결과 울트라마린 물감', 'crisp', 'canvas', 'serif', 'stitched',
    'f5efe4 fdfaf3 eae1d0 25211a 625a4d d8ccb8 23408e dfe6f8 2f50a6',
    '181510 231f18 302b22 f2ece0 b9b09d 453e31 94b2ff 223054 a9c1ff'),
  t('nordic-ceramic', 'mood', '세라믹 공방 스톤웨어', '유약 바른 백자 질감과 고요한 청자 그레이', 'round', 'none', 'sans', 'clean',
    'f2f3f0 fcfcfa e5e7e2 1f2421 57605b ced3ce 3b5952 dfeae7 496b63',
    '131615 1c211f 262d2a ecefec a8b2ad 38423e 93c7ba 233b35 a7d2c7'),

  // 9. 파스텔·고대비 (pastel: 8)
  t('cotton-cloud', 'pastel', '코튼캔디 클라우드', '솜사탕처럼 포근한 스카이·핑크 파스텔', 'round', 'glow', 'rounded', 'elevated',
    'f3f6fd ffffff e6ecfa 1d2236 565f7c d2dcf2 4338ca e4e2fe 5146d9',
    '111424 1a1f36 242b4a eff1fc a7b0d4 333d66 a5b4fc 252c59 bac6fd'),
  t('butter-diary', 'pastel', '버터크림 다이어리', '부드러운 커스터드 옐로와 브라운 색연필', 'round', 'dots', 'rounded', 'spiral',
    'fdf8e6 fffef7 f5eccb 2a2214 685b42 e4d6ad 7c4700 f7e8cc 8f5406',
    '1b180f 262216 342e1e f5eed8 bfb393 494028 f7c66e 423314 f9d38c'),
  t('lilac-milktea', 'pastel', '라일락 밀크티', '은은한 연보라 밀크티와 모브 바이올렛', 'soft', 'paper', 'rounded', 'clean',
    'f7f3fa fdfbff ece5f3 261e2e 635670 dad0e5 6b21a8 f0e1fc 7c2dc0',
    '17131d 221c2b 2e263a f2ecf8 b7a9c6 413650 d5a6ff 36224a e0bcff'),
  t('pistachio-cream', 'pastel', '피스타치오 젤라또', '산뜻한 피스타치오 크림과 포레스트 그린', 'round', 'none', 'rounded', 'elevated',
    'eff7ec fbfefa e1f0dc 192817 4e644b c6dec0 27632a d7eed8 327535',
    '10190f 182617 223420 e8f4e7 a2bba0 31492f 8ed891 1f3e21 a3e0a5'),
  t('babyblue-linen', 'pastel', '베이비블루 코튼 린넨', '맑은 하늘색 패브릭 직물과 코튼 데님 블루', 'soft', 'canvas', 'rounded', 'stitched',
    'eef5fb fbfdff dfecf7 162433 4e6278 c6d9ec 1e5091 dae8f8 2860a8',
    '0e1620 162230 203042 eaf2fa a1b5cb 2f445c 88bef7 1d3652 9ecaf9'),
  t('hc-ebony-ivory', 'pastel', '고대비 백지·흑묵', '최대 가독성을 위한 순백·순흑 초고대비 직선', 'sharp', 'none', 'sans', 'brutal',
    'ffffff ffffff eeeeee 000000 262626 000000 000000 e5e5e5 171717',
    '000000 050505 141414 ffffff d9d9d9 ffffff ffffff 262626 e5e5e5'),
  t('hc-yellow-black', 'pastel', '고대비 옐로·블랙', '저시력·강한 조명 환경을 위한 고시인성 배색', 'sharp', 'none', 'sans', 'brutal',
    'fffde7 ffffff fff59d 0a0a00 2e2c00 141400 0f3d91 dbe8ff 1449ab',
    '000000 0a0a00 1a1900 fff566 e6dc5c fff566 fff566 2b2900 ffe875'),
  t('hc-navy-cream', 'pastel', '고대비 크림·네이비', '장시간 정독 눈 피로를 줄인 고대비 서재', 'crisp', 'none', 'serif', 'double',
    'fdfaf0 ffffff f2ecda 0a1628 334158 1e2f47 0a2e6e dce6f9 123d8a',
    '050b14 0b1424 142138 fdf8e8 cbd5e6 8fa8cc ffd166 2e2914 ffe08a'),

  // 10. 개성·레트로 (bold: 8)
  t('neo-brutal-pop', 'bold', '네오 브루탈 팝 스튜디오', '굵은 블랙 잉크 테두리와 오프셋 하드 그림자', 'crisp', 'dots', 'sans', 'brutal',
    'fffbeb ffffff fef3c7 111827 4b5563 111827 1d4ed8 dbeafe 1e40af',
    '141418 1f2028 2b2d38 f9fafb c4c9d4 e5e7eb facc15 3b3514 93c5fd'),
  t('pop-mint-candy', 'bold', '민트 팝 인디 보드', '상큼한 민트 캔버스와 또렷한 만화책 윤곽선', 'soft', 'diagonal', 'rounded', 'brutal',
    'e8fbf3 ffffff d3f5e7 132620 446158 16382e 047857 ccf7e8 065f46',
    '0d1915 162721 20362e ebfaf4 a3c7ba 8ce6c6 34d399 173f31 6ee7b7'),
  t('cyber-terminal', 'bold', '사이버 터미널 콘솔', '개발자 고정폭 글꼴과 스캔라인 네온 그린', 'sharp', 'scanline', 'mono', 'editorial',
    'ebf3ef f7fcf9 dceae3 0f241b 426153 b8d4c7 046c4e d1f2e6 067a59',
    '070d0a 0e1713 16241e e2f7ec 8ebaa5 234235 22e59b 103829 47f0af'),
  t('retro-classic-os', 'bold', '레트로 95 데스크톱', '추억의 워크스테이션 입체 베벨과 시스템 네이비', 'sharp', 'none', 'mono', 'bevel',
    'dedcd5 efede8 d2cfc7 141414 4f4e4a 9e9b93 004e89 d2e3f3 005a9e',
    '181c20 23292f 2e363e edf0f2 a8b2bc 4a5561 6bb8ff 1c3752 8ac8ff'),
  t('amber-crt-dos', 'bold', '앰버 포스퍼 CRT', '80년대 호박빛 브라운관 모니터와 스캔라인', 'sharp', 'scanline', 'mono', 'luminous',
    'f9f3e6 fffbf2 efe4cc 261a08 634d2b dac49c 944d00 f9e6cc a85800',
    '0c0802 171005 241908 ffd280 cfa255 4d3610 ffb338 382506 ffc566'),
  t('aqua-gel-2001', 'bold', '아쿠아 젤리 데스크톱', '2000년대 투명 아쿠아 유리와 핀스트라이프', 'round', 'lined', 'system', 'glass',
    'edf4fb ffffff ddeaf8 122033 4b5f78 bfd4ec 005fcc d6e9ff 0a6ee0',
    '0b1320 142136 1e304d ecf4ff 9fb8d8 2c476e 6eb6ff 18375e 8ac4ff'),
  t('vaporwave-sunset', 'bold', '베이퍼웨이브 선셋', '네온 마젠타·시안 광채의 레트로 퓨처 무드', 'soft', 'scanline', 'sans', 'luminous',
    'fbf0fa ffffff f4dff3 2a1433 694975 e4c2e6 9d176d fbe0f0 b3207d',
    '12091c 1c102b 28183d f8ebff c2a3d4 472a66 ff7ad9 421a42 5ce1e6'),
  t('risograph-zine', 'bold', '리소그래프 독립출판', '콩기름 잉크 종이 결과 코발트·플로럴 핑크', 'crisp', 'paper', 'mono', 'double',
    'f7f3eb fffdf8 ece4d5 192236 525d78 d4cab8 1d44b8 dde5fc d61f69',
    '141622 1d2033 272c45 f4f0e8 b0b6cf 3b4263 ff85b3 422035 8fb0ff'),
]);

const THEME_BY_ID = new Map(APP_THEMES.map(theme => [theme.id, theme]));
const CATEGORY_LABEL_BY_ID = new Map(THEME_CATEGORIES.map(cat => [cat.id, cat.label]));
const SHAPES = new Set(THEME_SHAPE_OPTIONS.map(o => o.id));
const TEXTURES = new Set(THEME_TEXTURE_OPTIONS.map(o => o.id));
const FONTS = new Set(THEME_FONT_OPTIONS.map(o => o.id));
const FRAMES = new Set(THEME_FRAME_OPTIONS.map(o => o.id));
const TEXTURE_LABEL = new Map(THEME_TEXTURE_OPTIONS.map(o => [o.id, o.label]));
const FONT_LABEL = new Map(THEME_FONT_OPTIONS.map(o => [o.id, o.label]));
const FRAME_LABEL = new Map(THEME_FRAME_OPTIONS.map(o => [o.id, o.label]));

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
  pebble: Object.freeze({library: '10px', button: '9px', heroButton: '8px', dialog: '14px', popover: '11px', toolbar: '8px', control: '7px', panel: '13px'}),
  soft: Object.freeze({library: '14px', button: '11px', heroButton: '9px', dialog: '18px', popover: '14px', toolbar: '10px', control: '8px', panel: '16px'}),
  round: Object.freeze({library: '20px', button: '999px', heroButton: '999px', dialog: '24px', popover: '18px', toolbar: '999px', control: '11px', panel: '22px'}),
});

const ICON_STROKES = Object.freeze({
  clean: '1.7',
  elevated: '1.75',
  glass: '1.65',
  editorial: '1.4',
  double: '1.55',
  spiral: '1.75',
  brutal: '2.15',
  stitched: '1.8',
  bevel: '1.85',
  luminous: '1.75',
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

function readableAccentForSurface(accentHex, surfaceHex, mode, target = 4.5) {
  let candidate = accentHex.toLowerCase();
  const pole = mode === 'dark' ? '#ffffff' : '#000000';
  for (let step = 0; step < 22 && contrastRatio(candidate, surfaceHex) < target; step++) {
    candidate = mixHex(candidate, pole, 0.86);
  }
  return candidate;
}

function readableOnBoth(fgHex, bgA, bgB, mode, target = 4.5) {
  let candidate = fgHex.toLowerCase();
  const pole = mode === 'dark' ? '#ffffff' : '#000000';
  for (let step = 0; step < 22 && (contrastRatio(candidate, bgA) < target || contrastRatio(candidate, bgB) < target); step++) {
    candidate = mixHex(candidate, pole, 0.86);
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
  let favorites;
  if (value.favorites !== undefined) {
    if (!Array.isArray(value.favorites) || value.favorites.length > APP_THEMES.length || value.favorites.some(fid => typeof fid !== 'string' || !THEME_BY_ID.has(fid))) {
      throw new Error('즐겨찾기 디자인 테마 목록이 올바르지 않습니다.');
    }
    const dedup = [...new Set(value.favorites)];
    if (dedup.length) favorites = dedup;
  }
  return {id, shape, texture, font, frame, accent: rawAccent.toLowerCase(), ...(favorites ? {favorites} : {})};
}

export function toggleFavoriteTheme(designTheme = DEFAULT_DESIGN_THEME, themeId = '') {
  const normalized = normalizeDesignTheme(designTheme);
  if (!THEME_BY_ID.has(themeId)) throw new Error('디자인 테마 ID가 올바르지 않습니다.');
  const current = normalized.favorites || [];
  const next = current.includes(themeId) ? current.filter(id => id !== themeId) : [themeId, ...current];
  const {favorites: _omit, ...rest} = normalized;
  return next.length ? {...rest, favorites: next} : rest;
}

export function filterDesignThemes({category = 'all', query = '', favorites = []} = {}) {
  const favOrder = new Map((Array.isArray(favorites) ? favorites : []).map((id, idx) => [id, idx]));
  const tokens = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const pool = category === 'favorites'
    ? APP_THEMES.filter(item => favOrder.has(item.id))
    : category === 'all'
      ? APP_THEMES
      : APP_THEMES.filter(item => item.category === category);
  const matched = tokens.length
    ? pool.filter(item => {
        const hay = `${item.name} ${item.summary} ${item.id} ${CATEGORY_LABEL_BY_ID.get(item.category) || ''} ${TEXTURE_LABEL.get(item.texture) || ''} ${FONT_LABEL.get(item.font) || ''} ${FRAME_LABEL.get(item.frame) || ''}`.toLowerCase();
        return tokens.every(tok => hay.includes(tok));
      })
    : [...pool];
  return matched.sort((a, b) => {
    const fa = favOrder.has(a.id) ? favOrder.get(a.id) : Infinity;
    const fb = favOrder.has(b.id) ? favOrder.get(b.id) : Infinity;
    return fa === fb ? 0 : fa - fb;
  });
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
  const text = readableOnBoth(base.text, base.bg, base.surface, mode);
  const muted = readableOnBoth(base.muted, base.bg, base.surface, mode);
  const rawAccent = normalized.accent ? normalized.accent : base.accent;
  const accentSoft = normalized.accent ? mixHex(rawAccent, base.surface, mode === 'dark' ? 0.22 : 0.13) : base.accentSoft;
  const accent = readableOnBoth(rawAccent, base.surface, accentSoft, mode);
  const onAccent = onAccentColor(accent);
  const prefix = normalized.accent ? mixHex(accent, text, 0.75) : base.prefix;
  const prefixActive = mixHex(accent, mode === 'dark' ? '#ffffff' : '#000000', 0.85);
  const buttonBg = normalized.id === 'default' && !normalized.accent && mode === 'light' ? '#334155' : accent;
  const buttonInk = normalized.id === 'default' && !normalized.accent && mode === 'light' ? '#ffffff' : onAccent;
  const radii = SHAPE_TOKENS[shape] || SHAPE_TOKENS.default;
  const fontStack = FONT_STACKS[font] || FONT_STACKS.system;
  const iconStroke = ICON_STROKES[frame] || ICON_STROKES.clean;
  const frameInk = frame === 'brutal'
    ? (mode === 'dark' ? mixHex(base.line, '#ffffff', 0.65) : '#141821')
    : frame === 'luminous'
      ? mixHex(accent, base.line, 0.55)
      : base.line;
  const shadow = frame === 'editorial' || frame === 'bevel' || frame === 'double'
    ? 'none'
    : frame === 'brutal'
      ? `3px 3px 0 ${frameInk}`
      : frame === 'luminous'
        ? (mode === 'dark' ? `0 0 0 1px ${mixHex(accent, base.line, 0.45)},0 8px 26px ${accent}33` : `0 6px 22px ${accent}24`)
        : mode === 'dark'
          ? '0 12px 34px rgba(0,0,0,.38)'
          : `0 10px 32px ${mixHex(accent, '#0f172a', 0.35)}1a`;
  const cardRestShadow = frame === 'elevated'
    ? (mode === 'dark' ? '0 6px 20px rgba(0,0,0,.32)' : `0 6px 18px ${mixHex(accent, '#0f172a', 0.3)}12`)
    : frame === 'brutal'
      ? `3px 3px 0 ${frameInk}`
      : frame === 'bevel'
        ? (mode === 'dark' ? 'inset 1px 1px 0 rgba(255,255,255,.16),inset -1px -1px 0 rgba(0,0,0,.6)' : 'inset 1px 1px 0 #ffffff,inset -1px -1px 0 #8a877f')
        : frame === 'luminous'
          ? (mode === 'dark' ? `0 0 16px ${accent}29` : `0 4px 14px ${accent}1c`)
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
      '--text': text,
      '--muted': muted,
      '--line': frame === 'brutal' || frame === 'luminous' ? frameInk : base.line,
      '--green': accent,
      '--green-light': accentSoft,
      '--on-green': onAccent,
      '--outline-prefix': prefix,
      '--outline-prefix-active': prefixActive,
      '--design-brand': buttonBg,
      '--design-canvas': base.bg,
      '--design-surface': base.surface,
      '--design-ink': text,
      '--design-muted': muted,
      '--design-line': frame === 'brutal' || frame === 'luminous' ? frameInk : base.line,
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
  if (normalized.favorites?.length) extras.push(`★${normalized.favorites.length}`);
  return extras.length ? `${preset.name} (${extras.filter(Boolean).join(' · ')})` : preset.name;
}
