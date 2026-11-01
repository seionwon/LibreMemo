# 목차 안 보안 경고색 검증

최종 확인: 2026-11-01 10:36:24 +09:00. [공개 LibreMemo](https://seionwon.github.io/LibreMemo/) **1.7.3**, 소스 `1345693b6889c42d476e17d67053dd515d3f32ee`. [Actions 41258762716](https://github.com/seionwon/LibreMemo/actions/runs/41258762716)의 build·deploy·verify 모두 성공했다.

목차 안의 악성코드 경고를 진한 붉은 배경·흰 글자·밝은 붉은 테두리로 표시한다. 원래 HTML 목차와 앱이 생성한 목차에 적용하며 정상 문구로 바뀌면 표시를 해제한다. 원래 노드·링크와 본문 텍스트를 유지하고 표시용 속성은 HTML 내보내기에서 제거한다. 악성코드 검사 엔진을 추가한 것은 아니다.

- 로컬: 단위 871개·문법/JSON 207개·빌드·diff 검사 통과.
- CI: 단위 871개 중 870개 통과·macOS 전용 안전 검사 1개 건너뛰기, 문법/JSON 188개 통과.
- 전체 소스 Chrome 117개(JUnit leaf 115개·부모 2개)와 공개 Chrome 83개 통과. 실패·취소·건너뛰기 0개.
- 실제 Linux Pages 자산과 공개 파일 294개·49,704,957바이트가 HTTP 200·전체 바이트·SHA-256 일치.

[최종 요약](validation.json) · [Actions](ci.json) · [소스 JUnit](browser-results.xml) · [공개 JUnit](published-browser-results.xml) · [공개 파일 대조](public-files.json).

## 실제 앱

[목차 경고 보고서](pages-only-toc-security-warning.json)는 원래 HTML 목차를 1280·390px와 밝게·어둡게에서 확인한다. 앱이 생성한 일반 목차도 포함한다. 붉은 배경 rgb(153,27,27)·흰 글자 rgb(255,255,255)와 경고 표시 속성을 측정했다. 격리 실행 중인 원래 스크립트가 문구를 정상 상태로 바꾸거나 굵은 글자를 포함한 경고로 되돌릴 때도 갱신되며, 목차 밖 본문은 표시 대상이 아니다. [기존 앱 알림](pages-only-security-warning.json)의 경고색과 alert 역할도 유지된다.

공개 화면: [1280px 밝게](pages-only-toc-security-warning-light-1280.png) · [1280px 어둡게](pages-only-toc-security-warning-dark-1280.png) · [390px 밝게](pages-only-toc-security-warning-light-390.png) · [390px 어둡게](pages-only-toc-security-warning-dark-390.png).

## 정적 미리보기와 한계

`codememo-browser`로 실제 컴파일 CSS를 사용하는 정적 목차 미리보기를 390px에서 확인했다. 두 실행 모두 HTTP 200·오류 없음이었고 [밝게](preview-light-390.png)·[어둡게](preview-dark-390.png) 화면을 직접 검토했다. [어두운 화면 실행 결과](preview-dark-result.json)를 보관한다. 이 제한된 정적 미리보기는 위 전체 앱 가져오기·원래 스크립트 실행 검증과 구분한다. 임시 검증 서버는 종료했다.

실제 Chrome의 새 임시 프로필과 합성 문서로 확인했다. 화면 크기는 에뮬레이션이며 실물 Android 검사는 하지 않았다. macOS 샌드박스 안에서 데스크톱 Chrome을 직접 실행하지 않았고 실제 악성 파일을 사용하지 않았다. PWA는 기존의 다음 실행 업데이트 안내로 받는다.
