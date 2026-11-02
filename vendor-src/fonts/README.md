# 한글 문서 대체 글꼴

원본 글꼴이 기기에 없는 HWP·HWPX·HML을 표시할 때 쓰는 내장 글꼴입니다.

- `LibreMemoSerif.woff2`: Noto Serif KR 가변 글꼴(wght)의 부분집합
- `LibreMemoSans.woff2`: Noto Sans KR 가변 글꼴(wght)의 부분집합
- 출처: https://github.com/google/fonts (`ofl/notoserifkr`, `ofl/notosanskr`), 2026-11-03 내려받음
- 라이선스: SIL Open Font License 1.1, 원문은 `public/vendor/fonts/OFL.txt`
- 범위: 라틴, 문장 부호·기호, 호환 자모, 완성형 한글 11,172자, KS X 1001 한자, 전각 문자

`subset-hangul-fonts.py`는 내려받은 TTF(`notoserifkr.ttf`, `notosanskr.ttf`)가 있는 폴더에서 fonttools와 brotli로 실행합니다.
