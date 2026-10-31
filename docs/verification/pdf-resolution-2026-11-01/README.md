# LibreMemo PDF 선명도와 목차 동작 검증

최종 확인: 2026-11-01 08:36:27 +09:00. [공개 앱](https://seionwon.github.io/LibreMemo/) **1.7.2**, 소스 `fc5f570f9219b41d1283f6fc0be964014d9760df`. [Actions 41250232401](https://github.com/seionwon/LibreMemo/actions/runs/41250232401) build·deploy·verify 모두 성공.

- 로컬: 단위 870개·PDF 관련 21개, 문법/JSON 207개, 빌드·diff 검사 통과.
- CI Linux: 단위 870개 중 869개 통과·macOS 전용 검사 1개 건너뛰기. 문법/JSON 188개 통과.
- 전체 소스 Chrome 116개 통과(JUnit leaf 114개와 부모 2개), 공개 Chrome 82개 통과. 실패·취소·건너뛰기 0개.
- 실제 Linux Pages 자산과 공개 파일 294개·49,701,356바이트 HTTP 200·전체 바이트·SHA-256 일치.

[최종 요약](validation.json) · [Actions 상세](ci.json) · [소스 JUnit](browser-results.xml) · [공개 JUnit](published-browser-results.xml) · [공개 파일 대조](public-files.json).

## PDF

[픽셀 밀도 측정](pages-only-pdf-resolution.json)은 실제 디코딩된 이미지와 표시 영역을 비교한다. DPR 2·3, 여러 쪽 동시 표시, 800% 연속 확대, 가로·세로 이동, 목차 이동, 390px 폰 폭, 다시 열기에서 표시 범위와 화면 픽셀 밀도를 확인했다. 상세 이미지가 준비된 뒤 임시 캔버스는 해제된다. [390px 화면](pages-only-pdf-resolution-390.png), [주석 정렬](pages-only-pdf-alignment.json), [보안·오프라인](pages-only-pdf-security-offline.json), [확대 수치](pages-only-zoom-sync.json)를 함께 보관한다.

수정 전 단위 검사는 3배 화면에 필요한 1,800px 대신 1,200px을 생성했고, 그리기 중 새 확대 요청이 누락되어 각각 실패했다. 후속 [픽셀 밀도와 대기열 단위 검사](../../../tests/pdf-resolution.test.mjs)에서 밀도·동시 변경·영역 좌표·큰 확대의 자원 제한·재사용·캔버스 해제·앱 창의 갱신 프레임을 검사한다.

## 목차와 경고

[목차 위치 측정](pages-only-toc-start-position.json)은 일반 문서와 원래 스크립트가 있는 HTML에서 처음 접기·글자 클릭 접기/펼치기와 50·100·200% 본문 시작 정렬과 확대 중 실제 링크의 클릭 적중을 확인한다. [목차 화면](pages-only-toc-start-position.png)을 직접 검토했다.

[경고 측정](pages-only-security-warning.json)과 [390px 경고 화면](pages-only-security-warning-390.png)은 파일 읽기 오류가 전달한 문구의 실제 앱 알림 색상과 alert 역할을 확인한다. 실제 악성 파일을 사용하거나 검사 엔진을 추가한 검증은 아니다.

## 범위와 한계

실제 Chrome의 새 임시 프로필과 합성 문서로 검증했다. 화면 크기·밀도는 에뮬레이션이며 실물 Android 검사는 하지 않았다. macOS 샌드박스에서 데스크톱 Chrome을 직접 실행하지 않았다. 원본이 저해상도 스캔인 경우 없는 세부 정보를 만들어 내지는 않는다. 문서 끝의 위치는 스크롤 가능한 범위에 따라 제한된다. 설치한 PWA는 기존의 다음 실행 업데이트 안내로 받는다.
