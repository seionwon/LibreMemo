# 유튜브 영상 크기 −/+ 버튼 제거 검증

최종 확인: 2026-11-05 10:24:56 +09:00. [LibreMemo](https://seionwon.github.io/LibreMemo/) **1.9.63**, 게시 소스 `c7e2d579ba11c8968407cc3e31f44d6eed11f2b0`. [Actions 41946560083](https://github.com/seionwon/LibreMemo/actions/runs/41946560083)의 build·deploy·verify 모두 성공했다.

영상 막대에서 조절 띠와 기능이 같은 −/+ 버튼, 클릭 처리와 전용 스타일을 제거했다. 영상 막대 바로 아래 손잡이를 위아래로 끌어 크기를 바꾸며, 두 번 누르면 기본 크기로 돌아간다. Tab으로 띠에 이동한 뒤 ↑/↓로도 조절한다. 도움말을 이 사용법에 맞췄다.

- 로컬 `npm run check`: JavaScript 238개 및 JSON 통과. `npm test`: 991개 통과. `npm run build`, diff 검사 통과.
- CI: 단위 991개 중 990개 통과·macOS 전용 실행 안전 검사 1개 생략, JavaScript 219개 및 JSON·빌드 통과.
- 공개 URL의 Chrome 검사 87개 통과, 실패·생략 0개. 수정한 compact library 검사의 조절 띠 표시 검사도 포함한다.
- 공개 파일 8개가 HTTP 200이며 해당 Linux Pages 산출물과 바이트 단위로 일치했다. 영상 코드·컴파일 스타일에서 없앤 버튼과 전용 스타일이 남지 않은 것도 확인했다. 서비스 워커는 실제 CI 산출물을 기준으로 비교했고, 나머지 7개 파일은 로컬 빌드와도 일치했다.

[최종 요약](validation.json) · [Actions·산출물 해시](ci.json) · [공개 Chrome 결과](published-browser-results.xml) · [공개 파일 대조](published-files.json).

## 영상 칸 화면 확인

CodeMemo의 별도 Chrome 서비스에서 실제 제품의 `YouTubePane`와 컴파일 CSS를 사용하는 검증 화면을 1280×800·320×844로 열었다. 버튼이 없고 조절 띠가 14px이며, 접기·펼치기 후 띠의 키보드 처리로 최대 크기까지 늘려도 영상이 위아래로 잘리지 않고 16:9 비율·자막 공간이 남음을 좌표와 캡처로 확인했다. 두 실행 모두 HTTP 200·브라우저 오류 없음이었다.

[데스크톱 캡처](desktop.png) · [데스크톱 결과](desktop.json) · [휴대폰 폭 캡처](mobile.png) · [휴대폰 폭 결과](mobile.json).

네트워크 플레이어만 대역으로 바꾸었으므로 실제 YouTube 스트리밍이나 실물 휴대폰의 터치를 확인한 것은 아니다. 드래그·크기 기억·기본 크기 복원·최소/최대 제한은 기존 단위 검사로 확인했다. 임시 검증 서버는 종료했고 macOS 샌드박스에서 Chrome을 직접 실행하지 않았다.

## 공개 앱 화면

게시 후 Chrome의 [데스크톱 서재 안내](library-compact-guide-1280.png)와 [320px 서재 안내](library-compact-guide-320.png)를 확인했다. 이 캡처는 실제 공개 앱의 확인 자료이며 영상 재생 화면의 캡처와 구분한다. 영상 칸 검증에 사용한 제품 코드와 스타일은 공개 파일 대조에서 일치했다.
