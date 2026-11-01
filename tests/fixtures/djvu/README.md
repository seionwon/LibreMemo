# LibreMemo DjVu 검증 자료

사용자 문서나 제삼자의 책을 포함하지 않는 자체 생성 자료입니다. 프로젝트와 동일한 MIT 라이선스입니다.

- `reading.djvu`, `second.djv`: `tests/djvu-fixtures.mjs`로 만든 BGjp 스캔과 가상의 UTF-8 TXTa 문자 위치. 픽셀은 이 프로젝트의 자체 생성 `tests/fixtures/images/reading.jpg`입니다.
- `bundled.djvu`: djvu-rs 0.43.0의 `djvm::merge`로 위 두 쪽을 묶은 DIRM/BZZ 문서.
- `photo.djvu`, `bilevel.djvu`: `generate.rs`로 만든 IW44 색상·JB2 흑백 문서. 둘 다 320×200이며 문자가 없는 스캔의 동작을 검사합니다.
- Rust 생성기는 검증 자료를 만들 때만 사용했습니다. 앱·npm 빌드에는 Rust나 인코더·변환 서버가 필요하지 않습니다.
