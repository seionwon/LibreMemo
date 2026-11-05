# 도움말과 안내 문구 현행화 검증

LibreMemo 1.9.64의 설명을 현재 코드와 대조했습니다. 실제 기능·저장 규약·선택한 디자인은 유지하고 도움말, 화면 문구, 예제, README와 앱 소개를 정리했습니다.

- [검증 범위와 로컬 결과](validation.json): 도움말 43편, 지원 확장자 표, 관련 항목 링크, README 로컬 링크, 문법·JSON, 단위 991개, 빌드.
- [모바일 Chrome 결과](mobile.json) · [320×568 화면](mobile.png): 실제 제품의 도움말 렌더러와 컴파일 CSS를 사용하는 격리 화면에서 43개 항목을 순회해 대화상자·본문의 가로 넘침이 없는 것을 확인했습니다. 새 프로필을 사용했고 실제 사용자 자료나 폴더를 열지 않았습니다.
- [데스크톱 검증 서비스 응답](desktop-unavailable.json): 사용 중 또는 할당량 도달 응답으로 실행되지 않았습니다. 이를 통과로 기록하지 않으며 추가 요청을 반복하지 않았습니다. macOS 데스크톱 Chrome도 직접 실행하지 않았습니다.

첫 배포와 재검증

- [첫 Actions 실행](https://github.com/seionwon/LibreMemo/actions/runs/41996157570)은 빌드·Pages 게시를 완료했습니다. Linux 단위 검사는 990개 통과, macOS 전용 1개 건너뜀, 실패 0개이며 문법 219개·JSON·빌드도 통과했습니다.
- [첫 공개 Chrome 결과](first-ci/published-browser-results.xml)는 87개 중 86개 통과·1개 실패입니다. 도움말의 검색·키보드·닫기·문서 보존·320/390px·가로 화면·명암 대비·오프라인 재실행은 통과했습니다. [도움말 결과](first-ci/pages-only-help.json)와 [색 대비 결과](first-ci/pages-only-help-colors.json)를 보존합니다.
- 실패한 검사는 웹페이지 가져오기 안내에서 수정 전 문구를 기대했습니다. 실제 화면에는 이번에 의도한 새 문구가 표시됐습니다. 앱 코드는 그대로 두고 해당 기대 문구만 맞춘 `bae7d12b0b506fb2a2362f26087e8c73bc952f00`의 [두 번째 Actions 실행](https://github.com/seionwon/LibreMemo/actions/runs/41998207673)에서 재검증했습니다.
- [첫 실행·아티팩트 기록](first-ci/ci.json)과 [15개 공개 파일 비교](first-ci/published-files.json)는 첫 배포의 근거입니다. 아티팩트 ZIP의 SHA-256을 GitHub 메타데이터와 대조한 뒤 필요한 파일만 안전하게 읽었습니다. 서비스 워커는 GitHub에서 빌드한 실제 배포 파일과 비교했습니다.

첫 실행의 데스크톱·320px 밝은/어두운 도움말, 검색, 오프라인, 실행·About 화면을 직접 확인했습니다. 이 검사는 Linux Chrome의 모바일 화면 모사이며 실제 Android 기기 검사가 아닙니다. 전체 로컬 `npm run test:browser`를 실행한 것으로 표현하지 않습니다. 최종 결과와 공개 파일 비교는 아래와 같습니다.

최종 확인 (2026-11-05 18:12:36 +09:00)

- [최종 Actions 실행](https://github.com/seionwon/LibreMemo/actions/runs/41998207673)의 빌드·게시·검증이 모두 성공했습니다. [실행·아티팩트 기록](ci.json), [Chrome JUnit](published-browser-results.xml): **87개 통과·실패 0·건너뜀 0**. 앱 내용은 최초 소스 커밋과 같고 후속 커밋은 기대 문구와 기록만 보완했습니다.
- [공개 파일 비교](published-files.json): **15개 모두 HTTP 200·배포 아티팩트와 바이트 일치**. [Pages ZIP 검증](pages-artifact.json)의 SHA-256도 확인했습니다. 서비스 워커는 로컬 생성 결과가 아닌 실제 CI 배포본과 일치합니다.
- [도움말 검사](pages-only-help.json)와 [명암 대비](pages-only-help-colors.json)는 43편·4분류의 탐색/검색, 1280/390/320/844px 화면, 밝고 어두운 테마, 본문 대비 4.5:1 이상, 닫기·설정 복귀·문서/주석/북마크 보존 결과를 기록합니다. 43편 전부의 가로 넘침 순회는 앞서 명시한 320px 격리 검사의 범위입니다.
- 직접 확인한 공개 화면: [데스크톱 도움말](pages-only-help-desktop.png), [320px 밝은 화면](pages-only-help-light-320.png), [320px 어두운 화면](pages-only-help-dark-320.png), [모바일 검색](pages-only-help-phone-search.png), [오프라인 재실행](pages-only-help-offline.png), [가져오기 안내](library-compact-guide-320.png), [실행과 앱 전달](pages-only-execution-1280.png), [About](pages-only-about-320.png).

최종 게시 주소: [LibreMemo 1.9.64](https://seionwon.github.io/LibreMemo/). 사용자 문서·설정이나 브라우저 개인 프로필은 이 검증에 사용하지 않았습니다.
