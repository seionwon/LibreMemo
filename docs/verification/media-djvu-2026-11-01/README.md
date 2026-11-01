# 이미지·스크린샷·자막·DjVu 검증

최종 확인: 2026-11-01 12:52:58 +09:00. [공개 LibreMemo](https://seionwon.github.io/LibreMemo/) **1.8.0**, 소스 `add66b2b0fbe1976a38cc13c88dd1b3ce8498202`. [Actions 41267349310](https://github.com/seionwon/LibreMemo/actions/runs/41267349310)의 build·deploy·verify가 모두 성공했다.

## 여는 곳과 동작

내 서재 → **파일 가져오기** 또는 앱에 파일 끌어놓기로 이미지·자막·DjVu를 연다. 복사한 스크린샷은 입력란 밖에서 `⌘V`/`Ctrl+V`로 바로 열고, 내 서재 → **이미지 붙여넣기**에서도 안내와 클립보드 버튼을 사용할 수 있다. 원본 파일을 보관하고 주석·북마크와 읽기 사본을 분리 저장한다. 전달할 때는 내보내기의 원본 포함 보관 파일(.librememo) 또는 읽기용 HTML 사본을 사용한다.

- 이미지: PNG·APNG·JPEG(JPG/JPEG/JPE/JFIF)·WebP·AVIF·GIF·BMP·SVG. 원본 픽셀과 바이트를 보존하고 움직이는 이미지는 첫 장면에 주석을 남긴다. 펜·도형·메모·북마크와 확대를 기존 읽기 화면에서 사용한다.
- 자막: SRT·VTT·SMI/SAMI·ASS/SSA. 시간·대사·화자를 표시하고 대사가 있는 5분 구간을 목차로 만든다. 선택 주석·검색·북마크·TTS 제어를 기존 문서와 공유하며 TTS는 시간 표시를 건너뛴다.
- DjVu: `.djvu`·`.djv` 한 쪽 파일과 여러 쪽을 포함한 단일 bundled 파일. 원래 해상도의 스캔과 쪽 목차를 제공한다. 글자 위치가 있으면 선택·형광펜·검색·TTS를 사용하고, 문자만 있으면 쪽 아래에 본문을 별도로 표시한다. 이미지뿐인 파일에는 OCR을 새로 수행하지 않는다.

## 검사 결과

| 구분 | 실제 결과 |
| --- | --- |
| CI 단위 검사 | 895개 중 894개 통과, Linux에서 macOS 전용 실행 안전 검사 1개 건너뜀, 실패 0개 |
| CI 문법·JSON | 202개 검사 통과 |
| 소스 전체 Chrome | 121개 통과(JUnit leaf 119개·부모 2개), 실패·건너뛰기 0개 |
| 공개 주소 Chrome | 87개 통과, 실패·건너뛰기 0개 |
| 포맷 공통 UI | 지원 확장자 53개와 자료 목록이 일치, 1280·390·320px에서 공통 도구 크기·사이드바·테마·글자 크기·북마크 확인 |
| 빌드·게시 | npm run build 및 GitHub Pages 게시 성공 |
| 공개 자산 | Linux Pages 산출물과 306개 파일·52,753,077바이트의 HTTP 200·전체 바이트·SHA-256 일치 |

[최종 요약](validation.json) · [Actions·산출물 해시](ci.json) · [전체 소스 JUnit](source-browser-results.xml) · [공개 JUnit](published-browser-results.xml) · [공개 자산 대조](public-files.json).

[DjVu 공개 검사](pages-only-djvu.json)는 두 쪽·원본 1600×1000 픽셀·한국어 형광펜·펜의 75/125/50% 및 A+ 위치·검색·북마크·.librememo/HTML 복원·320px 화면·오프라인 새 `.djv` 가져오기를 확인한다. [이미지 8종](pages-only-image-formats.json), [실제 클립보드·iframe 붙여넣기와 주석](pages-only-screenshot-annotations.json), [자막 6종](pages-only-subtitle-formats.json), [전체 53개 확장자 공통 UI](pages-only-format-parity.json)도 공개 앱에서 통과했다. `source-`로 시작하는 보고서는 동일 소스의 게시 전 결과다.

화면을 직접 확인했다: [DjVu 320px](pages-only-djvu-320.png) · [DjVu 데스크톱](pages-only-djvu-1280.png) · [스크린샷 주석 320px](pages-only-screenshot-320.png) · [붙여넣기 안내](pages-only-screenshot-paste.png) · [자막 320px](pages-only-subtitles-320.png) · [자막 목차 320px](pages-only-format-parity-srt-320.png). 기존 공통 화면 맞춤 배율과 확대 조작을 사용한다.

## 범위와 제한

DjVu는 MIT인 `djvu-rs 0.43.0`을 고정하고 scalar/SIMD WASM 및 내장 Rust 의존성 38개의 라이선스 고지를 배포한다. 원본 라이선스 파일과 해시를 검사했다. 입력 100MB·2,000쪽·한 쪽 4천만 화소/한 변 32,768픽셀·읽기 사본 256MB·최초 처리 5분 한도가 있다. indirect DjVu의 외부 파일은 내려받지 않으며 bundled 사본을 안내한다. 원본 내장 목차·링크·메모를 가져오거나 실행하지 않고 쪽 번호 목차와 LibreMemo의 새 주석을 사용한다.

이미지는 50MB·4천만 화소·한 변 32,768픽셀, 자막은 8MB·대사 50,000개 한도다. 이미지 OCR, 동영상 재생·자막 시간 편집, HEIC/TIFF/PSD/RAW·TTML/DFXP 지원은 추가하지 않았다. 원본에는 주석을 직접 쓰지 않는다.

합성 문서와 자체 제작 DjVu 자료, 새 Chrome 임시 프로필로 검증했다. 실제 Chrome의 휴대폰 폭·DPR 에뮬레이션이며 실물 Android 및 실제 음성 품질 검사는 하지 않았다. macOS 샌드박스 안에서 데스크톱 Chrome을 직접 실행하지 않았다. 앞선 실패와 수정 경위는 [기능 이력](../../기능%20추가%20history.md#hist-20261101-005)과 [DjVu 이력](../../기능%20추가%20history.md#hist-20261101-006)에 보존했다. 설치한 PWA는 다음 실행의 기존 새 버전 안내에서 1.8.0으로 업데이트한다.
